import React from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Clock,
  BarChart3,
  FileText,
  HelpCircle,
  ClipboardCheck,
  CheckSquare,
  UploadCloud,
  MessageSquare,
  Download,
} from 'lucide-react';
import type { Course, CourseProgress } from '../types';
import { isActivityComplete, courseProgressPercent } from '../store';
import { exportGradebookToCsv } from '../exportUtils';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface GradebookModalProps {
  course: Course;
  progress: CourseProgress;
  onClose: () => void;
}

export function GradebookModal({ course, progress, onClose }: GradebookModalProps) {
  const { t } = useLanguage();
  const overallPercent = courseProgressPercent(course, progress);

  // Flatten all activities with section info
  const items: {
    sectionTitle: string;
    activityId: string;
    title: string;
    type: string;
    completed: boolean;
    scoreStr: string;
    numericScore?: number;
  }[] = [];

  let totalScoredCount = 0;
  let totalScoreSum = 0;

  for (const s of course.sections || []) {
    for (const a of s.activities || []) {
      const completed = isActivityComplete(a, progress);
      let scoreStr = '-';
      let numericScore: number | undefined;

      if (a.type === 'quiz') {
        const qp = progress.quiz[a.id];
        if (qp) {
          numericScore = qp.percent;
          scoreStr = `${qp.percent}%`;
          totalScoredCount++;
          totalScoreSum += qp.percent;
        }
      } else if (a.type === 'assignment') {
        const sub = progress.assignment[a.id];
        if (sub && typeof sub.grade === 'number') {
          const max = a.assignment?.maxScore || 100;
          const normalizedPercent = Math.round((sub.grade / max) * 100);
          numericScore = normalizedPercent;
          scoreStr = `${sub.grade} / ${max} (${normalizedPercent}%)`;
          totalScoredCount++;
          totalScoreSum += normalizedPercent;
        } else if (sub && sub.submittedAt) {
          scoreStr = tr(t, 'lmsSubmittedUngraded', 'Terkirim (Belum Dinilai)');
        }
      } else if (a.type === 'assessment') {
        const ap = progress.assessment[a.id];
        if (ap) {
          scoreStr = `${tr(t, 'lmsAvgScale', 'Rata-rata Skala:')} ${ap.avg}`;
        }
      } else if (a.type === 'checklist') {
        const chk = progress.checklist[a.id] || {};
        const totalItems = a.checklist?.items.length || 0;
        const doneItems = Object.values(chk).filter(Boolean).length;
        scoreStr = `${doneItems} / ${totalItems} ${tr(t, 'lmsChecklistItem', 'Item')}`;
      } else if (a.type === 'page') {
        scoreStr = completed
          ? tr(t, 'lmsPageRead', 'Dibaca')
          : tr(t, 'lmsPageUnread', 'Belum Dibaca');
      } else if (a.type === 'forum') {
        const count = progress.forumPosts?.[a.id]?.length || 0;
        scoreStr = `${count} ${tr(t, 'lmsPostsUnit', 'Postingan')}`;
      }

      items.push({
        sectionTitle: s.title,
        activityId: a.id,
        title: a.title,
        type: a.type,
        completed,
        scoreStr,
        numericScore,
      });
    }
  }

  const averageGrade =
    totalScoredCount > 0 ? Math.round(totalScoreSum / totalScoredCount) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-b-4 border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-orange text-brand-text shadow-sm">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-brand-text dark:text-slate-100">
                {tr(t, 'lmsGradebookTitle', 'Buku Nilai & Analitik Belajar')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {course.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => exportGradebookToCsv(course, progress)}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-brand-teal hover:text-brand-teal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              {tr(t, 'lmsExportCsv', 'Ekspor ke CSV')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-extrabold text-slate-400 block uppercase">
              {tr(t, 'lmsCompletionProgress', 'Progres Penyelesaian')}
            </span>
            <span className="text-2xl font-black text-brand-text dark:text-slate-100 mt-1 block">
              {overallPercent}%
            </span>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-teal transition-all"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-extrabold text-slate-400 block uppercase">
              {tr(t, 'lmsAverageGrade', 'Rata-rata Nilai Evaluasi')}
            </span>
            <span className="text-2xl font-black text-brand-orange mt-1 block">
              {totalScoredCount > 0 ? `${averageGrade}%` : tr(t, 'lmsNoneYet', 'Belum ada')}
            </span>
            <span className="text-[11px] text-slate-400">
              {tr(t, 'lmsScoredFrom', 'Dari')} {totalScoredCount}{' '}
              {tr(t, 'lmsScoredItemsUnit', 'kuis & tugas berskor')}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-extrabold text-slate-400 block uppercase">
              {tr(t, 'lmsPassStatus', 'Status Kelulusan')}
            </span>
            <div className="mt-1 flex items-center gap-2">
              {overallPercent >= 100 ? (
                <span className="inline-flex items-center gap-1 text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" /> {tr(t, 'lmsPassedFull', 'Lulus (100%)')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-base font-extrabold text-amber-600 dark:text-amber-400">
                  <Clock className="h-5 w-5" /> {tr(t, 'lmsInProgress', 'Dalam Proses')}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              {items.filter((i) => i.completed).length} {tr(t, 'lmsOfConnector', 'dari')}{' '}
              {items.length} {tr(t, 'lmsActivitiesCompleted', 'Aktivitas Selesai')}
            </span>
          </div>
        </div>

        {/* Table of Grades */}
        <div className="flex-1 overflow-auto p-6">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              {tr(t, 'lmsNoActivitiesInCourse', 'Belum ada aktivitas pada kursus ini.')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[11px] font-extrabold uppercase text-slate-400 dark:border-slate-800">
                    <th className="pb-3 pr-4">{tr(t, 'lmsTopicsLabel', 'Topik')}</th>
                    <th className="pb-3 px-4">{tr(t, 'lmsActivityName', 'Nama Aktivitas')}</th>
                    <th className="pb-3 px-4">{tr(t, 'lmsStatusLabel', 'Status')}</th>
                    <th className="pb-3 pl-4 text-right">{tr(t, 'lmsGradeResult', 'Nilai / Hasil')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((it) => (
                    <tr key={it.activityId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 pr-4 font-bold text-slate-500 dark:text-slate-400">
                        {it.sectionTitle}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-brand-text dark:text-slate-100 flex items-center gap-2">
                        {it.type === 'page' && <FileText className="h-4 w-4 text-blue-500" />}
                        {it.type === 'quiz' && <HelpCircle className="h-4 w-4 text-violet-500" />}
                        {it.type === 'assessment' && <ClipboardCheck className="h-4 w-4 text-amber-500" />}
                        {it.type === 'checklist' && <CheckSquare className="h-4 w-4 text-brand-teal" />}
                        {it.type === 'assignment' && <UploadCloud className="h-4 w-4 text-emerald-500" />}
                        {it.type === 'forum' && <MessageSquare className="h-4 w-4 text-sky-500" />}
                        <span>{it.title}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {it.completed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> {tr(t, 'lmsCompleted', 'Selesai')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {tr(t, 'lmsNotCompleted', 'Belum Selesai')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pl-4 text-right font-extrabold text-brand-text dark:text-slate-100">
                        {it.scoreStr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
