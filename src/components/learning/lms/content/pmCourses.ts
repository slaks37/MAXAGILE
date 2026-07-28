// ---------------------------------------------------------------------------
// MaxAgile LMS — Materi siap pakai: Manajemen Proyek untuk semua orang.
//
// Tiga kursus lengkap (Dasar, Waterfall, Scrum & Kanban) yang ditulis dalam
// Bahasa Indonesia sehari-hari. Tidak ada contoh khusus programmer: semua
// analogi diambil dari warung, sekolah, katering, laundry, dan renovasi rumah.
//
// Semua id di bawah ini SENGAJA berupa string tetap supaya katalog deterministik.
// Saat dipasang ke katalog pengguna, `instantiatePmCourse()` menyalin dalam
// (deep clone) dan menulis ulang SETIAP id dengan genId() agar tidak bentrok.
//
// Tidak ada lampiran/gambar sama sekali — materi ini harus jalan tanpa unggahan.
// ---------------------------------------------------------------------------

import { genId } from '../store';
import { PM_WATERFALL } from './pmWaterfall';
import { PM_AGILE } from './pmAgile';
import type {
  Activity,
  Course,
  LessonBlock,
  QuizActivity,
  ChecklistActivity,
  AssessmentActivity,
} from '../types';

// ===========================================================================
// KURSUS 1 — Dasar Manajemen Proyek
// ===========================================================================

