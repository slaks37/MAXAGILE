// ---------------------------------------------------------------------------
// Course Engine — A generic, input-agnostic pipeline that converts any
// content source (PDF, DOCX, Manual Input, AI Output) into a structured
// Course → Module → Lesson → [Learn, Example, Quiz, Review] output.
//
// Architecture:
//
//   ┌───────────────────┐
//   │  DYNAMIC CONTENT  │  ContentSource[]
//   │  PDF / DOCX /     │
//   │  Manual / AI      │
//   └─────────┬─────────┘
//             ▼
//   ┌───────────────────┐
//   │  COURSE SCHEMA    │  CourseBlueprint
//   │  Course > Module  │
//   │  > Lesson > Act   │
//   └─────────┬─────────┘
//             ▼
//   ┌───────────────────┐
//   │  COURSE ENGINE    │  buildCourseFromBlueprint()
//   │  Generic Rules    │
//   │  Dynamic Renderer │
//   │  Progress Logic   │
//   └─────────┬─────────┘
//             ▼
//   ┌───────────────────┐
//   │  Course (LMS)     │  types.ts Course
//   └───────────────────┘
// ---------------------------------------------------------------------------

import type {
  Activity,
  Attachment,
  Course,
  QuizQuestion,
  Section,
} from './types';
import { genId } from './store';

// ═══════════════════════════════════════════════════════════════════════════
// 1. DYNAMIC CONTENT — Input Abstraction
// ═══════════════════════════════════════════════════════════════════════════

export type ContentSourceType = 'pdf' | 'docx' | 'manual' | 'ai';

export interface ContentSource {
  type: ContentSourceType;
  label: string;           // Human name, e.g. "Materi Project Management.pdf"
  text: string;            // Extracted plain text
  attachments?: Attachment[];  // Physical files (sub-PDFs, images, etc.)
  metadata?: Record<string, any>;  // Source-specific extras (page range, AI model, etc.)
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. COURSE SCHEMA — Intermediate Representation
// ═══════════════════════════════════════════════════════════════════════════

export interface LessonBlueprint {
  title: string;
  learnText: string;       // Raw text for Learn stage
  exampleText?: string;    // Optional pre-built example (engine will generate if empty)
  quizQuestions?: QuizQuestion[];  // Optional pre-built quiz (engine will generate if empty)
  reviewItems?: string[];  // Optional review points (engine will generate if empty)
  attachments?: Attachment[];
}

export interface ModuleBlueprint {
  title: string;
  summary: string;
  lessons: LessonBlueprint[];
}

export interface CourseBlueprint {
  title: string;
  summary: string;
  category: string;
  color: string;
  modules: ModuleBlueprint[];
}

export interface CourseEngineResult {
  course: Course;
  extractedTextLength: number;
  generatedTopicsCount: number;
  generatedQuizCount: number;
  processedFilesCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. COURSE ENGINE — Generic Rules & Builders
// ═══════════════════════════════════════════════════════════════════════════

// ---- Rule: Generate Quiz Questions from text ----
function autoGenerateQuiz(text: string, lessonNum: number): QuizQuestion[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 25);
  const questions: QuizQuestion[] = [];

  sentences.slice(0, 3).forEach((sentence) => {
    const words = sentence.split(' ').filter((w) => w.length > 4);
    if (words.length === 0) return;
    const targetWord = words[Math.floor(words.length / 2)];
    const qText = sentence.replace(targetWord, '______');

    const correctId = genId('opt');
    questions.push({
      id: genId('qq'),
      text: `Berdasarkan materi Lesson ${lessonNum}: "${qText.slice(0, 120)}..."`,
      options: [
        { id: correctId, text: targetWord },
        { id: genId('opt'), text: `${targetWord} (Alternatif)` },
        { id: genId('opt'), text: 'Konsep Dasar' },
        { id: genId('opt'), text: 'Variabel Pendukung' },
      ],
      correctOptionId: correctId,
      points: 10,
    });
  });

  if (questions.length === 0) {
    const correctId = genId('opt');
    questions.push({
      id: genId('qq'),
      text: `Apa poin pembelajaran utama pada Lesson ${lessonNum}?`,
      options: [
        { id: correctId, text: `Memahami konsep utama Lesson ${lessonNum}` },
        { id: genId('opt'), text: 'Abaikan materi' },
        { id: genId('opt'), text: 'Hanya membaca judul' },
      ],
      correctOptionId: correctId,
      points: 10,
    });
  }

  return questions;
}

// ---- Rule: Generate Example content from text ----
function autoGenerateExample(text: string, topicTitle: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 30);
  const excerpt = sentences[0] || 'Konsep penting yang perlu diterapkan secara praktis.';

