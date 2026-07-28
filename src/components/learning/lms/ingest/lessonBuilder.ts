// ---------------------------------------------------------------------------
// MaxAgile LMS — extracted text -> interactive lesson blocks
//
// This is what turns an imported PDF/DOCX into a Coursiv-style lesson instead of
// a wall of text: the material is cut into short readable beats, and after every
// second beat the learner is asked to *do* something built from the material
// they have just read.
//
// Everything here is PURE (no fetch, no DOM). The only randomness is option
// ordering, which never affects correctness. Every option — correct answer and
// distractor alike — is harvested from the source document; nothing is invented.
// ---------------------------------------------------------------------------

import type {
  Attachment,
  CheckBlock,
  FillBlankBlock,
  FlashcardBlock,
  ImageBlock,
  KeypointBlock,
  LessonBlock,
  QuizOption,
  ReflectBlock,
  TextBlock,
} from '../types';
import { attachmentKind, genId } from '../store';
import { countWords } from './outline';
import {
  blankOut,
  clozeWindow,
  harvestDefinitions,
  harvestTerms,
  isBlockStart,
  normalizeKey,
  pickDistractors,
  shuffle,
  splitSentences,
  stripLead,
  tidy,
  truncateAtWord,
} from './courseBuilder';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

type Lang = 'id' | 'en';

export interface LessonBuildOptions {
  /** wording of every generated string. Default "id". */
  language?: Lang;
  /** images among these become `image` blocks near the start */
  attachments?: Attachment[];
  /** hard cap on the number of emitted blocks, reflection included. Default 16. */
  maxBlocks?: number;
}

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------

const DEFAULT_MAX_BLOCKS = 16;
/** never more than this many reading beats, however long the chunk is */
const MAX_CONTENT_BLOCKS = 10;
const MIN_BEAT_WORDS = 60;
const MAX_BEAT_WORDS = 110;
const MAX_IMAGES = 2;
const MIN_DISTRACTORS = 2;
const MAX_KEYPOINTS = 6;
const KEYPOINT_MAX_CHARS = 140;
const CLOZE_WINDOW_CHARS = 200;
/** the gap marker required by FillBlankBlock */
const BLANK = '___';
/** the marker courseBuilder's blankOut()/clozeWindow() work with */
const RAW_BLANK = '______';

// ---------------------------------------------------------------------------
// Step 1 — segment the raw text into prose paragraphs and lists
// ---------------------------------------------------------------------------

interface ProseSegment {
  kind: 'prose';
  sentences: string[];
}
interface ListSegment {
  kind: 'list';
  points: string[];
}
type Segment = ProseSegment | ListSegment;

function rawParagraphs(text: string): string[] {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function paragraphLines(paragraph: string): string[] {
  return paragraph.split('\n').map(tidy).filter(Boolean);
}

/**
 * A paragraph reads as a list when it is 3+ lines that are either bulleted /
 * numbered, or short and unpunctuated (the shape PDF extraction gives to a
 * bullet list whose glyphs were dropped).
 */
function looksLikeList(lines: string[]): boolean {
  if (lines.length < 3 || lines.length > 12) return false;
  const bulleted = lines.filter(isBlockStart).length;
  if (bulleted >= Math.ceil(lines.length * 0.6)) return true;
  // Guard against mistaking a whole hard-wrapped page for a bullet list: a real
  // list is short overall, not just made of short lines.
  const total = lines.reduce((sum, l) => sum + countWords(l), 0);
  if (total > 140) return false;
  const shortish = lines.filter((l) => l.length <= 90 && !/[.!?]$/.test(l)).length;
  return shortish >= Math.ceil(lines.length * 0.8);
}

function listPoints(lines: string[]): string[] {
  const points: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const point = truncateAtWord(stripLead(line), KEYPOINT_MAX_CHARS);
    if (point.length < 3) continue;
    const key = normalizeKey(point);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    points.push(point);
    if (points.length >= MAX_KEYPOINTS) break;
  }
  return points;
}

