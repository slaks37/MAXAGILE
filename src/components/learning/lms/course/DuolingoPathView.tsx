import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  HelpCircle,
  CheckSquare,
  UploadCloud,
  MessageSquare,
  ClipboardCheck,
  Trophy,
} from 'lucide-react';
import type { Course, CourseProgress, Activity, ActivityType } from '../types';
import { isActivityComplete, courseProgressPercent } from '../store';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface DuolingoPathViewProps {
  course: Course;
  progress: CourseProgress;
  onOpenActivity: (sectionId: string, activityId: string) => void;
  onClaimCertificate: () => void;
}

/**
 * Icon per activity type. `lesson` used to be missing here, which rendered an
 * empty circle for every interactive lesson on the path.
 */
const NODE_ICON: Record<ActivityType, (p: { className?: string }) => React.JSX.Element> = {
  lesson: (p) => <Sparkles {...p} />,
  page: (p) => <BookOpen {...p} />,
  quiz: (p) => <HelpCircle {...p} />,
  assessment: (p) => <ClipboardCheck {...p} />,
  checklist: (p) => <CheckSquare {...p} />,
  assignment: (p) => <UploadCloud {...p} />,
  forum: (p) => <MessageSquare {...p} />,
};

interface PathNode {
  sectionId: string;
  sectionTitle: string;
  sectionIndex: number;
  /** true for the first node of each section, so we can print a divider */
  startsSection: boolean;
  activity: Activity;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
}

