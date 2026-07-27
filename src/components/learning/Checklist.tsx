import { useState, useEffect } from 'react';
import { CheckSquare, Square, Trash2, ListTodo, Trophy } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const CONTENT = {
  id: {
    items: [
      { id: '1', text: "Tim memahami konsep dasar Agile dan perbedaan dengan Waterfall" },
      { id: '2', text: "Peran Product Owner (Penentu Visi & Prioritas) telah ditentukan" },
      { id: '3', text: "Peran Scrum Master (Fasilitator & Pemecah Masalah) telah ditentukan" },
      { id: '4', text: "Alat kerja kolaborasi (seperti papan Kanban di aplikasi ini) sudah disiapkan" },
      { id: '5', text: "Daftar pekerjaan utama (Product Backlog) telah dibuat dan diprioritaskan" },
      { id: '6', text: "Pekerjaan besar telah dipecah menjadi tugas-tugas kecil yang bisa diselesaikan dalam 1-2 minggu" },
      { id: '7', text: "Pertemuan Perencanaan (Sprint Planning) pertama telah dilakukan" },
      { id: '8', text: "Tim mulai melakukan rapat sinkronisasi harian (Daily Standup 15 menit)" },
      { id: '9', text: "Review hasil kerja dilakukan di akhir siklus kerja (Sprint Review dengan Klien/Atasan)" },
      { id: '10', text: "Evaluasi cara kerja tim dilakukan untuk perbaikan ke depannya (Sprint Retrospective)" }
    ],
    ui: {
      title: "Daftar Periksa Transformasi",
      subtitle: "Lacak langkah-langkah implementasi kerangka kerja Scrum secara bertahap di dalam tim Anda.",
      progressLabel: "Progres Implementasi",
      stepsCompleted: (done: number, total: number) => `${done} dari ${total} langkah diselesaikan`,
      resetButton: "Ulangi",
      resetTitle: "Reset Checklist",
      resetConfirm: "Apakah Anda yakin ingin mengulang checklist dari awal?",
      completeTitle: "Selamat! Tim Anda Siap Menggunakan Scrum.",
      completeSubtitle: "Kini saatnya berfokus pada konsistensi eksekusi dan peningkatan berkelanjutan."
    }
  },
  en: {
    items: [
      { id: '1', text: "The team understands the basics of Agile and how it differs from Waterfall" },
      { id: '2', text: "The Product Owner role (owner of vision and priorities) has been assigned" },
      { id: '3', text: "The Scrum Master role (facilitator and impediment remover) has been assigned" },
      { id: '4', text: "Collaboration tools (such as the Kanban board in this app) are set up" },
      { id: '5', text: "The main work list (Product Backlog) has been created and prioritized" },
      { id: '6', text: "Large pieces of work have been broken down into small tasks that can be finished in 1-2 weeks" },
      { id: '7', text: "The first Sprint Planning meeting has been held" },
      { id: '8', text: "The team has started daily sync meetings (15-minute Daily Standup)" },
      { id: '9', text: "Work results are reviewed at the end of each work cycle (Sprint Review with the client/manager)" },
      { id: '10', text: "The team reflects on how it works to improve going forward (Sprint Retrospective)" }
    ],
    ui: {
      title: "Transformation Checklist",
      subtitle: "Track your team's step-by-step progress in implementing the Scrum framework.",
      progressLabel: "Implementation Progress",
      stepsCompleted: (done: number, total: number) => `${done} of ${total} steps completed`,
      resetButton: "Start Over",
      resetTitle: "Reset Checklist",
      resetConfirm: "Are you sure you want to restart the checklist from the beginning?",
      completeTitle: "Congratulations! Your Team Is Ready to Use Scrum.",
      completeSubtitle: "Now it's time to focus on consistent execution and continuous improvement."
    }
  }
} as const;

const defaultChecklist = CONTENT.id.items.map((item) => ({ id: item.id, checked: false }));

export function Checklist() {
  const { language } = useLanguage();
  const L = language === 'id' ? CONTENT.id : CONTENT.en;

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('agile_checklist');
    return saved ? JSON.parse(saved) : defaultChecklist;
  });

  useEffect(() => {
    localStorage.setItem('agile_checklist', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(items.map((item: any) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const reset = () => {
    if (confirm(L.ui.resetConfirm)) {
      setItems(defaultChecklist);
    }
  };

  const getItemText = (id: string) => L.items.find((item) => item.id === id)?.text ?? '';

  const completedCount = items.filter((i: any) => i.checked).length;
  const progress = Math.round((completedCount / items.length) * 100);
  const isComplete = progress === 100;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl mb-6 text-brand-orange shadow-sm border border-blue-200">
           <ListTodo size={32} />
        </div>
        <h2 className="text-4xl font-extrabold text-brand-text mb-4 tracking-tight">{L.ui.title}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{L.ui.subtitle}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        <div className="p-8 md:p-10 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-3 text-brand-text">
              <span className="font-bold text-lg">{L.ui.progressLabel}</span>
              <span className={`text-2xl font-black ${isComplete ? 'text-brand-teal' : 'text-brand-orange'}`}>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner border border-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isComplete ? 'bg-brand-teal' : 'bg-brand-orange'}`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-3">
              {L.ui.stepsCompleted(completedCount, items.length)}
            </p>
          </div>

          <button
            onClick={reset}
            className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
            title={L.ui.resetTitle}
          >
            <Trash2 size={16} /> {L.ui.resetButton}
          </button>
        </div>

        {isComplete && (
          <div className="bg-brand-teal border-b border-green-100 p-6 flex items-center justify-center gap-4 text-green-800 animate-in fade-in slide-in-from-top-4">
            <Trophy size={28} className="text-brand-teal" />
            <div>
              <h4 className="font-bold text-lg">{L.ui.completeTitle}</h4>
              <p className="text-sm text-brand-teal/80">{L.ui.completeSubtitle}</p>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100 p-4 md:p-6">
          {items.map((item: any) => (
            <div
              key={item.id}
              className={`p-4 md:p-5 rounded-2xl flex items-start gap-4 hover:bg-brand-blue/50 transition-all cursor-pointer group ${item.checked ? 'bg-brand-bg/50 opacity-70' : ''}`}
              onClick={() => toggleItem(item.id)}
            >
              <button className={`mt-0.5 shrink-0 transition-transform group-hover:scale-110 ${item.checked ? 'text-brand-teal' : 'text-gray-300 group-hover:text-blue-400'}`}>
                {item.checked ? <CheckSquare size={24} /> : <Square size={24} />}
              </button>
              <span className={`text-base md:text-lg font-medium select-none transition-all ${item.checked ? 'text-gray-400 line-through' : 'text-brand-text'}`}>
                {getItemText(item.id)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
