import { useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import type { Activity, AssessmentProgress, AssessmentResult } from '../types';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface AssessmentPlayerProps {
  activity: Activity;
  progress?: AssessmentProgress;
  onSubmit: (avg: number, resultId: string, answers: Record<string, string>) => void;
}

function pickBand(results: AssessmentResult[], avg: number): AssessmentResult | undefined {
  if (results.length === 0) return undefined;
  const sorted = [...results].sort((a, b) => a.minAvg - b.minAvg);
  let chosen = sorted[0];
  for (const r of sorted) {
    if (avg >= r.minAvg) chosen = r;
  }
  return chosen;
}

export function AssessmentPlayer({ activity, progress, onSubmit }: AssessmentPlayerProps) {
  const { t } = useLanguage();
  const assessment = activity.assessment ?? { questions: [], results: [] };
  const [answers, setAnswers] = useState<Record<string, string>>(progress?.answers ?? {});
  const [submitted, setSubmitted] = useState<boolean>(progress != null);

  const allAnswered = assessment.questions.every((q) => answers[q.id] != null);

  function computeAvg(map: Record<string, string>): number {
    const scores: number[] = [];
    for (const q of assessment.questions) {
      const optId = map[q.id];
      if (optId == null) continue;
      const opt = q.options.find((o) => o.id === optId);
      if (opt) scores.push(opt.score);
    }
    if (scores.length === 0) return 0;
    return scores.reduce((s, n) => s + n, 0) / scores.length;
  }

  const avg = submitted ? (progress?.avg ?? computeAvg(answers)) : computeAvg(answers);
  const band = submitted
    ? assessment.results.find((r) => r.id === progress?.resultId) ?? pickBand(assessment.results, avg)
    : undefined;

  function handleSubmit() {
    const a = computeAvg(answers);
    const b = pickBand(assessment.results, a);
    setSubmitted(true);
    onSubmit(a, b?.id ?? '', answers);
  }

  function retry() {
    setSubmitted(false);
    setAnswers({});
  }

  if (assessment.questions.length === 0) {
    return <p className="italic text-slate-400">{tr(t, 'lmsAssessmentEmpty', 'Belum ada pertanyaan pada asesmen ini.')}</p>;
  }

  if (submitted && band) {
    return (
      <div className="space-y-5">
        <div className={`rounded-3xl border-2 border-b-4 border-white/20 bg-gradient-to-br ${band.color} p-6 text-white shadow-lg`}>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" /> {tr(t, 'lmsAssessmentResult', 'Hasil Profil')}
          </div>
          <h3 className="text-2xl font-extrabold">{band.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/90">{band.description}</p>
          <p className="mt-4 text-xs font-semibold text-white/80">
            {tr(t, 'lmsAssessmentScore', 'Skor rata-rata')}: {avg.toFixed(2)}
          </p>
        </div>
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-300 bg-white px-5 py-2.5 font-extrabold text-brand-text transition active:translate-y-0.5 hover:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
        >
          <RotateCcw className="h-5 w-5" /> {tr(t, 'lmsAssessmentRetake', 'Ulangi Asesmen')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {assessment.questions.map((q, qi) => (
          <div key={q.id} className="rounded-3xl border-2 border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-3 font-bold text-brand-text dark:text-slate-100">
              <span className="mr-2 text-amber-500">{qi + 1}.</span>
              {q.text}
            </p>
            <div className="grid gap-2">
              {q.options.map((opt) => {
                const chosen = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-2.5 text-left transition cursor-pointer ${
                      chosen
                        ? 'border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
                        : 'border-slate-200 bg-slate-50 hover:border-amber-400 dark:border-slate-600 dark:bg-slate-900/40'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        chosen ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-500'
                      }`}
                    >
                      {chosen && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span className="flex-1 text-sm text-brand-text dark:text-slate-200">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!allAnswered}
        onClick={handleSubmit}
        className="w-full rounded-2xl border-2 border-b-4 border-amber-500 bg-amber-500 px-6 py-3 font-extrabold text-white transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 enabled:cursor-pointer"
      >
        {tr(t, 'lmsAssessmentSubmit', 'Lihat Hasil')}
      </button>
    </div>
  );
}
