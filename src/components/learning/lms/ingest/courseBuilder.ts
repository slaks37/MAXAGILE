// ---------------------------------------------------------------------------
// MaxAgile LMS — chunks -> Course
//
// Converts the output of the splitting cascade (outline.ts) into a ready-to-save
// Course: one Section per chunk, each with a reading page, an auto-generated
// quiz and a review checklist.
//
// Everything here is PURE (no fetch, no DOM, no heavy imports) so it can be
// unit-tested and run on a weak machine. Randomness is limited to option
// shuffling, which never affects correctness.
// ---------------------------------------------------------------------------

import type {
  Activity,
  Attachment,
  ChecklistItem,
  Course,
  QuizOption,
  QuizQuestion,
  Section,
} from '../types';
import { genId } from '../store';
import { GRADIENTS } from '../theme';
import type { DocChunk, SplitResult, SplitTier } from './outline';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface BuildOptions {
  title?: string;
  category?: string;
  /** tailwind gradient string */
  color?: string;
  /** default true */
  includeQuiz?: boolean;
  /** default true */
  includeChecklist?: boolean;
  /** attached to the FIRST section's page activity only */
  attachments?: Attachment[];
  /** default "id" */
  language?: 'id' | 'en';
}

export interface BuiltCourse {
  course: Course;
  stats: {
    sections: number;
    activities: number;
    quizQuestions: number;
    words: number;
    tier: SplitTier;
  };
}

type Lang = 'id' | 'en';

const MAX_QUESTIONS_PER_SECTION = 3;
const QUESTION_POINTS = 10;
const PASS_PERCENT = 60;
const MAX_OPTION_CHARS = 120;
const MIN_DISTRACTORS = 2;
const MAX_DISTRACTORS = 3;

// ---------------------------------------------------------------------------
// Stopwords
// ---------------------------------------------------------------------------

const STOPWORDS_ID = [
  'dan', 'atau', 'yang', 'untuk', 'dengan', 'pada', 'dari', 'ini', 'itu', 'adalah',
  'akan', 'dapat', 'tidak', 'dalam', 'oleh', 'sebagai', 'juga', 'agar', 'karena',
  'telah', 'lebih', 'serta', 'secara', 'sehingga', 'tersebut', 'para', 'bagi',
  'kepada', 'antara', 'setiap', 'banyak', 'ketika', 'maka', 'namun', 'tetapi',
  'bahwa', 'jika', 'atas', 'bawah', 'kami', 'kita', 'mereka', 'anda', 'saya',
  'ada', 'tentang', 'seperti', 'sampai', 'sedang', 'belum', 'sudah', 'masih',
  'bisa', 'harus', 'hanya', 'sangat', 'saat', 'hal', 'cara', 'yaitu', 'ialah',
  'merupakan', 'melakukan', 'membuat', 'menjadi', 'memiliki', 'digunakan',
  'sebuah', 'suatu', 'antara', 'selain', 'sebelum', 'setelah', 'melalui',
  'terhadap', 'tanpa', 'guna', 'ketika', 'demikian', 'berikut', 'contoh',
];

const STOPWORDS_EN = [
  'the', 'and', 'or', 'for', 'with', 'from', 'this', 'that', 'these', 'those',
  'are', 'was', 'were', 'will', 'can', 'not', 'into', 'been', 'have', 'has',
  'had', 'its', 'their', 'they', 'them', 'you', 'your', 'our', 'but', 'also',
  'such', 'than', 'then', 'when', 'which', 'who', 'what', 'how', 'more', 'most',
  'some', 'any', 'all', 'each', 'other', 'about', 'over', 'under', 'between',
  'because', 'while', 'after', 'before', 'during', 'both', 'only', 'very',
  'there', 'here', 'one', 'two', 'use', 'used', 'using', 'does', 'doing',
  'shall', 'should', 'would', 'could', 'being', 'where', 'whose', 'through',
  'example', 'following', 'therefore', 'however',
];

const STOP_ALL = new Set<string>([...STOPWORDS_ID, ...STOPWORDS_EN]);

