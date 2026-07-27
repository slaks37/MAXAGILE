// ---------------------------------------------------------------------------
// MaxAgile LMS store — API access, progress persistence, codec helpers.
// Pure TypeScript (no JSX). Every network call is resilient: it never throws
// an uncaught error to the UI except where the contract explicitly requires it
// (uploadFile over-size, decodeCourseToken invalid input).
// ---------------------------------------------------------------------------

import type {
  Activity,
  ActivityType,
  Attachment,
  AttachmentKind,
  AssessmentQuestion,
  AssessmentResult,
  ChecklistItem,
  Course,
  CourseFileV3,
  CourseProgress,
  ForumPost,
  ProgressMap,
  QuizQuestion,
  Section,
} from './types';

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

export function genId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugify(s: string): string {
  return (
    (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'course'
  );
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

// ---------------------------------------------------------------------------
// Row / shape normalization
// ---------------------------------------------------------------------------

const ACTIVITY_TYPES: ActivityType[] = ['page', 'quiz', 'assessment', 'checklist', 'assignment', 'forum'];

function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}
function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' && isFinite(v) ? v : fallback;
}

function normalizeAttachment(raw: unknown, idx: number): Attachment {
  const a = asObj(raw);
  const att: Attachment = {
    id: str(a.id) || genId('att'),
    name: str(a.name, 'file'),
    mimeType: str(a.mimeType),
    url: str(a.url),
    size: num(a.size),
  };
  if (typeof a.dataBase64 === 'string' && a.dataBase64) att.dataBase64 = a.dataBase64;
  void idx;
  return att;
}

function normalizeQuizQuestion(raw: unknown): QuizQuestion {
  const q = asObj(raw);
  const options = Array.isArray(q.options)
    ? q.options.map((o) => {
        const oo = asObj(o);
        return { id: str(oo.id) || genId('opt'), text: str(oo.text) };
      })
    : [];
  return {
    id: str(q.id) || genId('qq'),
    text: str(q.text),
    options,
    correctOptionId: str(q.correctOptionId),
    points: num(q.points, 1),
  };
}

function normalizeAssessmentQuestion(raw: unknown): AssessmentQuestion {
  const q = asObj(raw);
  const options = Array.isArray(q.options)
    ? q.options.map((o) => {
        const oo = asObj(o);
        return { id: str(oo.id) || genId('opt'), text: str(oo.text), score: num(oo.score) };
      })
    : [];
  return {
    id: str(q.id) || genId('aq'),
    text: str(q.text),
    options,
  };
}

function normalizeAssessmentResult(raw: unknown): AssessmentResult {
  const r = asObj(raw);
  return {
    id: str(r.id) || genId('res'),
    minAvg: num(r.minAvg),
    title: str(r.title),
    description: str(r.description),
    color: str(r.color, 'from-blue-500 to-indigo-600'),
  };
}

function normalizeChecklistItem(raw: unknown): ChecklistItem {
  const i = asObj(raw);
  return { id: str(i.id) || genId('cli'), text: str(i.text) };
}

function normalizeActivity(raw: unknown): Activity {
  const a = asObj(raw);
  const type: ActivityType = ACTIVITY_TYPES.includes(a.type as ActivityType)
    ? (a.type as ActivityType)
    : 'page';

  const activity: Activity = {
    id: str(a.id) || genId('act'),
    type,
    title: str(a.title),
  };
  if (typeof a.description === 'string' && a.description) activity.description = a.description;

  if (type === 'page') {
    const p = asObj(a.page);
    activity.page = {
      content: str(p.content),
      attachments: Array.isArray(p.attachments)
        ? p.attachments.map((x, i) => normalizeAttachment(x, i))
        : [],
    };
  } else if (type === 'quiz') {
    const q = asObj(a.quiz);
    activity.quiz = {
      questions: Array.isArray(q.questions) ? q.questions.map(normalizeQuizQuestion) : [],
      passPercent: num(q.passPercent, 60),
    };
  } else if (type === 'assessment') {
    const s = asObj(a.assessment);
    activity.assessment = {
      questions: Array.isArray(s.questions) ? s.questions.map(normalizeAssessmentQuestion) : [],
      results: Array.isArray(s.results) ? s.results.map(normalizeAssessmentResult) : [],
    };
  } else if (type === 'checklist') {
    const c = asObj(a.checklist);
    activity.checklist = {
      items: Array.isArray(c.items) ? c.items.map(normalizeChecklistItem) : [],
    };
  } else if (type === 'assignment') {
    const asgn = asObj(a.assignment);
    activity.assignment = {
      instructions: str(asgn.instructions),
      dueDate: typeof asgn.dueDate === 'string' ? asgn.dueDate : undefined,
      maxScore: num(asgn.maxScore, 100),
      allowFileUpload: typeof asgn.allowFileUpload === 'boolean' ? asgn.allowFileUpload : true,
    };
  } else if (type === 'forum') {
    const f = asObj(a.forum);
    const posts = Array.isArray(f.posts)
      ? f.posts.map((post) => {
          const p = asObj(post);
          const replies = Array.isArray(p.replies)
            ? p.replies.map((rep) => {
                const r = asObj(rep);
                return {
                  id: str(r.id) || genId('reply'),
                  authorName: str(r.authorName, 'Pengguna'),
                  authorRole: str(r.authorRole, 'Siswa'),
                  content: str(r.content),
                  createdAt: str(r.createdAt, new Date().toISOString()),
                  likes: num(r.likes, 0),
                };
              })
            : [];
          return {
            id: str(p.id) || genId('post'),
            title: str(p.title),
            authorName: str(p.authorName, 'Pengguna'),
            authorRole: str(p.authorRole, 'Siswa'),
            content: str(p.content),
            createdAt: str(p.createdAt, new Date().toISOString()),
            replies,
            likes: num(p.likes, 0),
          };
        })
      : [];
    activity.forum = {
      prompt: str(f.prompt),
      allowStudentPosts: typeof f.allowStudentPosts === 'boolean' ? f.allowStudentPosts : true,
      posts,
    };
  }

  return activity;
}

