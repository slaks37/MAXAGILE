import { Fragment, useState } from 'react';
import { ArrowRight, FileText, Layers, ListTodo, RotateCw, CheckCircle2, GitMerge, UserCheck, ShieldCheck, CalendarClock, MessageSquare, Info, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

type MappingItemMeta = {
  id: string;
  icon: any;
  type: 'waterfall' | 'agile';
};

type MappingItemText = {
  title: string;
  subtitle: string;
  explanation: string;
  example: string;
};

type TableRowText = {
  from: string;
  toLines: string[];
  why: string;
};

type MappingContent = {
  items: Record<string, MappingItemText>;
  tableRows: TableRowText[];
  ui: {
    heading: string;
    intro: string;
    traditionalWorld: string;
    agileWorld: string;
    badgeTraditional: string;
    badgeAgile: string;
    exampleLabel: string;
    tableTitle: string;
    colTraditional: string;
    colScrum: string;
    colWhy: string;
  };
};

const mappingItemMeta: Record<string, MappingItemMeta> = {
  brd: { id: 'brd', icon: FileText, type: 'waterfall' },
  fase: { id: 'fase', icon: Layers, type: 'waterfall' },
  wbs: { id: 'wbs', icon: ListTodo, type: 'waterfall' },
  backlog: { id: 'backlog', icon: FileText, type: 'agile' },
  sprint: { id: 'sprint', icon: RotateCw, type: 'agile' },
  sprint_backlog: { id: 'sprint_backlog', icon: CheckCircle2, type: 'agile' }
};

const tableRowIcons = [UserCheck, CalendarClock, ShieldCheck, MessageSquare];

const CONTENT: Record<'id' | 'en', MappingContent> = {
  id: {
    items: {
      brd: {
        title: 'Dokumen Kebutuhan (BRD)',
        subtitle: 'Spesifikasi tebal dan kaku di awal proyek',
        explanation: 'Dokumen lengkap yang ditulis di awal proyek sebelum pekerjaan dimulai, berisi ratusan halaman spesifikasi sistem secara detail yang tidak boleh diubah setelah disetujui.',
        example: 'Contoh: Dokumen spesifikasi 200 halaman untuk membuat aplikasi kasir, harus ditandatangani 5 lapis manajemen sebelum programmer boleh mulai menulis kode.'
      },
      fase: {
        title: 'Fase Proyek Panjang',
        subtitle: 'Desain berbulan-bulan, baru Coding',
        explanation: 'Pendekatan berurutan (sekuensial) di mana setiap tahapan pekerjaan harus 100% selesai sebelum tahap berikutnya dimulai (Desain -> Pembuatan -> Pengujian -> Rilis).',
        example: 'Contoh: Tim desain menghabiskan waktu 3 bulan menggambar semua tampilan. Baru setelah selesai, tim programmer bekerja selama 6 bulan penuh tanpa melihat desain lagi.'
      },
      wbs: {
        title: 'Daftar Tugas (WBS)',
        subtitle: 'Diatur secara mikro oleh manajer',
        explanation: 'Struktur Rincian Kerja yang memecah proyek menjadi tugas-tugas kaku, di mana manajer menentukan siapa mengerjakan apa dan kapan secara sepihak.',
        example: 'Contoh: Manajer menugaskan Budi untuk mengerjakan Modul A dari tanggal 1-15, meskipun mungkin Budi butuh waktu lebih cepat atau lebih lambat.'
      },
      backlog: {
        title: 'Product Backlog',
        subtitle: 'Daftar prioritas yang hidup & bisa berubah',
        explanation: 'Daftar dinamis berisi semua fitur, ide, perbaikan yang diinginkan dari produk, diurutkan dari yang paling berharga di atas. Selalu diperbarui sesuai kebutuhan bisnis.',
        example: 'Contoh: Daftar fitur aplikasi kasir (1. Cetak struk, 2. Hitung diskon, 3. Laporan harian). Klien tiba-tiba butuh fitur "Pembayaran QRIS", maka fitur itu disisipkan ke urutan atas tanpa perlu membongkar kontrak lama.'
      },
      sprint: {
        title: 'Siklus Sprint',
        subtitle: 'Siklus pendek 1-4 minggu yang rutin',
        explanation: 'Waktu kerja yang dibatasi (timebox) pendek di mana tim berkomitmen menyelesaikan sejumlah kecil pekerjaan yang menghasilkan bagian produk yang nyata dan berfungsi.',
        example: 'Contoh: Daripada menunggu 9 bulan, dalam 2 minggu pertama tim berhasil membuat fitur "Login dan Tambah Barang" yang sudah bisa dicoba langsung oleh pemilik toko.'
      },
      sprint_backlog: {
        title: 'Sprint Backlog',
        subtitle: 'Komitmen tim untuk siklus saat ini',
        explanation: 'Sebagian kecil pekerjaan dari Product Backlog yang dipilih oleh tim eksekutor untuk diselesaikan secara tuntas dalam satu siklus Sprint.',
        example: 'Contoh: Dari 100 fitur yang diinginkan, tim sepakat untuk mengambil 3 fitur saja minggu ini (Login, Lupa Password, Ubah Profil) karena sadar batas kemampuan mereka.'
      }
    },
    tableRows: [
      {
        from: 'Project Manager',
        toLines: ['Scrum Master &', 'Product Owner'],
        why: 'Peran pimpinan dipecah 2 agar tidak otoriter: PO fokus pada visi produk ("Apa"), sedangkan SM fokus membantu tim bekerja maksimal ("Bagaimana").'
      },
      {
        from: 'Fase Proyek Besar',
        toLines: ['Sprint'],
        why: 'Pekerjaan tidak lagi dikunci berbulan-bulan. Dipotong jadi siklus pendek (Sprint) agar bisnis bisa melihat hasil nyata tiap 2 minggu dan bisa merevisi jika salah arah.'
      },
      {
        from: 'Final Approval (UAT)',
        toLines: ['Sprint Review'],
        why: 'Tidak menunggu akhir tahun untuk demo hasil. Setiap akhir Sprint, tim langsung mendemokan fitur yang sudah jadi ke bos/klien untuk minta feedback cepat.'
      },
      {
        from: 'Rapat Laporan Mingguan',
        toLines: ['Daily Standup'],
        why: 'Bukan laporan atasan-bawahan, melainkan obrolan harian antar tim (maks 15 menit) sambil berdiri: "Kemarin ngapain? Hari ini mau ngapain? Ada hambatan apa?".'
      }
    ],
    ui: {
      heading: 'Pemetaan Kosakata Kerja',
      intro: 'Panduan visual untuk membantu Anda menerjemahkan istilah dan elemen kerja dari metode Tradisional (Waterfall) ke konsep Agile (Scrum).',
      traditionalWorld: 'Dunia Tradisional',
      agileWorld: 'Dunia Agile',
      badgeTraditional: 'Tradisional',
      badgeAgile: 'Scrum / Agile',
      exampleLabel: 'Contoh Kasus:',
      tableTitle: 'Kamus Translasi Peran & Proses',
      colTraditional: 'Dunia Tradisional',
      colScrum: 'Dunia Scrum',
      colWhy: 'Kenapa Berubah? (Maknanya)'
    }
  },
  en: {
    items: {
      brd: {
        title: 'Requirements Document (BRD)',
        subtitle: 'A thick, rigid specification written up front',
        explanation: 'A comprehensive document written at the very start of the project before any work begins, containing hundreds of pages of detailed system specifications that cannot be changed once approved.',
        example: 'Example: A 200-page specification document for a point-of-sale app that must be signed off by 5 layers of management before programmers are allowed to write a single line of code.'
      },
      fase: {
        title: 'Long Project Phases',
        subtitle: 'Months of design before any coding starts',
        explanation: 'A sequential approach where every phase of work must be 100% complete before the next one begins (Design -> Build -> Test -> Release).',
        example: 'Example: The design team spends 3 months drawing every single screen. Only once they finish does the programming team work for 6 solid months without ever looking at the design again.'
      },
      wbs: {
        title: 'Task List (WBS)',
        subtitle: 'Micromanaged by the project manager',
        explanation: 'A Work Breakdown Structure that splits the project into rigid tasks, with the manager unilaterally deciding who does what and when.',
        example: 'Example: The manager assigns Bob to work on Module A from the 1st to the 15th, even though Bob might actually need more time — or less.'
      },
      backlog: {
        title: 'Product Backlog',
        subtitle: 'A living, ever-changing priority list',
        explanation: 'A dynamic list of every feature, idea, and improvement wanted in the product, ordered with the most valuable items at the top. It is continuously updated as business needs change.',
        example: 'Example: The feature list for a point-of-sale app (1. Print receipts, 2. Calculate discounts, 3. Daily reports). When the client suddenly needs a "QRIS Payment" feature, it simply gets slotted in near the top — no need to tear up the old contract.'
      },
      sprint: {
        title: 'Sprint Cycles',
        subtitle: 'Short, regular 1-4 week cycles',
        explanation: 'A short, fixed window of time (a timebox) in which the team commits to finishing a small batch of work that produces a real, working slice of the product.',
        example: 'Example: Instead of waiting 9 months, within the first 2 weeks the team ships a working "Login and Add Item" feature that the store owner can try out right away.'
      },
      sprint_backlog: {
        title: 'Sprint Backlog',
        subtitle: "The team's commitment for the current cycle",
        explanation: 'A small slice of work from the Product Backlog that the delivery team selects to fully complete within a single Sprint.',
        example: 'Example: Out of 100 requested features, the team agrees to take on just 3 this week (Login, Forgot Password, Edit Profile) because they know the limits of their capacity.'
      }
    },
    tableRows: [
      {
        from: 'Project Manager',
        toLines: ['Scrum Master &', 'Product Owner'],
        why: 'The leadership role is split in two to avoid authoritarianism: the PO focuses on the product vision (the "What"), while the SM focuses on helping the team perform at its best (the "How").'
      },
      {
        from: 'Large Project Phases',
        toLines: ['Sprint'],
        why: 'Work is no longer locked in for months at a time. It is cut into short cycles (Sprints) so the business can see tangible results every 2 weeks and change course if things head the wrong way.'
      },
      {
        from: 'Final Approval (UAT)',
        toLines: ['Sprint Review'],
        why: 'No more waiting until the end of the year for a demo. At the end of every Sprint, the team demos the finished features directly to the boss or client for fast feedback.'
      },
      {
        from: 'Weekly Status Meeting',
        toLines: ['Daily Standup'],
        why: 'Not a boss-to-subordinate report, but a daily team huddle (max 15 minutes) held standing up: "What did you do yesterday? What will you do today? Is anything blocking you?".'
      }
    ],
    ui: {
      heading: 'Work Vocabulary Mapping',
      intro: 'A visual guide to help you translate terms and work artifacts from the traditional (Waterfall) method into Agile (Scrum) concepts.',
      traditionalWorld: 'The Traditional World',
      agileWorld: 'The Agile World',
      badgeTraditional: 'Traditional',
      badgeAgile: 'Scrum / Agile',
      exampleLabel: 'Example Case:',
      tableTitle: 'Role & Process Translation Dictionary',
      colTraditional: 'Traditional World',
      colScrum: 'Scrum World',
      colWhy: 'Why the Change? (What It Means)'
    }
  }
};

export function MappingTool() {
  const { language } = useLanguage();
  const L = language === 'id' ? CONTENT.id : CONTENT.en;
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const renderCard = (id: string) => {
    const meta = mappingItemMeta[id];
    const text = L.items[id];
    const Icon = meta.icon;
    const isActive = activeItem === id;

    return (
      <button
        onClick={() => setActiveItem(isActive ? null : id)}
        className={`w-full text-left p-5 rounded-2xl border-2 border-b-4 flex items-center gap-4 relative z-10 transition-all duration-300 cursor-pointer outline-none ${
          isActive
            ? meta.type === 'waterfall'
              ? 'bg-white border-blue-400 shadow-md ring-2 ring-blue-100 scale-[1.02]'
              : 'bg-white border-blue-400 shadow-lg ring-2 ring-blue-200 scale-[1.02]'
            : meta.type === 'waterfall'
              ? 'bg-brand-bg border-gray-100 hover:bg-white hover:shadow-md hover:border-gray-200 hover:translate-x-2'
              : 'bg-white/60 border-brand-orange/20 hover:bg-white hover:shadow-lg hover:border-blue-200 hover:-translate-x-2'
        }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isActive
            ? 'bg-brand-orange text-white shadow-md'
            : meta.type === 'waterfall'
              ? 'bg-white border border-gray-200 text-gray-500 shadow-sm'
              : 'bg-brand-orange/10 text-brand-orange shadow-inner'
        }`}>
          <Icon size={24} />
        </div>
        <div>
          <div className={`font-bold text-lg transition-colors ${isActive ? 'text-brand-orange' : 'text-brand-text'}`}>
            {text.title}
          </div>
          <div className={`text-sm mt-1 transition-colors ${isActive ? 'text-brand-orange font-medium' : 'text-gray-500'}`}>
            {text.subtitle}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl mb-6 text-brand-orange shadow-sm border border-blue-200">
           <GitMerge size={32} />
        </div>
        <h2 className="text-4xl font-extrabold text-brand-text mb-4 tracking-tight">{L.ui.heading}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{L.ui.intro}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 mb-16 items-center">
        {/* Waterfall Side */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg shadow-gray-200/50 relative overflow-hidden group hover:border-gray-300 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-bg rounded-full -translate-y-16 translate-x-16"></div>

          <h3 className="text-xl font-black text-brand-text mb-8 flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm">
              <Layers size={20} />
            </div>
            {L.ui.traditionalWorld}
          </h3>

          <div className="space-y-6 relative">
            {renderCard('brd')}
            {renderCard('fase')}
            {renderCard('wbs')}
          </div>
        </div>

        {/* Center Arrows */}
        <div className="hidden lg:flex flex-col gap-12 justify-center items-center py-10">
          <ArrowRight size={32} className="text-gray-300" />
          <ArrowRight size={32} className="text-gray-300" />
          <ArrowRight size={32} className="text-gray-300" />
        </div>

        {/* Mobile Arrow */}
        <div className="flex lg:hidden justify-center py-2">
          <ArrowRight size={32} className="text-gray-300 rotate-90" />
        </div>

        {/* Scrum Side */}
        <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200 shadow-xl shadow-blue-900/5 relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/10 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>

          <h3 className="text-xl font-black text-brand-text mb-8 flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center text-white shadow-md shadow-blue-200">
              <RotateCw size={20} />
            </div>
            {L.ui.agileWorld}
          </h3>

          <div className="space-y-6 relative">
            {renderCard('backlog')}
            {renderCard('sprint')}
            {renderCard('sprint_backlog')}
          </div>
        </div>
      </div>

      {/* Animated Explanation Box */}
      <div
        className={`mb-16 transition-all duration-500 ease-in-out origin-top overflow-hidden ${
          activeItem ? 'opacity-100 max-h-[500px] transform scale-y-100' : 'opacity-0 max-h-0 transform scale-y-0'
        }`}
      >
        {activeItem && (
          <div className="bg-gray-900 rounded-3xl p-8 relative shadow-2xl overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 rounded-full p-2"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center shrink-0 shadow-lg text-white">
                <Info size={32} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${
                    mappingItemMeta[activeItem].type === 'waterfall'
                      ? 'bg-gray-800 text-gray-300 border border-gray-700'
                      : 'bg-blue-900 text-blue-300 border border-blue-800'
                  }`}>
                    {mappingItemMeta[activeItem].type === 'waterfall' ? L.ui.badgeTraditional : L.ui.badgeAgile}
                  </span>
                  <h3 className="text-2xl font-bold">{L.items[activeItem].title}</h3>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {L.items[activeItem].explanation}
                </p>

                <div className="bg-gray-800/80 rounded-2xl p-5 border border-gray-700">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{L.ui.exampleLabel}</h4>
                  <p className="text-white italic">{L.items[activeItem].example}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Comparison */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 px-8 py-5 text-white">
          <h3 className="font-bold text-lg">{L.ui.tableTitle}</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-brand-bg border-b border-gray-200">
                <th className="p-6 font-bold text-gray-500 uppercase tracking-wider text-xs">{L.ui.colTraditional}</th>
                <th className="p-6 text-center w-16"></th>
                <th className="p-6 font-bold text-brand-orange uppercase tracking-wider text-xs">{L.ui.colScrum}</th>
                <th className="p-6 font-bold text-gray-500 uppercase tracking-wider text-xs w-2/5">{L.ui.colWhy}</th>
              </tr>
            </thead>
            <tbody className="text-sm md:text-base divide-y divide-gray-100">
              {L.tableRows.map((row, idx) => {
                const RowIcon = tableRowIcons[idx];
                return (
                  <tr key={idx} className="hover:bg-brand-blue/50 transition-colors group">
                    <td className="p-6 font-semibold text-brand-text flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><RowIcon size={18} /></div>
                      {row.from}
                    </td>
                    <td className="p-6 text-center"><ArrowRight size={20} className="inline text-gray-300 group-hover:text-blue-400 transition-colors" /></td>
                    <td className="p-6 font-black text-brand-orange">
                      {row.toLines.map((line, i) => (
                        <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>
                      ))}
                    </td>
                    <td className="p-6 text-gray-600 leading-relaxed">{row.why}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
