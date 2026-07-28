import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import type { Course } from '../types';
import { GRADIENTS } from '../theme';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface CourseSettingsModalProps {
  course?: Course;
  onSave: (partial: Partial<Course>) => void;
  onClose: () => void;
}

export function CourseSettingsModal({ course, onSave, onClose }: CourseSettingsModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(course?.title || '');
  const [summary, setSummary] = useState(course?.summary || '');
  const [category, setCategory] = useState(course?.category || 'Umum');
  const [color, setColor] = useState(course?.color || GRADIENTS[0]);
  const [touched, setTouched] = useState(false);

  const isEdit = !!course;
  const titleValid = title.trim().length > 0;

  const handleSave = () => {
    setTouched(true);
    if (!titleValid) return;
    onSave({
      title: title.trim(),
      summary: summary.trim(),
      category: category.trim() || 'Umum',
      color,
    });
  };

  const inputClass =
    'w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-brand-text outline-none transition focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

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
            {isEdit
              ? tr(t, 'lmsEditCourse', 'Edit Kursus')
              : tr(t, 'lmsCreateCourse', 'Buat Kursus')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cover preview */}
        <div className={`mb-5 flex h-24 items-end rounded-2xl bg-gradient-to-br p-4 ${color}`}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-brand-text shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {title.trim() || tr(t, 'lmsUntitledCourse', 'Kursus Tanpa Judul')}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {tr(t, 'lmsCourseTitle', 'Judul Kursus')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={tr(t, 'lmsMaterialTitlePlaceholder', 'Contoh: Modul Manajemen Usaha Kecil')}
              className={inputClass}
              autoFocus
            />
            {touched && !titleValid && (
              <p className="mt-1 text-xs font-bold text-rose-500">
                {tr(t, 'lmsTitleRequired', 'Judul wajib diisi.')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {tr(t, 'lmsCategoryLabel', 'Kategori')}
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={tr(t, 'lmsCategoryDefault', 'Umum')}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {tr(t, 'lmsSummaryLabel', 'Ringkasan')}
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder={tr(t, 'lmsSummaryPlaceholder', 'Ringkasan singkat isi modul pembelajaran ini')}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {tr(t, 'lmsColorLabel', 'Warna')}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setColor(g)}
                  className={`relative h-11 w-11 rounded-2xl bg-gradient-to-br ${g} transition hover:scale-105 cursor-pointer ${
                    color === g
                      ? 'ring-2 ring-brand-text ring-offset-2 dark:ring-slate-100 dark:ring-offset-slate-900'
                      : ''
                  }`}
                >
                  {color === g && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-600 transition hover:-translate-y-0.5 active:translate-y-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {tr(t, 'cancel', 'Batal')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-5 py-2.5 text-sm font-extrabold text-brand-text transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            {tr(t, 'save', 'Simpan')}
          </button>
        </div>
      </div>
    </div>
  );
}
