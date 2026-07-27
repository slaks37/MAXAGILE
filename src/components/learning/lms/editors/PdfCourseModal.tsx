// ---------------------------------------------------------------------------
// PdfCourseModal — the full document-to-course ingestion wizard.
//
// Everything runs IN THE BROWSER: no /api/split-pdf, no PyMuPDF, no Python.
// pdf.js and tesseract.js are pulled in lazily by ./ingest (dynamic imports
// inside the extraction functions), so opening this modal costs nothing until
// the user actually presses "process".
//
// Step 1 pick -> Step 2 processing -> Step 3 preview -> save.
// ---------------------------------------------------------------------------

import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FilePlus,
  HelpCircle,
  Layers,
  Loader2,
  Paperclip,
  RotateCcw,
  ScanText,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { Course, Section } from '../types';
import { formatBytes } from '../store';
import { GRADIENTS } from '../theme';
import { useLanguage } from '../../../../i18n/LanguageContext';
import {
  INGEST_ACCEPT,
  ingestFiles,
  isIngestCancelled,
  isSupportedIngestFile,
  prettifyFileName,
  type IngestProgress,
  type IngestResult,
} from '../ingest';

export interface PdfCourseModalProps {
  onSaveCourse: (created: Course) => void;
  onClose: () => void;
}

type WizardStep = 'pick' | 'processing' | 'preview';

const DEFAULT_CATEGORY = 'Umum';

