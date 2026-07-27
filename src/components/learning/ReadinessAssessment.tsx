import { useState } from 'react';
import { ClipboardList, ArrowRight, RefreshCw, Activity } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const RESULT_STYLES = {
  waterfall: { color: "from-blue-500 to-indigo-600", bg: "bg-brand-blue", border: "border-blue-200" },
  transition: { color: "from-yellow-400 to-orange-500", bg: "bg-yellow-50", border: "border-yellow-200" },
  hybrid: { color: "from-teal-400 to-emerald-600", bg: "bg-teal-50", border: "border-teal-200" },
  ready: { color: "from-rose-400 to-pink-600", bg: "bg-rose-50", border: "border-rose-200" },
} as const;

type ResultKey = keyof typeof RESULT_STYLES;

const CONTENT = {
  id: {
    ui: {
      heading: "Kuis Kesiapan Agile",
      subtitle: "Ukur seberapa siap organisasi atau tim Anda untuk beralih ke metodologi Agile/Scrum. Jawab pertanyaan berikut dengan jujur.",
      questionLabel: "Pertanyaan",
      resultHeader: "Hasil Analisis Tim Anda",
      retake: "Ulangi Penilaian",
    },
    questions: [
      { id: 1, text: "Bagaimana cara tim Anda mengambil keputusan?", options: [{ text: "Berdasarkan hierarki yang ketat (Top-down)", score: 1 }, { text: "Sebagian besar dari atas, sedikit masukan tim", score: 2 }, { text: "Tim memiliki kebebasan dalam batas tertentu", score: 3 }, { text: "Tim sepenuhnya mandiri dan berkolaborasi (Self-organizing)", score: 4 }] },
      { id: 2, text: "Bagaimana respons tim terhadap perubahan kebutuhan di tengah proyek?", options: [{ text: "Sangat sulit dan mengganggu seluruh jadwal", score: 1 }, { text: "Bisa, tetapi melalui proses persetujuan yang panjang", score: 2 }, { text: "Dapat diterima jika tidak terlalu mengubah tujuan akhir", score: 3 }, { text: "Disambut dengan baik sebagai hal yang wajar", score: 4 }] },
      { id: 3, text: "Seberapa sering tim berkomunikasi dan berkolaborasi?", options: [{ text: "Hanya saat ada masalah atau rapat mingguan", score: 1 }, { text: "Beberapa kali seminggu saat diperlukan", score: 2 }, { text: "Setiap hari namun secara informal", score: 3 }, { text: "Setiap hari dengan tujuan yang terstruktur (Standup)", score: 4 }] },
      { id: 4, text: "Seberapa penting dokumentasi bagi pekerjaan Anda?", options: [{ text: "Segala sesuatu harus didokumentasikan sebelum proyek dimulai", score: 1 }, { text: "Dokumentasi sangat penting namun dapat direvisi", score: 2 }, { text: "Cukup mendokumentasikan poin-poin utama", score: 3 }, { text: "Hasil kerja nyata lebih diutamakan daripada dokumentasi komprehensif", score: 4 }] },
      { id: 5, text: "Bagaimana siklus pengiriman hasil kerja (delivery)?", options: [{ text: "Hanya di akhir proyek (berbulan-bulan/tahunan)", score: 1 }, { text: "Dibagi menjadi 2-3 fase besar", score: 2 }, { text: "Rutin setiap beberapa minggu/bulan", score: 3 }, { text: "Terus-menerus dalam siklus pendek (1-4 minggu)", score: 4 }] },
    ],
    results: {
      waterfall: {
        title: "Tradisional (Waterfall)",
        desc: "Organisasi Anda saat ini sangat cocok dengan metode Waterfall. Kestabilan, dokumentasi yang kuat, dan perencanaan jangka panjang sangat penting bagi Anda. Memaksakan Scrum mungkin akan terlalu radikal saat ini.",
      },
      transition: {
        title: "Tahap Transisi",
        desc: "Organisasi Anda mulai melihat kebutuhan untuk lebih fleksibel. Anda dapat mulai memperkenalkan praktik Agile ringan seperti Kanban untuk transparansi kerja tanpa mengubah struktur organisasi yang ada.",
      },
      hybrid: {
        title: "Hybrid (Perpaduan)",
        desc: "Organisasi Anda berada di titik tengah yang ideal untuk pendekatan Hybrid. Anda dapat merencanakan secara makro dengan Waterfall (oleh manajemen), tetapi mengeksekusi secara iteratif dalam tim operasional menggunakan Scrum/Kanban.",
      },
      ready: {
        title: "Siap untuk Agile/Scrum",
        desc: "Selamat! Budaya organisasi Anda sudah sangat mendukung kolaborasi, fleksibilitas, dan kemandirian tim. Anda siap menerapkan framework Scrum secara penuh.",
      },
    },
  },
  en: {
    ui: {
      heading: "Agile Readiness Quiz",
      subtitle: "Measure how ready your organization or team is to move to an Agile/Scrum methodology. Answer the following questions honestly.",
      questionLabel: "Question",
      resultHeader: "Your Team's Analysis Results",
      retake: "Retake Assessment",
    },
    questions: [
      { id: 1, text: "How does your team make decisions?", options: [{ text: "Through a strict hierarchy (top-down)", score: 1 }, { text: "Mostly from the top, with a little team input", score: 2 }, { text: "The team has freedom within certain limits", score: 3 }, { text: "The team is fully autonomous and collaborative (self-organizing)", score: 4 }] },
      { id: 2, text: "How does your team respond to changing requirements mid-project?", options: [{ text: "With great difficulty — it disrupts the entire schedule", score: 1 }, { text: "It's possible, but only through a lengthy approval process", score: 2 }, { text: "Acceptable, as long as it doesn't drastically change the end goal", score: 3 }, { text: "Welcomed as a natural part of the work", score: 4 }] },
      { id: 3, text: "How often does your team communicate and collaborate?", options: [{ text: "Only when problems come up or at weekly meetings", score: 1 }, { text: "A few times a week, as needed", score: 2 }, { text: "Every day, but informally", score: 3 }, { text: "Every day with a structured purpose (Standup)", score: 4 }] },
      { id: 4, text: "How important is documentation to your work?", options: [{ text: "Everything must be documented before the project starts", score: 1 }, { text: "Documentation is essential, but it can be revised", score: 2 }, { text: "Documenting the key points is enough", score: 3 }, { text: "Working results matter more than comprehensive documentation", score: 4 }] },
      { id: 5, text: "What does your delivery cycle look like?", options: [{ text: "Delivery only at the end of the project (months/years)", score: 1 }, { text: "Split into 2-3 major phases", score: 2 }, { text: "Regularly, every few weeks or months", score: 3 }, { text: "Continuously, in short cycles (1-4 weeks)", score: 4 }] },
    ],
    results: {
      waterfall: {
        title: "Traditional (Waterfall)",
        desc: "Your organization is currently a strong fit for the Waterfall method. Stability, thorough documentation, and long-term planning matter a great deal to you. Forcing Scrum right now would likely be too radical a change.",
      },
      transition: {
        title: "In Transition",
        desc: "Your organization is starting to see the need for more flexibility. You can begin introducing lightweight Agile practices such as Kanban to bring transparency to the work without changing your existing organizational structure.",
      },
      hybrid: {
        title: "Hybrid (Blended)",
        desc: "Your organization sits at the ideal midpoint for a Hybrid approach. You can plan at the macro level with Waterfall (led by management) while operational teams execute iteratively using Scrum/Kanban.",
      },
      ready: {
        title: "Ready for Agile/Scrum",
        desc: "Congratulations! Your organizational culture already strongly supports collaboration, flexibility, and team autonomy. You are ready to adopt the Scrum framework in full.",
      },
    },
  },
} as const;

