// ---------------------------------------------------------------------------
// MaxAgile LMS — ingestion orchestrator
//
// One entry point (`ingestFiles`) that turns any supported document into a
// ready-to-save Course.
//
// PRIME DIRECTIVE COMPLIANCE:
//  * ZERO server dependency. No /api/split-pdf, no PyMuPDF, no Python. The only
//    network calls are the optional attachment uploads (which degrade into
//    warnings) and tesseract's one-time language-data download.
//  * The heavy libraries are never imported here at top level. `pdfExtract`
//    lazy-imports pdf.js and `ocr` lazy-imports tesseract.js from INSIDE their
//    own functions, so importing this module costs nothing until it runs.
//  * OCR is a FALLBACK. `extractPdf` only rasterizes pages that have no usable
//    text layer; images are the sole case where OCR is the primary path.
// ---------------------------------------------------------------------------

import type { Attachment } from '../types';
import { uploadFile } from '../store';
import { extractPdf, type PdfExtractResult } from './pdfExtract';
import { isOcrAvailable, ocrSingleImageFile } from './ocr';
import { extractDocx, extractPptx, extractXlsx } from './officeExtract';
import {
  splitDocument,
  splitPlainText,
  type SplitOptions,
  type SplitResult,
  type SplitTier,
} from './outline';
import { buildCourseFromSplit, type BuiltCourse } from './courseBuilder';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface IngestProgress {
  stage: 'reading' | 'parsing' | 'ocr' | 'splitting' | 'building' | 'done';
  message: string;
  /** 0..1 */
  progress: number;
  page?: number;
  totalPages?: number;
}

export interface IngestOptions {
  title?: string;
  category?: string;
  /** tailwind gradient string */
  color?: string;
  /** default true — OCR scanned PDF pages / images */
  enableOcr?: boolean;
  /** tesseract language codes, default ["ind", "eng"] */
  ocrLangs?: string[];
  /** default true */
  includeQuiz?: boolean;
  /** default true */
  includeChecklist?: boolean;
  /** default true — upload the original file(s) and attach them to the course */
  attachFile?: boolean;
  /** default "id" */
  language?: 'id' | 'en';
  onProgress?: (p: IngestProgress) => void;
  /** cooperative cancellation — polled between every phase */
  signal?: { cancelled: boolean };
  splitOptions?: SplitOptions;
}

export interface IngestResult {
  built: BuiltCourse;
  sourceName: string;
  /** pages/images that were recognized with OCR */
  ocrPages: number;
  /** total pages across PDFs, or the number of files for non-paginated input */
  totalPages: number;
  tier: SplitTier;
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Supported input
// ---------------------------------------------------------------------------

export type IngestKind = 'pdf' | 'image' | 'text' | 'doc' | 'slide' | 'sheet' | 'unknown';

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tif', 'tiff'];
const TEXT_EXTS = ['txt', 'md', 'markdown'];
const DOC_EXTS = ['docx', 'doc'];
const SLIDE_EXTS = ['pptx', 'ppt'];
const SHEET_EXTS = ['xlsx', 'xls'];

/** Value for an <input type="file"> accept attribute. */
export const INGEST_ACCEPT =
  '.pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.txt,.md,.docx,.pptx,.xlsx';

export function fileExtension(name: string): string {
  const clean = String(name || '').toLowerCase().trim();
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1) : '';
}

export function ingestKind(name: string): IngestKind {
  const ext = fileExtension(name);
  if (ext === 'pdf') return 'pdf';
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (TEXT_EXTS.includes(ext)) return 'text';
  if (DOC_EXTS.includes(ext)) return 'doc';
  if (SLIDE_EXTS.includes(ext)) return 'slide';
  if (SHEET_EXTS.includes(ext)) return 'sheet';
  return 'unknown';
}

export function isSupportedIngestFile(name: string): boolean {
  return ingestKind(name) !== 'unknown';
}

