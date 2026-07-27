// ---------------------------------------------------------------------------
// Office (OOXML) text extraction — zero dependencies, 100% in-browser.
//
// DOCX/PPTX/XLSX are ZIP archives of XML parts. Instead of pulling in a ZIP
// library we implement a minimal central-directory reader and inflate the
// deflate streams with the browser-native `DecompressionStream("deflate-raw")`.
// That keeps the bundle small and the app portable (PRIME DIRECTIVE).
// ---------------------------------------------------------------------------

interface ZipEntry {
  name: string;
  /** compression method: 0 = stored, 8 = deflate */
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  /** absolute offset of the LOCAL file header */
  localHeaderOffset: number;
}

const SIG_EOCD = 0x06054b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_LOCAL = 0x04034b50;

const OFFICE_EXTENSIONS = ['docx', 'pptx', 'xlsx'];

/** True for the OOXML formats this module can parse (docx / pptx / xlsx). */
export function isOfficeFile(name: string): boolean {
  const ext = String(name || '').split('.').pop();
  if (!ext) return false;
  return OFFICE_EXTENSIONS.indexOf(ext.toLowerCase()) !== -1;
}

// --- ZIP -------------------------------------------------------------------

function findEndOfCentralDirectory(view: DataView): number {
  const len = view.byteLength;
  if (len < 22) return -1;
  const min = Math.max(0, len - 22 - 0xffff);
  for (let i = len - 22; i >= min; i--) {
    if (view.getUint32(i, true) === SIG_EOCD) return i;
  }
  return -1;
}

function readCentralDirectory(buffer: ArrayBuffer): ZipEntry[] {
  const view = new DataView(buffer);
  const eocd = findEndOfCentralDirectory(view);
  if (eocd < 0) {
    throw new Error('Berkas ini bukan arsip ZIP/Office yang valid (EOCD tidak ditemukan).');
  }

  const entryCount = view.getUint16(eocd + 10, true);
  const cdOffset = view.getUint32(eocd + 16, true);
  if (cdOffset >= view.byteLength) {
    throw new Error('Struktur arsip Office rusak (offset central directory di luar berkas).');
  }

  const decoder = new TextDecoder('utf-8');
  const entries: ZipEntry[] = [];
  let p = cdOffset;

  for (let i = 0; i < entryCount; i++) {
    if (p + 46 > view.byteLength) break;
    if (view.getUint32(p, true) !== SIG_CENTRAL) break;

    const method = view.getUint16(p + 10, true);
    const compressedSize = view.getUint32(p + 20, true);
    const uncompressedSize = view.getUint32(p + 24, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const localHeaderOffset = view.getUint32(p + 42, true);

    const nameBytes = new Uint8Array(buffer, p + 46, nameLen);
    const name = decoder.decode(nameBytes);

    entries.push({ name, method, compressedSize, uncompressedSize, localHeaderOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }

  if (!entries.length) {
    throw new Error('Arsip Office kosong atau tidak dapat dibaca.');
  }
  return entries;
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  const DS: any = (globalThis as any).DecompressionStream;
  if (typeof DS !== 'function') {
    throw new Error(
      'Peramban ini tidak mendukung DecompressionStream, sehingga berkas Office ' +
        '(.docx/.pptx/.xlsx) tidak dapat dibaca. Gunakan peramban modern (Chrome/Edge/Firefox terbaru).',
    );
  }
  const blob = new Blob([bytes as any]);
  const stream = blob.stream().pipeThrough(new DS('deflate-raw'));
  const out = await new Response(stream as any).arrayBuffer();
  return new Uint8Array(out);
}

async function readEntry(buffer: ArrayBuffer, entry: ZipEntry): Promise<Uint8Array> {
  const view = new DataView(buffer);
  const lho = entry.localHeaderOffset;
  if (lho + 30 > view.byteLength || view.getUint32(lho, true) !== SIG_LOCAL) {
    throw new Error(`Header lokal untuk "${entry.name}" tidak valid.`);
  }
  const nameLen = view.getUint16(lho + 26, true);
  const extraLen = view.getUint16(lho + 28, true);
  const dataStart = lho + 30 + nameLen + extraLen;
  if (dataStart > view.byteLength) {
    throw new Error(`Data untuk "${entry.name}" berada di luar berkas.`);
  }

  const known = entry.compressedSize > 0 && entry.compressedSize !== 0xffffffff;
  const dataEnd = known
    ? Math.min(view.byteLength, dataStart + entry.compressedSize)
    : view.byteLength;

  const raw = new Uint8Array(buffer, dataStart, Math.max(0, dataEnd - dataStart));

  if (entry.method === 0) {
    // stored
    return known ? raw : raw.slice(0, entry.uncompressedSize || raw.length);
  }
  if (entry.method === 8) {
    return await inflateRaw(raw);
  }
  throw new Error(
    `Metode kompresi ${entry.method} pada "${entry.name}" tidak didukung.`,
  );
}

async function readTextEntry(
  buffer: ArrayBuffer,
  entries: ZipEntry[],
  name: string,
): Promise<string | null> {
  const entry = entries.find((e) => e.name === name);
  if (!entry) return null;
  const bytes = await readEntry(buffer, entry);
  return new TextDecoder('utf-8').decode(bytes);
}

async function loadZip(file: File): Promise<{ buffer: ArrayBuffer; entries: ZipEntry[] }> {
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch (err: any) {
    throw new Error(`Gagal membaca berkas "${file.name}": ${err?.message || err}`);
  }
  const entries = readCentralDirectory(buffer);
  return { buffer, entries };
}

// --- XML helpers ------------------------------------------------------------

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_m, d) => {
      const code = parseInt(d, 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : '';
    })
    // must run last so escaped ampersands do not double-decode
    .replace(/&amp;/g, '&');
}

function stripTags(xml: string): string {
  return xml.replace(/<[^>]*>/g, '');
}

function tidy(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\u00a0\u200b]/g, ' ')
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function collectTagText(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    out.push(unescapeXml(stripTags(m[1] || '')));
  }
  return out;
}