const PM_BASICS: Course = {
  id: 'pm-basics',
  title: 'Dasar Manajemen Proyek',
  summary:
    'Buat guru, pemilik toko, panitia acara, dan staf kantor. Kita bahas apa itu proyek dan cara menjaga pekerjaan besar tetap rapi — pakai bahasa sehari-hari.',
  category: 'Manajemen Proyek',
  color: 'from-blue-500 to-cyan-400',
  sections: [
    // -------------------------------------------------------------------
    // 1.1
    // -------------------------------------------------------------------
    {
      id: 'pmb-s1',
      title: 'Apa Itu Proyek dan Kenapa Perlu Dikelola',
      summary: 'Membedakan proyek dari pekerjaan rutin, dan mengenali kapan sebuah pekerjaan butuh dikelola.',
      activities: [
        {
          id: 'pmb-s1-lesson',
          type: 'lesson',
          title: 'Mengenali Sebuah Proyek',
          description: 'Pelajaran singkat, satu kartu sekali jalan.',
          lesson: {
            blocks: [
              {
                id: 'pmb-s1-b1',
                type: 'text',
                title: 'Mulai dari yang Anda kenal',
                body: 'Bu Rina membuka warung setiap hari: belanja ke pasar, memasak, melayani pembeli, lalu tutup. Besok ia mengulang hal yang sama persis.\n\nBulan lalu Bu Rina juga menikahkan anaknya. Acara itu punya tanggal mulai, tanggal selesai, dan tidak akan diulang minggu depan.\n\nDua-duanya adalah pekerjaan. Tetapi hanya satu yang kita sebut proyek.',
              },
              {
                id: 'pmb-s1-b2',
                type: 'keypoint',
                title: 'Ciri sebuah proyek',
                points: [
                  'Punya awal dan akhir yang jelas — bukan pekerjaan yang berulang selamanya.',
                  'Menghasilkan sesuatu yang baru atau berbeda: ruang kelas baru, acara, sistem antrean baru.',
                  'Biasanya melibatkan beberapa orang dan beberapa jenis pekerjaan sekaligus.',
                  'Punya batas: uang yang tersedia, tenggat waktu, dan hasil yang sudah dijanjikan.',
                ],
              },
              {
                id: 'pmb-s1-b3',
                type: 'check',
                question: 'Mana yang paling tepat disebut proyek?',
                options: [
                  { id: 'pmb-s1-b3-o1', text: 'Menyapu toko setiap pagi sebelum buka' },
                  { id: 'pmb-s1-b3-o2', text: 'Memindahkan seluruh isi toko ke ruko baru dalam dua bulan' },
                  { id: 'pmb-s1-b3-o3', text: 'Menghitung uang kas setiap malam' },
                  { id: 'pmb-s1-b3-o4', text: 'Membalas pesan pelanggan setiap hari' },
                ],
                correctOptionId: 'pmb-s1-b3-o2',
                explanation:
                  'Pindah toko punya awal, akhir, dan hasil yang jelas — lalu selesai untuk selamanya. Menyapu, menghitung kas, dan membalas pesan adalah pekerjaan rutin (sering disebut operasional): berulang terus tanpa tanggal selesai. Rutin bukan berarti tidak penting; hanya saja cara mengelolanya berbeda.',
              },
              {
                id: 'pmb-s1-b4',
                type: 'text',
                title: 'Kenapa proyek gampang berantakan',
                body: 'Pekerjaan rutin punya pelindung alami: kalau hari ini keliru, besok bisa diperbaiki karena pekerjaannya sama lagi.\n\nProyek tidak punya pelindung itu. Setiap langkah baru, setiap orang mengerjakan bagian berbeda, dan waktunya terbatas. Kekeliruan kecil di awal sering baru terasa jauh di belakang — saat memperbaikinya sudah mahal.',
              },
              {
                id: 'pmb-s1-b5',
                type: 'keypoint',
                title: 'Empat penyebab proyek gagal yang paling sering',
                points: [
                  'Tidak ada yang tahu persis seperti apa hasil akhirnya nanti.',
                  'Semua orang mengira bagian itu sudah dikerjakan orang lain.',
                  'Permintaan tambahan masuk di tengah jalan tanpa dibicarakan dampaknya.',
                  'Masalah kecil disembunyikan sampai berubah menjadi masalah besar.',
                ],
              },
              {
                id: 'pmb-s1-b6',
                type: 'text',
                title: 'Jadi, apa itu manajemen proyek?',
                body: 'Manajemen proyek adalah kebiasaan sederhana: menulis apa yang mau dicapai, memecahnya menjadi pekerjaan-pekerjaan kecil, menentukan siapa mengerjakan apa dan kapan, lalu rutin membandingkan rencana dengan kenyataan.\n\nItu saja. Bukan soal aplikasi mahal atau istilah asing. Satu buku tulis dan satu pertemuan mingguan yang jujur sudah bisa disebut manajemen proyek yang baik.',
              },
              {
                id: 'pmb-s1-b7',
                type: 'flashcard',
                front: 'Apa bedanya proyek dan pekerjaan rutin?',
                back: 'Proyek punya tanggal selesai dan menghasilkan sesuatu yang baru. Pekerjaan rutin berulang terus tanpa tanggal selesai — misalnya membuka toko setiap pagi atau mengajar kelas setiap semester.',
              },
              {
                id: 'pmb-s1-b8',
                type: 'fillblank',
                sentence: 'Sebuah proyek selalu punya awal dan ___ yang jelas.',
                answer: 'akhir',
                options: ['akhir', 'anggaran tak terbatas', 'kantor sendiri'],
              },
              {
                id: 'pmb-s1-b9',
                type: 'text',
                title: 'Hasil akhir harus bisa dibayangkan',
                body: 'Sebelum bergerak, satu kalimat ini harus bisa dijawab semua orang: "Proyek ini dianggap berhasil kalau apa?"\n\nJawaban yang baik bisa dilihat dan dihitung. Bukan "acaranya sukses", melainkan "300 tamu hadir, acara selesai pukul 22.00, biaya di bawah lima puluh juta". Kalimat seperti itu langsung menghentikan perdebatan yang tidak perlu.',
              },
              {
                id: 'pmb-s1-b10',
                type: 'check',
                question:
                  'Panitia sudah rapat tiga kali, tapi belum ada yang bisa menjawab "acara ini berhasil kalau apa?". Langkah pertama yang paling tepat?',
                options: [
                  { id: 'pmb-s1-b10-o1', text: 'Segera sebar undangan supaya terasa ada kemajuan' },
                  { id: 'pmb-s1-b10-o2', text: 'Sepakati dulu satu kalimat hasil akhir beserta ukurannya' },
                  { id: 'pmb-s1-b10-o3', text: 'Tambah anggota panitia supaya pekerjaan lebih cepat' },
                  { id: 'pmb-s1-b10-o4', text: 'Tunda rapat sampai ketua panitia punya waktu luang' },
                ],
                correctOptionId: 'pmb-s1-b10-o2',
                explanation:
                  'Tanpa kesepakatan hasil akhir, setiap orang bekerja mengejar bayangan yang berbeda. Menambah orang atau bergerak cepat justru memperbanyak pekerjaan yang nanti harus diulang. Menunda rapat hanya memindahkan kebingungan ke minggu depan.',
              },
              {
                id: 'pmb-s1-b11',
                type: 'match',
                prompt: 'Pasangkan istilah dengan arti sehari-harinya.',
                pairs: [
                  { id: 'pmb-s1-b11-p1', left: 'Proyek', right: 'Pekerjaan berbatas waktu dengan hasil yang jelas' },
                  { id: 'pmb-s1-b11-p2', left: 'Operasional', right: 'Pekerjaan rutin yang berulang tanpa tanggal selesai' },
                  { id: 'pmb-s1-b11-p3', left: 'Hasil akhir', right: 'Barang atau layanan nyata yang diserahkan saat proyek selesai' },
                  { id: 'pmb-s1-b11-p4', left: 'Pemangku kepentingan', right: 'Siapa pun yang terkena dampak atau berkepentingan atas hasilnya' },
                ],
              },
              {
                id: 'pmb-s1-b12',
                type: 'keypoint',
                title: 'Bawa pulang tiga hal ini',
                points: [
                  'Proyek = ada awal, ada akhir, ada hasil baru yang dijanjikan.',
                  'Kelola proyek berarti: tulis tujuan, bagi pekerjaan, cek kenyataan secara rutin.',
                  'Satu kalimat "berhasil kalau apa" lebih berguna daripada sepuluh halaman rencana.',
                ],
              },
              {
                id: 'pmb-s1-b13',
                type: 'reflect',
                prompt:
                  'Tuliskan satu pekerjaan di tempat Anda yang sebenarnya sebuah proyek. Lalu tulis satu kalimat: proyek ini berhasil kalau apa?',
                placeholder: 'Contoh: Memindahkan arsip lima tahun ke ruang baru. Berhasil kalau ...',
              },
            ],
          },
        },
        {
          id: 'pmb-s1-quiz',
          type: 'quiz',
          title: 'Kuis: Mengenali Proyek',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmb-s1-q1',
                text: 'Manakah yang BUKAN ciri sebuah proyek?',
                points: 1,
                options: [
                  { id: 'pmb-s1-q1-o1', text: 'Punya tanggal selesai' },
                  { id: 'pmb-s1-q1-o2', text: 'Menghasilkan sesuatu yang baru' },
                  { id: 'pmb-s1-q1-o3', text: 'Dikerjakan berulang setiap hari tanpa akhir' },
                  { id: 'pmb-s1-q1-o4', text: 'Punya batas biaya' },
                ],
                correctOptionId: 'pmb-s1-q1-o3',
              },
              {
                id: 'pmb-s1-q2',
                text: 'Manajemen proyek paling tepat digambarkan sebagai...',
                points: 1,
                options: [
                  { id: 'pmb-s1-q2-o1', text: 'Aplikasi khusus yang harus dibeli lebih dulu' },
                  { id: 'pmb-s1-q2-o2', text: 'Kebiasaan menulis tujuan, membagi pekerjaan, dan rutin mengecek kenyataan' },
                  { id: 'pmb-s1-q2-o3', text: 'Tugas satu orang paling pintar di tim' },
                  { id: 'pmb-s1-q2-o4', text: 'Laporan tebal yang dibuat untuk atasan di akhir pekerjaan' },
                ],
                correctOptionId: 'pmb-s1-q2-o2',
              },
              {
                id: 'pmb-s1-q3',
                text: 'Panitia belum sepakat soal hasil akhir. Risiko terbesarnya adalah...',
                points: 1,
                options: [
                  { id: 'pmb-s1-q3-o1', text: 'Anggaran justru jadi lebih hemat' },
                  { id: 'pmb-s1-q3-o2', text: 'Setiap orang bekerja ke arah berbeda dan hasilnya harus diulang' },
                  { id: 'pmb-s1-q3-o3', text: 'Rapat jadi lebih singkat' },
                  { id: 'pmb-s1-q3-o4', text: 'Tidak ada risiko selama semua anggota rajin' },
                ],
                correctOptionId: 'pmb-s1-q3-o2',
              },
              {
                id: 'pmb-s1-q4',
                text: 'Bu Rina membuka warung setiap hari. Kegiatan itu paling tepat disebut...',
                points: 1,
                options: [
                  { id: 'pmb-s1-q4-o1', text: 'Proyek jangka panjang' },
                  { id: 'pmb-s1-q4-o2', text: 'Pekerjaan rutin (operasional)' },
                  { id: 'pmb-s1-q4-o3', text: 'Tonggak pencapaian' },
                  { id: 'pmb-s1-q4-o4', text: 'Risiko yang harus dicatat' },
                ],
                correctOptionId: 'pmb-s1-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pmb-s1-checklist',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmb-s1-c1', text: 'Saya bisa menjelaskan beda proyek dan pekerjaan rutin dengan contoh dari tempat kerja saya.' },
              { id: 'pmb-s1-c2', text: 'Saya sudah menulis satu kalimat "berhasil kalau apa" untuk satu pekerjaan saya.' },
              { id: 'pmb-s1-c3', text: 'Saya bisa menyebutkan tiga hal yang paling sering membuat proyek berantakan.' },
              { id: 'pmb-s1-c4', text: 'Saya paham bahwa manajemen proyek tidak butuh aplikasi mahal untuk dimulai.' },
              { id: 'pmb-s1-c5', text: 'Saya tahu siapa yang harus ikut menyepakati hasil akhir sebelum pekerjaan dimulai.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 1.2
    // -------------------------------------------------------------------
    {
      id: 'pmb-s2',
      title: 'Tiga Batasan: Ruang Lingkup, Waktu, Biaya',
      summary: 'Kenapa menambah satu hal selalu menggeser hal lain, dan bagaimana menjelaskannya dengan sopan.',
      activities: [
        {
          id: 'pmb-s2-lesson',
          type: 'lesson',
          title: 'Tarik-Menarik Tiga Batasan',
          lesson: {
            blocks: [
              {
                id: 'pmb-s2-b1',
                type: 'text',
                title: 'Pesan kue ulang tahun',
                body: 'Bayangkan Anda memesan kue. Anda menyebut tiga hal: bentuknya seperti apa, kapan harus jadi, dan berapa uang yang Anda punya.\n\nKalau H-1 Anda minta tambahan dua tingkat, toko kue hanya punya tiga pilihan jujur: minta tambahan waktu, minta tambahan biaya, atau mengurangi kerumitan hiasan. Ia tidak bisa memberi ketiganya tanpa mengorbankan sesuatu.\n\nSemua proyek bekerja persis seperti itu.',
              },
              {
                id: 'pmb-s2-b2',
                type: 'keypoint',
                title: 'Kosakata dasar, dalam bahasa manusia',
                points: [
                  'Ruang lingkup (sering disebut scope) = daftar apa saja yang akan dikerjakan, DAN apa yang tidak.',
                  'Waktu = kapan pekerjaan harus selesai, termasuk tanggal-tanggal penting di tengah jalan.',
                  'Biaya = uang dan tenaga orang yang tersedia. Jam kerja tim juga biaya.',
                  'Mutu = seberapa rapi dan layak pakai hasilnya. Inilah yang diam-diam jatuh kalau tiga hal di atas dipaksa.',
                ],
              },
              {
                id: 'pmb-s2-b3',
                type: 'text',
                title: 'Aturan yang tidak bisa dilanggar',
                body: 'Kalau ruang lingkup bertambah sementara waktu dan biaya dikunci, mutu pasti turun. Bukan karena tim malas — karena secara matematika tidak ada tempat lain untuk mengambilnya.\n\nManajer proyek yang baik tidak berkata "tidak bisa". Ia membuat pertukarannya terlihat, lalu membiarkan pemilik pekerjaan yang memutuskan.',
              },
              {
                id: 'pmb-s2-b4',
                type: 'check',
                question:
                  'Klien minta tambahan dua halaman brosur pada H-3, sementara anggaran dan tanggal cetak tetap. Jawaban paling profesional?',
                options: [
                  { id: 'pmb-s2-b4-o1', text: '"Siap, nanti kami usahakan lembur." (tanpa memberi tahu siapa pun)' },
                  { id: 'pmb-s2-b4-o2', text: '"Tidak bisa, sudah terlambat." lalu tutup pembicaraan' },
                  { id: 'pmb-s2-b4-o3', text: '"Bisa. Ini dampaknya: cetak mundur dua hari, atau kita ganti dua halaman yang sudah ada. Bapak pilih yang mana?"' },
                  { id: 'pmb-s2-b4-o4', text: '"Dikerjakan dulu saja, soal biaya kita bicarakan setelah cetak."' },
                ],
                correctOptionId: 'pmb-s2-b4-o3',
                explanation:
                  'Pilihan ketiga tidak menolak dan tidak berbohong — ia menaruh pertukarannya di atas meja lalu menyerahkan keputusan kepada yang berhak. Menyanggupi diam-diam memindahkan risiko ke tim dan biasanya berakhir dengan mutu jelek. Menolak mentah-mentah merusak hubungan. Menunda pembicaraan biaya hampir selalu berakhir jadi perselisihan.',
              },
              {
                id: 'pmb-s2-b5',
                type: 'text',
                title: 'Tulis juga apa yang TIDAK termasuk',
                body: 'Bagian ruang lingkup yang paling sering dilupakan adalah daftar "tidak termasuk". Justru daftar itu yang menyelamatkan Anda nanti.\n\nContoh untuk proyek pindah kantor: "Termasuk: mengemas dan memindahkan meja, kursi, lemari arsip. Tidak termasuk: memindahkan barang pribadi karyawan, membeli perabot baru, mengecat ruangan lama."\n\nSatu paragraf itu bisa menghemat perdebatan berminggu-minggu.',
              },
              {
                id: 'pmb-s2-b6',
                type: 'flashcard',
                front: 'Apa itu ruang lingkup yang melar (scope creep)?',
                back: 'Permintaan tambahan kecil yang terus masuk tanpa pernah dicatat atau dinilai dampaknya. Satu per satu terasa sepele — "cuma tambah satu spanduk", "cuma satu kolom lagi" — tetapi digabung, jadwal dan biaya jebol.',
              },
              {
                id: 'pmb-s2-b7',
                type: 'keypoint',
                title: 'Cara menulis ruang lingkup yang aman',
                points: [
                  'Pakai kata kerja dan angka: "menyediakan 300 kursi", bukan "menyiapkan tempat duduk yang cukup".',
                  'Selalu ada bagian "tidak termasuk".',
                  'Sebut siapa yang berhak menyetujui perubahan — satu nama saja.',
                  'Simpan di tempat yang bisa dibuka semua orang, bukan di percakapan pribadi.',
                ],
              },
              {
                id: 'pmb-s2-b8',
                type: 'fillblank',
                sentence: 'Kalau ruang lingkup bertambah sementara waktu dan biaya tetap, yang biasanya jatuh diam-diam adalah ___.',
                answer: 'mutu hasil',
                options: ['mutu hasil', 'semangat klien', 'jumlah rapat'],
              },
              {
                id: 'pmb-s2-b9',
                type: 'match',
                prompt: 'Pasangkan setiap batasan dengan pertanyaan yang dijawabnya.',
                pairs: [
                  { id: 'pmb-s2-b9-p1', left: 'Ruang lingkup', right: 'Apa saja yang dikerjakan dan apa yang tidak?' },
                  { id: 'pmb-s2-b9-p2', left: 'Waktu', right: 'Kapan pekerjaan harus selesai?' },
                  { id: 'pmb-s2-b9-p3', left: 'Biaya', right: 'Berapa uang dan tenaga yang tersedia?' },
                  { id: 'pmb-s2-b9-p4', left: 'Mutu', right: 'Seberapa rapi dan layak pakai hasilnya?' },
                ],
              },
              {
                id: 'pmb-s2-b10',
                type: 'check',
                question: 'Tim memperkirakan pekerjaan selesai lima hari. Cara paling sehat menyampaikannya ke atasan?',
                options: [
                  { id: 'pmb-s2-b10-o1', text: '"Pasti lima hari." — supaya atasan tenang' },
                  { id: 'pmb-s2-b10-o2', text: '"Lima hari, kalau bahan datang hari Senin. Kalau telat, mundur sehari."' },
                  { id: 'pmb-s2-b10-o3', text: '"Sekitar seminggu dua minggu, belum tahu pasti."' },
                  { id: 'pmb-s2-b10-o4', text: '"Tiga hari saja." — supaya terlihat cepat, nanti tinggal minta tambahan' },
                ],
                correctOptionId: 'pmb-s2-b10-o2',
                explanation:
                  'Perkiraan yang baik selalu menyebut syaratnya. Angka tanpa syarat terdengar meyakinkan tetapi menyembunyikan risiko, dan ketika meleset kepercayaan ikut hilang. Rentang yang terlalu lebar tidak bisa dipakai membuat jadwal. Menyebut angka terlalu cepat demi terlihat gesit adalah utang yang harus dibayar dua kali lipat.',
              },
              {
                id: 'pmb-s2-b11',
                type: 'text',
                title: 'Cadangan waktu bukan kecurangan',
                body: 'Menyisipkan cadangan waktu — misalnya 10 sampai 20 persen dari total — bukan berarti tim tidak yakin. Itu pengakuan jujur bahwa selalu ada hal yang tidak bisa diramal: vendor telat, orang sakit, listrik padam.\n\nYang keliru adalah menyembunyikan cadangan itu di setiap pekerjaan kecil. Lebih sehat menaruhnya satu tempat, terbuka, dan mengelolanya sebagai milik proyek — bukan milik masing-masing orang.',
              },
              {
                id: 'pmb-s2-b12',
                type: 'keypoint',
                title: 'Ringkasan',
                points: [
                  'Ruang lingkup, waktu, dan biaya saling tarik-menarik. Menambah satu selalu menggeser yang lain.',
                  'Tugas Anda bukan menolak permintaan, tetapi membuat dampaknya terlihat sebelum diputuskan.',
                  'Daftar "tidak termasuk" sama pentingnya dengan daftar "termasuk".',
                  'Perkiraan waktu selalu disertai syaratnya.',
                ],
              },
              {
                id: 'pmb-s2-b13',
                type: 'reflect',
                prompt:
                  'Ambil satu pekerjaan yang sedang Anda urus. Tulis tiga baris: ruang lingkupnya apa, batas waktunya kapan, biayanya berapa. Mana yang paling tidak jelas — dan siapa yang bisa memperjelasnya?',
                placeholder: 'Ruang lingkup: ... / Waktu: ... / Biaya: ... / Paling tidak jelas: ...',
              },
            ],
          },
        },
        {
          id: 'pmb-s2-quiz',
          type: 'quiz',
          title: 'Kuis: Tiga Batasan',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmb-s2-q1',
                text: 'Ruang lingkup bertambah, tanggal dan anggaran dikunci. Apa yang paling mungkin terjadi?',
                points: 1,
                options: [
                  { id: 'pmb-s2-q1-o1', text: 'Tim otomatis bekerja lebih efisien' },
                  { id: 'pmb-s2-q1-o2', text: 'Mutu hasil turun tanpa ada yang mengumumkannya' },
                  { id: 'pmb-s2-q1-o3', text: 'Biaya ikut turun dengan sendirinya' },
                  { id: 'pmb-s2-q1-o4', text: 'Tidak ada dampak apa pun' },
                ],
                correctOptionId: 'pmb-s2-q1-o2',
              },
              {
                id: 'pmb-s2-q2',
                text: 'Bagian ruang lingkup yang paling sering dilupakan dan paling menyelamatkan adalah...',
                points: 1,
                options: [
                  { id: 'pmb-s2-q2-o1', text: 'Daftar nama seluruh anggota tim' },
                  { id: 'pmb-s2-q2-o2', text: 'Daftar hal yang TIDAK termasuk pekerjaan' },
                  { id: 'pmb-s2-q2-o3', text: 'Logo perusahaan di halaman depan' },
                  { id: 'pmb-s2-q2-o4', text: 'Riwayat rapat sebelumnya' },
                ],
                correctOptionId: 'pmb-s2-q2-o2',
              },
              {
                id: 'pmb-s2-q3',
                text: '"Ruang lingkup yang melar" paling tepat dijelaskan sebagai...',
                points: 1,
                options: [
                  { id: 'pmb-s2-q3-o1', text: 'Satu perubahan besar yang disetujui resmi oleh pemilik proyek' },
                  { id: 'pmb-s2-q3-o2', text: 'Banyak tambahan kecil yang tidak pernah dicatat maupun dihitung dampaknya' },
                  { id: 'pmb-s2-q3-o3', text: 'Anggaran yang dinaikkan di tengah jalan' },
                  { id: 'pmb-s2-q3-o4', text: 'Tim yang bekerja lebih lambat dari biasanya' },
                ],
                correctOptionId: 'pmb-s2-q3-o2',
              },
              {
                id: 'pmb-s2-q4',
                text: 'Perkiraan waktu yang paling bisa dipercaya adalah yang...',
                points: 1,
                options: [
                  { id: 'pmb-s2-q4-o1', text: 'Menyebut satu angka tegas tanpa syarat apa pun' },
                  { id: 'pmb-s2-q4-o2', text: 'Menyebut angka beserta syarat dan apa yang terjadi kalau syarat itu meleset' },
                  { id: 'pmb-s2-q4-o3', text: 'Sengaja dipercepat supaya tim terlihat gesit' },
                  { id: 'pmb-s2-q4-o4', text: 'Dibiarkan sangat lebar supaya aman' },
                ],
                correctOptionId: 'pmb-s2-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pmb-s2-checklist',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmb-s2-c1', text: 'Saya bisa menjelaskan tarik-menarik ruang lingkup, waktu, dan biaya dengan satu contoh nyata.' },
              { id: 'pmb-s2-c2', text: 'Saya sudah menulis daftar "tidak termasuk" untuk satu pekerjaan saya.' },
              { id: 'pmb-s2-c3', text: 'Saya tahu cara menjawab permintaan tambahan tanpa menolak dan tanpa berbohong.' },
              { id: 'pmb-s2-c4', text: 'Saya selalu menyertakan syarat ketika memberi perkiraan waktu.' },
              { id: 'pmb-s2-c5', text: 'Saya tahu satu nama yang berhak menyetujui perubahan di pekerjaan saya.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 1.3
    // -------------------------------------------------------------------
    {
      id: 'pmb-s3',
      title: 'Orang-Orang di Sekitar Proyek',
      summary: 'Siapa memutuskan, siapa mengerjakan, siapa yang perlu diajak bicara sejak awal.',
      activities: [
        {
          id: 'pmb-s3-lesson',
          type: 'lesson',
          title: 'Peran dan Komunikasi',
          lesson: {
            blocks: [
              {
                id: 'pmb-s3-b1',
                type: 'text',
                title: 'Renovasi rumah Pak Hasan',
                body: 'Di proyek renovasi rumah selalu ada: pemilik rumah yang membayar dan memutuskan, mandor yang mengatur jalannya pekerjaan, tukang yang benar-benar memasang bata, dan tetangga yang terganggu suara bor setiap pagi.\n\nKeempatnya berpengaruh pada keberhasilan proyek. Yang terakhir paling sering dilupakan — dan justru yang paling bisa menghentikan pekerjaan.',
              },
              {
                id: 'pmb-s3-b2',
                type: 'keypoint',
                title: 'Empat peran yang selalu ada',
                points: [
                  'Pemilik proyek (sering disebut sponsor) — menyediakan dana dan memutuskan hal-hal besar.',
                  'Manajer proyek — menjaga jadwal, komunikasi, dan menyingkirkan hambatan. Bukan orang paling ahli, tapi orang yang paling tahu keadaan.',
                  'Tim pelaksana — yang mengerjakan pekerjaan sesungguhnya.',
                  'Pemangku kepentingan (stakeholder) — siapa pun yang terkena dampak hasilnya, meski tidak ikut bekerja.',
                ],
              },
              {
                id: 'pmb-s3-b3',
                type: 'text',
                title: 'Pemangku kepentingan itu siapa saja?',
                body: 'Cara cepat menemukannya: tanyakan "kalau proyek ini jadi, hidup siapa yang berubah?"\n\nUntuk perubahan jam masuk sekolah, jawabannya bukan hanya guru dan kepala sekolah. Ada orang tua yang harus mengatur ulang jam berangkat kerja, ada sopir antar-jemput, ada pedagang kantin. Melewatkan mereka bukan sekadar tidak sopan — itu risiko nyata yang bisa membatalkan proyek di menit terakhir.',
              },
              {
                id: 'pmb-s3-b4',
                type: 'check',
                question: 'Sekolah akan mengubah jam masuk. Kelompok mana yang paling sering terlupakan padahal dampaknya besar?',
                options: [
                  { id: 'pmb-s3-b4-o1', text: 'Kepala sekolah' },
                  { id: 'pmb-s3-b4-o2', text: 'Guru kelas' },
                  { id: 'pmb-s3-b4-o3', text: 'Orang tua dan petugas antar-jemput' },
                  { id: 'pmb-s3-b4-o4', text: 'Wali kelas yang mengisi absensi' },
                ],
                correctOptionId: 'pmb-s3-b4-o3',
                explanation:
                  'Kepala sekolah dan guru pasti diajak bicara karena mereka ada di dalam gedung. Orang tua dan petugas antar-jemput ada di luar — mereka baru bersuara setelah keputusan diumumkan, dan saat itu membatalkan keputusan jauh lebih mahal daripada bertanya sejak awal.',
              },
              {
                id: 'pmb-s3-b5',
                type: 'flashcard',
                front: 'Apa tugas utama pemilik proyek (sponsor)?',
                back: 'Menyediakan dana dan wewenang, lalu memutuskan hal-hal besar: menyetujui ruang lingkup, menerima atau menolak perubahan, dan menyatakan proyek selesai. Ia tidak mengatur pekerjaan harian.',
              },
              {
                id: 'pmb-s3-b6',
                type: 'text',
                title: 'Satu pekerjaan, satu nama',
                body: 'Aturan paling murah dan paling ampuh: setiap pekerjaan punya tepat satu orang yang bertanggung jawab.\n\nBukan berarti ia bekerja sendirian — boleh dibantu siapa saja. Tetapi kalau ditanya "bagaimana kabar pekerjaan ini?", hanya satu orang yang wajib menjawab. Begitu ada dua nama, keduanya akan mengira yang lain sudah mengurusnya.',
              },
              {
                id: 'pmb-s3-b7',
                type: 'keypoint',
                title: 'Membagi tugas tanpa ribut',
                points: [
                  'Tulis pekerjaannya, lalu tulis satu nama di sebelahnya. Bukan nama divisi — nama orang.',
                  'Sebut juga siapa yang harus dimintai persetujuan, dan siapa yang cukup diberi kabar.',
                  'Kalau satu orang memegang terlalu banyak pekerjaan penting, itu risiko, bukan prestasi.',
                  'Bacakan pembagian ini di depan semua orang sekali saja. Yang tidak diucapkan biasanya tidak terjadi.',
                ],
              },
              {
                id: 'pmb-s3-b8',
                type: 'fillblank',
                sentence: 'Setiap pekerjaan sebaiknya punya ___ orang yang bertanggung jawab menjawab kabarnya.',
                answer: 'satu',
                options: ['satu', 'dua', 'tiga'],
              },
              {
                id: 'pmb-s3-b9',
                type: 'match',
                prompt: 'Pasangkan peran dengan tugasnya.',
                pairs: [
                  { id: 'pmb-s3-b9-p1', left: 'Pemilik proyek', right: 'Menyediakan dana dan memutuskan hal besar' },
                  { id: 'pmb-s3-b9-p2', left: 'Manajer proyek', right: 'Menjaga jadwal, komunikasi, dan menyingkirkan hambatan' },
                  { id: 'pmb-s3-b9-p3', left: 'Tim pelaksana', right: 'Mengerjakan pekerjaan sesungguhnya' },
                  { id: 'pmb-s3-b9-p4', left: 'Pemangku kepentingan', right: 'Terkena dampak hasil, perlu diajak bicara sejak awal' },
                ],
              },
              {
                id: 'pmb-s3-b10',
                type: 'text',
                title: 'Komunikasi: siapa perlu tahu apa, seberapa sering',
                body: 'Tidak semua orang butuh semua kabar. Pemilik proyek biasanya cukup satu ringkasan seminggu sekali. Tim pelaksana butuh kabar harian. Pemangku kepentingan di luar cukup diberi tahu saat ada yang berubah bagi mereka.\n\nTulis sekali di awal: siapa, dapat kabar apa, lewat apa, seberapa sering. Setengah dari kesalahpahaman di proyek selesai hanya dengan tabel kecil ini.',
              },
              {
                id: 'pmb-s3-b11',
                type: 'check',
                question: 'Anda baru tahu pekerjaan Anda akan telat tiga hari. Kapan sebaiknya memberi tahu?',
                options: [
                  { id: 'pmb-s3-b11-o1', text: 'Sekarang juga, sekaligus membawa usulan langkah berikutnya' },
                  { id: 'pmb-s3-b11-o2', text: 'Nanti saat rapat mingguan, supaya tidak mengganggu' },
                  { id: 'pmb-s3-b11-o3', text: 'Setelah dicoba diselamatkan sendiri dulu selama dua hari' },
                  { id: 'pmb-s3-b11-o4', text: 'Saat tenggat lewat, kalau memang benar-benar telat' },
                ],
                correctOptionId: 'pmb-s3-b11-o1',
                explanation:
                  'Keterlambatan yang diketahui hari ini masih punya banyak pilihan penyelesaian: menggeser pekerjaan lain, menambah bantuan, atau memberi tahu pihak luar lebih awal. Keterlambatan yang baru diumumkan saat tenggat lewat hanya menyisakan satu pilihan: minta maaf. Membawa usulan langkah membuat kabar buruk terasa seperti kerja sama, bukan keluhan.',
              },
              {
                id: 'pmb-s3-b12',
                type: 'keypoint',
                title: 'Ringkasan',
                points: [
                  'Empat peran: pemilik proyek, manajer proyek, tim pelaksana, pemangku kepentingan.',
                  'Cari pemangku kepentingan dengan bertanya: hidup siapa yang berubah kalau proyek ini jadi?',
                  'Satu pekerjaan, satu nama penanggung jawab.',
                  'Kabar buruk lebih awal selalu lebih murah daripada kabar buruk yang tepat waktu.',
                ],
              },
              {
                id: 'pmb-s3-b13',
                type: 'reflect',
                prompt:
                  'Sebutkan satu pemangku kepentingan pekerjaan Anda yang selama ini belum pernah diajak bicara. Apa satu pertanyaan yang ingin Anda tanyakan kepadanya minggu ini?',
                placeholder: 'Orangnya: ... / Pertanyaan saya: ...',
              },
            ],
          },
        },
        {
          id: 'pmb-s3-quiz',
          type: 'quiz',
          title: 'Kuis: Peran dan Komunikasi',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmb-s3-q1',
                text: 'Cara paling cepat menemukan pemangku kepentingan adalah bertanya...',
                points: 1,
                options: [
                  { id: 'pmb-s3-q1-o1', text: '"Siapa yang paling senior di sini?"' },
                  { id: 'pmb-s3-q1-o2', text: '"Kalau proyek ini jadi, hidup siapa yang berubah?"' },
                  { id: 'pmb-s3-q1-o3', text: '"Siapa yang punya waktu paling banyak?"' },
                  { id: 'pmb-s3-q1-o4', text: '"Siapa yang paling sering ikut rapat?"' },
                ],
                correctOptionId: 'pmb-s3-q1-o2',
              },
              {
                id: 'pmb-s3-q2',
                text: 'Kenapa satu pekerjaan sebaiknya hanya punya satu penanggung jawab?',
                points: 1,
                options: [
                  { id: 'pmb-s3-q2-o1', text: 'Supaya ada yang bisa disalahkan kalau gagal' },
                  { id: 'pmb-s3-q2-o2', text: 'Supaya tidak ada dua orang yang sama-sama mengira orang lain sudah mengurusnya' },
                  { id: 'pmb-s3-q2-o3', text: 'Supaya biaya tenaga kerja lebih murah' },
                  { id: 'pmb-s3-q2-o4', text: 'Supaya rapat bisa lebih singkat' },
                ],
                correctOptionId: 'pmb-s3-q2-o2',
              },
              {
                id: 'pmb-s3-q3',
                text: 'Tugas manajer proyek yang paling tepat adalah...',
                points: 1,
                options: [
                  { id: 'pmb-s3-q3-o1', text: 'Menjadi orang paling ahli di semua bidang' },
                  { id: 'pmb-s3-q3-o2', text: 'Menjaga jadwal, komunikasi, dan menyingkirkan hambatan tim' },
                  { id: 'pmb-s3-q3-o3', text: 'Menyediakan dana proyek' },
                  { id: 'pmb-s3-q3-o4', text: 'Mengerjakan sendiri bagian yang paling sulit' },
                ],
                correctOptionId: 'pmb-s3-q3-o2',
              },
              {
                id: 'pmb-s3-q4',
                text: 'Anda tahu hari ini bahwa pekerjaan akan telat. Tindakan terbaik?',
                points: 1,
                options: [
                  { id: 'pmb-s3-q4-o1', text: 'Diam dulu dan coba selamatkan sendiri selama beberapa hari' },
                  { id: 'pmb-s3-q4-o2', text: 'Sampaikan sekarang beserta usulan langkah berikutnya' },
                  { id: 'pmb-s3-q4-o3', text: 'Tunggu sampai ada yang bertanya' },
                  { id: 'pmb-s3-q4-o4', text: 'Sampaikan setelah tenggat benar-benar lewat' },
                ],
                correctOptionId: 'pmb-s3-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pmb-s3-checklist',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmb-s3-c1', text: 'Saya bisa menyebutkan empat peran dasar dan tugas masing-masing.' },
              { id: 'pmb-s3-c2', text: 'Saya sudah membuat daftar pemangku kepentingan pekerjaan saya, termasuk yang di luar tim.' },
              { id: 'pmb-s3-c3', text: 'Setiap pekerjaan di daftar saya punya tepat satu nama penanggung jawab.' },
              { id: 'pmb-s3-c4', text: 'Saya sudah menentukan siapa dapat kabar apa dan seberapa sering.' },
              { id: 'pmb-s3-c5', text: 'Saya terbiasa menyampaikan kabar buruk lebih awal beserta usulan langkahnya.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 1.4
    // -------------------------------------------------------------------
    {
      id: 'pmb-s4',
      title: 'Risiko, Perubahan, dan Kabar Buruk',
      summary: 'Menyiapkan payung sebelum hujan, dan menerima perubahan tanpa dibuat kacau olehnya.',
      activities: [
        {
          id: 'pmb-s4-lesson',
          type: 'lesson',
          title: 'Menyiapkan Payung Sebelum Hujan',
          lesson: {
            blocks: [
              {
                id: 'pmb-s4-b1',
                type: 'text',
                title: 'Acara di lapangan terbuka',
                body: 'Panitia bazar sekolah memilih lapangan terbuka. Semua senang sampai seseorang bertanya: "Kalau hujan bagaimana?"\n\nAda dua jenis panitia. Yang pertama menjawab "semoga tidak hujan". Yang kedua langsung menelepon pemilik tenda dan menanyakan harga sewa mendadak.\n\nBedanya hanya satu percakapan lima menit — tetapi hasil akhirnya bisa berbeda jauh.',
              },
              {
                id: 'pmb-s4-b2',
                type: 'keypoint',
                title: 'Dua kata yang sering tertukar',
                points: [
                  'Risiko = sesuatu yang BELUM terjadi tetapi mungkin terjadi, dan kalau terjadi akan berpengaruh.',
                  'Masalah = sesuatu yang SUDAH terjadi dan sedang mengganggu sekarang.',
                  'Risiko dikelola dengan rencana. Masalah dikelola dengan tindakan.',
                  'Setiap masalah hari ini biasanya adalah risiko yang kemarin tidak sempat dibicarakan.',
                ],
              },
              {
                id: 'pmb-s4-b3',
                type: 'text',
                title: 'Satu tabel kecil sudah cukup',
                body: 'Anda tidak butuh sistem rumit. Empat kolom di buku tulis sudah bekerja dengan baik:\n\n1. Apa yang bisa terjadi?\n2. Seberapa mungkin — jarang, mungkin, sering?\n3. Kalau terjadi, seberapa parah?\n4. Apa rencana kita, dan siapa yang memantaunya?\n\nBahas tabel ini lima menit setiap minggu. Risiko yang dibicarakan rutin jarang berubah menjadi bencana.',
              },
              {
                id: 'pmb-s4-b4',
                type: 'check',
                question: 'Pemasok satu-satunya untuk seragam acara sering telat. Mana penanganan risiko yang paling kuat?',
                options: [
                  { id: 'pmb-s4-b4-o1', text: 'Menelepon pemasok setiap hari supaya ia merasa diawasi' },
                  { id: 'pmb-s4-b4-o2', text: 'Mencari satu pemasok cadangan sekarang, sebelum dibutuhkan' },
                  { id: 'pmb-s4-b4-o3', text: 'Menuliskannya di daftar risiko lalu berharap tidak terjadi' },
                  { id: 'pmb-s4-b4-o4', text: 'Memajukan tanggal acara supaya lebih longgar' },
                ],
                correctOptionId: 'pmb-s4-b4-o2',
                explanation:
                  'Mencari cadangan mengurangi dampak sekaligus mengurangi ketergantungan — itu tindakan nyata. Menelepon setiap hari hanya menambah pekerjaan tanpa mengubah keadaan. Mencatat tanpa rencana sama saja dengan berharap. Memajukan tanggal acara mengubah proyek demi satu risiko, biasanya terlalu mahal.',
              },
              {
                id: 'pmb-s4-b5',
                type: 'flashcard',
                front: 'Apa bedanya risiko dan masalah?',
                back: 'Risiko belum terjadi — masih bisa dicegah atau disiapkan rencananya. Masalah sudah terjadi — yang tersisa hanya menanganinya. Tujuan kita adalah memindahkan sebanyak mungkin hal dari kolom "masalah" ke kolom "risiko yang sudah disiapkan".',
              },
              {
                id: 'pmb-s4-b6',
                type: 'fillblank',
                sentence: 'Rencana cadangan disiapkan ___ risiko benar-benar terjadi.',
                answer: 'sebelum',
                options: ['sebelum', 'sesudah', 'bersamaan dengan'],
              },
              {
                id: 'pmb-s4-b7',
                type: 'keypoint',
                title: 'Empat cara menangani satu risiko',
                points: [
                  'Hindari — ubah rencananya supaya risiko itu tidak lagi relevan (pindahkan acara ke dalam ruangan).',
                  'Kurangi — perkecil kemungkinan atau dampaknya (pesan bahan lebih awal).',
                  'Siapkan cadangan — biarkan risikonya ada, tetapi punya rencana B yang jelas (sewa tenda siaga).',
                  'Terima — untuk risiko kecil, sadar memilih tidak berbuat apa-apa. Ini sah, asal disengaja dan dicatat.',
                ],
              },
              {
                id: 'pmb-s4-b8',
                type: 'text',
                title: 'Perubahan itu wajar — yang berbahaya adalah perubahan diam-diam',
                body: 'Tidak ada proyek yang berjalan persis seperti rencana. Permintaan berubah karena keadaan berubah, dan itu bukan kegagalan siapa-siapa.\n\nYang merusak adalah perubahan yang masuk lewat pesan singkat, disanggupi seseorang, lalu tidak pernah sampai ke jadwal maupun anggaran. Tiga bulan kemudian semua orang bingung kenapa proyek melenceng, padahal tidak ada satu pun keputusan besar yang keliru.',
              },
              {
                id: 'pmb-s4-b9',
                type: 'keypoint',
                title: 'Tiga pertanyaan sebelum menerima perubahan',
                points: [
                  'Apa yang sebenarnya diminta, dan kenapa sekarang?',
                  'Apa dampaknya pada tanggal, biaya, dan pekerjaan yang sudah berjalan?',
                  'Siapa yang berhak memutuskan ya atau tidak — dan apakah keputusannya sudah tertulis?',
                ],
              },
              {
                id: 'pmb-s4-b10',
                type: 'match',
                prompt: 'Pasangkan istilah dengan artinya.',
                pairs: [
                  { id: 'pmb-s4-b10-p1', left: 'Risiko', right: 'Belum terjadi, tetapi mungkin terjadi dan berpengaruh' },
                  { id: 'pmb-s4-b10-p2', left: 'Masalah', right: 'Sudah terjadi dan sedang mengganggu sekarang' },
                  { id: 'pmb-s4-b10-p3', left: 'Rencana cadangan', right: 'Langkah B yang disiapkan sebelum dibutuhkan' },
                  { id: 'pmb-s4-b10-p4', left: 'Pemilik risiko', right: 'Orang yang ditunjuk memantau satu risiko tertentu' },
                ],
              },
              {
                id: 'pmb-s4-b11',
                type: 'check',
                question: 'Seorang anggota tim menyanggupi permintaan tambahan langsung lewat pesan pribadi. Apa bahayanya?',
                options: [
                  { id: 'pmb-s4-b11-o1', text: 'Tidak ada bahaya, justru menunjukkan pelayanan yang cepat' },
                  { id: 'pmb-s4-b11-o2', text: 'Pekerjaan bertambah tanpa masuk ke jadwal dan anggaran, sehingga penyebab keterlambatan nanti tidak terlacak' },
                  { id: 'pmb-s4-b11-o3', text: 'Klien akan tersinggung karena tidak lewat rapat resmi' },
                  { id: 'pmb-s4-b11-o4', text: 'Anggota tim itu akan kelelahan, selebihnya baik-baik saja' },
                ],
                correctOptionId: 'pmb-s4-b11-o2',
                explanation:
                  'Kesediaan membantu adalah hal baik; yang bermasalah adalah jejaknya hilang. Ketika pekerjaan tambahan tidak tercatat, keterlambatan yang muncul kemudian terlihat seperti tim yang lambat, padahal tim mengerjakan lebih banyak dari yang disepakati. Cukup satu baris catatan untuk mengubah keadaan itu.',
              },
              {
                id: 'pmb-s4-b12',
                type: 'text',
                title: 'Budaya kabar buruk lebih awal',
                body: 'Di tim yang sehat, orang yang melaporkan masalah pertama kali diperlakukan sebagai penyelamat, bukan tersangka.\n\nKalau melaporkan hambatan selalu berujung dimarahi, orang akan berhenti melapor — dan Anda akan selalu menjadi orang terakhir yang tahu. Kalimat sederhana seperti "terima kasih sudah memberi tahu sekarang" lebih berpengaruh pada keberhasilan proyek daripada aplikasi apa pun.',
              },
              {
                id: 'pmb-s4-b13',
                type: 'reflect',
                prompt:
                  'Tulis satu risiko nyata pada pekerjaan Anda: apa yang bisa terjadi, seberapa parah dampaknya, dan apa satu langkah kecil yang bisa Anda lakukan minggu ini untuk mengurangi dampak itu.',
                placeholder: 'Risiko: ... / Dampak: ... / Langkah minggu ini: ...',
              },
            ],
          },
        },
        {
          id: 'pmb-s4-quiz',
          type: 'quiz',
          title: 'Kuis: Risiko dan Perubahan',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmb-s4-q1',
                text: 'Pernyataan yang benar tentang risiko adalah...',
                points: 1,
                options: [
                  { id: 'pmb-s4-q1-o1', text: 'Risiko adalah hal buruk yang sudah terjadi hari ini' },
                  { id: 'pmb-s4-q1-o2', text: 'Risiko belum terjadi, sehingga masih bisa dicegah atau disiapkan rencananya' },
                  { id: 'pmb-s4-q1-o3', text: 'Risiko hanya ada pada proyek berbiaya besar' },
                  { id: 'pmb-s4-q1-o4', text: 'Risiko sebaiknya tidak dibicarakan supaya tim tidak cemas' },
                ],
                correctOptionId: 'pmb-s4-q1-o2',
              },
              {
                id: 'pmb-s4-q2',
                text: 'Menyewa tenda siaga untuk acara di lapangan terbuka termasuk cara menangani risiko dengan...',
                points: 1,
                options: [
                  { id: 'pmb-s4-q2-o1', text: 'Menghindari risiko' },
                  { id: 'pmb-s4-q2-o2', text: 'Menyiapkan rencana cadangan' },
                  { id: 'pmb-s4-q2-o3', text: 'Menerima risiko tanpa berbuat apa-apa' },
                  { id: 'pmb-s4-q2-o4', text: 'Memindahkan risiko ke peserta acara' },
                ],
                correctOptionId: 'pmb-s4-q2-o2',
              },
              {
                id: 'pmb-s4-q3',
                text: 'Bahaya utama perubahan yang disanggupi lewat pesan pribadi adalah...',
                points: 1,
                options: [
                  { id: 'pmb-s4-q3-o1', text: 'Klien merasa kurang dihargai' },
                  { id: 'pmb-s4-q3-o2', text: 'Pekerjaan bertambah tanpa tercatat, sehingga penyebab keterlambatan jadi tidak terlacak' },
                  { id: 'pmb-s4-q3-o3', text: 'Rapat mingguan jadi terlalu panjang' },
                  { id: 'pmb-s4-q3-o4', text: 'Tidak ada bahaya sama sekali' },
                ],
                correctOptionId: 'pmb-s4-q3-o2',
              },
              {
                id: 'pmb-s4-q4',
                text: 'Tim yang anggotanya takut melaporkan hambatan biasanya mengalami...',
                points: 1,
                options: [
                  { id: 'pmb-s4-q4-o1', text: 'Masalah yang baru terlihat saat sudah terlambat diperbaiki' },
                  { id: 'pmb-s4-q4-o2', text: 'Proyek yang lebih hemat biaya' },
                  { id: 'pmb-s4-q4-o3', text: 'Jumlah risiko yang benar-benar berkurang' },
                  { id: 'pmb-s4-q4-o4', text: 'Rapat yang lebih produktif' },
                ],
                correctOptionId: 'pmb-s4-q4-o1',
              },
            ],
          },
        },
        {
          id: 'pmb-s4-checklist',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmb-s4-c1', text: 'Saya bisa membedakan risiko dan masalah dengan contoh dari pekerjaan saya.' },
              { id: 'pmb-s4-c2', text: 'Saya sudah menulis daftar risiko sederhana dengan empat kolom.' },
              { id: 'pmb-s4-c3', text: 'Setiap risiko besar di daftar saya punya nama orang yang memantaunya.' },
              { id: 'pmb-s4-c4', text: 'Saya tahu tiga pertanyaan yang harus diajukan sebelum menerima perubahan.' },
              { id: 'pmb-s4-c5', text: 'Saya menanggapi kabar buruk dengan terima kasih lebih dulu, bukan dengan marah.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 1.5
    // -------------------------------------------------------------------
    {
      id: 'pmb-s5',
      title: 'Banyak Jalan Menjalankan Proyek',
      summary: 'Pengantar jujur: tidak ada satu cara terbaik untuk semua proyek.',
      activities: [
        {
          id: 'pmb-s5-lesson',
          type: 'lesson',
          title: 'Memilih Gaya Kerja, Bukan Mengikuti Tren',
          lesson: {
            blocks: [
              {
                id: 'pmb-s5-b1',
                type: 'text',
                title: 'Tidak ada juara umum',
                body: 'Kalau Anda pernah mendengar orang berdebat soal cara kerja mana yang paling benar, hentikan sebentar dan pikirkan ini: cara terbaik memasak nasi berbeda dari cara terbaik memasak rendang.\n\nBegitu juga proyek. Yang menentukan bukan cara mana yang paling modern, melainkan seberapa jelas hasil akhirnya dan seberapa mahal harga sebuah perubahan.',
              },
              {
                id: 'pmb-s5-b2',
                type: 'keypoint',
                title: 'Dua keluarga besar cara kerja',
                points: [
                  'Berurutan (Waterfall) — rencanakan semuanya dulu sampai rinci, baru kerjakan tahap demi tahap.',
                  'Bertahap dan sering dievaluasi (Agile) — kerjakan sepotong, tunjukkan hasilnya, perbaiki, lanjut ke potongan berikutnya.',
                  'Keduanya sama-sama merencanakan. Bedanya: yang satu merencanakan sekali dan dalam, yang satu merencanakan sering dan pendek.',
                  'Banyak organisasi memakai campuran keduanya, dan itu wajar.',
                ],
              },
              {
                id: 'pmb-s5-b3',
                type: 'text',
                title: 'Kapan berurutan lebih masuk akal',
                body: 'Cara berurutan cocok kalau hasil akhirnya sudah bisa digambar sejak awal dan mengubahnya di tengah jalan sangat mahal.\n\nMembangun gedung, mengurus izin resmi, menyelenggarakan pernikahan, menjalankan audit tahunan. Anda tidak bisa "mencoba dulu setengah gedung lalu lihat reaksi orang". Fondasi yang salah tidak bisa direvisi minggu depan.',
              },
              {
                id: 'pmb-s5-b4',
                type: 'check',
                question: 'Proyek mana yang paling masuk akal dikerjakan dengan cara berurutan?',
                options: [
                  { id: 'pmb-s5-b4-o1', text: 'Menyusun menu baru kedai kopi yang belum tahu selera pelanggannya' },
                  { id: 'pmb-s5-b4-o2', text: 'Membangun jembatan penyeberangan yang harus lolos izin dan uji kekuatan' },
                  { id: 'pmb-s5-b4-o3', text: 'Merapikan alur penanganan keluhan yang masih sering berubah' },
                  { id: 'pmb-s5-b4-o4', text: 'Mencoba format konten media sosial baru setiap minggu' },
                ],
                correctOptionId: 'pmb-s5-b4-o2',
                explanation:
                  'Jembatan punya hasil akhir yang sudah pasti, aturan izin yang urutannya baku, dan biaya kesalahan yang sangat besar. Tiga pilihan lainnya justru masih mencari bentuk — di sana mencoba sedikit demi sedikit lebih murah daripada merencanakan semuanya di depan.',
              },
              {
                id: 'pmb-s5-b5',
                type: 'text',
                title: 'Kapan bertahap lebih masuk akal',
                body: 'Cara bertahap cocok kalau kebutuhan belum jelas, selera orang bisa berubah, atau Anda perlu belajar dari kenyataan sebelum melangkah lebih jauh.\n\nMenyusun menu baru, merapikan alur pelayanan pelanggan, membuat program pelatihan yang belum pernah ada. Di situ, menunjukkan hasil kecil lebih cepat jauh lebih berharga daripada dokumen rencana yang tebal.',
              },
              {
                id: 'pmb-s5-b6',
                type: 'flashcard',
                front: 'Apa itu iterasi?',
                back: 'Satu putaran kerja pendek: rencanakan sedikit, kerjakan, tunjukkan hasilnya kepada orang yang akan memakainya, lalu perbaiki. Setelah itu putaran berikutnya dimulai dengan pelajaran yang baru didapat.',
              },
              {
                id: 'pmb-s5-b7',
                type: 'fillblank',
                sentence: 'Cara kerja berurutan paling cocok ketika biaya mengubah keputusan di tengah jalan ___.',
                answer: 'sangat mahal',
                options: ['sangat mahal', 'hampir gratis', 'tidak diketahui'],
              },
              {
                id: 'pmb-s5-b8',
                type: 'match',
                prompt: 'Pasangkan nama cara kerja dengan inti perbedaannya.',
                pairs: [
                  { id: 'pmb-s5-b8-p1', left: 'Waterfall', right: 'Selesaikan satu tahap sepenuhnya sebelum masuk tahap berikutnya' },
                  { id: 'pmb-s5-b8-p2', left: 'Scrum', right: 'Bekerja dalam putaran pendek satu sampai empat minggu dengan evaluasi rutin' },
                  { id: 'pmb-s5-b8-p3', left: 'Kanban', right: 'Alirkan pekerjaan satu per satu dan batasi yang dikerjakan bersamaan' },
                  { id: 'pmb-s5-b8-p4', left: 'Campuran', right: 'Rencana besar disusun berurutan, pelaksanaan harian dibuat mengalir' },
                ],
              },
              {
                id: 'pmb-s5-b9',
                type: 'keypoint',
                title: 'Empat pertanyaan penentu',
                points: [
                  'Seberapa jelas hasil akhirnya sekarang? Makin jelas, makin cocok berurutan.',
                  'Seberapa mahal mengubah keputusan di tengah jalan? Makin mahal, makin cocok berurutan.',
                  'Pekerjaannya datang sekali sebagai paket, atau mengalir terus setiap hari?',
                  'Seberapa sering orang yang akan memakai hasilnya bisa memberi masukan?',
                ],
              },
              {
                id: 'pmb-s5-b10',
                type: 'check',
                question: 'Manakah pernyataan yang paling jujur tentang Agile dan Waterfall?',
                options: [
                  { id: 'pmb-s5-b10-o1', text: 'Agile selalu lebih baik; Waterfall sudah usang dan sebaiknya ditinggalkan' },
                  { id: 'pmb-s5-b10-o2', text: 'Waterfall lebih serius; Agile hanya untuk tim yang tidak suka merencanakan' },
                  { id: 'pmb-s5-b10-o3', text: 'Keduanya alat. Yang tepat tergantung kejelasan hasil akhir dan biaya perubahan' },
                  { id: 'pmb-s5-b10-o4', text: 'Keduanya sama saja, hanya berbeda nama' },
                ],
                correctOptionId: 'pmb-s5-b10-o3',
                explanation:
                  'Menganggap salah satu selalu unggul adalah cara tercepat memilih alat yang salah. Waterfall tetap pilihan terbaik untuk pekerjaan berizin, berkontrak tetap, dan berhasil akhir pasti. Agile unggul saat kebutuhan masih berubah. Dan keduanya jelas tidak sama — irama kerja, cara memutuskan, dan bentuk laporannya berbeda.',
              },
              {
                id: 'pmb-s5-b11',
                type: 'text',
                title: 'Langkah berikutnya',
                body: 'Dua kursus lanjutan akan membedah keduanya secara utuh: "Waterfall: Rencana Dulu, Kerja Kemudian", lalu "Scrum & Kanban: Cara Kerja Lincah".\n\nSaran praktisnya: pelajari keduanya sebelum memilih. Orang yang hanya menguasai satu cara cenderung memaksakannya pada semua pekerjaan — dan itu justru sumber kekacauan yang paling sering saya temui.',
              },
              {
                id: 'pmb-s5-b12',
                type: 'reflect',
                prompt:
                  'Pikirkan satu pekerjaan Anda. Menurut empat pertanyaan penentu tadi, ia lebih condong ke cara berurutan atau bertahap? Tulis alasannya dalam dua kalimat.',
                placeholder: 'Pekerjaan: ... / Lebih cocok: ... / Alasannya: ...',
              },
            ],
          },
        },
        {
          id: 'pmb-s5-quiz',
          type: 'quiz',
          title: 'Kuis: Memilih Cara Kerja',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmb-s5-q1',
                text: 'Faktor paling menentukan dalam memilih cara kerja proyek adalah...',
                points: 1,
                options: [
                  { id: 'pmb-s5-q1-o1', text: 'Cara mana yang paling populer saat ini' },
                  { id: 'pmb-s5-q1-o2', text: 'Kejelasan hasil akhir dan biaya mengubah keputusan di tengah jalan' },
                  { id: 'pmb-s5-q1-o3', text: 'Jumlah anggota tim' },
                  { id: 'pmb-s5-q1-o4', text: 'Aplikasi yang sudah dibeli kantor' },
                ],
                correctOptionId: 'pmb-s5-q1-o2',
              },
              {
                id: 'pmb-s5-q2',
                text: 'Pernyataan yang KELIRU tentang cara kerja bertahap (Agile) adalah...',
                points: 1,
                options: [
                  { id: 'pmb-s5-q2-o1', text: 'Hasil ditunjukkan lebih sering supaya salah paham cepat ketahuan' },
                  { id: 'pmb-s5-q2-o2', text: 'Perencanaan dilakukan lebih sering dalam potongan pendek' },
                  { id: 'pmb-s5-q2-o3', text: 'Tidak perlu ada rencana maupun catatan sama sekali' },
                  { id: 'pmb-s5-q2-o4', text: 'Cocok ketika kebutuhan masih bisa berubah' },
                ],
                correctOptionId: 'pmb-s5-q2-o3',
              },
              {
                id: 'pmb-s5-q3',
                text: 'Membangun jembatan berizin resmi paling cocok dikerjakan dengan...',
                points: 1,
                options: [
                  { id: 'pmb-s5-q3-o1', text: 'Cara berurutan, karena hasil akhirnya pasti dan biaya kesalahan sangat besar' },
                  { id: 'pmb-s5-q3-o2', text: 'Putaran dua mingguan, karena lebih modern' },
                  { id: 'pmb-s5-q3-o3', text: 'Tanpa metode apa pun, cukup mengandalkan pengalaman' },
                  { id: 'pmb-s5-q3-o4', text: 'Kanban, karena pekerjaannya mengalir' },
                ],
                correctOptionId: 'pmb-s5-q3-o1',
              },
            ],
          },
        },
        {
          id: 'pmb-s5-checklist',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmb-s5-c1', text: 'Saya paham bahwa tidak ada satu cara kerja yang unggul untuk semua proyek.' },
              { id: 'pmb-s5-c2', text: 'Saya bisa menyebutkan empat pertanyaan penentu sebelum memilih cara kerja.' },
              { id: 'pmb-s5-c3', text: 'Saya bisa memberi satu contoh pekerjaan yang justru lebih cocok dikerjakan berurutan.' },
              { id: 'pmb-s5-c4', text: 'Saya tahu arti iterasi dan bisa menjelaskannya tanpa istilah asing.' },
              { id: 'pmb-s5-c5', text: 'Saya berniat mempelajari kedua cara kerja sebelum memutuskan yang dipakai tim saya.' },
            ],
          },
        },
      ],
    },
  ],
};

// ===========================================================================
// Instantiasi — salin dalam + tulis ulang semua id
// ===========================================================================

function reidLessonBlocks(blocks: LessonBlock[]): void {
  for (const block of blocks) {
    block.id = genId('blk');
    if (block.type === 'check') {
      const map: Record<string, string> = {};
      for (const opt of block.options) {
        const next = genId('opt');
        map[opt.id] = next;
        opt.id = next;
      }
      block.correctOptionId = map[block.correctOptionId] ?? block.correctOptionId;
    } else if (block.type === 'match') {
      for (const pair of block.pairs) pair.id = genId('pair');
    } else if (block.type === 'image') {
      block.attachment.id = genId('att');
    }
  }
}

function reidQuiz(quiz: QuizActivity): void {
  for (const q of quiz.questions || []) {
    q.id = genId('qq');
    const map: Record<string, string> = {};
    for (const opt of q.options || []) {
      const next = genId('opt');
      map[opt.id] = next;
      opt.id = next;
    }
    q.correctOptionId = map[q.correctOptionId] ?? q.correctOptionId;
  }
}

function reidChecklist(checklist: ChecklistActivity): void {
  for (const item of checklist.items || []) item.id = genId('cli');
}

function reidAssessment(assessment: AssessmentActivity): void {
  for (const q of assessment.questions || []) {
    q.id = genId('aq');
    for (const opt of q.options || []) opt.id = genId('opt');
  }
  for (const r of assessment.results || []) r.id = genId('res');
}

function reidActivity(activity: Activity): void {
  activity.id = genId('act');
  if (activity.lesson) reidLessonBlocks(activity.lesson.blocks || []);
  if (activity.quiz) reidQuiz(activity.quiz);
  if (activity.checklist) reidChecklist(activity.checklist);
  if (activity.assessment) reidAssessment(activity.assessment);
  if (activity.page) {
    for (const att of activity.page.attachments || []) att.id = genId('att');
  }
}

/** Katalog materi siap pakai. Jangan diubah saat berjalan — selalu lewat instantiatePmCourse(). */
export const PM_COURSES: Course[] = [PM_BASICS, PM_WATERFALL, PM_AGILE];

/**
 * Salin sebuah kursus contoh menjadi kursus baru yang siap disimpan.
 * Setiap id (kursus, topik, aktivitas, blok, pilihan, pasangan, item) diganti
 * dengan genId() supaya salinan yang terpasang tidak pernah bentrok dengan
 * salinan lain. PM_COURSES tidak pernah ikut berubah.
 */
export function instantiatePmCourse(id: string): Course {
  const source = PM_COURSES.find((c) => c.id === id) || PM_COURSES[0];
  const clone: Course = JSON.parse(JSON.stringify(source));
  clone.id = genId('course');
  delete clone.createdAt;
  delete clone.updatedAt;
  for (const section of clone.sections || []) {
    section.id = genId('sec');
    for (const activity of section.activities || []) reidActivity(activity);
  }
  return clone;
}
