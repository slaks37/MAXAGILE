// ---------------------------------------------------------------------------
// Multi-file & PDF Course Generator
//
// This module provides text extraction from files (PDF, DOCX, TXT, MD, PPTX)
// and routes all course generation through the centralized Course Engine.
//
// Pipeline:  File[] → extractText → ContentSource[] → Course Engine → Course
// ---------------------------------------------------------------------------

import type { Attachment } from './types';
import { genId } from './store';
import {
  ContentSource,
  CourseEngineResult,
  generateCourseFromSources,
  generateCourseFromPyMuPdf,
} from './courseEngine';

export type { CourseEngineResult as MultiFileGeneratorResult };

// ═══════════════════════════════════════════════════════════════════════════
// Text Extraction — File readers for each supported format
// ═══════════════════════════════════════════════════════════════════════════

export async function extractTextFromFile(file: File): Promise<{ fileName: string; text: string }> {
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  if (ext === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder('latin1');
      const rawString = decoder.decode(bytes);

      let text = '';
      const tjRegex = /\(([^()]*)\)\s*Tj/g;
      let match: RegExpExecArray | null;
      while ((match = tjRegex.exec(rawString)) !== null) {
        if (match[1]) text += match[1] + ' ';
      }
      const tjArrayRegex = /\[\s*\(([^()]*)\)\s*\]\s*TJ/g;
      while ((match = tjArrayRegex.exec(rawString)) !== null) {
        if (match[1]) text += match[1] + ' ';
      }

      let cleaned = text
        .replace(/\\\( /g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned.length < 100) {
        const asciiOnly = rawString.replace(/[^\x20-\x7E\n]/g, ' ');
        const words = asciiOnly
          .split(/\s+/)
          .filter((w) => w.length > 3 && !/^[0-9]+$/.test(w) && !/^(obj|endobj|stream|endstream)$/.test(w));
        cleaned = words.join(' ');
      }

      return { fileName: file.name, text: cleaned || `Dokumen PDF ${file.name}` };
    } catch {
      return { fileName: file.name, text: `Materi dari PDF ${file.name}` };
    }
  }

  if (ext === 'txt' || ext === 'md') {
    const text = await file.text();
    return { fileName: file.name, text: text.trim() || `Dokumen teks ${file.name}` };
  }

  if (ext === 'docx' || ext === 'doc') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const str = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      const xmlTagStrip = str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = xmlTagStrip.split(' ').filter((w) => w.length > 2);
      return { fileName: file.name, text: words.join(' ') || `Dokumen Word ${file.name}` };
    } catch {
      return { fileName: file.name, text: `Materi dari Word ${file.name}` };
    }
  }

  if (ext === 'pptx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const str = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      const xmlTagStrip = str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = xmlTagStrip.split(' ').filter((w) => w.length > 2);
      return { fileName: file.name, text: words.join(' ') || `Presentasi PowerPoint ${file.name}` };
    } catch {
      return { fileName: file.name, text: `Materi dari PPT ${file.name}` };
    }
  }

  return { fileName: file.name, text: `Materi dari file ${file.name}` };
}

export async function extractTextFromMultipleFiles(
  files: File[]
): Promise<{ combinedText: string; fileTexts: { fileName: string; text: string }[] }> {
  const fileTexts: { fileName: string; text: string }[] = [];
  for (const f of files) {
    const result = await extractTextFromFile(f);
    fileTexts.push(result);
  }

  const combinedText = fileTexts
    .map((ft) => `=== DOKUMEN: ${ft.fileName} ===\n${ft.text}`)
    .join('\n\n');

  return { combinedText, fileTexts };
}

// ═══════════════════════════════════════════════════════════════════════════
// Course Generation — Routes through Course Engine
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Multi-file fallback generator: extracts text client-side, builds ContentSource[], routes through engine.
 */
export function generateCourseFromMultipleFiles(
  files: File[],
  combinedText: string,
  attachments: Attachment[] = []
): CourseEngineResult {
  const sources: ContentSource[] = [];

  // Split combined text back to per-file segments
  const segments = combinedText.split(/=== DOKUMEN: .+ ===\n?/).filter((s) => s.trim().length > 0);

  for (let i = 0; i < files.length; i++) {
    const ext = (files[i].name.split('.').pop() || '').toLowerCase();
    const sourceType = ext === 'pdf' ? 'pdf' : ext === 'docx' || ext === 'doc' ? 'docx' : 'manual';

    sources.push({
      type: sourceType as ContentSource['type'],
      label: files[i].name,
      text: segments[i] || '',
      attachments: i === 0 ? attachments : undefined,
    });
  }

  return generateCourseFromSources(sources);
}

/**
 * PyMuPDF PDF splitter: sends PDF to backend, gets physical sub-PDFs + text, routes through engine.
 */
export async function splitPdfWithPyMuPdf(file: File): Promise<CourseEngineResult | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const dataBase64 = btoa(binary);

    const res = await fetch('/api/split-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, dataBase64 }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.modules) return null;

    return generateCourseFromPyMuPdf(data, file.name);
  } catch {
    return null;
  }
}

/**
 * Manual text input → ContentSource → Course Engine → Course
 */
export function generateCourseFromManualInput(
  title: string,
  text: string
): CourseEngineResult {
  const source: ContentSource = {
    type: 'manual',
    label: title || 'Input Manual',
    text,
  };
  return generateCourseFromSources([source]);
}

/**
 * AI-generated output → ContentSource → Course Engine → Course
 */
export function generateCourseFromAIOutput(
  title: string,
  aiText: string,
  metadata?: Record<string, any>
): CourseEngineResult {
  const source: ContentSource = {
    type: 'ai',
    label: title || 'AI Generated',
    text: aiText,
    metadata,
  };
  return generateCourseFromSources([source]);
}
