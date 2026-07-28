import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Loader2,
  Upload,
  AlertCircle,
  AlignLeft,
  ListChecks,
  Image as ImageIcon,
  HelpCircle,
  Layers,
  Link2,
  Type as TypeIcon,
  Lightbulb,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';
import type {
  Activity,
  Attachment,
  CheckBlock,
  FillBlankBlock,
  FlashcardBlock,
  ImageBlock,
  KeypointBlock,
  LessonBlock,
  LessonBlockType,
  MatchBlock,
  ReflectBlock,
  TextBlock,
} from '../types';
import { genId, uploadFile } from '../store';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

const inputCls =
  'w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-brand-text outline-none transition focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
const labelCls =
  'mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400';
const miniLabelCls =
  'mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500';
const iconBtnCls =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-400 transition hover:border-brand-orange hover:text-brand-orange disabled:opacity-30 dark:border-slate-700 enabled:cursor-pointer';
const rowDelCls =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30 dark:hover:bg-rose-900/30 enabled:cursor-pointer';
const addRowCls =
  'inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-orange transition hover:underline cursor-pointer';

// ---------------------------------------------------------------------------
// Block metadata (icon + colour + copy)
// ---------------------------------------------------------------------------

interface BlockMeta {
  Icon: (props: { className?: string }) => React.JSX.Element;
  tile: string;
  labelKey: string;
  labelFallback: string;
  descKey: string;
  descFallback: string;
}

const BLOCK_META: Record<LessonBlockType, BlockMeta> = {
  text: {
    Icon: (p) => <AlignLeft {...p} />,
    tile: 'bg-blue-500',
    labelKey: 'lmsBlockText',
    labelFallback: 'Teks',
    descKey: 'lmsBlockTextDesc',
    descFallback: 'Paragraf penjelasan singkat untuk dibaca.',
  },
  keypoint: {
    Icon: (p) => <ListChecks {...p} />,
    tile: 'bg-brand-teal',
    labelKey: 'lmsBlockKeypoint',
    labelFallback: 'Poin Penting',
    descKey: 'lmsBlockKeypointDesc',
    descFallback: 'Daftar poin inti yang mudah diingat.',
  },
  image: {
    Icon: (p) => <ImageIcon {...p} />,
    tile: 'bg-violet-500',
    labelKey: 'lmsBlockImage',
    labelFallback: 'Gambar',
    descKey: 'lmsBlockImageDesc',
    descFallback: 'Gambar atau diagram beserta keterangannya.',
  },
  check: {
    Icon: (p) => <HelpCircle {...p} />,
    tile: 'bg-brand-orange',
    labelKey: 'lmsBlockCheck',
    labelFallback: 'Cek Pemahaman',
    descKey: 'lmsBlockCheckDesc',
    descFallback: 'Pertanyaan pilihan ganda dengan umpan balik langsung.',
  },
  flashcard: {
    Icon: (p) => <Layers {...p} />,
    tile: 'bg-amber-500',
    labelKey: 'lmsBlockFlashcard',
    labelFallback: 'Kartu Balik',
    descKey: 'lmsBlockFlashcardDesc',
    descFallback: 'Kartu yang dibalik untuk memunculkan jawaban.',
  },
  match: {
    Icon: (p) => <Link2 {...p} />,
    tile: 'bg-sky-500',
    labelKey: 'lmsBlockMatch',
    labelFallback: 'Menjodohkan',
    descKey: 'lmsBlockMatchDesc',
    descFallback: 'Pasangkan istilah dengan pengertiannya.',
  },
  fillblank: {
    Icon: (p) => <TypeIcon {...p} />,
    tile: 'bg-pink-500',
    labelKey: 'lmsBlockFillblank',
    labelFallback: 'Isi Rumpang',
    descKey: 'lmsBlockFillblankDesc',
    descFallback: 'Lengkapi kalimat dengan kata yang tepat.',
  },
  reflect: {
    Icon: (p) => <Lightbulb {...p} />,
    tile: 'bg-emerald-500',
    labelKey: 'lmsBlockReflect',
    labelFallback: 'Refleksi',
    descKey: 'lmsBlockReflectDesc',
    descFallback: 'Ajak siswa menuliskan pemikirannya sendiri.',
  },
};

