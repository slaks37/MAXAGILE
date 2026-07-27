// ---------------------------------------------------------------------------
// OCR — browser-only, lazy-loaded fallback text recognition
//
// PRIME DIRECTIVE COMPLIANCE:
//  * tesseract.js is ONLY ever loaded through a dynamic `await import(...)`
//    inside the functions below, so it never lands in the main bundle.
//  * ONE worker is created per batch and reused for every image. Creating a
//    worker per page would re-download/re-init the language data each time and
//    is brutally slow on weak machines.
//  * The worker is ALWAYS terminated in a `finally` block.
//
// NOTE: on first use tesseract.js downloads the `*.traineddata` language files
// from a CDN (internet required once, cached afterwards). A failure there is
// surfaced as a readable Error — it must never crash the host app.
// ---------------------------------------------------------------------------

export interface OcrProgress {
  stage: 'loading' | 'recognizing';
  /** 1-based index of the image currently being recognized */
  page?: number;
  totalPages?: number;
  /** 0..1 */
  progress: number;
}

export interface OcrOptions {
  /** tesseract language codes, default ["ind", "eng"] */
  langs?: string[];
  onProgress?: (p: OcrProgress) => void;
  /** cooperative cancellation — checked between images */
  signal?: { cancelled: boolean };
}

const DEFAULT_LANGS = ['ind', 'eng'];

/** Longest side (px) an image is downscaled to before OCR — protects weak CPUs. */
const MAX_IMAGE_SIDE = 2000;

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * True when tesseract.js can be loaded in this environment.
 * Never throws — callers use this to decide whether to offer OCR at all.
 */
export async function isOcrAvailable(): Promise<boolean> {
  try {
    const mod: any = await import('tesseract.js');
    return typeof mod?.createWorker === 'function';
  } catch {
    return false;
  }
}

/**
 * Recognizes text from a list of canvases/blobs using a SINGLE shared worker.
 *
 * - Returns one string per input image, in the same order.
 * - A page that fails individually yields "" and the batch continues.
 * - Throws only when the OCR engine itself cannot be created.
 * - Honors `opts.signal.cancelled` between images (remaining entries stay "").
 */
export async function ocrImages(
  images: (HTMLCanvasElement | Blob)[],
  opts: OcrOptions = {},
): Promise<string[]> {
  const { langs, onProgress, signal } = opts;
  const total = images.length;
  const results: string[] = new Array(total).fill('');
  if (total === 0) return results;

  let mod: any;
  try {
    mod = await import('tesseract.js');
  } catch (err: any) {
    throw new Error(
      `Mesin OCR (tesseract.js) gagal dimuat: ${err?.message || err}. ` +
        `Coba muat ulang halaman atau nonaktifkan OCR.`,
    );
  }

  const createWorker = mod?.createWorker;
  if (typeof createWorker !== 'function') {
    throw new Error('Mesin OCR (tesseract.js) tidak menyediakan createWorker().');
  }

  const useLangs = langs && langs.length ? langs.slice() : DEFAULT_LANGS.slice();

  // Mutable cursor so the tesseract logger can attribute progress to a page.
  let currentIndex = 0;

  const logger = (m: any) => {
    if (!onProgress) return;
    const raw = typeof m?.progress === 'number' ? m.progress : 0;
    const status: string = typeof m?.status === 'string' ? m.status : '';
    if (status === 'recognizing text') {
      onProgress({
        stage: 'recognizing',
        page: currentIndex + 1,
        totalPages: total,
        progress: clamp01((currentIndex + clamp01(raw)) / total),
      });
    } else {
      // loading core / downloading + initializing language data
      onProgress({ stage: 'loading', totalPages: total, progress: clamp01(raw) });
    }
  };

  onProgress?.({ stage: 'loading', totalPages: total, progress: 0 });

  let worker: any = null;
  try {
    try {
      // oem 1 = LSTM_ONLY (cast: the .d.ts wants the OEM enum member)
      worker = await createWorker(useLangs, 1 as any, { logger });
    } catch (err: any) {
      throw new Error(
        `Gagal menyiapkan mesin OCR (bahasa: ${useLangs.join('+')}): ${err?.message || err}. ` +
          `Data bahasa OCR diunduh sekali dari internet — pastikan koneksi tersedia.`,
      );
    }

    for (let i = 0; i < total; i++) {
      if (signal?.cancelled) break;
      currentIndex = i;
      onProgress?.({
        stage: 'recognizing',
        page: i + 1,
        totalPages: total,
        progress: clamp01(i / total),
      });
      try {
        const res: any = await worker.recognize(images[i] as any);
        const text = res?.data?.text;
        results[i] = typeof text === 'string' ? text : '';
      } catch {
        // One bad page must not kill the batch.
        results[i] = '';
      }
    }

    if (!signal?.cancelled) {
      onProgress?.({ stage: 'recognizing', page: total, totalPages: total, progress: 1 });
    }
    return results;
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        /* ignore — teardown must never throw */
      }
    }
  }
}

/**
 * OCRs a single image file (JPG/PNG/WEBP/…) by drawing it onto a canvas first.
 * The image is downscaled so its longest side is at most 2000px.
 */
export async function ocrSingleImageFile(file: File, opts?: OcrOptions): Promise<string> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    throw new Error('OCR gambar hanya tersedia di browser.');
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err: any) {
    throw new Error(`Gagal membaca berkas gambar "${file.name}": ${err?.message || err}`);
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height) || 1;
    const scale = longest > MAX_IMAGE_SIDE ? MAX_IMAGE_SIDE / longest : 1;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context tidak tersedia di browser ini.');

    // White backdrop: transparent PNGs otherwise OCR as black-on-black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const [text] = await ocrImages([canvas], opts);

    // Free the backing store as soon as we are done.
    canvas.width = 0;
    canvas.height = 0;

    return text || '';
  } finally {
    try {
      bitmap.close();
    } catch {
      /* ignore */
    }
  }
}
