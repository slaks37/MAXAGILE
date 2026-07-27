import React from 'react';
import { FileText, HelpCircle, ClipboardCheck, CheckSquare, UploadCloud, MessageSquare } from 'lucide-react';
import type { ActivityType } from './types';

export interface ActivityMeta {
  /** i18n key for the type label */
  labelKey: string;
  Icon: (props: { className?: string; size?: number | string }) => React.JSX.Element;
  /** tailwind background class for the type-icon tile */
  tile: string;
  /** tailwind text/accent class */
  accent: string;
}

export const ACTIVITY_META: Record<ActivityType, ActivityMeta> = {
  page: {
    labelKey: 'lmsActPage',
    Icon: (props) => <FileText {...props} />,
    tile: 'bg-blue-500',
    accent: 'text-blue-500',
  },
  quiz: {
    labelKey: 'lmsActQuiz',
    Icon: (props) => <HelpCircle {...props} />,
    tile: 'bg-violet-500',
    accent: 'text-violet-500',
  },
  assessment: {
    labelKey: 'lmsActAssessment',
    Icon: (props) => <ClipboardCheck {...props} />,
    tile: 'bg-amber-500',
    accent: 'text-amber-500',
  },
  checklist: {
    labelKey: 'lmsActChecklist',
    Icon: (props) => <CheckSquare {...props} />,
    tile: 'bg-brand-teal',
    accent: 'text-brand-teal',
  },
  assignment: {
    labelKey: 'lmsActAssignment',
    Icon: (props) => <UploadCloud {...props} />,
    tile: 'bg-emerald-500',
    accent: 'text-emerald-500',
  },
  forum: {
    labelKey: 'lmsActForum',
    Icon: (props) => <MessageSquare {...props} />,
    tile: 'bg-sky-500',
    accent: 'text-sky-500',
  },
};

/** Tailwind gradient choices for course / assessment-result colors. */
export const GRADIENTS: string[] = [
  'from-brand-orange to-amber-400',
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-indigo-400',
  'from-pink-500 to-rose-400',
  'from-emerald-500 to-teal-400',
  'from-slate-600 to-gray-400',
];