export function DuolingoPathView({
  course,
  progress,
  onOpenActivity,
  onClaimCertificate,
}: DuolingoPathViewProps) {
  const { t } = useLanguage();
  const overallPercent = courseProgressPercent(course, progress);

  // Flatten every activity of every section — the path must mirror the topic
  // list exactly, so nothing is filtered out here.
  const nodes: PathNode[] = [];
  let previousCompleted = true; // the first node is always unlocked
  let currentTaken = false;

  (course.sections || []).forEach((section, sectionIndex) => {
    (section.activities || []).forEach((activity, activityIndex) => {
      const completed = isActivityComplete(activity, progress);
      const locked = !previousCompleted;
      const isCurrent = !completed && !locked && !currentTaken;
      if (isCurrent) currentTaken = true;
      nodes.push({
        sectionId: section.id,
        sectionTitle: section.title,
        sectionIndex,
        startsSection: activityIndex === 0,
        activity,
        isCompleted: completed,
        isLocked: locked,
        isCurrent,
      });
      previousCompleted = completed;
    });
  });

  const doneCount = nodes.filter((n) => n.isCompleted).length;

  return (
    <div className="mt-6 animate-in fade-in">
      {/* Journey header */}
      <div className="mx-auto w-full max-w-2xl rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-amber-400 text-white shadow-md">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold leading-tight text-brand-text dark:text-slate-100">
              {tr(t, 'lmsYourJourney', 'Your Journey')}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {tr(t, 'lmsJourneyHint', 'Selesaikan satu per satu untuk membuka langkah berikutnya.')}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-extrabold text-brand-orange">{overallPercent}%</div>
            <div className="text-[11px] font-bold text-slate-400">
              {doneCount}/{nodes.length}
            </div>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-brand-orange transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Path */}
      <div className="mx-auto mt-8 w-full max-w-2xl">
        {nodes.length === 0 && (
          <p className="rounded-3xl border-2 border-dashed border-slate-300 p-10 text-center text-sm font-bold text-slate-400 dark:border-slate-700">
            {tr(t, 'lmsNoSections', 'Belum ada topik pada kursus ini.')}
          </p>
        )}

        {nodes.map((node, index) => {
          const { activity, isCompleted, isLocked, isCurrent, sectionId } = node;
          // Gentle alternation keeps the path lively without breaking the
          // vertical spine that visually connects the steps.
          const side = index % 2 === 0 ? 'sm:pr-16' : 'sm:pl-16';
          const Icon = NODE_ICON[activity.type] || NODE_ICON.page;

          return (
            <div key={activity.id}>
              {node.startsSection && (
                <div className="mb-4 flex items-center gap-3 pt-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-extrabold text-white dark:bg-white dark:text-slate-900">
                    {node.sectionIndex + 1}
                  </span>
                  <h3 className="min-w-0 flex-1 truncate text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {node.sectionTitle}
                  </h3>
                </div>
              )}

              <div className={`relative ${side}`}>
                {/* the spine: a continuous line behind every row */}
                {index < nodes.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[27px] top-14 -z-10 w-1 rounded-full ${
                      isCompleted ? 'bg-brand-teal/40' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    style={{ height: 'calc(100% + 1.25rem)' }}
                  />
                )}

                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => onOpenActivity(sectionId, activity.id)}
                  className={`mb-5 flex w-full items-center gap-4 rounded-3xl border-2 border-b-4 p-3.5 text-left transition-all ${
                    isLocked
                      ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70 dark:border-slate-800 dark:bg-slate-900/50'
                      : isCompleted
                        ? 'cursor-pointer border-brand-teal/40 bg-brand-teal/5 hover:border-brand-teal active:translate-y-[2px] active:border-b-2'
                        : 'cursor-pointer border-brand-orange bg-white shadow-md hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2 dark:bg-slate-900'
                  }`}
                >
                  {/* node circle */}
                  <span
                    className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 ${
                      isCompleted
                        ? 'border-brand-teal/30 bg-brand-teal text-white'
                        : isLocked
                          ? 'border-slate-200 bg-slate-200 text-slate-400 dark:border-slate-700 dark:bg-slate-800'
                          : 'border-brand-orange/30 bg-brand-orange text-white'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : isLocked ? (
                      <Lock className="h-6 w-6" />
                    ) : (
                      <Icon className="h-7 w-7" />
                    )}
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-extrabold text-white shadow dark:bg-white dark:text-slate-900">
                      {index + 1}
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-extrabold leading-snug text-brand-text dark:text-slate-100">
                      {activity.title}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs font-bold ${
                        isCompleted
                          ? 'text-brand-teal'
                          : isLocked
                            ? 'text-slate-400'
                            : 'text-brand-orange'
                      }`}
                    >
                      {isCompleted
                        ? tr(t, 'lmsCompleted', 'Selesai')
                        : isLocked
                          ? tr(t, 'lmsLocked', 'Terkunci')
                          : tr(t, 'lmsStartNow', 'Mulai sekarang')}
                    </span>
                  </span>

                  {isCurrent && (
                    <span className="shrink-0 rounded-full bg-brand-orange px-3 py-1.5 text-[11px] font-extrabold text-white">
                      {tr(t, 'lmsHereNow', 'Di sini')}
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Finish line */}
        <div className="mt-2 flex flex-col items-center rounded-3xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <button
            type="button"
            disabled={overallPercent < 100}
            onClick={onClaimCertificate}
            className={`flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all ${
              overallPercent >= 100
                ? 'cursor-pointer border-amber-300 bg-amber-400 text-slate-950 shadow-xl hover:scale-105'
                : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800'
            }`}
          >
            {overallPercent >= 100 ? <Trophy className="h-10 w-10" /> : <Award className="h-9 w-9" />}
          </button>
          <h4 className="mt-3 text-sm font-extrabold text-brand-text dark:text-slate-100">
            {tr(t, 'lmsCertificate', 'Sertifikat Kelulusan')}
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            {overallPercent >= 100
              ? tr(t, 'lmsClaimCertificate', 'Klaim sertifikat Anda sekarang!')
              : tr(t, 'lmsCertificateLocked', 'Selesaikan semua langkah untuk membukanya.')}
          </p>
        </div>
      </div>
    </div>
  );
}