function toSegments(text: string): Segment[] {
  const out: Segment[] = [];
  for (const paragraph of rawParagraphs(text)) {
    const lines = paragraphLines(paragraph);
    if (looksLikeList(lines)) {
      const points = listPoints(lines);
      if (points.length >= 3) {
        out.push({ kind: 'list', points });
        continue;
      }
    }
    // splitSentences() reflows hard-wrapped PDF lines before splitting, so a
    // beat never starts mid-clause.
    const sentences = splitSentences(paragraph).map(tidy).filter(Boolean);
    if (sentences.length > 0) out.push({ kind: 'prose', sentences });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Step 2 — pack prose into readable beats, keeping lists as key points
// ---------------------------------------------------------------------------

type Content = { kind: 'text'; body: string } | { kind: 'keypoint'; points: string[] };

function buildContents(segments: Segment[]): Content[] {
  const out: Content[] = [];
  let buf: string[] = [];
  let bufParas: number[] = [];
  let bufWords = 0;
  let paraIndex = 0;

  const flush = () => {
    if (buf.length === 0) return;
    let body = '';
    for (let i = 0; i < buf.length; i++) {
      if (i === 0) body = buf[i];
      else body += (bufParas[i] !== bufParas[i - 1] ? '\n\n' : ' ') + buf[i];
    }
    body = body.trim();
    if (body) out.push({ kind: 'text', body });
    buf = [];
    bufParas = [];
    bufWords = 0;
  };

  for (const segment of segments) {
    if (segment.kind === 'list') {
      flush();
      out.push({ kind: 'keypoint', points: segment.points });
      paraIndex++;
      continue;
    }
    for (const sentence of segment.sentences) {
      const sw = countWords(sentence);
      // split only at a sentence boundary, and only once the beat is full
      if (bufWords > 0 && bufWords + sw > MAX_BEAT_WORDS) flush();
      buf.push(sentence);
      bufParas.push(paraIndex);
      bufWords += sw;
    }
    paraIndex++;
    // a paragraph boundary is the nicest place to break, if the beat is big enough
    if (bufWords >= MIN_BEAT_WORDS) flush();
  }
  flush();
  return out;
}

function contentToBlock(content: Content, lang: Lang): TextBlock | KeypointBlock {
  if (content.kind === 'keypoint') {
    return {
      id: genId('blk'),
      type: 'keypoint',
      title: lang === 'en' ? 'Key points' : 'Poin penting',
      points: content.points,
    };
  }
  return { id: genId('blk'), type: 'text', body: content.body };
}

function contentToText(content: Content): string {
  return content.kind === 'keypoint' ? content.points.join('\n') : content.body;
}

// ---------------------------------------------------------------------------
// Step 3 — interactive blocks, built only from the source document
// ---------------------------------------------------------------------------

interface Ctx {
  lang: Lang;
  /** every definition clause found anywhere in the document */
  defPool: string[];
  /** every salient term found anywhere in the document */
  termPool: string[];
  usedDefKeys: Set<string>;
  usedTermKeys: Set<string>;
}

function makeOptions(correct: string, distractors: string[]): { options: QuizOption[]; correctOptionId: string } {
  const correctOption: QuizOption = { id: genId('opt'), text: correct };
  const options: QuizOption[] = [correctOption];
  for (const d of distractors) options.push({ id: genId('opt'), text: d });
  return { options: shuffle(options), correctOptionId: correctOption.id };
}

interface ClozeCandidate {
  term: string;
  /** already windowed, gap written as BLANK */
  sentence: string;
  distractors: string[];
}

/**
 * Blank out a salient term from a sentence the learner has just read. Returns
 * null unless at least MIN_DISTRACTORS real terms from elsewhere in the same
 * document can stand in as decoys.
 */
function pickCloze(recent: string, ctx: Ctx): ClozeCandidate | null {
  for (const cand of harvestTerms(recent)) {
    const key = normalizeKey(cand.term);
    if (!key || ctx.usedTermKeys.has(key)) continue;

    const blanked = blankOut(cand.sentence, cand.term);
    if (!blanked) continue;

    // a decoy that already appears in the sentence would give the answer away
    const haystack = cand.sentence.toLowerCase();
    const pool = ctx.termPool.filter(
      (t) => normalizeKey(t) !== key && !haystack.includes(t.toLowerCase()),
    );
    const distractors = pickDistractors(pool, cand.term);
    if (distractors.length < MIN_DISTRACTORS) continue;

    ctx.usedTermKeys.add(key);
    return {
      term: cand.term,
      sentence: clozeWindow(blanked, CLOZE_WINDOW_CHARS).split(RAW_BLANK).join(BLANK),
      distractors,
    };
  }
  return null;
}

function buildCheck(recent: string, ctx: Ctx): CheckBlock | null {
  // (a) "what does X mean?" — answer and decoys are real definition clauses
  for (const def of harvestDefinitions(recent, ctx.lang)) {
    const key = normalizeKey(def.term);
    if (!key || ctx.usedDefKeys.has(key)) continue;
    const distractors = pickDistractors(ctx.defPool, def.definition);
    if (distractors.length < MIN_DISTRACTORS) continue;
    ctx.usedDefKeys.add(key);
    const { options, correctOptionId } = makeOptions(def.definition, distractors);
    return {
      id: genId('blk'),
      type: 'check',
      question:
        ctx.lang === 'en'
          ? `What is meant by "${def.term}"?`
          : `Apa yang dimaksud dengan "${def.term}"?`,
      options,
      correctOptionId,
      explanation:
        ctx.lang === 'en'
          ? `In this material, ${def.term} is ${def.definition}.`
          : `Dalam materi ini, ${def.term} adalah ${def.definition}.`,
    };
  }

  // (b) otherwise a cloze question over a sentence from the same beat
  const cloze = pickCloze(recent, ctx);
  if (!cloze) return null;
  const { options, correctOptionId } = makeOptions(cloze.term, cloze.distractors);
  return {
    id: genId('blk'),
    type: 'check',
    question:
      ctx.lang === 'en'
        ? `Complete the sentence: "${cloze.sentence}"`
        : `Lengkapi kalimat berikut: "${cloze.sentence}"`,
    options,
    correctOptionId,
    explanation:
      ctx.lang === 'en'
        ? `The material uses the term "${cloze.term}" here.`
        : `Materi menggunakan istilah "${cloze.term}" pada kalimat tersebut.`,
  };
}

function buildFillBlank(recent: string, ctx: Ctx): FillBlankBlock | null {
  const cloze = pickCloze(recent, ctx);
  if (!cloze) return null;
  return {
    id: genId('blk'),
    type: 'fillblank',
    sentence: cloze.sentence,
    answer: cloze.term,
    options: shuffle([cloze.term, ...cloze.distractors]),
  };
}

function buildFlashcard(recent: string, ctx: Ctx): FlashcardBlock | null {
  for (const def of harvestDefinitions(recent, ctx.lang)) {
    const key = normalizeKey(def.term);
    if (!key || ctx.usedDefKeys.has(key)) continue;
    ctx.usedDefKeys.add(key);
    return { id: genId('blk'), type: 'flashcard', front: def.term, back: def.definition };
  }
  return null;
}

const KIND_CYCLE = ['check', 'fillblank', 'flashcard'] as const;

/**
 * Try the requested interactive kind, then the remaining ones, so a beat that
 * cannot support (say) a cloze still gets a flashcard. Returns null rather than
 * emitting a block with invented options.
 */
function nextInteractive(
  cycle: number,
  recent: string,
  ctx: Ctx,
): { block: LessonBlock | null; nextCycle: number } {
  for (let step = 0; step < KIND_CYCLE.length; step++) {
    const idx = (cycle + step) % KIND_CYCLE.length;
    const kind = KIND_CYCLE[idx];
    const block =
      kind === 'check'
        ? buildCheck(recent, ctx)
        : kind === 'fillblank'
          ? buildFillBlank(recent, ctx)
          : buildFlashcard(recent, ctx);
    if (block) return { block, nextCycle: (idx + 1) % KIND_CYCLE.length };
  }
  return { block: null, nextCycle: (cycle + 1) % KIND_CYCLE.length };
}

// ---------------------------------------------------------------------------
// Images & reflection
// ---------------------------------------------------------------------------

function imageBlocks(attachments: Attachment[] | undefined): ImageBlock[] {
  const out: ImageBlock[] = [];
  for (const att of Array.isArray(attachments) ? attachments : []) {
    if (!att || !att.url) continue;
    if (attachmentKind(att.mimeType, att.name) !== 'image') continue;
    const block: ImageBlock = { id: genId('blk'), type: 'image', attachment: att };
    const caption = tidy(att.name || '');
    if (caption) block.caption = caption;
    out.push(block);
    if (out.length >= MAX_IMAGES) break;
  }
  return out;
}

function reflectBlock(lang: Lang): ReflectBlock {
  return {
    id: genId('blk'),
    type: 'reflect',
    prompt:
      lang === 'en'
        ? 'Put this section in your own words — what is the main idea?'
        : 'Tuliskan inti bagian ini dengan kata-katamu sendiri. Apa poin utamanya?',
    placeholder:
      lang === 'en' ? 'Write 2-3 sentences…' : 'Tulis 2-3 kalimat…',
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Turn extracted document text into an ordered list of lesson blocks.
 *
 * Shape: reading beats of ~60-110 words, an interactive block after every
 * second beat, images near the start, and a reflection prompt at the end.
 * Returns [] when there is nothing teachable — callers should fall back to a
 * plain page in that case.
 */
export function buildLessonBlocks(text: string, opts?: LessonBuildOptions): LessonBlock[] {
  const o = opts || {};
  const lang: Lang = o.language === 'en' ? 'en' : 'id';
  const maxBlocks =
    typeof o.maxBlocks === 'number' && isFinite(o.maxBlocks) && o.maxBlocks >= 1
      ? Math.floor(o.maxBlocks)
      : DEFAULT_MAX_BLOCKS;

  const source = String(text || '');
  const images = imageBlocks(o.attachments);
  const allContents = buildContents(toSegments(source));
  if (allContents.length === 0 && images.length === 0) return [];

  // Budget the beats so the interactives + images + reflection all fit inside
  // maxBlocks — trimming from the end would silently drop material.
  const budget = Math.max(1, maxBlocks - 1 - images.length);
  const contentCap = Math.max(1, Math.min(MAX_CONTENT_BLOCKS, Math.floor((budget * 2) / 3)));
  const contents = allContents.slice(0, contentCap);

  const ctx: Ctx = {
    lang,
    defPool: harvestDefinitions(source, lang).map((d) => d.definition),
    termPool: harvestTerms(source).map((t) => t.term),
    usedDefKeys: new Set<string>(),
    usedTermKeys: new Set<string>(),
  };

  const blocks: LessonBlock[] = [];
  const recent: string[] = [];
  let cycle = 0;

  for (let i = 0; i < contents.length; i++) {
    blocks.push(contentToBlock(contents[i], lang));
    recent.push(contentToText(contents[i]));

    // visuals belong up front, right after the opening beat
    if (i === 0 && images.length > 0) blocks.push(...images);

    if ((i + 1) % 2 === 0) {
      const made = nextInteractive(cycle, recent.slice(-2).join('\n\n'), ctx);
      cycle = made.nextCycle;
      if (made.block) blocks.push(made.block);
    }
  }
  if (contents.length === 0) blocks.push(...images);

  const limit = maxBlocks - 1;
  if (limit <= 0) return blocks.slice(0, 1);
  const out = blocks.slice(0, limit);
  out.push(reflectBlock(lang));
  return out;
}
