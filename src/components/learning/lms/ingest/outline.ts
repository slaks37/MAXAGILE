// ---------------------------------------------------------------------------
// MaxAgile LMS — document splitting cascade
//
// Turns an extracted document (PDF text layer / OCR result, or plain text from
// txt / md / docx / pptx / manual paste) into an ordered list of teachable
// chunks. Everything here is PURE: no fetch, no DOM, no timers, no imports of
// heavy libraries. It is safe to unit-test and safe to run on a weak CPU.
//
// The cascade tries three strategies in order and falls through whenever a tier
// cannot produce at least 2 usable chunks:
//   1. "toc"          — the PDF's own bookmark/outline tree
//   2. "headings"     — visually larger runs of text (font size heuristics),
//                       or markdown / "Bab N" style headings for plain text
//   3. "readingTime"  — paragraph packing to a target words-per-section
// ---------------------------------------------------------------------------

import type { PdfExtractResult } from './pdfExtract';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SplitTier = 'toc' | 'headings' | 'readingTime';

export interface DocChunk {
  title: string;
  text: string;
  /** 1-based inclusive. 0 when the source had no pagination (plain text). */
  startPage: number;
  /** 1-based inclusive. 0 when the source had no pagination (plain text). */
  endPage: number;
  wordCount: number;
  readingMinutes: number;
}

export interface SplitResult {
  tier: SplitTier;
  chunks: DocChunk[];
}

export interface SplitOptions {
  /** Target size of a chunk in the reading-time tier. Default 450. */
  targetWordsPerSection?: number;
  /** Chunks smaller than this get merged into a neighbour. Default 120. */
  minWordsPerSection?: number;
  /** Hard cap on the number of chunks returned. Default 12. */
  maxSections?: number;
}

const DEFAULT_TARGET_WORDS = 450;
const DEFAULT_MIN_WORDS = 120;
const DEFAULT_MAX_SECTIONS = 12;
const WORDS_PER_MINUTE = 180;

// ---------------------------------------------------------------------------
// Small shared helpers
// ---------------------------------------------------------------------------

