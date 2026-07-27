export interface LessonAttachment {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  size: number;
  dataBase64?: string;
}

export interface LmsLesson {
  id: string;
  title: string;
  content: string;
  attachments?: LessonAttachment[];
}

export interface LmsCourse {
  id: string;
  title: string;
  category: string;
  summary: string;
  color: string;
  lessons: LmsLesson[];
  createdAt?: string;
  isCustom?: boolean;
}

export type AttachmentKind = 'image' | 'pdf' | 'video' | 'audio' | 'ppt' | 'word' | 'excel' | 'other';

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v'];
const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'];
const PPT_EXTS = ['ppt', 'pptx', 'pps', 'ppsx'];
const WORD_EXTS = ['doc', 'docx', 'rtf'];
const EXCEL_EXTS = ['xls', 'xlsx', 'csv'];

export function attachmentKind(mimeType: string, name: string): AttachmentKind {
  const mt = (mimeType || '').toLowerCase();
  if (mt.startsWith('image/')) return 'image';
  if (mt === 'application/pdf') return 'pdf';
  if (mt.startsWith('video/')) return 'video';
  if (mt.startsWith('audio/')) return 'audio';
  if (mt.includes('presentation') || mt.includes('powerpoint')) return 'ppt';
  if (mt.includes('msword') || mt.includes('wordprocessingml')) return 'word';
  if (mt.includes('spreadsheet') || mt.includes('ms-excel') || mt.includes('excel')) return 'excel';

  const ext = ((name || '').toLowerCase().split('.').pop() || '').trim();
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  if (AUDIO_EXTS.includes(ext)) return 'audio';
  if (PPT_EXTS.includes(ext)) return 'ppt';
  if (WORD_EXTS.includes(ext)) return 'word';
  if (EXCEL_EXTS.includes(ext)) return 'excel';
  return 'other';
}

export function formatBytes(n: number): string {
  if (!n || n <= 0 || !isFinite(n)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const rounded = i === 0 || v >= 10 ? String(Math.round(v)) : v.toFixed(1);
  return `${rounded} ${units[i]}`;
}

// ---------------------------------------------------------------------------
// Learning progress (localStorage-backed)
// ---------------------------------------------------------------------------

export interface CourseProgress {
  completed: string[];
  lastLessonIndex: number;
  updatedAt: string;
}

export type ProgressMap = Record<string, CourseProgress>;

const PROGRESS_KEY = 'maxagile-lms-progress';

export function loadProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: ProgressMap = {};
    for (const [courseId, value] of Object.entries(parsed)) {
      const v = value as Partial<CourseProgress> | null;
      if (!v || typeof v !== 'object') continue;
      out[courseId] = {
        completed: Array.isArray(v.completed) ? v.completed.filter((x): x is string => typeof x === 'string') : [],
        lastLessonIndex: typeof v.lastLessonIndex === 'number' && v.lastLessonIndex >= 0 ? v.lastLessonIndex : 0,
        updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : new Date(0).toISOString(),
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function saveProgress(map: ProgressMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // storage full / unavailable — progress simply won't persist
  }
}

// ---------------------------------------------------------------------------
// API row parsing
// ---------------------------------------------------------------------------

/**
 * Converts a raw API row (where `lessons` is stored as a JSON string)
 * into a safe LmsCourse object.
 */
export function parseCourseRow(row: unknown): LmsCourse {
  const r = (row && typeof row === 'object' ? row : {}) as Record<string, unknown>;
  let lessons: LmsLesson[] = [];
  try {
    const rawLessons = typeof r.lessons === 'string' ? JSON.parse(r.lessons) : r.lessons;
    if (Array.isArray(rawLessons)) {
      lessons = rawLessons
        .filter((l): l is Record<string, unknown> => !!l && typeof l === 'object')
        .map((l, idx) => ({
          id: typeof l.id === 'string' && l.id ? l.id : `lesson-${idx}`,
          title: typeof l.title === 'string' ? l.title : '',
          content: typeof l.content === 'string' ? l.content : '',
          attachments: Array.isArray(l.attachments)
            ? (l.attachments as unknown[])
                .filter((a): a is Record<string, unknown> => !!a && typeof a === 'object')
                .map((a, aIdx) => ({
                  id: typeof a.id === 'string' && a.id ? a.id : `att-${idx}-${aIdx}`,
                  name: typeof a.name === 'string' ? a.name : 'file',
                  mimeType: typeof a.mimeType === 'string' ? a.mimeType : '',
                  url: typeof a.url === 'string' ? a.url : '',
                  size: typeof a.size === 'number' ? a.size : 0,
                }))
            : undefined,
        }));
    }
  } catch {
    lessons = [];
  }

  return {
    id: typeof r.id === 'string' ? r.id : String(r.id ?? ''),
    title: typeof r.title === 'string' ? r.title : '',
    category: typeof r.category === 'string' && r.category ? r.category : 'Umum',
    summary: typeof r.summary === 'string' ? r.summary : '',
    color: typeof r.color === 'string' && r.color ? r.color : 'from-brand-orange to-amber-400',
    lessons,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : undefined,
    isCustom: true,
  };
}
