import React, { useEffect, useState } from 'react';
import { GraduationCap, PencilRuler } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EditModeProvider, useEditMode } from './lms/EditModeContext';
import { CourseDashboard } from './lms/CourseDashboard';
import { CourseSettingsModal } from './lms/editors/CourseSettingsModal';
import { ImportExportModal } from './lms/editors/ImportExportModal';
import { PdfCourseModal } from './lms/editors/PdfCourseModal';
import { CoursePage } from './lms/course/CoursePage';
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

  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<SettingsState>({ open: false });
  const [importState, setImportState] = useState<ImportState>({ open: false, tab: 'import' });
  const [showPdfModal, setShowPdfModal] = useState(false);

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

  const handleImported = (created: Course) => {
    setCourses((prev) => [...prev, created]);
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
