import { useState } from 'react';
import { ChevronDown, Map, Milestone, Footprints } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const CONTENT = {
  id: {
    ui: {
      heading: "Peta Jalan Transformasi",
      subtitle: "Langkah demi langkah terstruktur mengubah budaya dan cara kerja tim Anda dari pola pikir Tradisional (Waterfall) menuju kelincahan Agile (Scrum).",
      stepLabel: "Langkah",
      footer: "Perjalanan Berlanjut Setiap Hari"
    },
    steps: [
      {
        title: "Pahami Kondisi Saat Ini",
        content: "Sebelum mengubah apa pun, identifikasi proses kerja Anda saat ini. Petakan bagaimana sebuah pekerjaan dimulai (dari permintaan) hingga selesai. Kenali titik-titik hambatannya (bottleneck). Siapa saja yang terlibat? Apakah jenis pekerjaan Anda bisa diprediksi atau sering berubah?"
      },
      {
        title: "Kenali Pekerjaan yang Cocok",
        content: "Tidak semua pekerjaan cocok untuk Scrum. Scrum sangat ideal untuk pekerjaan yang memiliki ketidakpastian tinggi, inovasi, dan kebutuhan yang bisa berubah (seperti membuat materi pemasaran baru, merancang kurikulum, atau membuat software). Untuk pekerjaan operasional yang rutin dan berulang (seperti balas email pelanggan, proses klaim asuransi), Kanban jauh lebih baik."
      },
      {
        title: "Buat Product Backlog",
        content: "Product Backlog adalah 'Daftar Keinginan' dari semua hal yang perlu dikerjakan. Berbeda dengan dokumen requirement Waterfall yang kaku, Backlog ini hidup. Siapa pun bisa menambahkan ide, tetapi Product Owner (Penanggung Jawab) yang menentukan urutan prioritasnya dari atas (paling penting) ke bawah."
      },
      {
        title: "Ubah Requirement Menjadi Work Item",
        content: "Di Waterfall, Anda memiliki Dokumen Kebutuhan. Di Scrum, pecah dokumen tersebut menjadi potongan pekerjaan kecil yang bisa diselesaikan dalam hitungan hari. Gunakan format 'Sebagai [pengguna], saya ingin [fitur], sehingga [manfaat]'. Pecah pekerjaan besar (Epic) menjadi tugas-tugas kecil (Work Items)."
      },
      {
        title: "Rencanakan Sprint Pertama",
        content: "Sprint adalah siklus kerja pendek (biasanya 2 minggu). Ambil beberapa item teratas dari Product Backlog, diskusikan dengan tim berapa banyak yang bisa diselesaikan dalam 2 minggu ke depan. Pindahkan item tersebut ke Sprint Backlog. Kuncinya: Jangan serakah, ambil secukupnya."
      },
      {
        title: "Tentukan Peran (Roles)",
        content: "Scrum memiliki 3 peran utama:\n\n1. Product Owner (PO): Memastikan tim mengerjakan hal yang benar (Fokus pada Nilai Bisnis).\n2. Scrum Master (SM): Memastikan tim bekerja dengan cara yang benar (Fokus pada Proses dan menghilangkan hambatan).\n3. Tim Developer: Orang-orang yang mengeksekusi pekerjaan.\n\n*Catatan untuk tim kecil/non-IT: PO bisa dipegang oleh Kepala Divisi, SM oleh Manajer Operasional, dan Tim adalah staf eksekutor."
      },
      {
        title: "Jalankan Daily Standup",
        content: "Setiap hari pada jam yang sama, tim berkumpul selama maksimal 15 menit. Setiap orang menjawab 3 pertanyaan cepat:\n1. Apa yang saya kerjakan kemarin?\n2. Apa yang akan saya kerjakan hari ini?\n3. Apakah ada hambatan?\n\nIni BUKAN laporan ke bos, melainkan sinkronisasi antar anggota tim."
      },
      {
        title: "Sprint Review (Demo)",
        content: "Di akhir siklus 2 minggu, tunjukkan hasil kerja NYATA kepada para pemangku kepentingan (stakeholder) atau klien. Kumpulkan umpan balik mereka. Jangan sekadar presentasi PowerPoint, tunjukkan purwarupa/hasil kerja aktual (misal: draf artikel, desain poster, fitur aplikasi)."
      },
      {
        title: "Retrospective (Evaluasi)",
        content: "Setelah Review, tim berkumpul tanpa orang luar. Tujuannya mengevaluasi CARA KERJA mereka. Apa yang berjalan baik? Apa yang kurang baik? Apa yang harus diperbaiki di Sprint berikutnya? Ini adalah jantung dari peningkatan berkelanjutan (Continuous Improvement)."
      },
      {
        title: "Ulangi & Tingkatkan",
        content: "Agile bukan sekadar proses mekanis, melainkan pola pikir. Ulangi siklus ini dari Sprint Perencanaan hingga Retrospective. Lakukan perbaikan kecil namun terus-menerus. Seiring waktu, tim Anda akan menjadi lebih cepat, lebih adaptif, dan lebih kolaboratif."
      }
    ]
  },
  en: {
    ui: {
      heading: "Transformation Roadmap",
      subtitle: "A structured, step-by-step path to shift your team's culture and way of working from a Traditional (Waterfall) mindset to the agility of Agile (Scrum).",
      stepLabel: "Step",
      footer: "The Journey Continues Every Day"
    },
    steps: [
      {
        title: "Understand Your Current State",
        content: "Before changing anything, take stock of how your team works today. Map how a piece of work travels from start (the initial request) to finish. Identify the bottlenecks. Who is involved? Is your type of work predictable, or does it change frequently?"
      },
      {
        title: "Recognize Which Work Fits",
        content: "Not every kind of work is a good fit for Scrum. Scrum shines for work with high uncertainty, innovation, and needs that can change (such as creating new marketing materials, designing a curriculum, or building software). For routine, repetitive operational work (such as answering customer emails or processing insurance claims), Kanban is a far better fit."
      },
      {
        title: "Create a Product Backlog",
        content: "The Product Backlog is a 'wish list' of everything that needs to get done. Unlike a rigid Waterfall requirements document, the Backlog is a living thing. Anyone can add ideas, but the Product Owner decides the order of priority, from top (most important) to bottom."
      },
      {
        title: "Turn Requirements into Work Items",
        content: "In Waterfall, you have a Requirements Document. In Scrum, break that document down into small chunks of work that can be finished in a matter of days. Use the format 'As a [user], I want [feature], so that [benefit]'. Split large pieces of work (Epics) into small tasks (Work Items)."
      },
      {
        title: "Plan Your First Sprint",
        content: "A Sprint is a short work cycle (usually 2 weeks). Take a few items from the top of the Product Backlog and discuss with the team how much can realistically be completed in the next 2 weeks. Move those items into the Sprint Backlog. The key: don't be greedy — take only as much as you can handle."
      },
      {
        title: "Define the Roles",
        content: "Scrum has 3 main roles:\n\n1. Product Owner (PO): Ensures the team works on the right things (focused on Business Value).\n2. Scrum Master (SM): Ensures the team works the right way (focused on Process and removing obstacles).\n3. Developers: The people who execute the work.\n\n*Note for small/non-IT teams: the PO role can be held by a Division Head, the SM by an Operations Manager, and the Team is the executing staff."
      },
      {
        title: "Run the Daily Standup",
        content: "Every day at the same time, the team gathers for a maximum of 15 minutes. Each person answers 3 quick questions:\n1. What did I work on yesterday?\n2. What will I work on today?\n3. Is anything blocking me?\n\nThis is NOT a status report to the boss — it's a sync between team members."
      },
      {
        title: "Sprint Review (Demo)",
        content: "At the end of the 2-week cycle, show REAL work results to your stakeholders or clients. Collect their feedback. Don't settle for a PowerPoint presentation — show an actual prototype or deliverable (e.g. a draft article, a poster design, an app feature)."
      },
      {
        title: "Retrospective (Evaluation)",
        content: "After the Review, the team meets without any outsiders. The goal is to evaluate HOW they work. What went well? What didn't? What should be improved in the next Sprint? This is the heart of Continuous Improvement."
      },
      {
        title: "Repeat & Improve",
        content: "Agile is not just a mechanical process — it's a mindset. Repeat the cycle from Sprint Planning through the Retrospective. Make small but continuous improvements. Over time, your team will become faster, more adaptive, and more collaborative."
      }
    ]
  }
} as const;

