import React, { useState } from 'react';
import {
  X,
  Download,
  Package,
  Key,
  FileText,
  BarChart3,
  Copy,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { Course, CourseProgress } from '../types';
import { exportCourseFile, exportCourseToken } from '../store';
import { exportCourseToMarkdown, exportGradebookToCsv, downloadFile } from '../exportUtils';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface CourseExportModalProps {
  course: Course;
  progress?: CourseProgress;
  onClose: () => void;
}

export function CourseExportModal({ course, progress, onClose }: CourseExportModalProps) {
  const { t } = useLanguage();
  const [copiedToken, setCopiedToken] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);

  const handleExportJson = async () => {
    setExportingJson(true);
    try {
      const blob = await exportCourseFile(course);
      const safeTitle = (course.title || 'kursus').replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadFile(`${safeTitle}.maxagile.json`, blob, 'application/json');
    } catch {
      // fallback
    } finally {
      setExportingJson(false);
    }
  };

  const handleCopyToken = () => {
    try {
      const token = exportCourseToken(course);
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleExportMarkdown = () => {
    exportCourseToMarkdown(course);
  };

  const handleExportCsv = () => {
    if (progress) {
      exportGradebookToCsv(course, progress);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-teal text-white shadow-sm">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-brand-text dark:text-slate-100">
                {tr(t, 'lmsExportCourseTitle', 'Ekspor Kursus & Materi')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {course.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="py-6 space-y-4">
          <label className="text-xs font-extrabold uppercase tracking-wide text-slate-400 block">
            {tr(t, 'lmsPickExportFormat', 'Pilih Format Ekspor:')}
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* 1. JSON Package */}
            <button
              type="button"
              onClick={handleExportJson}
              disabled={exportingJson}
              className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-teal dark:border-slate-800 dark:bg-slate-800 cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
                {exportingJson ? <Loader2 className="h-5 w-5 animate-spin" /> : <Package className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-brand-text dark:text-slate-100">
                  {tr(t, 'lmsExportJsonTitle', 'Paket Kursus JSON (.json)')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {tr(
                    t,
                    'lmsExportJsonDesc',
                    'Backup lengkap berisi struktur bab, kuis, dan file lampiran ter-embed.',
                  )}
                </p>
              </div>
            </button>

            {/* 2. Share Token */}
            <button
              type="button"
              onClick={handleCopyToken}
              className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-orange dark:border-slate-800 dark:bg-slate-800 cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-brand-text">
                {copiedToken ? <Check className="h-5 w-5 text-emerald-800" /> : <Key className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-brand-text dark:text-slate-100">
                  {copiedToken
                    ? tr(t, 'lmsTokenCopiedShort', 'Kode Token Tersalin!')
                    : tr(t, 'lmsShareToken', 'Kode Token Berbagi')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {tr(
                    t,
                    'lmsExportTokenDesc',
                    'Salin teks token ringkas untuk dibagikan antar pengguna secara cepat.',
                  )}
                </p>
              </div>
            </button>

            {/* 3. Markdown Document */}
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-brand-text dark:text-slate-100">
                  {tr(t, 'lmsExportMarkdownTitle', 'Dokumentasi Markdown (.md)')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {tr(
                    t,
                    'lmsExportMarkdownDesc',
                    'Ekspor seluruh materi, bab, dan soal kuis menjadi teks dokumen Markdown.',
                  )}
                </p>
              </div>
            </button>

            {/* 4. Gradebook CSV */}
            {progress && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-500 dark:border-slate-800 dark:bg-slate-800 cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-brand-text dark:text-slate-100">
                    {tr(t, 'lmsExportCsvTitle', 'Buku Nilai CSV (.csv)')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {tr(
                      t,
                      'lmsExportCsvDesc',
                      'Ekspor laporan progres dan nilai kuis/tugas ke file spreadsheet CSV.',
                    )}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border-2 border-slate-300 bg-white px-5 py-2 text-xs font-extrabold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {tr(t, 'lmsClose', 'Tutup')}
          </button>
        </div>
      </div>
    </div>
  );
}
