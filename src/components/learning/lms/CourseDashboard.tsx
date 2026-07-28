import React, { useState } from 'react';
import {
  Plus,
  Upload,
  Pencil,
  Trash2,
  Layers,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import type { Course, ProgressMap } from './types';
import { courseProgressPercent } from './store';
import { useEditMode } from './EditModeContext';
import { useLanguage } from '../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

function countActivities(course: Course): number {
  return (course.sections || []).reduce((n, s) => n + (s.activities?.length || 0), 0);
}

export interface CourseDashboardProps {
  courses: Course[];
  progressMap: ProgressMap;
  onOpenCourse: (id: string) => void;
  onCreateCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onImport: () => void;
  onOpenPdfModal?: () => void;
}

export function CourseDashboard({
  courses,
  progressMap,
  onOpenCourse,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
  onImport,
  onOpenPdfModal,
}: CourseDashboardProps) {
  const { t } = useLanguage();
  const { editMode } = useEditMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const empty = courses.length === 0;

  // Extract unique categories
  const categories = Array.from(
    new Set(courses.map((c) => c.category || 'Umum').filter(Boolean))
  );

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || (course.category || 'Umum') === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="animate-in fade-in">
      {/* Search & Filter Bar */}
      {!empty && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr(
                t,
                'lmsSearchCoursePlaceholder',
                'Cari kursus berdasarkan judul atau deskripsi...',
              )}
              className="w-full rounded-2xl border-2 border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-teal dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`rounded-2xl px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-brand-teal text-white shadow'
                    : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {tr(t, 'lmsAllCategories', 'Semua')} ({courses.length})
              </button>
              {categories.map((cat) => {
                const count = courses.filter((c) => (c.category || 'Umum') === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-2xl px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-brand-teal text-white shadow'
                        : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit-mode toolbar */}
      {editMode && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenPdfModal}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-emerald-600 bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            {tr(t, 'lmsCreateFromDocument', 'Buat dari Dokumen (PDF, Word, Text)')}
          </button>
          <button
            type="button"
            onClick={onCreateCourse}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-5 py-3 text-sm font-extrabold text-brand-text transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {tr(t, 'lmsCreateCourse', 'Buat Kursus Manual')}
          </button>
          <button
            type="button"
            onClick={onImport}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-brand-text transition hover:-translate-y-0.5 hover:border-brand-teal active:translate-y-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            {tr(t, 'lmsImportCourse', 'Impor Kursus')}
          </button>
        </div>
      )}

      {/* Empty state */}
      {empty ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-blue text-brand-teal dark:bg-slate-800">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-extrabold text-brand-text dark:text-slate-100">
            {tr(t, 'lmsEmptyTitle', 'Belum ada kursus')}
          </h3>
          <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {editMode
              ? tr(
                  t,
                  'lmsEmptyEditHint',
                  'Mulai dengan membuat kursus pertama Anda, atau impor struktur kursus yang sudah ada.',
                )
              : tr(
                  t,
                  'lmsEmptyLearnerHint',
                  'Aktifkan Mode Edit di kanan atas untuk mulai membuat kursus.',
                )}
          </p>
          {editMode && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onCreateCourse}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-6 py-3 text-sm font-extrabold text-brand-text transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                {tr(t, 'lmsCreateCourse', 'Buat Kursus')}
              </button>
              <button
                type="button"
                onClick={onImport}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-brand-text transition hover:-translate-y-0.5 hover:border-brand-teal active:translate-y-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {tr(t, 'lmsImportCourse', 'Impor Kursus')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const pct = courseProgressPercent(course, progressMap[course.id]);
            const activityCount = countActivities(course);
            const sectionCount = (course.sections || []).length;
            return (
              <div
                key={course.id}
                onClick={() => onOpenCourse(course.id)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-b-4 border-slate-200 bg-white text-left transition hover:-translate-y-1 hover:border-brand-orange dark:border-slate-700 dark:bg-slate-900"
              >
                {/* Gradient cover */}
                <div className={`relative h-28 bg-gradient-to-br ${course.color}`}>
                  <div className="absolute inset-0 bg-black/5" />
                  <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-brand-text shadow-sm">
                    {course.category || 'Umum'}
                  </span>
                  <BookOpen className="absolute bottom-3 right-3 h-10 w-10 text-white/50" />

                  {editMode && (
                    <div className="absolute right-2 top-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCourse(course);
                        }}
                        title={tr(t, 'lmsEditCourse', 'Edit Kursus')}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-brand-text shadow-sm transition hover:bg-white hover:text-brand-teal cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCourse(course.id);
                        }}
                        title={tr(t, 'lmsDeleteCourse', 'Hapus Kursus')}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-brand-text shadow-sm transition hover:bg-white hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-1 line-clamp-2 text-lg font-extrabold leading-snug text-brand-text dark:text-slate-100">
                    {course.title || tr(t, 'lmsUntitledCourse', 'Kursus Tanpa Judul')}
                  </h3>
                  <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">
                    {course.summary || tr(t, 'lmsNoSummary', 'Tidak ada ringkasan.')}
                  </p>

                  <div className="mb-3 flex items-center gap-3 text-xs font-bold text-slate-400 dark:text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      {sectionCount} {tr(t, 'lmsTopicsLabel', 'Topik')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {activityCount} {tr(t, 'lmsActivitiesLabel', 'Aktivitas')}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-1 flex items-center justify-between text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                    <span>{tr(t, 'lmsProgressLabel', 'Progres Belajar')}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-brand-teal transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-brand-teal opacity-0 transition group-hover:opacity-100">
                    {pct > 0
                      ? tr(t, 'lmsResumeCourse', 'Lanjutkan')
                      : tr(t, 'lmsStartCourse', 'Mulai Belajar')}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dashed create tile */}
          {editMode && (
            <button
              type="button"
              onClick={onCreateCourse}
              className="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white/40 p-5 text-slate-400 transition hover:-translate-y-1 hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-900/40 cursor-pointer"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-current">
                <Plus className="h-7 w-7" />
              </div>
              <span className="text-sm font-extrabold">
                {tr(t, 'lmsCreateCourse', 'Buat Kursus')}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
