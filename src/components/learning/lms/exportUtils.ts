import type { Course, CourseProgress } from './types';
import { isActivityComplete } from './store';

/**
 * Triggers a browser file download for text or blob data.
 */
export function downloadFile(fileName: string, content: string | Blob, mimeType: string): void {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports a full course into a clean Markdown (.md) document file.
 */
export function exportCourseToMarkdown(course: Course): void {
  let md = `# ${course.title}\n\n`;

  if (course.summary) {
    md += `> **Ringkasan Kursus:** ${course.summary}\n\n`;
  }
  md += `**Kategori:** ${course.category || 'Umum'}  \n`;
  md += `**Jumlah Modul/Topik:** ${(course.sections || []).length} Modul\n\n`;
  md += `---\n\n`;

  for (const [sIdx, section] of (course.sections || []).entries()) {
    md += `## Modul ${sIdx + 1}: ${section.title}\n\n`;
    if (section.summary) {
      md += `*${section.summary}*\n\n`;
    }

    for (const activity of section.activities || []) {
      md += `### ${activity.title} (${activity.type.toUpperCase()})\n\n`;
      if (activity.description) {
        md += `${activity.description}\n\n`;
      }

      if (activity.type === 'page' && activity.page) {
        md += `${activity.page.content}\n\n`;
        if (activity.page.attachments && activity.page.attachments.length > 0) {
          md += `**Lampiran File:**\n`;
          for (const att of activity.page.attachments) {
            md += `- [${att.name}](${att.url})\n`;
          }
          md += `\n`;
        }
      } else if (activity.type === 'checklist' && activity.checklist) {
        md += `**Daftar Centang Langkah Belajar:**\n`;
        for (const item of activity.checklist.items) {
          md += `- [ ] ${item.text}\n`;
        }
        md += `\n`;
      } else if (activity.type === 'quiz' && activity.quiz) {
        md += `**Soal Evaluasi Kuis (Nilai Kelulusan: ${activity.quiz.passPercent}%):**\n\n`;
        for (const [qIdx, q] of activity.quiz.questions.entries()) {
          md += `${qIdx + 1}. **${q.text}** (${q.points} Poin)\n`;
          for (const opt of q.options) {
            const isCorrect = opt.id === q.correctOptionId;
            md += `   - ${isCorrect ? '[x]' : '[ ]'} ${opt.text}${isCorrect ? ' *(Kunci Jawaban)*' : ''}\n`;
          }
          md += `\n`;
        }
      } else if (activity.type === 'assignment' && activity.assignment) {
        md += `**Petunjuk Tugas (Maks Nilai: ${activity.assignment.maxScore}):**\n\n`;
        md += `${activity.assignment.instructions}\n\n`;
        if (activity.assignment.dueDate) {
          md += `*Batas Waktu: ${new Date(activity.assignment.dueDate).toLocaleDateString('id-ID')}*\n\n`;
        }
      } else if (activity.type === 'forum' && activity.forum) {
        md += `**Topik Pemantik Forum Diskusi:**\n\n`;
        md += `${activity.forum.prompt}\n\n`;
      }

      md += `---\n\n`;
    }
  }

  const safeTitle = (course.title || 'Kursus').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadFile(`${safeTitle}.md`, md, 'text/markdown;charset=utf-8');
}

/**
 * Exports gradebook summary & detailed progress to a CSV spreadsheet file.
 */
export function exportGradebookToCsv(course: Course, progress: CourseProgress): void {
  const rows: string[][] = [
    ['Topik / Modul', 'Nama Aktivitas', 'Jenis Aktivitas', 'Status Penyelesaian', 'Nilai / Hasil'],
  ];

  for (const section of course.sections || []) {
    for (const activity of section.activities || []) {
      const completed = isActivityComplete(activity, progress);
      let scoreStr = '-';

      if (activity.type === 'quiz') {
        const qp = progress.quiz[activity.id];
        scoreStr = qp ? `${qp.percent}%` : 'Belum Dikerjakan';
      } else if (activity.type === 'assignment') {
        const sub = progress.assignment[activity.id];
        if (sub && typeof sub.grade === 'number') {
          scoreStr = `${sub.grade} / ${activity.assignment?.maxScore || 100}`;
        } else if (sub && sub.submittedAt) {
          scoreStr = 'Terkirim (Belum Dinilai)';
        } else {
          scoreStr = 'Belum Dikirim';
        }
      } else if (activity.type === 'assessment') {
        const ap = progress.assessment[activity.id];
        scoreStr = ap ? `Skala: ${ap.avg}` : 'Belum Diisi';
      } else if (activity.type === 'checklist') {
        const chk = progress.checklist[activity.id] || {};
        const totalItems = activity.checklist?.items.length || 0;
        const doneItems = Object.values(chk).filter(Boolean).length;
        scoreStr = `${doneItems} / ${totalItems} Item`;
      } else if (activity.type === 'page') {
        scoreStr = completed ? 'Dibaca' : 'Belum Dibaca';
      } else if (activity.type === 'forum') {
        const count = progress.forumPosts?.[activity.id]?.length || 0;
        scoreStr = `${count} Postingan`;
      }

      rows.push([
        section.title,
        activity.title,
        activity.type,
        completed ? 'Selesai' : 'Belum Selesai',
        scoreStr,
      ]);
    }
  }

  // Format CSV cells with quotes and proper escaping
  const csvContent = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  const safeTitle = (course.title || 'Kursus').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadFile(`Buku_Nilai_${safeTitle}.csv`, '\uFEFF' + csvContent, 'text/csv;charset=utf-8');
}
