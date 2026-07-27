import type { ReactNode } from 'react';
import { BookA, Layout, Rocket, Users, ArrowRight, ArrowDown, CheckCircle } from 'lucide-react';

export interface BuiltinLesson {
  id: string;
  title: string;
  content: ReactNode;
}

export interface BuiltinCourse {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  lessons: BuiltinLesson[];
}

const coursesId: BuiltinCourse[] = [
  {
    id: 'dasar',
    title: 'Dasar Manajemen Pekerjaan',
    icon: <BookA className="text-white" size={24} />,
    color: 'from-blue-500 to-cyan-400',
    lessons: [
      {
        id: 'l1',
        title: 'Sejarah & Mengapa Kita Butuh Manajemen Pekerjaan?',
        content: (
          <div className="space-y-5">
            <div className="bg-brand-blue p-5 rounded-2xl border border-brand-orange/20 mb-6">
              <h4 className="font-bold text-xl text-brand-text mb-3">Hook Sejarah: Membangun Kemegahan Dunia</h4>
              <p className="text-brand-text leading-relaxed">
                Bayangkan Anda adalah kepala arsitek yang sedang membangun <strong>Piramida Giza</strong> atau <strong>Tembok Besar Tiongkok</strong> pada zaman dahulu. Bagaimana Anda mengatur jutaan blok batu, puluhan ribu pekerja, dan target penyelesaian puluhan tahun tanpa alat komunikasi modern?
              </p>
            </div>

            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg" alt="Piramida" className="w-full h-64 object-cover rounded-2xl shadow-md mb-4 object-center" />

            <h4 className="font-bold text-lg text-brand-text mt-6 mb-2">Titik Rasa Sakit (Pain Points) di Masa Lalu:</h4>
            <p className="text-gray-700 leading-relaxed">Proyek raksasa sering kali berujung pada kekacauan karena komunikasi yang buruk, tidak ada pembagian tugas yang jelas, dan ketiadaan tenggat waktu. Pekerja kebingungan, bahan bangunan terbuang, dan waktu terbuang sia-sia.</p>
            <p className="text-gray-700 leading-relaxed">Dari kekacauan inilah manusia mulai beradaptasi. Mereka menyadari perlunya sebuah <strong>sistem</strong> untuk memecah pekerjaan raksasa menjadi potongan-potongan kecil yang dapat dikelola oleh kelompok-kelompok kecil. Inilah cikal bakal Manajemen Proyek (Project Management).</p>
          </div>
        )
      },
      {
        id: 'l2',
        title: 'Konsep Dasar: Project, Task & Workflow',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg">Untuk memahami berbagai metodologi, kita perlu menyepakati bahasa dan istilah yang sama:</p>
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-white p-5 rounded-xl border-l-4 border-l-blue-500 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg text-brand-text mb-1">Project (Proyek)</h4>
                <p className="text-gray-600">Tujuan besar dengan awal dan akhir yang jelas. Contoh: "Membangun Aplikasi", "Mengadakan Konser Musik".</p>
              </div>
              <div className="bg-white p-5 rounded-xl border-l-4 border-l-green-500 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg text-brand-text mb-1">Task / Work Item (Tugas)</h4>
                <p className="text-gray-600">Bagian terkecil dari proyek yang bisa dikerjakan 1 orang dalam waktu singkat. Contoh: "Mendesain Logo", "Mencetak Tiket".</p>
              </div>
              <div className="bg-white p-5 rounded-xl border-l-4 border-l-purple-500 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg text-brand-text mb-1">Workflow (Alur Kerja)</h4>
                <p className="text-gray-600">Perjalanan sebuah tugas dari belum mulai hingga selesai (To Do &rarr; In Progress &rarr; Done).</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'l3',
        title: 'Berbagai Macam Framework',
        content: (
          <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
            <p>Seiring berjalannya waktu, manusia menciptakan berbagai <strong>Framework</strong> (kerangka kerja) untuk mengelola proyek yang disesuaikan dengan jenis industrinya:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-brand-bg p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-brand-text">Waterfall</h4>
                <p className="text-sm mt-1 text-gray-600">Tradisional, berurutan, sangat cocok untuk industri fisik seperti konstruksi.</p>
              </div>
              <div className="bg-brand-bg p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-brand-text">Agile & Scrum</h4>
                <p className="text-sm mt-1 text-gray-600">Fleksibel, iteratif, diciptakan khusus untuk industri software yang cepat berubah.</p>
              </div>
              <div className="bg-brand-bg p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-brand-text">Kanban</h4>
                <p className="text-sm mt-1 text-gray-600">Sistem visual dari Toyota. Fokus pada aliran kerja berkelanjutan (Continuous Flow).</p>
              </div>
              <div className="bg-brand-bg p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-brand-text">Lean & Six Sigma</h4>
                <p className="text-sm mt-1 text-gray-600">Fokus pada pengurangan pemborosan (waste) dan peningkatkan kualitas data-driven.</p>
              </div>
            </div>
            <p className="mt-6 font-medium text-brand-orange">Pilih materi berikutnya untuk membedah framework di atas satu per satu secara mendalam.</p>
          </div>
        )
      },
    ]
  },
  {
    id: 'waterfall',
    title: 'Metode Tradisional (Waterfall)',
    icon: <Layout className="text-white" size={24} />,
    color: 'from-purple-500 to-indigo-400',
    lessons: [
      {
        id: 'w1',
        title: 'Apa itu Waterfall?',
        content: (
          <div className="space-y-5">
            <p className="text-gray-700 text-lg leading-relaxed">Waterfall adalah metode manajemen tradisional di mana sebuah proyek mengalir ke bawah seperti air terjun (waterfall). Setiap fase <strong>harus diselesaikan dan dikunci</strong> sebelum fase berikutnya dapat dimulai.</p>
            <div className="bg-brand-bg p-8 rounded-2xl border border-gray-200 mt-6 relative shadow-inner">
              <div className="flex flex-col items-center">
                <div className="bg-indigo-100 text-indigo-800 font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 shadow-sm z-10 border border-indigo-200 text-center">1. Requirements (Analisis Kebutuhan)</div>
                <div className="h-6 w-1.5 bg-indigo-300"></div>
                <ArrowDown className="text-indigo-300 -mt-2 z-0" size={28} />

                <div className="bg-indigo-200 text-indigo-900 font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 ml-0 md:ml-8 shadow-sm z-10 border border-indigo-300 mt-2 text-center">2. Design (Perancangan Sistem)</div>
                <div className="h-6 w-1.5 bg-indigo-400 ml-0 md:ml-8"></div>
                <ArrowDown className="text-indigo-400 -mt-2 ml-0 md:ml-8 z-0" size={28} />

                <div className="bg-indigo-300 text-indigo-900 font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 ml-0 md:ml-16 shadow-sm z-10 border border-indigo-400 mt-2 text-center">3. Implementation (Pengerjaan/Ekeskusi)</div>
                <div className="h-6 w-1.5 bg-indigo-500 ml-0 md:ml-16"></div>
                <ArrowDown className="text-indigo-500 -mt-2 ml-0 md:ml-16 z-0" size={28} />

                <div className="bg-indigo-400 text-white font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 ml-0 md:ml-24 shadow-sm z-10 border border-indigo-500 mt-2 text-center">4. Verification (Pengujian Kualitas)</div>
                <div className="h-6 w-1.5 bg-indigo-600 ml-0 md:ml-24"></div>
                <ArrowDown className="text-indigo-600 -mt-2 ml-0 md:ml-24 z-0" size={28} />

                <div className="bg-indigo-500 text-white font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 ml-0 md:ml-32 shadow-sm z-10 border border-indigo-600 mt-2 text-center">5. Maintenance (Pemeliharaan)</div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'w2',
        title: 'Kelebihan, Kekurangan & Penggunaan',
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-brand-teal p-6 rounded-2xl border border-green-200">
                <h4 className="font-bold text-xl text-green-800 mb-3 flex items-center gap-2"><CheckCircle size={20}/> Kelebihan</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
                  <li>Sangat terstruktur dan mudah dimengerti oleh semua orang.</li>
                  <li>Jadwal dan anggaran dikunci di awal, sehingga mudah dihitung dan diajukan.</li>
                  <li>Dokumentasi sangat lengkap, pergantian anggota tim tidak menjadi masalah besar.</li>
                </ul>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
                <h4 className="font-bold text-xl text-red-800 mb-3 flex items-center gap-2"><ArrowDown size={20} className="rotate-[-45deg]"/> Kekurangan</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
                  <li>Sangat kaku. Jika di tahap Pengujian ada desain yang salah, harus mengulang jauh ke belakang dengan biaya besar.</li>
                  <li>Klien baru melihat hasil akhir di bulan-bulan terakhir.</li>
                  <li>Jika dunia berubah saat proyek berjalan, proyek bisa usang (outdated) saat rilis.</li>
                </ul>
              </div>
            </div>
            <div className="bg-brand-blue p-5 rounded-xl border border-brand-orange/30">
              <h4 className="font-bold text-brand-text mb-2">Kapan Cocok Digunakan?</h4>
              <p className="text-brand-text text-sm md:text-base">Contoh ideal: <strong>Pembangunan jembatan atau gedung pencakar langit.</strong> Anda tidak mungkin membangun jembatan dengan konsep "coba-coba" (Agile) atau mengubah letak pondasi pilar saat jembatan sudah setengah jadi. Anda butuh spesifikasi 100% yang disetujui di awal proyek.</p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'agile',
    title: 'Agile & Scrum Framework',
    icon: <Rocket className="text-white" size={24} />,
    color: 'from-pink-500 to-rose-400',
    lessons: [
      {
        id: 'a1',
        title: 'Pola Pikir Agile',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">Di tahun 2001, para ahli pembuat software menyadari bahwa Waterfall terlalu kaku untuk industri teknologi yang cepat berubah. Mereka berkumpul dan menciptakan <strong>Agile Manifesto</strong>.</p>
            <div className="bg-pink-50 p-8 rounded-2xl border border-pink-200 flex flex-col items-center text-center shadow-sm">
              <h4 className="font-bold text-2xl text-pink-900 mb-6">Iterasi & Adaptasi (Visualisasi Agile)</h4>
              <div className="flex items-center gap-3 flex-wrap justify-center bg-white p-6 rounded-xl shadow-sm border border-pink-100">
                <div className="px-5 py-3 bg-pink-100 rounded-full text-pink-700 font-bold shadow-sm">Rencana Pendek</div>
                <ArrowRight className="text-pink-400" size={24} />
                <div className="px-5 py-3 bg-pink-200 rounded-full text-pink-800 font-bold shadow-sm">Bangun Fitur</div>
                <ArrowRight className="text-pink-400" size={24} />
                <div className="px-5 py-3 bg-pink-300 rounded-full text-pink-900 font-bold shadow-sm">Rilis & Tes</div>
                <ArrowRight className="text-pink-400" size={24} />
                <div className="px-5 py-3 bg-pink-500 rounded-full text-white font-bold shadow-sm">Umpan Balik Klien</div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-pink-700 font-semibold bg-pink-100/50 px-4 py-2 rounded-lg">
                <Rocket size={18} /> Siklus ini diputar berulang-ulang, bukan berjalan satu garis lurus.
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">Penting untuk diingat: Agile bukanlah sebuah tahapan teknis, melainkan <strong>pola pikir (Mindset)</strong> bahwa perubahan di tengah jalan itu baik, dan kolaborasi manusia jauh lebih penting daripada kontrak tertulis yang kaku.</p>
          </div>
        )
      },
      {
        id: 'a2',
        title: 'Mengenal Scrum & Gambaran Visual',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">Scrum adalah salah satu cara (Framework) untuk mempraktikkan Agile. Scrum membagi pekerjaan raksasa menjadi siklus kerja 1-4 minggu yang disebut <strong>Sprint</strong>.</p>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
              <h4 className="font-bold text-2xl text-brand-text text-center mb-10">Siklus Kerja Scrum</h4>

              <div className="overflow-x-auto pb-4 w-full">
                <div className="flex flex-row items-center justify-between gap-6 min-w-[700px]">
                  {/* Product Backlog */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-32 bg-brand-bg rounded-lg border-2 border-gray-300 flex flex-col justify-end p-1.5 gap-1.5 shadow-inner">
                      <div className="h-4 w-full bg-brand-blue0 rounded-md"></div>
                      <div className="h-4 w-full bg-brand-teal rounded-md"></div>
                      <div className="h-4 w-full bg-yellow-500 rounded-md"></div>
                      <div className="h-4 w-full bg-red-500 rounded-md"></div>
                      <div className="h-4 w-full bg-purple-500 rounded-md"></div>
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Product<br/>Backlog</span>
                  </div>

                  <ArrowRight className="text-gray-400" size={32} />

                  {/* Sprint Planning */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-brand-blue rounded-full border-4 border-brand-orange/30 flex items-center justify-center shadow-sm">
                      <Users size={32} className="text-brand-orange" />
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Sprint<br/>Planning</span>
                  </div>

                  <ArrowRight className="text-gray-400" size={32} />

                  {/* Sprint Backlog */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-28 bg-brand-blue/50 rounded-lg border-2 border-blue-400 flex flex-col justify-start p-1.5 gap-1.5 shadow-md">
                      <div className="h-4 w-full bg-brand-blue0 rounded-md"></div>
                      <div className="h-4 w-full bg-brand-teal rounded-md"></div>
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Sprint<br/>Backlog</span>
                  </div>

                  <ArrowRight className="text-gray-400" size={32} />

                  {/* Sprint Execution */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28">
                      <div className="absolute inset-0 rounded-full border-4 border-dashed border-rose-500 animate-[spin_10s_linear_infinite]"></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-rose-600">Sprint</span>
                        <span className="text-xs font-bold text-gray-600 mt-1">1-4 Mgg</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Eksekusi &<br/>Daily Standup</span>
                  </div>

                  <ArrowRight className="text-gray-400" size={32} />

                  {/* Potentially Shippable Product */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-brand-teal rounded-2xl border-4 border-green-500 flex flex-col items-center justify-center shadow-lg shadow-green-100">
                      <CheckCircle size={36} className="text-brand-teal mb-1" />
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Increment<br/>(Hasil Jadi)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-brand-text text-lg mb-3">Terdapat 4 rapat utama (Events) di Scrum:</h4>
              <ul className="space-y-3 text-gray-700">
                <li><strong className="text-brand-orange">1. Sprint Planning:</strong> Rencana awal sebelum Sprint dimulai.</li>
                <li><strong className="text-brand-orange">2. Daily Standup:</strong> Sinkronisasi harian tim (Maksimal 15 menit setiap pagi).</li>
                <li><strong className="text-brand-orange">3. Sprint Review:</strong> Pamer hasil fitur/pekerjaan (Demo) ke klien di akhir Sprint.</li>
                <li><strong className="text-brand-orange">4. Sprint Retrospective:</strong> Evaluasi kinerja dan emosional internal tim untuk perbaikan Sprint berikutnya.</li>
              </ul>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'kanban',
    title: 'Kanban & Pendekatan Hybrid',
    icon: <Users className="text-white" size={24} />,
    color: 'from-emerald-500 to-teal-400',
    lessons: [
      {
        id: 'k1',
        title: 'Apa itu Kanban? (Bentuk Visual)',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">Kanban berasal dari bahasa Jepang yang berarti "Papan Visual". Metode ini diciptakan oleh Toyota untuk mengatur aliran produksi perakitan mobil agar efisien dan tidak ada barang yang menumpuk di gudang.</p>

            <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl mt-6 mb-6 border border-gray-700">
              <h4 className="text-white font-bold text-xl text-center mb-6 flex items-center justify-center gap-2">
                <Layout size={24} className="text-emerald-400"/> Papan Kanban Digital
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* To Do */}
                <div className="bg-[#0f172a] rounded-xl p-4 min-h-[200px] border border-gray-700">
                  <div className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider text-center">To Do</div>
                  <div className="bg-white/95 p-4 rounded-lg shadow-sm border-l-4 border-l-yellow-400 mb-3 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="flex gap-1 mb-2">
                      <div className="h-1.5 w-8 bg-yellow-400 rounded-full"></div>
                      <div className="h-1.5 w-4 bg-purple-400 rounded-full"></div>
                    </div>
                    <div className="text-sm text-brand-text font-bold mb-1">Riset Pasar Q3</div>
                    <div className="text-xs text-gray-500">Menganalisis tren kompetitor</div>
                  </div>
                  <div className="bg-white/95 p-4 rounded-lg shadow-sm border-l-4 border-l-blue-500 mb-3 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="flex gap-1 mb-2">
                      <div className="h-1.5 w-6 bg-brand-blue0 rounded-full"></div>
                    </div>
                    <div className="text-sm text-brand-text font-bold mb-1">Desain Brosur Acara</div>
                  </div>
                </div>

                {/* Doing */}
                <div className="bg-[#0f172a] rounded-xl p-4 min-h-[200px] relative border border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <div className="text-blue-400 text-sm font-bold mb-4 uppercase tracking-wider flex justify-between items-center px-1">
                    <span>Doing / In Progress</span>
                    <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30" title="WIP Limit (Batas Kerja Maksimal)">WIP: 2 (Limit)</span>
                  </div>
                  <div className="bg-white/95 p-4 rounded-lg shadow-lg border-l-4 border-l-rose-500 mb-3 rotate-1 transform-gpu cursor-pointer">
                    <div className="flex gap-1 mb-2">
                      <div className="h-1.5 w-10 bg-rose-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-brand-text font-bold mb-1">Meeting Klien VIP</div>
                    <div className="text-xs text-gray-500 flex items-center justify-between mt-2">
                      <span>Studi Kasus</span>
                      <img src="https://ui-avatars.com/api/?name=St&background=0D8ABC&color=fff&size=20" className="rounded-full" alt="Avatar"/>
                    </div>
                  </div>
                </div>

                {/* Done */}
                <div className="bg-[#0f172a] rounded-xl p-4 min-h-[200px] border border-gray-700 opacity-90">
                  <div className="text-emerald-400 text-sm font-bold mb-4 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                    Done <CheckCircle size={16}/>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm border-l-4 border-l-emerald-500 mb-3 opacity-60">
                    <div className="text-sm text-gray-600 font-bold line-through mb-1">Kirim Invoice Bulanan</div>
                    <div className="text-xs text-emerald-600 font-medium mt-2">Selesai 2 jam yang lalu</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h4 className="font-bold text-yellow-900 text-lg mb-2">Aturan Emas Kanban:</h4>
              <p className="text-yellow-800 leading-relaxed">
                Batasi <strong>Work-In-Progress (WIP)</strong>. Jika kolom "Doing" dibatasi maksimal 2 kartu, tim Anda tidak boleh mengambil tugas baru dari "To Do" sampai ada tugas di "Doing" yang selesai dan digeser ke "Done". Ini mencegah penumpukan pekerjaan (bottleneck) dan kelelahan (burnout)!
              </p>
            </div>
          </div>
        )
      },
      {
        id: 'k1-5',
        title: 'Perbedaan Utama: Scrum vs Kanban',
        content: (
          <div className="space-y-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              Walaupun sama-sama berada di bawah payung <strong>Agile</strong>, Scrum dan Kanban memiliki pendekatan eksekusi yang sangat berbeda.
            </p>

            {/* Table Comparison 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200 bg-brand-orange/5">
                  <div className="flex items-center gap-3 mb-6 justify-center bg-brand-orange text-white py-3 rounded-lg shadow-sm">
                    <Rocket size={24} />
                    <h4 className="font-bold text-xl uppercase tracking-wider">Scrum</h4>
                  </div>
                  <ul className="space-y-4 text-brand-text">
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">1</div> <span className="mt-1"><strong>Fixed time-boxes:</strong> Bekerja dalam kotak waktu yang tetap (Sprint).</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">2</div> <span className="mt-1"><strong>Tasks are Estimated:</strong> Setiap tugas wajib diestimasi poin atau waktunya.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">3</div> <span className="mt-1"><strong>Track velocity:</strong> Mengukur kecepatan tim dalam menyelesaikan tugas per Sprint.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">4</div> <span className="mt-1"><strong>Scrum Master:</strong> Memiliki peran khusus (Scrum Master, Product Owner).</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">5</div> <span className="mt-1"><strong>Cross-functional teams:</strong> Diwajibkan memiliki tim lintas fungsi.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">6</div> <span className="mt-1"><strong>Terkunci:</strong> Tidak bisa menambah tugas saat Sprint sedang berjalan.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">7</div> <span className="mt-1"><strong>Reset:</strong> Papan Scrum direset setiap kali Sprint baru dimulai.</span></li>
                  </ul>
                </div>

                <div className="w-full md:w-1/2 p-6 bg-brand-teal/5">
                  <div className="flex items-center gap-3 mb-6 justify-center bg-brand-teal text-white py-3 rounded-lg shadow-sm">
                    <Layout size={24} />
                    <h4 className="font-bold text-xl uppercase tracking-wider">Kanban</h4>
                  </div>
                  <ul className="space-y-4 text-brand-text">
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">1</div> <span className="mt-1"><strong>No time-boxes:</strong> Aliran pekerjaan terus-menerus tanpa batas waktu.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">2</div> <span className="mt-1"><strong>No Tasks Estimates:</strong> Estimasi tugas opsional, tidak diwajibkan.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">3</div> <span className="mt-1"><strong>Track flow:</strong> Mengukur siklus waktu (Cycle time) dan membatasi antrean (WIP).</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">4</div> <span className="mt-1"><strong>Tanpa Peran Khusus:</strong> Seluruh tim memiliki prosesnya secara bersama-sama.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">5</div> <span className="mt-1"><strong>Specialist teams allowed:</strong> Tim dengan keahlian spesifik diperbolehkan.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">6</div> <span className="mt-1"><strong>Sangat Fleksibel:</strong> Dapat menambah tugas kapan saja selama kapasitas tersedia.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">7</div> <span className="mt-1"><strong>Persistent:</strong> Papan Kanban persisten dan tidak pernah direset.</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Visualisasi Papan */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-8 mt-6">
              <h4 className="font-bold text-center text-xl text-gray-800 mb-8">Gambaran Visual Eksekusi</h4>
              <div className="flex flex-col lg:flex-row gap-8">

                {/* Visual Kanban */}
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                  <h5 className="font-bold text-brand-teal text-lg mb-2">Kanban Board</h5>
                  <p className="text-sm text-gray-500 text-center mb-6">Tugas bersifat berkelanjutan dan mengalir (continuous) tanpa terikat batasan waktu.</p>

                  <div className="flex gap-2 w-full justify-center">
                    {/* Columns */}
                    <div className="flex flex-col gap-2 w-1/4">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">To Do</div>
                      <div className="h-24 bg-blue-100 rounded border border-blue-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">In Progress</div>
                      <div className="h-24 bg-yellow-100 rounded border border-yellow-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Verify</div>
                      <div className="h-24 bg-orange-100 rounded border border-orange-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Done</div>
                      <div className="h-24 bg-green-100 rounded border border-green-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-brand-teal text-sm font-medium">
                    <ArrowRight size={16} /> Mengalir Terus Menerus
                  </div>
                </div>

                {/* Visual Scrum */}
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                  <h5 className="font-bold text-brand-orange text-lg mb-2">Scrum Board</h5>
                  <p className="text-sm text-gray-500 text-center mb-6">Tujuan utamanya adalah memindahkan SEMUA tugas yang disepakati ke kolom "Done" dalam kurun waktu Sprint.</p>

                  <div className="relative flex gap-2 w-full justify-center">
                    {/* Arch */}
                    <div className="absolute top-2 left-[20%] right-[20%] h-6 border-t-2 border-dashed border-gray-400 rounded-t-full"></div>
                    <ArrowRight size={16} className="absolute top-0 right-[15%] text-gray-500 bg-white" />

                    {/* Columns */}
                    <div className="flex flex-col gap-2 w-1/4 mt-6">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Sprint To Do</div>
                      <div className="h-24 bg-gray-50 rounded border border-gray-200 p-1 flex flex-col gap-1 items-center justify-center text-xs text-gray-400">
                        (Kosong di akhir)
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4 mt-6">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">In Progress</div>
                      <div className="h-24 bg-gray-50 rounded border border-gray-200 p-1 flex flex-col gap-1 items-center justify-center text-xs text-gray-400">
                        (Kosong)
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4 mt-6">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Verify</div>
                      <div className="h-24 bg-gray-50 rounded border border-gray-200 p-1 flex flex-col gap-1 items-center justify-center text-xs text-gray-400">
                        (Kosong)
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4 mt-6">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Done</div>
                      <div className="h-24 bg-green-100 rounded border border-green-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-brand-orange text-sm font-medium">
                    <CheckCircle size={16} /> Target: Selesai Semua di Akhir Sprint
                  </div>
                </div>
              </div>
            </div>

            {/* Karakteristik Tim */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                 <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Kecocokan Tim</h4>
                 <ul className="space-y-3">
                   <li className="flex gap-2">
                     <span className="font-semibold w-24 shrink-0 text-gray-600">Scrum:</span>
                     <span className="text-gray-700">Cocok untuk tim dengan tujuan/objektif yang kompleks, yang membutuhkan komitmen bersama untuk menyelesaikan fitur.</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="font-semibold w-24 shrink-0 text-gray-600">Kanban:</span>
                     <span className="text-gray-700">Cocok untuk tim yang bervariasi, terdistribusi, atau tim dengan banyak pemain yang mengerjakan tugas-tugas terpisah (Support, Maintenance).</span>
                   </li>
                 </ul>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                 <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Ideologi & Asal</h4>
                 <ul className="space-y-3">
                   <li className="flex gap-2">
                     <span className="font-semibold w-24 shrink-0 text-gray-600">Scrum:</span>
                     <span className="text-gray-700">Berasal dari <em>Software Development</em>. Ideologi utamanya adalah memecahkan masalah kompleks sembari memberikan nilai produk (valuable products).</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="font-semibold w-24 shrink-0 text-gray-600">Kanban:</span>
                     <span className="text-gray-700">Berasal dari <em>Lean Manufacturing</em> (Pabrik Toyota). Ideologi utamanya menggunakan visual untuk memperbaiki aliran dan proses kerja.</span>
                   </li>
                 </ul>
              </div>
            </div>

          </div>
        )
      },
      {
        id: 'k2',
        title: 'Pendekatan Hybrid (Jalan Tengah)',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">Bagaimana jika atasan Anda (C-Level/Manajemen) meminta kepastian jadwal kaku seperti Waterfall, sementara tim eksekutor Anda butuh fleksibilitas adaptasi seperti Agile? Jawabannya adalah <strong>Hybrid Framework</strong>.</p>

            <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>

              <div className="w-full md:w-1/2 bg-teal-50 p-6 rounded-xl border border-teal-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-200 text-teal-800 rounded-full flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold text-teal-900 text-xl">Level Manajemen<br/><span className="text-sm text-teal-700 font-medium">Perencanaan Makro</span></h4>
                </div>
                <p className="text-teal-800 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-teal-100">
                  Menggunakan <strong>Waterfall</strong>.<br/>Manajemen merencanakan timeline proyek tahunan, budget, dan target pencapaian Q1-Q4. Mereka membutuhkan kepastian administratif kapan proyek X selesai dan butuh dana berapa.
                </p>
              </div>

              <div className="hidden md:flex flex-col items-center">
                <ArrowRight className="text-teal-400" size={32} />
                <span className="text-xs font-bold text-teal-600 mt-2 uppercase tracking-wider">Diturunkan Ke</span>
              </div>

              <div className="w-full md:w-1/2 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-200 text-indigo-800 rounded-full flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold text-indigo-900 text-xl">Level Operasional<br/><span className="text-sm text-indigo-700 font-medium">Eksekusi Mikro</span></h4>
                </div>
                <p className="text-indigo-800 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                  Menggunakan <strong>Scrum / Kanban</strong>.<br/>Target tahunan dari manajemen dipecah menjadi Sprint mingguan. Tim eksekusi sehari-hari menggunakan papan visual (Kanban) dan sinkronisasi harian (Standup).
                </p>
              </div>
            </div>

            <p className="text-gray-700 italic text-center text-sm">Metode Hybrid ini paling sering diterapkan di institusi pemerintahan, perbankan, dan perusahaan korporat berskala raksasa.</p>
          </div>
        )
      }
    ]
  }
];

const coursesEn: BuiltinCourse[] = [
  {
    id: 'dasar',
    title: 'Work Management Fundamentals',
    icon: <BookA className="text-white" size={24} />,
    color: 'from-blue-500 to-cyan-400',
    lessons: [
      {
        id: 'l1',
        title: 'History & Why Do We Need Work Management?',
        content: (
          <div className="space-y-5">
            <div className="bg-brand-blue p-5 rounded-2xl border border-brand-orange/20 mb-6">
              <h4 className="font-bold text-xl text-brand-text mb-3">A Historical Hook: Building the Wonders of the World</h4>
              <p className="text-brand-text leading-relaxed">
                Imagine you are the chief architect building the <strong>Pyramid of Giza</strong> or the <strong>Great Wall of China</strong> in ancient times. How would you coordinate millions of stone blocks, tens of thousands of workers, and a completion target spanning decades — all without modern communication tools?
              </p>
            </div>

            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg" alt="Pyramid" className="w-full h-64 object-cover rounded-2xl shadow-md mb-4 object-center" />

            <h4 className="font-bold text-lg text-brand-text mt-6 mb-2">Pain Points of the Past:</h4>
            <p className="text-gray-700 leading-relaxed">Massive projects often ended in chaos because of poor communication, no clear division of tasks, and the absence of deadlines. Workers were confused, building materials were wasted, and time slipped away.</p>
            <p className="text-gray-700 leading-relaxed">Out of that chaos, humans began to adapt. They realized the need for a <strong>system</strong> to break giant undertakings into small, manageable pieces that small groups could handle. This was the origin of Project Management.</p>
          </div>
        )
      },
      {
        id: 'l2',
        title: 'Core Concepts: Project, Task & Workflow',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg">To understand the different methodologies, we first need to agree on a shared language and terminology:</p>
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-white p-5 rounded-xl border-l-4 border-l-blue-500 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg text-brand-text mb-1">Project</h4>
                <p className="text-gray-600">A big goal with a clear beginning and end. Examples: "Building an App", "Organizing a Music Concert".</p>
              </div>
              <div className="bg-white p-5 rounded-xl border-l-4 border-l-green-500 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg text-brand-text mb-1">Task / Work Item</h4>
                <p className="text-gray-600">The smallest piece of a project that one person can complete in a short time. Examples: "Designing a Logo", "Printing Tickets".</p>
              </div>
              <div className="bg-white p-5 rounded-xl border-l-4 border-l-purple-500 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg text-brand-text mb-1">Workflow</h4>
                <p className="text-gray-600">The journey of a task from not started to finished (To Do &rarr; In Progress &rarr; Done).</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'l3',
        title: 'The Different Frameworks',
        content: (
          <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
            <p>Over time, people created various <strong>Frameworks</strong> for managing projects, each tailored to a particular type of industry:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-brand-bg p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-brand-text">Waterfall</h4>
                <p className="text-sm mt-1 text-gray-600">Traditional and sequential — a great fit for physical industries such as construction.</p>
              </div>
              <div className="bg-brand-bg p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-brand-text">Agile & Scrum</h4>
                <p className="text-sm mt-1 text-gray-600">Flexible and iterative, created specifically for the fast-changing software industry.</p>
              </div>
              <div className="bg-brand-bg p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-brand-text">Kanban</h4>
                <p className="text-sm mt-1 text-gray-600">A visual system from Toyota. Focused on continuous flow of work.</p>
              </div>
              <div className="bg-brand-bg p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-brand-text">Lean & Six Sigma</h4>
                <p className="text-sm mt-1 text-gray-600">Focused on reducing waste and improving quality through data-driven methods.</p>
              </div>
            </div>
            <p className="mt-6 font-medium text-brand-orange">Pick the next lesson to dissect each of these frameworks one by one in depth.</p>
          </div>
        )
      },
    ]
  },
  {
    id: 'waterfall',
    title: 'The Traditional Method (Waterfall)',
    icon: <Layout className="text-white" size={24} />,
    color: 'from-purple-500 to-indigo-400',
    lessons: [
      {
        id: 'w1',
        title: 'What is Waterfall?',
        content: (
          <div className="space-y-5">
            <p className="text-gray-700 text-lg leading-relaxed">Waterfall is a traditional management method in which a project flows downward like a waterfall. Each phase <strong>must be completed and locked</strong> before the next phase can begin.</p>
            <div className="bg-brand-bg p-8 rounded-2xl border border-gray-200 mt-6 relative shadow-inner">
              <div className="flex flex-col items-center">
                <div className="bg-indigo-100 text-indigo-800 font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 shadow-sm z-10 border border-indigo-200 text-center">1. Requirements (Needs Analysis)</div>
                <div className="h-6 w-1.5 bg-indigo-300"></div>
                <ArrowDown className="text-indigo-300 -mt-2 z-0" size={28} />

                <div className="bg-indigo-200 text-indigo-900 font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 ml-0 md:ml-8 shadow-sm z-10 border border-indigo-300 mt-2 text-center">2. Design (System Design)</div>
                <div className="h-6 w-1.5 bg-indigo-400 ml-0 md:ml-8"></div>
                <ArrowDown className="text-indigo-400 -mt-2 ml-0 md:ml-8 z-0" size={28} />

                <div className="bg-indigo-300 text-indigo-900 font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 ml-0 md:ml-16 shadow-sm z-10 border border-indigo-400 mt-2 text-center">3. Implementation (Build/Execution)</div>
                <div className="h-6 w-1.5 bg-indigo-500 ml-0 md:ml-16"></div>
                <ArrowDown className="text-indigo-500 -mt-2 ml-0 md:ml-16 z-0" size={28} />

                <div className="bg-indigo-400 text-white font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 ml-0 md:ml-24 shadow-sm z-10 border border-indigo-500 mt-2 text-center">4. Verification (Quality Testing)</div>
                <div className="h-6 w-1.5 bg-indigo-600 ml-0 md:ml-24"></div>
                <ArrowDown className="text-indigo-600 -mt-2 ml-0 md:ml-24 z-0" size={28} />

                <div className="bg-indigo-500 text-white font-bold px-6 py-4 rounded-xl w-[90%] md:w-3/4 ml-0 md:ml-32 shadow-sm z-10 border border-indigo-600 mt-2 text-center">5. Maintenance</div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'w2',
        title: 'Strengths, Weaknesses & When to Use It',
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-brand-teal p-6 rounded-2xl border border-green-200">
                <h4 className="font-bold text-xl text-green-800 mb-3 flex items-center gap-2"><CheckCircle size={20}/> Strengths</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
                  <li>Highly structured and easy for everyone to understand.</li>
                  <li>Schedule and budget are locked upfront, making them easy to calculate and propose.</li>
                  <li>Documentation is very thorough, so team member turnover is not a major problem.</li>
                </ul>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
                <h4 className="font-bold text-xl text-red-800 mb-3 flex items-center gap-2"><ArrowDown size={20} className="rotate-[-45deg]"/> Weaknesses</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
                  <li>Very rigid. If a design flaw is found during Testing, you must go far back and redo work at great cost.</li>
                  <li>The client only sees the final result in the last few months.</li>
                  <li>If the world changes while the project is running, the product can already be outdated at release.</li>
                </ul>
              </div>
            </div>
            <div className="bg-brand-blue p-5 rounded-xl border border-brand-orange/30">
              <h4 className="font-bold text-brand-text mb-2">When Is It a Good Fit?</h4>
              <p className="text-brand-text text-sm md:text-base">Ideal example: <strong>Building a bridge or a skyscraper.</strong> You cannot build a bridge with a "trial and error" (Agile) approach or move the pillar foundations once the bridge is half built. You need a 100% approved specification at the very start of the project.</p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'agile',
    title: 'Agile & Scrum Framework',
    icon: <Rocket className="text-white" size={24} />,
    color: 'from-pink-500 to-rose-400',
    lessons: [
      {
        id: 'a1',
        title: 'The Agile Mindset',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">In 2001, software experts realized that Waterfall was too rigid for the fast-changing technology industry. They gathered together and created the <strong>Agile Manifesto</strong>.</p>
            <div className="bg-pink-50 p-8 rounded-2xl border border-pink-200 flex flex-col items-center text-center shadow-sm">
              <h4 className="font-bold text-2xl text-pink-900 mb-6">Iteration & Adaptation (Agile Visualized)</h4>
              <div className="flex items-center gap-3 flex-wrap justify-center bg-white p-6 rounded-xl shadow-sm border border-pink-100">
                <div className="px-5 py-3 bg-pink-100 rounded-full text-pink-700 font-bold shadow-sm">Short Plan</div>
                <ArrowRight className="text-pink-400" size={24} />
                <div className="px-5 py-3 bg-pink-200 rounded-full text-pink-800 font-bold shadow-sm">Build Feature</div>
                <ArrowRight className="text-pink-400" size={24} />
                <div className="px-5 py-3 bg-pink-300 rounded-full text-pink-900 font-bold shadow-sm">Release & Test</div>
                <ArrowRight className="text-pink-400" size={24} />
                <div className="px-5 py-3 bg-pink-500 rounded-full text-white font-bold shadow-sm">Client Feedback</div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-pink-700 font-semibold bg-pink-100/50 px-4 py-2 rounded-lg">
                <Rocket size={18} /> This cycle spins over and over — it does not run in a single straight line.
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">Important to remember: Agile is not a technical stage, but a <strong>mindset</strong> — a belief that change midway is good, and that human collaboration matters far more than a rigid written contract.</p>
          </div>
        )
      },
      {
        id: 'a2',
        title: 'Meet Scrum & A Visual Overview',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">Scrum is one way (a Framework) of practicing Agile. Scrum breaks giant work down into 1-4 week work cycles called <strong>Sprints</strong>.</p>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
              <h4 className="font-bold text-2xl text-brand-text text-center mb-10">The Scrum Work Cycle</h4>

              <div className="overflow-x-auto pb-4 w-full">
                <div className="flex flex-row items-center justify-between gap-6 min-w-[700px]">
                  {/* Product Backlog */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-32 bg-brand-bg rounded-lg border-2 border-gray-300 flex flex-col justify-end p-1.5 gap-1.5 shadow-inner">
                      <div className="h-4 w-full bg-brand-blue0 rounded-md"></div>
                      <div className="h-4 w-full bg-brand-teal rounded-md"></div>
                      <div className="h-4 w-full bg-yellow-500 rounded-md"></div>
                      <div className="h-4 w-full bg-red-500 rounded-md"></div>
                      <div className="h-4 w-full bg-purple-500 rounded-md"></div>
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Product<br/>Backlog</span>
                  </div>

                  <ArrowRight className="text-gray-400" size={32} />

                  {/* Sprint Planning */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-brand-blue rounded-full border-4 border-brand-orange/30 flex items-center justify-center shadow-sm">
                      <Users size={32} className="text-brand-orange" />
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Sprint<br/>Planning</span>
                  </div>

                  <ArrowRight className="text-gray-400" size={32} />

                  {/* Sprint Backlog */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-28 bg-brand-blue/50 rounded-lg border-2 border-blue-400 flex flex-col justify-start p-1.5 gap-1.5 shadow-md">
                      <div className="h-4 w-full bg-brand-blue0 rounded-md"></div>
                      <div className="h-4 w-full bg-brand-teal rounded-md"></div>
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Sprint<br/>Backlog</span>
                  </div>

                  <ArrowRight className="text-gray-400" size={32} />

                  {/* Sprint Execution */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28">
                      <div className="absolute inset-0 rounded-full border-4 border-dashed border-rose-500 animate-[spin_10s_linear_infinite]"></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-rose-600">Sprint</span>
                        <span className="text-xs font-bold text-gray-600 mt-1">1-4 Wks</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Execution &<br/>Daily Standup</span>
                  </div>

                  <ArrowRight className="text-gray-400" size={32} />

                  {/* Potentially Shippable Product */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-brand-teal rounded-2xl border-4 border-green-500 flex flex-col items-center justify-center shadow-lg shadow-green-100">
                      <CheckCircle size={36} className="text-brand-teal mb-1" />
                    </div>
                    <span className="text-sm font-bold mt-3 text-center text-brand-text">Increment<br/>(Finished Output)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-brand-text text-lg mb-3">There are 4 main meetings (Events) in Scrum:</h4>
              <ul className="space-y-3 text-gray-700">
                <li><strong className="text-brand-orange">1. Sprint Planning:</strong> The initial plan before the Sprint starts.</li>
                <li><strong className="text-brand-orange">2. Daily Standup:</strong> Daily team sync (maximum 15 minutes every morning).</li>
                <li><strong className="text-brand-orange">3. Sprint Review:</strong> Showcasing the finished features/work (Demo) to the client at the end of the Sprint.</li>
                <li><strong className="text-brand-orange">4. Sprint Retrospective:</strong> An internal review of team performance and morale to improve the next Sprint.</li>
              </ul>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'kanban',
    title: 'Kanban & The Hybrid Approach',
    icon: <Users className="text-white" size={24} />,
    color: 'from-emerald-500 to-teal-400',
    lessons: [
      {
        id: 'k1',
        title: 'What is Kanban? (A Visual Form)',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">Kanban comes from the Japanese word for "Visual Board". The method was created by Toyota to manage the flow of car-assembly production efficiently, so that no inventory piles up in the warehouse.</p>

            <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl mt-6 mb-6 border border-gray-700">
              <h4 className="text-white font-bold text-xl text-center mb-6 flex items-center justify-center gap-2">
                <Layout size={24} className="text-emerald-400"/> Digital Kanban Board
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* To Do */}
                <div className="bg-[#0f172a] rounded-xl p-4 min-h-[200px] border border-gray-700">
                  <div className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider text-center">To Do</div>
                  <div className="bg-white/95 p-4 rounded-lg shadow-sm border-l-4 border-l-yellow-400 mb-3 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="flex gap-1 mb-2">
                      <div className="h-1.5 w-8 bg-yellow-400 rounded-full"></div>
                      <div className="h-1.5 w-4 bg-purple-400 rounded-full"></div>
                    </div>
                    <div className="text-sm text-brand-text font-bold mb-1">Q3 Market Research</div>
                    <div className="text-xs text-gray-500">Analyzing competitor trends</div>
                  </div>
                  <div className="bg-white/95 p-4 rounded-lg shadow-sm border-l-4 border-l-blue-500 mb-3 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="flex gap-1 mb-2">
                      <div className="h-1.5 w-6 bg-brand-blue0 rounded-full"></div>
                    </div>
                    <div className="text-sm text-brand-text font-bold mb-1">Design Event Brochure</div>
                  </div>
                </div>

                {/* Doing */}
                <div className="bg-[#0f172a] rounded-xl p-4 min-h-[200px] relative border border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <div className="text-blue-400 text-sm font-bold mb-4 uppercase tracking-wider flex justify-between items-center px-1">
                    <span>Doing / In Progress</span>
                    <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30" title="WIP Limit (Maximum Work Limit)">WIP: 2 (Limit)</span>
                  </div>
                  <div className="bg-white/95 p-4 rounded-lg shadow-lg border-l-4 border-l-rose-500 mb-3 rotate-1 transform-gpu cursor-pointer">
                    <div className="flex gap-1 mb-2">
                      <div className="h-1.5 w-10 bg-rose-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-brand-text font-bold mb-1">VIP Client Meeting</div>
                    <div className="text-xs text-gray-500 flex items-center justify-between mt-2">
                      <span>Case Study</span>
                      <img src="https://ui-avatars.com/api/?name=St&background=0D8ABC&color=fff&size=20" className="rounded-full" alt="Avatar"/>
                    </div>
                  </div>
                </div>

                {/* Done */}
                <div className="bg-[#0f172a] rounded-xl p-4 min-h-[200px] border border-gray-700 opacity-90">
                  <div className="text-emerald-400 text-sm font-bold mb-4 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                    Done <CheckCircle size={16}/>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm border-l-4 border-l-emerald-500 mb-3 opacity-60">
                    <div className="text-sm text-gray-600 font-bold line-through mb-1">Send Monthly Invoice</div>
                    <div className="text-xs text-emerald-600 font-medium mt-2">Finished 2 hours ago</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h4 className="font-bold text-yellow-900 text-lg mb-2">The Golden Rule of Kanban:</h4>
              <p className="text-yellow-800 leading-relaxed">
                Limit your <strong>Work-In-Progress (WIP)</strong>. If the "Doing" column is capped at 2 cards, your team must not pull a new task from "To Do" until a task in "Doing" is finished and moved to "Done". This prevents work pile-ups (bottlenecks) and burnout!
              </p>
            </div>
          </div>
        )
      },
      {
        id: 'k1-5',
        title: 'Key Differences: Scrum vs Kanban',
        content: (
          <div className="space-y-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              Although both live under the <strong>Agile</strong> umbrella, Scrum and Kanban take very different approaches to execution.
            </p>

            {/* Table Comparison 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200 bg-brand-orange/5">
                  <div className="flex items-center gap-3 mb-6 justify-center bg-brand-orange text-white py-3 rounded-lg shadow-sm">
                    <Rocket size={24} />
                    <h4 className="font-bold text-xl uppercase tracking-wider">Scrum</h4>
                  </div>
                  <ul className="space-y-4 text-brand-text">
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">1</div> <span className="mt-1"><strong>Fixed time-boxes:</strong> Work happens in fixed time boxes (Sprints).</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">2</div> <span className="mt-1"><strong>Tasks are Estimated:</strong> Every task must be estimated in points or time.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">3</div> <span className="mt-1"><strong>Track velocity:</strong> Measures how fast the team completes tasks per Sprint.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">4</div> <span className="mt-1"><strong>Scrum Master:</strong> Has dedicated roles (Scrum Master, Product Owner).</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">5</div> <span className="mt-1"><strong>Cross-functional teams:</strong> Cross-functional teams are required.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">6</div> <span className="mt-1"><strong>Locked:</strong> New tasks cannot be added while a Sprint is running.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0 font-bold">7</div> <span className="mt-1"><strong>Reset:</strong> The Scrum board is reset every time a new Sprint begins.</span></li>
                  </ul>
                </div>

                <div className="w-full md:w-1/2 p-6 bg-brand-teal/5">
                  <div className="flex items-center gap-3 mb-6 justify-center bg-brand-teal text-white py-3 rounded-lg shadow-sm">
                    <Layout size={24} />
                    <h4 className="font-bold text-xl uppercase tracking-wider">Kanban</h4>
                  </div>
                  <ul className="space-y-4 text-brand-text">
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">1</div> <span className="mt-1"><strong>No time-boxes:</strong> Work flows continuously without time limits.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">2</div> <span className="mt-1"><strong>No Task Estimates:</strong> Task estimation is optional, not required.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">3</div> <span className="mt-1"><strong>Track flow:</strong> Measures cycle time and limits the queue (WIP).</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">4</div> <span className="mt-1"><strong>No Dedicated Roles:</strong> The whole team owns the process together.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">5</div> <span className="mt-1"><strong>Specialist teams allowed:</strong> Teams with specialized skills are welcome.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">6</div> <span className="mt-1"><strong>Highly Flexible:</strong> Tasks can be added at any time as long as capacity allows.</span></li>
                    <li className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 font-bold">7</div> <span className="mt-1"><strong>Persistent:</strong> The Kanban board is persistent and never reset.</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Board visualization */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-8 mt-6">
              <h4 className="font-bold text-center text-xl text-gray-800 mb-8">Execution Visualized</h4>
              <div className="flex flex-col lg:flex-row gap-8">

                {/* Visual Kanban */}
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                  <h5 className="font-bold text-brand-teal text-lg mb-2">Kanban Board</h5>
                  <p className="text-sm text-gray-500 text-center mb-6">Tasks are continuous and keep flowing, unbound by time limits.</p>

                  <div className="flex gap-2 w-full justify-center">
                    {/* Columns */}
                    <div className="flex flex-col gap-2 w-1/4">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">To Do</div>
                      <div className="h-24 bg-blue-100 rounded border border-blue-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">In Progress</div>
                      <div className="h-24 bg-yellow-100 rounded border border-yellow-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Verify</div>
                      <div className="h-24 bg-orange-100 rounded border border-orange-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Done</div>
                      <div className="h-24 bg-green-100 rounded border border-green-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-brand-teal text-sm font-medium">
                    <ArrowRight size={16} /> Flows Continuously
                  </div>
                </div>

                {/* Visual Scrum */}
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                  <h5 className="font-bold text-brand-orange text-lg mb-2">Scrum Board</h5>
                  <p className="text-sm text-gray-500 text-center mb-6">The main goal is to move ALL of the committed tasks to the "Done" column within the Sprint window.</p>

                  <div className="relative flex gap-2 w-full justify-center">
                    {/* Arch */}
                    <div className="absolute top-2 left-[20%] right-[20%] h-6 border-t-2 border-dashed border-gray-400 rounded-t-full"></div>
                    <ArrowRight size={16} className="absolute top-0 right-[15%] text-gray-500 bg-white" />

                    {/* Columns */}
                    <div className="flex flex-col gap-2 w-1/4 mt-6">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Sprint To Do</div>
                      <div className="h-24 bg-gray-50 rounded border border-gray-200 p-1 flex flex-col gap-1 items-center justify-center text-xs text-gray-400">
                        (Empty at the end)
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4 mt-6">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">In Progress</div>
                      <div className="h-24 bg-gray-50 rounded border border-gray-200 p-1 flex flex-col gap-1 items-center justify-center text-xs text-gray-400">
                        (Empty)
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4 mt-6">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Verify</div>
                      <div className="h-24 bg-gray-50 rounded border border-gray-200 p-1 flex flex-col gap-1 items-center justify-center text-xs text-gray-400">
                        (Empty)
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/4 mt-6">
                      <div className="text-xs font-bold text-gray-400 text-center uppercase">Done</div>
                      <div className="h-24 bg-green-100 rounded border border-green-200 p-1 flex flex-col gap-1">
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                        <div className="h-4 bg-white rounded-sm shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-brand-orange text-sm font-medium">
                    <CheckCircle size={16} /> Target: Everything Done by Sprint End
                  </div>
                </div>
              </div>
            </div>

            {/* Team characteristics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                 <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Team Fit</h4>
                 <ul className="space-y-3">
                   <li className="flex gap-2">
                     <span className="font-semibold w-24 shrink-0 text-gray-600">Scrum:</span>
                     <span className="text-gray-700">A good fit for teams with complex goals/objectives that require a shared commitment to finishing features.</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="font-semibold w-24 shrink-0 text-gray-600">Kanban:</span>
                     <span className="text-gray-700">A good fit for varied or distributed teams, or teams with many players working on separate tasks (Support, Maintenance).</span>
                   </li>
                 </ul>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                 <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Ideology & Origins</h4>
                 <ul className="space-y-3">
                   <li className="flex gap-2">
                     <span className="font-semibold w-24 shrink-0 text-gray-600">Scrum:</span>
                     <span className="text-gray-700">Originated in <em>Software Development</em>. Its core ideology is solving complex problems while delivering valuable products.</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="font-semibold w-24 shrink-0 text-gray-600">Kanban:</span>
                     <span className="text-gray-700">Originated in <em>Lean Manufacturing</em> (the Toyota factory). Its core ideology is using visuals to improve the flow and process of work.</span>
                   </li>
                 </ul>
              </div>
            </div>

          </div>
        )
      },
      {
        id: 'k2',
        title: 'The Hybrid Approach (The Middle Road)',
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">What if your leadership (C-Level/Management) demands the rigid schedule certainty of Waterfall, while your execution team needs the adaptive flexibility of Agile? The answer is the <strong>Hybrid Framework</strong>.</p>

            <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>

              <div className="w-full md:w-1/2 bg-teal-50 p-6 rounded-xl border border-teal-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-200 text-teal-800 rounded-full flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold text-teal-900 text-xl">Management Level<br/><span className="text-sm text-teal-700 font-medium">Macro Planning</span></h4>
                </div>
                <p className="text-teal-800 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-teal-100">
                  Uses <strong>Waterfall</strong>.<br/>Management plans the annual project timeline, budget, and Q1-Q4 milestone targets. They need administrative certainty about when project X will be finished and how much funding it needs.
                </p>
              </div>

              <div className="hidden md:flex flex-col items-center">
                <ArrowRight className="text-teal-400" size={32} />
                <span className="text-xs font-bold text-teal-600 mt-2 uppercase tracking-wider">Handed Down To</span>
              </div>

              <div className="w-full md:w-1/2 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-200 text-indigo-800 rounded-full flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold text-indigo-900 text-xl">Operational Level<br/><span className="text-sm text-indigo-700 font-medium">Micro Execution</span></h4>
                </div>
                <p className="text-indigo-800 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                  Uses <strong>Scrum / Kanban</strong>.<br/>The annual targets from management are broken down into weekly Sprints. The day-to-day execution team uses a visual board (Kanban) and daily syncs (Standups).
                </p>
              </div>
            </div>

            <p className="text-gray-700 italic text-center text-sm">This Hybrid method is most often applied in government institutions, banking, and giant-scale corporate enterprises.</p>
          </div>
        )
      }
    ]
  }
];

export function builtinCourses(lang: 'id' | 'en'): BuiltinCourse[] {
  return lang === 'id' ? coursesId : coursesEn;
}
