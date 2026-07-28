import React, { useState } from 'react';
import { X, Award, Printer, Download, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { Course, CourseProgress } from '../types';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface CertificateModalProps {
  course: Course;
  progress: CourseProgress;
  onUpdateName: (name: string) => void;
  onClose: () => void;
}

export function CertificateModal({
  course,
  progress,
  onUpdateName,
  onClose,
}: CertificateModalProps) {
  const { t } = useLanguage();
  const defaultStudentName = tr(t, 'lmsDefaultStudentName', 'Siswa MaxAgile');
  const [studentName, setStudentName] = useState(progress.studentName || defaultStudentName);
  const [isEditingName, setIsEditingName] = useState(false);

  const certId = `MAX-${course.id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSaveName = () => {
    onUpdateName(studentName.trim() || defaultStudentName);
    setIsEditingName(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-brand-text dark:text-slate-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              {tr(t, 'lmsCertificateOfficial', 'Sertifikat Kelulusan Resmi')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr(t, 'lmsCertificateCongrats', 'Selamat! Anda telah menyelesaikan 100% materi kursus ini.')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-brand-teal hover:text-brand-teal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              {tr(t, 'lmsPrintDownloadPdf', 'Cetak / Unduh PDF')}
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

        {/* Student Name Editor */}
        <div className="mb-6 rounded-2xl bg-amber-50/60 p-4 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
              {tr(t, 'lmsCertificateNameLabel', 'Nama Peserta pada Sertifikat:')}
            </span>
          </div>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="rounded-xl border border-amber-300 bg-white px-3 py-1 text-xs font-bold dark:border-amber-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="rounded-xl bg-amber-500 px-3 py-1 text-xs font-extrabold text-white shadow hover:bg-amber-600 cursor-pointer"
              >
                {tr(t, 'lmsSave', 'Simpan')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-brand-text dark:text-slate-100">
                {studentName}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="text-xs font-bold text-amber-700 hover:underline dark:text-amber-400 cursor-pointer"
              >
                {tr(t, 'lmsChangeName', 'Ubah Nama')}
              </button>
            </div>
          )}
        </div>

        {/* Printable Certificate Frame */}
        <div className="print-certificate relative overflow-hidden rounded-3xl border-8 border-amber-400/30 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 p-8 sm:p-12 text-center shadow-inner dark:bg-slate-950 dark:from-slate-900">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-3 left-3 h-12 w-12 border-t-4 border-l-4 border-amber-500/60 rounded-tl-xl" />
          <div className="absolute top-3 right-3 h-12 w-12 border-t-4 border-r-4 border-amber-500/60 rounded-tr-xl" />
          <div className="absolute bottom-3 left-3 h-12 w-12 border-b-4 border-l-4 border-amber-500/60 rounded-bl-xl" />
          <div className="absolute bottom-3 right-3 h-12 w-12 border-b-4 border-r-4 border-amber-500/60 rounded-br-xl" />

          {/* Certificate Header */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-lg ring-4 ring-amber-200 dark:ring-amber-900">
            <Award className="h-10 w-10" />
          </div>

          <span className="mt-4 block text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            MaxAgile Academy LMS
          </span>

          <h2 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-wider text-brand-text dark:text-slate-100">
            {tr(t, 'lmsCertificate', 'Sertifikat Kelulusan')}
          </h2>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
            {tr(t, 'lmsCertificateOfCompletion', 'Certificate of Completion')}
          </span>

          <p className="mt-6 text-xs text-slate-500 font-medium dark:text-slate-400">
            {tr(t, 'lmsCertificateAwardedTo', 'Diberikan secara resmi kepada:')}
          </p>

          <h1 className="mt-2 text-2xl sm:text-4xl font-black text-brand-teal dark:text-emerald-400 underline decoration-amber-400/50 decoration-4 underline-offset-8">
            {studentName}
          </h1>

          <p className="mt-6 max-w-lg mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed dark:text-slate-300">
            {tr(
              t,
              'lmsCertificateBody',
              'Telah berhasil menguasai seluruh materi, menyelesaikan penugasan, dan lulus seluruh evaluasi pada kursus:',
            )}
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-brand-text dark:text-slate-100">
            "{course.title}"
          </h3>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-left text-xs text-slate-500">
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300">
                {tr(t, 'lmsCertificateIssueDate', 'Tanggal Diterbitkan:')}
              </span>
              <span>{issueDate}</span>
            </div>

            <div className="text-center">
              <ShieldCheck className="h-6 w-6 text-brand-teal mx-auto mb-1" />
              <span className="block text-[10px] font-extrabold text-brand-text dark:text-slate-200">
                MAXAGILE VERIFIED
              </span>
            </div>

            <div className="text-right">
              <span className="block font-bold text-slate-700 dark:text-slate-300">
                {tr(t, 'lmsCertificateVerifyId', 'ID Verifikasi:')}
              </span>
              <span className="font-mono text-[11px]">{certId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
