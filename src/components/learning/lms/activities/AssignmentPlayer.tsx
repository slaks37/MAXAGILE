import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Send,
  Award,
  Paperclip,
  Trash2,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import type { Activity, AssignmentSubmission, Attachment } from '../types';
import { uploadFile, formatBytes } from '../store';
import { useEditMode } from '../EditModeContext';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface AssignmentPlayerProps {
  activity: Activity;
  submission?: AssignmentSubmission;
  onSubmit: (sub: AssignmentSubmission) => void;
}

export function AssignmentPlayer({ activity, submission, onSubmit }: AssignmentPlayerProps) {
  const { t } = useLanguage();
  const { editMode } = useEditMode();
  const assignment = activity.assignment;

  const [textAnswer, setTextAnswer] = useState(submission?.textAnswer || '');
  const [attachments, setAttachments] = useState<Attachment[]>(submission?.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Instructor grading state
  const [gradingMode, setGradingMode] = useState(false);
  const [gradeInput, setGradeInput] = useState(submission?.grade?.toString() || '');
  const [feedbackInput, setFeedbackInput] = useState(submission?.feedback || '');

  if (!assignment) {
    return (
      <div className="p-6 text-sm text-slate-500">
        {tr(t, 'lmsAssignmentNotConfigured', 'Aktivitas tugas belum dikonfigurasi.')}
      </div>
    );
  }

  const isSubmitted = !!submission?.submittedAt;
  const isGraded = typeof submission?.grade === 'number';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg('');
    try {
      const uploaded = await uploadFile(file);
      setAttachments((prev) => [...prev, uploaded]);
    } catch (err: any) {
      setErrorMsg(err.message || tr(t, 'lmsUploadFailed', 'Gagal mengunggah file.'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAnswer.trim() && attachments.length === 0) {
      setErrorMsg(tr(t, 'lmsAssignmentNeedAnswer', 'Harap isi jawaban teks atau unggah file lampiran.'));
      return;
    }
    const newSubmission: AssignmentSubmission = {
      ...submission,
      submittedAt: new Date().toISOString(),
      textAnswer: textAnswer.trim(),
      attachments,
    };
    onSubmit(newSubmission);
    setSuccessMsg(tr(t, 'lmsAssignmentSubmitted', 'Tugas berhasil dikirim!'));
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveGrade = () => {
    const numGrade = Math.min(
      assignment.maxScore,
      Math.max(0, parseInt(gradeInput, 10) || 0)
    );
    const updatedSub: AssignmentSubmission = {
      ...(submission || { submittedAt: new Date().toISOString() }),
      grade: numGrade,
      feedback: feedbackInput.trim(),
      gradedAt: new Date().toISOString(),
    };
    onSubmit(updatedSub);
    setGradingMode(false);
    setSuccessMsg(tr(t, 'lmsGradeSaved', 'Nilai & Umpan Balik berhasil disimpan!'));
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-teal">
            <FileText className="h-4 w-4" />
            <span>{tr(t, 'lmsAssignmentHeader', 'Tugas Pengumpulan')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
            {assignment.dueDate && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {tr(t, 'lmsDueDate', 'Batas Waktu:')}{' '}
                {new Date(assignment.dueDate).toLocaleDateString('id-ID')}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-brand-teal dark:bg-brand-teal/20">
              <Award className="h-3.5 w-3.5" />
              {tr(t, 'lmsMaxScoreLabel', 'Maks Nilai:')} {assignment.maxScore}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-brand-text dark:text-slate-100">
          {activity.title}
        </h3>
        {activity.description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {activity.description}
          </p>
        )}

        {assignment.instructions && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-pre-line">
            <span className="font-extrabold text-brand-text dark:text-slate-100 block mb-1">
              {tr(t, 'lmsInstructionsLabel', 'Petunjuk Pengerjaan:')}
            </span>
            {assignment.instructions}
          </div>
        )}
      </div>

      {/* Submission status banner */}
      {isSubmitted && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                  {tr(t, 'lmsAssignmentSent', 'Tugas Telah Dikirim')}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {tr(t, 'lmsSubmittedAt', 'Dikirim pada:')}{' '}
                  {new Date(submission.submittedAt).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            {isGraded ? (
              <div className="rounded-xl bg-emerald-600 px-3 py-1.5 text-center text-white">
                <span className="block text-[10px] uppercase tracking-wider font-extrabold">
                  {tr(t, 'lmsGradeLabel', 'Nilai')}
                </span>
                <span className="text-lg font-black">{submission.grade} / {assignment.maxScore}</span>
              </div>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                {tr(t, 'lmsAwaitingGrading', 'Menunggu Penilaian')}
              </span>
            )}
          </div>

          {/* Feedback section */}
          {submission.feedback && (
            <div className="mt-3 rounded-xl bg-white p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-emerald-100 dark:border-emerald-900">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                {tr(t, 'lmsTeacherFeedback', 'Umpan Balik Pengajar:')}
              </span>
              {submission.feedback}
            </div>
          )}
        </div>
      )}

      {/* Teacher Grading Box (if in edit mode) */}
      {editMode && isSubmitted && (
        <div className="rounded-2xl border-2 border-brand-orange bg-amber-50/50 p-5 dark:border-brand-orange/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-extrabold text-brand-text dark:text-slate-100 flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-orange" />
              {tr(t, 'lmsTeacherGrading', 'Penilaian Pengajar (Mode Edit)')}
            </h4>
            <button
              type="button"
              onClick={() => setGradingMode(!gradingMode)}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:underline cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              {gradingMode
                ? tr(t, 'lmsCancelGradeEdit', 'Batal Edit Nilai')
                : tr(t, 'lmsGiveEditGrade', 'Beri / Edit Nilai')}
            </button>
          </div>

          {gradingMode && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  {tr(t, 'lmsGradeLabel', 'Nilai')} (0 - {assignment.maxScore})
                </label>
                <input
                  type="number"
                  min="0"
                  max={assignment.maxScore}
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-32 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-extrabold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  {tr(t, 'lmsFeedbackLabel', 'Umpan Balik / Catatan Evaluasi')}
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder={tr(t, 'lmsFeedbackPlaceholder', 'Beri catatan perbaikan atau apresiasi...')}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveGrade}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2 text-xs font-extrabold text-brand-text shadow transition hover:brightness-105 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                {tr(t, 'lmsSaveGrade', 'Simpan Nilai')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
            {tr(t, 'lmsTextAnswerLabel', 'Jawaban Teks / Catatan Tugas')}
          </label>
          <textarea
            rows={5}
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder={tr(
              t,
              'lmsTextAnswerPlaceholder',
              'Tuliskan jawaban atau ringkasan hasil pengerjaan tugas Anda di sini...',
            )}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 focus:border-brand-teal focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* File Attachments */}
        {assignment.allowFileUpload && (
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              {tr(t, 'lmsFileAttachmentsOptional', 'Lampiran File (Opsional)')}
            </label>
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-extrabold text-slate-700 dark:text-slate-200 truncate">
                      {att.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({formatBytes(att.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-2 text-xs font-extrabold text-slate-600 transition hover:border-brand-teal hover:text-brand-teal dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <Upload className="h-4 w-4" />
                {uploading
                  ? tr(t, 'lmsUploading', 'Mengunggah...')
                  : tr(t, 'lmsPickAttachment', 'Pilih File Lampiran')}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-6 py-3 text-sm font-extrabold text-brand-text shadow transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            {isSubmitted
              ? tr(t, 'lmsResubmitAssignment', 'Kirim Ulang Tugas')
              : tr(t, 'lmsSubmitAssignment', 'Kirim Tugas Sekarang')}
          </button>
        </div>
      </form>
    </div>
  );
}
