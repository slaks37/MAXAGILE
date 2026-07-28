// ---------------------------------------------------------------------------
// MaxAgile LMS (Moodle-style) — data model
// ---------------------------------------------------------------------------

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  size: number;
  dataBase64?: string;
}

export type ActivityType =
  | 'page'
  | 'lesson'
  | 'quiz'
  | 'assessment'
  | 'checklist'
  | 'assignment'
  | 'forum';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  points: number;
}

export interface AssessmentOption {
  id: string;
  text: string;
  score: number;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: AssessmentOption[];
}

export interface AssessmentResult {
  id: string;
  minAvg: number;
  title: string;
  description: string;
  /** tailwind gradient string, e.g. "from-blue-500 to-indigo-600" */
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Lesson (Coursiv-style, one interactive block at a time)
// ---------------------------------------------------------------------------

export type LessonBlockType =
  | 'text'
  | 'keypoint'
  | 'image'
  | 'check'
  | 'flashcard'
  | 'match'
  | 'fillblank'
  | 'reflect';

export interface LessonBlockBase {
  id: string;
  type: LessonBlockType;
}

export interface TextBlock extends LessonBlockBase {
  type: 'text';
  title?: string;
  body: string;
}

export interface KeypointBlock extends LessonBlockBase {
  type: 'keypoint';
  title?: string;
  points: string[];
}

export interface ImageBlock extends LessonBlockBase {
  type: 'image';
  attachment: Attachment;
  caption?: string;
}

export interface CheckBlock extends LessonBlockBase {
  type: 'check';
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface FlashcardBlock extends LessonBlockBase {
  type: 'flashcard';
  front: string;
  back: string;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchBlock extends LessonBlockBase {
  type: 'match';
  prompt?: string;
  pairs: MatchPair[];
}

export interface FillBlankBlock extends LessonBlockBase {
  type: 'fillblank';
  /** the gap is written as "___" */
  sentence: string;
  answer: string;
  options: string[];
}

export interface ReflectBlock extends LessonBlockBase {
  type: 'reflect';
  prompt: string;
  placeholder?: string;
}

export type LessonBlock =
  | TextBlock
  | KeypointBlock
  | ImageBlock
  | CheckBlock
  | FlashcardBlock
  | MatchBlock
  | FillBlankBlock
  | ReflectBlock;

export interface LessonActivity {
  blocks: LessonBlock[];
}

export interface PageActivity {
  content: string;
  attachments: Attachment[];
}

export interface QuizActivity {
  questions: QuizQuestion[];
  passPercent: number;
}

export interface AssessmentActivity {
  questions: AssessmentQuestion[];
  results: AssessmentResult[];
}

export interface ChecklistActivity {
  items: ChecklistItem[];
}

export interface AssignmentSubmission {
  submittedAt: string;
  textAnswer?: string;
  attachments?: Attachment[];
  grade?: number; // 0 - 100
  feedback?: string;
  gradedAt?: string;
}

export interface AssignmentActivity {
  instructions: string;
  dueDate?: string;
  maxScore: number;
  allowFileUpload?: boolean;
}

export interface ForumReply {
  id: string;
  authorName: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  likes?: number;
}

export interface ForumPost {
  id: string;
  title: string;
  authorName: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  replies: ForumReply[];
  likes?: number;
}

export interface ForumActivity {
  prompt: string;
  allowStudentPosts?: boolean;
  posts: ForumPost[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  page?: PageActivity;
  lesson?: LessonActivity;
  quiz?: QuizActivity;
  assessment?: AssessmentActivity;
  checklist?: ChecklistActivity;
  assignment?: AssignmentActivity;
  forum?: ForumActivity;
}

export interface Section {
  id: string;
  title: string;
  summary?: string;
  activities: Activity[];
}

export interface Course {
  id: string;
  title: string;
  summary: string;
  category: string;
  /** tailwind gradient string */
  color: string;
  order?: number;
  sections: Section[];
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Learner progress (localStorage-backed)
// ---------------------------------------------------------------------------

export interface QuizProgress {
  percent: number;
  answers: Record<string, string>; // questionId -> optionId
}

export interface AssessmentProgress {
  avg: number;
  resultId: string;
  answers: Record<string, string>; // questionId -> optionId
}

export interface LessonProgress {
  /** index of the block the learner is currently on */
  index: number;
  answers: Record<string, string>; // blockId -> chosen answer
  notes?: Record<string, string>; // blockId -> free-text reflection
  completed: boolean;
}

export interface CourseProgress {
  completion: Record<string, boolean>; // activityId -> completed
  lesson?: Record<string, LessonProgress>; // activityId -> lesson progress
  quiz: Record<string, QuizProgress>; // activityId -> quiz result
  assessment: Record<string, AssessmentProgress>; // activityId -> assessment result
  checklist: Record<string, Record<string, boolean>>; // activityId -> (itemId -> checked)
  assignment: Record<string, AssignmentSubmission>; // activityId -> submission
  forumPosts?: Record<string, ForumPost[]>; // activityId -> additional posts
  studentName?: string; // learner name for certificate
  updatedAt: string;
}

export type ProgressMap = Record<string, CourseProgress>; // courseId -> progress

// ---------------------------------------------------------------------------
// Import/export codec envelope
// ---------------------------------------------------------------------------

export interface CourseFileV3 {
  format: 'MAXAGILE_COURSE_V3';
  version: 3;
  course: Course;
}

export type AttachmentKind =
  | 'image'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'ppt'
  | 'word'
  | 'excel'
  | 'other';
