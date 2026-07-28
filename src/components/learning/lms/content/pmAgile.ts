// ---------------------------------------------------------------------------
// MaxAgile LMS — Kursus: Scrum & Kanban, Cara Kerja Lincah.
//
// Ditulis dalam Bahasa Indonesia sehari-hari untuk siapa saja: guru, pemilik
// toko, panitia acara, staf kantor, pemilik katering. Tidak ada satu pun
// contoh dari dunia pemrograman. Semua analogi diambil dari renovasi rumah,
// dapur katering, restoran, laundry, sekolah, dan warung.
//
// Semua id di bawah ini SENGAJA berupa string tetap supaya katalog
// deterministik dan bisa dibandingkan antar versi.
//
// Tidak ada lampiran/gambar sama sekali — materi ini harus jalan tanpa
// unggahan dan tetap terbaca saat luring.
// ---------------------------------------------------------------------------

import type { Course } from '../types';

export const PM_AGILE: Course = {
  id: 'pm-agile',
  title: 'Scrum & Kanban: Cara Kerja Lincah',
  summary:
    'Cara mengerjakan sesuatu ketika kebutuhannya belum jelas di awal: kerjakan sepotong, perlihatkan, perbaiki, ulangi. Mengenal Scrum lewat cerita renovasi rumah dan dapur katering, lalu Kanban lewat alur dapur restoran dan laundry. Ditutup dengan panduan jujur memilih antara cara berurutan (Waterfall), Scrum, dan Kanban.',
  category: 'Manajemen Proyek',
  color: 'from-emerald-500 to-teal-400',
  sections: [
    // -------------------------------------------------------------------
    // 1 — Kenapa ada cara kerja lincah
    // -------------------------------------------------------------------
    {
      id: 'pma-s1',
      title: 'Kenapa Ada Cara Kerja Lincah',
      summary:
        'Ketika kebutuhan belum pasti, rencana panjang berubah jadi tebakan panjang. Mengenal iterasi: kerjakan sepotong, perlihatkan, perbaiki, ulangi.',
      activities: [
        {
          id: 'pma-s1-lesson',
          type: 'lesson',
          title: 'Rencana Panjang atau Umpan Balik Cepat',
          description: 'Pelajaran singkat, satu kartu sekali jalan.',
          lesson: {
            blocks: [
              {
                id: 'pma-s1-b1',
                type: 'text',
                title: 'Dua cara merenovasi rumah',
                body: 'Pak Hadi mau merenovasi rumahnya. Ada dua cara.\n\nCara pertama: gambar dulu semuanya sampai detail terkecil — dapur, kamar, teras, warna cat, posisi stopkontak — baru tukang mulai bekerja, dan tidak boleh diubah sampai selesai enam bulan lagi.\n\nCara kedua: kerjakan dapurnya dulu sampai benar-benar bisa dipakai. Pak Hadi memasak di sana dua minggu, lalu bilang "ternyata rak ini kerendahan". Baru setelah itu tukang lanjut ke kamar, dengan pelajaran dari dapur tadi.\n\nDua-duanya cara yang sah. Yang keliru adalah memakai cara pertama untuk pekerjaan yang belum jelas bentuk akhirnya.',
              },
              {
                id: 'pma-s1-b2',
                type: 'keypoint',
                title: 'Rencana panjang masih masuk akal kalau...',
                points: [
                  'Hasil akhirnya sudah dikenal betul dan jarang berubah — misalnya membangun pagar atau mencetak buku tahunan.',
                  'Mengubah di tengah jalan sangat mahal atau berbahaya, misalnya pondasi bangunan.',
                  'Ada aturan atau izin yang mengharuskan seluruh rencana disetujui lebih dulu.',
                  'Orang yang memesan sudah bisa menjelaskan keinginannya dengan lengkap sejak hari pertama.',
                ],
              },
              {
                id: 'pma-s1-b3',
                type: 'text',
                title: 'Kapan rencana panjang jadi tebakan panjang',
                body: 'Masalahnya, banyak pekerjaan tidak seperti itu. Panitia acara baru tahu acaranya kurang meriah setelah gladi bersih. Pemilik katering baru tahu menunya kurang cocok setelah pelanggan mencicipi.\n\nDi situasi seperti ini, rencana enam bulan bukan rencana — itu tebakan enam bulan yang ditulis rapi. Semakin lama kita menunda memperlihatkan hasil, semakin lama pula kita menyimpan kesalahan tanpa sadar.\n\nDari sinilah lahir cara kerja lincah, yang dalam bahasa asing disebut Agile: bekerja dalam potongan-potongan pendek supaya kesalahan ketahuan selagi masih murah diperbaiki.',
              },
              {
                id: 'pma-s1-b4',
                type: 'check',
                question: 'Pekerjaan mana yang paling cocok dikerjakan dengan cara lincah (potongan pendek, sering diperlihatkan)?',
                options: [
                  { id: 'pma-s1-b4-o1', text: 'Mencetak 500 undangan yang desainnya sudah disetujui dan ditandatangani' },
                  { id: 'pma-s1-b4-o2', text: 'Menyusun menu baru untuk kafe, sementara pemilik sendiri belum yakin selera pelanggannya' },
                  { id: 'pma-s1-b4-o3', text: 'Mengecor pondasi rumah sesuai gambar dari ahli bangunan' },
                  { id: 'pma-s1-b4-o4', text: 'Mengurus izin keramaian yang formulirnya sudah baku' },
                ],
                correctOptionId: 'pma-s1-b4-o2',
                explanation:
                  'Menu baru adalah pekerjaan yang jawabannya belum diketahui siapa pun, jadi mencoba tiga menu, meminta pelanggan mencicipi, lalu memperbaiki jauh lebih murah daripada langsung mencetak buku menu seratus halaman. Mencetak undangan dan mengurus izin sudah punya bentuk akhir yang pasti, jadi tidak ada yang perlu dicoba-coba. Mengecor pondasi bahkan berbahaya kalau diubah-ubah di tengah jalan — di situ rencana matang justru wajib.',
              },
              {
                id: 'pma-s1-b5',
                type: 'text',
                title: 'Apa itu iterasi',
                body: 'Kata yang akan sering muncul di kursus ini adalah iterasi. Artinya sederhana: satu putaran kerja pendek yang diulang-ulang.\n\nSatu putaran isinya empat langkah: kerjakan sepotong kecil sampai benar-benar jadi, perlihatkan kepada orang yang akan memakainya, dengarkan tanggapannya, lalu perbaiki di putaran berikutnya.\n\nBu Sri punya usaha katering. Alih-alih menyusun buku menu setahun penuh, ia menetapkan satu aturan: setiap dua minggu ia mencoba tiga menu baru untuk pelanggan langganan, mencatat mana yang habis dan mana yang tersisa, lalu menyesuaikan menu dua minggu berikutnya. Itulah iterasi.',
              },
              {
                id: 'pma-s1-b6',
                type: 'keypoint',
                title: 'Satu putaran iterasi selalu berisi',
                points: [
                  'Sepotong hasil yang benar-benar bisa dipakai atau dicoba — bukan setengah jadi.',
                  'Orang nyata yang melihat dan mencobanya, bukan hanya tim sendiri.',
                  'Tanggapan yang dicatat, bukan sekadar didengar lalu dilupakan.',
                  'Keputusan untuk putaran berikutnya: lanjut, perbaiki, atau hentikan.',
                ],
              },
              {
                id: 'pma-s1-b7',
                type: 'flashcard',
                front: 'Apa itu iterasi?',
                back: 'Satu putaran kerja pendek yang diulang: kerjakan sepotong sampai bisa dipakai, perlihatkan ke pemakainya, dengarkan tanggapan, perbaiki di putaran berikutnya. Bu Sri mencoba tiga menu baru tiap dua minggu — itu satu iterasi.',
              },
              {
                id: 'pma-s1-b8',
                type: 'text',
                title: 'Umpan balik mahal kalau datang terlambat',
                body: 'Umpan balik artinya tanggapan dari orang yang memakai hasil kerja kita. Nilainya berubah drastis tergantung kapan ia datang.\n\nKalau pelanggan bilang "kuahnya terlalu asin" setelah satu porsi percobaan, Bu Sri rugi satu panci. Kalau ia bilang itu setelah 400 porsi dikirim ke acara pernikahan, kerugiannya bukan cuma uang — reputasinya ikut jatuh.\n\nCara kerja lincah tidak membuat orang lebih pintar. Ia hanya memindahkan momen ketahuan salah ke titik yang jauh lebih murah.',
              },
              {
                id: 'pma-s1-b9',
                type: 'check',
                question:
                  'Tim panitia menyiapkan pameran sekolah tiga bulan lagi. Mereka baru akan memperlihatkan hasil kerja ke kepala sekolah seminggu sebelum hari H. Apa risiko terbesarnya?',
                options: [
                  { id: 'pma-s1-b9-o1', text: 'Tim jadi terlalu santai karena tidak ada tekanan' },
                  { id: 'pma-s1-b9-o2', text: 'Kalau arahnya keliru, baru ketahuan saat sudah tidak ada waktu dan uang untuk memperbaiki' },
                  { id: 'pma-s1-b9-o3', text: 'Kepala sekolah akan merasa tidak dihormati' },
                  { id: 'pma-s1-b9-o4', text: 'Tidak ada risiko, selama panitia bekerja dengan rajin' },
                ],
                correctOptionId: 'pma-s1-b9-o2',
                explanation:
                  'Menunda memperlihatkan hasil berarti menumpuk seluruh risiko salah arah di satu titik paling akhir, saat perbaikan paling mahal. Soal perasaan kepala sekolah memang mungkin terjadi, tapi itu akibat sampingan, bukan risiko utamanya. Dan rajin tidak menolong sama sekali kalau yang dikerjakan dengan rajin ternyata barang yang salah — justru makin rajin, makin banyak yang harus dibuang.',
              },
              {
                id: 'pma-s1-b10',
                type: 'fillblank',
                sentence: 'Inti cara kerja lincah adalah mempersingkat jarak antara mengerjakan sesuatu dan menerima ___ dari pemakainya.',
                answer: 'umpan balik',
                options: ['umpan balik', 'anggaran tambahan', 'laporan tertulis'],
              },
              {
                id: 'pma-s1-b11',
                type: 'text',
                title: 'Lincah bukan berarti tanpa rencana',
                body: 'Ada salah kaprah yang perlu diluruskan sejak awal. Cara kerja lincah sering disalahartikan sebagai "kerja saja dulu, nanti juga ketemu jalannya". Itu bukan lincah, itu berantakan.\n\nTim yang lincah tetap punya tujuan besar dan tetap punya daftar pekerjaan. Bedanya, rencana rincinya hanya dibuat untuk jarak dekat — satu atau dua putaran ke depan — sementara yang jauh dibiarkan kasar dulu karena memang belum ada informasinya.\n\nJujur saja: cara ini juga ada ongkosnya. Anda harus siap sering berkumpul, sering memperlihatkan hasil setengah matang, dan siap mendengar kritik. Tim yang anggotanya jarang bertemu atau pemesan yang tidak mau terlibat rutin akan kesulitan menjalankannya.',
              },
              {
                id: 'pma-s1-b12',
                type: 'match',
                prompt: 'Pasangkan istilah dengan arti sehari-harinya.',
                pairs: [
                  { id: 'pma-s1-b12-p1', left: 'Iterasi', right: 'Satu putaran kerja pendek yang diulang terus' },
                  { id: 'pma-s1-b12-p2', left: 'Umpan balik', right: 'Tanggapan dari orang yang memakai hasil kerja kita' },
                  { id: 'pma-s1-b12-p3', left: 'Cara kerja lincah (Agile)', right: 'Bekerja dalam potongan pendek supaya salah cepat ketahuan' },
                  { id: 'pma-s1-b12-p4', left: 'Potongan yang bisa dipakai', right: 'Hasil kecil yang sudah utuh, bukan pekerjaan setengah jadi' },
                ],
              },
              {
                id: 'pma-s1-b13',
                type: 'keypoint',
                title: 'Bawa pulang tiga hal ini',
                points: [
                  'Cara lincah dipakai saat kebutuhan belum pasti; kalau sudah pasti, rencana berurutan justru lebih hemat.',
                  'Iterasi = kerjakan sepotong, perlihatkan, dengarkan, perbaiki, ulangi.',
                  'Nilai umpan balik turun drastis kalau datang terlambat.',
                  'Lincah tetap butuh tujuan dan disiplin — yang dipendekkan itu rencana rincinya, bukan tanggung jawabnya.',
                ],
              },
              {
                id: 'pma-s1-b14',
                type: 'reflect',
                prompt:
                  'Ingat satu pekerjaan yang pernah Anda kerjakan lama lalu ternyata harus diulang banyak. Kalau Anda boleh memperlihatkan hasil separuh jadi lebih awal, kepada siapa Anda akan memperlihatkannya, dan kapan?',
                placeholder: 'Contoh: Menyusun rapor digital sekolah. Seharusnya saya perlihatkan ke wali kelas di minggu kedua, bukan di akhir semester ...',
              },
            ],
          },
        },
        {
          id: 'pma-s1-quiz',
          type: 'quiz',
          title: 'Kuis: Kenapa Ada Cara Kerja Lincah',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pma-s1-q1',
                text: 'Cara kerja lincah paling berguna ketika...',
                points: 1,
                options: [
                  { id: 'pma-s1-q1-o1', text: 'Semua kebutuhan sudah jelas dan tidak akan berubah' },
                  { id: 'pma-s1-q1-o2', text: 'Kebutuhan masih kabur dan umpan balik lebih berharga daripada rencana panjang' },
                  { id: 'pma-s1-q1-o3', text: 'Tim ingin mengerjakan sesuatu tanpa perlu menetapkan tujuan' },
                  { id: 'pma-s1-q1-o4', text: 'Anggaran sangat besar sehingga pemborosan tidak masalah' },
                ],
                correctOptionId: 'pma-s1-q1-o2',
              },
              {
                id: 'pma-s1-q2',
                text: 'Satu iterasi paling tepat digambarkan sebagai...',
                points: 1,
                options: [
                  { id: 'pma-s1-q2-o1', text: 'Rapat panjang untuk membahas seluruh rencana sampai selesai' },
                  { id: 'pma-s1-q2-o2', text: 'Putaran pendek: kerjakan sepotong, perlihatkan, dengarkan tanggapan, perbaiki' },
                  { id: 'pma-s1-q2-o3', text: 'Mengulang pekerjaan yang gagal sampai berhasil tanpa mengubah cara' },
                  { id: 'pma-s1-q2-o4', text: 'Membagi tim menjadi kelompok-kelompok kecil secara permanen' },
                ],
                correctOptionId: 'pma-s1-q2-o2',
              },
              {
                id: 'pma-s1-q3',
                text: 'Pernyataan mana yang paling jujur tentang cara kerja lincah?',
                points: 1,
                options: [
                  { id: 'pma-s1-q3-o1', text: 'Selalu lebih baik daripada cara berurutan, untuk semua jenis pekerjaan' },
                  { id: 'pma-s1-q3-o2', text: 'Membuat tim tidak perlu lagi punya tujuan atau daftar pekerjaan' },
                  { id: 'pma-s1-q3-o3', text: 'Butuh tim yang sering bertemu dan pemesan yang mau terlibat rutin — kalau tidak, sulit jalan' },
                  { id: 'pma-s1-q3-o4', text: 'Menghilangkan semua risiko karena pekerjaan dipecah kecil-kecil' },
                ],
                correctOptionId: 'pma-s1-q3-o3',
              },
              {
                id: 'pma-s1-q4',
                text: 'Kenapa memperlihatkan hasil lebih awal itu penting?',
                points: 1,
                options: [
                  { id: 'pma-s1-q4-o1', text: 'Supaya atasan melihat tim sibuk bekerja' },
                  { id: 'pma-s1-q4-o2', text: 'Supaya kesalahan arah ketahuan selagi memperbaikinya masih murah' },
                  { id: 'pma-s1-q4-o3', text: 'Supaya tim bisa berhenti bekerja lebih cepat' },
                  { id: 'pma-s1-q4-o4', text: 'Supaya jumlah rapat berkurang' },
                ],
                correctOptionId: 'pma-s1-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pma-s1-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pma-s1-c1', text: 'Saya bisa menjelaskan arti iterasi dengan contoh dari tempat kerja saya sendiri.' },
              { id: 'pma-s1-c2', text: 'Saya bisa menyebut satu pekerjaan yang cocok dikerjakan bertahap, dan satu yang justru butuh rencana matang di depan.' },
              { id: 'pma-s1-c3', text: 'Saya paham kenapa umpan balik yang datang terlambat jauh lebih mahal.' },
              { id: 'pma-s1-c4', text: 'Saya tahu bahwa cara lincah tetap butuh tujuan dan daftar pekerjaan, bukan asal jalan.' },
              { id: 'pma-s1-c5', text: 'Saya sudah menentukan satu orang yang akan saya mintai tanggapan lebih awal untuk pekerjaan saya sekarang.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 2 — Scrum: sprint, daftar pekerjaan, tiga peran
    // -------------------------------------------------------------------
    {
      id: 'pma-s2',
      title: 'Scrum: Putaran Kerja, Daftar Pekerjaan, dan Tiga Peran',
      summary:
        'Mengenal Scrum lewat dapur katering yang mengevaluasi menu tiap dua minggu: apa itu sprint, apa isi daftar pekerjaan, dan siapa mengerjakan apa.',
      activities: [
        {
          id: 'pma-s2-lesson',
          type: 'lesson',
          title: 'Isi Dapur Sebuah Tim Scrum',
          description: 'Pelajaran singkat, satu kartu sekali jalan.',
          lesson: {
            blocks: [
              {
                id: 'pma-s2-b1',
                type: 'text',
                title: 'Dapur katering Bu Sri',
                body: 'Bu Sri punya usaha katering dengan lima orang pekerja. Dulu ia bekerja mengikuti apa pun yang masuk hari itu: pesanan mendadak, ide menu baru dari keponakannya, permintaan diskon dari langganan. Semua dikerjakan bersamaan, dan tidak ada yang benar-benar selesai rapi.\n\nLalu ia mengubah satu hal saja. Ia menetapkan irama: setiap dua minggu, dapur mengerjakan satu daftar pekerjaan yang sudah disepakati di awal, lalu di hari terakhir semua orang duduk mencicipi hasilnya dan membahas apa yang perlu berubah.\n\nTanpa sadar, Bu Sri sedang menjalankan Scrum. Scrum adalah salah satu cara kerja lincah yang paling banyak dipakai, dan intinya memang cuma itu: memberi irama tetap pada pekerjaan yang isinya berubah-ubah.',
              },
              {
                id: 'pma-s2-b2',
                type: 'text',
                title: 'Putaran kerja tetap, atau sprint',
                body: 'Dua minggu yang dipakai Bu Sri itu namanya putaran kerja tetap. Dalam Scrum, istilah asingnya sprint — panjangnya biasanya satu sampai empat minggu, dan yang penting: panjangnya tidak berubah-ubah.\n\nKenapa harus tetap? Karena irama yang tetap membuat orang bisa memperkirakan. Setelah tiga atau empat putaran, tim mulai tahu "sebanyak ini yang biasanya muat dalam dua minggu". Kalau panjangnya diubah-ubah, perkiraan itu tidak pernah terbentuk.\n\nSatu putaran juga punya aturan yang sering dilanggar orang: isinya dikunci di awal. Kalau ada permintaan baru masuk di hari ketiga, permintaan itu antre untuk putaran berikutnya, bukan diselipkan diam-diam.',
              },
              {
                id: 'pma-s2-b3',
                type: 'keypoint',
                title: 'Aturan main sebuah putaran kerja',
                points: [
                  'Panjangnya tetap — pilih satu, misalnya dua minggu, lalu pertahankan.',
                  'Isinya disepakati di awal putaran dan tidak ditambah di tengah jalan.',
                  'Selalu berakhir dengan sesuatu yang bisa diperlihatkan, sekecil apa pun.',
                  'Kalau ternyata tidak selesai, yang dipotong isinya — bukan tanggalnya diundur.',
                ],
              },
              {
                id: 'pma-s2-b4',
                type: 'check',
                question:
                  'Putaran kerja dua minggu sudah berjalan tiga hari. Tiba-tiba ada permintaan baru yang cukup besar dari pelanggan. Apa yang paling sesuai cara Scrum?',
                options: [
                  { id: 'pma-s2-b4-o1', text: 'Langsung selipkan ke pekerjaan minggu ini, toh orangnya masih sama' },
                  { id: 'pma-s2-b4-o2', text: 'Catat di daftar pekerjaan, bahas prioritasnya, dan jadwalkan untuk putaran berikutnya' },
                  { id: 'pma-s2-b4-o3', text: 'Perpanjang putaran ini jadi tiga minggu supaya semuanya muat' },
                  { id: 'pma-s2-b4-o4', text: 'Tolak permintaannya karena tidak ada di rencana' },
                ],
                correctOptionId: 'pma-s2-b4-o2',
                explanation:
                  'Permintaan baru tidak ditolak, hanya diantrekan — itulah gunanya daftar pekerjaan, supaya tidak ada yang hilang tapi juga tidak ada yang menyerobot. Menyelipkan diam-diam membuat pekerjaan yang sudah dijanjikan jadi korban tanpa ada yang tahu. Memperpanjang putaran merusak irama, sehingga tim tidak pernah bisa memperkirakan kapasitasnya. Menolak mentah-mentah juga keliru: prioritas memang boleh berubah, tapi perubahannya dibahas terbuka, bukan diam-diam.',
              },
              {
                id: 'pma-s2-b5',
                type: 'text',
                title: 'Daftar pekerjaan yang diurutkan',
                body: 'Semua permintaan tadi ditampung di satu tempat: daftar pekerjaan, yang dalam Scrum disebut backlog.\n\nCiri pentingnya bukan panjangnya, melainkan urutannya. Daftar ini selalu terurut dari yang paling penting di atas sampai yang paling bisa ditunda di bawah. Tidak ada dua pekerjaan yang sama-sama nomor satu.\n\nDi dapur Bu Sri, daftar itu ditulis di papan tulis: "1. Perbaiki resep rendang yang keasinan. 2. Coba dua menu vegetarian. 3. Ganti wadah nasi kotak. 4. Bikin daftar harga baru." Ketika waktu ternyata cuma cukup untuk dua nomor teratas, tidak ada yang perlu berdebat mana yang dikerjakan.',
              },
              {
                id: 'pma-s2-b6',
                type: 'flashcard',
                front: 'Apa itu daftar pekerjaan (backlog)?',
                back: 'Satu daftar berisi semua yang mungkin dikerjakan, disusun berurutan dari paling penting ke paling bisa ditunda. Gunanya supaya tidak ada permintaan yang hilang, dan supaya saat waktu habis semua orang sudah tahu mana yang lebih dulu.',
              },
              {
                id: 'pma-s2-b7',
                type: 'keypoint',
                title: 'Ciri daftar pekerjaan yang sehat',
                points: [
                  'Satu daftar saja untuk satu tim — bukan tersebar di pesan pribadi dan catatan masing-masing.',
                  'Selalu terurut; kalau semuanya penting, artinya belum ada yang benar-benar diurutkan.',
                  'Isi yang di atas ditulis rinci, yang di bawah boleh masih kasar.',
                  'Bisa dilihat siapa saja yang berkepentingan, tidak disimpan di kepala satu orang.',
                ],
              },
              {
                id: 'pma-s2-b8',
                type: 'text',
                title: 'Tiga peran, dalam bahasa awam',
                body: 'Scrum hanya mengenal tiga peran, dan tiga-tiganya bisa dijelaskan tanpa istilah asing.\n\nPertama, penentu prioritas — istilah asingnya pemilik produk atau product owner. Dialah satu-satunya orang yang berhak menyusun urutan daftar pekerjaan. Di dapur Bu Sri, ya Bu Sri sendiri. Tugasnya bukan mengatur cara memasak, tapi memutuskan menu mana yang lebih dulu.\n\nKedua, tim pengerja. Merekalah yang benar-benar mengerjakan dan yang paling berhak menentukan caranya. Kalau juru masak bilang rendang butuh empat jam, itu bukan untuk ditawar jadi dua jam.\n\nKetiga, fasilitator — istilah asingnya scrum master. Ini yang paling sering disalahpahami. Fasilitator bukan bos, bukan atasan tim, dan bukan orang yang membagi tugas. Tugasnya menjaga cara kerja tetap berjalan: memastikan pertemuan tidak molor, dan membereskan hambatan yang tim sendiri tidak bisa singkirkan — misalnya kompor rusak yang harus diurus ke pemilik gedung.',
              },
              {
                id: 'pma-s2-b9',
                type: 'match',
                prompt: 'Pasangkan peran dengan tugas utamanya.',
                pairs: [
                  { id: 'pma-s2-b9-p1', left: 'Penentu prioritas (pemilik produk)', right: 'Memutuskan urutan: apa yang dikerjakan lebih dulu' },
                  { id: 'pma-s2-b9-p2', left: 'Tim pengerja', right: 'Mengerjakan dan menentukan cara mengerjakannya' },
                  { id: 'pma-s2-b9-p3', left: 'Fasilitator (scrum master)', right: 'Menjaga cara kerja berjalan dan menyingkirkan hambatan' },
                  { id: 'pma-s2-b9-p4', left: 'Daftar pekerjaan (backlog)', right: 'Tempat menampung semua permintaan, tersusun berurutan' },
                ],
              },
              {
                id: 'pma-s2-b10',
                type: 'check',
                question: 'Manakah yang BUKAN tugas seorang fasilitator (scrum master)?',
                options: [
                  { id: 'pma-s2-b10-o1', text: 'Memastikan pertemuan harian tidak molor jadi satu jam' },
                  { id: 'pma-s2-b10-o2', text: 'Membagi tugas ke setiap anggota tim dan menilai kinerja mereka' },
                  { id: 'pma-s2-b10-o3', text: 'Mengurus hambatan dari luar yang tidak bisa dibereskan tim sendiri' },
                  { id: 'pma-s2-b10-o4', text: 'Mengingatkan bahwa isi putaran kerja tidak boleh ditambah di tengah jalan' },
                ],
                correctOptionId: 'pma-s2-b10-o2',
                explanation:
                  'Membagi tugas dan menilai kinerja adalah pekerjaan seorang atasan, dan fasilitator memang bukan atasan — dalam Scrum, tim sendiri yang membagi pekerjaan di antara mereka. Tiga pilihan lainnya semuanya benar: fasilitator menjaga pertemuan tetap singkat, membereskan hambatan dari luar, dan mengingatkan aturan main. Kalau seorang fasilitator mulai membagi tugas dan menilai orang, tim biasanya berhenti bicara jujur di pertemuan.',
              },
              {
                id: 'pma-s2-b11',
                type: 'fillblank',
                sentence: 'Yang berhak menentukan urutan daftar pekerjaan adalah ___.',
                answer: 'penentu prioritas',
                options: ['penentu prioritas', 'fasilitator', 'anggota tim yang paling senior'],
              },
              {
                id: 'pma-s2-b12',
                type: 'text',
                title: 'Yang sering membuat Scrum gagal',
                body: 'Scrum terlihat sederhana di atas kertas, tapi ada tiga hal yang berulang kali membuatnya tidak jalan.\n\nPertama, satu orang merangkap dua peran yang bertabrakan — misalnya atasan yang sekaligus jadi fasilitator. Akibatnya tidak ada yang berani mengaku pekerjaannya tersendat.\n\nKedua, putaran kerja terus-menerus disobek. Kalau setiap minggu ada saja yang diselipkan "khusus kali ini", sebenarnya tim tidak sedang berputar, hanya sibuk.\n\nKetiga, penentu prioritas yang tidak pernah hadir. Kalau orang yang berhak memutuskan hanya muncul di akhir dan langsung tidak puas, seluruh putaran jadi sia-sia.\n\nJadi Scrum bukan mantra. Ia hanya berguna kalau tiga hal ini benar-benar dijaga.',
              },
              {
                id: 'pma-s2-b13',
                type: 'keypoint',
                title: 'Ringkasan',
                points: [
                  'Sprint atau putaran kerja = periode tetap 1 sampai 4 minggu; isinya dikunci di awal.',
                  'Daftar pekerjaan (backlog) = satu daftar terurut dari paling penting ke paling bisa ditunda.',
                  'Penentu prioritas memutuskan apa; tim pengerja memutuskan bagaimana.',
                  'Fasilitator menjaga proses dan menyingkirkan hambatan — bukan bos, bukan pembagi tugas.',
                ],
              },
              {
                id: 'pma-s2-b14',
                type: 'reflect',
                prompt:
                  'Kalau tim Anda mulai memakai putaran kerja, berapa lama satu putaran yang masuk akal untuk pekerjaan Anda — satu, dua, atau empat minggu? Dan siapa satu orang yang paling pantas jadi penentu prioritas?',
                placeholder: 'Panjang putaran: ... karena ... / Penentu prioritas: ... karena dialah yang ...',
              },
            ],
          },
        },
        {
          id: 'pma-s2-quiz',
          type: 'quiz',
          title: 'Kuis: Dasar Scrum',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pma-s2-q1',
                text: 'Kenapa panjang sebuah putaran kerja (sprint) sebaiknya tetap?',
                points: 1,
                options: [
                  { id: 'pma-s2-q1-o1', text: 'Supaya tim bisa memperkirakan berapa banyak pekerjaan yang muat dalam satu putaran' },
                  { id: 'pma-s2-q1-o2', text: 'Supaya semua pekerjaan pasti selesai tepat waktu' },
                  { id: 'pma-s2-q1-o3', text: 'Karena aturan Scrum melarang perubahan apa pun' },
                  { id: 'pma-s2-q1-o4', text: 'Supaya tim tidak perlu lagi mengadakan pertemuan' },
                ],
                correctOptionId: 'pma-s2-q1-o1',
              },
              {
                id: 'pma-s2-q2',
                text: 'Ciri paling penting dari sebuah daftar pekerjaan (backlog) adalah...',
                points: 1,
                options: [
                  { id: 'pma-s2-q2-o1', text: 'Sepanjang mungkin supaya tidak ada ide yang terlewat' },
                  { id: 'pma-s2-q2-o2', text: 'Tersusun berurutan dari paling penting ke paling bisa ditunda' },
                  { id: 'pma-s2-q2-o3', text: 'Hanya boleh dilihat oleh fasilitator' },
                  { id: 'pma-s2-q2-o4', text: 'Semua isinya harus ditulis serinci mungkin sejak awal' },
                ],
                correctOptionId: 'pma-s2-q2-o2',
              },
              {
                id: 'pma-s2-q3',
                text: 'Seorang fasilitator (scrum master) paling tepat digambarkan sebagai...',
                points: 1,
                options: [
                  { id: 'pma-s2-q3-o1', text: 'Atasan tim yang membagi tugas dan menilai kinerja' },
                  { id: 'pma-s2-q3-o2', text: 'Anggota tim paling ahli yang mengerjakan bagian tersulit' },
                  { id: 'pma-s2-q3-o3', text: 'Penjaga cara kerja yang membereskan hambatan supaya tim bisa jalan' },
                  { id: 'pma-s2-q3-o4', text: 'Wakil pelanggan yang menentukan pekerjaan mana yang lebih dulu' },
                ],
                correctOptionId: 'pma-s2-q3-o3',
              },
              {
                id: 'pma-s2-q4',
                text: 'Pekerjaan satu putaran ternyata tidak akan selesai tepat waktu. Sikap yang paling sesuai Scrum?',
                points: 1,
                options: [
                  { id: 'pma-s2-q4-o1', text: 'Undur tanggal akhir putaran sampai semua pekerjaan beres' },
                  { id: 'pma-s2-q4-o2', text: 'Kurangi isi putaran, tetap akhiri di tanggal yang sama, dan bahas sisanya' },
                  { id: 'pma-s2-q4-o3', text: 'Kerjakan semua dengan lembur tanpa memberi tahu siapa pun' },
                  { id: 'pma-s2-q4-o4', text: 'Batalkan seluruh putaran dan mulai dari nol' },
                ],
                correctOptionId: 'pma-s2-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pma-s2-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pma-s2-c1', text: 'Saya bisa menjelaskan apa itu putaran kerja (sprint) tanpa memakai istilah asing.' },
              { id: 'pma-s2-c2', text: 'Saya sudah menuliskan daftar pekerjaan saya dalam satu daftar yang benar-benar terurut.' },
              { id: 'pma-s2-c3', text: 'Saya bisa membedakan tugas penentu prioritas, tim pengerja, dan fasilitator.' },
              { id: 'pma-s2-c4', text: 'Saya paham kenapa fasilitator bukan atasan dan tidak membagi tugas.' },
              { id: 'pma-s2-c5', text: 'Saya tahu apa yang harus dilakukan kalau ada permintaan baru masuk di tengah putaran.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 3 — Empat ritual Scrum
    // -------------------------------------------------------------------
    {
      id: 'pma-s3',
      title: 'Empat Pertemuan yang Menjaga Irama',
      summary:
        'Perencanaan, obrolan harian singkat, peninjauan hasil, dan evaluasi cara kerja — apa tujuan masing-masing, dan kapan pertemuan itu berubah jadi buang waktu.',
      activities: [
        {
          id: 'pma-s3-lesson',
          type: 'lesson',
          title: 'Empat Pertemuan, Empat Tujuan Berbeda',
          description: 'Pelajaran singkat, satu kartu sekali jalan.',
          lesson: {
            blocks: [
              {
                id: 'pma-s3-b1',
                type: 'text',
                title: 'Bukan menambah rapat, tapi mengganti rapat',
                body: 'Begitu mendengar ada empat pertemuan rutin, banyak orang langsung menghela napas: sudah cukup banyak rapat di tempat kerja.\n\nMaksudnya justru sebaliknya. Empat pertemuan ini pendek, punya tujuan yang sangat spesifik, dan dimaksudkan untuk menggantikan rapat-rapat dadakan yang panjang dan tidak jelas ujungnya.\n\nMari lihat satu per satu, dengan cerita renovasi rumah Pak Hadi yang kini dikerjakan bertahap oleh tim tukang.',
              },
              {
                id: 'pma-s3-b2',
                type: 'text',
                title: 'Satu — Perencanaan putaran',
                body: 'Di hari pertama setiap putaran, tim berkumpul untuk menjawab dua pertanyaan: apa yang mau dicapai dalam dua minggu ini, dan pekerjaan mana saja dari daftar yang akan diambil.\n\nPak Hadi sebagai penentu prioritas membuka daftar: dapur dulu, baru kamar mandi. Tim tukang lalu melihat kenyataannya: keramik belum datang, satu tukang izin tiga hari. Setelah dihitung bersama, mereka sepakat putaran ini isinya dapur saja, kamar mandi menyusul.\n\nYang penting: bukan Pak Hadi yang menentukan berapa banyak yang muat. Ia menentukan urutannya, tim yang menentukan kapasitasnya. Pertemuan ini selesai ketika ada satu kalimat tujuan yang semua orang setuju.',
              },
              {
                id: 'pma-s3-b3',
                type: 'check',
                question: 'Dalam perencanaan putaran, siapa yang paling berhak menentukan berapa banyak pekerjaan yang sanggup diselesaikan?',
                options: [
                  { id: 'pma-s3-b3-o1', text: 'Penentu prioritas, karena dialah yang paling paham kebutuhan' },
                  { id: 'pma-s3-b3-o2', text: 'Tim pengerja, karena merekalah yang tahu kenyataan di lapangan' },
                  { id: 'pma-s3-b3-o3', text: 'Fasilitator, karena dia yang memimpin pertemuan' },
                  { id: 'pma-s3-b3-o4', text: 'Atasan tertinggi, karena dia yang menanggung biayanya' },
                ],
                correctOptionId: 'pma-s3-b3-o2',
                explanation:
                  'Penentu prioritas memutuskan urutan, tapi hanya tim yang tahu keramik belum datang dan ada anggota yang izin. Kalau kapasitas ditentukan orang lain, angkanya jadi target yang dipaksakan, bukan perkiraan — dan tim akan berhenti jujur. Fasilitator hanya memandu jalannya pertemuan, bukan mengisi keputusannya. Atasan yang memaksakan jumlah biasanya justru mendapat pekerjaan yang tampak selesai padahal belum rapi.',
              },
              {
                id: 'pma-s3-b4',
                type: 'text',
                title: 'Dua — Obrolan harian singkat',
                body: 'Setiap pagi, tim berdiri sebentar — biasanya benar-benar berdiri, supaya tidak betah berlama-lama. Karena itu istilah asingnya stand-up. Lamanya cukup sepuluh sampai lima belas menit.\n\nIsinya tiga hal per orang: kemarin saya menyelesaikan apa, hari ini saya mengerjakan apa, dan ada yang menghambat saya atau tidak.\n\nTujuannya sering disalahpahami. Ini bukan laporan kepada atasan. Ini saling memberi kabar antar sesama anggota tim, supaya tukang listrik tahu bahwa tukang keramik baru selesai sore nanti, dan supaya hambatan ketahuan hari ini juga — bukan minggu depan.',
              },
              {
                id: 'pma-s3-b5',
                type: 'keypoint',
                title: 'Tanda obrolan harian sudah rusak',
                points: [
                  'Semua orang bicara menghadap satu orang saja, seperti menyetorkan laporan.',
                  'Molor jadi setengah jam karena satu masalah dibahas tuntas di situ juga.',
                  'Tidak ada yang pernah menyebut hambatan, padahal pekerjaan jelas tersendat.',
                  'Dipakai untuk membagi tugas baru, padahal itu urusan perencanaan putaran.',
                ],
              },
              {
                id: 'pma-s3-b6',
                type: 'flashcard',
                front: 'Apa tujuan obrolan harian singkat (stand-up)?',
                back: 'Saling memberi kabar antar anggota tim supaya semua tahu posisi pekerjaan hari ini, dan supaya hambatan muncul ke permukaan segera. Bukan laporan ke atasan, dan bukan tempat menyelesaikan masalah — masalah yang muncul dibahas setelahnya oleh orang yang berkepentingan saja.',
              },
              {
                id: 'pma-s3-b7',
                type: 'text',
                title: 'Tiga — Peninjauan hasil',
                body: 'Di akhir putaran, tim memperlihatkan hasil nyata kepada orang yang memesan dan orang yang akan memakainya. Istilah asingnya review.\n\nKuncinya kata "nyata". Bukan slide, bukan cerita, bukan janji. Pak Hadi diajak masuk ke dapur yang sudah bisa dipakai memasak. Ia membuka lemari, menyalakan kompor, dan berkata "raknya kerendahan". Kalimat itu tidak akan pernah muncul kalau ia hanya melihat gambar.\n\nDari peninjauan ini keluar tanggapan yang langsung masuk ke daftar pekerjaan untuk putaran berikutnya. Jadi peninjauan hasil membahas APA yang dibuat.',
              },
              {
                id: 'pma-s3-b8',
                type: 'check',
                question: 'Tim membahas bahwa pengiriman bahan selalu telat dan bikin pekerjaan tersendat. Pertemuan mana yang paling tepat untuk membahas itu?',
                options: [
                  { id: 'pma-s3-b8-o1', text: 'Peninjauan hasil, karena semua pihak sedang berkumpul' },
                  { id: 'pma-s3-b8-o2', text: 'Evaluasi cara kerja (retrospektif), karena yang dibahas adalah cara kerjanya' },
                  { id: 'pma-s3-b8-o3', text: 'Obrolan harian, karena harus segera diselesaikan pagi itu juga' },
                  { id: 'pma-s3-b8-o4', text: 'Perencanaan putaran, karena berkaitan dengan jadwal' },
                ],
                correctOptionId: 'pma-s3-b8-o2',
                explanation:
                  'Pengiriman yang selalu telat adalah masalah cara kerja, bukan masalah hasil — dan evaluasi cara kerja memang tempatnya. Peninjauan hasil dipakai untuk membahas APA yang dibuat, bukan bagaimana tim bekerja. Obrolan harian boleh menyebut hambatannya sebagai kabar, tapi terlalu singkat untuk mencari akar masalah dan solusinya. Perencanaan putaran memakai hasil evaluasi ini, tapi bukan tempat menggalinya.',
              },
              {
                id: 'pma-s3-b9',
                type: 'text',
                title: 'Empat — Evaluasi cara kerja',
                body: 'Pertemuan terakhir, dan yang paling sering dilewati padahal paling berharga. Istilah asingnya retrospektif, artinya melihat ke belakang.\n\nDi sini tim tidak membahas hasil, melainkan cara mereka bekerja. Tiga pertanyaan sederhana sudah cukup: apa yang berjalan baik dan patut diteruskan, apa yang mengganggu, dan satu perubahan apa yang akan kita coba di putaran berikutnya.\n\nAturan pentingnya: ini bukan tempat mencari siapa yang salah. Begitu pertemuan berubah jadi ajang saling menyalahkan, orang berhenti bicara jujur, dan satu-satunya alat perbaikan yang dimiliki tim ikut mati. Bahasnya sistem dan kebiasaan, bukan orang.',
              },
              {
                id: 'pma-s3-b10',
                type: 'keypoint',
                title: 'Cara membuat evaluasi terasa aman',
                points: [
                  'Bahas kejadian dan kebiasaan, bukan nama orang: "bahan sering telat", bukan "si A lambat".',
                  'Pilih hanya SATU perubahan untuk dicoba — daftar sepuluh perbaikan biasanya tidak ada yang jalan.',
                  'Tulis perubahan itu dan cek hasilnya di evaluasi berikutnya.',
                  'Kalau atasan hadir dan mendominasi, kejujuran biasanya langsung hilang.',
                ],
              },
              {
                id: 'pma-s3-b11',
                type: 'fillblank',
                sentence: 'Peninjauan hasil membahas apa yang dibuat, sedangkan evaluasi cara kerja membahas ___.',
                answer: 'bagaimana tim bekerja',
                options: ['bagaimana tim bekerja', 'siapa yang paling rajin', 'berapa biaya yang terpakai'],
              },
              {
                id: 'pma-s3-b12',
                type: 'match',
                prompt: 'Pasangkan setiap pertemuan dengan tujuannya.',
                pairs: [
                  { id: 'pma-s3-b12-p1', left: 'Perencanaan putaran', right: 'Menyepakati tujuan dan isi pekerjaan untuk periode ini' },
                  { id: 'pma-s3-b12-p2', left: 'Obrolan harian singkat', right: 'Saling memberi kabar dan memunculkan hambatan hari itu' },
                  { id: 'pma-s3-b12-p3', left: 'Peninjauan hasil', right: 'Memperlihatkan hasil nyata dan menampung tanggapan pemakai' },
                  { id: 'pma-s3-b12-p4', left: 'Evaluasi cara kerja', right: 'Memperbaiki kebiasaan kerja tim untuk putaran berikutnya' },
                ],
              },
              {
                id: 'pma-s3-b13',
                type: 'keypoint',
                title: 'Ringkasan',
                points: [
                  'Empat pertemuan ini pendek dan menggantikan rapat dadakan, bukan menambahnya.',
                  'Perencanaan: urutan dari penentu prioritas, kapasitas dari tim.',
                  'Obrolan harian: kabar antar sesama tim, bukan setoran laporan ke atasan.',
                  'Peninjauan membahas hasil; evaluasi membahas cara kerja. Jangan dicampur.',
                ],
              },
              {
                id: 'pma-s3-b14',
                type: 'reflect',
                prompt:
                  'Dari empat pertemuan tadi, mana yang paling tidak ada di tempat kerja Anda sekarang? Tulis satu langkah kecil untuk mencobanya minggu depan — cukup lima belas menit saja.',
                placeholder: 'Yang belum ada: ... / Langkah kecil: hari ..., pukul ..., bersama ...',
              },
            ],
          },
        },
        {
          id: 'pma-s3-quiz',
          type: 'quiz',
          title: 'Kuis: Empat Pertemuan Scrum',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pma-s3-q1',
                text: 'Tujuan utama obrolan harian singkat adalah...',
                points: 1,
                options: [
                  { id: 'pma-s3-q1-o1', text: 'Melaporkan kemajuan kepada atasan setiap pagi' },
                  { id: 'pma-s3-q1-o2', text: 'Saling memberi kabar antar anggota tim dan memunculkan hambatan hari itu' },
                  { id: 'pma-s3-q1-o3', text: 'Membagi tugas baru untuk hari itu' },
                  { id: 'pma-s3-q1-o4', text: 'Menyelesaikan semua masalah teknis sampai tuntas' },
                ],
                correctOptionId: 'pma-s3-q1-o2',
              },
              {
                id: 'pma-s3-q2',
                text: 'Apa beda peninjauan hasil dan evaluasi cara kerja?',
                points: 1,
                options: [
                  { id: 'pma-s3-q2-o1', text: 'Peninjauan membahas hasil yang dibuat; evaluasi membahas cara tim bekerja' },
                  { id: 'pma-s3-q2-o2', text: 'Peninjauan untuk tim; evaluasi untuk pelanggan' },
                  { id: 'pma-s3-q2-o3', text: 'Peninjauan dilakukan harian; evaluasi dilakukan mingguan' },
                  { id: 'pma-s3-q2-o4', text: 'Tidak ada bedanya, hanya istilahnya yang berbeda' },
                ],
                correctOptionId: 'pma-s3-q2-o1',
              },
              {
                id: 'pma-s3-q3',
                text: 'Dalam peninjauan hasil, yang paling penting diperlihatkan adalah...',
                points: 1,
                options: [
                  { id: 'pma-s3-q3-o1', text: 'Daftar semua pekerjaan yang sudah dikerjakan tim' },
                  { id: 'pma-s3-q3-o2', text: 'Hasil nyata yang bisa dicoba langsung oleh pemakainya' },
                  { id: 'pma-s3-q3-o3', text: 'Rencana lengkap untuk enam bulan ke depan' },
                  { id: 'pma-s3-q3-o4', text: 'Laporan jam kerja setiap anggota tim' },
                ],
                correctOptionId: 'pma-s3-q3-o2',
              },
              {
                id: 'pma-s3-q4',
                text: 'Evaluasi cara kerja paling mudah rusak kalau...',
                points: 1,
                options: [
                  { id: 'pma-s3-q4-o1', text: 'Hanya menghasilkan satu perubahan untuk dicoba' },
                  { id: 'pma-s3-q4-o2', text: 'Berubah menjadi ajang mencari siapa yang salah' },
                  { id: 'pma-s3-q4-o3', text: 'Dilakukan setiap akhir putaran secara rutin' },
                  { id: 'pma-s3-q4-o4', text: 'Membahas kebiasaan kerja dan bukan hasil pekerjaan' },
                ],
                correctOptionId: 'pma-s3-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pma-s3-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pma-s3-c1', text: 'Saya bisa menyebutkan tujuan masing-masing dari empat pertemuan itu tanpa membaca catatan.' },
              { id: 'pma-s3-c2', text: 'Saya paham obrolan harian bukan laporan ke atasan, melainkan kabar antar sesama tim.' },
              { id: 'pma-s3-c3', text: 'Saya bisa membedakan mana pembahasan yang masuk peninjauan hasil dan mana yang masuk evaluasi cara kerja.' },
              { id: 'pma-s3-c4', text: 'Saya tahu satu aturan yang membuat evaluasi terasa aman untuk berkata jujur.' },
              { id: 'pma-s3-c5', text: 'Saya sudah memilih satu pertemuan yang akan saya coba jalankan minggu depan.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 4 — Kanban
    // -------------------------------------------------------------------
    {
      id: 'pma-s4',
      title: 'Kanban: Papan, Alur, dan Batas Pekerjaan Bersamaan',
      summary:
        'Cara mengatur pekerjaan yang datang sewaktu-waktu, seperti dapur restoran atau laundry. Kenapa membatasi jumlah pekerjaan justru membuat semuanya lebih cepat selesai.',
      activities: [
        {
          id: 'pma-s4-lesson',
          type: 'lesson',
          title: 'Papan yang Membuat Pekerjaan Terlihat',
          description: 'Pelajaran singkat, satu kartu sekali jalan.',
          lesson: {
            blocks: [
              {
                id: 'pma-s4-b1',
                type: 'text',
                title: 'Laundry Pak Yanto di hari Senin',
                body: 'Laundry Pak Yanto menerima cucian sepanjang hari. Tidak ada jadwal: pelanggan datang kapan saja.\n\nSetiap Senin, semua mesin penuh, meja setrika penuh, dan Pak Yanto sendiri bolak-balik antara mencuci, menjemur, menyetrika, dan melayani orang di depan. Semua pekerjaan sudah dimulai. Tapi kalau ada yang bertanya "cucian saya sudah selesai belum?", jawabannya selalu sama: "sedang dikerjakan, Bu."\n\nSemuanya sedang dikerjakan. Tidak ada yang selesai. Inilah masalah yang dijawab oleh Kanban.',
              },
              {
                id: 'pma-s4-b2',
                type: 'text',
                title: 'Papan dengan kolom',
                body: 'Kanban dimulai dari satu hal yang sangat sederhana: membuat pekerjaan terlihat.\n\nPak Yanto memasang papan tulis dengan tiga kolom: Menunggu, Dikerjakan, dan Selesai. Setiap cucian yang masuk ditulis di satu kertas tempel, lalu ditempel di kolom Menunggu. Begitu mulai dicuci, kertasnya pindah ke Dikerjakan. Begitu siap diambil, pindah ke Selesai.\n\nDi hari pertama saja, papan itu sudah bercerita: ada tujuh belas kertas di kolom Dikerjakan, dan cuma dua di Selesai. Selama ini kekacauan itu ada, cuma tidak kelihatan.',
              },
              {
                id: 'pma-s4-b3',
                type: 'keypoint',
                title: 'Cara membuat papan pertama Anda',
                points: [
                  'Mulai dari tiga kolom saja: Menunggu, Dikerjakan, Selesai.',
                  'Satu kertas tempel untuk satu pekerjaan — tulis nama pemesan dan apa yang diminta.',
                  'Jangan mengubah cara kerja dulu; tempelkan saja pekerjaan yang sudah ada apa adanya.',
                  'Taruh papan di tempat yang dilewati semua orang, bukan di ruangan tertutup.',
                ],
              },
              {
                id: 'pma-s4-b4',
                type: 'check',
                question: 'Apa manfaat pertama yang langsung didapat dari sekadar menempel semua pekerjaan di papan?',
                options: [
                  { id: 'pma-s4-b4-o1', text: 'Pekerjaan otomatis jadi lebih cepat selesai' },
                  { id: 'pma-s4-b4-o2', text: 'Semua orang akhirnya melihat berapa banyak pekerjaan yang sedang berjalan bersamaan' },
                  { id: 'pma-s4-b4-o3', text: 'Jumlah pesanan yang masuk jadi berkurang' },
                  { id: 'pma-s4-b4-o4', text: 'Tidak perlu lagi berbicara dengan pelanggan' },
                ],
                correctOptionId: 'pma-s4-b4-o2',
                explanation:
                  'Papan tidak menyihir apa pun; manfaat pertamanya murni membuat yang tak terlihat jadi terlihat. Kecepatan baru datang belakangan, setelah tim bereaksi terhadap apa yang mereka lihat. Jumlah pesanan yang masuk juga tidak berubah — yang berubah hanya cara mengaturnya. Dan papan justru mempermudah bicara dengan pelanggan, karena Anda bisa menunjukkan posisi pekerjaannya.',
              },
              {
                id: 'pma-s4-b5',
                type: 'text',
                title: 'Kenapa banyak sekaligus justru lambat',
                body: 'Bayangkan Pak Yanto mengerjakan sepuluh cucian sekaligus, masing-masing sedikit-sedikit. Setelah sehari penuh, sepuluh-sepuluhnya baru setengah jalan, dan tidak ada satu pun pelanggan yang bisa mengambil cuciannya.\n\nSekarang bayangkan ia mengerjakan tiga saja sampai benar-benar selesai. Sore itu tiga pelanggan pulang membawa cucian. Total kerja yang dilakukan sama, tapi hasil yang sampai ke tangan orang jauh berbeda.\n\nDitambah lagi, setiap kali berpindah pekerjaan ada ongkosnya: mengingat kembali sampai di mana tadi, mencari lagi barangnya, mengulang persiapan. Semakin banyak yang dikerjakan bersamaan, semakin besar bagian waktu yang habis untuk berpindah, bukan untuk bekerja.',
              },
              {
                id: 'pma-s4-b6',
                type: 'keypoint',
                title: 'Ongkos tersembunyi dari mengerjakan banyak hal sekaligus',
                points: [
                  'Waktu habis untuk berpindah dan mengingat kembali, bukan untuk mengerjakan.',
                  'Tidak ada yang selesai, sehingga tidak ada yang bisa diperlihatkan atau ditagih.',
                  'Kesalahan lebih lama ketahuan karena tidak ada pekerjaan yang sampai ke tangan pemakainya.',
                  'Orang merasa sangat sibuk padahal hasilnya sedikit — dan itu melelahkan secara batin.',
                ],
              },
              {
                id: 'pma-s4-b7',
                type: 'flashcard',
                front: 'Apa itu batas pekerjaan bersamaan (WIP limit)?',
                back: 'Aturan yang membatasi berapa banyak pekerjaan boleh berada di kolom Dikerjakan pada saat yang sama. Misalnya maksimal tiga. Kalau sudah tiga, tidak boleh menarik pekerjaan baru sampai ada satu yang benar-benar selesai. WIP singkatan dari work in progress, artinya pekerjaan yang sedang berjalan.',
              },
              {
                id: 'pma-s4-b8',
                type: 'text',
                title: 'Menentukan batas, dan apa yang dilakukan saat mentok',
                body: 'Tidak ada angka ajaib. Cara paling praktis: hitung berapa orang yang mengerjakan, lalu mulai dari angka itu atau sedikit di bawahnya. Tiga orang di dapur, batas tiga pesanan. Jalankan seminggu, lalu sesuaikan.\n\nBagian yang paling terasa aneh di awal adalah ini: ketika batas sudah tercapai, Anda tidak boleh memulai pekerjaan baru meskipun sedang menganggur.\n\nYang benar dilakukan adalah pergi membantu pekerjaan yang macet. Kalau meja setrika menumpuk sementara mesin cuci kosong, orang yang menganggur ikut menyetrika, bukan mulai mencuci cucian baru. Terasa tidak efisien untuk satu orang, tapi seluruh alur jadi lebih cepat — dan yang diukur memang alurnya, bukan kesibukan per orang.',
              },
              {
                id: 'pma-s4-b9',
                type: 'check',
                question:
                  'Batas kolom Dikerjakan adalah tiga, dan sekarang sudah terisi tiga. Seorang anggota tim baru saja selesai dan menganggur. Apa yang paling tepat ia lakukan?',
                options: [
                  { id: 'pma-s4-b9-o1', text: 'Menarik satu pekerjaan baru dari kolom Menunggu supaya tidak menganggur' },
                  { id: 'pma-s4-b9-o2', text: 'Membantu menyelesaikan salah satu pekerjaan yang sedang macet di kolom Dikerjakan' },
                  { id: 'pma-s4-b9-o3', text: 'Menaikkan batas menjadi empat supaya lebih fleksibel' },
                  { id: 'pma-s4-b9-o4', text: 'Menunggu sampai ada perintah dari atasan' },
                ],
                correctOptionId: 'pma-s4-b9-o2',
                explanation:
                  'Batas itu memang dibuat supaya orang yang menganggur pergi membantu yang macet — di situlah percepatan sesungguhnya terjadi. Menarik pekerjaan baru terasa produktif tapi hanya menambah tumpukan yang belum selesai, persis masalah yang mau dihindari. Menaikkan batas setiap kali terasa sesak sama saja dengan tidak punya batas. Menunggu perintah membuang waktu, padahal papan sudah menunjukkan dengan jelas di mana penyumbatannya.',
              },
              {
                id: 'pma-s4-b10',
                type: 'fillblank',
                sentence: 'Kalau kolom Dikerjakan sudah penuh sesuai batas, langkah yang benar adalah ___ pekerjaan yang macet, bukan memulai yang baru.',
                answer: 'membantu menyelesaikan',
                options: ['membantu menyelesaikan', 'menambah batas untuk', 'mencatat keluhan tentang'],
              },
              {
                id: 'pma-s4-b11',
                type: 'text',
                title: 'Kanban tidak punya putaran kerja',
                body: 'Perbedaan besar dengan Scrum: Kanban tidak mengenal sprint. Tidak ada tanggal mulai dan tanggal akhir bersama. Pekerjaan mengalir terus, ditarik satu per satu begitu ada ruang kosong.\n\nKarena itu ukurannya pun berbeda. Scrum bertanya "berapa banyak yang selesai dalam dua minggu ini". Kanban bertanya "berapa lama satu pekerjaan biasanya dari masuk sampai selesai" — dari kertas ditempel di Menunggu sampai pindah ke Selesai. Pak Yanto bisa menjanjikan "cucian jadi dalam dua hari" karena ia mencatat angka itu, bukan menebak.\n\nInilah kenapa Kanban cocok untuk pekerjaan yang datangnya tidak bisa dijadwalkan: keluhan pelanggan, permintaan perbaikan, pesanan yang masuk kapan saja.',
              },
              {
                id: 'pma-s4-b12',
                type: 'match',
                prompt: 'Pasangkan istilah Kanban dengan artinya sehari-hari.',
                pairs: [
                  { id: 'pma-s4-b12-p1', left: 'Papan Kanban', right: 'Papan berkolom yang membuat semua pekerjaan terlihat' },
                  { id: 'pma-s4-b12-p2', left: 'Batas pekerjaan bersamaan', right: 'Aturan berapa banyak boleh dikerjakan serentak' },
                  { id: 'pma-s4-b12-p3', left: 'Penyumbatan', right: 'Kolom yang menumpuk karena langkah berikutnya kewalahan' },
                  { id: 'pma-s4-b12-p4', left: 'Waktu tempuh', right: 'Lama satu pekerjaan dari mulai masuk sampai benar-benar selesai' },
                ],
              },
              {
                id: 'pma-s4-b13',
                type: 'keypoint',
                title: 'Ringkasan',
                points: [
                  'Langkah pertama Kanban: buat pekerjaan terlihat di papan, apa adanya.',
                  'Batas pekerjaan bersamaan mempercepat karena memaksa menyelesaikan sebelum memulai.',
                  'Saat mentok, bantu yang macet — jangan tarik pekerjaan baru.',
                  'Kanban tidak berputar dalam sprint; ukurannya waktu tempuh satu pekerjaan.',
                ],
              },
              {
                id: 'pma-s4-b14',
                type: 'reflect',
                prompt:
                  'Hitung sekarang: berapa banyak pekerjaan yang sedang Anda kerjakan bersamaan? Tulis daftarnya, lalu tandai tiga yang paling mendekati selesai. Berapa batas yang masuk akal untuk Anda?',
                placeholder: 'Sedang berjalan: 1) ... 2) ... 3) ... / Paling dekat selesai: ... / Batas yang saya coba: ...',
              },
            ],
          },
        },
        {
          id: 'pma-s4-quiz',
          type: 'quiz',
          title: 'Kuis: Kanban',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pma-s4-q1',
                text: 'Kenapa membatasi jumlah pekerjaan yang dikerjakan bersamaan justru mempercepat hasil?',
                points: 1,
                options: [
                  { id: 'pma-s4-q1-o1', text: 'Karena tim jadi bekerja lebih keras' },
                  { id: 'pma-s4-q1-o2', text: 'Karena waktu tidak habis untuk berpindah-pindah, dan pekerjaan benar-benar sampai ke tangan pemakainya' },
                  { id: 'pma-s4-q1-o3', text: 'Karena pekerjaan yang masuk otomatis berkurang' },
                  { id: 'pma-s4-q1-o4', text: 'Karena sebagian pekerjaan bisa dibatalkan' },
                ],
                correctOptionId: 'pma-s4-q1-o2',
              },
              {
                id: 'pma-s4-q2',
                text: 'Kolom Dikerjakan sudah penuh sesuai batas. Apa yang sebaiknya dilakukan?',
                points: 1,
                options: [
                  { id: 'pma-s4-q2-o1', text: 'Bantu selesaikan pekerjaan yang sedang macet' },
                  { id: 'pma-s4-q2-o2', text: 'Tarik satu pekerjaan baru supaya tidak ada yang menganggur' },
                  { id: 'pma-s4-q2-o3', text: 'Naikkan batasnya setiap kali terasa sesak' },
                  { id: 'pma-s4-q2-o4', text: 'Pindahkan pekerjaan setengah jadi ke kolom Selesai' },
                ],
                correctOptionId: 'pma-s4-q2-o1',
              },
              {
                id: 'pma-s4-q3',
                text: 'Ukuran keberhasilan yang paling khas dipakai dalam Kanban adalah...',
                points: 1,
                options: [
                  { id: 'pma-s4-q3-o1', text: 'Berapa banyak pekerjaan yang dimulai setiap minggu' },
                  { id: 'pma-s4-q3-o2', text: 'Berapa lama satu pekerjaan dari masuk sampai benar-benar selesai' },
                  { id: 'pma-s4-q3-o3', text: 'Berapa jam setiap orang bekerja per hari' },
                  { id: 'pma-s4-q3-o4', text: 'Berapa banyak kolom yang ada di papan' },
                ],
                correctOptionId: 'pma-s4-q3-o2',
              },
              {
                id: 'pma-s4-q4',
                text: 'Langkah pertama menerapkan Kanban di tempat kerja yang berantakan adalah...',
                points: 1,
                options: [
                  { id: 'pma-s4-q4-o1', text: 'Mengubah seluruh cara kerja tim lebih dulu' },
                  { id: 'pma-s4-q4-o2', text: 'Menempelkan semua pekerjaan yang sedang berjalan di papan, apa adanya' },
                  { id: 'pma-s4-q4-o3', text: 'Membeli aplikasi papan digital berbayar' },
                  { id: 'pma-s4-q4-o4', text: 'Menetapkan putaran kerja dua minggu' },
                ],
                correctOptionId: 'pma-s4-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pma-s4-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pma-s4-c1', text: 'Saya sudah membuat atau membayangkan papan tiga kolom untuk pekerjaan saya sendiri.' },
              { id: 'pma-s4-c2', text: 'Saya bisa menjelaskan ke rekan kerja kenapa membatasi pekerjaan bersamaan justru mempercepat.' },
              { id: 'pma-s4-c3', text: 'Saya sudah menetapkan satu angka batas untuk kolom Dikerjakan, dan siap menyesuaikannya.' },
              { id: 'pma-s4-c4', text: 'Saya tahu bahwa saat batas tercapai, yang benar adalah membantu yang macet, bukan menarik pekerjaan baru.' },
              { id: 'pma-s4-c5', text: 'Saya paham Kanban tidak memakai putaran kerja, dan ukurannya adalah waktu tempuh satu pekerjaan.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 5 — Memilih cara kerja
    // -------------------------------------------------------------------
    {
      id: 'pma-s5',
      title: 'Memilih: Berurutan, Scrum, atau Kanban',
      summary:
        'Panduan jujur memilih cara kerja untuk situasi nyata sehari-hari, termasuk mengakui kapan cara berurutan (Waterfall) memang yang paling tepat.',
      activities: [
        {
          id: 'pma-s5-lesson',
          type: 'lesson',
          title: 'Tidak Ada Cara yang Paling Unggul',
          description: 'Pelajaran singkat, satu kartu sekali jalan.',
          lesson: {
            blocks: [
              {
                id: 'pma-s5-b1',
                type: 'text',
                title: 'Alat, bukan agama',
                body: 'Kalau Anda banyak membaca tentang cara kerja lincah, Anda akan sering menemukan nada seperti ini: cara lama itu kuno, cara baru itu modern dan lebih baik.\n\nItu tidak jujur. Ketiga cara yang kita bahas — berurutan, Scrum, dan Kanban — adalah alat. Palu bukan alat yang lebih unggul daripada obeng; ia hanya cocok untuk pekerjaan yang berbeda.\n\nDi bagian penutup ini kita akan belajar memilih, dan sama pentingnya, belajar mengakui kapan cara yang sedang populer justru bukan jawabannya.',
              },
              {
                id: 'pma-s5-b2',
                type: 'keypoint',
                title: 'Tiga pertanyaan penyaring',
                points: [
                  'Seberapa jelas hasil akhirnya sekarang? Kalau sudah sangat jelas dan disepakati, cara berurutan cukup.',
                  'Seberapa mahal mengubah di tengah jalan? Kalau sangat mahal atau berbahaya, rencanakan matang di depan.',
                  'Pekerjaannya datang berkelompok atau menetes sewaktu-waktu? Berkelompok cocok untuk sprint; menetes cocok untuk alur Kanban.',
                  'Bonus: apakah pemesan bersedia terlibat rutin? Kalau tidak, Scrum akan sulit dijalankan.',
                ],
              },
              {
                id: 'pma-s5-b3',
                type: 'text',
                title: 'Kapan cara berurutan lebih tepat',
                body: 'Cara berurutan — istilah asingnya Waterfall, air terjun, karena tahapannya turun satu arah — berarti merencanakan lengkap di depan lalu mengerjakan tahap demi tahap: rencana, siapkan, kerjakan, periksa, serahkan.\n\nCara ini justru yang terbaik ketika hasil akhirnya sudah pasti dan perubahan mahal. Contohnya: membangun gedung dengan izin yang sudah disahkan, mencetak buku tahunan sekolah, atau menyiapkan katering pernikahan yang tanggalnya mati dan menunya sudah dipilih keluarga.\n\nMemaksakan Scrum di situ malah merepotkan. Tidak masuk akal bertanya kepada pengantin setiap dua minggu apakah menunya masih cocok, sementara bahan sudah dipesan dan undangan sudah dicetak.',
              },
              {
                id: 'pma-s5-b4',
                type: 'check',
                question: 'Panitia menyiapkan wisuda sekolah: tanggal sudah mati, susunan acara sudah baku dari tahun ke tahun, vendor sudah dikontrak. Cara kerja mana yang paling tepat?',
                options: [
                  { id: 'pma-s5-b4-o1', text: 'Scrum, supaya panitia bisa mengevaluasi acara setiap dua minggu' },
                  { id: 'pma-s5-b4-o2', text: 'Kanban, supaya pekerjaan mengalir bebas' },
                  { id: 'pma-s5-b4-o3', text: 'Cara berurutan, karena hasil akhirnya sudah pasti dan tahapannya jelas' },
                  { id: 'pma-s5-b4-o4', text: 'Campuran ketiganya sekaligus supaya lebih lengkap' },
                ],
                correctOptionId: 'pma-s5-b4-o3',
                explanation:
                  'Kalau hasil akhirnya sudah pasti dan urutannya jelas, rencana berurutan adalah yang paling hemat — tidak ada yang perlu dicoba-coba. Scrum di sini hanya menambah pertemuan tanpa ada keputusan baru yang perlu diambil. Kanban tidak salah tapi kurang pas, karena pekerjaan wisuda datang serentak dengan tenggat bersama, bukan menetes. Mencampur ketiganya sekaligus biasanya menghasilkan aturan yang saling bertabrakan dan tidak ada yang benar-benar dijalankan.',
              },
              {
                id: 'pma-s5-b5',
                type: 'text',
                title: 'Kapan Scrum lebih tepat',
                body: 'Scrum cocok ketika ada tim tetap yang bekerja bersama, hasil akhirnya belum jelas benar, dan pekerjaan datang dalam kelompok besar yang bisa dipecah bertahap.\n\nContoh: sekolah membuat program ekstrakurikuler baru; tidak ada yang tahu pasti mana yang akan diminati murid. Atau sebuah toko membenahi cara melayani pesanan daring, yang harus dicoba dan diperbaiki berkali-kali.\n\nSyaratnya jujur: butuh tim yang cukup tetap, butuh penentu prioritas yang benar-benar hadir, dan butuh kesediaan berkumpul rutin. Kalau anggota tim berganti-ganti setiap minggu atau pemesan hanya muncul di akhir, Scrum akan terasa seperti beban tanpa manfaat.',
              },
              {
                id: 'pma-s5-b6',
                type: 'text',
                title: 'Kapan Kanban lebih tepat',
                body: 'Kanban cocok ketika pekerjaan datang sewaktu-waktu dan tidak bisa dikelompokkan ke dalam putaran.\n\nContoh paling jelas: menangani keluhan pelanggan. Anda tidak bisa berkata "keluhan minggu ini kita kunci, keluhan baru masuk putaran depan". Contoh lain: bagian perbaikan dan perawatan, layanan administrasi sekolah, atau meja depan sebuah klinik.\n\nKanban juga pilihan yang lebih lembut untuk memulai. Ia tidak menuntut peran baru, tidak menuntut jadwal pertemuan baru, dan bisa dipasang di atas cara kerja yang sudah ada. Kalau tim Anda alergi terhadap perubahan besar, mulailah dari papan.',
              },
              {
                id: 'pma-s5-b7',
                type: 'match',
                prompt: 'Pasangkan situasi berikut dengan cara kerja yang paling cocok.',
                pairs: [
                  {
                    id: 'pma-s5-b7-p1',
                    left: 'Katering pernikahan, tanggal mati, menu sudah dipilih keluarga',
                    right: 'Cara berurutan (Waterfall) — hasil akhir sudah pasti sejak awal',
                  },
                  {
                    id: 'pma-s5-b7-p2',
                    left: 'Menyusun program ekstrakurikuler baru yang belum tentu diminati murid',
                    right: 'Scrum — coba bertahap dalam putaran kerja tetap',
                  },
                  {
                    id: 'pma-s5-b7-p3',
                    left: 'Menangani keluhan pelanggan yang masuk kapan saja',
                    right: 'Kanban — pekerjaan mengalir terus, dibatasi jumlahnya',
                  },
                  {
                    id: 'pma-s5-b7-p4',
                    left: 'Membangun ruang kelas sesuai gambar dan izin yang sudah disahkan',
                    right: 'Cara berurutan (Waterfall) — mengubah di tengah jalan sangat mahal',
                  },
                ],
              },
              {
                id: 'pma-s5-b8',
                type: 'keypoint',
                title: 'Ongkos jujur masing-masing cara',
                points: [
                  'Berurutan: hemat pertemuan, tapi kesalahan arah baru ketahuan di akhir saat sudah mahal.',
                  'Scrum: cepat belajar dari umpan balik, tapi menuntut banyak pertemuan dan tim yang tetap.',
                  'Kanban: ringan dan mudah dimulai, tapi tanpa disiplin batas, papannya cuma jadi hiasan.',
                  'Semua cara gagal kalau tidak ada yang jujur soal masalah yang sedang terjadi.',
                ],
              },
              {
                id: 'pma-s5-b9',
                type: 'check',
                question:
                  'Sebuah tim memakai papan Kanban lengkap, tapi kolom Dikerjakan selalu berisi lima belas kertas dan batasnya tidak pernah ditegakkan. Apa yang sebenarnya terjadi?',
                options: [
                  { id: 'pma-s5-b9-o1', text: 'Mereka sudah menjalankan Kanban dengan benar, hanya perlu papan yang lebih besar' },
                  { id: 'pma-s5-b9-o2', text: 'Mereka hanya memindahkan kekacauan ke papan, karena bagian yang mengubah hasil justru batasnya' },
                  { id: 'pma-s5-b9-o3', text: 'Mereka seharusnya langsung pindah ke Scrum' },
                  { id: 'pma-s5-b9-o4', text: 'Masalahnya ada pada jumlah kolom yang kurang banyak' },
                ],
                correctOptionId: 'pma-s5-b9-o2',
                explanation:
                  'Papan hanya membuat pekerjaan terlihat; yang benar-benar mengubah kecepatan adalah batas pekerjaan bersamaan yang ditegakkan. Papan lebih besar justru memperbanyak tempat menumpuk. Pindah ke Scrum tidak menolong, karena kebiasaan memulai tanpa menyelesaikan akan terbawa ke sana juga. Menambah kolom hanya memperinci gambaran kekacauan, bukan mengurangi kekacauannya.',
              },
              {
                id: 'pma-s5-b10',
                type: 'flashcard',
                front: 'Apa beda paling mendasar Scrum dan Kanban?',
                back: 'Scrum berirama: pekerjaan dikelompokkan ke dalam putaran tetap yang isinya dikunci di awal, cocok untuk tim yang butuh ritme. Kanban mengalir: tidak ada putaran, pekerjaan ditarik satu per satu begitu ada ruang, cocok untuk pekerjaan yang datang sewaktu-waktu seperti keluhan pelanggan.',
              },
              {
                id: 'pma-s5-b11',
                type: 'fillblank',
                sentence: 'Kalau hasil akhir sudah pasti dan mengubahnya sangat mahal, cara kerja yang paling hemat biasanya adalah cara ___.',
                answer: 'berurutan',
                options: ['berurutan', 'Scrum', 'Kanban'],
              },
              {
                id: 'pma-s5-b12',
                type: 'text',
                title: 'Boleh dicampur, tapi secukupnya',
                body: 'Di dunia nyata, banyak tim mencampur. Sekolah bisa memakai cara berurutan untuk penerimaan murid baru yang tanggalnya mati, sekaligus memakai papan Kanban untuk keluhan orang tua yang masuk setiap hari.\n\nAda juga tim yang tetap berputar dua mingguan seperti Scrum tapi memakai batas pekerjaan bersamaan seperti Kanban. Itu sah dan sering berhasil.\n\nYang berbahaya adalah mencampur setengah-setengah untuk menghindari bagian yang tidak enak: mengaku memakai Scrum tapi isinya diselipi terus, atau memasang papan Kanban tapi batasnya tidak pernah ditegakkan. Ambil satu cara, jalankan bagian yang tidak enaknya juga selama beberapa putaran, baru sesuaikan.',
              },
              {
                id: 'pma-s5-b13',
                type: 'keypoint',
                title: 'Ringkasan seluruh kursus',
                points: [
                  'Iterasi = kerjakan sepotong, perlihatkan, dengarkan, perbaiki, ulangi.',
                  'Scrum memberi irama: putaran tetap, daftar pekerjaan terurut, tiga peran, empat pertemuan.',
                  'Kanban memberi aliran: papan terlihat, batas pekerjaan bersamaan, ukur waktu tempuh.',
                  'Cara berurutan tetap yang terbaik saat hasil akhir pasti dan perubahan mahal.',
                  'Pilih berdasarkan situasi, bukan berdasarkan istilah mana yang sedang populer.',
                ],
              },
              {
                id: 'pma-s5-b14',
                type: 'reflect',
                prompt:
                  'Ambil satu pekerjaan yang sedang Anda urus sekarang. Cara mana yang paling cocok — berurutan, Scrum, atau Kanban? Tulis alasannya dalam dua kalimat, lalu tulis satu langkah pertama yang bisa Anda lakukan minggu ini.',
                placeholder: 'Pekerjaan: ... / Cara yang saya pilih: ... karena ... / Langkah pertama minggu ini: ...',
              },
            ],
          },
        },
        {
          id: 'pma-s5-quiz',
          type: 'quiz',
          title: 'Kuis: Memilih Cara Kerja',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pma-s5-q1',
                text: 'Cara berurutan (Waterfall) paling tepat dipakai ketika...',
                points: 1,
                options: [
                  { id: 'pma-s5-q1-o1', text: 'Hasil akhirnya sudah pasti dan mengubah di tengah jalan sangat mahal' },
                  { id: 'pma-s5-q1-o2', text: 'Kebutuhan masih kabur dan sering berubah' },
                  { id: 'pma-s5-q1-o3', text: 'Pekerjaan datang menetes sewaktu-waktu' },
                  { id: 'pma-s5-q1-o4', text: 'Tim ingin menerima umpan balik setiap dua minggu' },
                ],
                correctOptionId: 'pma-s5-q1-o1',
              },
              {
                id: 'pma-s5-q2',
                text: 'Bagian pengaduan sebuah klinik menerima keluhan pasien kapan saja tanpa jadwal. Cara kerja paling cocok?',
                points: 1,
                options: [
                  { id: 'pma-s5-q2-o1', text: 'Cara berurutan, supaya semua keluhan direncanakan di awal tahun' },
                  { id: 'pma-s5-q2-o2', text: 'Scrum, dengan mengunci daftar keluhan setiap dua minggu' },
                  { id: 'pma-s5-q2-o3', text: 'Kanban, karena pekerjaan mengalir terus dan tidak bisa dikelompokkan ke dalam putaran' },
                  { id: 'pma-s5-q2-o4', text: 'Tidak perlu cara apa pun, cukup diselesaikan sesuai urutan datang' },
                ],
                correctOptionId: 'pma-s5-q2-o3',
              },
              {
                id: 'pma-s5-q3',
                text: 'Pernyataan mana yang paling jujur tentang ketiga cara kerja ini?',
                points: 1,
                options: [
                  { id: 'pma-s5-q3-o1', text: 'Scrum selalu lebih unggul karena lebih modern' },
                  { id: 'pma-s5-q3-o2', text: 'Masing-masing punya ongkos: berurutan telat sadar salah, Scrum menuntut banyak pertemuan, Kanban sia-sia tanpa disiplin batas' },
                  { id: 'pma-s5-q3-o3', text: 'Cara berurutan sudah tidak layak dipakai lagi di zaman sekarang' },
                  { id: 'pma-s5-q3-o4', text: 'Kanban cocok untuk semua jenis pekerjaan tanpa kecuali' },
                ],
                correctOptionId: 'pma-s5-q3-o2',
              },
              {
                id: 'pma-s5-q4',
                text: 'Sebuah tim mengaku memakai Scrum, tapi setiap minggu ada pekerjaan baru yang diselipkan ke tengah putaran. Kesimpulan yang paling tepat?',
                points: 1,
                options: [
                  { id: 'pma-s5-q4-o1', text: 'Itu wajar, karena Scrum memang menerima perubahan kapan saja' },
                  { id: 'pma-s5-q4-o2', text: 'Mereka mengambil nama Scrum tanpa bagian yang membuatnya bekerja, sehingga irama dan perkiraan tidak pernah terbentuk' },
                  { id: 'pma-s5-q4-o3', text: 'Mereka sebenarnya sedang menjalankan cara berurutan' },
                  { id: 'pma-s5-q4-o4', text: 'Masalahnya hanya pada panjang putaran yang kurang lama' },
                ],
                correctOptionId: 'pma-s5-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pma-s5-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pma-s5-c1', text: 'Saya bisa menyebut satu situasi di tempat saya yang justru lebih tepat dikerjakan dengan cara berurutan.' },
              { id: 'pma-s5-c2', text: 'Saya bisa menjelaskan beda Scrum dan Kanban dalam satu kalimat: berirama versus mengalir.' },
              { id: 'pma-s5-c3', text: 'Saya sudah memilih satu cara kerja untuk satu pekerjaan nyata saya, beserta alasannya.' },
              { id: 'pma-s5-c4', text: 'Saya paham ongkos dan kelemahan dari cara yang saya pilih, bukan hanya kelebihannya.' },
              { id: 'pma-s5-c5', text: 'Saya sudah menuliskan satu langkah pertama yang bisa saya jalankan minggu ini.' },
            ],
          },
        },
      ],
    },
  ],
};
