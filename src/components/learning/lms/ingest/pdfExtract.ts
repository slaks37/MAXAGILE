// ---------------------------------------------------------------------------
// PDF extraction — 100% in-browser, zero server dependency.
//
// PRIME DIRECTIVE COMPLIANCE:
//  * pdf.js is loaded lazily via dynamic `await import(...)` inside extractPdf,
//    never at module top level, so the main bundle stays small.
//  * OCR is a FALLBACK ONLY: pages whose text layer already works are never
//    OCR-ed. Only pages with essentially no extractable text get rasterized.
//  * No /api/split-pdf, no PyMuPDF, no Python. Everything runs client-side.
// ---------------------------------------------------------------------------

import { ocrImages } from './ocr';

export interface PdfPage {
  pageNumber: number;
  text: string;
  /** true when this page had no usable text layer and was OCR-ed (or needs OCR) */
  ocrUsed: boolean;
  /** dominant body font size on the page */
  bodySize: number;
  /** detected heading lines with their font size, in reading order */
  headings: { text: string; size: number }[];
}

export interface PdfExtractResult {
  pages: PdfPage[];
  outline: { title: string; pageIndex: number; level: number }[];
  bodySize: number;
  scannedPageCount: number;
  totalPages: number;
}

export interface ExtractOptions {
  onProgress?: (p: {
    stage: 'parsing' | 'ocr';
    page: number;
    totalPages: number;
    progress: number;
  }) => void;
  /** default true — set false to skip the OCR fallback entirely */
  enableOcr?: boolean;
  ocrLangs?: string[];
  signal?: { cancelled: boolean };
}

// --- tuning constants -------------------------------------------------------

/** Baselines closer than this (PDF units) belong to the same visual line. */
const LINE_Y_TOLERANCE = 2;
/** A line is a heading when its size is at least this multiple of body size. */
const HEADING_SIZE_RATIO = 1.15;
const HEADING_MIN_CHARS = 3;
const HEADING_MAX_CHARS = 90;
/** Below this many non-whitespace characters a page is considered "scanned". */
const SCANNED_PAGE_MIN_CHARS = 25;
/** Render scale used when rasterizing a scanned page for OCR. */
const OCR_RENDER_SCALE = 2.0;
/** Hard cap on the longest rendered side — protects low-end machines. */
const OCR_MAX_SIDE = 2000;

// --- internal shapes --------------------------------------------------------

interface RawItem {
  x: number;
  y: number;
  w: number;
  size: number;
  str: string;
}

interface TextLine {
  text: string;
  size: number;
  y: number;
}

let workerConfigured = false;

/** Lazily import pdf.js and wire its worker for Vite (idempotent). */
async function loadPdfjs(): Promise<any> {
  const pdfjsLib: any = await import('pdfjs-dist');
  if (!workerConfigured) {
    try {
      // @ts-ignore -- Vite `?url` asset import; resolved by the bundler, not by tsc.
      const workerMod: any = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      const workerSrc = workerMod?.default;
      if (workerSrc && pdfjsLib?.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      }
      workerConfigured = true;
    } catch {
      // Leave pdf.js on its built-in default; extraction may still work
      // (slower, main-thread) rather than failing outright.
    }
  }
  return pdfjsLib;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function nonWhitespaceCount(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c > 32) n++;
  }
  return n;
}

/** Font scale of a pdf.js text item: |(c, d)| of its transform matrix. */
function itemFontSize(item: any): number {
  const t = item?.transform;
  if (Array.isArray(t) && t.length >= 4) {
    const s = Math.hypot(Number(t[2]) || 0, Number(t[3]) || 0);
    if (s > 0.01) return s;
  }
  const h = Number(item?.height);
  return Number.isFinite(h) && h > 0 ? h : 0;
}

/**
 * Reconstructs visual lines from pdf.js text items.
 * Items are grouped by baseline y (within LINE_Y_TOLERANCE), ordered by
 * descending y then ascending x. Within a line a space is inserted where the
 * horizontal gap between glyph runs is wide.
 */
function buildLines(items: any[]): TextLine[] {
  const raw: RawItem[] = [];
  for (const it of items || []) {
    const str = it?.str;
    if (typeof str !== 'string' || str.length === 0) continue;
    const t = Array.isArray(it.transform) ? it.transform : [1, 0, 0, 1, 0, 0];
    raw.push({
      x: Number(t[4]) || 0,
      y: Number(t[5]) || 0,
      w: Number(it.width) || 0,
      size: itemFontSize(it),
      str,
    });
  }
  if (!raw.length) return [];

  raw.sort((a, b) => (b.y - a.y) || (a.x - b.x));

  const groups: RawItem[][] = [];
  let current: RawItem[] = [];
  let anchorY = Number.NaN;
  for (const r of raw) {
    if (!current.length) {
      current = [r];
      anchorY = r.y;
      continue;
    }
    if (Math.abs(r.y - anchorY) < LINE_Y_TOLERANCE) {
      current.push(r);
    } else {
      groups.push(current);
      current = [r];
      anchorY = r.y;
    }
  }
  if (current.length) groups.push(current);

  const lines: TextLine[] = [];
  for (const g of groups) {
    g.sort((a, b) => a.x - b.x);
    let text = '';
    let prevEnd: number | null = null;
    let size = 0;
    for (const r of g) {
      if (r.size > size) size = r.size;
      if (prevEnd !== null) {
        const gap = r.x - prevEnd;
        const threshold = Math.max(0.8, (r.size || 10) * 0.2);
        if (gap > threshold && !/\s$/.test(text) && !/^\s/.test(r.str)) text += ' ';
      }
      text += r.str;
      prevEnd = r.x + (r.w || 0);
    }
    const trimmed = text.replace(/\s+$/, '');
    if (!trimmed.trim()) continue;
    lines.push({ text: trimmed, size, y: g[0].y });
  }
  return lines;
}