export function PdfCourseModal({ onSaveCourse, onClose }: PdfCourseModalProps) {
  const { t, language } = useLanguage();

  /** t() echoes the key back when a translation is missing — fall back to Indonesian copy. */
  const tr = (key: string, fallback: string): string => {
    const value = t(key);
    return !value || value === key ? fallback : value;
  };

  const [step, setStep] = useState<WizardStep>('pick');
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  // options
  const [title, setTitle] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [color, setColor] = useState(GRADIENTS[0]);
  const [enableOcr, setEnableOcr] = useState(true);
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [includeChecklist, setIncludeChecklist] = useState(true);
  const [attachFile, setAttachFile] = useState(true);

  // processing
  const [progress, setProgress] = useState<IngestProgress>({
    stage: 'reading',
    message: '',
    progress: 0,
  });
  const signalRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  // results
  const [result, setResult] = useState<IngestResult | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // -------------------------------------------------------------------------
  // File selection
  // -------------------------------------------------------------------------

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    setErrorMsg('');
    const next = [...files];
    for (const f of incoming) {
      if (!next.some((e) => e.name === f.name && e.size === f.size)) next.push(f);
    }
    setFiles(next);
    if (!titleTouched && next.length > 0) {
      setTitle(prettifyFileName(next[0].name));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer?.files || []));
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const unsupported = useMemo(
    () => files.filter((f) => !isSupportedIngestFile(f.name)).map((f) => f.name),
    [files],
  );

  // -------------------------------------------------------------------------
  // Run
  // -------------------------------------------------------------------------

  const handleStart = async () => {
    if (files.length === 0) return;
    signalRef.current = { cancelled: false };
    setErrorMsg('');
    setResult(null);
    setRemovedIds([]);
    setProgress({
      stage: 'reading',
      message: tr('ingestStageReading', 'Membaca berkas…'),
      progress: 0,
    });
    setStep('processing');

    try {
      const res = await ingestFiles(files, {
        title: title.trim() || undefined,
        category: category.trim() || DEFAULT_CATEGORY,
        color,
        enableOcr,
        includeQuiz,
        includeChecklist,
        attachFile,
        language: language === 'en' ? 'en' : 'id',
        signal: signalRef.current,
        onProgress: (p) => setProgress(p),
      });
      setResult(res);
      setTitle(res.built.course.title);
      setStep('preview');
    } catch (err: any) {
      if (isIngestCancelled(err)) {
        setStep('pick');
        return;
      }
      setErrorMsg(err?.message || tr('ingestErrorGeneric', 'Gagal memproses dokumen.'));
      setStep('pick');
    }
  };

  const handleCancelRun = () => {
    signalRef.current.cancelled = true;
    setProgress((p) => ({
      ...p,
      message: tr('ingestCancelling', 'Membatalkan…'),
    }));
  };

  const handleRestart = () => {
    signalRef.current.cancelled = true;
    setResult(null);
    setRemovedIds([]);
    setErrorMsg('');
    setStep('pick');
  };

  // -------------------------------------------------------------------------
  // Preview derived data
  // -------------------------------------------------------------------------

  const keptSections: Section[] = useMemo(() => {
    const all = result?.built.course.sections || [];
    return all.filter((s) => !removedIds.includes(s.id));
  }, [result, removedIds]);

  const previewStats = useMemo(() => {
    let activities = 0;
    let quizQuestions = 0;
    for (const s of keptSections) {
      activities += s.activities.length;
      for (const a of s.activities) quizQuestions += a.quiz?.questions.length || 0;
    }
    return {
      sections: keptSections.length,
      activities,
      quizQuestions,
      words: result?.built.stats.words || 0,
    };
  }, [keptSections, result]);

  const tierLabel = (tier: string): string => {
    if (tier === 'toc') return tr('ingestTierToc', 'Daftar isi PDF');
    if (tier === 'headings') return tr('ingestTierHeadings', 'Deteksi judul');
    return tr('ingestTierReadingTime', 'Waktu baca');
  };

  const ocrWarning = useMemo(
    () => (result?.warnings || []).some((w) => /ocr/i.test(w)),
    [result],
  );

  const handleSave = async () => {
    if (!result || keptSections.length === 0 || saving) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const course: Course = {
        ...result.built.course,
        title: title.trim() || result.built.course.title,
        category: category.trim() || DEFAULT_CATEGORY,
        color,
        sections: keptSections,
      };
      // The host (LearningHub) persists via createCourse and refreshes the
      // dashboard — calling createCourse here too would create a duplicate.
      await Promise.resolve(onSaveCourse(course));
    } catch (err: any) {
      setErrorMsg(err?.message || tr('ingestSaveFailed', 'Gagal menyimpan kursus.'));
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const stageMessage = (): string => {
    if (progress.message) return progress.message;
    switch (progress.stage) {
      case 'reading':
        return tr('ingestStageReading', 'Membaca berkas…');
      case 'parsing':
        return tr('ingestStageParsing', 'Menganalisis dokumen…');
      case 'ocr':
        return tr('ingestStageOcr', 'Mengenali teks hasil scan (OCR)…');
      case 'splitting':
        return tr('ingestStageSplitting', 'Memecah dokumen menjadi bagian…');
      case 'building':
        return tr('ingestStageBuilding', 'Menyusun kursus…');
      default:
        return tr('ingestStageDone', 'Selesai.');
    }
  };

  const pct = Math.round(Math.max(0, Math.min(1, progress.progress)) * 100);

  // -------------------------------------------------------------------------

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 animate-in fade-in"
      onClick={step === 'processing' ? undefined : onClose}
    >
      <div
        className="my-8 w-full max-w-2xl rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 dark:border-slate-700 dark:bg-slate-900"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* ---------------- Header ---------------- */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-teal text-white shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-extrabold text-brand-text dark:text-slate-100">
                {tr('ingestTitle', 'Dokumen jadi Kursus')}
              </h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {tr(
                  'ingestSubtitle',
                  'PDF, gambar, TXT/MD, DOCX, PPTX, XLSX — diproses langsung di browser.',
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={step === 'processing'}
            aria-label={tr('ingestClose', 'Tutup')}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 disabled:opacity-40 dark:border-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---------------- Stepper ---------------- */}
        <div className="flex items-center gap-2 pt-4">
          {(
            [
              ['pick', tr('ingestStep1', 'Pilih berkas')],
              ['processing', tr('ingestStep2', 'Proses')],
              ['preview', tr('ingestStep3', 'Pratinjau')],
            ] as [WizardStep, string][]
          ).map(([key, label], i) => {
            const order: WizardStep[] = ['pick', 'processing', 'preview'];
            const active = order.indexOf(step) >= i;
            return (
              <div key={key} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                    active
                      ? 'bg-brand-orange text-brand-text'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`truncate text-[11px] font-extrabold ${
                    active ? 'text-brand-text dark:text-slate-100' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
                {i < 2 && <span className="h-0.5 flex-1 rounded bg-slate-200 dark:bg-slate-800" />}
              </div>
            );
          })}
        </div>

        <div className="space-y-5 py-5">
          {/* ================= STEP 1 — PICK ================= */}
          {step === 'pick' && (
            <div className="space-y-5 animate-in fade-in">
              <div
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
                  dragging
                    ? 'border-brand-orange bg-brand-orange/5'
                    : 'border-slate-300 bg-slate-50 hover:border-brand-orange dark:border-slate-700 dark:bg-slate-900/60'
                }`}
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-teal shadow-md dark:bg-slate-800">
                  <FilePlus className="h-7 w-7" />
                </div>
                <h4 className="text-base font-extrabold text-brand-text dark:text-slate-100">
                  {tr('ingestDropTitle', 'Tarik & lepas berkas di sini')}
                </h4>
                <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  {tr(
                    'ingestDropHint',
                    'Mendukung PDF, gambar (PNG/JPG/WEBP/TIFF), TXT, MD, DOCX, PPTX, dan XLSX.',
                  )}
                </p>
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-brand-teal hover:text-brand-teal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Upload className="h-4 w-4" />
                  {tr('ingestPickFile', 'Pilih berkas')}
                  <input
                    type="file"
                    multiple
                    accept={INGEST_ACCEPT}
                    onChange={handlePick}
                    className="hidden"
                  />
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    <span>
                      {tr('ingestFilesChosen', 'Berkas terpilih')} ({files.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="cursor-pointer text-rose-500 hover:underline"
                    >
                      {tr('ingestClearAll', 'Hapus semua')}
                    </button>
                  </div>
                  <div className="custom-scrollbar max-h-36 space-y-2 overflow-y-auto pr-1">
                    {files.map((f, i) => (
                      <div
                        key={`${f.name}-${f.size}-${i}`}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Paperclip
                            className={`h-4 w-4 shrink-0 ${
                              isSupportedIngestFile(f.name) ? 'text-brand-teal' : 'text-amber-500'
                            }`}
                          />
                          <span className="truncate font-extrabold text-slate-800 dark:text-slate-200">
                            {f.name}
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {formatBytes(f.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          aria-label={tr('ingestRemoveFile', 'Hapus berkas')}
                          className="cursor-pointer p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {unsupported.length > 0 && (
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      {tr('ingestUnsupportedNotice', 'Format berikut akan dilewati:')}{' '}
                      {unsupported.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Course meta */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    {tr('ingestCourseTitle', 'Judul kursus')}
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setTitle(e.target.value);
                      setTitleTouched(true);
                    }}
                    placeholder={tr('ingestCourseTitlePlaceholder', 'Otomatis dari nama berkas')}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-brand-teal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    {tr('ingestCategory', 'Kategori')}
                  </span>
                  <input
                    type="text"
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCategory(e.target.value)
                    }
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-brand-teal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
              </div>

              <div>
                <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                  {tr('ingestColor', 'Warna kursus')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setColor(g)}
                      aria-label={g}
                      className={`h-9 w-9 cursor-pointer rounded-xl bg-gradient-to-br ${g} transition ${
                        color === g
                          ? 'ring-2 ring-brand-text ring-offset-2 dark:ring-slate-100 dark:ring-offset-slate-900'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Toggle
                  checked={enableOcr}
                  onChange={setEnableOcr}
                  label={tr('ingestOptOcr', 'Aktifkan OCR untuk halaman hasil scan')}
                  hint={tr(
                    'ingestOptOcrHint',
                    'Hanya dipakai untuk halaman tanpa teks. Lambat di komputer lemah.',
                  )}
                />
                <Toggle
                  checked={includeQuiz}
                  onChange={setIncludeQuiz}
                  label={tr('ingestOptQuiz', 'Buat kuis otomatis')}
                />
                <Toggle
                  checked={includeChecklist}
                  onChange={setIncludeChecklist}
                  label={tr('ingestOptChecklist', 'Buat ringkasan checklist')}
                />
                <Toggle
                  checked={attachFile}
                  onChange={setAttachFile}
                  label={tr('ingestOptAttach', 'Lampirkan file asli')}
                />
              </div>

              {errorMsg && (
                <div className="flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-rose-700 dark:text-rose-300">
                      {tr('ingestError', 'Gagal memproses dokumen')}
                    </p>
                    <p className="mt-1 break-words text-[11px] text-rose-600 dark:text-rose-400">
                      {errorMsg}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleStart}
                disabled={files.length === 0}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange py-3.5 text-sm font-extrabold text-brand-text shadow transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {errorMsg
                  ? tr('ingestRetry', 'Coba lagi')
                  : `${tr('ingestStart', 'Proses jadi kursus')}${
                      files.length > 0 ? ` (${files.length})` : ''
                    }`}
              </button>
            </div>
          )}

          {/* ================= STEP 2 — PROCESSING ================= */}
          {step === 'processing' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  {progress.stage === 'ocr' ? (
                    <ScanText className="h-6 w-6 shrink-0 animate-pulse text-brand-teal" />
                  ) : (
                    <Loader2 className="h-6 w-6 shrink-0 animate-spin text-brand-teal" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-brand-text dark:text-slate-100">
                      {stageMessage()}
                    </p>
                    {progress.stage === 'ocr' && progress.totalPages ? (
                      <p className="mt-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {tr('ingestOcrPageOf', 'Halaman')} {progress.page ?? 0}{' '}
                        {tr('ingestOcrPageOfMid', 'dari')} {progress.totalPages}
                        {' — '}
                        {tr('ingestOcrSlow', 'OCR memakan waktu, mohon tunggu.')}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-sm font-black text-brand-text dark:text-slate-100">
                    {pct}%
                  </span>
                </div>

                <div className="mt-4 h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-orange to-amber-400 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelRun}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-slate-300 bg-white py-3 text-xs font-extrabold text-slate-700 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <X className="h-4 w-4" />
                {tr('ingestCancel', 'Batalkan')}
              </button>
            </div>
          )}

          {/* ================= STEP 3 — PREVIEW ================= */}
          {step === 'preview' && result && (
            <div className="space-y-5 animate-in fade-in">
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {tr('ingestPreviewReady', 'Kursus siap disimpan')}
                </div>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    {tr('ingestCourseTitle', 'Judul kursus')}
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-extrabold text-brand-text outline-none transition focus:border-brand-teal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
                <p className="mt-2 truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {tr('ingestSource', 'Sumber')}: {result.sourceName}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                <StatTile
                  icon={<Layers className="mx-auto mb-1 h-5 w-5 text-brand-teal" />}
                  value={previewStats.sections}
                  label={tr('ingestStatSections', 'Bagian')}
                />
                <StatTile
                  icon={<BookOpen className="mx-auto mb-1 h-5 w-5 text-emerald-500" />}
                  value={previewStats.activities}
                  label={tr('ingestStatActivities', 'Aktivitas')}
                />
                <StatTile
                  icon={<HelpCircle className="mx-auto mb-1 h-5 w-5 text-violet-500" />}
                  value={previewStats.quizQuestions}
                  label={tr('ingestStatQuiz', 'Soal kuis')}
                />
                <StatTile
                  icon={<ScanText className="mx-auto mb-1 h-5 w-5 text-amber-500" />}
                  value={result.ocrPages}
                  label={tr('ingestStatOcr', 'Halaman OCR')}
                />
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {tr('ingestStatWords', 'Kata')}: {previewStats.words.toLocaleString()}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {tr('ingestStatTier', 'Metode pemecahan')}: {tierLabel(result.tier)}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {tr('ingestStatPages', 'Halaman')}: {result.totalPages}
                </span>
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                  <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    {ocrWarning
                      ? tr('ingestOcrUnavailable', 'Catatan OCR')
                      : tr('ingestWarnings', 'Catatan')}
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px] text-amber-800 dark:text-amber-300">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Outline */}
              <div className="space-y-2">
                <span className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                  {tr('ingestOutline', 'Struktur kursus')}
                </span>
                <div className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1">
                  {keptSections.map((sec, i) => (
                    <div
                      key={sec.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[10px] font-black text-brand-text">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-brand-text dark:text-slate-200">
                              {sec.title}
                            </p>
                            {sec.summary && (
                              <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                                {sec.summary}
                              </p>
                            )}
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {sec.activities.map((a) => (
                                <span
                                  key={a.id}
                                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  {a.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRemovedIds((prev) => [...prev, sec.id])}
                          disabled={keptSections.length <= 1}
                          aria-label={tr('ingestRemoveSection', 'Hapus bagian')}
                          className="shrink-0 cursor-pointer p-1 text-slate-400 transition hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {removedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRemovedIds([])}
                    className="cursor-pointer text-[11px] font-bold text-brand-teal hover:underline"
                  >
                    {tr('ingestRestoreSections', 'Kembalikan bagian yang dihapus')} (
                    {removedIds.length})
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <p className="min-w-0 break-words text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    {errorMsg}
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleRestart}
                  disabled={saving}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 transition hover:-translate-y-0.5 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  {tr('ingestRestart', 'Ulangi')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || keptSections.length === 0}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-6 py-2.5 text-xs font-extrabold text-brand-text shadow transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tr('ingestSaving', 'Menyimpan…')}
                    </>
                  ) : (
                    <>
                      {tr('ingestSave', 'Simpan Kursus')}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 text-left transition ${
        checked
          ? 'border-brand-teal bg-brand-teal/5 dark:border-brand-teal dark:bg-brand-teal/10'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
          checked
            ? 'border-brand-teal bg-brand-teal text-white'
            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-extrabold text-brand-text dark:text-slate-100">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-[10px] leading-snug text-slate-500 dark:text-slate-400">
            {hint}
          </span>
        )}
      </span>
    </button>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
      {icon}
      <span className="block text-lg font-black text-brand-text dark:text-slate-100">{value}</span>
      <span className="text-[10px] font-bold text-slate-400">{label}</span>
    </div>
  );
}