export function ReadinessAssessment() {
  const { language } = useLanguage();
  const L = language === 'id' ? CONTENT.id : CONTENT.en;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const questions = L.questions;

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateResult = () => {
    const total = answers.reduce((a, b) => a + b, 0);
    const avg = total / questions.length;

    let key: ResultKey;
    if (avg < 1.75) key = 'waterfall';
    else if (avg < 2.5) key = 'transition';
    else if (avg < 3.25) key = 'hybrid';
    else key = 'ready';

    return { ...RESULT_STYLES[key], ...L.results[key] };
  };

  const reset = () => {
    setAnswers([]);
    setCurrentQuestion(0);
    setShowResult(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl mb-6 text-brand-orange shadow-sm border border-blue-200">
           <Activity size={32} />
        </div>
        <h2 className="text-4xl font-extrabold text-brand-text mb-4 tracking-tight">{L.ui.heading}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{L.ui.subtitle}</p>
      </div>

      {!showResult ? (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-2 bg-gray-100 w-full">
            <div className="h-full bg-brand-orange transition-all duration-500 ease-out" style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}></div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex justify-between items-center mb-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <span>{L.ui.questionLabel} {currentQuestion + 1} / {questions.length}</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-brand-text mb-10 leading-tight">{questions[currentQuestion].text}</h3>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.score)}
                  className="w-full text-left p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-orange hover:bg-brand-blue hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-brand-text font-semibold text-lg">{opt.text}</span>
                  <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white text-gray-400 transition-colors shrink-0 shadow-sm">
                    <ArrowRight size={20} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand-blue rounded-full blur-3xl opacity-60"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-60"></div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-brand-orange rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl text-white transform rotate-3 hover:rotate-6 transition-transform">
              <ClipboardList size={40} />
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">{L.ui.resultHeader}</h3>

            {(() => {
              const res = calculateResult();
              return (
                <div className={`p-8 rounded-3xl border ${res.border} ${res.bg} max-w-2xl mx-auto mb-10 shadow-sm`}>
                  <div className={`inline-block px-6 py-2.5 rounded-full font-black text-xl md:text-2xl mb-6 bg-gradient-to-r ${res.color} text-white shadow-lg`}>
                    {res.title}
                  </div>
                  <p className="text-brand-text text-lg leading-relaxed font-medium">{res.desc}</p>
                </div>
              );
            })()}

            <button onClick={reset} className="inline-flex items-center gap-3 px-8 py-4 bg-brand-text hover:bg-black text-white font-extrabold rounded-3xl border-2 border-transparent border-b-4 active:border-b-0 active:translate-y-2 transition-all">
              <RefreshCw size={20} /> {L.ui.retake}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
