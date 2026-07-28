import React from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Lightbulb,
  PartyPopper,
  RotateCw,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  Activity,
  LessonBlock,
  LessonProgress,
  MatchPair,
  QuizOption,
} from '../types';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

const CARD =
  'rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6';

// ---------------------------------------------------------------------------
// Individual block renderers
//
// Every interactive block reports readiness through `onAnswered` so the parent
// can keep the "Lanjut" button disabled until the learner has actually engaged.
// ---------------------------------------------------------------------------

interface BlockProps {
  block: LessonBlock;
  answer?: string;
  note?: string;
  onAnswer: (value: string) => void;
  onNote: (value: string) => void;
  t: (k: string) => string;
}

function TextBlockView({ block }: { block: Extract<LessonBlock, { type: 'text' }> }) {
  return (
    <div className={CARD}>
      {block.title && (
        <h4 className="mb-3 text-lg font-extrabold leading-snug text-brand-text dark:text-slate-100">
          {block.title}
        </h4>
      )}
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        {block.body}
      </p>
    </div>
  );
}

function KeypointBlockView({
  block,
}: {
  block: Extract<LessonBlock, { type: 'keypoint' }>;
}) {
  return (
    <div className={`${CARD} border-brand-teal/30 bg-brand-teal/5 dark:bg-brand-teal/10`}>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 shrink-0 text-brand-teal" />
        <h4 className="text-lg font-extrabold text-brand-text dark:text-slate-100">
          {block.title || 'Poin Penting'}
        </h4>
      </div>
      <ul className="space-y-2.5">
        {block.points.map((p, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
            <span className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImageBlockView({
  block,
  t,
}: {
  block: Extract<LessonBlock, { type: 'image' }>;
  t: (k: string) => string;
}) {
  const [failed, setFailed] = React.useState(false);
  return (
    <div className={CARD}>
      {failed ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-400 dark:border-slate-600">
          {tr(t, 'lmsLessonImageMissing', 'Gambar tidak tersedia')}
        </div>
      ) : (
        <img
          src={block.attachment.url}
          alt={block.caption || block.attachment.name}
          onError={() => setFailed(true)}
          className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700"
        />
      )}
      {block.caption && (
        <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">{block.caption}</p>
      )}
    </div>
  );
}

function CheckBlockView({ block, answer, onAnswer, t }: BlockProps) {
  const b = block as Extract<LessonBlock, { type: 'check' }>;
  const locked = !!answer;
  const isRight = answer === b.correctOptionId;

  const styleFor = (opt: QuizOption) => {
    if (!locked) {
      return 'border-slate-200 bg-white hover:border-brand-orange hover:bg-brand-orange/5 dark:border-slate-700 dark:bg-slate-800';
    }
    if (opt.id === b.correctOptionId) {
      return 'border-brand-teal bg-brand-teal/10 dark:border-brand-teal';
    }
    if (opt.id === answer) {
      return 'border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-900/20';
    }
    return 'border-slate-200 bg-white opacity-60 dark:border-slate-700 dark:bg-slate-800';
  };

  return (
    <div className={CARD}>
      <p className="mb-4 text-[15px] font-bold leading-snug text-brand-text dark:text-slate-100">
        {b.question}
      </p>
      <div className="space-y-2.5">
        {b.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={locked}
            onClick={() => onAnswer(opt.id)}
            className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${styleFor(opt)} ${
              locked ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {locked && opt.id === b.correctOptionId ? (
                <CheckCircle2 className="h-5 w-5 text-brand-teal" />
              ) : locked && opt.id === answer ? (
                <X className="h-5 w-5 text-rose-500" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
              )}
            </span>
            <span className="text-[15px] leading-snug text-slate-700 dark:text-slate-200">{opt.text}</span>
          </button>
        ))}
      </div>

      {locked && (
        <div
          className={`mt-4 rounded-2xl border-2 p-3.5 animate-in fade-in ${
            isRight
              ? 'border-brand-teal/40 bg-brand-teal/10'
              : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
          }`}
        >
          <p className="mb-1 text-sm font-extrabold text-brand-text dark:text-slate-100">
            {isRight
              ? tr(t, 'lmsLessonCorrect', 'Tepat!')
              : tr(t, 'lmsLessonWrong', 'Belum tepat')}
          </p>
          {b.explanation && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{b.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

function FlashcardBlockView({ block, answer, onAnswer, t }: BlockProps) {
  const b = block as Extract<LessonBlock, { type: 'flashcard' }>;
  const [flipped, setFlipped] = React.useState(answer === 'flipped');

  const flip = () => {
    const next = !flipped;
    setFlipped(next);
    if (next) onAnswer('flipped');
  };

  return (
    <button
      type="button"
      onClick={flip}
      className={`${CARD} flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center text-center transition-transform active:scale-[0.99]`}
    >
      <p className="text-lg font-extrabold leading-snug text-brand-text dark:text-slate-100">
        {flipped ? b.back : b.front}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <RotateCw className="h-3.5 w-3.5" />
        {tr(t, 'lmsLessonTapToFlip', 'Ketuk untuk membalik')}
      </span>
    </button>
  );
}

function MatchBlockView({ block, answer, onAnswer, t }: BlockProps) {
  const b = block as Extract<LessonBlock, { type: 'match' }>;
  const [matched, setMatched] = React.useState<string[]>(
    answer ? answer.split(',').filter(Boolean) : [],
  );
  const [pickedLeft, setPickedLeft] = React.useState<string | null>(null);
  const [wrongId, setWrongId] = React.useState<string | null>(null);
  // Right column is shuffled once so the pairing is not given away by order.
  const rightColumn = React.useMemo(() => shuffle(b.pairs), [b.id]);

  const choose = (pair: MatchPair) => {
    if (matched.includes(pair.id)) return;
    if (pickedLeft === pair.id) {
      setPickedLeft(null);
      return;
    }
    setPickedLeft(pair.id);
    setWrongId(null);
  };

  const answerRight = (pair: MatchPair) => {
    if (!pickedLeft || matched.includes(pair.id)) return;
    if (pickedLeft === pair.id) {
      const next = matched.concat(pair.id);
      setMatched(next);
      setPickedLeft(null);
      if (next.length === b.pairs.length) onAnswer(next.join(','));
    } else {
      setWrongId(pair.id);
      setPickedLeft(null);
      window.setTimeout(() => setWrongId(null), 600);
    }
  };

  return (
    <div className={CARD}>
      <p className="mb-4 text-[15px] font-bold leading-snug text-brand-text dark:text-slate-100">
        {b.prompt || tr(t, 'lmsLessonMatchPrompt', 'Pasangkan yang sesuai')}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2.5">
          {b.pairs.map((p) => {
            const done = matched.includes(p.id);
            const active = pickedLeft === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={done}
                onClick={() => choose(p)}
                className={`w-full rounded-2xl border-2 p-3 text-left text-sm leading-snug transition-all ${
                  done
                    ? 'cursor-default border-brand-teal bg-brand-teal/10 text-slate-500'
                    : active
                      ? 'cursor-pointer border-brand-orange bg-brand-orange/10 text-brand-text dark:text-slate-100'
                      : 'cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="space-y-2.5">
          {rightColumn.map((p) => {
            const done = matched.includes(p.id);
            const wrong = wrongId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={done}
                onClick={() => answerRight(p)}
                className={`w-full rounded-2xl border-2 p-3 text-left text-sm leading-snug transition-all ${
                  done
                    ? 'cursor-default border-brand-teal bg-brand-teal/10 text-slate-500'
                    : wrong
                      ? 'cursor-pointer border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-900/20'
                      : 'cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {p.right}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-400">
        {matched.length}/{b.pairs.length}
      </p>
    </div>
  );
}

function FillBlankBlockView({ block, answer, onAnswer, t }: BlockProps) {
  const b = block as Extract<LessonBlock, { type: 'fillblank' }>;
  const locked = !!answer;
  const isRight = answer === b.answer;
  const [before, after] = React.useMemo(() => {
    const idx = b.sentence.indexOf('___');
    if (idx < 0) return [b.sentence, ''];
    return [b.sentence.slice(0, idx), b.sentence.slice(idx + 3)];
  }, [b.sentence]);
  const choices = React.useMemo(() => shuffle(b.options), [b.id]);

  return (
    <div className={CARD}>
      <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        {before}
        <span
          className={`mx-1 inline-block min-w-[90px] rounded-lg border-b-4 px-2 py-0.5 text-center font-extrabold ${
            !locked
              ? 'border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-600 dark:bg-slate-800'
              : isRight
                ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
                : 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-900/20'
          }`}
        >
          {locked ? answer : '____'}
        </span>
        {after}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {choices.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => onAnswer(opt)}
            className={`rounded-full border-2 border-b-4 px-4 py-2 text-sm font-bold transition-all active:translate-y-[2px] active:border-b-2 ${
              locked
                ? 'cursor-default border-slate-200 bg-white text-slate-400 opacity-60 dark:border-slate-700 dark:bg-slate-800'
                : 'cursor-pointer border-slate-200 bg-white text-brand-text hover:border-brand-orange hover:bg-brand-orange/5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {locked && !isRight && (
        <p className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800 animate-in fade-in dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          {tr(t, 'lmsLessonAnswerIs', 'Jawaban yang tepat:')} <strong>{b.answer}</strong>
        </p>
      )}
    </div>
  );
}

function ReflectBlockView({ block, note, onNote, t }: BlockProps) {
  const b = block as Extract<LessonBlock, { type: 'reflect' }>;
  return (
    <div className={`${CARD} border-brand-orange/30 bg-brand-orange/5`}>
      <div className="mb-3 flex items-start gap-2.5">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
        <p className="text-[15px] font-bold leading-snug text-brand-text dark:text-slate-100">
          {b.prompt}
        </p>
      </div>
      <textarea
        value={note || ''}
        onChange={(e) => onNote(e.target.value)}
        placeholder={b.placeholder || tr(t, 'lmsLessonReflectHint', 'Tulis jawabanmu di sini...')}
        rows={4}
        className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white p-3 text-[15px] leading-relaxed text-brand-text outline-none focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------

export interface LessonPlayerProps {
  activity: Activity;
  progress?: LessonProgress;
  onProgress: (p: LessonProgress) => void;
  onComplete: () => void;
  t: (k: string) => string;
}

/** Blocks that require the learner to do something before moving on. */
function isInteractive(block: LessonBlock): boolean {
  return (
    block.type === 'check' ||
    block.type === 'flashcard' ||
    block.type === 'match' ||
    block.type === 'fillblank'
  );
}

export function LessonPlayer({
  activity,
  progress,
  onProgress,
  onComplete,
  t,
}: LessonPlayerProps) {
  const blocks = activity.lesson?.blocks || [];
  const total = blocks.length;

  const [index, setIndex] = React.useState(() =>
    Math.min(Math.max(progress?.index ?? 0, 0), Math.max(total - 1, 0)),
  );
  const [answers, setAnswers] = React.useState<Record<string, string>>(progress?.answers || {});
  const [notes, setNotes] = React.useState<Record<string, string>>(progress?.notes || {});
  const [finished, setFinished] = React.useState(!!progress?.completed);

  const push = React.useCallback(
    (next: Partial<LessonProgress>) => {
      onProgress({
        index,
        answers,
        notes,
        completed: finished,
        ...next,
      });
    },
    [index, answers, notes, finished, onProgress],
  );

  if (total === 0) {
    return (
      <div className={`${CARD} text-center`}>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {tr(t, 'lmsLessonEmpty', 'Materi ini belum punya isi.')}
        </p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className={`${CARD} flex flex-col items-center gap-4 py-10 text-center animate-in fade-in`}>
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-teal to-emerald-400 shadow-lg">
          <PartyPopper className="h-10 w-10 text-white" />
        </div>
        <h4 className="text-2xl font-extrabold text-brand-text dark:text-slate-100">
          {tr(t, 'lmsLessonDone', 'Materi selesai!')}
        </h4>
        <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {tr(t, 'lmsLessonDoneDesc', 'Kamu sudah menyelesaikan seluruh bagian materi ini.')}
        </p>
        <button
          type="button"
          onClick={onComplete}
          className="cursor-pointer rounded-2xl border-2 border-b-4 border-transparent bg-brand-text px-8 py-3.5 font-extrabold text-white transition-all active:translate-y-[2px] active:border-b-2 dark:bg-brand-orange"
        >
          {tr(t, 'lmsLessonFinish', 'Selesai')}
        </button>
      </div>
    );
  }

  const block = blocks[index];
  const answered = !isInteractive(block) || !!answers[block.id];
  const isLast = index === total - 1;

  const setAnswer = (value: string) => {
    const next = { ...answers, [block.id]: value };
    setAnswers(next);
    push({ answers: next });
  };

  const setNote = (value: string) => {
    const next = { ...notes, [block.id]: value };
    setNotes(next);
    push({ notes: next });
  };

  const goto = (i: number) => {
    const clamped = Math.min(Math.max(i, 0), total - 1);
    setIndex(clamped);
    push({ index: clamped });
  };

  const advance = () => {
    if (!answered) return;
    if (isLast) {
      setFinished(true);
      push({ completed: true });
      return;
    }
    goto(index + 1);
  };

  const common: BlockProps = {
    block,
    answer: answers[block.id],
    note: notes[block.id],
    onAnswer: setAnswer,
    onNote: setNote,
    t,
  };

  const percent = Math.round(((index + 1) / total) * 100);

  return (
    <div
      className="space-y-5"
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === 'ArrowRight') && answered) advance();
      }}
      tabIndex={-1}
    >
      {/* progress header */}
      <div className="flex items-center gap-3">
        {index > 0 && (
          <button
            type="button"
            onClick={() => goto(index - 1)}
            aria-label={tr(t, 'lmsLessonBack', 'Kembali')}
            className="cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:text-brand-text dark:border-slate-700 dark:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-brand-orange transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-extrabold text-slate-400">
          {index + 1}/{total}
        </span>
      </div>

      <div key={block.id} className="animate-in fade-in">
        {block.type === 'text' && <TextBlockView block={block} />}
        {block.type === 'keypoint' && <KeypointBlockView block={block} />}
        {block.type === 'image' && <ImageBlockView block={block} t={t} />}
        {block.type === 'check' && <CheckBlockView {...common} />}
        {block.type === 'flashcard' && <FlashcardBlockView {...common} />}
        {block.type === 'match' && <MatchBlockView {...common} />}
        {block.type === 'fillblank' && <FillBlankBlockView {...common} />}
        {block.type === 'reflect' && <ReflectBlockView {...common} />}
      </div>

      <div className="flex items-center justify-between gap-3">
        {block.type === 'reflect' ? (
          <button
            type="button"
            onClick={advance}
            className="cursor-pointer text-sm font-bold text-slate-400 underline-offset-4 hover:underline"
          >
            {tr(t, 'lmsLessonSkip', 'Lewati')}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={advance}
          disabled={!answered}
          className={`rounded-2xl border-2 border-b-4 border-transparent px-8 py-3.5 font-extrabold text-white transition-all ${
            answered
              ? 'cursor-pointer bg-brand-text active:translate-y-[2px] active:border-b-2 dark:bg-brand-orange'
              : 'cursor-not-allowed bg-slate-300 dark:bg-slate-700'
          }`}
        >
          {isLast ? tr(t, 'lmsLessonFinish', 'Selesai') : tr(t, 'lmsLessonNext', 'Lanjut')}
        </button>
      </div>
    </div>
  );
}
