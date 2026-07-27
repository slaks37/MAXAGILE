import React from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Presentation,
  File as FileIcon,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import type { Activity, Attachment } from '../types';
import { attachmentKind, formatBytes } from '../store';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

const DOC_ICON: Record<string, { Icon: (p: { className?: string; size?: number }) => React.JSX.Element; tint: string }> = {
  word: { Icon: (p) => <FileText {...p} />, tint: 'bg-blue-500' },
  excel: { Icon: (p) => <FileSpreadsheet {...p} />, tint: 'bg-emerald-500' },
  ppt: { Icon: (p) => <Presentation {...p} />, tint: 'bg-orange-500' },
  pdf: { Icon: (p) => <FileText {...p} />, tint: 'bg-rose-500' },
  other: { Icon: (p) => <FileIcon {...p} />, tint: 'bg-slate-500' },
};

function DownloadCard({ att, t }: { att: Attachment; t: any }) {
  const kind = attachmentKind(att.mimeType, att.name);
  const meta = DOC_ICON[kind] || DOC_ICON.other;
  return (
    <a
      href={att.url}
      download={att.name}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-brand-orange dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${meta.tint}`}>
        <meta.Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-brand-text dark:text-slate-100">{att.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(att.size)}</p>
      </div>
      <Download className="h-5 w-5 shrink-0 text-slate-400" />
    </a>
  );
}

function AttachmentBlock({ att, t }: { key?: string; att: Attachment; t: any }) {
  const kind = attachmentKind(att.mimeType, att.name);
  if (kind === 'image') {
    return (
      <figure className="overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700">
        <img src={att.url} alt={att.name} className="max-w-full" />
        <figcaption className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <span className="truncate">{att.name}</span>
          <a href={att.url} download={att.name} className="inline-flex items-center gap-1 font-semibold text-brand-orange cursor-pointer">
            <Download className="h-3.5 w-3.5" /> {tr(t, 'lmsDownload', 'Unduh')}
          </a>
        </figcaption>
      </figure>
    );
  }
  if (kind === 'pdf') {
    return (
      <div className="space-y-2">
        <iframe title={att.name} src={att.url} className="h-[480px] w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700" />
        <DownloadCard att={att} t={t} />
      </div>
    );
  }
  if (kind === 'video') {
    return <video controls src={att.url} className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700" />;
  }
  if (kind === 'audio') {
    return (
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
        <p className="mb-2 truncate text-sm font-bold text-brand-text dark:text-slate-100">{att.name}</p>
        <audio controls src={att.url} className="w-full" />
      </div>
    );
  }
  return <DownloadCard att={att} t={t} />;
}

export interface PageViewProps {
  activity: Activity;
  completed: boolean;
  onToggleComplete: (next: boolean) => void;
}

export function PageView({ activity, completed, onToggleComplete }: PageViewProps) {
  const { t } = useLanguage();
  const page = activity.page ?? { content: '', attachments: [] };

  return (
    <div className="space-y-6">
      {page.content?.trim() ? (
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-brand-text dark:text-slate-200">
          {page.content}
        </div>
      ) : (
        <p className="italic text-slate-400">{tr(t, 'lmsEmptyPage', 'Belum ada konten pada halaman ini.')}</p>
      )}

      {page.attachments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {tr(t, 'lmsAttachments', 'Materi Pendukung')}
          </h4>
          <div className="grid gap-3">
            {page.attachments.map((att) => (
              <AttachmentBlock key={att.id} att={att} t={t} />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
        <button
          type="button"
          onClick={() => onToggleComplete(!completed)}
          className={`inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 px-5 py-2.5 font-extrabold transition active:translate-y-0.5 cursor-pointer ${
            completed
              ? 'border-brand-teal bg-brand-teal text-white'
              : 'border-slate-300 bg-white text-brand-text hover:border-brand-teal dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
          }`}
        >
          {completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          {completed ? tr(t, 'lmsCompleted', 'Selesai') : tr(t, 'lmsMarkComplete', 'Tandai Selesai')}
        </button>
      </div>
    </div>
  );
}
