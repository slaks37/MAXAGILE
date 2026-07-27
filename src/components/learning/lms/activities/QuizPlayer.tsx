import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy, AlertTriangle } from 'lucide-react';
import type { Activity, QuizProgress } from '../types';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface QuizPlayerProps {
  activity: Activity;
  progress?: QuizProgress;
  onSubmit: (percent: number, answers: Record<string, string>) => void;
}

export function QuizPlayer({ activity, progress, onSubmit }: QuizPlayerProps) {
  const { t } = useLanguage();
  const quiz = activity.quiz ?? { questions: [], passPercent: 70 };
  const [answers, setAnswers] = useState<Record<string, string>>(progress?.answers ?? {});
  const [submitted, setSubmitted] = useState<boolean>(progress != null);

  const totalPoints = quiz.questions.reduce((s, q) => s + (q.points || 0), 0);

  function compute(map: Record<string, string>): number {
    if (totalPoints <= 0) return quiz.questions.length === 0 ? 100 : 0;
    const earned = quiz.questions.reduce(
      (s, q) => (map[q.id] === q.correctOptionId ? s + (q.points || 0) : s),
      0,
    );
    return Math.round((earned / totalPoints) * 100);
  }

  const percent = submitted ? (progress?.percent ?? compute(answers)) : compute(answers);
  const passed = percent >= quiz.passPercent;
  const allAnswered = quiz.questions.every((q) => answers[q.id] != null);

  function handleSubmit() {
    const p = compute(answers);
    setSubmitted(true);
    onSubmit(p, answers);
  }

  function retry() {
    setSubmitted(false);
    setAnswers({});
  }

  if (quiz.questions.length === 0) {
    return <p className="italic text-slate-400">{tr(t, 'lmsQuizEmpty', 'Belum ada pertanyaan pada kuis ini.')}</p>;
  }

  return (
    <div className="space-y-5">
      {submitted && (
        <div
          className={`flex items-center gap-4 rounded-3xl border-2 border-b-4 p-5 ${
            passed
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30'
              : 'border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-900/30'
          }`}
        >
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {passed ? <Trophy className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
          </div>
          <div>
            <p className="text-2xl font-extrabold text-brand-text dark:text-slate-100">{percent}%</p>
            <p className={`text-sm font-bold ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {passed
                ? tr(t, 'lmsQuizPassed', 'Lulus!')
                : tr(t, 'lmsQuizFailed', 'Belum lulus')}{' '}
              <span className="font-medium text-slate-500 dark:text-slate-400">
                ({tr(t, 'lmsQuizPassMark', 'Nilai minimal')} {quiz.passPercent}%)
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="rounded-3xl border-2 border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-3 font-bold text-brand-text dark:text-slate-100">
              <span className="mr-2 text-brand-orange">{qi + 1}.</span>
              {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const chosen = answers[q.id] === opt.id;
                const isCorrect = opt.id === q.correctOptionId;
                let state =
                  'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40 hover:border-brand-orange';
                if (submitted) {
                  if (isCorrect) state = 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/30';
                  else if (chosen) state = 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-900/30';
                  else state = 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 opacity-70';
                } else if (chosen) {
                  state = 'border-brand-orange bg-amber-50 dark:border-brand-orange dark:bg-amber-900/20';
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-2.5 text-left transition ${state} ${submitted ? '' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        chosen ? 'border-brand-orange bg-brand-orange' : 'border-slate-300 dark:border-slate-500'
                      }`}
                    >
                      {chosen && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span className="flex-1 text-sm text-brand-text dark:text-slate-200">{opt.text}</span>
                    {submitted && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                    {submitted && chosen && !isCorrect && <XCircle className="h-5 w-5 text-rose-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          type="button"
          disabled={!allAnswered}
          onClick={handleSubmit}
          className="w-full rounded-2xl border-2 border-b-4 border-brand-orange bg-brand-orange px-6 py-3 font-extrabold text-white transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 enabled:cursor-pointer"
        >
          {tr(t, 'lmsQuizSubmit', 'Kirim Jawaban')}
        </button>
      ) : (
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-300 bg-white px-5 py-2.5 font-extrabold text-brand-text transition active:translate-y-0.5 hover:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
        >
          <RotateCcw className="h-5 w-5" /> {tr(t, 'lmsQuizRetry', 'Coba Lagi')}
        </button>
      )}
    </div>
  );
}
