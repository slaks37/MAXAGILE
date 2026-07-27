import { useState } from 'react';
import { Compass, ArrowRight, ArrowLeft, Lightbulb, Workflow } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

type StepOption = { text: string; value: string };
type Step = { title: string; question: string; options: StepOption[] };
type ResultText = { title: string; desc: string; action: string };

type WizardContent = {
  steps: Step[];
  results: {
    kanban: ResultText;
    waterfall: ResultText;
    hybrid: ResultText;
    scrum: ResultText;
  };
  ui: {
    headerTitle: string;
    headerSubtitle: string;
    stage: string;
    back: string;
    resultHeading: string;
    restart: string;
  };
};

const RESULT_STYLES = {
  kanban: { color: "from-emerald-400 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  waterfall: { color: "from-slate-500 to-gray-700", bg: "bg-slate-50", border: "border-slate-200" },
  hybrid: { color: "from-purple-500 to-indigo-600", bg: "bg-purple-50", border: "border-purple-200" },
  scrum: { color: "from-blue-500 to-cyan-600", bg: "bg-brand-blue", border: "border-blue-200" }
} as const;

const CONTENT: Record<'id' | 'en', WizardContent> = {
  id: {
    steps: [
      {
        title: "Kondisi Tim",
        question: "Berapa banyak orang yang biasanya terlibat langsung dalam penyelesaian satu pekerjaan/proyek?",
        options: [
          { text: "1 - 3 orang (Sangat kecil & Lincah)", value: "small" },
          { text: "4 - 9 orang (Ideal untuk sebuah skuad/tim Scrum)", value: "scrum" },
          { text: "10 - 20 orang (Cukup besar, komunikasi mulai kompleks)", value: "large" },
          { text: "Lebih dari 20 orang (Terdistribusi di banyak departemen berbeda)", value: "waterfall" }
        ]
      },
      {
        title: "Karakteristik Pekerjaan",
        question: "Pekerjaan apa yang paling sering ditangani oleh tim Anda secara reguler?",
        options: [
          { text: "Tugas operasional rutin, dukungan pelanggan, tiket harian (IT Support, Admin, CS)", value: "kanban" },
          { text: "Pekerjaan kreatif atau inovasi dengan tujuan yang bisa berubah (Marketing, R&D, Software, Desain)", value: "scrum" },
          { text: "Proyek dengan spesifikasi 100% tetap, regulasi ketat, dan anggaran kaku (Konstruksi, Event Skala Besar, Pemerintahan)", value: "waterfall" },
          { text: "Campuran antara proyek-proyek besar yang kaku dan operasional harian yang cepat berubah", value: "hybrid" }
        ]
      },
      {
        title: "Hambatan Utama",
        question: "Apa tantangan (pain point) terbesar yang sering tim Anda hadapi?",
        options: [
          { text: "Sering ada perubahan permintaan mendadak dari atasan atau klien saat pekerjaan sedang berjalan", value: "scrum" },
          { text: "Terlalu banyak pekerjaan yang masuk (bottleneck), susah melacak mana yang sudah selesai dan mana yang nyangkut", value: "kanban" },
          { text: "Kualitas hasil akhir tidak sesuai harapan klien karena jarang dikoordinasikan selama proses pembuatan", value: "scrum" },
          { text: "Sering molor jadwalnya karena menunggu persetujuan (approval) birokrasi berjenjang yang lambat", value: "hybrid" }
        ]
      }
    ],
    results: {
      kanban: {
        title: "Kanban (Visual Flow)",
        desc: "Metode Kanban sangat cocok untuk Anda! Karena pekerjaan Anda cenderung mengalir terus-menerus (seperti tiket dukungan atau administrasi rutin), memvisualisasikan seluruh pekerjaan di Papan Kanban dan membatasi pekerjaan yang sedang berlangsung (WIP - Work in Progress) akan langsung menyelesaikan masalah bottleneck Anda tanpa rapat yang terlalu banyak.",
        action: "Pelajari Papan Kanban"
      },
      waterfall: {
        title: "Pendekatan Tradisional (Waterfall)",
        desc: "Berdasarkan struktur dan jenis pekerjaan Anda (seperti proyek konstruksi atau skala besar dengan regulasi ketat), Waterfall masih merupakan pendekatan paling aman dan terstruktur. Anda bisa meningkatkan efisiensi dengan komunikasi yang lebih proaktif, tanpa harus memaksakan framework Agile yang bisa merusak kestabilan organisasi Anda.",
        action: "Optimalisasi Tradisional"
      },
      hybrid: {
        title: "Pendekatan Hybrid (Agile + Tradisional)",
        desc: "Anda menghadapi situasi yang kompleks di mana eksekutif butuh kepastian, tapi tim butuh kelincahan. Gunakan Waterfall untuk perencanaan strategis tingkat atas (persetujuan anggaran, manajemen risiko tahunan), tetapi izinkan tim eksekutor menggunakan Scrum atau Kanban secara internal untuk mengeksekusi pekerjaan sehari-hari.",
        action: "Lihat Panduan Hybrid"
      },
      scrum: {
        title: "Scrum Framework",
        desc: "Scrum adalah solusi ideal! Tim Anda memiliki ukuran yang pas (kecil-menengah) dan membutuhkan cara sistematis untuk beradaptasi terhadap perubahan permintaan klien dengan cepat. Mulailah dengan bekerja dalam siklus pendek (Sprint 2 minggu) dan adakan sinkronisasi singkat (Daily Standup) setiap pagi selama 15 menit.",
        action: "Mulai Transformasi Scrum"
      }
    },
    ui: {
      headerTitle: "Wizard Rekomendasi Kerja",
      headerSubtitle: "Temukan metode kerja yang paling cocok dan natural untuk tim Anda berdasarkan kondisi nyata lapangan, tanpa memaksakan satu metodologi tertentu.",
      stage: "Tahap",
      back: "Kembali ke pertanyaan sebelumnya",
      resultHeading: "Analisis Kecocokan Metodologi Selesai",
      restart: "Analisis Ulang Tim Lain"
    }
  },
  en: {
    steps: [
      {
        title: "Team Profile",
        question: "How many people are usually directly involved in completing a single piece of work or project?",
        options: [
          { text: "1 - 3 people (Very small and nimble)", value: "small" },
          { text: "4 - 9 people (Ideal for a squad / Scrum team)", value: "scrum" },
          { text: "10 - 20 people (Fairly large; communication starts getting complex)", value: "large" },
          { text: "More than 20 people (Spread across many different departments)", value: "waterfall" }
        ]
      },
      {
        title: "Nature of the Work",
        question: "What kind of work does your team handle most often on a regular basis?",
        options: [
          { text: "Routine operational tasks, customer support, daily tickets (IT Support, Admin, Customer Service)", value: "kanban" },
          { text: "Creative or innovative work with goals that can shift (Marketing, R&D, Software, Design)", value: "scrum" },
          { text: "Projects with 100% fixed specifications, strict regulations, and rigid budgets (Construction, Large-Scale Events, Government)", value: "waterfall" },
          { text: "A mix of rigid large-scale projects and fast-changing day-to-day operations", value: "hybrid" }
        ]
      },
      {
        title: "Biggest Obstacles",
        question: "What is the biggest pain point your team keeps running into?",
        options: [
          { text: "Sudden requirement changes from management or clients while work is already underway", value: "scrum" },
          { text: "Too much incoming work (bottlenecks); it's hard to track what's done and what's stuck", value: "kanban" },
          { text: "Final deliverables miss client expectations because there's little coordination during the process", value: "scrum" },
          { text: "Schedules keep slipping while waiting on slow, multi-layered bureaucratic approvals", value: "hybrid" }
        ]
      }
    ],
    results: {
      kanban: {
        title: "Kanban (Visual Flow)",
        desc: "Kanban is a great fit for you! Since your work tends to flow in continuously (like support tickets or routine admin tasks), visualizing everything on a Kanban board and limiting work in progress (WIP) will solve your bottleneck problem right away — without adding a pile of extra meetings.",
        action: "Learn the Kanban Board"
      },
      waterfall: {
        title: "Traditional Approach (Waterfall)",
        desc: "Given your structure and the type of work you do (such as construction or large-scale projects under strict regulations), Waterfall is still the safest and most structured approach. You can boost efficiency through more proactive communication, without forcing an Agile framework that could destabilize your organization.",
        action: "Optimize the Traditional Way"
      },
      hybrid: {
        title: "Hybrid Approach (Agile + Traditional)",
        desc: "You're facing a complex situation where executives need certainty but teams need agility. Use Waterfall for top-level strategic planning (budget approvals, annual risk management), while letting delivery teams run Scrum or Kanban internally to execute their day-to-day work.",
        action: "See the Hybrid Guide"
      },
      scrum: {
        title: "Scrum Framework",
        desc: "Scrum is the ideal solution! Your team is just the right size (small to medium) and needs a systematic way to adapt quickly to changing client demands. Start by working in short cycles (2-week Sprints) and hold a brief 15-minute sync (Daily Standup) every morning.",
        action: "Start Your Scrum Transformation"
      }
    },
    ui: {
      headerTitle: "Work Method Recommendation Wizard",
      headerSubtitle: "Discover the work method that fits your team most naturally, based on real conditions on the ground — without forcing any single methodology.",
      stage: "Step",
      back: "Back to the previous question",
      resultHeading: "Methodology Fit Analysis Complete",
      restart: "Analyze Another Team"
    }
  }
};

export function MigrationWizard() {
  const { language } = useLanguage();
  const L = language === 'id' ? CONTENT.id : CONTENT.en;
  const steps = L.steps;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (val: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = val;
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const getRecommendation = () => {
    const counts = answers.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let highest = "scrum";
    let max = 0;
    (Object.entries(counts) as [string, number][]).forEach(([key, val]) => {
      if (val > max) {
        max = val;
        highest = key;
      }
    });

    if (highest === "kanban") return { ...L.results.kanban, ...RESULT_STYLES.kanban };
    if (highest === "waterfall" || highest === "large") return { ...L.results.waterfall, ...RESULT_STYLES.waterfall };
    if (highest === "hybrid") return { ...L.results.hybrid, ...RESULT_STYLES.hybrid };

    return { ...L.results.scrum, ...RESULT_STYLES.scrum };
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl mb-6 text-brand-orange shadow-sm border border-blue-200">
           <Workflow size={32} />
        </div>
        <h2 className="text-4xl font-extrabold text-brand-text mb-4 tracking-tight">{L.ui.headerTitle}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{L.ui.headerSubtitle}</p>
      </div>

      {!showResult ? (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <span className="text-xs font-black uppercase tracking-widest text-blue-200 mb-2 block bg-blue-900/30 w-fit px-3 py-1 rounded-full border border-blue-400/30">{L.ui.stage} {currentStep + 1} / {steps.length}</span>
              <h3 className="text-2xl font-extrabold">{steps[currentStep].title}</h3>
            </div>
            <Compass size={48} className="text-blue-200/50 relative z-10 hidden md:block" />
          </div>

          <div className="p-8 md:p-12">
            <h4 className="text-xl md:text-2xl font-bold text-brand-text mb-8 leading-tight">{steps[currentStep].question}</h4>

            <div className="space-y-4">
              {steps[currentStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.value)}
                  className="w-full text-left p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-orange hover:bg-brand-blue hover:shadow-md transition-all flex items-center justify-between group cursor-pointer bg-white"
                >
                  <span className="text-brand-text font-semibold text-lg">{opt.text}</span>
                  <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white text-gray-400 transition-colors shrink-0 shadow-sm">
                    <ArrowRight size={20} />
                  </div>
                </button>
              ))}
            </div>

            {currentStep > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-text transition-colors px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg w-fit"
                >
                  <ArrowLeft size={18} /> {L.ui.back}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-blue rounded-full blur-3xl opacity-60"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-xl flex items-center justify-center text-white mb-8 border-4 border-white">
              <Lightbulb size={40} className="drop-shadow-sm" />
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">{L.ui.resultHeading}</h3>

            {(() => {
              const res = getRecommendation();
              return (
                <div className={`p-8 md:p-10 rounded-3xl border ${res.border} ${res.bg} max-w-3xl mx-auto mb-10 shadow-inner`}>
                  <h2 className={`text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r ${res.color}`}>
                    {res.title}
                  </h2>
                  <p className="text-brand-text text-lg leading-relaxed font-medium">{res.desc}</p>
                </div>
              );
            })()}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                {getRecommendation().action} <ArrowRight size={20} />
              </button>
              <button
                onClick={() => { setAnswers([]); setCurrentStep(0); setShowResult(false); }}
                className="px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-brand-bg text-gray-700 font-bold rounded-xl transition-all"
              >
                {L.ui.restart}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
