import React, { useEffect, useRef, useState } from 'react';
import { X, Code2, Download, Copy, Check, Plus, Trash2, Sparkles, AlertCircle, Upload, Save, FileJson, Loader2, Share2, Paperclip, Scissors } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { LmsCourse, LmsLesson, LessonAttachment, formatBytes, parseCourseRow } from './lmsTypes';
import { MaterialSplitterModal } from './lms/editors/MaterialSplitterModal';
import { MaterialChunk } from './lms/materialSplitter';

// Backward-compatible aliases (old imports still compile)
export type EncodedLesson = LmsLesson;
export type EncodedCourse = LmsCourse;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newCourse: LmsCourse) => void;
  initialTab?: 'create' | 'import';
}

interface DraftLesson {
  id: string;
  title: string;
  content: string;
  attachments: LessonAttachment[];
}

const GRADIENTS = [
  'from-brand-orange to-amber-400',
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-indigo-400',
  'from-pink-500 to-rose-400',
  'from-emerald-500 to-teal-400',
  'from-slate-600 to-gray-400',
];

const MAX_FILE_BYTES = 25 * 1024 * 1024;

// UTF-8-safe base64 helpers
const utf8ToBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
const base64ToUtf8 = (b64: string) => decodeURIComponent(escape(atob(b64)));

const newDraftLesson = (): DraftLesson => ({
  id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: '',
  content: '',
  attachments: [],
});

const readFileAsBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'course';