function normalizeSection(raw: unknown): Section {
  const s = asObj(raw);
  const section: Section = {
    id: str(s.id) || genId('sec'),
    title: str(s.title),
    activities: Array.isArray(s.activities) ? s.activities.map(normalizeActivity) : [],
  };
  if (typeof s.summary === 'string' && s.summary) section.summary = s.summary;
  return section;
}

/**
 * Convert a raw API row (where `sections` is stored as a JSON string) into a
 * safe Course object. Never throws.
 */
export function parseCourseRow(row: unknown): Course {
  const r = asObj(row);
  let sections: Section[] = [];
  try {
    const rawSections = typeof r.sections === 'string' ? JSON.parse(r.sections) : r.sections;
    if (Array.isArray(rawSections)) sections = rawSections.map(normalizeSection);
  } catch {
    sections = [];
  }

  return {
    id: str(r.id) || String(r.id ?? ''),
    title: str(r.title),
    summary: str(r.summary),
    category: str(r.category) || 'Umum',
    color: str(r.color) || 'from-brand-orange to-amber-400',
    order: typeof r.order === 'number' ? r.order : 0,
    sections,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : undefined,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : undefined,
  };
}

// ---------------------------------------------------------------------------
// Course CRUD (all resilient)
// ---------------------------------------------------------------------------

export async function fetchCourses(): Promise<Course[]> {
  try {
    const res = await fetch('/api/courses');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(parseCourseRow);
  } catch {
    return [];
  }
}

/** Build the request body, stringifying `sections` when present as an array. */
function coursePayload(partial: Partial<Course>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (partial.title !== undefined) body.title = partial.title;
  if (partial.summary !== undefined) body.summary = partial.summary;
  if (partial.category !== undefined) body.category = partial.category;
  if (partial.color !== undefined) body.color = partial.color;
  if (partial.order !== undefined) body.order = partial.order;
  if (partial.sections !== undefined) {
    body.sections = Array.isArray(partial.sections)
      ? JSON.stringify(partial.sections)
      : partial.sections;
  }
  return body;
}

