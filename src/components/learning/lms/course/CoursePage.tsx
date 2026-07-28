import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  X,
  FolderPlus,
  Check,
} from 'lucide-react';
import type { Activity, ActivityType, Course, CourseProgress, Section } from '../types';
import {
  courseProgressPercent,
  isActivityComplete,
  genId,
} from '../store';
import { ACTIVITY_META } from '../theme';
import { useEditMode } from '../EditModeContext';
import { useLanguage } from '../../../../i18n/LanguageContext';
import { PageView } from '../activities/PageView';
import { LessonPlayer } from '../activities/LessonPlayer';
import { QuizPlayer } from '../activities/QuizPlayer';
import { AssessmentPlayer } from '../activities/AssessmentPlayer';
import { ChecklistPlayer } from '../activities/ChecklistPlayer';
import { AssignmentPlayer } from '../activities/AssignmentPlayer';
import { ForumPlayer } from '../activities/ForumPlayer';
import { ActivityEditor } from '../editors/ActivityEditor';
import { ActivityTypePicker } from '../editors/ActivityTypePicker';
import { GradebookModal } from './GradebookModal';
import { CertificateModal } from './CertificateModal';
import { DuolingoPathView } from './DuolingoPathView';
import { CourseExportModal } from '../editors/CourseExportModal';
import { BarChart3, Award, Sparkles, Layers, Download } from 'lucide-react';
import type { AssignmentSubmission, ForumPost, ForumReply, LessonProgress } from '../types';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

/** Indonesian fallbacks so an untranslated key never leaks as "LMSACTPAGE". */
const ACTIVITY_LABEL_FALLBACK: Record<ActivityType, string> = {
  page: 'Halaman',
  lesson: 'Pelajaran',
  quiz: 'Kuis',
  assessment: 'Asesmen',
  checklist: 'Ceklis',
  assignment: 'Tugas',
  forum: 'Forum',
};

function emptyActivity(type: ActivityType): Activity {
  const base: Activity = { id: genId('act'), type, title: '', description: '' };
  switch (type) {
    case 'page':
      return { ...base, page: { content: '', attachments: [] } };
    case 'lesson':
      return { ...base, lesson: { blocks: [] } };
    case 'quiz':
      return { ...base, quiz: { questions: [], passPercent: 70 } };
    case 'assessment':
      return { ...base, assessment: { questions: [], results: [] } };
    case 'checklist':
      return { ...base, checklist: { items: [] } };
    default:
      return base;
  }
}

export interface CoursePageProps {
  course: Course;
  progress: CourseProgress;
  onExit: () => void;
  onCourseChange: (updated: Course) => void;
  onProgressChange: (updated: CourseProgress) => void;
}

