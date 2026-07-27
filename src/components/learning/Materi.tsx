import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen, CheckCircle, ChevronLeft, ChevronRight, PlayCircle, Code2, Trash2, Plus,
  Search, Download, FileText, Presentation, Table2, File, PartyPopper, Upload
} from 'lucide-react';
import { MaterialEncoderModal } from './MaterialEncoderModal';
import { builtinCourses } from './courseContent';
import {
  LmsCourse, LessonAttachment, ProgressMap,
  attachmentKind, formatBytes, loadProgress, saveProgress, parseCourseRow
} from './lmsTypes';
import { useLanguage } from '../../i18n/LanguageContext';

interface DisplayLesson {
  id: string;
  title: string;
  node?: React.ReactNode;
  text?: string;
  attachments?: LessonAttachment[];
}

interface DisplayCourse {
  id: string;
  title: string;
  summary: string;
  category: string;
  color: string;
  icon: React.ReactNode;
  isCustom: boolean;
  lessons: DisplayLesson[];
}

const DOC_STYLES: Record<string, { tile: string; icon: React.ReactNode }> = {
  ppt: { tile: 'bg-orange-500', icon: <Presentation className="text-white" size={22} /> },
  word: { tile: 'bg-blue-600', icon: <FileText className="text-white" size={22} /> },
  excel: { tile: 'bg-green-600', icon: <Table2 className="text-white" size={22} /> },
  other: { tile: 'bg-gray-500', icon: <File className="text-white" size={22} /> },
};

function AttachmentView({ att, t }: { att: LessonAttachment; t: (key: string) => string }) {
  const kind = attachmentKind(att.mimeType, att.name);

  if (kind === 'image') {
    return (
      <img
        src={att.url}
        alt={att.name}
        className="max-w-full rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm"
      />
    );
  }

  if (kind === 'pdf') {
    return (
      <div className="space-y-2">
        <iframe
          src={att.url}
          title={att.name}
          className="h-[480px] w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white"
        />
        <a
          href={att.url}
          download={att.name}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-orange hover:underline"
        >
          <Download size={14} /> {t('lmsDownload')} — {att.name}
        </a>
      </div>
    );
  }

  if (kind === 'video') {
    return <video controls src={att.url} className="rounded-2xl w-full border border-gray-200 dark:border-slate-700" />;
  }

  if (kind === 'audio') {
    return <audio controls src={att.url} className="w-full" />;
  }

  const style = DOC_STYLES[kind] || DOC_STYLES.other;
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm">
      <div className={`w-12 h-12 rounded-2xl ${style.tile} flex items-center justify-center shrink-0 shadow-md`}>
        {style.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold text-brand-text dark:text-white truncate">{att.name}</p>
        <p className="text-xs font-bold text-gray-400">{formatBytes(att.size)}</p>
      </div>
      <a
        href={att.url}
        download={att.name}
        className="px-4 py-2.5 bg-brand-text dark:bg-brand-orange text-white text-xs font-extrabold rounded-2xl border-2 border-transparent border-b-4 hover:bg-black transition-all flex items-center gap-2 shrink-0 cursor-pointer"
      >
        <Download size={14} /> {t('lmsDownload')}
      </a>
    </div>
  );
}