  return (
    `### 💡 Contoh Penerapan Praktis: ${topicTitle}\n\n` +
    `**Skenario Studi Kasus:**\n` +
    `Dalam implementasi nyata, penerapan materi ini dapat dilihat dari skenario berikut:\n\n` +
    `> *"${excerpt.slice(0, 200)}"*\n\n` +
    `**Langkah Penerapan:**\n` +
    `1. **Identifikasi Masalah:** Analisis kondisi awal berdasarkan prinsip utama.\n` +
    `2. **Eksekusi Solusi:** Terapkan formula dan kaidah yang telah dipelajari.\n` +
    `3. **Evaluasi Hasil:** Pastikan kriteria keberhasilan terpenuhi dengan tepat.\n`
  );
}

// ---- Rule: Generate Review checklist items from text ----
function autoGenerateReview(topicTitle: string): string[] {
  return [
    `Saya telah membaca materi Learn tentang ${topicTitle}`,
    `Saya memahami contoh penerapan (Example) dalam skenario nyata`,
    `Saya berhasil menyelesaikan Quiz evaluasi pemahaman`,
    `Refleksi: Saya siap melanjutkan ke lesson berikutnya`,
  ];
}

// ---- Activity Builders ----
function buildLearnActivity(lesson: LessonBlueprint, moduleTitle: string): Activity {
  // Filter out PDF attachments to avoid showing iframe PDF viewer.
  // Learn activities should display extracted text content, not raw PDFs.
  const nonPdfAttachments = (lesson.attachments || []).filter(
    (att) => !att.mimeType?.includes('pdf') && !att.name?.toLowerCase().endsWith('.pdf')
  );

  return {
    id: genId('act-learn'),
    type: 'page',
    title: `📘 Learn: ${lesson.title}`,
    description: `Pembelajaran Konsep Utama — ${moduleTitle}`,
    page: {
      content: lesson.learnText || `Materi pelajaran untuk ${lesson.title}.`,
      attachments: nonPdfAttachments,
    },
  };
}

function buildExampleActivity(lesson: LessonBlueprint, moduleTitle: string): Activity {
  const content = lesson.exampleText || autoGenerateExample(lesson.learnText, lesson.title);
  return {
    id: genId('act-example'),
    type: 'page',
    title: `💡 Example: Contoh & Studi Kasus`,
    description: `Contoh Penerapan & Skenario Praktis — ${moduleTitle}`,
    page: {
      content,
      attachments: [],
    },
  };
}

function buildQuizActivity(lesson: LessonBlueprint, lessonNum: number, moduleTitle: string): { activity: Activity; quizCount: number } {
  const questions = lesson.quizQuestions && lesson.quizQuestions.length > 0
    ? lesson.quizQuestions
    : autoGenerateQuiz(lesson.learnText, lessonNum);

  return {
    activity: {
      id: genId('act-quiz'),
      type: 'quiz',
      title: `🎯 Quiz: Evaluasi Pemahaman`,
      description: `Kuis Evaluasi Pemahaman — ${moduleTitle}`,
      quiz: {
        questions,
        passPercent: 60,
      },
    },
    quizCount: questions.length,
  };
}