function isStopword(token: string): boolean {
  return STOP_ALL.has(token.toLowerCase());
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

function words(t: string): number {
  const s = String(t || '').trim();
  return s ? s.split(/\s+/).filter(Boolean).length : 0;
}

function normalizeKey(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function tidy(s: string): string {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function stripLead(s: string): string {
  return tidy(s).replace(/^[\s•·*\-–—>]+/, '').replace(/^\(?\d+[.)]\s*/, '').trim();
}

function truncateAtWord(s: string, max: number): string {
  const t = tidy(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(' ');
  const base = space > max * 0.5 ? cut.slice(0, space) : cut;
  return base.replace(/[\s,;:.\-–—]+$/, '') + '…';
}

/** True for lines that start their own block (bullets, numbered items). */
function isBlockStart(line: string): boolean {
  return /^([•·*\-–—>]|\(?\d+[.)])\s+/.test(line);
}

/**
 * Reflow hard-wrapped lines back into paragraphs.
 *
 * PDF text extraction emits one line per *visual* line, which chops sentences
 * mid-clause. Without this, quiz and checklist text comes out as fragments like
 * "is far from superficial, and ...". Lines are joined unless the previous line
 * clearly ends a sentence or the next line starts a new block.
 */
function reflowLines(text: string): string[] {
  const paragraphs: string[] = [];
  for (const block of String(text || '').split(/\n\s*\n+/)) {
    let buf = '';
    for (const raw of block.split(/\n/)) {
      const line = tidy(raw);
      if (!line) continue;
      if (!buf) {
        buf = line;
        continue;
      }
      if (isBlockStart(line) || /[.!?:;]$/.test(buf)) {
        paragraphs.push(buf);
        buf = line;
      } else if (/[A-Za-z]-$/.test(buf)) {
        // word split across lines: "docu-" + "ment" -> "document"
        buf = buf.slice(0, -1) + line;
      } else {
        buf += ' ' + line;
      }
    }
    if (buf) paragraphs.push(buf);
  }
  return paragraphs;
}

/** Split into sentences, keeping list items (one per line) intact. */
function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const paragraph of reflowLines(text)) {
    for (const raw of paragraph.split(/(?<=[.!?])\s+/)) {
      const s = raw.trim();
      if (s) out.push(s);
    }
  }
  return out;
}

/**
 * A sentence is only worth quoting back to the learner when it reads as a whole
 * thought: it must open like a sentence (not mid-clause) and actually end.
 */
function isWellFormedSentence(s: string): boolean {
  const t = tidy(s);
  if (t.length < 40) return false;
  if (!/^["'“(]?[A-Z0-9]/.test(t)) return false; // fragments start lowercase
  if (!/[.!?]$/.test(t)) return false;
  const letters = t.replace(/[^A-Za-z]/g, '').length;
  return letters >= t.length * 0.5; // skip formula/reference soup
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// ---------------------------------------------------------------------------
// Harvesting: definitions
// ---------------------------------------------------------------------------

interface DefCandidate {
  term: string;
  definition: string;
}

const DEF_RE_ID = /^(.{3,60}?)\s+(?:adalah|merupakan|yaitu|ialah)\s+(.{15,180})/i;
const DEF_RE_EN = /^(.{3,60}?)\s+(?:is|are|refers to)\s+(.{15,180})/i;

/** A term is usable when it is short and not made only of stopwords. */
function usableTerm(raw: string): string | null {
  const term = stripLead(raw).replace(/^["'“”(]+|["'“”),.:;]+$/g, '').trim();
  if (!term || term.length < 3 || term.length > 60) return null;
  if (words(term) > 8) return null;
  if (/^\d+$/.test(term)) return null;
  const tokens = term.split(/\s+/).filter(Boolean);
  const meaningful = tokens.filter((t) => t.length >= 3 && !isStopword(t));
  if (meaningful.length === 0) return null;
  return term;
}

function usableDefinition(raw: string): string | null {
  const d = stripLead(raw).replace(/[\s.;:,]+$/, '').trim();
  if (!d || d.length < 15) return null;
  if (words(d) < 3) return null;
  return truncateAtWord(d, MAX_OPTION_CHARS);
}

function harvestDefinitions(text: string, lang: Lang): DefCandidate[] {
  const re = lang === 'en' ? DEF_RE_EN : DEF_RE_ID;
  const seen = new Set<string>();
  const out: DefCandidate[] = [];
  for (const sentence of splitSentences(text)) {
    if (sentence.length < 25) continue;
    const m = re.exec(stripLead(sentence));
    if (!m) continue;
    const term = usableTerm(m[1]);
    const definition = usableDefinition(m[2]);
    if (!term || !definition) continue;
    const key = normalizeKey(term);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ term, definition });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Harvesting: salient terms (for cloze questions)
// ---------------------------------------------------------------------------

interface TermCandidate {
  term: string;
  sentence: string;
}

const CAPPHRASE_RE = /\p{Lu}[\p{L}\d]+(?:\s+\p{Lu}[\p{L}\d]+)+/gu;
const TOKEN_RE = /\p{L}[\p{L}\p{N}-]{3,}/gu;

/** Pick the most information-bearing phrase/word from a sentence. */
function salientTerm(sentence: string): string | null {
  const s = tidy(sentence);
  if (s.length < 40) return null;

  // 1. a capitalised multi-word phrase that is NOT just the sentence opener
  CAPPHRASE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CAPPHRASE_RE.exec(s)) !== null) {
    if (m.index === 0) continue;
    const phrase = usableTerm(m[0]);
    if (phrase && words(phrase) <= 4) return phrase;
  }

  // 2. otherwise the longest non-stopword token
  TOKEN_RE.lastIndex = 0;
  let best = '';
  let t: RegExpExecArray | null;
  while ((t = TOKEN_RE.exec(s)) !== null) {
    const tok = t[0];
    if (tok.length < 5) continue;
    if (isStopword(tok)) continue;
    if (tok.length > best.length) best = tok;
  }
  return best ? best : null;
}

function harvestTerms(text: string): TermCandidate[] {
  const seen = new Set<string>();
  const out: TermCandidate[] = [];
  for (const sentence of splitSentences(text)) {
    // Only quote back whole sentences — a blanked-out fragment is unanswerable.
    if (!isWellFormedSentence(sentence)) continue;
    const term = salientTerm(sentence);
    if (!term) continue;
    const key = normalizeKey(term);
    if (!key || key.length < 4 || seen.has(key)) continue;
    seen.add(key);
    out.push({ term, sentence: tidy(sentence) });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Quiz generation
// ---------------------------------------------------------------------------

function makeQuestion(text: string, correct: string, distractors: string[]): QuizQuestion {
  const correctOption: QuizOption = { id: genId('opt'), text: correct };
  const options: QuizOption[] = [correctOption];
  for (const d of distractors) options.push({ id: genId('opt'), text: d });
  return {
    id: genId('qq'),
    text,
    options: shuffle(options),
    correctOptionId: correctOption.id,
    points: QUESTION_POINTS,
  };
}

function pickDistractors(pool: string[], correct: string): string[] {
  const correctKey = normalizeKey(correct);
  const used = new Set<string>([correctKey]);
  const picked: string[] = [];
  for (const candidate of shuffle(pool)) {
    const key = normalizeKey(candidate);
    if (!key || used.has(key)) continue;
    // reject near-duplicates of the correct answer
    if (key.includes(correctKey) || correctKey.includes(key)) continue;
    used.add(key);
    picked.push(candidate);
    if (picked.length >= MAX_DISTRACTORS) break;
  }
  return picked;
}

function buildSectionQuestions(
  index: number,
  defsPerChunk: DefCandidate[][],
  termsPerChunk: TermCandidate[][],
  lang: Lang,
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const usedTermKeys = new Set<string>();

  // ---- (a) definition questions -------------------------------------------
  // Distractors are real definition clauses harvested from the rest of the
  // document — never invented filler.
  const otherDefinitions: string[] = [];
  for (let i = 0; i < defsPerChunk.length; i++) {
    if (i === index) continue;
    for (const d of defsPerChunk[i]) otherDefinitions.push(d.definition);
  }
  const localDefinitions = defsPerChunk[index] || [];

  for (const cand of localDefinitions) {
    if (questions.length >= MAX_QUESTIONS_PER_SECTION) break;
    const pool = otherDefinitions.concat(
      localDefinitions.filter((d) => d !== cand).map((d) => d.definition),
    );
    const distractors = pickDistractors(pool, cand.definition);
    if (distractors.length < MIN_DISTRACTORS) continue;
    const prompt =
      lang === 'en'
        ? `What is meant by "${cand.term}"?`
        : `Apa yang dimaksud dengan "${cand.term}"?`;
    questions.push(makeQuestion(prompt, cand.definition, distractors));
    usedTermKeys.add(normalizeKey(cand.term));
  }

  // ---- (b) cloze questions -------------------------------------------------
  if (questions.length < MAX_QUESTIONS_PER_SECTION) {
    const otherTerms: string[] = [];
    for (let i = 0; i < termsPerChunk.length; i++) {
      if (i === index) continue;
      for (const t of termsPerChunk[i]) otherTerms.push(t.term);
    }
    // terms from this chunk that are not the answer can also serve as decoys
    const localTerms = (termsPerChunk[index] || []).map((t) => t.term);

    for (const cand of termsPerChunk[index] || []) {
      if (questions.length >= MAX_QUESTIONS_PER_SECTION) break;
      const key = normalizeKey(cand.term);
      if (usedTermKeys.has(key)) continue;

      const blanked = blankOut(cand.sentence, cand.term);
      if (!blanked) continue;

      // a decoy that already appears in the sentence would give the answer away
      const haystack = cand.sentence.toLowerCase();
      const pool = otherTerms
        .concat(localTerms.filter((t) => normalizeKey(t) !== key))
        .filter((t) => !haystack.includes(t.toLowerCase()));
      const distractors = pickDistractors(pool, cand.term);
      if (distractors.length < MIN_DISTRACTORS) continue;

      const prompt =
        lang === 'en'
          ? `Fill in the blank: "${clozeWindow(blanked, 200)}"`
          : `Lengkapi kalimat berikut: "${clozeWindow(blanked, 200)}"`;
      questions.push(makeQuestion(prompt, cand.term, distractors));
      usedTermKeys.add(key);
    }
  }

  return questions;
}

/** Replace the first occurrence of `term` with a blank. Null when not found. */
function blankOut(sentence: string, term: string): string | null {
  const idx = sentence.indexOf(term);
  if (idx < 0) return null;
  const out = sentence.slice(0, idx) + '______' + sentence.slice(idx + term.length);
  return tidy(out);
}

/** Shorten a cloze sentence while keeping the blank visible. */
function clozeWindow(blanked: string, max: number): string {
  const t = tidy(blanked);
  if (t.length <= max) return t;
  const at = t.indexOf('______');
  if (at < 0) return truncateAtWord(t, max);
  const half = Math.max(20, Math.floor((max - 6) / 2));
  let start = Math.max(0, at - half);
  let end = Math.min(t.length, at + 6 + half);
  if (start > 0) {
    const sp = t.indexOf(' ', start);
    if (sp >= 0 && sp < at) start = sp + 1;
  }
  if (end < t.length) {
    const sp = t.lastIndexOf(' ', end);
    if (sp > at + 6) end = sp;
  }
  const body = t.slice(start, end).trim();
  return `${start > 0 ? '… ' : ''}${body}${end < t.length ? ' …' : ''}`;
}

// ---------------------------------------------------------------------------
// Checklist generation
// ---------------------------------------------------------------------------

const DEF_CONNECTOR_RE = /\b(adalah|merupakan|yaitu|ialah|bertujuan|berfungsi|is|are|refers to)\b/i;

function scoreSentence(s: string, position: number): number {
  const len = s.length;
  let score = 0;
  if (len >= 40 && len <= 200) score += 3;
  else if (len > 200 && len <= 300) score += 1;
  else score -= 2;
  if (DEF_CONNECTOR_RE.test(s)) score += 2;
  // earlier sentences carry the section's thesis more often than later ones
  score += Math.max(0, 3 - position * 0.15);
  return score;
}

function buildChecklistItems(chunk: DocChunk, lang: Lang): ChecklistItem[] {
  const all = splitSentences(chunk.text).map(stripLead);
  // Prefer whole sentences; only fall back to loose ones if there are too few,
  // so review items never read as mid-clause fragments.
  const wellFormed = all.filter((s) => isWellFormedSentence(s) && s.length <= 320);
  const sentences =
    wellFormed.length >= 2
      ? wellFormed
      : all.filter((s) => s.length >= 30 && s.length <= 320);

  const scored = sentences.map((s, i) => ({ s, i, score: scoreSentence(s, i) }));
  scored.sort((a, b) => b.score - a.score || a.i - b.i);
  const top = scored.slice(0, 4).sort((a, b) => a.i - b.i);

  const prefix = lang === 'en' ? 'I understand ' : 'Saya memahami ';
  const seen = new Set<string>();
  const items: ChecklistItem[] = [];

  for (const entry of top) {
    let body = entry.s.replace(/[.;:]+$/, '').trim();
    if (!body) continue;
    // lower-case the first letter unless it looks like an acronym / proper noun
    if (!/^[A-Z]{2,}/.test(body) && /^[A-Z]/.test(body) && !/^[A-Z][a-z]*\s+[A-Z]/.test(body)) {
      body = body.charAt(0).toLowerCase() + body.slice(1);
    }
    const text = truncateAtWord(prefix + body, 110);
    const key = normalizeKey(text);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    items.push({ id: genId('cli'), text });
  }

  // never emit a checklist that is only a reflection prompt
  if (items.length < 2) return [];

  items.push({
    id: genId('cli'),
    text:
      lang === 'en'
        ? 'I can explain this section again in my own words.'
        : 'Saya dapat menjelaskan kembali bagian ini dengan kata-kata saya sendiri.',
  });

  return items.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Section assembly
// ---------------------------------------------------------------------------

function sectionSummary(chunk: DocChunk, lang: Lang): string {
  const minutes = chunk.readingMinutes;
  const paged = chunk.startPage > 0 && chunk.endPage > 0;
  if (lang === 'en') {
    const read = `${minutes} min read`;
    if (!paged) return read;
    return chunk.startPage === chunk.endPage
      ? `${read} - page ${chunk.startPage}`
      : `${read} - pages ${chunk.startPage}-${chunk.endPage}`;
  }
  const read = `${minutes} menit baca`;
  if (!paged) return read;
  return chunk.startPage === chunk.endPage
    ? `${read} - halaman ${chunk.startPage}`
    : `${read} - halaman ${chunk.startPage}-${chunk.endPage}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a full Course from a SplitResult. Pure: the only side effect is the
 * pseudo-random option ordering.
 */
export function buildCourseFromSplit(split: SplitResult, opts?: BuildOptions): BuiltCourse {
  const o = opts || {};
  const lang: Lang = o.language === 'en' ? 'en' : 'id';
  const includeQuiz = o.includeQuiz !== false;
  const includeChecklist = o.includeChecklist !== false;

  const chunks: DocChunk[] = split && Array.isArray(split.chunks) ? split.chunks.filter(Boolean) : [];
  const tier: SplitTier = (split && split.tier) || 'readingTime';

  // Harvest document-wide BEFORE building, so distractors can come from other
  // chunks of the same document.
  const defsPerChunk = chunks.map((c) => harvestDefinitions(c.text, lang));
  const termsPerChunk = chunks.map((c) => harvestTerms(c.text));

  const sections: Section[] = [];
  let activityCount = 0;
  let quizQuestionCount = 0;
  let totalWords = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (!chunk || !chunk.text || !chunk.text.trim()) continue;
    totalWords += chunk.wordCount || 0;

    const chunkTitle = tidy(chunk.title) || (lang === 'en' ? `Section ${i + 1}` : `Bagian ${i + 1}`);
    const activities: Activity[] = [];

    // 1. reading page
    activities.push({
      id: genId('act'),
      type: 'page',
      title: (lang === 'en' ? 'Read: ' : 'Materi: ') + chunkTitle,
      page: {
        content: chunk.text,
        attachments: i === 0 && Array.isArray(o.attachments) ? o.attachments.slice() : [],
      },
    });

    // 2. quiz
    if (includeQuiz) {
      const questions = buildSectionQuestions(i, defsPerChunk, termsPerChunk, lang);
      if (questions.length > 0) {
        activities.push({
          id: genId('act'),
          type: 'quiz',
          title: (lang === 'en' ? 'Quiz: ' : 'Kuis: ') + chunkTitle,
          quiz: { questions, passPercent: PASS_PERCENT },
        });
        quizQuestionCount += questions.length;
      }
    }

    // 3. checklist
    if (includeChecklist) {
      const items = buildChecklistItems(chunk, lang);
      if (items.length > 0) {
        activities.push({
          id: genId('act'),
          type: 'checklist',
          title: (lang === 'en' ? 'Summary: ' : 'Ringkasan: ') + chunkTitle,
          checklist: { items },
        });
      }
    }

    activityCount += activities.length;
    sections.push({
      id: genId('sec'),
      title: chunkTitle,
      summary: sectionSummary(chunk, lang),
      activities,
    });
  }

  const source =
    tidy(o.title || '') ||
    (sections.length > 0 ? sections[0].title : '') ||
    (lang === 'en' ? 'Imported document' : 'Dokumen impor');
  const courseTitle = tidy(o.title || '') || source;
  const totalMinutes = Math.max(1, Math.ceil(totalWords / 180));

  const summary =
    lang === 'en'
      ? `Auto-generated from "${source}" - ${sections.length} section(s), ${totalWords} words (~${totalMinutes} min read).`
      : `Dibuat otomatis dari "${source}" - ${sections.length} bagian, ${totalWords} kata (~${totalMinutes} menit baca).`;

  const now = new Date().toISOString();
  const course: Course = {
    id: genId('course'),
    title: courseTitle,
    summary,
    category: tidy(o.category || '') || 'Umum',
    color: tidy(o.color || '') || GRADIENTS[0],
    sections,
    createdAt: now,
    updatedAt: now,
  };

  return {
    course,
    stats: {
      sections: sections.length,
      activities: activityCount,
      quizQuestions: quizQuestionCount,
      words: totalWords,
      tier,
    },
  };
}