const BLOCK_ORDER: LessonBlockType[] = [
  'text',
  'keypoint',
  'image',
  'check',
  'flashcard',
  'match',
  'fillblank',
  'reflect',
];

// ---------------------------------------------------------------------------
// Block factories / helpers
// ---------------------------------------------------------------------------

function emptyAttachment(): Attachment {
  return { id: genId('att'), name: '', mimeType: '', url: '', size: 0 };
}

export function makeLessonBlock(type: LessonBlockType): LessonBlock {
  const id = genId('blk');
  switch (type) {
    case 'keypoint':
      return { id, type: 'keypoint', title: '', points: [''] };
    case 'image':
      return { id, type: 'image', attachment: emptyAttachment(), caption: '' };
    case 'check': {
      const first = genId('opt');
      return {
        id,
        type: 'check',
        question: '',
        options: [
          { id: first, text: '' },
          { id: genId('opt'), text: '' },
        ],
        correctOptionId: first,
        explanation: '',
      };
    }
    case 'flashcard':
      return { id, type: 'flashcard', front: '', back: '' };
    case 'match':
      return {
        id,
        type: 'match',
        prompt: '',
        pairs: [
          { id: genId('pair'), left: '', right: '' },
          { id: genId('pair'), left: '', right: '' },
        ],
      };
    case 'fillblank':
      return { id, type: 'fillblank', sentence: '', answer: '', options: [''] };
    case 'reflect':
      return { id, type: 'reflect', prompt: '', placeholder: '' };
    case 'text':
    default:
      return { id, type: 'text', title: '', body: '' };
  }
}

function s(v: string | undefined): string {
  return (v || '').trim();
}

function isBlockEmpty(b: LessonBlock): boolean {
  switch (b.type) {
    case 'text':
      return !s(b.title) && !s(b.body);
    case 'keypoint':
      return !s(b.title) && (b.points || []).every((p) => !s(p));
    case 'image':
      return !s(b.attachment?.url) && !s(b.caption);
    case 'check':
      return !s(b.question) && (b.options || []).every((o) => !s(o.text)) && !s(b.explanation);
    case 'flashcard':
      return !s(b.front) && !s(b.back);
    case 'match':
      return !s(b.prompt) && (b.pairs || []).every((p) => !s(p.left) && !s(p.right));
    case 'fillblank':
      return !s(b.sentence) && !s(b.answer) && (b.options || []).every((o) => !s(o));
    case 'reflect':
      return !s(b.prompt) && !s(b.placeholder);
    default:
      return true;
  }
}

/** Trim strings and drop empty repeater rows. Never mutates the input. */
function cleanBlock(b: LessonBlock): LessonBlock {
  switch (b.type) {
    case 'text': {
      const out: TextBlock = { id: b.id, type: 'text', body: s(b.body) };
      if (s(b.title)) out.title = s(b.title);
      return out;
    }
    case 'keypoint': {
      const out: KeypointBlock = {
        id: b.id,
        type: 'keypoint',
        points: (b.points || []).map((p) => s(p)).filter(Boolean),
      };
      if (s(b.title)) out.title = s(b.title);
      return out;
    }
    case 'image': {
      const out: ImageBlock = { id: b.id, type: 'image', attachment: b.attachment };
      if (s(b.caption)) out.caption = s(b.caption);
      return out;
    }
    case 'check': {
      const options = (b.options || [])
        .map((o) => ({ id: o.id, text: s(o.text) }))
        .filter((o) => !!o.text);
      const stillThere = options.some((o) => o.id === b.correctOptionId);
      const out: CheckBlock = {
        id: b.id,
        type: 'check',
        question: s(b.question),
        options,
        correctOptionId: stillThere ? b.correctOptionId : '',
      };
      if (s(b.explanation)) out.explanation = s(b.explanation);
      return out;
    }
    case 'flashcard': {
      const out: FlashcardBlock = {
        id: b.id,
        type: 'flashcard',
        front: s(b.front),
        back: s(b.back),
      };
      return out;
    }
    case 'match': {
      const out: MatchBlock = {
        id: b.id,
        type: 'match',
        pairs: (b.pairs || [])
          .map((p) => ({ id: p.id, left: s(p.left), right: s(p.right) }))
          .filter((p) => !!p.left || !!p.right),
      };
      if (s(b.prompt)) out.prompt = s(b.prompt);
      return out;
    }
    case 'fillblank': {
      const answer = s(b.answer);
      const distractors = (b.options || []).map((o) => s(o)).filter(Boolean);
      const options = distractors.includes(answer) || !answer ? distractors : [answer, ...distractors];
      const out: FillBlankBlock = {
        id: b.id,
        type: 'fillblank',
        sentence: s(b.sentence),
        answer,
        options,
      };
      return out;
    }
    case 'reflect': {
      const out: ReflectBlock = { id: b.id, type: 'reflect', prompt: s(b.prompt) };
      if (s(b.placeholder)) out.placeholder = s(b.placeholder);
      return out;
    }
    default:
      return b;
  }
}