// --- public extractors ------------------------------------------------------

/** Extracts plain text from a .docx (word/document.xml). */
export async function extractDocx(file: File): Promise<string> {
  const { buffer, entries } = await loadZip(file);

  let xml = await readTextEntry(buffer, entries, 'word/document.xml');
  if (xml === null) {
    // Some producers use a different main part name.
    const alt = entries.find((e) => /^word\/document\d*\.xml$/.test(e.name));
    if (alt) xml = new TextDecoder('utf-8').decode(await readEntry(buffer, alt));
  }
  if (!xml) {
    throw new Error(`"${file.name}" bukan berkas .docx yang valid (word/document.xml tidak ada).`);
  }

  const text = tidy(
    unescapeXml(
      stripTags(
        xml
          .replace(/<w:tab\b[^>]*\/?>/g, '\t')
          .replace(/<w:br\b[^>]*\/?>/g, '\n')
          .replace(/<\/w:p>/g, '\n')
          .replace(/<\/w:tr>/g, '\n'),
      ),
    ),
  );

  if (!text) {
    throw new Error(`Tidak ada teks yang dapat diambil dari "${file.name}".`);
  }
  return text;
}

/** Extracts plain text from a .pptx — one block per slide, in slide order. */
export async function extractPptx(file: File): Promise<string> {
  const { buffer, entries } = await loadZip(file);

  const slides = entries
    .map((e) => {
      const m = /^ppt\/slides\/slide(\d+)\.xml$/.exec(e.name);
      return m ? { entry: e, index: parseInt(m[1], 10) } : null;
    })
    .filter((s): s is { entry: ZipEntry; index: number } => s !== null)
    .sort((a, b) => a.index - b.index);

  if (!slides.length) {
    throw new Error(`"${file.name}" bukan berkas .pptx yang valid (tidak ada ppt/slides/slideN.xml).`);
  }

  const decoder = new TextDecoder('utf-8');
  const blocks: string[] = [];

  for (const slide of slides) {
    let xml = '';
    try {
      xml = decoder.decode(await readEntry(buffer, slide.entry));
    } catch {
      continue; // a single unreadable slide must not kill the deck
    }
    // </a:p> is a paragraph break inside a text body.
    const prepared = xml.replace(/<\/a:p>/g, '\n');
    const parts = collectTagText(prepared, 'a:t');
    const body = tidy(parts.join('\n'));
    if (body) blocks.push(body);
  }

  const text = blocks.join('\n\n').trim();
  if (!text) {
    throw new Error(`Tidak ada teks yang dapat diambil dari "${file.name}".`);
  }
  return text;
}

/** Best-effort text from a .xlsx — the shared string table (xl/sharedStrings.xml). */
export async function extractXlsx(file: File): Promise<string> {
  const { buffer, entries } = await loadZip(file);

  const xml = await readTextEntry(buffer, entries, 'xl/sharedStrings.xml');
  if (xml === null) {
    throw new Error(
      `Tidak ada teks yang dapat diambil dari "${file.name}" ` +
        `(xl/sharedStrings.xml tidak ada — kemungkinan lembar kerja hanya berisi angka atau rumus).`,
    );
  }

  // Each <si> is one cell string; it may contain several <t> runs.
  const items = collectTagText(xml, 'si');
  const values = items.length ? items : collectTagText(xml, 't');

  const text = tidy(values.map((v) => v.trim()).filter(Boolean).join('\n'));
  if (!text) {
    throw new Error(`Tidak ada teks yang dapat diambil dari "${file.name}".`);
  }
  return text;
}

/**
 * Convenience dispatcher: routes a .docx/.pptx/.xlsx File to the right
 * extractor. Throws a readable Error for unsupported extensions.
 */
export async function extractOfficeText(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'docx') return extractDocx(file);
  if (ext === 'pptx') return extractPptx(file);
  if (ext === 'xlsx') return extractXlsx(file);
  throw new Error(
    `Format "${ext || file.name}" tidak didukung. Gunakan .docx, .pptx, atau .xlsx ` +
      `(format lama .doc/.ppt/.xls harus disimpan ulang sebagai format modern).`,
  );
}
