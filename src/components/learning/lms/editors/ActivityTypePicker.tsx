import { X } from 'lucide-react';
import type { ActivityType } from '../types';
import { ACTIVITY_META } from '../theme';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

const TYPE_ORDER: ActivityType[] = ['page', 'quiz', 'assessment', 'checklist', 'assignment', 'forum'];

const TYPE_DESC: Record<ActivityType, { key: string; fallback: string }> = {
  page: { key: 'lmsPickPageDesc', fallback: 'Materi bacaan dengan lampiran file.' },
  quiz: { key: 'lmsPickQuizDesc', fallback: 'Pilihan ganda dengan nilai kelulusan.' },
  assessment: { key: 'lmsPickAssessmentDesc', fallback: 'Survei berskor yang menghasilkan profil.' },
  checklist: { key: 'lmsPickChecklistDesc', fallback: 'Daftar centang progres mandiri.' },
  assignment: { key: 'lmsPickAssignmentDesc', fallback: 'Tugas pengumpulan teks/file dengan penilaian.' },
  forum: { key: 'lmsPickForumDesc', fallback: 'Forum pengajuan pertanyaan & diskusi per topik.' },
};

export interface ActivityTypePickerProps {
  onPick: (type: ActivityType) => void;
  onCancel: () => void;
}

export function ActivityTypePicker({ onPick, onCancel }: ActivityTypePickerProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in" onClick={onCancel}>
      <div
        className="w-full max-w-2xl rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-brand-text dark:text-slate-100">
            {tr(t, 'lmsPickActivityType', 'Pilih Jenis Aktivitas')}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TYPE_ORDER.map((type) => {
            const meta = ACTIVITY_META[type];
            const desc = TYPE_DESC[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => onPick(type)}
                className="flex items-start gap-3 rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-orange dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${meta.tile}`}>
                  <meta.Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-brand-text dark:text-slate-100">{t(meta.labelKey)}</p>
                  <p className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400">
                    {tr(t, desc.key, desc.fallback)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