function buildReviewActivity(lesson: LessonBlueprint, moduleTitle: string): Activity {
  const items = (lesson.reviewItems || autoGenerateReview(lesson.title)).map((text) => ({
    id: genId('chk'),
    text,
  }));

  return {
    id: genId('act-review'),
    type: 'checklist',
    title: `🔄 Review: Ulasan & Refleksi`,
    description: `Checklist Rangkuman & Refleksi — ${moduleTitle}`,
    checklist: { items },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. MAIN PIPELINE — buildCourseFromBlueprint()
// ═══════════════════════════════════════════════════════════════════════════

export function buildCourseFromBlueprint(
  blueprint: CourseBlueprint,
  processedFilesCount = 1
): CourseEngineResult {
  const sections: Section[] = [];
  let totalQuizCount = 0;
  let totalTextLen = 0;
  let lessonCounter = 0;

  for (const mod of blueprint.modules) {
    const activities: Activity[] = [];

    for (const lesson of mod.lessons) {
      lessonCounter++;
      totalTextLen += (lesson.learnText || '').length;

      // Learn → Example → Quiz → Review
      activities.push(buildLearnActivity(lesson, mod.title));
      activities.push(buildExampleActivity(lesson, mod.title));
      const { activity: quizAct, quizCount } = buildQuizActivity(lesson, lessonCounter, mod.title);
      activities.push(quizAct);
      totalQuizCount += quizCount;
      activities.push(buildReviewActivity(lesson, mod.title));
    }

    sections.push({
      id: genId('sec'),
      title: mod.title,
      summary: mod.summary,
      activities,
    });
  }

  const course: Course = {
    id: genId('course'),
    title: blueprint.title,
    summary: blueprint.summary,
    category: blueprint.category,
    color: blueprint.color,
    order: 0,
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    course,
    extractedTextLength: totalTextLen,
    generatedTopicsCount: sections.length,
    generatedQuizCount: totalQuizCount,
    processedFilesCount,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. SOURCE ADAPTERS — Convert ContentSource[] into CourseBlueprint
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Converts an array of ContentSource inputs into a CourseBlueprint.
 * This is the universal adapter: any input type → schema → engine.
 */
export function contentSourcesToBlueprint(sources: ContentSource[]): CourseBlueprint {
  const primaryLabel = sources[0]?.label || 'Materi Belajar';
  const title = sources.length > 1
    ? `Mini-Course: ${primaryLabel} (+${sources.length - 1} Sumber)`
    : `Mini-Course: ${primaryLabel}`;

  const modules: ModuleBlueprint[] = [];

  for (const [srcIdx, source] of sources.entries()) {
    const text = (source.text || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;

    // Split text into lesson-sized chunks (~800-1200 words per lesson)
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 15);
    const wordsPerLesson = 300;
    const totalWords = text.split(/\s+/).length;
    const lessonCount = Math.min(3, Math.max(1, Math.ceil(totalWords / wordsPerLesson)));
    const sentencesPerLesson = Math.max(1, Math.ceil(sentences.length / lessonCount));

    const lessons: LessonBlueprint[] = [];
    for (let l = 0; l < lessonCount; l++) {
      const lessonSentences = sentences.slice(l * sentencesPerLesson, (l + 1) * sentencesPerLesson);
      if (lessonSentences.length === 0) continue;

      lessons.push({
        title: `Lesson ${l + 1}: ${source.label.replace(/\.[^/.]+$/, '')} — Bagian ${l + 1}`,
        learnText: lessonSentences.join('\n\n'),
        attachments: l === 0 ? source.attachments : undefined,
      });
    }

    if (lessons.length === 0) {
      lessons.push({
        title: `Lesson 1: ${source.label}`,
        learnText: text,
        attachments: source.attachments,
      });
    }

    modules.push({
      title: `Module ${srcIdx + 1}: ${source.label.replace(/\.[^/.]+$/, '')}`,
      summary: `Modul pembelajaran dari sumber: ${source.label} (${source.type.toUpperCase()}).`,
      lessons,
    });
  }

  return {
    title,
    summary: `Mini-course terstruktur (Course → Module → Lesson → Learn, Example, Quiz, Review) dari ${sources.length} sumber konten.`,
    category: 'Kursus Terstruktur',
    color: 'from-emerald-500 to-teal-400',
    modules,
  };
}

/**
 * Converts PyMuPDF API response JSON into a CourseBlueprint.
 */
export function pyMuPdfResponseToBlueprint(data: any, filename: string): CourseBlueprint {
  const modules: ModuleBlueprint[] = [];

  for (const mod of data.modules || []) {
    const lessons: LessonBlueprint[] = [];

    for (const les of mod.lessons || []) {
      lessons.push({
        title: les.title || `Lesson ${mod.step_num}`,
        learnText: les.learn_content || '',
        exampleText: les.example_content || undefined,
        quizQuestions: (les.quiz_questions || []).map((q: any) => ({
          id: q.id || genId('qq'),
          text: q.text,
          options: q.options || [],
          correctOptionId: q.correctOptionId,
          points: q.points || 10,
        })),
        reviewItems: (les.review_items || []).map((item: any) => item.text || item),
        attachments: mod.pdf_url
          ? [{
              id: genId('att'),
              name: `Sub-PDF ${mod.page_label}.pdf`,
              url: mod.pdf_url,
              mimeType: 'application/pdf',
              size: mod.file_size || 1024,
            }]
          : undefined,
      });
    }

    // Fallback: if no lessons from backend, create one from module text
    if (lessons.length === 0 && mod.text) {
      lessons.push({
        title: `Lesson 1: ${mod.page_label || 'Dasar'}`,
        learnText: mod.text,
        attachments: mod.pdf_url
          ? [{
              id: genId('att'),
              name: `Sub-PDF ${mod.page_label}.pdf`,
              url: mod.pdf_url,
              mimeType: 'application/pdf',
              size: mod.file_size || 1024,
            }]
          : undefined,
      });
    }

    modules.push({
      title: mod.title || `Module ${mod.step_num}`,
      summary: mod.summary || `Modul pembelajaran ${mod.page_label || ''} dari PDF ${filename}.`,
      lessons,
    });
  }

  return {
    title: `Mini-Course: ${data.title || filename}`,
    summary: `Mini-course terstruktur (Course → Module → Lesson → Learn, Example, Quiz, Review) dari PyMuPDF (${data.total_pages || '?'} Halaman PDF).`,
    category: 'Pelatihan Dokumen',
    color: 'from-emerald-500 to-teal-400',
    modules,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. CONVENIENCE FUNCTIONS — End-to-end pipelines
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Full pipeline: ContentSource[] → CourseBlueprint → Course
 */
export function generateCourseFromSources(sources: ContentSource[]): CourseEngineResult {
  const blueprint = contentSourcesToBlueprint(sources);
  return buildCourseFromBlueprint(blueprint, sources.length);
}

/**
 * Full pipeline: PyMuPDF JSON response → CourseBlueprint → Course
 */
export function generateCourseFromPyMuPdf(data: any, filename: string): CourseEngineResult {
  const blueprint = pyMuPdfResponseToBlueprint(data, filename);
  return buildCourseFromBlueprint(blueprint, 1);
}
