import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  GraduationCap,
  Layers,
  Library,
  Loader2,
  PencilRuler,
  Plus,
  X,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EditModeProvider, useEditMode } from './lms/EditModeContext';
import { CourseDashboard } from './lms/CourseDashboard';
import { CourseSettingsModal } from './lms/editors/CourseSettingsModal';
import { ImportExportModal } from './lms/editors/ImportExportModal';
import { PdfCourseModal } from './lms/editors/PdfCourseModal';
import { CoursePage } from './lms/course/CoursePage';
// NOTE: the ready-made course catalogue is deliberately NOT imported at the top
// level. It is ~200 kB of prose that only matters once the user opens the
// "Materi Siap Pakai" dialog, so it is pulled in on demand to keep the initial
// download small on low-end machines.
type PmCatalogueModule = typeof import('./lms/content/pmCourses');
import {
  fetchCourses,
  loadProgress,
  saveProgress,
  createCourse,
  updateCourse,
  deleteCourse,
  emptyCourseProgress,
} from './lms/store';
import type { Course, CourseProgress, ProgressMap } from './lms/types';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

// ---------------------------------------------------------------------------
// Edit-mode switch (Moodle-style)
// ---------------------------------------------------------------------------

function EditModeSwitch() {
  const { t } = useLanguage();
  const { editMode, toggle } = useEditMode();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2.5 rounded-2xl border-2 border-b-4 px-4 py-2.5 text-sm font-extrabold transition active:translate-y-0 cursor-pointer ${
        editMode
          ? 'border-brand-text bg-brand-orange text-brand-text'
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-text dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }`}
      aria-pressed={editMode}
    >
      <PencilRuler className="h-4 w-4" />
      <span className="hidden sm:inline">{tr(t, 'lmsEditMode', 'Mode Edit')}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          editMode ? 'bg-brand-text' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute h-4 w-4 rounded-full bg-white shadow transition-all ${
            editMode ? 'left-[1.15rem]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Ready-made sample courses ("Materi Siap Pakai")
// ---------------------------------------------------------------------------

type InstallStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

const IDLE: InstallStatus = { kind: 'idle' };

function countActivities(course: Course): number {
  return (course.sections || []).reduce((n, s) => n + (s.activities?.length || 0), 0);
}

interface SampleCoursesModalProps {
  /** `order` given to the first installed copy; each further install adds 1. */
  orderBase: number;
  onInstalled: (created: Course) => void;
  onClose: () => void;
}

function SampleCoursesModal({ orderBase, onInstalled, onClose }: SampleCoursesModalProps) {
  const { t } = useLanguage();
  const [statuses, setStatuses] = useState<Record<string, InstallStatus>>({});
  const installedCount = useRef(0);
  // Frozen at mount: `orderBase` would otherwise grow as installs land, so
  // combining it with `installedCount` would skip order values.
  const orderStart = useRef(orderBase);

  // Catalogue is fetched on demand (see the note on the import at the top).
  const catalogueRef = useRef<PmCatalogueModule | null>(null);
  const [catalogue, setCatalogue] = useState<Course[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    import('./lms/content/pmCourses')
      .then((mod) => {
        if (!alive) return;
        catalogueRef.current = mod;
        setCatalogue(mod.PM_COURSES);
      })
      .catch(() => {
        if (alive) setLoadFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const setStatus = (id: string, status: InstallStatus) =>
    setStatuses((prev) => ({ ...prev, [id]: status }));

  const handleInstall = async (sampleId: string) => {
    setStatus(sampleId, { kind: 'saving' });
    try {
      const mod = catalogueRef.current;
      if (!mod) throw new Error(tr(t, 'lmsSampleCoursesLoading', 'Materi masih dimuat...'));
      const fresh = mod.instantiatePmCourse(sampleId);
      const created = await createCourse({
        title: fresh.title,
        summary: fresh.summary,
        category: fresh.category,
        color: fresh.color,
        order: orderStart.current + installedCount.current,
        sections: fresh.sections,
      });
      installedCount.current += 1;
      onInstalled(created);
      setStatus(sampleId, { kind: 'done' });
    } catch (err) {
      setStatus(sampleId, {
        kind: 'error',
        message:
          err instanceof Error && err.message
            ? err.message
            : tr(t, 'lmsSampleCourseFailed', 'Gagal menambahkan materi. Coba lagi.'),
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-b-4 border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={tr(t, 'lmsSampleCourses', 'Materi Siap Pakai')}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b-2 border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-brand-text">
              <Library className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold leading-tight text-brand-text dark:text-slate-100">
                {tr(t, 'lmsSampleCourses', 'Materi Siap Pakai')}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {tr(
                  t,
                  'lmsSampleCoursesHint',
                  'Pilih materi yang sudah jadi, lalu tambahkan ke katalog Anda. Salinan bisa diedit bebas.',
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title={tr(t, 'lmsClose', 'Tutup')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 dark:text-slate-400 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Catalogue */}
        <div className="flex-1 space-y-3 overflow-auto p-5 custom-scrollbar">
          {loadFailed ? (
            <p className="py-10 text-center text-sm font-bold text-rose-500">
              {tr(t, 'lmsSampleCoursesLoadFailed', 'Gagal memuat materi siap pakai. Periksa koneksi lalu buka lagi.')}
            </p>
          ) : catalogue === null ? (
            <div className="space-y-3 py-2" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl border-2 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : catalogue.length === 0 ? (
            <p className="py-10 text-center text-sm font-bold text-slate-400">
              {tr(t, 'lmsSampleCoursesEmpty', 'Belum ada materi siap pakai.')}
            </p>
          ) : (
            catalogue.map((sample) => {
              const status = statuses[sample.id] || IDLE;
              const sectionCount = (sample.sections || []).length;
              const activityCount = countActivities(sample);
              return (
                <div
                  key={sample.id}
                  className="rounded-2xl border-2 border-slate-200 bg-white p-4 transition hover:border-brand-teal dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 shrink-0 rounded-full bg-gradient-to-br ${sample.color}`}
                        />
                        <h4 className="text-sm font-extrabold leading-snug text-brand-text dark:text-slate-100">
                          {sample.title || tr(t, 'lmsUntitledCourse', 'Kursus Tanpa Judul')}
                        </h4>
                      </div>
                      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {sample.summary || tr(t, 'lmsNoSummary', 'Tidak ada ringkasan.')}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" />
                          {sectionCount} {tr(t, 'lmsTopicsLabel', 'Topik')}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {activityCount} {tr(t, 'lmsActivitiesLabel', 'Aktivitas')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInstall(sample.id)}
                      disabled={status.kind === 'saving'}
                      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-b-4 px-4 py-2.5 text-xs font-extrabold transition active:translate-y-[2px] active:border-b-2 sm:w-auto ${
                        status.kind === 'done'
                          ? 'border-emerald-600 bg-emerald-500 text-white'
                          : 'border-brand-text bg-brand-orange text-brand-text hover:-translate-y-0.5'
                      } ${status.kind === 'saving' ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
                    >
                      {status.kind === 'saving' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {tr(t, 'lmsSampleCourseAdding', 'Menambahkan...')}
                        </>
                      ) : status.kind === 'done' ? (
                        <>
                          <Check className="h-4 w-4" />
                          {tr(t, 'lmsSampleCourseAdded', 'Ditambahkan')}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          {tr(t, 'lmsSampleCourseAdd', 'Tambahkan')}
                        </>
                      )}
                    </button>
                  </div>

                  {status.kind === 'error' && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in">
                      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                      <span className="break-words">{status.message}</span>
                    </div>
                  )}

                  {status.kind === 'done' && (
                    <p className="mt-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                      {tr(
                        t,
                        'lmsSampleCourseAddedHint',
                        'Sudah masuk katalog. Bisa ditambahkan lagi kalau perlu salinan kedua.',
                      )}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-100 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-brand-text transition hover:border-brand-teal active:translate-y-[2px] active:border-b-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
          >
            {tr(t, 'lmsClose', 'Tutup')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shell inner (has access to edit-mode context)
// ---------------------------------------------------------------------------

interface SettingsState {
  open: boolean;
  course?: Course;
}
interface ImportState {
  open: boolean;
  course?: Course;
  tab: 'import' | 'export';
}

function LearningHubInner() {
  const { t } = useLanguage();
  const { editMode } = useEditMode();

  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<SettingsState>({ open: false });
  const [importState, setImportState] = useState<ImportState>({ open: false, tab: 'import' });
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const rows = await fetchCourses();
      if (!alive) return;
      setCourses(rows);
      setProgressMap(loadProgress());
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const selectedCourse = selectedCourseId
    ? courses.find((c) => c.id === selectedCourseId) || null
    : null;

  // --- Course structure persistence (from CoursePage) ---
  const handleCourseChange = (updated: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    updateCourse(updated.id, {
      title: updated.title,
      summary: updated.summary,
      category: updated.category,
      color: updated.color,
      order: updated.order,
      sections: updated.sections,
    }).catch(() => {
      /* optimistic update kept; network retry not required */
    });
  };

  // --- Progress persistence (from CoursePage) ---
  const handleProgressChange = (courseId: string, updated: CourseProgress) => {
    setProgressMap((prev) => {
      const next = { ...prev, [courseId]: updated };
      saveProgress(next);
      return next;
    });
  };

  // --- Course metadata create/edit ---
  const handleSaveSettings = async (partial: Partial<Course>) => {
    const editing = settings.course;
    setSettings({ open: false });
    if (editing) {
      const optimistic = { ...editing, ...partial } as Course;
      setCourses((prev) => prev.map((c) => (c.id === editing.id ? optimistic : c)));
      try {
        const saved = await updateCourse(editing.id, partial);
        setCourses((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      } catch {
        /* keep optimistic */
      }
    } else {
      try {
        const created = await createCourse({
          ...partial,
          order: courses.length,
          sections: [],
        });
        setCourses((prev) => [...prev, created]);
      } catch {
        /* creation failed silently; UI stays consistent */
      }
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const target = courses.find((c) => c.id === id);
    const label = target?.title || '';
    const msg = tr(t, 'lmsDeleteCourseConfirm', 'Hapus kursus ini beserta semua file lampirannya?');
    if (!window.confirm(label ? `${msg}\n\n"${label}"` : msg)) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
    if (selectedCourseId === id) setSelectedCourseId(null);
    await deleteCourse(id);
  };

  /** Shared refresh path for every "a new course was persisted" flow. */
  const appendCourse = (created: Course) => {
    setCourses((prev) => [...prev, created]);
  };

  const handleImported = (created: Course) => {
    appendCourse(created);
    setImportState({ open: false, tab: 'import' });
  };

  const handleSavePdfCourse = async (generated: Course) => {
    setShowPdfModal(false);
    try {
      const created = await createCourse({
        title: generated.title,
        summary: generated.summary,
        category: generated.category,
        color: generated.color,
        order: courses.length,
        sections: generated.sections,
      });
      setCourses((prev) => [...prev, created]);
      setSelectedCourseId(created.id);
    } catch {
      // optimistic fallback
      setCourses((prev) => [...prev, generated]);
      setSelectedCourseId(generated.id);
    }
  };

  return (
    <div className="flex-1 h-full overflow-auto bg-brand-bg custom-scrollbar dark:bg-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-white px-6 pb-5 pt-6 dark:bg-slate-900">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand-blue blur-3xl dark:opacity-20" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-orange text-brand-text shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-brand-text dark:text-slate-100">
                {t('learnCenterTitle')}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                {tr(
                  t,
                  'lmsAcademySubtitle',
                  'Pusat pembelajaran interaktif untuk meningkatkan produktivitas dan menguasai berbagai kerangka kerja.',
                )}
              </p>
            </div>
          </div>
          <EditModeSwitch />
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm font-bold text-slate-400">
            {tr(t, 'lmsLoading', 'Memuat...')}
          </div>
        ) : selectedCourse ? (
          <CoursePage
            course={selectedCourse}
            progress={progressMap[selectedCourse.id] || emptyCourseProgress()}
            onExit={() => setSelectedCourseId(null)}
            onCourseChange={handleCourseChange}
            onProgressChange={(updated) => handleProgressChange(selectedCourse.id, updated)}
          />
        ) : (
          <>
            {/* Ready-made material — sits with the other create/import controls */}
            {editMode && (
              <div className="mb-5 flex flex-wrap items-center gap-3 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-5 py-3 text-sm font-extrabold text-brand-text transition hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2 cursor-pointer"
                >
                  <Library className="h-4 w-4" />
                  {tr(t, 'lmsSampleCourses', 'Materi Siap Pakai')}
                </button>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  {tr(
                    t,
                    'lmsSampleCoursesTagline',
                    'Pasang kursus contoh lengkap dalam sekali klik.',
                  )}
                </span>
              </div>
            )}
            <CourseDashboard
              courses={courses}
              progressMap={progressMap}
              onOpenCourse={(id) => setSelectedCourseId(id)}
              onCreateCourse={() => setSettings({ open: true })}
              onEditCourse={(course) => setSettings({ open: true, course })}
              onDeleteCourse={handleDeleteCourse}
              onImport={() => setImportState({ open: true, tab: 'import' })}
              onOpenPdfModal={() => setShowPdfModal(true)}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {settings.open && (
        <CourseSettingsModal
          course={settings.course}
          onSave={handleSaveSettings}
          onClose={() => setSettings({ open: false })}
        />
      )}
      {importState.open && (
        <ImportExportModal
          course={importState.course}
          initialTab={importState.tab}
          onImported={handleImported}
          onClose={() => setImportState({ open: false, tab: 'import' })}
        />
      )}
      {showPdfModal && (
        <PdfCourseModal
          onSaveCourse={handleSavePdfCourse}
          onClose={() => setShowPdfModal(false)}
        />
      )}
      {showSampleModal && (
        <SampleCoursesModal
          orderBase={courses.length}
          onInstalled={appendCourse}
          onClose={() => setShowSampleModal(false)}
        />
      )}
    </div>
  );
}

export function LearningHub() {
  return (
    <EditModeProvider>
      <LearningHubInner />
    </EditModeProvider>
  );
}
