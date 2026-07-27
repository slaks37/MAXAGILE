import React, { useMemo, useRef, useState } from 'react';
import { X, Upload, Download, Copy, Check, FileJson, Link2, AlertTriangle, Layers, GraduationCap } from 'lucide-react';
import type { Course } from '../types';
import {
  createCourse,
  decodeCourseToken,
  exportCourseFile,
  exportCourseToken,
  importCourseFile,
  slugify,
} from '../store';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

type Tab = 'import' | 'export';

interface Preview {
  title: string;
  sections: number;
  activities: number;
}

function extractPreview(raw: unknown): Preview | null {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  if (!obj) return null;
  const candidate =
    obj.format === 'MAXAGILE_COURSE_V3' && obj.course && typeof obj.course === 'object'
      ? (obj.course as Record<string, unknown>)
      : obj;
  const sections = Array.isArray(candidate.sections) ? candidate.sections : [];
  let activities = 0;
  for (const s of sections) {
    const sec = s as Record<string, unknown>;
    if (Array.isArray(sec.activities)) activities += sec.activities.length;
  }
  if (typeof candidate.title !== 'string' && sections.length === 0) return null;
  return {
    title: typeof candidate.title === 'string' ? candidate.title : '',
    sections: sections.length,
    activities,
  };
}

export interface ImportExportModalProps {
  course?: Course;
  initialTab?: Tab;
  onImported: (c: Course) => void;
  onClose: () => void;
}