export function countWords(t: string): number {
  if (!t) return 0;
  const trimmed = String(t).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function estimateReadingMinutes(words: number): number {
  if (!isFinite(words) || words <= 0) return 1;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function resolveOptions(opts?: SplitOptions) {
  const target =
    opts && isFiniteNumber(opts.targetWordsPerSection) && opts.targetWordsPerSection! > 0
      ? Math.floor(opts.targetWordsPerSection!)
      : DEFAULT_TARGET_WORDS;
  const min =
    opts && isFiniteNumber(opts.minWordsPerSection) && opts.minWordsPerSection! >= 0
      ? Math.floor(opts.minWordsPerSection!)
      : DEFAULT_MIN_WORDS;
  const max =
    opts && isFiniteNumber(opts.maxSections) && opts.maxSections! >= 1
      ? Math.floor(opts.maxSections!)
      : DEFAULT_MAX_SECTIONS;
  return { target, min, max };
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v);
}

/** Normalize line endings / trailing spaces without shifting content around. */
function cleanText(raw: string): string {
  return String(raw ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

function cleanTitle(raw: string, max = 120): string {
  const t = String(raw ?? '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s•·\-–—*#>]+/, '')
    .replace(/[\s.:;,\-–—]+$/, '')
    .trim();
  if (!t) return '';
  return t.length <= max ? t : truncateAtWord(t, max);
}

function truncateAtWord(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const space = cut.lastIndexOf(' ');
  const base = space > max * 0.5 ? cut.slice(0, space) : cut;
  return base.replace(/[\s.:;,\-–—]+$/, '') + '…';
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Defensive normalization of the extraction agent's payload
//
// splitDocument() is typed against PdfExtractResult, but reads it through a
// structural view so that harmless naming differences (pageNumber vs page,
// size vs fontSize, …) degrade gracefully instead of crashing at runtime.
// ---------------------------------------------------------------------------

interface RawHeading {
  text?: unknown;
  str?: unknown;
  title?: unknown;
  size?: unknown;
  fontSize?: unknown;
  height?: unknown;
}

interface RawPage {
  pageNumber?: unknown;
  page?: unknown;
  number?: unknown;
  index?: unknown;
  text?: unknown;
  content?: unknown;
  headings?: unknown;
  bodySize?: unknown;
}

interface RawOutlineEntry {
  title?: unknown;
  text?: unknown;
  pageIndex?: unknown;
  page?: unknown;
  pageNumber?: unknown;
  startPage?: unknown;
  level?: unknown;
  depth?: unknown;
}

interface RawDoc {
  pages?: unknown;
  outline?: unknown;
  bodySize?: unknown;
  bodyFontSize?: unknown;
  title?: unknown;
}

interface NormHeading {
  text: string;
  size: number;
  pageNumber: number;
}

interface NormPage {
  pageNumber: number;
  text: string;
  headings: NormHeading[];
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function firstNumber(...vals: unknown[]): number | null {
  for (const v of vals) {
    if (typeof v === 'number' && isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() && isFinite(Number(v))) return Number(v);
  }
  return null;
}

function firstString(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

function normalizePages(doc: RawDoc): NormPage[] {
  const rawPages = asArray(doc.pages) as RawPage[];
  const out: NormPage[] = [];
  for (let i = 0; i < rawPages.length; i++) {
    const p = (rawPages[i] || {}) as RawPage;
    const explicit = firstNumber(p.pageNumber, p.page, p.number);
    const fromIndex = firstNumber(p.index);
    const pageNumber =
      explicit !== null ? Math.max(1, Math.round(explicit))
        : fromIndex !== null ? Math.max(1, Math.round(fromIndex) + 1)
          : i + 1;
    const text = cleanText(firstString(p.text, p.content));
    const headings: NormHeading[] = [];
    for (const h of asArray(p.headings) as RawHeading[]) {
      const hh = (h || {}) as RawHeading;
      const ht = cleanTitle(firstString(hh.text, hh.str, hh.title));
      if (!ht) continue;
      const size = firstNumber(hh.size, hh.fontSize, hh.height) ?? 0;
      headings.push({ text: ht, size: size > 0 ? size : 0, pageNumber });
    }
    out.push({ pageNumber, text, headings });
  }
  return out;
}

interface NormOutlineEntry {
  title: string;
  /** 1-based */
  page: number;
  level: number;
}

function normalizeOutline(doc: RawDoc, pageCount: number): NormOutlineEntry[] {
  const raw = asArray(doc.outline) as RawOutlineEntry[];
  const out: NormOutlineEntry[] = [];
  for (const e of raw) {
    const ee = (e || {}) as RawOutlineEntry;
    const title = cleanTitle(firstString(ee.title, ee.text));
    if (!title) continue;

    // `pageIndex` is 0-based by convention; every other spelling is 1-based.
    let page: number;
    const idx = firstNumber(ee.pageIndex);
    if (idx !== null) {
      page = Math.round(idx) + 1;
    } else {
      const oneBased = firstNumber(ee.pageNumber, ee.page, ee.startPage);
      page = oneBased !== null ? Math.round(oneBased) : 1;
    }
    if (!isFinite(page) || page < 1) page = 1;
    if (pageCount > 0 && page > pageCount) page = pageCount;

    const lvl = firstNumber(ee.level, ee.depth);
    const level = lvl !== null && lvl >= 0 ? Math.round(lvl) : 0;

    out.push({ title, page, level });
  }
  return out;
}

/** Median heading size, used when the extractor did not report a body size. */
function inferBodySize(pages: NormPage[]): number {
  const sizes: number[] = [];
  for (const p of pages) for (const h of p.headings) if (h.size > 0) sizes.push(h.size);
  if (sizes.length === 0) return 0;
  sizes.sort((a, b) => a - b);
  return sizes[Math.floor(sizes.length / 2)];
}

// ---------------------------------------------------------------------------
// Document text model — a single string plus page offset bookkeeping so that a
// chunk produced anywhere in the cascade can report accurate page ranges.
// ---------------------------------------------------------------------------

interface PageSpan {
  pageNumber: number;
  start: number;
  end: number;
}

interface DocText {
  text: string;
  spans: PageSpan[];
  /** true when the source had no real pagination (plain text) */
  unpaged: boolean;
}

const PAGE_JOIN = '\n\n';

function buildDocText(pages: NormPage[]): DocText {
  const spans: PageSpan[] = [];
  let text = '';
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const start = text.length;
    text += p.text;
    spans.push({ pageNumber: p.pageNumber, start, end: text.length });
    if (i < pages.length - 1) text += PAGE_JOIN;
  }
  return { text, spans, unpaged: false };
}

function buildPlainDocText(text: string): DocText {
  const clean = cleanText(text);
  return {
    text: clean,
    spans: [{ pageNumber: 0, start: 0, end: clean.length }],
    unpaged: true,
  };
}

function pageAtOffset(doc: DocText, offset: number): number {
  if (doc.unpaged) return 0;
  if (doc.spans.length === 0) return 0;
  const o = Math.max(0, Math.min(offset, doc.text.length));
  for (const span of doc.spans) {
    if (o < span.end) return span.pageNumber;
  }
  return doc.spans[doc.spans.length - 1].pageNumber;
}

// ---------------------------------------------------------------------------
// Chunk construction / post-processing
// ---------------------------------------------------------------------------

function makeChunk(title: string, text: string, startPage: number, endPage: number): DocChunk {
  const body = cleanText(text).trim();
  const words = countWords(body);
  const sp = Math.max(0, Math.round(startPage) || 0);
  const ep = Math.max(sp, Math.round(endPage) || 0);
  return {
    title: cleanTitle(title) || 'Bagian',
    text: body,
    startPage: sp,
    endPage: ep,
    wordCount: words,
    readingMinutes: estimateReadingMinutes(words),
  };
}

function mergeChunks(a: DocChunk, b: DocChunk): DocChunk {
  const text = [a.text, b.text].filter((t) => t && t.trim()).join('\n\n');
  const startPage = a.startPage === 0 || b.startPage === 0 ? Math.max(a.startPage, b.startPage) : Math.min(a.startPage, b.startPage);
  return makeChunk(a.title, text, startPage, Math.max(a.endPage, b.endPage));
}

/**
 * Applies to every tier: drop empties, absorb undersized chunks, enforce the
 * section cap, and guarantee at least one chunk when there is any text.
 */
function postProcess(chunks: DocChunk[], minWords: number, maxSections: number): DocChunk[] {
  let list = chunks.filter((c) => c && c.text && c.text.trim().length > 0);
  if (list.length === 0) return [];

  // 1. absorb chunks that are too short to stand on their own
  let i = 0;
  let guard = 0;
  while (i < list.length && list.length > 1 && guard < 10000) {
    guard++;
    if (list[i].wordCount < minWords) {
      if (i === 0) {
        list.splice(0, 2, mergeChunks(list[0], list[1]));
        i = 0;
      } else {
        list.splice(i - 1, 2, mergeChunks(list[i - 1], list[i]));
        i = Math.max(0, i - 1);
      }
    } else {
      i++;
    }
  }

  // 2. enforce the cap by repeatedly merging the smallest adjacent pair
  guard = 0;
  while (list.length > maxSections && list.length > 1 && guard < 10000) {
    guard++;
    let bestIdx = 0;
    let bestSum = Infinity;
    for (let k = 0; k < list.length - 1; k++) {
      const sum = list[k].wordCount + list[k + 1].wordCount;
      if (sum < bestSum) {
        bestSum = sum;
        bestIdx = k;
      }
    }
    list.splice(bestIdx, 2, mergeChunks(list[bestIdx], list[bestIdx + 1]));
  }

  // 3. never emit an empty chunk
  list = list.filter((c) => c.text.trim().length > 0);
  return list;
}

// ---------------------------------------------------------------------------
// TIER 1 — table of contents (PDF outline)
// ---------------------------------------------------------------------------

function tierToc(
  outline: NormOutlineEntry[],
  pages: NormPage[],
  doc: DocText,
): DocChunk[] {
  if (outline.length < 2 || pages.length === 0) return [];

  const shallowest = outline.reduce((m, e) => Math.min(m, e.level), Number.POSITIVE_INFINITY);
  const tops = outline.filter((e) => e.level === shallowest);
  if (tops.length < 2) return [];

  // keep document order, and make page numbers monotonically non-decreasing
  const ordered = tops.slice();
  const lastPage = pages[pages.length - 1].pageNumber;

  const chunks: DocChunk[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const startPage = ordered[i].page;
    const nextPage = i + 1 < ordered.length ? ordered[i + 1].page : lastPage + 1;
    const endPage = Math.max(startPage, Math.min(lastPage, nextPage - 1));

    const parts: string[] = [];
    for (const p of pages) {
      if (p.pageNumber >= startPage && p.pageNumber <= endPage && p.text.trim()) {
        parts.push(p.text);
      }
    }
    const body = parts.join(PAGE_JOIN).trim();
    if (!body) continue;
    chunks.push(makeChunk(ordered[i].title, body, startPage, endPage));
  }

  void doc;
  return chunks.length >= 2 ? chunks : [];
}

// ---------------------------------------------------------------------------
// TIER 2 — font-size headings (PDF)
// ---------------------------------------------------------------------------

interface HeadingHit {
  text: string;
  /** offset of the heading itself inside doc.text */
  offset: number;
  /** offset where the heading's body starts */
  bodyStart: number;
  pageNumber: number;
}

/** Locate a heading inside its page text, tolerating whitespace differences. */
function locateInPage(pageText: string, heading: string, from: number): number {
  if (!heading) return -1;
  const direct = pageText.indexOf(heading, from);
  if (direct >= 0) return direct;

  const tokens = heading.split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (tokens.length === 0) return -1;
  try {
    const re = new RegExp(tokens.join('[\\s\\u00a0]+'), 'i');
    const slice = pageText.slice(from);
    const m = re.exec(slice);
    if (m && typeof m.index === 'number') return from + m.index;
  } catch {
    /* malformed heading — give up on this one */
  }
  return -1;
}

function tierFontHeadings(pages: NormPage[], doc: DocText, bodySize: number): DocChunk[] {
  if (pages.length === 0 || !doc.text.trim()) return [];

  const all: NormHeading[] = [];
  for (const p of pages) for (const h of p.headings) all.push(h);
  if (all.length < 2) return [];

  const base = bodySize > 0 ? bodySize : inferBodySize(pages);
  let qualifying: NormHeading[];
  if (base > 0) {
    qualifying = all.filter((h) => h.size >= base * 1.2);
    if (qualifying.length < 2) qualifying = all.filter((h) => h.size >= base * 1.15);
  } else {
    // no usable size information at all — every reported heading counts
    qualifying = all.slice();
  }
  if (qualifying.length < 2) return [];

  const qualifyingSet = new Set(qualifying);

  // resolve every qualifying heading to a global offset
  const hits: HeadingHit[] = [];
  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi];
    const span = doc.spans[pi];
    if (!span) continue;
    let cursor = 0;
    for (const h of page.headings) {
      const at = locateInPage(page.text, h.text, cursor);
      if (at < 0) continue;
      cursor = at + h.text.length;
      if (!qualifyingSet.has(h)) continue;
      hits.push({
        text: h.text,
        offset: span.start + at,
        bodyStart: span.start + at + h.text.length,
        pageNumber: page.pageNumber,
      });
    }
  }
  if (hits.length < 2) return [];
  hits.sort((a, b) => a.offset - b.offset);

  const preamble = doc.text.slice(0, hits[0].offset).trim();

  const chunks: DocChunk[] = [];
  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];
    const end = i + 1 < hits.length ? hits[i + 1].offset : doc.text.length;
    let body = doc.text.slice(Math.min(hit.bodyStart, end), end).trim();
    let startPage = hit.pageNumber;
    if (i === 0 && preamble) {
      body = body ? `${preamble}\n\n${body}` : preamble;
      startPage = pageAtOffset(doc, 0);
    }
    if (!body) continue;
    const endPage = pageAtOffset(doc, Math.max(hit.bodyStart, end - 1));
    chunks.push(makeChunk(hit.text, body, startPage, Math.max(startPage, endPage)));
  }

  return chunks.length >= 2 ? chunks : [];
}

// ---------------------------------------------------------------------------
// TIER 2b — textual headings (markdown, "Bab N", numbered headings)
// ---------------------------------------------------------------------------

const MD_HEADING = /^#{1,6}\s+(\S.*)$/;
const KEYWORD_HEADING =
  /^((?:bab|bagian|chapter|part|unit|modul|module|topik|section|pertemuan)\s+[0-9ivxlcdm]+)\b[\s.:—–-]*(.*)$/i;
// "1. Judul", "2) Judul", "1.2 Judul", "3.1.4 Judul" — but NOT "2020 was a good year"
const NUMBERED_HEADING = /^(\d{1,2}(?:\.\d{1,2}){1,3}\.?|\d{1,2}[.)])\s+(\S.{2,70})$/;

interface TextHeadingHit {
  title: string;
  /** offset of the heading line start */
  offset: number;
  /** offset where the body starts (just after the heading line) */
  bodyStart: number;
}

function findTextHeadings(text: string): TextHeadingHit[] {
  const hits: TextHeadingHit[] = [];
  let offset = 0;
  const lines = text.split('\n');
  for (const line of lines) {
    const lineStart = offset;
    offset += line.length + 1; // +1 for the '\n' consumed by split
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 120) continue;

    let title = '';
    const md = MD_HEADING.exec(trimmed);
    if (md) {
      title = md[1];
    } else {
      const kw = KEYWORD_HEADING.exec(trimmed);
      if (kw) {
        title = kw[2] && kw[2].trim() ? `${kw[1]} — ${kw[2].trim()}` : kw[1];
      } else {
        const num = NUMBERED_HEADING.exec(trimmed);
        // a numbered heading must not read like a sentence
        if (num && !/[.!?;,]$/.test(trimmed) && countWords(num[2]) <= 12) {
          title = `${num[1]} ${num[2]}`;
        }
      }
    }

    const cleaned = cleanTitle(title);
    if (!cleaned) continue;
    hits.push({ title: cleaned, offset: lineStart, bodyStart: lineStart + line.length });
  }
  return hits;
}

