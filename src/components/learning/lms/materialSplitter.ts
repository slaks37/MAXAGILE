import { genId } from './store';

export interface MaterialChunk {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  readingTimeMinutes: number;
}

export type SplitStrategy = '1min' | 'headings' | 'parts';

/**
 * Calculates estimated reading time in minutes based on word count (average 180 wpm).
 */
export function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 180));
}

/**
 * Counts total words in a string.
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Splits long text material into micro-learning chunks (~150-200 words per chunk for ~1 min read).
 */
export function splitBy1MinRead(text: string, wordsPerChunk = 180): MaterialChunk[] {
  const clean = text.trim();
  if (!clean) return [];

  const paragraphs = clean.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: MaterialChunk[] = [];

  let currentParagraphs: string[] = [];
  let currentWordCount = 0;
  let chunkIndex = 1;

  for (const paragraph of paragraphs) {
    const pWordCount = countWords(paragraph);
    if (currentWordCount > 0 && currentWordCount + pWordCount > wordsPerChunk + 50) {
      const content = currentParagraphs.join('\n\n');
      const wCount = countWords(content);
      chunks.push({
        id: genId('chunk'),
        title: `Bagian ${chunkIndex}: Ringkasan ${chunkIndex}`,
        content,
        wordCount: wCount,
        readingTimeMinutes: estimateReadingTime(wCount),
      });
      chunkIndex++;
      currentParagraphs = [paragraph];
      currentWordCount = pWordCount;
    } else {
      currentParagraphs.push(paragraph);
      currentWordCount += pWordCount;
    }
  }

  if (currentParagraphs.length > 0) {
    const content = currentParagraphs.join('\n\n');
    const wCount = countWords(content);
    chunks.push({
      id: genId('chunk'),
      title: `Bagian ${chunkIndex}: Ringkasan ${chunkIndex}`,
      content,
      wordCount: wCount,
      readingTimeMinutes: estimateReadingTime(wCount),
    });
  }

  return chunks;
}

/**
 * Splits text by Markdown headings (#, ##, ###) or 'Bab X' / 'Topik X' markers.
 */
export function splitByHeadings(text: string): MaterialChunk[] {
  const clean = text.trim();
  if (!clean) return [];

  // Split by markdown headings or Bab/Topik headers
  const headingRegex = /(?=(?:^|\n)(?:#{1,3}\s+|Bab\s+\d+|Topik\s+\d+|Bagian\s+\d+))/i;
  const rawSections = clean.split(headingRegex).filter((s) => s.trim().length > 0);

  if (rawSections.length <= 1) {
    // Fall back to paragraph splitting if no headings found
    return splitBy1MinRead(text, 250);
  }

  return rawSections.map((section, idx) => {
    const lines = section.trim().split('\n');
    const firstLine = lines[0].replace(/^#{1,3}\s*/, '').trim();
    const title = firstLine.length < 60 ? firstLine : `Bagian ${idx + 1}`;
    const content = section.trim();
    const wCount = countWords(content);

    return {
      id: genId('chunk'),
      title: title.startsWith('Bagian') || title.startsWith('Bab') ? title : `Bagian ${idx + 1}: ${title}`,
      content,
      wordCount: wCount,
      readingTimeMinutes: estimateReadingTime(wCount),
    };
  });
}

/**
 * Splits text into a specific number of equal parts (e.g., 3, 5, or 10 parts).
 */
export function splitByCount(text: string, partsCount = 3): MaterialChunk[] {
  const clean = text.trim();
  if (!clean) return [];

  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length < partsCount) {
    return splitBy1MinRead(text);
  }

  const chunkSize = Math.ceil(sentences.length / partsCount);
  const chunks: MaterialChunk[] = [];

  for (let i = 0; i < partsCount; i++) {
    const partSentences = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
    if (partSentences.length === 0) continue;

    const content = partSentences.join(' ');
    const wCount = countWords(content);

    chunks.push({
      id: genId('chunk'),
      title: `Bagian ${i + 1} dari ${partsCount}`,
      content,
      wordCount: wCount,
      readingTimeMinutes: estimateReadingTime(wCount),
    });
  }

  return chunks;
}