export async function createCourse(partial: Partial<Course>): Promise<Course> {
  const res = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coursePayload(partial)),
  });
  if (!res.ok) {
    let msg = `Failed to create course (${res.status})`;
    try {
      const e = await res.json();
      if (e && typeof e.error === 'string') msg = e.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return parseCourseRow(await res.json());
}

export async function updateCourse(id: string, partial: Partial<Course>): Promise<Course> {
  const res = await fetch(`/api/courses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coursePayload(partial)),
  });
  if (!res.ok) {
    let msg = `Failed to update course (${res.status})`;
    try {
      const e = await res.json();
      if (e && typeof e.error === 'string') msg = e.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return parseCourseRow(await res.json());
}

export async function deleteCourse(id: string): Promise<void> {
  try {
    await fetch(`/api/courses/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch {
    // deletion is idempotent from the UI's perspective
  }
}

// ---------------------------------------------------------------------------
// File uploads
// ---------------------------------------------------------------------------

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB client-side cap

function readFileAsBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * POST a base64 payload to /api/uploads and return the resulting Attachment.
 * Throws on non-ok responses.
 */
async function postUpload(
  filename: string,
  mimeType: string,
  dataBase64: string,
): Promise<Attachment> {
  const res = await fetch('/api/uploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, mimeType, dataBase64 }),
  });
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try {
      const e = await res.json();
      if (e && typeof e.error === 'string') msg = e.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const j = asObj(await res.json());
  return {
    id: str(j.id) || genId('att'),
    name: str(j.name, filename),
    mimeType: str(j.mimeType, mimeType),
    url: str(j.url),
    size: num(j.size),
  };
}

/**
 * Upload a File selected by the user. Throws if the file exceeds the 25MB
 * client-side cap (per contract).
 */
export async function uploadFile(file: File): Promise<Attachment> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File too large (max ${formatBytes(MAX_UPLOAD_BYTES)})`);
  }
  const dataBase64 = await readFileAsBase64(file);
  return postUpload(file.name, file.type || 'application/octet-stream', dataBase64);
}

// ---------------------------------------------------------------------------
// Progress persistence (localStorage)
// ---------------------------------------------------------------------------

const PROGRESS_KEY = 'maxagile-lms-progress-v3';

export function emptyCourseProgress(): CourseProgress {
  return {
    completion: {},
    quiz: {},
    assessment: {},
    checklist: {},
    assignment: {},
    forumPosts: {},
    studentName: 'Siswa MaxAgile',
    updatedAt: new Date(0).toISOString(),
  };
}

function normalizeBoolMap(v: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  const o = asObj(v);
  for (const [k, val] of Object.entries(o)) out[k] = !!val;
  return out;
}

function normalizeCourseProgress(v: unknown): CourseProgress {
  const p = asObj(v);
  const cp = emptyCourseProgress();
  cp.completion = normalizeBoolMap(p.completion);

  const quiz = asObj(p.quiz);
  for (const [actId, val] of Object.entries(quiz)) {
    const q = asObj(val);
    cp.quiz[actId] = {
      percent: num(q.percent),
      answers: (() => {
        const ans: Record<string, string> = {};
        for (const [qid, oid] of Object.entries(asObj(q.answers))) ans[qid] = str(oid);
        return ans;
      })(),
    };
  }

  const assessment = asObj(p.assessment);
  for (const [actId, val] of Object.entries(assessment)) {
    const a = asObj(val);
    cp.assessment[actId] = {
      avg: num(a.avg),
      resultId: str(a.resultId),
      answers: (() => {
        const ans: Record<string, string> = {};
        for (const [qid, oid] of Object.entries(asObj(a.answers))) ans[qid] = str(oid);
        return ans;
      })(),
    };
  }

  const checklist = asObj(p.checklist);
  for (const [actId, val] of Object.entries(checklist)) {
    cp.checklist[actId] = normalizeBoolMap(val);
  }

  const assignment = asObj(p.assignment);
  for (const [actId, val] of Object.entries(assignment)) {
    const sub = asObj(val);
    cp.assignment[actId] = {
      submittedAt: str(sub.submittedAt),
      textAnswer: str(sub.textAnswer),
      attachments: Array.isArray(sub.attachments)
        ? sub.attachments.map((x, i) => normalizeAttachment(x, i))
        : [],
      grade: typeof sub.grade === 'number' ? sub.grade : undefined,
      feedback: str(sub.feedback),
      gradedAt: str(sub.gradedAt),
    };
  }

  if (p.forumPosts && typeof p.forumPosts === 'object') {
    cp.forumPosts = p.forumPosts as Record<string, ForumPost[]>;
  }

  if (typeof p.studentName === 'string') {
    cp.studentName = p.studentName;
  }

  cp.updatedAt = str(p.updatedAt, new Date(0).toISOString());
  return cp;
}

export function loadProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: ProgressMap = {};
    for (const [courseId, value] of Object.entries(parsed)) {
      out[courseId] = normalizeCourseProgress(value);
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
// Progress computation
// ---------------------------------------------------------------------------

/** Whether a single activity counts as complete for the given progress. */
export function isActivityComplete(activity: Activity, cp: CourseProgress | undefined): boolean {
  if (!activity) return false;
  if (!cp) return false;

  if (activity.type === 'checklist') {
    const items = activity.checklist?.items || [];
    if (items.length === 0) return false;
    const state = cp.checklist[activity.id] || {};
    return items.every((it) => !!state[it.id]);
  }

  if (activity.type === 'quiz') {
    if (cp.completion[activity.id]) return true;
    const q = cp.quiz[activity.id];
    const pass = activity.quiz?.passPercent ?? 0;
    return !!q && q.percent >= pass;
  }

  if (activity.type === 'assessment') {
    if (cp.completion[activity.id]) return true;
    return !!cp.assessment[activity.id];
  }

  if (activity.type === 'assignment') {
    if (cp.completion[activity.id]) return true;
    return !!cp.assignment[activity.id]?.submittedAt;
  }

  if (activity.type === 'forum') {
    if (cp.completion[activity.id]) return true;
    return (cp.forumPosts?.[activity.id]?.length || 0) > 0;
  }

  // page
  return !!cp.completion[activity.id];
}

/** 0-100 percentage of completed activities in a course. */
export function courseProgressPercent(course: Course, cp: CourseProgress | undefined): number {
  if (!course) return 0;
  const activities: Activity[] = [];
  for (const s of course.sections || []) {
    for (const a of s.activities || []) activities.push(a);
  }
  const total = activities.length;
  if (total === 0) return 0;
  let done = 0;
  for (const a of activities) if (isActivityComplete(a, cp)) done++;
  return Math.round((done / total) * 100);
}

// ---------------------------------------------------------------------------
// UTF-8 safe base64
// ---------------------------------------------------------------------------

function utf8ToBase64(s: string): string {
  return btoa(unescape(encodeURIComponent(s)));
}
function base64ToUtf8(b64: string): string {
  return decodeURIComponent(escape(atob(b64)));
}

// ---------------------------------------------------------------------------
// Codec: file export/import + share tokens
// ---------------------------------------------------------------------------

/**
 * Serialize a full course (embedding every attachment as base64) into a
 * downloadable JSON Blob wrapped in the MAXAGILE_COURSE_V3 envelope.
 */
export async function exportCourseFile(course: Course): Promise<Blob> {
  const cloned: Course = JSON.parse(JSON.stringify(course));

  for (const section of cloned.sections || []) {
    for (const activity of section.activities || []) {
      if (activity.type !== 'page' || !activity.page) continue;
      const attachments = activity.page.attachments || [];
      for (const att of attachments) {
        if (att.dataBase64 || !att.url) continue;
        try {
          const res = await fetch(att.url);
          if (!res.ok) continue;
          const blob = await res.blob();
          att.dataBase64 = await readFileAsBase64(blob);
        } catch {
          // leave attachment without embedded data; url may still resolve
        }
      }
    }
  }

  const envelope: CourseFileV3 = {
    format: 'MAXAGILE_COURSE_V3',
    version: 3,
    course: cloned,
  };
  return new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
}

/** Extract a Course from either a v3 envelope or a bare Course-shaped object. */
function extractCourse(parsedJson: unknown): Course {
  const obj = asObj(parsedJson);
  if (obj.format === 'MAXAGILE_COURSE_V3' && obj.course) {
    return parseCourseRow({ ...asObj(obj.course), sections: (asObj(obj.course).sections) });
  }
  // bare Course-shaped object
  return parseCourseRow(obj);
}

/**
 * Import a parsed course JSON (v3 envelope or bare Course). Re-uploads every
 * embedded attachment, rewrites its url, drops dataBase64, then persists the
 * course via createCourse. Returns the created Course.
 */
export async function importCourseFile(parsedJson: unknown): Promise<Course> {
  const course = extractCourse(parsedJson);

  // Re-upload embedded attachments and rewrite urls.
  for (const section of course.sections || []) {
    for (const activity of section.activities || []) {
      if (activity.type !== 'page' || !activity.page) continue;
      const rebuilt: Attachment[] = [];
      for (const att of activity.page.attachments || []) {
        if (att.dataBase64) {
          try {
            const uploaded = await postUpload(
              att.name || 'file',
              att.mimeType || 'application/octet-stream',
              att.dataBase64,
            );
            rebuilt.push({ ...uploaded, name: att.name || uploaded.name });
            continue;
          } catch {
            // fall through: keep original (minus dataBase64) if re-upload fails
          }
        }
        const { dataBase64: _drop, ...rest } = att;
        void _drop;
        rebuilt.push(rest);
      }
      activity.page.attachments = rebuilt;
    }
  }

  // Fresh ids and metadata for the imported copy.
  const payload: Partial<Course> = {
    title: course.title,
    summary: course.summary,
    category: course.category,
    color: course.color,
    order: course.order,
    sections: course.sections,
  };
  return createCourse(payload);
}

/** Compact share token — course structure WITHOUT attachments. */
export function exportCourseToken(course: Course): string {
  const cloned: Course = JSON.parse(JSON.stringify(course));
  for (const section of cloned.sections || []) {
    for (const activity of section.activities || []) {
      if (activity.type === 'page' && activity.page) {
        activity.page.attachments = [];
      }
    }
  }
  return 'MAXAGILE_C3:' + utf8ToBase64(JSON.stringify(cloned));
}

/** Decode a share token back into a Course. Throws on invalid input. */
export function decodeCourseToken(token: string): Course {
  const trimmed = (token || '').trim();
  const prefix = 'MAXAGILE_C3:';
  if (!trimmed.startsWith(prefix)) {
    throw new Error('Invalid course token');
  }
  const b64 = trimmed.slice(prefix.length);
  let json: string;
  try {
    json = base64ToUtf8(b64);
  } catch {
    throw new Error('Invalid course token');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid course token');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid course token');
  }
  return parseCourseRow(parsed);
}