/** "modul-01_dasar agile.pdf" -> "Modul 01 Dasar Agile" */
export function prettifyFileName(name: string): string {
  const base = String(name || '').replace(/\.[^.]+$/, '');
  const words = base
    .replace(/[_\-.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!words) return '';
  return words
    .split(' ')
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Cancellation
// ---------------------------------------------------------------------------

/** Error thrown when `opts.signal.cancelled` flips mid-run. `.name` is "IngestCancelled". */
export function ingestCancelledError(): Error {
  const err = new Error('Proses impor dibatalkan.');
  err.name = 'IngestCancelled';
  return err;
}

export function isIngestCancelled(err: unknown): boolean {
  return !!err && typeof err === 'object' && (err as { name?: string }).name === 'IngestCancelled';
}

function throwIfCancelled(signal?: { cancelled: boolean }): void {
  if (signal?.cancelled) throw ingestCancelledError();
}

// ---------------------------------------------------------------------------
// Progress plumbing
// ---------------------------------------------------------------------------

const P_READ_END = 0.05;
const P_EXTRACT_END = 0.8;
const P_SPLIT_END = 0.88;
const P_BUILD_END = 0.99;

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------

function pagesToText(res: PdfExtractResult): string {
  return (res.pages || [])
    .map((p) => (p.text || '').trim())
    .filter(Boolean)
    .join('\n\n');
}

/** OCR-ed pages that actually produced text, and scanned pages left empty. */
function countOcr(res: PdfExtractResult): { recognized: number; empty: number } {
  let recognized = 0;
  let empty = 0;
  for (const p of res.pages || []) {
    if (!p.ocrUsed) continue;
    if ((p.text || '').trim()) recognized++;
    else empty++;
  }
  return { recognized, empty };
}

async function readPlainText(file: File): Promise<string> {
  try {
    return await file.text();
  } catch (err: any) {
    throw new Error(`Gagal membaca berkas teks "${file.name}": ${err?.message || err}`);
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function ingestFiles(files: File[], opts: IngestOptions = {}): Promise<IngestResult> {
  const {
    enableOcr = true,
    ocrLangs,
    includeQuiz = true,
    includeChecklist = true,
    attachFile = true,
    language = 'id',
    onProgress,
    signal,
    splitOptions,
  } = opts;

  const list = (files || []).filter(Boolean);
  if (list.length === 0) {
    throw new Error('Tidak ada berkas yang dipilih.');
  }

  const warnings: string[] = [];
  const emit = (p: IngestProgress) => {
    try {
      onProgress?.({ ...p, progress: clamp01(p.progress) });
    } catch {
      /* a broken progress callback must never abort the ingest */
    }
  };

  throwIfCancelled(signal);
  emit({ stage: 'reading', message: 'Membaca berkas…', progress: 0.01 });

  const sourceName =
    list.length === 1 ? list[0].name : `${list[0].name} (+${list.length - 1} berkas lain)`;
  const fallbackTitle = prettifyFileName(list[0].name) || 'Kursus Baru';
  const title = (opts.title || '').trim() || fallbackTitle;

  let split: SplitResult;
  let ocrPages = 0;
  let totalPages = 0;

  const singlePdf = list.length === 1 && ingestKind(list[0].name) === 'pdf';

  if (singlePdf) {
    // -----------------------------------------------------------------------
    // Rich PDF path: text layer + font-size headings + bookmark outline.
    // -----------------------------------------------------------------------
    const file = list[0];
    emit({ stage: 'parsing', message: `Membuka ${file.name}…`, progress: P_READ_END });

    const res = await extractPdf(file, {
      enableOcr,
      ocrLangs,
      signal,
      onProgress: (p) => {
        const span = P_EXTRACT_END - P_READ_END;
        emit({
          stage: p.stage,
          message:
            p.stage === 'ocr'
              ? `Mengenali teks hasil scan (OCR) halaman ${p.page}…`
              : `Membaca halaman ${p.page} dari ${p.totalPages}…`,
          progress: P_READ_END + clamp01(p.progress) * span,
          page: p.page,
          totalPages: p.totalPages,
        });
      },
    });
    throwIfCancelled(signal);

    totalPages = res.totalPages || res.pages.length;
    const counts = countOcr(res);
    ocrPages = counts.recognized;

    if (res.scannedPageCount > 0 && !enableOcr) {
      warnings.push(
        `${res.scannedPageCount} halaman tampak hasil scan dan dilewati karena OCR dimatikan.`,
      );
    } else if (counts.empty > 0) {
      const available = await isOcrAvailable().catch(() => false);
      warnings.push(
        available
          ? `${counts.empty} halaman hasil scan tidak menghasilkan teks dan dibiarkan kosong.`
          : `OCR tidak tersedia (data bahasa gagal diunduh), sehingga ${counts.empty} halaman hasil scan dibiarkan kosong.`,
      );
    }

    if (!pagesToText(res).trim()) {
      throw new Error(
        `Tidak ada teks yang bisa dibaca dari "${file.name}". ` +
          (enableOcr
            ? 'Dokumen mungkin berupa gambar murni dan OCR gagal mengenalinya.'
            : 'Coba aktifkan OCR untuk halaman hasil scan.'),
      );
    }

    emit({ stage: 'splitting', message: 'Memecah dokumen menjadi bagian…', progress: P_EXTRACT_END });
    split = splitDocument(res, splitOptions);
  } else {
    // -----------------------------------------------------------------------
    // Generic path: extract every file to text, concatenate, split as plain text.
    // -----------------------------------------------------------------------
    const parts: string[] = [];
    const span = P_EXTRACT_END - P_READ_END;
    let pdfPages = 0;

    for (let i = 0; i < list.length; i++) {
      throwIfCancelled(signal);
      const file = list[i];
      const base = P_READ_END + (i / list.length) * span;
      const slice = span / list.length;
      const kind = ingestKind(file.name);

      emit({
        stage: 'parsing',
        message: `Membaca ${file.name} (${i + 1}/${list.length})…`,
        progress: base,
      });

      let text = '';
      try {
        if (kind === 'pdf') {
          const res = await extractPdf(file, {
            enableOcr,
            ocrLangs,
            signal,
            onProgress: (p) => {
              emit({
                stage: p.stage,
                message:
                  p.stage === 'ocr'
                    ? `OCR ${file.name} — halaman ${p.page}…`
                    : `Membaca ${file.name} — halaman ${p.page} dari ${p.totalPages}…`,
                progress: base + clamp01(p.progress) * slice,
                page: p.page,
                totalPages: p.totalPages,
              });
            },
          });
          pdfPages += res.totalPages || res.pages.length;
          const counts = countOcr(res);
          ocrPages += counts.recognized;
          if (counts.empty > 0) {
            warnings.push(`${counts.empty} halaman hasil scan di "${file.name}" dibiarkan kosong.`);
          }
          text = pagesToText(res);
        } else if (kind === 'image') {
          if (!enableOcr) {
            warnings.push(`Gambar "${file.name}" dilewati karena OCR dimatikan.`);
          } else {
            emit({
              stage: 'ocr',
              message: `OCR gambar ${file.name}…`,
              progress: base,
              page: i + 1,
              totalPages: list.length,
            });
            text = await ocrSingleImageFile(file, {
              langs: ocrLangs,
              signal,
              onProgress: (p) => {
                emit({
                  stage: 'ocr',
                  message: `OCR gambar ${file.name}…`,
                  progress: base + clamp01(p.progress) * slice,
                  page: i + 1,
                  totalPages: list.length,
                });
              },
            });
            if (text.trim()) ocrPages += 1;
            else warnings.push(`OCR tidak menemukan teks pada gambar "${file.name}".`);
          }
        } else if (kind === 'text') {
          text = await readPlainText(file);
        } else if (kind === 'doc') {
          text = await extractDocx(file);
        } else if (kind === 'slide') {
          text = await extractPptx(file);
        } else if (kind === 'sheet') {
          text = await extractXlsx(file);
        } else {
          warnings.push(`Format berkas "${file.name}" belum didukung dan dilewati.`);
        }
      } catch (err: any) {
        if (isIngestCancelled(err)) throw err;
        throwIfCancelled(signal);
        warnings.push(`Gagal membaca "${file.name}": ${err?.message || err}`);
        text = '';
      }

      if (text && text.trim()) {
        // The "# <filename>" heading lets the heading tier key off file boundaries.
        parts.push(`# ${prettifyFileName(file.name) || file.name}\n\n${text.trim()}`);
      }
    }

    throwIfCancelled(signal);
    totalPages = pdfPages > 0 ? pdfPages : list.length;

    if (parts.length === 0) {
      const supported = list.filter((f) => isSupportedIngestFile(f.name));
      if (supported.length === 0) {
        const exts = Array.from(new Set(list.map((f) => fileExtension(f.name) || '?')));
        throw new Error(
          `Format berkas ${exts.map((e) => `.${e}`).join(', ')} belum didukung. ` +
            `Gunakan PDF, gambar, TXT/MD, DOCX, PPTX, atau XLSX.`,
        );
      }
      throw new Error(
        'Tidak ada teks yang bisa dibaca dari berkas yang dipilih.' +
          (enableOcr ? '' : ' Coba aktifkan OCR untuk dokumen hasil scan.'),
      );
    }

    emit({ stage: 'splitting', message: 'Memecah dokumen menjadi bagian…', progress: P_EXTRACT_END });
    split = splitPlainText(parts.join('\n\n'), title, splitOptions);
  }

  throwIfCancelled(signal);

  // -------------------------------------------------------------------------
  // Optional: keep the original file(s) downloadable inside the course.
  // -------------------------------------------------------------------------
  const attachments: Attachment[] = [];
  if (attachFile) {
    emit({ stage: 'building', message: 'Mengunggah berkas asli…', progress: P_SPLIT_END });
    for (const file of list) {
      throwIfCancelled(signal);
      try {
        attachments.push(await uploadFile(file));
      } catch (err: any) {
        // Never a hard error: the course is still perfectly usable without it.
        warnings.push(`Berkas asli "${file.name}" gagal dilampirkan: ${err?.message || err}`);
      }
    }
  }

  throwIfCancelled(signal);
  emit({ stage: 'building', message: 'Menyusun kursus…', progress: P_BUILD_END });

  const built = buildCourseFromSplit(split, {
    title,
    category: opts.category,
    color: opts.color,
    includeQuiz,
    includeChecklist,
    attachments,
    language,
  });

  emit({ stage: 'done', message: 'Selesai.', progress: 1 });

  return {
    built,
    sourceName,
    ocrPages,
    totalPages,
    tier: split.tier,
    warnings,
  };
}
