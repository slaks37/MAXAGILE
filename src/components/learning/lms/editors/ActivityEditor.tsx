import { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Loader2,
  GripVertical,
  CheckCircle2,
  Circle,
  Scissors,
} from 'lucide-react';
import { MaterialSplitterModal } from './MaterialSplitterModal';
import { LessonEditor } from './LessonEditor';
import { MaterialChunk } from '../materialSplitter';
import type {
  Activity,
  ActivityType,
  Attachment,
  QuizQuestion,
  AssessmentQuestion,
  AssessmentResult,
  ChecklistItem,
} from '../types';
import { ACTIVITY_META, GRADIENTS } from '../theme';
import { genId, uploadFile, formatBytes } from '../store';
import { useLanguage } from '../../../../i18n/LanguageContext';

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

const inputCls =
  'w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-brand-text outline-none transition focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
const labelCls = 'mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400';

export interface ActivityEditorProps {
  activity: Activity;
  onSave: (a: Activity) => void;
  onCancel: () => void;
}

export function ActivityEditor({ activity, onSave, onCancel }: ActivityEditorProps) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<Activity>(() => JSON.parse(JSON.stringify(activity)) as Activity);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSplitter, setShowSplitter] = useState(false);
  const meta = ACTIVITY_META[draft.type];

  // A `lesson` is authored block-by-block: delegate the whole editor.
  if (activity.type === 'lesson') {
    return <LessonEditor activity={activity} onSave={onSave} onCancel={onCancel} />;
  }

  function patch(p: Partial<Activity>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  // ---- page ----
  const page = draft.page ?? { content: '', attachments: [] };
  function patchPage(p: Partial<typeof page>) {
    patch({ page: { ...page, ...p } });
  }
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      const uploaded: Attachment[] = [];
      for (const file of Array.from(files)) {
        const att = await uploadFile(file);
        uploaded.push(att);
      }
      patchPage({ attachments: [...page.attachments, ...uploaded] });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : tr(t, 'lmsUploadFailed', 'Gagal mengunggah file.'));
    } finally {
      setUploading(false);
    }
  }
  function removeAttachment(id: string) {
    patchPage({ attachments: page.attachments.filter((a) => a.id !== id) });
  }

  // ---- quiz ----
  const quiz = draft.quiz ?? { questions: [], passPercent: 70 };
  function patchQuiz(p: Partial<typeof quiz>) {
    patch({ quiz: { ...quiz, ...p } });
  }
  function updateQuestion(qid: string, up: (q: QuizQuestion) => QuizQuestion) {
    patchQuiz({ questions: quiz.questions.map((q) => (q.id === qid ? up(q) : q)) });
  }
  function addQuestion() {
    const oid = genId('opt');
    patchQuiz({
      questions: [
        ...quiz.questions,
        { id: genId('q'), text: '', options: [{ id: oid, text: '' }], correctOptionId: oid, points: 1 },
      ],
    });
  }

  // ---- assessment ----
  const assessment = draft.assessment ?? { questions: [], results: [] };
  function patchAssessment(p: Partial<typeof assessment>) {
    patch({ assessment: { ...assessment, ...p } });
  }
  function updateAQuestion(qid: string, up: (q: AssessmentQuestion) => AssessmentQuestion) {
    patchAssessment({ questions: assessment.questions.map((q) => (q.id === qid ? up(q) : q)) });
  }
  function addAQuestion() {
    patchAssessment({
      questions: [
        ...assessment.questions,
        { id: genId('aq'), text: '', options: [{ id: genId('ao'), text: '', score: 1 }] },
      ],
    });
  }
  function updateResult(rid: string, up: (r: AssessmentResult) => AssessmentResult) {
    patchAssessment({ results: assessment.results.map((r) => (r.id === rid ? up(r) : r)) });
  }
  function addResult() {
    patchAssessment({
      results: [
        ...assessment.results,
        { id: genId('res'), minAvg: 0, title: '', description: '', color: GRADIENTS[assessment.results.length % GRADIENTS.length] },
      ],
    });
  }

  // ---- checklist ----
  const checklist = draft.checklist ?? { items: [] };
  function patchChecklist(items: ChecklistItem[]) {
    patch({ checklist: { items } });
  }

  // ---- assignment ----
  const assignment = draft.assignment ?? { instructions: '', maxScore: 100, allowFileUpload: true };
  function patchAssignment(p: Partial<typeof assignment>) {
    patch({ assignment: { ...assignment, ...p } });
  }

  // ---- forum ----
  const forum = draft.forum ?? { prompt: '', allowStudentPosts: true, posts: [] };
  function patchForum(p: Partial<typeof forum>) {
    patch({ forum: { ...forum, ...p } });
  }

  function handleSave() {
    onSave({ ...draft, title: draft.title.trim() || tr(t, 'lmsUntitledActivity', 'Aktivitas Tanpa Judul') });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 animate-in fade-in">
      <div className="my-6 w-full max-w-3xl rounded-3xl border-2 border-b-4 border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95">
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${meta.tile}`}>
              <meta.Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {tr(t, meta.labelKey, ACTIVITY_LABEL_FALLBACK[draft.type])}
              </p>
              <h3 className="text-lg font-extrabold text-brand-text dark:text-slate-100">
                {tr(t, 'lmsEditActivity', 'Sunting Aktivitas')}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="max-h-[62vh] space-y-5 overflow-y-auto p-5">
          <div>
            <label className={labelCls}>{tr(t, 'lmsActivityTitle', 'Judul Aktivitas')}</label>
            <input
              className={inputCls}
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder={tr(t, 'lmsActivityTitlePlaceholder', 'Contoh: Pengantar Manajemen')}
            />
          </div>
          <div>
            <label className={labelCls}>{tr(t, 'lmsActivityDesc', 'Deskripsi Singkat (opsional)')}</label>
            <input
              className={inputCls}
              value={draft.description ?? ''}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder={tr(t, 'lmsActivityDescPlaceholder', 'Keterangan singkat di bawah judul')}
            />
          </div>

          <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
            {draft.type === 'page' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls}>{tr(t, 'lmsPageContent', 'Konten Materi')}</label>
                    <button
                      type="button"
                      onClick={() => setShowSplitter(true)}
                      disabled={!page.content?.trim()}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-orange hover:underline cursor-pointer disabled:opacity-40"
                    >
                      <Scissors className="h-3.5 w-3.5" />
                      {tr(t, 'lmsSplitMaterial', 'Pecah Materi ini Jadi Kartu Kecil')}
                    </button>
                  </div>
                  <textarea
                    className={`${inputCls} min-h-[180px] resize-y leading-relaxed`}
                    value={page.content}
                    onChange={(e) => patchPage({ content: e.target.value })}
                    placeholder={tr(t, 'lmsLessonContentPlaceholder', 'Tulis isi pelajaran di sini...')}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr(t, 'lmsAttachments', 'Materi Pendukung')}</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-brand-orange dark:border-slate-600 dark:bg-slate-800">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
                    ) : (
                      <Upload className="h-6 w-6 text-slate-400" />
                    )}
                    <span className="text-sm font-bold text-brand-text dark:text-slate-200">
                      {tr(t, 'lmsUploadFiles', 'Unggah File Materi')}
                    </span>
                    <span className="text-xs text-slate-400">{tr(t, 'lmsUploadHint', 'PDF, PPT, Word, Excel, Gambar, Video, atau Audio (maks 25MB/file)')}</span>
                    <input type="file" multiple className="hidden" disabled={uploading} onChange={(e) => handleFiles(e.target.files)} />
                  </label>
                  {uploadError && <p className="mt-2 text-xs font-semibold text-rose-500">{uploadError}</p>}
                  {page.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {page.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-brand-text dark:text-slate-100">{att.name}</p>
                            <p className="text-xs text-slate-400">{formatBytes(att.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(att.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/30 cursor-pointer"
                            aria-label={tr(t, 'lmsRemoveFile', 'Hapus File')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {draft.type === 'quiz' && (
              <div className="space-y-4">
                <div className="max-w-[220px]">
                  <label className={labelCls}>{tr(t, 'lmsPassPercent', 'Nilai Kelulusan (%)')}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputCls}
                    value={quiz.passPercent}
                    onChange={(e) => patchQuiz({ passPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                  />
                </div>
                {quiz.questions.map((q, qi) => (
                  <div key={q.id} className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="mb-3 flex items-start gap-2">
                      <span className="mt-2 text-sm font-extrabold text-brand-orange">{qi + 1}.</span>
                      <input
                        className={inputCls}
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, (x) => ({ ...x, text: e.target.value }))}
                        placeholder={tr(t, 'lmsQuestionText', 'Tulis pertanyaan')}
                      />
                      <button
                        type="button"
                        onClick={() => patchQuiz({ questions: quiz.questions.filter((x) => x.id !== q.id) })}
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/30 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 pl-5">
                      {q.options.map((opt) => {
                        const isCorrect = q.correctOptionId === opt.id;
                        return (
                          <div key={opt.id} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuestion(q.id, (x) => ({ ...x, correctOptionId: opt.id }))}
                              className="shrink-0 text-slate-400 transition hover:text-emerald-500 cursor-pointer"
                              title={tr(t, 'lmsMarkCorrect', 'Tandai sebagai jawaban benar')}
                            >
                              {isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                            </button>
                            <input
                              className={inputCls}
                              value={opt.text}
                              onChange={(e) =>
                                updateQuestion(q.id, (x) => ({
                                  ...x,
                                  options: x.options.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o)),
                                }))
                              }
                              placeholder={tr(t, 'lmsOptionText', 'Pilihan jawaban')}
                            />
                            <button
                              type="button"
                              disabled={q.options.length <= 1}
                              onClick={() =>
                                updateQuestion(q.id, (x) => {
                                  const remaining = x.options.filter((o) => o.id !== opt.id);
                                  return {
                                    ...x,
                                    options: remaining,
                                    correctOptionId: x.correctOptionId === opt.id ? remaining[0]?.id ?? '' : x.correctOptionId,
                                  };
                                })
                              }
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:text-rose-500 disabled:opacity-30 enabled:cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(q.id, (x) => ({ ...x, options: [...x.options, { id: genId('opt'), text: '' }] }))
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> {tr(t, 'lmsAddOption', 'Tambah Pilihan')}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-400">{tr(t, 'lmsPoints', 'Poin')}</span>
                          <input
                            type="number"
                            min={0}
                            className="w-16 rounded-xl border-2 border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            value={q.points}
                            onChange={(e) => updateQuestion(q.id, (x) => ({ ...x, points: Math.max(0, Number(e.target.value) || 0) }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-bold text-slate-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-600 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> {tr(t, 'lmsAddQuestion', 'Tambah Pertanyaan')}
                </button>
              </div>
            )}

            {draft.type === 'assessment' && (
              <div className="space-y-5">
                <div className="space-y-4">
                  <p className="text-sm font-extrabold text-brand-text dark:text-slate-100">{tr(t, 'lmsQuestions', 'Pertanyaan')}</p>
                  {assessment.questions.map((q, qi) => (
                    <div key={q.id} className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <div className="mb-3 flex items-start gap-2">
                        <span className="mt-2 text-sm font-extrabold text-amber-500">{qi + 1}.</span>
                        <input
                          className={inputCls}
                          value={q.text}
                          onChange={(e) => updateAQuestion(q.id, (x) => ({ ...x, text: e.target.value }))}
                          placeholder={tr(t, 'lmsQuestionText', 'Tulis pertanyaan')}
                        />
                        <button
                          type="button"
                          onClick={() => patchAssessment({ questions: assessment.questions.filter((x) => x.id !== q.id) })}
                          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2 pl-5">
                        {q.options.map((opt) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <input
                              className={inputCls}
                              value={opt.text}
                              onChange={(e) =>
                                updateAQuestion(q.id, (x) => ({
                                  ...x,
                                  options: x.options.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o)),
                                }))
                              }
                              placeholder={tr(t, 'lmsOptionText', 'Pilihan jawaban')}
                            />
                            <div className="flex shrink-0 items-center gap-1">
                              <span className="text-xs font-semibold text-slate-400">{tr(t, 'lmsScore', 'Skor')}</span>
                              <input
                                type="number"
                                className="w-16 rounded-xl border-2 border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                value={opt.score}
                                onChange={(e) =>
                                  updateAQuestion(q.id, (x) => ({
                                    ...x,
                                    options: x.options.map((o) => (o.id === opt.id ? { ...o, score: Number(e.target.value) || 0 } : o)),
                                  }))
                                }
                              />
                            </div>
                            <button
                              type="button"
                              disabled={q.options.length <= 1}
                              onClick={() =>
                                updateAQuestion(q.id, (x) => ({ ...x, options: x.options.filter((o) => o.id !== opt.id) }))
                              }
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:text-rose-500 disabled:opacity-30 enabled:cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateAQuestion(q.id, (x) => ({ ...x, options: [...x.options, { id: genId('ao'), text: '', score: 1 }] }))
                          }
                          className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-amber-500 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> {tr(t, 'lmsAddOption', 'Tambah Pilihan')}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAQuestion}
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-bold text-slate-500 transition hover:border-amber-500 hover:text-amber-500 dark:border-slate-600 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> {tr(t, 'lmsAddQuestion', 'Tambah Pertanyaan')}
                  </button>
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <p className="text-sm font-extrabold text-brand-text dark:text-slate-100">{tr(t, 'lmsResultBands', 'Band Hasil / Profil')}</p>
                  {assessment.results.map((r) => (
                    <div key={r.id} className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <div className="w-28">
                          <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{tr(t, 'lmsMinAvg', 'Skor Min')}</label>
                          <input
                            type="number"
                            className={inputCls}
                            value={r.minAvg}
                            onChange={(e) => updateResult(r.id, (x) => ({ ...x, minAvg: Number(e.target.value) || 0 }))}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{tr(t, 'lmsBandTitle', 'Judul Profil')}</label>
                          <input
                            className={inputCls}
                            value={r.title}
                            onChange={(e) => updateResult(r.id, (x) => ({ ...x, title: e.target.value }))}
                            placeholder={tr(t, 'lmsBandTitlePlaceholder', 'Contoh: Siap Bertransformasi')}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => patchAssessment({ results: assessment.results.filter((x) => x.id !== r.id) })}
                          className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        className={`${inputCls} mt-2 min-h-[60px] resize-y`}
                        value={r.description}
                        onChange={(e) => updateResult(r.id, (x) => ({ ...x, description: e.target.value }))}
                        placeholder={tr(t, 'lmsBandDescPlaceholder', 'Deskripsi profil hasil')}
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {GRADIENTS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => updateResult(r.id, (x) => ({ ...x, color: g }))}
                            className={`h-8 w-8 rounded-full bg-gradient-to-br ${g} transition ${
                              r.color === g ? 'ring-2 ring-brand-text ring-offset-2 dark:ring-white dark:ring-offset-slate-900' : ''
                            } cursor-pointer`}
                            aria-label={g}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addResult}
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-bold text-slate-500 transition hover:border-amber-500 hover:text-amber-500 dark:border-slate-600 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> {tr(t, 'lmsAddBand', 'Tambah Band Hasil')}
                  </button>
                </div>
              </div>
            )}

            {draft.type === 'checklist' && (
              <div className="space-y-3">
                <label className={labelCls}>{tr(t, 'lmsChecklistItems', 'Item Checklist')}</label>
                {checklist.items.map((it, i) => (
                  <div key={it.id} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                    <input
                      className={inputCls}
                      value={it.text}
                      onChange={(e) =>
                        patchChecklist(checklist.items.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)))
                      }
                      placeholder={`${tr(t, 'lmsChecklistItem', 'Item')} ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => patchChecklist(checklist.items.filter((x) => x.id !== it.id))}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => patchChecklist([...checklist.items, { id: genId('chk'), text: '' }])}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-bold text-slate-500 transition hover:border-brand-teal hover:text-brand-teal dark:border-slate-600 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> {tr(t, 'lmsAddItem', 'Tambah Item')}
                </button>
              </div>
            )}

            {draft.type === 'assignment' && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>{tr(t, 'lmsAssignmentInstructions', 'Petunjuk Tugas')}</label>
                  <textarea
                    className={`${inputCls} min-h-[100px] resize-y`}
                    value={assignment.instructions}
                    onChange={(e) => patchAssignment({ instructions: e.target.value })}
                    placeholder={tr(
                      t,
                      'lmsAssignmentInstructionsPlaceholder',
                      'Tuliskan petunjuk pengerjaan tugas secara rinci...',
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>{tr(t, 'lmsMaxScore', 'Nilai Maksimal')}</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      className={inputCls}
                      value={assignment.maxScore}
                      onChange={(e) => patchAssignment({ maxScore: parseInt(e.target.value, 10) || 100 })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{tr(t, 'lmsDueDateOptional', 'Batas Waktu (Opsional)')}</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={assignment.dueDate ? assignment.dueDate.split('T')[0] : ''}
                      onChange={(e) =>
                        patchAssignment({
                          dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                        })
                      }
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={assignment.allowFileUpload}
                    onChange={(e) => patchAssignment({ allowFileUpload: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-brand-teal"
                  />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {tr(t, 'lmsAllowFileUpload', 'Izinkan Siswa Mengunggah Lampiran File')}
                  </span>
                </label>
              </div>
            )}

            {draft.type === 'forum' && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>
                    {tr(t, 'lmsForumPrompt', 'Topik & Pertanyaan Pemantik Forum')}
                  </label>
                  <textarea
                    className={`${inputCls} min-h-[100px] resize-y`}
                    value={forum.prompt}
                    onChange={(e) => patchForum({ prompt: e.target.value })}
                    placeholder={tr(
                      t,
                      'lmsForumPromptPlaceholder',
                      'Tuliskan topik atau pertanyaan pemantik diskusi...',
                    )}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={forum.allowStudentPosts}
                    onChange={(e) => patchForum({ allowStudentPosts: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-brand-teal"
                  />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {tr(t, 'lmsAllowStudentPosts', 'Izinkan Siswa Membuat Utas Diskusi Baru')}
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-5 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border-2 border-b-4 border-slate-300 bg-white px-5 py-2.5 font-extrabold text-brand-text transition active:translate-y-0.5 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
          >
            {tr(t, 'lmsCancel', 'Batal')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl border-2 border-b-4 border-brand-orange bg-brand-orange px-6 py-2.5 font-extrabold text-white transition active:translate-y-0.5 cursor-pointer"
          >
            {tr(t, 'lmsSave', 'Simpan')}
          </button>
        </div>
      </div>

      {showSplitter && (
        <MaterialSplitterModal
          initialText={page.content || ''}
          onApplyChunks={(chunks: MaterialChunk[]) => {
            setShowSplitter(false);
            if (chunks.length > 0) {
              const joined = chunks
                .map((c) => `### ${c.title}\n\n${c.content}`)
                .join('\n\n---\n\n');
              patchPage({ content: joined });
            }
          }}
          onClose={() => setShowSplitter(false)}
        />
      )}
    </div>
  );
}