export const MaterialEncoderModal: React.FC<Props> = ({ isOpen, onClose, onImportSuccess, initialTab }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'create' | 'import'>(initialTab || 'create');

  // Create tab state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pendidikan');
  const [summary, setSummary] = useState('');
  const [color, setColor] = useState(GRADIENTS[0]);
  const [lessons, setLessons] = useState<DraftLesson[]>([newDraftLesson()]);
  const [uploadingLessonIds, setUploadingLessonIds] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [splitLessonIndex, setSplitLessonIndex] = useState<number | null>(null);

  // Share state
  const [generatedToken, setGeneratedToken] = useState('');
  const [copied, setCopied] = useState(false);

  // Import tab state
  const [importToken, setImportToken] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [previewCourse, setPreviewCourse] = useState<LmsCourse | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'create');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const resetCreateForm = () => {
    setTitle('');
    setCategory('Pendidikan');
    setSummary('');
    setColor(GRADIENTS[0]);
    setLessons([newDraftLesson()]);
    setGeneratedToken('');
    setCopied(false);
    setSaveError('');
  };

  const resetImportForm = () => {
    setImportToken('');
    setDecodeError('');
    setPreviewCourse(null);
    setImportSuccessMessage(false);
  };

  const handleAddLesson = () => setLessons([...lessons, newDraftLesson()]);

  const handleRemoveLesson = (index: number) => {
    if (lessons.length <= 1) return;
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleLessonChange = (index: number, field: 'title' | 'content', value: string) => {
    setLessons(prev => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const handleRemoveAttachment = (lessonIdx: number, attId: string) => {
    setLessons(prev =>
      prev.map((l, i) => (i === lessonIdx ? { ...l, attachments: l.attachments.filter(a => a.id !== attId) } : l))
    );
  };

  const bumpUploading = (lessonId: string, delta: number) => {
    setUploadingLessonIds(prev => {
      const next = { ...prev, [lessonId]: Math.max(0, (prev[lessonId] || 0) + delta) };
      if (next[lessonId] === 0) delete next[lessonId];
      return next;
    });
  };

  const handleFilesSelected = async (lessonIdx: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const lessonId = lessons[lessonIdx]?.id;
    if (!lessonId) return;

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        alert(t('lmsFileTooLarge'));
        continue;
      }
      bumpUploading(lessonId, 1);
      try {
        const dataBase64 = await readFileAsBase64(file);
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            dataBase64,
          }),
        });
        if (!res.ok) throw new Error('upload failed');
        const att = (await res.json()) as LessonAttachment;
        setLessons(prev =>
          prev.map(l =>
            l.id === lessonId
              ? {
                  ...l,
                  attachments: [
                    ...l.attachments,
                    {
                      id: String(att.id || `att-${Date.now()}`),
                      name: att.name || file.name,
                      mimeType: att.mimeType || file.type || 'application/octet-stream',
                      url: att.url,
                      size: typeof att.size === 'number' ? att.size : file.size,
                    },
                  ],
                }
              : l
          )
        );
      } catch {
        alert(t('lmsUploadFailed'));
      } finally {
        bumpUploading(lessonId, -1);
      }
    }
  };

  const buildCourseFromForm = (): LmsCourse => ({
    id: 'custom-' + Date.now(),
    title: title.trim(),
    category: category.trim(),
    summary: summary.trim(),
    color,
    lessons: lessons
      .filter(l => l.title.trim())
      .map(l => ({
        id: l.id,
        title: l.title.trim(),
        content: l.content,
        attachments: l.attachments.length > 0 ? l.attachments : undefined,
      })),
    createdAt: new Date().toISOString(),
    isCustom: true,
  });

  const hasAnyAttachment = lessons.some(l => l.attachments.length > 0);
  // A course with no titled lesson is meaningless (empty player), so block it.
  const hasValidLesson = lessons.some(l => l.title.trim());

  const handleSave = async () => {
    if (!title.trim() || !hasValidLesson || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const course = buildCourseFromForm();
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: course.title,
          category: course.category,
          summary: course.summary,
          color: course.color,
          lessons: JSON.stringify(course.lessons),
        }),
      });
      if (!res.ok) throw new Error('save failed');
      const row = await res.json();
      const parsed = parseCourseRow(row);
      setSavedFlash(true);
      onImportSuccess(parsed);
      setTimeout(() => {
        setSavedFlash(false);
        resetCreateForm();
        onClose();
      }, 1200);
    } catch {
      setSaveError(t('lmsUploadFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateToken = () => {
    if (!title.trim()) return;
    try {
      const course = buildCourseFromForm();
      // Tokens carry text only — strip attachments
      const stripped: LmsCourse = {
        ...course,
        lessons: course.lessons.map(l => ({ id: l.id, title: l.title, content: l.content })),
      };
      const encoded = utf8ToBase64(JSON.stringify(stripped));
      setGeneratedToken(`MAXAGILE_V1:${encoded}`);
      setCopied(false);
    } catch (err) {
      console.error('Encoding error:', err);
    }
  };

  const handleCopyToken = () => {
    if (!generatedToken) return;
    try {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable — user can still select the text manually
    }
  };

  const handleExportFile = async () => {
    if (!title.trim() || exporting) return;
    setExporting(true);
    try {
      const course = buildCourseFromForm();
      const lessonsWithData: LmsLesson[] = [];
      for (const lesson of course.lessons) {
        if (!lesson.attachments || lesson.attachments.length === 0) {
          lessonsWithData.push(lesson);
          continue;
        }
        const attachments: LessonAttachment[] = [];
        for (const att of lesson.attachments) {
          try {
            const res = await fetch(att.url);
            if (!res.ok) throw new Error('fetch failed');
            const blob = await res.blob();
            const dataBase64 = await readFileAsBase64(blob);
            attachments.push({ ...att, dataBase64 });
          } catch {
            attachments.push({ ...att });
          }
        }
        lessonsWithData.push({ ...lesson, attachments });
      }
      const payload = {
        format: 'MAXAGILE_COURSE_FILE',
        version: 2,
        course: { ...course, lessons: lessonsWithData },
      };
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slugify(course.title)}.maxagile.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert(t('lmsUploadFailed'));
    } finally {
      setExporting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Import tab
  // -------------------------------------------------------------------------

  const normalizeImportedCourse = (raw: unknown): LmsCourse | null => {
    const r = (raw && typeof raw === 'object' ? raw : null) as Record<string, unknown> | null;
    if (!r || typeof r.title !== 'string' || !r.title || !Array.isArray(r.lessons)) return null;
    return {
      id: 'custom-' + Date.now(),
      title: r.title,
      category: typeof r.category === 'string' && r.category ? r.category : 'Umum',
      summary: typeof r.summary === 'string' ? r.summary : '',
      color: typeof r.color === 'string' && r.color ? r.color : GRADIENTS[0],
      lessons: (r.lessons as unknown[])
        .filter((l): l is Record<string, unknown> => !!l && typeof l === 'object')
        .map((l, idx) => ({
          id: typeof l.id === 'string' && l.id ? l.id : `l-import-${idx}`,
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
                  dataBase64: typeof a.dataBase64 === 'string' ? a.dataBase64 : undefined,
                }))
            : undefined,
        })),
      createdAt: new Date().toISOString(),
      isCustom: true,
    };
  };

  const handleImportFileChosen = async (files: FileList | null) => {
    setDecodeError('');
    setPreviewCourse(null);
    setImportSuccessMessage(false);
    const file = files && files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      let courseRaw: unknown = parsed;
      if (parsed && typeof parsed === 'object' && parsed.format === 'MAXAGILE_COURSE_FILE') {
        courseRaw = parsed.course;
      }
      const course = normalizeImportedCourse(courseRaw);
      if (!course) throw new Error('invalid file');
      setPreviewCourse(course);
      setImportToken('');
    } catch {
      setDecodeError(t('invalidToken'));
    } finally {
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  const handleDecodeToken = (rawToken: string) => {
    setImportToken(rawToken);
    setDecodeError('');
    setPreviewCourse(null);
    setImportSuccessMessage(false);

    if (!rawToken.trim()) return;

    try {
      let clean = rawToken.trim();
      if (clean.startsWith('MAXAGILE_V1:')) {
        clean = clean.replace('MAXAGILE_V1:', '');
      }
      const decodedJson = base64ToUtf8(clean);
      const course = normalizeImportedCourse(JSON.parse(decodedJson));
      if (!course) throw new Error('Invalid module structure');
      setPreviewCourse(course);
    } catch {
      setDecodeError(t('invalidToken'));
    }
  };

  const handleImportConfirm = async () => {
    if (!previewCourse || importing) return;
    setImporting(true);
    setDecodeError('');
    try {
      // Re-upload embedded attachments (version-2 files carry dataBase64)
      const lessonsFinal: LmsLesson[] = [];
      for (const lesson of previewCourse.lessons) {
        if (!lesson.attachments || lesson.attachments.length === 0) {
          lessonsFinal.push({ id: lesson.id, title: lesson.title, content: lesson.content });
          continue;
        }
        const attachments: LessonAttachment[] = [];
        for (const att of lesson.attachments) {
          if (att.dataBase64) {
            try {
              const res = await fetch('/api/uploads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  filename: att.name,
                  mimeType: att.mimeType || 'application/octet-stream',
                  dataBase64: att.dataBase64,
                }),
              });
              if (!res.ok) throw new Error('upload failed');
              const uploaded = (await res.json()) as LessonAttachment;
              attachments.push({
                id: String(uploaded.id || att.id),
                name: uploaded.name || att.name,
                mimeType: uploaded.mimeType || att.mimeType,
                url: uploaded.url,
                size: typeof uploaded.size === 'number' ? uploaded.size : att.size,
              });
            } catch {
              // skip attachments that fail to re-upload
            }
          } else if (att.url) {
            attachments.push({ id: att.id, name: att.name, mimeType: att.mimeType, url: att.url, size: att.size });
          }
        }
        lessonsFinal.push({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: previewCourse.title,
          category: previewCourse.category,
          summary: previewCourse.summary,
          color: previewCourse.color,
          lessons: JSON.stringify(lessonsFinal),
        }),
      });
      if (!res.ok) throw new Error('save failed');
      const row = await res.json();
      const parsed = parseCourseRow(row);
      setImportSuccessMessage(true);
      onImportSuccess(parsed);
      setTimeout(() => {
        resetImportForm();
        onClose();
      }, 1200);
    } catch {
      setDecodeError(t('invalidToken'));
    } finally {
      setImporting(false);
    }
  };

  const previewAttachmentCount = previewCourse
    ? previewCourse.lessons.reduce((sum, l) => sum + (l.attachments?.length || 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-orange/10 via-amber-500/10 to-transparent border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-md shadow-brand-orange/20">
              <Code2 size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-brand-text dark:text-white leading-tight">
                {t('lmsCourseStudio')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                {t('encodeMaterial')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-3 rounded-t-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-900 text-brand-orange border-t-2 border-brand-orange shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Code2 size={16} />
            {t('lmsCourseStudio')}
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-5 py-3 rounded-t-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-900 text-brand-orange border-t-2 border-brand-orange shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Download size={16} />
            {t('importCodeTab')}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {activeTab === 'create' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                    {t('materialTitle')} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('lmsMaterialTitlePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-brand-text dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                    {t('category')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-brand-text dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"
                  >
                    <option value="Pendidikan">Pendidikan / Pengajar</option>
                    <option value="UMKM">UMKM & Toko</option>
                    <option value="Marketing">Marketing & Sales</option>
                    <option value="IT">IT & Software</option>
                    <option value="Umum">Umum / General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                  {t('summary')}
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={t('lmsSummaryPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-brand-text dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"
                />
              </div>

              {/* Gradient color picker */}
              <div className="flex items-center gap-3 flex-wrap">
                {GRADIENTS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setColor(g)}
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${g} cursor-pointer transition-all shadow-sm ${
                      color === g ? 'ring-4 ring-brand-orange/40 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {color === g && <Check size={18} className="text-white mx-auto" />}
                  </button>
                ))}
              </div>

              {/* Lessons List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                    {t('lmsLessonsListHeader')}
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLesson}
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline cursor-pointer"
                  >
                    <Plus size={16} /> {t('addLesson')}
                  </button>
                </div>

                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl space-y-3 relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-brand-orange">
                        {t('lmsLessonNumber')} #{idx + 1}
                      </span>
                      {lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLesson(idx)}
                          className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(idx, 'title', e.target.value)}
                        placeholder={`${t('lessonTitle')} #${idx + 1}`}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-brand-text dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSplitLessonIndex(idx)}
                        disabled={!lesson.content?.trim()}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-orange hover:underline cursor-pointer disabled:opacity-40"
                      >
                        <Scissors size={14} /> Pecah Teks
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={lesson.content}
                      onChange={(e) => handleLessonChange(idx, 'content', e.target.value)}
                      placeholder={t('lmsLessonContentPlaceholder')}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-brand-text dark:text-white focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                    />

                    {/* Upload zone */}
                    <label className="block border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-brand-orange/50 hover:bg-brand-orange/5 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,image/*,video/*,audio/*"
                        className="hidden"
                        onChange={(e) => { handleFilesSelected(idx, e.target.files); e.target.value = ''; }}
                      />
                      <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-gray-600 dark:text-gray-300">
                        {uploadingLessonIds[lesson.id] ? (
                          <Loader2 size={16} className="animate-spin text-brand-orange" />
                        ) : (
                          <Upload size={16} className="text-brand-orange" />
                        )}
                        {t('lmsUploadFiles')}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">{t('lmsUploadHint')}</p>
                    </label>

                    {/* Attachment chips */}
                    {lesson.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {lesson.attachments.map(att => (
                          <span
                            key={att.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300 max-w-full"
                          >
                            <Paperclip size={12} className="text-brand-orange shrink-0" />
                            <span className="truncate max-w-[160px]">{att.name}</span>
                            <span className="text-gray-400 shrink-0">{formatBytes(att.size)}</span>
                            <button
                              type="button"
                              title={t('lmsRemoveFile')}
                              onClick={() => handleRemoveAttachment(idx, att.id)}
                              className="text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || !hasValidLesson || saving || Object.keys(uploadingLessonIds).length > 0}
                className="w-full py-3 bg-brand-orange text-white rounded-2xl font-extrabold text-sm shadow-md hover:bg-brand-orange/90 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? t('lmsSaving') : t('save')}
              </button>

              {saveError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {savedFlash && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-400 text-xs font-bold animate-in fade-in duration-200">
                  <Check size={18} className="shrink-0" />
                  <span>{t('lmsSaved')}</span>
                </div>
              )}

              {/* Share / Export */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Share2 size={14} /> {t('lmsExportShare')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateToken}
                    disabled={!title.trim()}
                    className="py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 border-b-4 text-brand-text dark:text-white rounded-2xl font-extrabold text-xs hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} className="text-brand-orange" /> {t('generateToken')}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportFile}
                    disabled={!title.trim() || exporting}
                    className="py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 border-b-4 text-brand-text dark:text-white rounded-2xl font-extrabold text-xs hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {exporting ? <Loader2 size={16} className="animate-spin text-brand-orange" /> : <FileJson size={16} className="text-brand-orange" />}
                    {t('lmsExportFile')}
                  </button>
                </div>

                {generatedToken && (
                  <div className="p-4 bg-brand-orange/5 dark:bg-brand-orange/10 border border-brand-orange/20 rounded-2xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-sm hover:bg-brand-orange/90 transition-all cursor-pointer"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? t('tokenCopied') : t('copyToken')}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={generatedToken}
                      rows={3}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[11px] font-mono text-gray-600 dark:text-gray-300 resize-none outline-none select-all"
                    />
                    {hasAnyAttachment && (
                      <div className="flex items-start gap-2 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>{t('lmsTokenTextOnly')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Import from file */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                  {t('lmsImportFromFile')}
                </label>
                <label className="block border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-orange/50 hover:bg-brand-orange/5 transition-colors">
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => { handleImportFileChosen(e.target.files); e.target.value = ''; }}
                  />
                  <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-gray-600 dark:text-gray-300">
                    <FileJson size={18} className="text-brand-orange" />
                    {t('lmsImportFromFile')}
                  </div>
                </label>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('lmsOrPasteToken')}</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                  {t('pasteToken')}
                </label>
                <textarea
                  rows={4}
                  value={importToken}
                  onChange={(e) => handleDecodeToken(e.target.value)}
                  placeholder={t('lmsTokenPlaceholder')}
                  className="w-full p-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-brand-text dark:text-white focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                />
              </div>

              {decodeError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{decodeError}</span>
                </div>
              )}

              {/* Preview of decoded module */}
              {previewCourse && (
                <div className="p-5 bg-white dark:bg-slate-800 border-2 border-brand-orange/30 rounded-2xl shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-brand-orange/10 text-brand-orange rounded-lg text-[10px] font-extrabold uppercase">
                      {previewCourse.category}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {previewCourse.lessons.length} {t('lmsLessonsLabel')}
                      {previewAttachmentCount > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Paperclip size={12} /> {previewAttachmentCount}
                        </span>
                      )}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-brand-text dark:text-white text-base">
                    {previewCourse.title}
                  </h4>
                  {previewCourse.summary && (
                    <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-2">
                      {previewCourse.summary}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleImportConfirm}
                    disabled={importing}
                    className="w-full py-3 bg-brand-orange text-white rounded-xl font-extrabold text-xs shadow-md hover:bg-brand-orange/90 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {importing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {t('importMaterial')}
                  </button>
                </div>
              )}

              {importSuccessMessage && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-400 text-xs font-bold">
                  <Check size={18} className="shrink-0" />
                  <span>{t('materialImported')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {splitLessonIndex !== null && lessons[splitLessonIndex] && (
        <MaterialSplitterModal
          initialText={lessons[splitLessonIndex].content || ''}
          onApplyChunks={(chunks: MaterialChunk[]) => {
            const targetIdx = splitLessonIndex;
            setSplitLessonIndex(null);
            if (chunks.length > 0 && targetIdx !== null) {
              const currentAttachments = lessons[targetIdx].attachments;
              const newLessons: DraftLesson[] = chunks.map((c) => ({
                id: c.id,
                title: c.title,
                content: c.content,
                attachments: currentAttachments,
              }));
              setLessons((prev) => [
                ...prev.slice(0, targetIdx),
                ...newLessons,
                ...prev.slice(targetIdx + 1),
              ]);
            }
          }}
          onClose={() => setSplitLessonIndex(null)}
        />
      )}
    </div>
  );
};