export function ImportExportModal({
  course,
  initialTab,
  onImported,
  onClose,
}: ImportExportModalProps) {
  const { t } = useLanguage();
  const canExport = !!course;
  const [tab, setTab] = useState<Tab>(initialTab || 'import');

  // Import state
  const [fileJson, setFileJson] = useState<unknown>(null);
  const [fileName, setFileName] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const tokenCourse = useMemo<Course | null>(() => {
    const trimmed = token.trim();
    if (!trimmed) return null;
    try {
      return decodeCourseToken(trimmed);
    } catch {
      return null;
    }
  }, [token]);

  const preview: Preview | null = fileJson
    ? extractPreview(fileJson)
    : tokenCourse
      ? {
          title: tokenCourse.title,
          sections: tokenCourse.sections.length,
          activities: tokenCourse.sections.reduce((n, s) => n + s.activities.length, 0),
        }
      : null;

  const tokenInvalid = token.trim().length > 0 && !tokenCourse && !fileJson;

  const handleFile = (file: File | undefined) => {
    setError('');
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        setFileJson(parsed);
        setToken('');
      } catch {
        setFileJson(null);
        setError(tr(t, 'lmsInvalidFile', 'File tidak valid atau rusak.'));
      }
    };
    reader.onerror = () => setError(tr(t, 'lmsInvalidFile', 'File tidak valid atau rusak.'));
    reader.readAsText(file);
  };

  const clearImport = () => {
    setFileJson(null);
    setFileName('');
    setToken('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = async () => {
    setError('');
    setBusy(true);
    try {
      let created: Course;
      if (fileJson) {
        created = await importCourseFile(fileJson);
      } else if (tokenCourse) {
        created = await createCourse({
          title: tokenCourse.title,
          summary: tokenCourse.summary,
          category: tokenCourse.category,
          color: tokenCourse.color,
          sections: tokenCourse.sections,
        });
      } else {
        setError(tr(t, 'lmsNothingToImport', 'Pilih file atau tempel token untuk mengimpor.'));
        setBusy(false);
        return;
      }
      onImported(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr(t, 'lmsUploadFailed', 'Gagal mengunggah file.'));
    } finally {
      setBusy(false);
    }
  };

  const handleExportFile = async () => {
    if (!course) return;
    setExporting(true);
    try {
      const blob = await exportCourseFile(course);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slugify(course.title)}.maxagile.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError(tr(t, 'lmsExportFailed', 'Gagal mengekspor file.'));
    } finally {
      setExporting(false);
    }
  };

  const exportToken = course ? exportCourseToken(course) : '';

  const handleCopyToken = async () => {
    if (!exportToken) return;
    try {
      await navigator.clipboard.writeText(exportToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const canConfirm = (!!fileJson || !!tokenCourse) && !busy;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-brand-text dark:text-slate-100">
            {tr(t, 'lmsImportExport', 'Impor / Ekspor Kursus')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        {canExport && (
          <div className="mb-5 flex gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['import', 'export'] as Tab[]).map((tb) => (
              <button
                key={tb}
                type="button"
                onClick={() => setTab(tb)}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-extrabold transition cursor-pointer ${
                  tab === tb
                    ? 'bg-white text-brand-text shadow-sm dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-500 hover:text-brand-text dark:hover:text-slate-200'
                }`}
              >
                {tb === 'import'
                  ? tr(t, 'lmsImportTab', 'Impor')
                  : tr(t, 'lmsExportTab', 'Ekspor')}
              </button>
            ))}
          </div>
        )}

        {/* IMPORT TAB */}
        {tab === 'import' && (
          <div className="space-y-4">
            {/* File picker */}
            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {tr(t, 'lmsImportFromFile', 'Impor dari File')}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
                id="lms-import-file"
              />
              <label
                htmlFor="lms-import-file"
                className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 px-4 py-4 text-sm font-bold text-slate-500 transition hover:border-brand-teal hover:text-brand-teal dark:border-slate-700 dark:bg-slate-800/50"
              >
                <FileJson className="h-5 w-5 shrink-0" />
                <span className="truncate">
                  {fileName || tr(t, 'lmsChooseJsonFile', 'Pilih file .json...')}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-bold text-slate-400">
                {tr(t, 'lmsOrPasteToken', 'atau tempel kode token di bawah')}
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Token */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Link2 className="h-3.5 w-3.5" />
                {tr(t, 'lmsTokenLabel', 'Kode Token')}
              </label>
              <textarea
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (e.target.value.trim()) {
                    setFileJson(null);
                    setFileName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }
                }}
                rows={3}
                placeholder="MAXAGILE_C3:..."
                className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-mono text-xs text-brand-text outline-none transition focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                {tr(t, 'lmsTokenTextOnly', 'Kode token hanya memuat teks. Gunakan Ekspor File untuk menyertakan lampiran.')}
              </p>
            </div>

            {tokenInvalid && (
              <div className="flex items-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-900 dark:bg-rose-950/40">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {tr(t, 'invalidToken', 'Kode token tidak valid atau rusak.')}
              </div>
            )}

            {/* Live preview */}
            {preview && (
              <div className="rounded-2xl border-2 border-brand-teal/40 bg-brand-blue/60 px-4 py-3 dark:bg-slate-800">
                <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-brand-teal">
                  {tr(t, 'lmsPreviewLabel', 'Pratinjau')}
                </p>
                <p className="font-extrabold text-brand-text dark:text-slate-100">
                  {preview.title || tr(t, 'lmsUntitledCourse', 'Kursus Tanpa Judul')}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {preview.sections} {tr(t, 'lmsTopicsLabel', 'Topik')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {preview.activities} {tr(t, 'lmsActivitiesLabel', 'Aktivitas')}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-900 dark:bg-rose-950/40">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              {(fileJson || token) && (
                <button
                  type="button"
                  onClick={clearImport}
                  className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-600 transition hover:-translate-y-0.5 active:translate-y-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {tr(t, 'lmsClear', 'Bersihkan')}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={!canConfirm}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-5 py-2.5 text-sm font-extrabold text-brand-text transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {busy ? tr(t, 'lmsSaving', 'Menyimpan...') : tr(t, 'lmsImportConfirm', 'Impor Kursus')}
              </button>
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {tab === 'export' && canExport && (
          <div className="space-y-5">
            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="mb-1 font-extrabold text-brand-text dark:text-slate-100">
                {course?.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tr(t, 'lmsExportFileHint', 'Unduh sebagai file lengkap termasuk semua lampiran.')}
              </p>
              <button
                type="button"
                onClick={handleExportFile}
                disabled={exporting}
                className="mt-3 inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-5 py-2.5 text-sm font-extrabold text-brand-text transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                {exporting
                  ? tr(t, 'lmsSaving', 'Menyimpan...')
                  : tr(t, 'lmsExportFile', 'Ekspor File Materi (.json)')}
              </button>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Link2 className="h-3.5 w-3.5" />
                {tr(t, 'lmsShareToken', 'Kode Token Berbagi')}
              </label>
              <textarea
                readOnly
                value={exportToken}
                rows={3}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                {tr(t, 'lmsTokenTextOnly', 'Kode token hanya memuat teks. Gunakan Ekspor File untuk menyertakan lampiran.')}
              </p>
              <button
                type="button"
                onClick={handleCopyToken}
                className="mt-2 inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-brand-text transition hover:-translate-y-0.5 hover:border-brand-teal active:translate-y-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-brand-teal" /> : <Copy className="h-4 w-4" />}
                {copied ? tr(t, 'tokenCopied', 'Token berhasil disalin!') : tr(t, 'copyToken', 'Salin Token')}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-900 dark:bg-rose-950/40">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
