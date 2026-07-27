import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  HelpCircle,
  Play,
  CheckSquare,
  FileText,
  UploadCloud,
  MessageSquare,
} from 'lucide-react';
import type { Course, CourseProgress, Section, Activity } from '../types';
import { isActivityComplete, courseProgressPercent } from '../store';

export interface DuolingoPathViewProps {
  course: Course;
  progress: CourseProgress;
  onOpenActivity: (sectionId: string, activityId: string) => void;
  onClaimCertificate: () => void;
}

export function DuolingoPathView({
  course,
  progress,
  onOpenActivity,
  onClaimCertificate,
}: DuolingoPathViewProps) {
  const overallPercent = courseProgressPercent(course, progress);

  // Flatten all activities with section context
  const flatNodes: {
    sectionId: string;
    sectionTitle: string;
    activity: Activity;
    isCompleted: boolean;
    isLocked: boolean;
  }[] = [];

  let previousCompleted = true; // First node is always unlocked

  for (const section of course.sections || []) {
    for (const activity of section.activities || []) {
      const completed = isActivityComplete(activity, progress);
      const locked = !previousCompleted;
      flatNodes.push({
        sectionId: section.id,
        sectionTitle: section.title,
        activity,
        isCompleted: completed,
        isLocked: locked,
      });
      previousCompleted = completed;
    }
  }

  return (
    <div className="flex flex-col items-center py-8 space-y-8 animate-in fade-in">
      {/* Duolingo Header Banner */}
      <div className="w-full max-w-xl rounded-3xl border-2 border-b-4 border-emerald-300 bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-white mb-2">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black tracking-wide">Pohon Pembelajaran Duolingo-Style</h2>
        <p className="text-xs text-white/90 mt-1 max-w-md mx-auto">
          Selesaikan setiap tantangan secara berurutan untuk membuka modul dan kuis berikutnya!
        </p>

        <div className="mt-4 flex items-center justify-center gap-3 bg-black/20 rounded-2xl p-3 max-w-xs mx-auto">
          <span className="text-xs font-extrabold uppercase">Progres Keseluruhan</span>
          <span className="text-lg font-black text-amber-300">{overallPercent}%</span>
        </div>
      </div>

      {/* Path Nodes List */}
      <div className="relative flex flex-col items-center space-y-12 w-full max-w-md py-4">
        {flatNodes.map((node, index) => {
          // Zigzag offset pattern ala Duolingo (0px, 36px right, 0px, -36px left)
          const offsets = ['translate-x-0', 'translate-x-12', 'translate-x-0', '-translate-x-12'];
          const offsetClass = offsets[index % offsets.length];

          const { activity, isCompleted, isLocked, sectionId } = node;

          return (
            <div
              key={activity.id}
              className={`relative flex flex-col items-center ${offsetClass} transition-transform`}
            >
              {/* Connector line to next node */}
              {index < flatNodes.length - 1 && (
                <div className="absolute top-16 h-12 w-1 bg-slate-200 dark:bg-slate-800 -z-10" />
              )}

              {/* Circle Node Button */}
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onOpenActivity(sectionId, activity.id)}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-xl transition-all cursor-pointer ${
                  isCompleted
                    ? 'border-emerald-400 bg-emerald-500 text-white hover:scale-105 active:scale-95 ring-4 ring-emerald-200 dark:ring-emerald-950'
                    : !isLocked
                    ? 'border-brand-orange bg-brand-orange text-brand-text hover:scale-105 active:scale-95 animate-bounce'
                    : 'border-slate-300 bg-slate-200 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-10 w-10" />
                ) : isLocked ? (
                  <Lock className="h-8 w-8" />
                ) : (
                  <>
                    {activity.type === 'page' && <BookOpen className="h-9 w-9" />}
                    {activity.type === 'quiz' && <HelpCircle className="h-9 w-9" />}
                    {activity.type === 'checklist' && <CheckSquare className="h-9 w-9" />}
                    {activity.type === 'assignment' && <UploadCloud className="h-9 w-9" />}
                    {activity.type === 'forum' && <MessageSquare className="h-9 w-9" />}
                    {activity.type === 'assessment' && <Sparkles className="h-9 w-9" />}
                  </>
                )}

                {/* Step badge number */}
                <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white shadow dark:bg-white dark:text-slate-900">
                  {index + 1}
                </span>
              </button>

              {/* Node Title Label */}
              <div className="mt-3 text-center max-w-[200px]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  {node.sectionTitle}
                </span>
                <h4 className="text-xs font-black text-brand-text dark:text-slate-100 line-clamp-2">
                  {activity.title}
                </h4>
                {isCompleted && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ Selesai
                  </span>
                )}
                {!isCompleted && !isLocked && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-brand-orange">
                    ▶ Mulai Sekarang
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Final Node: Completion Certificate */}
        <div className="relative flex flex-col items-center pt-6">
          <button
            type="button"
            disabled={overallPercent < 100}
            onClick={onClaimCertificate}
            className={`flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-2xl transition-all ${
              overallPercent >= 100
                ? 'border-amber-300 bg-amber-400 text-slate-950 hover:scale-110 cursor-pointer animate-pulse ring-8 ring-amber-200 dark:ring-amber-950'
                : 'border-slate-300 bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 dark:border-slate-700 dark:bg-slate-800'
            }`}
          >
            <Award className="h-12 w-12" />
          </button>
          <div className="mt-3 text-center">
            <h4 className="text-sm font-black text-brand-text dark:text-slate-100">
              Sertifikat Kelulusan
            </h4>
            <p className="text-[11px] text-slate-400">
              {overallPercent >= 100
                ? 'Klaim Sertifikat Anda Sekarang!'
                : 'Selesaikan 100% materi untuk membuka'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