function tierTextHeadings(doc: DocText): DocChunk[] {
  if (!doc.text.trim()) return [];
  const hits = findTextHeadings(doc.text);
  if (hits.length < 2) return [];

  const preamble = doc.text.slice(0, hits[0].offset).trim();
  const chunks: DocChunk[] = [];
  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];
    const end = i + 1 < hits.length ? hits[i + 1].offset : doc.text.length;
    let body = doc.text.slice(Math.min(hit.bodyStart, end), end).trim();
    let startPage = pageAtOffset(doc, hit.offset);
    if (i === 0 && preamble) {
      body = body ? `${preamble}\n\n${body}` : preamble;
      startPage = pageAtOffset(doc, 0);
    }
    if (!body) continue;
    const endPage = pageAtOffset(doc, Math.max(hit.bodyStart, end - 1));
    chunks.push(makeChunk(hit.title, body, startPage, Math.max(startPage, endPage)));
  }

  return chunks.length >= 2 ? chunks : [];
}

// ---------------------------------------------------------------------------
// TIER 3 — reading-time packing
// ---------------------------------------------------------------------------

interface Para {
  text: string;
  start: number;
  end: number;
  words: number;
}

function paragraphsWithOffsets(text: string): Para[] {
  const out: Para[] = [];
  const sep = /\n[ \t]*\n+/g;
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = sep.exec(text)) !== null) {
    const raw = text.slice(cursor, m.index);
    if (raw.trim()) {
      out.push({ text: raw.trim(), start: cursor, end: m.index, words: countWords(raw) });
    }
    cursor = m.index + m[0].length;
  }
  const tail = text.slice(cursor);
  if (tail.trim()) {
    out.push({ text: tail.trim(), start: cursor, end: text.length, words: countWords(tail) });
  }
  return out;
}