/** Returns an inline validation message, or null when the block is valid. */
function validateBlock(b: LessonBlock, t: (k: string) => string): string | null {
  switch (b.type) {
    case 'text':
      return s(b.body) ? null : tr(t, 'lmsBlockErrText', 'Isi teks belum diisi.');
    case 'keypoint':
      return (b.points || []).length > 0
        ? null
        : tr(t, 'lmsBlockErrKeypoint', 'Tambahkan minimal satu poin.');
    case 'image':
      return s(b.attachment?.url)
        ? null
        : tr(t, 'lmsBlockErrImage', 'Unggah gambarnya terlebih dahulu.');
    case 'check': {
      if (!s(b.question)) return tr(t, 'lmsBlockErrCheckQuestion', 'Pertanyaan belum diisi.');
      if ((b.options || []).length < 2)
        return tr(t, 'lmsBlockErrCheckOptions', 'Butuh minimal 2 pilihan jawaban.');
      if (!b.correctOptionId || !(b.options || []).some((o) => o.id === b.correctOptionId))
        return tr(t, 'lmsBlockErrCheckCorrect', 'Tandai satu jawaban yang benar.');
      return null;
    }
    case 'flashcard':
      return s(b.front) && s(b.back)
        ? null
        : tr(t, 'lmsBlockErrFlashcard', 'Sisi depan dan belakang kartu harus diisi.');
    case 'match': {
      const complete = (b.pairs || []).filter((p) => s(p.left) && s(p.right));
      return complete.length >= 2
        ? null
        : tr(t, 'lmsBlockErrMatch', 'Butuh minimal 2 pasangan yang lengkap (kiri & kanan).');
    }
    case 'fillblank': {
      if (!s(b.sentence).includes('___'))
        return tr(t, 'lmsBlockErrFillSentence', 'Kalimat harus memuat "___" sebagai tempat jawaban.');
      if (!s(b.answer)) return tr(t, 'lmsBlockErrFillAnswer', 'Jawaban benar belum diisi.');
      return null;
    }
    case 'reflect':
      return s(b.prompt) ? null : tr(t, 'lmsBlockErrReflect', 'Pertanyaan refleksi belum diisi.');
    default:
      return null;
  }
}