export function Materi() {
  const { t, language } = useLanguage();
  const lang: 'id' | 'en' = language === 'id' ? 'id' : 'en';

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<number>(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [customCourses, setCustomCourses] = useState<LmsCourse[]>([]);
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const [showStudio, setShowStudio] = useState(false);
  const [studioTab, setStudioTab] = useState<'create' | 'import'>('create');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const migrationRan = useRef(false);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) return;
      const rows = await res.json();
      setCustomCourses(Array.isArray(rows) ? rows.map(parseCourseRow) : []);
    } catch {
      // server unavailable — keep whatever we have
    }
  };

  // One-time migration of old localStorage courses into the API, then fetch.
  useEffect(() => {
    if (migrationRan.current) return;
    migrationRan.current = true;
    const run = async () => {
      try {
        const savedCustom = localStorage.getItem('maxagile-custom-courses');
        if (savedCustom) {
          const old = JSON.parse(savedCustom);
          if (Array.isArray(old)) {
            for (const c of old) {
              if (!c || typeof c !== 'object' || !c.title) continue;
              try {
                await fetch('/api/courses', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: c.title,
                    category: c.category || 'Umum',
                    summary: c.summary || '',
                    color: c.color || 'from-brand-orange to-amber-400',
                    lessons: JSON.stringify(Array.isArray(c.lessons) ? c.lessons : []),
                  }),
                });
              } catch {
                // skip courses that fail to migrate
              }
            }
          }
          localStorage.removeItem('maxagile-custom-courses');
        }
      } catch {
        // corrupt legacy data — drop it silently
        try { localStorage.removeItem('maxagile-custom-courses'); } catch {}
      }
      await fetchCourses();
    };
    run();
  }, []);

  const updateProgress = (courseId: string, updater: (cur: { completed: string[]; lastLessonIndex: number }) => { completed: string[]; lastLessonIndex: number }) => {
    setProgress(prev => {
      const cur = prev[courseId] || { completed: [], lastLessonIndex: 0, updatedAt: new Date().toISOString() };
      const updated = updater({ completed: cur.completed, lastLessonIndex: cur.lastLessonIndex });
      const next: ProgressMap = {
        ...prev,
        [courseId]: { ...updated, updatedAt: new Date().toISOString() },
      };
      saveProgress(next);
      return next;
    });
  };

  const allCourses: DisplayCourse[] = useMemo(() => {
    const builtins: DisplayCourse[] = builtinCourses(lang).map(c => ({
      id: c.id,
      title: c.title,
      summary: '',
      category: 'Agile',
      color: c.color,
      icon: c.icon,
      isCustom: false,
      lessons: c.lessons.map(l => ({ id: l.id, title: l.title, node: l.content })),
    }));
    const customs: DisplayCourse[] = customCourses.map(c => ({
      id: c.id,
      title: c.title,
      summary: c.summary,
      category: c.category || 'Umum',
      color: c.color || 'from-brand-orange to-amber-400',
      icon: <Code2 className="text-white" size={24} />,
      isCustom: true,
      lessons: c.lessons.map(l => ({
        id: l.id,
        title: l.title,
        text: l.content,
        attachments: l.attachments,
      })),
    }));
    return [...builtins, ...customs];
  }, [lang, customCourses]);

  const getCourseProgress = (course: DisplayCourse): number => {
    if (course.lessons.length === 0) return 0;
    const completed = progress[course.id]?.completed || [];
    const done = course.lessons.filter(l => completed.includes(l.id)).length;
    return Math.round((done / course.lessons.length) * 100);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('Agile');
    customCourses.forEach(c => { if (c.category) set.add(c.category); });
    return Array.from(set);
  }, [customCourses]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCourses.filter(c => {
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
    });
  }, [allCourses, search, categoryFilter]);

  const continueCourse = useMemo(() => {
    const candidates = allCourses
      .map(c => ({ course: c, pct: getCourseProgress(c), updatedAt: progress[c.id]?.updatedAt || '' }))
      .filter(x => x.pct > 0 && x.pct < 100)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return candidates.length > 0 ? candidates[0] : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCourses, progress]);

  const course = allCourses.find(c => c.id === activeCourseId) || null;

  const openCourse = (c: DisplayCourse, resume: boolean) => {
    const last = progress[c.id]?.lastLessonIndex || 0;
    const idx = resume ? Math.min(Math.max(last, 0), Math.max(c.lessons.length - 1, 0)) : 0;
    setActiveCourseId(c.id);
    setActiveLesson(idx);
    setShowCompletion(false);
  };

  const goToLesson = (idx: number) => {
    if (!course) return;
    const clamped = Math.min(Math.max(idx, 0), course.lessons.length - 1);
    setActiveLesson(clamped);
    setShowCompletion(false);
    updateProgress(course.id, cur => ({ ...cur, lastLessonIndex: clamped }));
  };

  const toggleComplete = (lessonId: string) => {
    if (!course) return;
    updateProgress(course.id, cur => ({
      ...cur,
      completed: cur.completed.includes(lessonId)
        ? cur.completed.filter(id => id !== lessonId)
        : [...cur.completed, lessonId],
    }));
  };

  const markComplete = (lessonId: string) => {
    if (!course) return;
    updateProgress(course.id, cur => ({
      ...cur,
      completed: cur.completed.includes(lessonId) ? cur.completed : [...cur.completed, lessonId],
    }));
  };

  const handleNext = () => {
    if (!course) return;
    const lesson = course.lessons[activeLesson];
    if (lesson) markComplete(lesson.id);
    if (activeLesson < course.lessons.length - 1) {
      goToLesson(activeLesson + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handleDeleteCustomCourse = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('lmsDeleteCourseConfirm'))) return;
    try {
      await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
    } catch {
      // ignore network errors; refetch below reflects the real state
    }
    if (activeCourseId === courseId) setActiveCourseId(null);
    await fetchCourses();
  };

  const handleImportSuccess = (newCourse: LmsCourse) => {
    setCustomCourses(prev => [newCourse, ...prev.filter(c => c.id !== newCourse.id)]);
    fetchCourses();
  };

  const openStudio = (tab: 'create' | 'import') => {
    setStudioTab(tab);
    setShowStudio(true);
  };

  // ---------------------------------------------------------------------------
  // COURSE PLAYER
  // ---------------------------------------------------------------------------
  if (activeCourseId && course) {
    const lesson = course.lessons[activeLesson];
    const pct = getCourseProgress(course);
    const completedIds = progress[course.id]?.completed || [];
    const isLast = activeLesson === course.lessons.length - 1;
    const lessonDone = lesson ? completedIds.includes(lesson.id) : false;

    return (
      <div className="max-w-5xl mx-auto py-8 animate-in fade-in zoom-in duration-300 px-4">
        <button
          onClick={() => setActiveCourseId(null)}
          className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-text mb-6 flex items-center gap-2 hover:-translate-x-1 transition-transform bg-white dark:bg-slate-800 px-5 py-2.5 rounded-2xl border-2 border-gray-200 dark:border-slate-700 border-b-4 hover:bg-gray-50 cursor-pointer"
        >
          &larr; {t('lmsBackToCatalog')}
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sticky top-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-6 shadow-lg shadow-blue-100/50`}>
                {course.icon}
              </div>
              <h3 className="font-extrabold text-2xl text-brand-text dark:text-white mb-4 leading-tight">{course.title}</h3>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  <span>{t('lmsProgressLabel')}</span>
                  <span className={pct === 100 ? 'text-brand-teal' : 'text-brand-orange'}>{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ease-out ${pct === 100 ? 'bg-brand-teal' : 'bg-brand-orange'}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">{t('lmsCurriculum')}</h4>
              <div className="space-y-3">
                {course.lessons.map((l, idx) => {
                  const isCompleted = completedIds.includes(l.id);
                  const isActive = activeLesson === idx && !showCompletion;
                  return (
                    <button
                      key={l.id}
                      onClick={() => goToLesson(idx)}
                      className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all cursor-pointer ${isActive ? 'bg-brand-blue/80 dark:bg-slate-800 text-brand-orange font-bold shadow-sm border border-brand-orange/20' : 'hover:bg-brand-bg dark:hover:bg-slate-800/50 text-gray-600 dark:text-gray-300 font-medium border border-transparent'}`}
                    >
                      <span className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-brand-orange/10 text-brand-orange' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                        {idx + 1}
                      </span>
                      {isCompleted
                        ? <CheckCircle size={22} className="text-brand-teal shrink-0" />
                        : <PlayCircle size={22} className={isActive ? 'text-brand-orange shrink-0' : 'text-gray-300 shrink-0'} />}
                      <span className="text-sm leading-tight flex-1">{l.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main panel */}
          <div className="w-full md:w-2/3">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-[500px]">
              {showCompletion ? (
                <div className="p-10 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-teal to-emerald-400 flex items-center justify-center mb-8 shadow-xl">
                    <PartyPopper className="text-white" size={44} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-brand-text dark:text-white mb-3">{t('lmsCourseComplete')}</h2>
                  <p className="text-gray-500 dark:text-gray-300 font-medium mb-8 max-w-md">{t('lmsCourseCompleteDesc')}</p>
                  <button
                    onClick={() => setActiveCourseId(null)}
                    className="px-8 py-4 bg-brand-text dark:bg-brand-orange hover:bg-black text-white font-extrabold rounded-2xl border-2 border-transparent border-b-4 shadow-sm transition-all flex items-center gap-3 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {t('lmsBackToCatalog')}
                  </button>
                </div>
              ) : lesson ? (
                <>
                  <div className="p-8 md:p-10 flex-1 bg-white dark:bg-slate-900">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue dark:bg-slate-800 text-brand-orange text-xs font-bold rounded-full mb-6 uppercase tracking-widest border border-brand-orange/20">
                      <BookOpen size={14} /> {t('lmsLessonBadge')} {activeLesson + 1}/{course.lessons.length}
                    </div>
                    <h2 className="text-3xl font-extrabold text-brand-text dark:text-white mb-8 leading-tight">{lesson.title}</h2>
                    <div className="prose prose-blue dark:prose-invert max-w-none">
                      {lesson.node}
                      {lesson.text !== undefined && (
                        <div className="space-y-4">
                          {course.isCustom && (
                            <div className="bg-brand-orange/5 p-4 rounded-xl border border-brand-orange/20 text-xs font-extrabold text-brand-orange uppercase">
                              {t('lmsImportedBadge')}
                            </div>
                          )}
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                            {lesson.text}
                          </p>
                        </div>
                      )}
                    </div>

                    {lesson.attachments && lesson.attachments.length > 0 && (
                      <div className="mt-10 space-y-4">
                        <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">{t('lmsAttachments')}</h4>
                        {lesson.attachments.map(att => (
                          <div key={att.id}>
                            <AttachmentView att={att} t={t} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 bg-brand-bg/80 dark:bg-slate-850 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <button
                      onClick={() => goToLesson(activeLesson - 1)}
                      disabled={activeLesson === 0}
                      className="px-5 py-3 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-2xl border-2 border-gray-200 dark:border-slate-700 border-b-4 hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={18} /> {t('lmsPrevLesson')}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleComplete(lesson.id)}
                        className={`px-4 py-3 text-xs font-bold rounded-2xl border-2 transition-all flex items-center gap-2 cursor-pointer ${lessonDone ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/30' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-brand-teal/40'}`}
                      >
                        <CheckCircle size={16} /> {t('lmsMarkComplete')}
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-8 py-4 bg-brand-text dark:bg-brand-orange hover:bg-black text-white font-extrabold rounded-2xl border-2 border-transparent border-b-4 shadow-sm transition-all flex items-center gap-3 hover:gap-4 hover:-translate-y-0.5 cursor-pointer"
                      >
                        {isLast ? t('lmsFinishCourse') : t('lmsNextLesson')}
                        <ChevronRight size={22} />
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CATALOG
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      {/* Academy banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-gradient-to-r from-brand-orange/10 via-amber-50 to-transparent p-6 rounded-3xl border border-brand-orange/20">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-text dark:text-white flex items-center gap-3">
            <BookOpen className="text-brand-orange" size={32} />
            MaxAgile Academy
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-xl font-medium">
            {t('lmsAcademySubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
          <button
            onClick={() => openStudio('create')}
            className="px-6 py-3.5 bg-brand-orange text-white rounded-2xl font-extrabold text-xs shadow-lg hover:bg-brand-orange/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Plus size={18} />
            <span>{t('lmsCourseStudio')}</span>
          </button>
          <button
            onClick={() => openStudio('import')}
            className="px-6 py-3.5 bg-white dark:bg-slate-800 text-brand-text dark:text-white rounded-2xl font-extrabold text-xs border-2 border-gray-200 dark:border-slate-700 border-b-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Upload size={18} className="text-brand-orange" />
            <span>{t('lmsImportFromFile')}</span>
          </button>
        </div>
      </div>

      {/* Continue learning strip */}
      {continueCourse && (
        <div className="mb-10 bg-white dark:bg-slate-900 rounded-3xl border-2 border-gray-100 dark:border-slate-800 border-b-8 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm animate-in fade-in duration-300">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${continueCourse.course.color} flex items-center justify-center shrink-0 shadow-xl`}>
            {continueCourse.course.icon}
          </div>
          <div className="flex-1 w-full min-w-0">
            <p className="text-xs font-extrabold text-brand-orange uppercase tracking-wider mb-1">{t('lmsContinueLearning')}</p>
            <h3 className="font-extrabold text-xl text-brand-text dark:text-white truncate mb-3">{continueCourse.course.title}</h3>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div className="h-3 rounded-full bg-brand-orange transition-all duration-700" style={{ width: `${continueCourse.pct}%` }}></div>
            </div>
          </div>
          <button
            onClick={() => openCourse(continueCourse.course, true)}
            className="px-8 py-4 bg-brand-text dark:bg-brand-orange hover:bg-black text-white font-extrabold rounded-2xl border-2 border-transparent border-b-4 shadow-sm transition-all flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            {t('lmsResumeCourse')} <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Controls row */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('lmsSearchCourses')}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-brand-text dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${categoryFilter === 'all' ? 'bg-brand-text text-white border-2 border-brand-text' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}
          >
            {t('lmsAllCategories')}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${categoryFilter === cat ? 'bg-brand-text text-white border-2 border-brand-text' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {filteredCourses.length === 0 ? (
        <div className="py-20 text-center text-gray-400 font-bold text-sm">
          {t('lmsNoCoursesFound')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCourses.map(c => {
            const pct = getCourseProgress(c);
            return (
              <div
                key={c.id}
                onClick={() => openCourse(c, true)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-gray-100 dark:border-slate-800 border-b-8 hover:border-b-4 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all duration-200 shadow-sm cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-850 rounded-full -z-10 group-hover:scale-125 transition-transform duration-700"></div>

                <div className="flex gap-8">
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0 shadow-xl group-hover:scale-105 transition-transform duration-300 text-white`}>
                    {c.icon}
                  </div>
                  <div className="flex-1 flex flex-col justify-center py-2 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-extrabold text-2xl text-brand-text dark:text-white group-hover:text-brand-orange transition-colors leading-tight truncate">
                        {c.title}
                      </h3>
                      {c.isCustom && (
                        <button
                          type="button"
                          title={t('deleteMaterial')}
                          onClick={(e) => handleDeleteCustomCourse(c.id, e)}
                          className="text-gray-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <CheckCircle size={16} className={pct === 100 ? 'text-brand-teal' : 'text-gray-300'} />
                        {c.lessons.length} {t('lmsLessonsLabel')}
                      </p>
                      {c.isCustom && (
                        <span className="px-2.5 py-1 bg-brand-orange/10 text-brand-orange rounded-lg text-[10px] font-extrabold uppercase">
                          {t('lmsMyCourses')}
                        </span>
                      )}
                      {pct === 100 && (
                        <span className="px-2.5 py-1 bg-brand-teal/10 text-brand-teal rounded-lg text-[10px] font-extrabold uppercase">
                          {t('lmsCompleted')}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                        <span>{t('lmsProgressLabel')}</span>
                        <span className="text-brand-orange group-hover:underline flex items-center gap-1">{pct}% <ChevronRight size={14} /></span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className={`h-3 rounded-full transition-all duration-1000 ease-out ${pct === 100 ? 'bg-brand-teal' : 'bg-brand-orange'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Studio modal */}
      <MaterialEncoderModal
        isOpen={showStudio}
        onClose={() => setShowStudio(false)}
        onImportSuccess={handleImportSuccess}
        initialTab={studioTab}
      />
    </div>
  );
}