export function TransformationGuide() {
  const [openStep, setOpenStep] = useState<number>(0);
  const { language } = useLanguage();
  const L = language === 'id' ? CONTENT.id : CONTENT.en;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl mb-6 text-brand-orange shadow-sm border border-blue-200">
           <Map size={32} />
        </div>
        <h2 className="text-4xl font-extrabold text-brand-text mb-4 tracking-tight">{L.ui.heading}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{L.ui.subtitle}</p>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="hidden md:block absolute left-12 top-10 bottom-10 w-1 bg-gradient-to-b from-blue-200 via-indigo-200 to-gray-200 rounded-full"></div>

        <div className="space-y-6">
          {L.steps.map((step, index) => {
            const isOpen = openStep === index;

            return (
              <div key={index} className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-8 items-start group">
                {/* Timeline Node */}
                <div className="hidden md:flex flex-col items-center shrink-0 mt-4">
                  <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 shadow-sm ${isOpen ? 'bg-brand-orange border-white shadow-blue-500/30 shadow-lg text-white scale-110' : 'bg-white border-brand-orange/20 text-brand-orange group-hover:border-blue-300'}`}>
                    <span className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">{L.ui.stepLabel}</span>
                    <span className="text-3xl font-black">{index + 1}</span>
                  </div>
                </div>

                {/* Content Card */}
                <div className={`flex-1 w-full bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-blue-200 shadow-xl shadow-blue-900/5 ring-1 ring-blue-100' : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'}`}>
                  <button
                    onClick={() => setOpenStep(isOpen ? -1 : index)}
                    className={`w-full px-6 py-5 md:px-8 md:py-6 flex items-center justify-between transition-colors ${isOpen ? 'bg-gradient-to-r from-blue-50/50 to-transparent' : 'hover:bg-brand-bg'}`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange font-black shrink-0">
                        {index + 1}
                      </div>
                      <h3 className={`font-extrabold text-lg md:text-xl transition-colors ${isOpen ? 'text-brand-orange' : 'text-brand-text group-hover:text-brand-text'}`}>
                        {step.title}
                      </h3>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'bg-brand-orange/10 text-brand-orange rotate-180' : 'bg-brand-bg text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pt-0 md:px-8 md:pb-8">
                        <div className="h-px w-full bg-gradient-to-r from-gray-100 via-gray-200 to-transparent mb-6"></div>
                        <div className="flex gap-4 items-start">
                          <Footprints className="text-blue-300 shrink-0 mt-1 hidden sm:block" size={24} />
                          <p className="text-gray-700 leading-relaxed md:text-lg whitespace-pre-line font-medium">
                            {step.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl shadow-lg font-bold">
           <Milestone size={24} />
           {L.ui.footer}
        </div>
      </div>
    </div>
  );
}