function cloneBlock(b: LessonBlock): LessonBlock {
  const c = JSON.parse(JSON.stringify(b)) as LessonBlock;
  c.id = genId('blk');
  if (c.type === 'check') {
    const map: Record<string, string> = {};
    c.options = (c.options || []).map((o) => {
      const nid = genId('opt');
      map[o.id] = nid;
      return { ...o, id: nid };
    });
    c.correctOptionId = map[c.correctOptionId] || c.options[0]?.id || '';
  }
  if (c.type === 'match') {
    c.pairs = (c.pairs || []).map((p) => ({ ...p, id: genId('pair') }));
  }
  if (c.type === 'image') {
    c.attachment = { ...c.attachment, id: genId('att') };
  }
  return c;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface LessonEditorProps {
  activity: Activity;
  onSave: (a: Activity) => void;
  onCancel: () => void;
}

export function LessonEditor({ activity, onSave, onCancel }: LessonEditorProps): React.JSX.Element {
  const { t } = useLanguage();

  const [draft, setDraft] = useState<Activity>(() => {
    const cloned = JSON.parse(JSON.stringify(activity)) as Activity;
    cloned.type = 'lesson';
    const existing = cloned.lesson?.blocks;
    cloned.lesson = {
      blocks: Array.isArray(existing) && existing.length > 0 ? existing : [makeLessonBlock('text')],
    };
    return cloned;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showChooser, setShowChooser] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const blocks: LessonBlock[] = draft.lesson?.blocks ?? [];

  function patch(p: Partial<Activity>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function setBlocks(fn: (bs: LessonBlock[]) => LessonBlock[]) {
    setDraft((d) => ({ ...d, lesson: { blocks: fn(d.lesson?.blocks ?? []) } }));
  }

  function clearError(id: string) {
    setFormError(null);
    setErrors((e) => {
      if (!e[id]) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });
  }

  /** Shallow-merge arbitrary fields into one block (union-safe by construction). */
  function patchBlock(id: string, p: Record<string, unknown>) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? ({ ...b, ...p } as unknown as LessonBlock) : b)));
    clearError(id);
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const next = bs.slice();
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return next;
    });
    setFormError(null);
  }

  function duplicateBlock(id: string) {
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      if (i < 0) return bs;
      const next = bs.slice();
      next.splice(i + 1, 0, cloneBlock(bs[i]));
      return next;
    });
    setFormError(null);
  }

  function removeBlock(id: string) {
    const block = blocks.find((b) => b.id === id);
    if (block && !isBlockEmpty(block)) {
      const ok = window.confirm(
        tr(t, 'lmsBlockDeleteConfirm', 'Hapus blok ini beserta isinya?'),
      );
      if (!ok) return;
    }
    setBlocks((bs) => bs.filter((b) => b.id !== id));
    clearError(id);
  }

  function addBlock(type: LessonBlockType) {
    setShowChooser(false);
    setFormError(null);
    setBlocks((bs) => [...bs, makeLessonBlock(type)]);
  }

  async function handleImageUpload(blockId: string, files: FileList | null) {
    const file = files && files.length > 0 ? files[0] : null;
    if (!file) return;
    setUploadErrors((e) => ({ ...e, [blockId]: '' }));
    setUploadingId(blockId);
    try {
      const att = await uploadFile(file);
      patchBlock(blockId, { attachment: att });
    } catch (err) {
      setUploadErrors((e) => ({
        ...e,
        [blockId]: err instanceof Error ? err.message : tr(t, 'lmsUploadFailed', 'Gagal mengunggah file.'),
      }));
    } finally {
      setUploadingId(null);
    }
  }

  function handleSave() {
    const nextErrors: Record<string, string> = {};
    const kept: LessonBlock[] = [];
    for (const b of blocks) {
      if (isBlockEmpty(b)) continue;
      const cleaned = cleanBlock(b);
      const err = validateBlock(cleaned, t);
      if (err) nextErrors[b.id] = err;
      else kept.push(cleaned);
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError(
        tr(t, 'lmsLessonFixErrors', 'Ada blok yang belum lengkap. Perbaiki dulu sebelum menyimpan.'),
      );
      return;
    }
    if (kept.length === 0) {
      setErrors({});
      setFormError(tr(t, 'lmsLessonNeedBlock', 'Tambahkan minimal satu blok yang berisi materi.'));
      return;
    }
    setErrors({});
    setFormError(null);
    onSave({
      ...draft,
      type: 'lesson',
      title: draft.title.trim() || tr(t, 'lmsUntitledActivity', 'Aktivitas Tanpa Judul'),
      lesson: { blocks: kept },
    });
  }

  // -------------------------------------------------------------------------
  // Per-type field sets
  // -------------------------------------------------------------------------

  function renderFields(b: LessonBlock) {
    if (b.type === 'text') {
      return (
        <div className="space-y-3">
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockTitleOpt', 'Judul (opsional)')}</label>
            <input
              className={inputCls}
              value={b.title ?? ''}
              onChange={(e) => patchBlock(b.id, { title: e.target.value })}
              placeholder={tr(t, 'lmsBlockTitlePlaceholder', 'Contoh: Apa itu Scrum?')}
            />
          </div>
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockBody', 'Isi Teks')}</label>
            <textarea
              className={`${inputCls} min-h-[110px] resize-y leading-relaxed`}
              value={b.body}
              onChange={(e) => patchBlock(b.id, { body: e.target.value })}
              placeholder={tr(t, 'lmsBlockBodyPlaceholder', 'Tulis penjelasan singkat, 2-4 kalimat saja.')}
            />
          </div>
        </div>
      );
    }

    if (b.type === 'keypoint') {
      const points = b.points || [];
      return (
        <div className="space-y-3">
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockTitleOpt', 'Judul (opsional)')}</label>
            <input
              className={inputCls}
              value={b.title ?? ''}
              onChange={(e) => patchBlock(b.id, { title: e.target.value })}
              placeholder={tr(t, 'lmsBlockKeypointTitlePlaceholder', 'Contoh: 3 Pilar Scrum')}
            />
          </div>
          <div className="space-y-2">
            <label className={miniLabelCls}>{tr(t, 'lmsBlockPoints', 'Poin')}</label>
            {points.map((p, i) => (
              <div key={`${b.id}-p-${i}`} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-center text-xs font-extrabold text-brand-teal">{i + 1}</span>
                <input
                  className={inputCls}
                  value={p}
                  onChange={(e) =>
                    patchBlock(b.id, {
                      points: points.map((x, xi) => (xi === i ? e.target.value : x)),
                    })
                  }
                  placeholder={tr(t, 'lmsBlockPointPlaceholder', 'Tulis satu poin inti')}
                />
                <button
                  type="button"
                  disabled={points.length <= 1}
                  onClick={() => patchBlock(b.id, { points: points.filter((_, xi) => xi !== i) })}
                  className={rowDelCls}
                  aria-label={tr(t, 'lmsRemove', 'Hapus')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => patchBlock(b.id, { points: [...points, ''] })}
              className={addRowCls}
            >
              <Plus className="h-3.5 w-3.5" /> {tr(t, 'lmsBlockAddPoint', 'Tambah Poin')}
            </button>
          </div>
        </div>
      );
    }

    if (b.type === 'image') {
      const hasImage = !!s(b.attachment?.url);
      const busy = uploadingId === b.id;
      const upErr = uploadErrors[b.id];
      return (
        <div className="space-y-3">
          {hasImage ? (
            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <img
                src={b.attachment.url}
                alt={b.attachment.name || ''}
                className="mx-auto max-h-52 w-auto max-w-full rounded-xl object-contain"
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="min-w-0 flex-1 truncate text-xs font-bold text-slate-500 dark:text-slate-400">
                  {b.attachment.name || tr(t, 'lmsBlockImageFile', 'Gambar')}
                </p>
                <button
                  type="button"
                  onClick={() => patchBlock(b.id, { attachment: emptyAttachment() })}
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-slate-200 px-2.5 py-1 text-xs font-extrabold text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> {tr(t, 'lmsRemove', 'Hapus')}
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-brand-orange dark:border-slate-600 dark:bg-slate-800">
              {busy ? (
                <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
              ) : (
                <Upload className="h-6 w-6 text-slate-400" />
              )}
              <span className="text-sm font-bold text-brand-text dark:text-slate-200">
                {tr(t, 'lmsBlockUploadImage', 'Unggah Gambar')}
              </span>
              <span className="text-xs text-slate-400">
                {tr(t, 'lmsBlockUploadImageHint', 'PNG, JPG, atau WEBP (maks 25MB)')}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={busy}
                onChange={(e) => handleImageUpload(b.id, e.target.files)}
              />
            </label>
          )}
          {upErr && <p className="text-xs font-semibold text-rose-500">{upErr}</p>}
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockCaption', 'Keterangan (opsional)')}</label>
            <input
              className={inputCls}
              value={b.caption ?? ''}
              onChange={(e) => patchBlock(b.id, { caption: e.target.value })}
              placeholder={tr(t, 'lmsBlockCaptionPlaceholder', 'Penjelasan singkat gambar')}
            />
          </div>
        </div>
      );
    }

    if (b.type === 'check') {
      const options = b.options || [];
      return (
        <div className="space-y-3">
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockQuestion', 'Pertanyaan')}</label>
            <input
              className={inputCls}
              value={b.question}
              onChange={(e) => patchBlock(b.id, { question: e.target.value })}
              placeholder={tr(t, 'lmsBlockQuestionPlaceholder', 'Tulis pertanyaan singkat')}
            />
          </div>
          <div className="space-y-2">
            <label className={miniLabelCls}>
              {tr(t, 'lmsBlockOptionsHint', 'Pilihan (klik lingkaran untuk menandai jawaban benar)')}
            </label>
            {options.map((opt) => {
              const isCorrect = b.correctOptionId === opt.id;
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => patchBlock(b.id, { correctOptionId: opt.id })}
                    className="shrink-0 text-slate-400 transition hover:text-brand-teal cursor-pointer"
                    title={tr(t, 'lmsMarkCorrect', 'Tandai sebagai jawaban benar')}
                    aria-label={tr(t, 'lmsMarkCorrect', 'Tandai sebagai jawaban benar')}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-brand-teal" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    className={inputCls}
                    value={opt.text}
                    onChange={(e) =>
                      patchBlock(b.id, {
                        options: options.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o)),
                      })
                    }
                    placeholder={tr(t, 'lmsOptionText', 'Pilihan jawaban')}
                  />
                  <button
                    type="button"
                    disabled={options.length <= 2}
                    onClick={() => {
                      const remaining = options.filter((o) => o.id !== opt.id);
                      patchBlock(b.id, {
                        options: remaining,
                        correctOptionId:
                          b.correctOptionId === opt.id ? remaining[0]?.id ?? '' : b.correctOptionId,
                      });
                    }}
                    className={rowDelCls}
                    aria-label={tr(t, 'lmsRemove', 'Hapus')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => patchBlock(b.id, { options: [...options, { id: genId('opt'), text: '' }] })}
              className={addRowCls}
            >
              <Plus className="h-3.5 w-3.5" /> {tr(t, 'lmsAddOption', 'Tambah Pilihan')}
            </button>
          </div>
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockExplanation', 'Penjelasan (opsional)')}</label>
            <textarea
              className={`${inputCls} min-h-[70px] resize-y`}
              value={b.explanation ?? ''}
              onChange={(e) => patchBlock(b.id, { explanation: e.target.value })}
              placeholder={tr(t, 'lmsBlockExplanationPlaceholder', 'Muncul setelah siswa menjawab')}
            />
          </div>
        </div>
      );
    }

    if (b.type === 'flashcard') {
      return (
        <div className="space-y-3">
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockFront', 'Sisi Depan')}</label>
            <input
              className={inputCls}
              value={b.front}
              onChange={(e) => patchBlock(b.id, { front: e.target.value })}
              placeholder={tr(t, 'lmsBlockFrontPlaceholder', 'Istilah atau pertanyaan')}
            />
          </div>
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockBack', 'Sisi Belakang')}</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={b.back}
              onChange={(e) => patchBlock(b.id, { back: e.target.value })}
              placeholder={tr(t, 'lmsBlockBackPlaceholder', 'Jawaban atau pengertiannya')}
            />
          </div>
        </div>
      );
    }

    if (b.type === 'match') {
      const pairs = b.pairs || [];
      return (
        <div className="space-y-3">
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockPrompt', 'Perintah (opsional)')}</label>
            <input
              className={inputCls}
              value={b.prompt ?? ''}
              onChange={(e) => patchBlock(b.id, { prompt: e.target.value })}
              placeholder={tr(t, 'lmsBlockMatchPromptPlaceholder', 'Contoh: Jodohkan peran dengan tugasnya')}
            />
          </div>
          <div className="space-y-2">
            <label className={miniLabelCls}>{tr(t, 'lmsBlockPairs', 'Pasangan')}</label>
            {pairs.map((p, i) => (
              <div
                key={p.id}
                className="rounded-2xl border-2 border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-2.5 w-4 shrink-0 text-center text-xs font-extrabold text-sky-500">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2 sm:flex sm:items-center sm:gap-2 sm:space-y-0">
                    <input
                      className={inputCls}
                      value={p.left}
                      onChange={(e) =>
                        patchBlock(b.id, {
                          pairs: pairs.map((x) => (x.id === p.id ? { ...x, left: e.target.value } : x)),
                        })
                      }
                      placeholder={tr(t, 'lmsBlockPairLeft', 'Kiri (istilah)')}
                    />
                    <Link2 className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
                    <input
                      className={inputCls}
                      value={p.right}
                      onChange={(e) =>
                        patchBlock(b.id, {
                          pairs: pairs.map((x) => (x.id === p.id ? { ...x, right: e.target.value } : x)),
                        })
                      }
                      placeholder={tr(t, 'lmsBlockPairRight', 'Kanan (pengertian)')}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={pairs.length <= 2}
                    onClick={() => patchBlock(b.id, { pairs: pairs.filter((x) => x.id !== p.id) })}
                    className={rowDelCls}
                    aria-label={tr(t, 'lmsRemove', 'Hapus')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                patchBlock(b.id, { pairs: [...pairs, { id: genId('pair'), left: '', right: '' }] })
              }
              className={addRowCls}
            >
              <Plus className="h-3.5 w-3.5" /> {tr(t, 'lmsBlockAddPair', 'Tambah Pasangan')}
            </button>
          </div>
        </div>
      );
    }

    if (b.type === 'fillblank') {
      const options = b.options || [];
      return (
        <div className="space-y-3">
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockSentence', 'Kalimat')}</label>
            <textarea
              className={`${inputCls} min-h-[70px] resize-y`}
              value={b.sentence}
              onChange={(e) => patchBlock(b.id, { sentence: e.target.value })}
              placeholder={tr(t, 'lmsBlockSentencePlaceholder', 'Sprint Review dilakukan pada ___ sprint.')}
            />
            <p className="mt-1 text-[11px] font-semibold text-slate-400">
              {tr(t, 'lmsBlockSentenceHint', 'Gunakan ___ (tiga garis bawah) sebagai tempat jawaban.')}
            </p>
          </div>
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockAnswer', 'Jawaban Benar')}</label>
            <input
              className={inputCls}
              value={b.answer}
              onChange={(e) => patchBlock(b.id, { answer: e.target.value })}
              placeholder={tr(t, 'lmsBlockAnswerPlaceholder', 'Contoh: akhir')}
            />
          </div>
          <div className="space-y-2">
            <label className={miniLabelCls}>{tr(t, 'lmsBlockDistractors', 'Pilihan Pengecoh')}</label>
            {options.map((o, i) => (
              <div key={`${b.id}-o-${i}`} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  value={o}
                  onChange={(e) =>
                    patchBlock(b.id, { options: options.map((x, xi) => (xi === i ? e.target.value : x)) })
                  }
                  placeholder={tr(t, 'lmsBlockDistractorPlaceholder', 'Kata lain yang mirip')}
                />
                <button
                  type="button"
                  onClick={() => patchBlock(b.id, { options: options.filter((_, xi) => xi !== i) })}
                  className={rowDelCls}
                  aria-label={tr(t, 'lmsRemove', 'Hapus')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => patchBlock(b.id, { options: [...options, ''] })}
              className={addRowCls}
            >
              <Plus className="h-3.5 w-3.5" /> {tr(t, 'lmsBlockAddDistractor', 'Tambah Pengecoh')}
            </button>
          </div>
        </div>
      );
    }

    if (b.type === 'reflect') {
      return (
        <div className="space-y-3">
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockReflectPrompt', 'Pertanyaan Refleksi')}</label>
            <textarea
              className={`${inputCls} min-h-[70px] resize-y`}
              value={b.prompt}
              onChange={(e) => patchBlock(b.id, { prompt: e.target.value })}
              placeholder={tr(t, 'lmsBlockReflectPromptPlaceholder', 'Apa satu hal yang akan kamu terapkan besok?')}
            />
          </div>
          <div>
            <label className={miniLabelCls}>{tr(t, 'lmsBlockPlaceholder', 'Teks Bayangan (opsional)')}</label>
            <input
              className={inputCls}
              value={b.placeholder ?? ''}
              onChange={(e) => patchBlock(b.id, { placeholder: e.target.value })}
              placeholder={tr(t, 'lmsBlockPlaceholderHint', 'Contoh: Tulis jawabanmu di sini...')}
            />
          </div>
        </div>
      );
    }

    return <div />;
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-4 animate-in fade-in">
      <div className="my-4 w-full max-w-3xl rounded-3xl border-2 border-b-4 border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 sm:my-6">
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-400">
                {tr(t, 'lmsActLesson', 'Materi Interaktif')}
              </p>
              <h3 className="truncate text-lg font-extrabold text-brand-text dark:text-slate-100">
                {tr(t, 'lmsEditLesson', 'Susun Materi Interaktif')}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
            aria-label={tr(t, 'lmsCancel', 'Batal')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="max-h-[62vh] space-y-5 overflow-y-auto p-4 sm:p-5">
          <div>
            <label className={labelCls}>{tr(t, 'lmsActivityTitle', 'Judul Aktivitas')}</label>
            <input
              className={inputCls}
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder={tr(t, 'lmsActivityTitlePlaceholder', 'Contoh: Pengantar Manajemen')}
            />
          </div>
          <div>
            <label className={labelCls}>{tr(t, 'lmsActivityDesc', 'Deskripsi Singkat (opsional)')}</label>
            <input
              className={inputCls}
              value={draft.description ?? ''}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder={tr(t, 'lmsActivityDescPlaceholder', 'Keterangan singkat di bawah judul')}
            />
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-700">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-brand-text dark:text-slate-100">
                {tr(t, 'lmsLessonBlocks', 'Blok Materi')}
              </p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {blocks.length} {tr(t, 'lmsLessonBlockUnit', 'blok')}
              </span>
            </div>

            {blocks.map((b, i) => {
              const meta = BLOCK_META[b.type] ?? BLOCK_META.text;
              const err = errors[b.id];
              const empty = isBlockEmpty(b);
              return (
                <div
                  key={b.id}
                  className={`rounded-3xl border-2 bg-slate-50 p-3 transition dark:bg-slate-800/50 sm:p-4 ${
                    err
                      ? 'border-rose-300 dark:border-rose-700'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* block header */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-400">{i + 1}</span>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white ${meta.tile}`}
                    >
                      <meta.Icon className="h-4 w-4" />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-brand-text dark:text-slate-100">
                      {tr(t, meta.labelKey, meta.labelFallback)}
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => moveBlock(b.id, -1)}
                        className={iconBtnCls}
                        aria-label={tr(t, 'lmsMoveUp', 'Naikkan')}
                        title={tr(t, 'lmsMoveUp', 'Naikkan')}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={i === blocks.length - 1}
                        onClick={() => moveBlock(b.id, 1)}
                        className={iconBtnCls}
                        aria-label={tr(t, 'lmsMoveDown', 'Turunkan')}
                        title={tr(t, 'lmsMoveDown', 'Turunkan')}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateBlock(b.id)}
                        className={iconBtnCls}
                        aria-label={tr(t, 'lmsDuplicate', 'Gandakan')}
                        title={tr(t, 'lmsDuplicate', 'Gandakan')}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(b.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-400 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
                        aria-label={tr(t, 'lmsRemove', 'Hapus')}
                        title={tr(t, 'lmsRemove', 'Hapus')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {renderFields(b)}

                  {err && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{err}</span>
                    </p>
                  )}
                  {!err && empty && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {tr(t, 'lmsBlockEmptyHint', 'Blok ini masih kosong dan tidak akan disimpan.')}
                      </span>
                    </p>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setShowChooser(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-extrabold text-slate-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-600 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {tr(t, 'lmsAddBlock', 'Tambah Blok')}
            </button>

            {formError && (
              <p className="flex items-start gap-1.5 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{formError}</span>
              </p>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-4 dark:border-slate-700 sm:p-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border-2 border-b-4 border-slate-300 bg-white px-5 py-2.5 font-extrabold text-brand-text transition active:translate-y-[2px] active:border-b-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
          >
            {tr(t, 'lmsCancel', 'Batal')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl border-2 border-b-4 border-brand-orange bg-brand-orange px-6 py-2.5 font-extrabold text-white transition active:translate-y-[2px] active:border-b-2 cursor-pointer"
          >
            {tr(t, 'lmsSave', 'Simpan')}
          </button>
        </div>
      </div>

      {/* block chooser */}
      {showChooser && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 animate-in fade-in sm:p-4"
          onClick={() => setShowChooser(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h4 className="text-lg font-extrabold text-brand-text dark:text-slate-100">
                {tr(t, 'lmsPickBlockType', 'Pilih Jenis Blok')}
              </h4>
              <button
                type="button"
                onClick={() => setShowChooser(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
                aria-label={tr(t, 'lmsCancel', 'Batal')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BLOCK_ORDER.map((type) => {
                const meta = BLOCK_META[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="flex items-start gap-3 rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-brand-orange active:translate-y-[2px] active:border-b-2 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white ${meta.tile}`}
                    >
                      <meta.Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-brand-text dark:text-slate-100">
                        {tr(t, meta.labelKey, meta.labelFallback)}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400">
                        {tr(t, meta.descKey, meta.descFallback)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