export function CoursePage({ course, progress, onExit, onCourseChange, onProgressChange }: CoursePageProps) {
  const { t } = useLanguage();
  const { editMode } = useEditMode();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [openActivity, setOpenActivity] = useState<{ sectionId: string; activityId: string } | null>(null);
  const [editorState, setEditorState] = useState<{ sectionId: string; activity: Activity } | null>(null);
  const [pickerSectionId, setPickerSectionId] = useState<string | null>(null);
  const [editingMeta, setEditingMeta] = useState<{ id: string; title: string; summary: string } | null>(null);
  const [showGradebook, setShowGradebook] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewMode, setViewMode] = useState<'topics' | 'duolingo'>(
    course.title?.toLowerCase().includes('mini-course') ? 'duolingo' : 'topics'
  );

  const percent = courseProgressPercent(course, progress);

  // ---- course structure mutations ----
  function commitSections(sections: Section[]) {
    onCourseChange({ ...course, sections });
  }
  function updateSection(sectionId: string, up: (s: Section) => Section) {
    commitSections(course.sections.map((s) => (s.id === sectionId ? up(s) : s)));
  }
  function moveSection(index: number, dir: -1 | 1) {
    const next = [...course.sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    commitSections(next);
  }
  function deleteSection(sectionId: string) {
    if (!window.confirm(tr(t, 'lmsDeleteSectionConfirm', 'Hapus topik ini beserta semua aktivitasnya?'))) return;
    commitSections(course.sections.filter((s) => s.id !== sectionId));
  }
  function addSection() {
    commitSections([
      ...course.sections,
      { id: genId('sec'), title: tr(t, 'lmsNewTopic', 'Topik Baru'), summary: '', activities: [] },
    ]);
  }
  function moveActivity(sectionId: string, index: number, dir: -1 | 1) {
    updateSection(sectionId, (s) => {
      const acts = [...s.activities];
      const target = index + dir;
      if (target < 0 || target >= acts.length) return s;
      [acts[index], acts[target]] = [acts[target], acts[index]];
      return { ...s, activities: acts };
    });
  }
  function deleteActivity(sectionId: string, activityId: string) {
    if (!window.confirm(tr(t, 'lmsDeleteActivityConfirm', 'Hapus aktivitas ini?'))) return;
    updateSection(sectionId, (s) => ({ ...s, activities: s.activities.filter((a) => a.id !== activityId) }));
  }
  function saveActivity(sectionId: string, activity: Activity) {
    updateSection(sectionId, (s) => {
      const exists = s.activities.some((a) => a.id === activity.id);
      return {
        ...s,
        activities: exists ? s.activities.map((a) => (a.id === activity.id ? activity : a)) : [...s.activities, activity],
      };
    });
    setEditorState(null);
  }

  // ---- progress mutations ----
  // A lesson can persist its state and mark itself complete inside the same
  // tick, so mutations chain off the last value we emitted rather than off the
  // `progress` prop, which React has not re-rendered with yet.
  const progressRef = useRef<CourseProgress>(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  function mutateProgress(up: (cp: CourseProgress) => CourseProgress) {
    const next: CourseProgress = { ...up(progressRef.current), updatedAt: new Date().toISOString() };
    progressRef.current = next;
    onProgressChange(next);
  }
  function setCompletion(activityId: string, value: boolean) {
    mutateProgress((cp) => ({ ...cp, completion: { ...cp.completion, [activityId]: value } }));
  }
  function saveLesson(activityId: string, p: LessonProgress) {
    mutateProgress((cp) => ({
      ...cp,
      lesson: { ...cp.lesson, [activityId]: p },
      completion: { ...cp.completion, [activityId]: !!p.completed || !!cp.completion[activityId] },
    }));
  }
  function completeLesson(activityId: string) {
    mutateProgress((cp) => {
      const prev = cp.lesson?.[activityId];
      const next: LessonProgress = prev
        ? { ...prev, completed: true }
        : { index: 0, answers: {}, completed: true };
      return {
        ...cp,
        lesson: { ...cp.lesson, [activityId]: next },
        completion: { ...cp.completion, [activityId]: true },
      };
    });
  }
  function saveQuiz(activityId: string, percentVal: number, answers: Record<string, string>, passed: boolean) {
    mutateProgress((cp) => ({
      ...cp,
      quiz: { ...cp.quiz, [activityId]: { percent: percentVal, answers } },
      completion: { ...cp.completion, [activityId]: passed },
    }));
  }
  function saveAssessment(activityId: string, avg: number, resultId: string, answers: Record<string, string>) {
    mutateProgress((cp) => ({
      ...cp,
      assessment: { ...cp.assessment, [activityId]: { avg, resultId, answers } },
      completion: { ...cp.completion, [activityId]: true },
    }));
  }
  function saveChecklist(activity: Activity, next: Record<string, boolean>) {
    const items = activity.checklist?.items ?? [];
    const allChecked = items.length > 0 && items.every((it) => next[it.id]);
    mutateProgress((cp) => ({
      ...cp,
      checklist: { ...cp.checklist, [activity.id]: next },
      completion: { ...cp.completion, [activity.id]: allChecked },
    }));
  }

  function saveAssignmentSubmission(activityId: string, sub: AssignmentSubmission) {
    mutateProgress((cp) => ({
      ...cp,
      assignment: { ...cp.assignment, [activityId]: sub },
      completion: { ...cp.completion, [activityId]: !!sub.submittedAt },
    }));
  }

  function addForumPost(activityId: string, post: ForumPost) {
    mutateProgress((cp) => {
      const existing = cp.forumPosts?.[activityId] || [];
      return {
        ...cp,
        forumPosts: { ...cp.forumPosts, [activityId]: [...existing, post] },
        completion: { ...cp.completion, [activityId]: true },
      };
    });
  }

  function addForumReply(activityId: string, postId: string, reply: ForumReply) {
    mutateProgress((cp) => {
      const existingPosts = cp.forumPosts?.[activityId] || [];
      const updatedPosts = existingPosts.map((p) =>
        p.id === postId ? { ...p, replies: [...(p.replies || []), reply] } : p
      );
      return {
        ...cp,
        forumPosts: { ...cp.forumPosts, [activityId]: updatedPosts },
      };
    });
  }

  function updateStudentName(name: string) {
    mutateProgress((cp) => ({ ...cp, studentName: name }));
  }

  function openPickerActivity(type: ActivityType) {
    if (!pickerSectionId) return;
    setEditorState({ sectionId: pickerSectionId, activity: emptyActivity(type) });
    setPickerSectionId(null);
  }

  // find current open activity object
  const openSection = openActivity ? course.sections.find((s) => s.id === openActivity.sectionId) : null;
  const openAct = openSection?.activities.find((a) => a.id === openActivity?.activityId) ?? null;

  return (
    <div className="animate-in fade-in">
      {/* header */}
      <div className={`rounded-3xl border-2 border-b-4 border-slate-200 bg-gradient-to-br ${course.color} p-6 text-white shadow-lg dark:border-slate-700`}>
        <button
          type="button"
          onClick={onExit}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/30 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> {tr(t, 'lmsBackToCatalog', 'Kembali ke Daftar Kelas')}
        </button>
        <span className="inline-block rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wide">
          {course.category}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight">{course.title}</h1>
        {course.summary && <p className="mt-2 max-w-2xl text-sm text-white/90">{course.summary}</p>}

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-white/90">
            <span>{tr(t, 'lmsProgressLabel', 'Progres Belajar')}</span>
            <span>{percent}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-black/20">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/30 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Ekspor
            </button>
            <button
              type="button"
              onClick={() => setShowGradebook(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/30 cursor-pointer"
            >
              <BarChart3 className="h-4 w-4" />
              Buku Nilai (Gradebook)
            </button>
            <button
              type="button"
              onClick={() => setShowCertificate(true)}
              disabled={percent < 100}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition shadow ${
                percent >= 100
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer animate-pulse'
                  : 'bg-white/10 text-white/50 cursor-not-allowed opacity-60'
              }`}
            >
              <Award className="h-4 w-4" />
              {percent >= 100 ? 'Klaim Sertifikat Kelulusan' : 'Sertifikat (Selesaikan 100%)'}
            </button>
          </div>

          {/* View mode switcher */}
          <div className="flex items-center gap-1 rounded-2xl bg-black/20 p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setViewMode('topics')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                viewMode === 'topics' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Daftar Topik
            </button>
            <button
              type="button"
              onClick={() => setViewMode('duolingo')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                viewMode === 'duolingo' ? 'bg-amber-400 text-slate-950 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Jalur Duolingo
            </button>
          </div>
        </div>
      </div>

      {/* Body View */}
      {viewMode === 'duolingo' ? (
        <DuolingoPathView
          course={course}
          progress={progress}
          onOpenActivity={(secId, actId) => setOpenActivity({ sectionId: secId, activityId: actId })}
          onClaimCertificate={() => setShowCertificate(true)}
        />
      ) : (
        /* sections list */
        <div className="mt-6 space-y-4">
        {course.sections.length === 0 && !editMode && (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-slate-700">
            {tr(t, 'lmsNoSections', 'Belum ada topik pada kursus ini.')}
          </div>
        )}

        {course.sections.map((section, si) => {
          const isCollapsed = !!collapsed[section.id];
          const isEditingThis = editingMeta?.id === section.id;
          return (
            <div
              key={section.id}
              className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            >
              {/* title bar */}
              {isEditingThis ? (
                <div className="space-y-2 bg-slate-50 p-4 dark:bg-slate-800">
                  <input
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-brand-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    value={editingMeta.title}
                    onChange={(e) => setEditingMeta({ ...editingMeta, title: e.target.value })}
                    placeholder={tr(t, 'lmsTopicTitle', 'Judul Topik')}
                  />
                  <input
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-brand-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    value={editingMeta.summary}
                    onChange={(e) => setEditingMeta({ ...editingMeta, summary: e.target.value })}
                    placeholder={tr(t, 'lmsTopicSummary', 'Ringkasan topik (opsional)')}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingMeta(null)}
                      className="rounded-xl border-2 border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-500 dark:border-slate-600 cursor-pointer"
                    >
                      {tr(t, 'lmsCancel', 'Batal')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSection(section.id, (s) => ({
                          ...s,
                          title: editingMeta.title.trim() || tr(t, 'lmsNewTopic', 'Topik Baru'),
                          summary: editingMeta.summary,
                        }));
                        setEditingMeta(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border-2 border-brand-orange bg-brand-orange px-3 py-1.5 text-sm font-bold text-white cursor-pointer"
                    >
                      <Check className="h-4 w-4" /> {tr(t, 'lmsSave', 'Simpan')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-slate-50 p-4 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-extrabold text-brand-text dark:text-slate-100">{section.title}</h3>
                    {section.summary && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{section.summary}</p>}
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {section.activities.length} {tr(t, 'lmsActivitiesCount', 'aktivitas')}
                  </span>
                  {editMode && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection(si, -1)}
                        disabled={si === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-700 enabled:cursor-pointer"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(si, 1)}
                        disabled={si === course.sections.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-700 enabled:cursor-pointer"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMeta({ id: section.id, title: section.title, summary: section.summary ?? '' })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-brand-orange dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSection(section.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/30 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* body */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {section.activities.length === 0 && !editMode && (
                    <p className="px-4 py-6 text-center text-sm text-slate-400">{tr(t, 'lmsNoActivities', 'Belum ada aktivitas.')}</p>
                  )}
                  {section.activities.map((activity, ai) => {
                    const meta = ACTIVITY_META[activity.type];
                    const complete = isActivityComplete(activity, progress);
                    return (
                      <div key={activity.id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${meta.tile}`}>
                          <meta.Icon className="h-5 w-5" />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            editMode
                              ? setEditorState({ sectionId: section.id, activity })
                              : setOpenActivity({ sectionId: section.id, activityId: activity.id })
                          }
                          className="min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <p className="truncate font-bold text-brand-text hover:text-brand-orange dark:text-slate-100">
                            {activity.title || tr(t, 'lmsUntitledActivity', 'Aktivitas Tanpa Judul')}
                          </p>
                          {activity.description && (
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{activity.description}</p>
                          )}
                        </button>
                        {editMode ? (
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveActivity(section.id, ai, -1)}
                              disabled={ai === 0}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-700 enabled:cursor-pointer"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveActivity(section.id, ai, 1)}
                              disabled={ai === section.activities.length - 1}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-700 enabled:cursor-pointer"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditorState({ sectionId: section.id, activity })}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-brand-orange dark:hover:bg-slate-700 cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteActivity(section.id, activity.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/30 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="shrink-0" title={complete ? tr(t, 'lmsCompleted', 'Selesai') : ''}>
                            {complete ? (
                              <CheckCircle2 className="h-6 w-6 text-brand-teal" />
                            ) : (
                              <Circle className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {editMode && (
                    <div className="p-3">
                      <button
                        type="button"
                        onClick={() => setPickerSectionId(section.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-bold text-slate-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-600 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" /> {tr(t, 'lmsAddActivity', 'Tambah Aktivitas')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {editMode && (
          <button
            type="button"
            onClick={addSection}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 p-4 font-extrabold text-slate-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-900/60 cursor-pointer"
          >
            <FolderPlus className="h-5 w-5" /> {tr(t, 'lmsAddTopic', 'Tambah Topik Baru')}
          </button>
        )}
      </div>
      )}

      {/* learner activity modal */}
      {openActivity && openAct && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 p-4 animate-in fade-in">
          <div className="my-6 w-full max-w-3xl rounded-3xl border-2 border-b-4 border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-700">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white ${ACTIVITY_META[openAct.type].tile}`}>
                  {(() => {
                    const Ico = ACTIVITY_META[openAct.type].Icon;
                    return <Ico className="h-5 w-5" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {tr(t, ACTIVITY_META[openAct.type].labelKey, ACTIVITY_LABEL_FALLBACK[openAct.type])}
                  </p>
                  <h3 className="truncate text-lg font-extrabold text-brand-text dark:text-slate-100">{openAct.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenActivity(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {openAct.description && (
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{openAct.description}</p>
              )}
              {openAct.type === 'page' && (
                <PageView
                  activity={openAct}
                  completed={!!progress.completion[openAct.id]}
                  onToggleComplete={(next) => setCompletion(openAct.id, next)}
                />
              )}
              {openAct.type === 'lesson' && (
                <LessonPlayer
                  activity={openAct}
                  progress={progress.lesson?.[openAct.id]}
                  onProgress={(p) => saveLesson(openAct.id, p)}
                  onComplete={() => completeLesson(openAct.id)}
                  t={t}
                />
              )}
              {openAct.type === 'quiz' && (
                <QuizPlayer
                  activity={openAct}
                  progress={progress.quiz[openAct.id]}
                  onSubmit={(pct, answers) =>
                    saveQuiz(openAct.id, pct, answers, pct >= (openAct.quiz?.passPercent ?? 0))
                  }
                />
              )}
              {openAct.type === 'assessment' && (
                <AssessmentPlayer
                  activity={openAct}
                  progress={progress.assessment[openAct.id]}
                  onSubmit={(avg, resultId, answers) => saveAssessment(openAct.id, avg, resultId, answers)}
                />
              )}
              {openAct.type === 'checklist' && (
                <ChecklistPlayer
                  activity={openAct}
                  state={progress.checklist[openAct.id] ?? {}}
                  onChange={(next) => saveChecklist(openAct, next)}
                />
              )}
              {openAct.type === 'assignment' && (
                <AssignmentPlayer
                  activity={openAct}
                  submission={progress.assignment[openAct.id]}
                  onSubmit={(sub) => saveAssignmentSubmission(openAct.id, sub)}
                />
              )}
              {openAct.type === 'forum' && (
                <ForumPlayer
                  activity={openAct}
                  userPosts={progress.forumPosts?.[openAct.id]}
                  onAddPost={(post) => addForumPost(openAct.id, post)}
                  onAddReply={(postId, reply) => addForumReply(openAct.id, postId, reply)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* type picker */}
      {pickerSectionId && (
        <ActivityTypePicker onPick={openPickerActivity} onCancel={() => setPickerSectionId(null)} />
      )}

      {/* activity editor */}
      {editorState && (
        <ActivityEditor
          activity={editorState.activity}
          onSave={(a) => saveActivity(editorState.sectionId, a)}
          onCancel={() => setEditorState(null)}
        />
      )}

      {/* gradebook modal */}
      {showGradebook && (
        <GradebookModal
          course={course}
          progress={progress}
          onClose={() => setShowGradebook(false)}
        />
      )}

      {/* certificate modal */}
      {showCertificate && (
        <CertificateModal
          course={course}
          progress={progress}
          onUpdateName={updateStudentName}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* course export modal */}
      {showExportModal && (
        <CourseExportModal
          course={course}
          progress={progress}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