/** Joins lines into page text, inserting a blank line at paragraph breaks. */
function linesToText(lines: TextLine[]): string {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    out.push(line.text);
    const next = lines[i + 1];
    if (!next) continue;
    const gap = line.y - next.y;
    const ref = Math.max(line.size, next.size, 1);
    if (gap > ref * 1.6) out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Most common rounded font size, weighted by character count. */
function dominantSize(weights: Map<number, number>): number {
  let best = 0;
  let bestWeight = -1;
  for (const [size, weight] of weights) {
    if (weight > bestWeight || (weight === bestWeight && size < best)) {
      best = size;
      bestWeight = weight;
    }
  }
  return best;
}

function accumulateSizes(target: Map<number, number>, lines: TextLine[]): void {
  for (const line of lines) {
    const rounded = Math.round(line.size);
    if (!(rounded > 0)) continue;
    const chars = line.text.trim().length;
    if (!chars) continue;
    target.set(rounded, (target.get(rounded) || 0) + chars);
  }
}

const LETTER_RE = /\p{L}/u;

function isHeadingLine(text: string, size: number, bodySize: number): boolean {
  if (!(bodySize > 0) || !(size > 0)) return false;
  if (size < bodySize * HEADING_SIZE_RATIO) return false;
  const t = text.trim();
  if (t.length < HEADING_MIN_CHARS || t.length > HEADING_MAX_CHARS) return false;
  if (t.endsWith('.') || t.endsWith(',')) return false;
  return LETTER_RE.test(t);
}

/** Flattens doc.getOutline() into { title, pageIndex, level } entries. */
async function buildOutline(doc: any): Promise<{ title: string; pageIndex: number; level: number }[]> {
  let root: any;
  try {
    root = await doc.getOutline();
  } catch {
    return [];
  }
  if (!Array.isArray(root) || !root.length) return [];

  const out: { title: string; pageIndex: number; level: number }[] = [];

  const walk = async (items: any[], level: number): Promise<void> => {
    for (const item of items) {
      if (!item) continue;
      const title = typeof item.title === 'string' ? item.title.trim() : '';
      let pageIndex = -1;
      try {
        const dest =
          typeof item.dest === 'string' ? await doc.getDestination(item.dest) : item.dest;
        if (Array.isArray(dest) && dest[0]) {
          const idx = await doc.getPageIndex(dest[0]);
          if (typeof idx === 'number' && idx >= 0) pageIndex = idx;
        }
      } catch {
        pageIndex = -1; // unresolvable — skip this entry but keep its children
      }
      if (title && pageIndex >= 0) out.push({ title, pageIndex, level });
      if (Array.isArray(item.items) && item.items.length) {
        await walk(item.items, level + 1);
      }
    }
  };

  try {
    await walk(root, 0);
  } catch {
    /* partial outline is better than none */
  }
  return out;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), 'image/png');
    } catch {
      resolve(null);
    }
  });
}

/**
 * Renders one page to a PNG blob for OCR. Returns null on failure.
 * A blob (rather than a live canvas) keeps peak memory low when many pages
 * must be OCR-ed on a low-end machine.
 */