/** First reasonably meaningful sentence of a block, for use as a title. */
function deriveTitle(text: string, fallback: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (!flat) return fallback;
  const sentences = flat.split(/(?<=[.!?:])\s+/);
  for (const s of sentences) {
    const candidate = cleanTitle(s, 60);
    if (candidate && countWords(candidate) >= 3) return candidate;
  }
  const first = cleanTitle(flat, 60);
  return first && countWords(first) >= 2 ? first : fallback;
}

function tierReadingTime(doc: DocText, targetWords: number, fallbackTitle: string): DocChunk[] {
  const paras = paragraphsWithOffsets(doc.text);
  if (paras.length === 0) {
    const body = doc.text.trim();
    if (!body) return [];
    return [
      makeChunk(
        deriveTitle(body, fallbackTitle),
        body,
        pageAtOffset(doc, 0),
        pageAtOffset(doc, doc.text.length - 1),
      ),
    ];
  }

  const chunks: DocChunk[] = [];
  let buffer: Para[] = [];
  let bufferWords = 0;
  let index = 1;

  const flush = () => {
    if (buffer.length === 0) return;
    const body = buffer.map((p) => p.text).join('\n\n').trim();
    if (body) {
      const start = buffer[0].start;
      const end = buffer[buffer.length - 1].end;
      const title = deriveTitle(body, `${fallbackTitle} ${index}`);
      chunks.push(
        makeChunk(title, body, pageAtOffset(doc, start), pageAtOffset(doc, Math.max(start, end - 1))),
      );
      index++;
    }
    buffer = [];
    bufferWords = 0;
  };

  for (const p of paras) {
    // never split inside a paragraph
    buffer.push(p);
    bufferWords += p.words;
    if (bufferWords >= targetWords) flush();
  }
  flush();

  return chunks;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Split an extracted PDF/document into teachable chunks using the full
 * three-tier cascade. Pure — safe to call from a worker or a test.
 */
export function splitDocument(input: PdfExtractResult, opts?: SplitOptions): SplitResult {
  const { target, min, max } = resolveOptions(opts);
  const raw = (input || {}) as unknown as RawDoc;

  const pages = normalizePages(raw);
  const doc = pages.length > 0 ? buildDocText(pages) : buildPlainDocText('');
  const hasText = doc.text.trim().length > 0;
  if (!hasText) return { tier: 'readingTime', chunks: [] };

  const outline = normalizeOutline(raw, pages.length);
  const bodySize = firstNumber(raw.bodySize, raw.bodyFontSize) ?? 0;

  // ---- Tier 1: table of contents -----------------------------------------
  // A tier is "usable" when it yields >= 2 chunks BEFORE post-processing;
  // post-processing (merging) may legitimately collapse it back to one.
  const toc = tierToc(outline, pages, doc);
  if (toc.length >= 2) return { tier: 'toc', chunks: postProcess(toc, min, max) };

  // ---- Tier 2: headings (font size first, then textual patterns) ---------
  const fontHeads = tierFontHeadings(pages, doc, bodySize);
  if (fontHeads.length >= 2) return { tier: 'headings', chunks: postProcess(fontHeads, min, max) };

  const textHeads = tierTextHeadings(doc);
  if (textHeads.length >= 2) return { tier: 'headings', chunks: postProcess(textHeads, min, max) };

  // ---- Tier 3: reading time ----------------------------------------------
  const packed = postProcess(tierReadingTime(doc, target, 'Bagian'), min, max);
  if (packed.length >= 1) return { tier: 'readingTime', chunks: packed };

  // last resort: a single chunk holding everything
  const whole = makeChunk(
    'Bagian 1',
    doc.text,
    pageAtOffset(doc, 0),
    pageAtOffset(doc, doc.text.length - 1),
  );
  return { tier: 'readingTime', chunks: whole.text ? [whole] : [] };
}

/**
 * Split raw text (txt / md / docx / pptx / manual paste). Runs tier 2b
 * (markdown & "Bab N" style headings) then tier 3. Page numbers are 0.
 */
export function splitPlainText(text: string, title: string, opts?: SplitOptions): SplitResult {
  const { target, min, max } = resolveOptions(opts);
  const doc = buildPlainDocText(text || '');
  if (!doc.text.trim()) return { tier: 'readingTime', chunks: [] };

  const fallbackTitle = cleanTitle(title, 60) || 'Bagian';

  const textHeads = tierTextHeadings(doc);
  if (textHeads.length >= 2) return { tier: 'headings', chunks: postProcess(textHeads, min, max) };

  const packed = postProcess(tierReadingTime(doc, target, 'Bagian'), min, max);
  if (packed.length >= 1) {
    // a single-chunk document is best titled by the document itself
    if (packed.length === 1) packed[0].title = fallbackTitle;
    return { tier: 'readingTime', chunks: packed };
  }

  const whole = makeChunk(fallbackTitle, doc.text, 0, 0);
  return { tier: 'readingTime', chunks: whole.text ? [whole] : [] };
}