async function renderPageForOcr(doc: any, pageNumber: number): Promise<Blob | HTMLCanvasElement | null> {
  if (typeof document === 'undefined') return null;
  let page: any = null;
  let canvas: HTMLCanvasElement | null = null;
  try {
    page = await doc.getPage(pageNumber);
    let scale = OCR_RENDER_SCALE;
    const probe = page.getViewport({ scale });
    const longest = Math.max(probe.width, probe.height);
    if (longest > OCR_MAX_SIDE) scale = scale * (OCR_MAX_SIDE / longest);

    const viewport = page.getViewport({ scale });
    canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const blob = await canvasToBlob(canvas);
    if (blob) {
      canvas.width = 0;
      canvas.height = 0;
      return blob;
    }
    return canvas; // fall back to the live canvas
  } catch {
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
    return null;
  } finally {
    try {
      page?.cleanup?.();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Extracts structured text from a PDF entirely in the browser.
 *
 * Pages with a working text layer are read from `getTextContent()`. Only pages
 * with essentially no text are rasterized and passed to OCR (when enabled).
 * OCR failures degrade gracefully: the affected pages keep empty text and the
 * rest of the extraction still succeeds.
 */
export async function extractPdf(file: File, opts: ExtractOptions = {}): Promise<PdfExtractResult> {
  const { onProgress, enableOcr, ocrLangs, signal } = opts;

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch (err: any) {
    throw new Error(`Gagal membaca berkas PDF "${file.name}": ${err?.message || err}`);
  }

  let pdfjsLib: any;
  try {
    pdfjsLib = await loadPdfjs();
  } catch (err: any) {
    throw new Error(`Gagal memuat pustaka PDF (pdf.js): ${err?.message || err}`);
  }

  let doc: any = null;
  try {
    try {
      doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    } catch (err: any) {
      throw new Error(
        `PDF "${file.name}" tidak dapat dibuka: ${err?.message || err}. ` +
          `Berkas mungkin rusak atau terkunci dengan kata sandi.`,
      );
    }

    const totalPages: number = Number(doc.numPages) || 0;
    const pages: PdfPage[] = [];
    const perPageLines: TextLine[][] = [];
    const docSizes = new Map<number, number>();

    // ---- pass 1: text layer -------------------------------------------------
    for (let n = 1; n <= totalPages; n++) {
      if (signal?.cancelled) break;
      onProgress?.({
        stage: 'parsing',
        page: n,
        totalPages,
        progress: clamp01((n - 1) / Math.max(1, totalPages)),
      });

      let lines: TextLine[] = [];
      let page: any = null;
      try {
        page = await doc.getPage(n);
        const tc = await page.getTextContent();
        lines = buildLines(tc?.items || []);
      } catch {
        lines = [];
      } finally {
        try {
          page?.cleanup?.();
        } catch {
          /* ignore */
        }
      }

      perPageLines.push(lines);
      accumulateSizes(docSizes, lines);

      const text = linesToText(lines);
      pages.push({
        pageNumber: n,
        text,
        ocrUsed: nonWhitespaceCount(text) < SCANNED_PAGE_MIN_CHARS,
        bodySize: 0,
        headings: [],
      });
    }

    onProgress?.({ stage: 'parsing', page: totalPages, totalPages, progress: 1 });

    // ---- body size + headings ----------------------------------------------
    const bodySize = dominantSize(docSizes);

    for (let i = 0; i < pages.length; i++) {
      const lines = perPageLines[i] || [];
      const pageSizes = new Map<number, number>();
      accumulateSizes(pageSizes, lines);
      const pageBody = dominantSize(pageSizes) || bodySize;
      pages[i].bodySize = pageBody;

      const reference = bodySize || pageBody;
      const headings: { text: string; size: number }[] = [];
      for (const line of lines) {
        if (isHeadingLine(line.text, line.size, reference)) {
          headings.push({ text: line.text.trim(), size: line.size });
        }
      }
      pages[i].headings = headings;
    }

    // ---- pass 2: OCR fallback (scanned pages only) --------------------------
    const scannedIndexes: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].ocrUsed) scannedIndexes.push(i);
    }
    const scannedPageCount = scannedIndexes.length;

    if (enableOcr !== false && scannedPageCount > 0 && !signal?.cancelled) {
      try {
        const images: (Blob | HTMLCanvasElement)[] = [];
        const imageForIndex: number[] = [];

        for (let k = 0; k < scannedIndexes.length; k++) {
          if (signal?.cancelled) break;
          const idx = scannedIndexes[k];
          onProgress?.({
            stage: 'ocr',
            page: pages[idx].pageNumber,
            totalPages,
            // rendering occupies the first half of the OCR stage
            progress: clamp01((k / Math.max(1, scannedPageCount)) * 0.5),
          });
          const img = await renderPageForOcr(doc, pages[idx].pageNumber);
          if (img) {
            images.push(img);
            imageForIndex.push(idx);
          }
        }

        if (images.length && !signal?.cancelled) {
          const texts = await ocrImages(images, {
            langs: ocrLangs,
            signal,
            onProgress: (p) => {
              const at = typeof p.page === 'number' ? p.page : 0;
              const idx = imageForIndex[Math.max(0, at - 1)] ?? scannedIndexes[0];
              onProgress?.({
                stage: 'ocr',
                page: pages[idx]?.pageNumber ?? 0,
                totalPages,
                progress: clamp01(0.5 + clamp01(p.progress) * 0.5),
              });
            },
          });

          for (let k = 0; k < imageForIndex.length; k++) {
            const idx = imageForIndex[k];
            const t = (texts[k] || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
            if (t) pages[idx].text = t;
            // ocrUsed stays true: this page had no usable text layer.
          }
        }

        onProgress?.({ stage: 'ocr', page: totalPages, totalPages, progress: 1 });
      } catch {
        // OCR is best-effort. Keep the (empty) text layer results and carry on.
      }
    }

    // ---- outline ------------------------------------------------------------
    const outline = await buildOutline(doc);

    return {
      pages,
      outline,
      bodySize,
      scannedPageCount,
      totalPages,
    };
  } finally {
    if (doc) {
      try {
        await doc.destroy();
      } catch {
        /* ignore */
      }
    }
  }
}
