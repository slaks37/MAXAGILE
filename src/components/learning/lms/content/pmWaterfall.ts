// ---------------------------------------------------------------------------
// MaxAgile LMS — Kursus: Waterfall (cara kerja berurutan).
//
// Ditulis dalam Bahasa Indonesia sehari-hari untuk siapa saja: guru, pemilik
// toko, panitia acara, staf kantor. Tidak ada contoh khusus programmer dan
// tidak ada kode. Semua analogi berangkat dari satu gambar besar yang dikenal
// semua orang: MEMBANGUN RUMAH.
//
// Semua id di bawah ini SENGAJA berupa string tetap supaya katalog
// deterministik dan bisa diuji. Tidak ada lampiran/gambar sama sekali —
// materi ini harus jalan tanpa unggahan apa pun.
// ---------------------------------------------------------------------------

import type { Course } from '../types';

export const PM_WATERFALL: Course = {
  id: 'pm-waterfall',
  title: 'Waterfall: Rencana Dulu, Kerja Kemudian',
  summary:
    'Cara kerja berurutan yang dipakai orang membangun rumah, mengurus izin, dan menggelar pernikahan. Anda akan belajar tahapannya dalam bahasa sehari-hari, cara menyusun rencana yang benar-benar bisa dipakai, kapan cara ini justru pilihan terbaik, dan kapan sebaiknya tidak dipakai.',
  category: 'Manajemen Proyek',
  color: 'from-violet-500 to-indigo-400',
  sections: [
    // -------------------------------------------------------------------
    // 1 — Cara kerjanya
    // -------------------------------------------------------------------
    {
      id: 'pmw-s1',
      title: 'Air Terjun: Kenapa Urutannya Tidak Boleh Dibalik',
      summary:
        'Apa itu cara kerja berurutan, dari mana nama "air terjun" berasal, dan apa yang terjadi di antara dua tahap.',
      activities: [
        {
          id: 'pmw-s1-lesson',
          type: 'lesson',
          title: 'Fondasi Dulu, Cat Belakangan',
          description: 'Pelajaran singkat, satu kartu sekali jalan.',
          lesson: {
            blocks: [
              {
                id: 'pmw-s1-b1',
                type: 'text',
                title: 'Mulai dari halaman rumah tetangga',
                body: 'Pak Darto sedang membangun rumah. Datanglah tukang, lalu bekerja dengan urutan yang sudah semua orang tahu: gali tanah, cor fondasi, tegakkan tiang, pasang dinding, naikkan atap, baru mengecat.\n\nTidak ada tukang yang mengecat dinding sebelum dindingnya berdiri. Tidak ada yang memasang atap sebelum tiangnya ada.\n\nUrutan itu bukan tradisi atau kebiasaan turun-temurun. Ia dipaksa oleh kenyataan: setiap tahap berdiri di atas hasil tahap sebelumnya. Dan begitu satu tahap selesai, membongkarnya kembali itu mahal.',
              },
              {
                id: 'pmw-s1-b2',
                type: 'text',
                title: 'Kenapa namanya air terjun',
                body: 'Cara kerja seperti itu punya nama: Waterfall, yang artinya air terjun. Kalau digambar di kertas, tahapannya terlihat seperti undakan yang menurun — pekerjaan mengalir dari tahap atas ke tahap di bawahnya, satu arah, tidak pernah naik lagi.\n\nDalam Bahasa Indonesia paling gampang menyebutnya cara berurutan: satu tahap diselesaikan dulu sampai tuntas, baru tahap berikutnya boleh dimulai.\n\nItu saja intinya. Sisanya hanyalah cara merapikan gagasan sederhana tersebut.',
              },
              {
                id: 'pmw-s1-b3',
                type: 'keypoint',
                title: 'Lima tahapnya, dalam bahasa sehari-hari',
                points: [
                  '1. Kumpulkan kebutuhan — cari tahu apa yang sebenarnya diinginkan, lalu tuliskan.',
                  '2. Rancang — tentukan bentuk, ukuran, bahan, dan cara mengerjakannya.',
                  '3. Kerjakan — bangun atau buat sesuai rancangan yang sudah disepakati.',
                  '4. Periksa — uji apakah hasilnya benar-benar sesuai yang dijanjikan.',
                  '5. Serahkan dan rawat — serah terima ke pemilik, lalu dampingi selama masa pemakaian awal.',
                ],
              },
              {
                id: 'pmw-s1-b4',
                type: 'check',
                question:
                  'Pada renovasi dapur, kapan letak titik air dan colokan listrik paling tepat diputuskan?',
                options: [
                  { id: 'pmw-s1-b4-o1', text: 'Setelah semua dinding selesai diplester dan dicat' },
                  { id: 'pmw-s1-b4-o2', text: 'Pada tahap merancang, sebelum dinding dan lantai dikerjakan' },
                  { id: 'pmw-s1-b4-o3', text: 'Saat perabot dapur mulai dipasang, supaya menyesuaikan barangnya' },
                  { id: 'pmw-s1-b4-o4', text: 'Belakangan saja, mengikuti selera pemilik pada saat itu' },
                ],
                correctOptionId: 'pmw-s1-b4-o2',
                explanation:
                  'Pipa air dan kabel listrik tertanam di dalam dinding dan lantai. Memutuskannya setelah dinding jadi berarti membobok pekerjaan yang sudah dibayar. Menunggu sampai perabot datang atau menunggu selera pemilik terdengar luwes, tetapi keduanya berujung pada pembongkaran yang sama. Inilah alasan cara berurutan memaksa keputusan seperti ini diambil di tahap rancangan — bukan karena senang bikin ribet, tetapi karena membongkar itu mahal.',
              },
              {
                id: 'pmw-s1-b5',
                type: 'text',
                title: 'Ada gerbang di antara dua tahap',
                body: 'Di antara dua tahap selalu ada gerbang: pemeriksaan singkat sebelum boleh lanjut. Pemilik pekerjaan melihat hasil tahap itu, lalu menyatakan setuju.\n\nDi banyak tempat gerbang ini disebut persetujuan tertulis, atau dalam bahasa asing sign-off. Artinya sesederhana: pemilik pekerjaan menyatakan setuju, dan pernyataan itu tercatat di suatu tempat yang bisa dibuka lagi.\n\nTanda tangan di kertas, balasan pesan, atau notulen rapat yang disepakati semuanya sah. Yang penting bukan formalitasnya, melainkan adanya satu momen jelas ketika semua orang berkata: bagian ini beres, kita lanjut.',
              },
              {
                id: 'pmw-s1-b6',
                type: 'flashcard',
                front: 'Apa maksud "satu arah" pada cara kerja Waterfall?',
                back: 'Pekerjaan bergerak maju dari tahap ke tahap dan tidak dirancang untuk kembali. Kembali ke tahap sebelumnya bukan hal terlarang, tetapi selalu mahal — jadi harus lewat persetujuan dan perhitungan dampak, bukan diam-diam.',
              },
              {
                id: 'pmw-s1-b7',
                type: 'keypoint',
                title: 'Empat hal yang diperiksa di setiap gerbang',
                points: [
                  'Apakah hasil tahap ini sesuai yang disepakati di awal?',
                  'Apakah ada hal yang berubah sejak tahap ini dimulai?',
                  'Apakah pemilik pekerjaan sudah benar-benar melihat hasilnya, bukan sekadar mendengar laporan?',
                  'Apakah tahap berikutnya sudah punya semua yang dibutuhkan untuk mulai — bahan, orang, izin, uang?',
                ],
              },
              {
                id: 'pmw-s1-b8',
                type: 'fillblank',
                sentence:
                  'Pada cara berurutan, sebuah tahap baru boleh dimulai setelah tahap sebelumnya selesai dan ___.',
                answer: 'disetujui',
                options: ['disetujui', 'dibayar lunas', 'diumumkan ke semua orang'],
              },
              {
                id: 'pmw-s1-b9',
                type: 'text',
                title: 'Waterfall tidak melarang perubahan',
                body: 'Ini salah paham yang paling sering terdengar: "kalau sudah tanda tangan, tidak boleh berubah lagi". Keliru.\n\nWaterfall tidak melarang perubahan. Ia hanya menuntut perubahan masuk lewat pintu depan: diajukan, dihitung dampaknya pada tanggal dan biaya, lalu diputuskan orang yang berwenang.\n\nYang benar-benar dilarang adalah perubahan diam-diam — permintaan yang masuk lewat obrolan di lorong, dikerjakan tanpa dicatat, lalu jadi bahan perselisihan di akhir.',
              },
              {
                id: 'pmw-s1-b10',
                type: 'match',
                prompt: 'Pasangkan tahap dengan kegiatannya pada proyek membangun rumah.',
                pairs: [
                  {
                    id: 'pmw-s1-b10-p1',
                    left: 'Kumpulkan kebutuhan',
                    right: 'Menanyakan berapa kamar, berapa anggaran, kapan harus ditempati',
                  },
                  {
                    id: 'pmw-s1-b10-p2',
                    left: 'Rancang',
                    right: 'Membuat gambar denah, memilih bahan, menghitung kekuatan struktur',
                  },
                  {
                    id: 'pmw-s1-b10-p3',
                    left: 'Kerjakan',
                    right: 'Menggali fondasi, memasang bata, menaikkan atap',
                  },
                  {
                    id: 'pmw-s1-b10-p4',
                    left: 'Periksa',
                    right: 'Mengecek kebocoran, mencoba semua keran, saklar, dan pintu',
                  },
                ],
              },
              {
                id: 'pmw-s1-b11',
                type: 'check',
                question: 'Manakah anggapan yang KELIRU tentang cara kerja Waterfall?',
                options: [
                  { id: 'pmw-s1-b11-o1', text: 'Setiap tahap diakhiri persetujuan sebelum lanjut ke tahap berikutnya' },
                  { id: 'pmw-s1-b11-o2', text: 'Perubahan sama sekali tidak boleh terjadi setelah rancangan disetujui' },
                  { id: 'pmw-s1-b11-o3', text: 'Rancangan dibuat rinci lebih dulu, baru pengerjaan dimulai' },
                  { id: 'pmw-s1-b11-o4', text: 'Hasil utuh biasanya baru terlihat menjelang akhir proyek' },
                ],
                correctOptionId: 'pmw-s1-b11-o2',
                explanation:
                  'Waterfall mengatur perubahan, bukan melarangnya: perubahan diajukan, dihitung dampaknya, lalu disetujui yang berwenang. Tiga pernyataan lain memang ciri asli Waterfall — gerbang persetujuan antar tahap, rancangan rinci di depan, dan hasil yang baru terlihat utuh di akhir. Justru pernyataan terakhir itu kelemahan jujurnya, bukan mitos.',
              },
              {
                id: 'pmw-s1-b12',
                type: 'text',
                title: 'Kelebihan yang sering diremehkan',
                body: 'Karena rencananya lengkap sejak awal, cara berurutan memberi tiga hal yang sangat berharga: angka biaya yang bisa dijanjikan, tanggal selesai yang bisa dipegang, dan pembagian tugas yang jelas untuk tim besar.\n\nItu sebabnya kontraktor bangunan, penyelenggara acara, dan lembaga yang harus mengurus izin tetap memakainya sampai hari ini. Bukan karena mereka ketinggalan zaman, tetapi karena orang yang membayar mereka butuh kepastian sebelum uang dikeluarkan.',
              },
              {
                id: 'pmw-s1-b13',
                type: 'keypoint',
                title: 'Bawa pulang empat hal ini',
                points: [
                  'Waterfall = cara berurutan: satu tahap selesai dulu, baru tahap berikutnya dimulai.',
                  'Namanya air terjun karena pekerjaan mengalir satu arah ke bawah, tidak naik lagi.',
                  'Di antara dua tahap ada gerbang persetujuan yang tercatat.',
                  'Kekuatan utamanya: kepastian biaya, kepastian tanggal, dan pembagian tugas yang jelas.',
                ],
              },
              {
                id: 'pmw-s1-b14',
                type: 'reflect',
                prompt:
                  'Pilih satu pekerjaan di tempat Anda, lalu petakan ke lima tahap tadi. Tahap mana yang selama ini paling sering dilewati begitu saja — dan apa akibatnya?',
                placeholder: 'Pekerjaan: ... / Tahap yang sering dilewati: ... / Akibatnya: ...',
              },
            ],
          },
        },
        {
          id: 'pmw-s1-quiz',
          type: 'quiz',
          title: 'Kuis: Cara Kerja Berurutan',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmw-s1-q1',
                text: 'Urutan tahap Waterfall yang benar adalah...',
                points: 1,
                options: [
                  { id: 'pmw-s1-q1-o1', text: 'Rancang - kumpulkan kebutuhan - kerjakan - serahkan - periksa' },
                  { id: 'pmw-s1-q1-o2', text: 'Kumpulkan kebutuhan - rancang - kerjakan - periksa - serahkan' },
                  { id: 'pmw-s1-q1-o3', text: 'Kerjakan - kumpulkan kebutuhan - rancang - periksa - serahkan' },
                  { id: 'pmw-s1-q1-o4', text: 'Kumpulkan kebutuhan - kerjakan - rancang - serahkan - periksa' },
                ],
                correctOptionId: 'pmw-s1-q1-o2',
              },
              {
                id: 'pmw-s1-q2',
                text: 'Kenapa cara ini disebut air terjun?',
                points: 1,
                options: [
                  { id: 'pmw-s1-q2-o1', text: 'Karena pekerjaannya deras dan cepat selesai' },
                  { id: 'pmw-s1-q2-o2', text: 'Karena tahapannya mengalir satu arah ke bawah dan tidak naik lagi' },
                  { id: 'pmw-s1-q2-o3', text: 'Karena biayanya mengalir terus tanpa bisa dikendalikan' },
                  { id: 'pmw-s1-q2-o4', text: 'Karena pertama kali dipakai pada proyek pembangunan bendungan' },
                ],
                correctOptionId: 'pmw-s1-q2-o2',
              },
              {
                id: 'pmw-s1-q3',
                text: 'Apa fungsi persetujuan tertulis di akhir setiap tahap?',
                points: 1,
                options: [
                  { id: 'pmw-s1-q3-o1', text: 'Menambah formalitas supaya proyek terlihat resmi' },
                  { id: 'pmw-s1-q3-o2', text: 'Menandai satu momen jelas bahwa tahap ini beres dan boleh dilanjutkan' },
                  { id: 'pmw-s1-q3-o3', text: 'Memindahkan seluruh tanggung jawab ke pemilik pekerjaan' },
                  { id: 'pmw-s1-q3-o4', text: 'Menghentikan semua kemungkinan perubahan selamanya' },
                ],
                correctOptionId: 'pmw-s1-q3-o2',
              },
              {
                id: 'pmw-s1-q4',
                text: 'Pernyataan yang benar tentang perubahan dalam Waterfall adalah...',
                points: 1,
                options: [
                  { id: 'pmw-s1-q4-o1', text: 'Perubahan dilarang total setelah rancangan disetujui' },
                  { id: 'pmw-s1-q4-o2', text: 'Perubahan boleh, tetapi harus diajukan, dihitung dampaknya, lalu disetujui' },
                  { id: 'pmw-s1-q4-o3', text: 'Perubahan bebas dilakukan siapa saja asal niatnya baik' },
                  { id: 'pmw-s1-q4-o4', text: 'Perubahan cukup disampaikan lisan kepada tukang di lokasi' },
                ],
                correctOptionId: 'pmw-s1-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pmw-s1-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmw-s1-c1', text: 'Saya bisa menjelaskan arti "air terjun" kepada orang yang belum pernah mendengarnya.' },
              { id: 'pmw-s1-c2', text: 'Saya bisa menyebutkan lima tahapnya beserta satu contoh dari pekerjaan saya.' },
              { id: 'pmw-s1-c3', text: 'Saya paham kenapa urutan tidak boleh dibalik pada pekerjaan yang sulit dibongkar.' },
              { id: 'pmw-s1-c4', text: 'Saya tahu bentuk persetujuan tertulis paling sederhana yang sah untuk tim saya.' },
              { id: 'pmw-s1-c5', text: 'Saya bisa menjelaskan bahwa Waterfall mengatur perubahan, bukan melarangnya.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 2 — Tahapan khasnya
    // -------------------------------------------------------------------
    {
      id: 'pmw-s2',
      title: 'Lima Tahap, Satu per Satu',
      summary:
        'Isi setiap tahap dalam bahasa awam: apa yang dikerjakan, apa hasilnya, dan kesalahan yang paling sering terjadi di sana.',
      activities: [
        {
          id: 'pmw-s2-lesson',
          type: 'lesson',
          title: 'Dari Bertanya sampai Menyerahkan Kunci',
          lesson: {
            blocks: [
              {
                id: 'pmw-s2-b1',
                type: 'text',
                title: 'Tahap 1 — Kumpulkan kebutuhan',
                body: 'Sebelum satu batu bata pun dibeli, ada pekerjaan yang tidak terlihat tetapi paling menentukan: duduk bersama pemilik dan bertanya sampai jelas.\n\nBerapa orang yang akan tinggal? Kapan harus bisa ditempati? Berapa uang yang benar-benar tersedia? Mana yang wajib ada, dan mana yang sekadar bagus kalau ada?\n\nHasil tahap ini bukan gambar, melainkan tulisan: daftar kebutuhan yang disepakati bersama. Kalau tidak tertulis, ia hanya ingatan — dan ingatan dua orang tentang percakapan yang sama hampir selalu berbeda.',
              },
              {
                id: 'pmw-s2-b2',
                type: 'keypoint',
                title: 'Pertanyaan yang wajib ditanyakan di tahap kebutuhan',
                points: [
                  '"Pekerjaan ini dianggap berhasil kalau apa?" — jawaban harus bisa dilihat atau dihitung.',
                  '"Mana yang wajib, mana yang boleh dikorbankan kalau uang atau waktu kurang?"',
                  '"Siapa saja yang ikut memakai hasilnya?" — sering ada orang penting yang lupa diajak bicara.',
                  '"Apa yang TIDAK termasuk pekerjaan ini?" — daftar ini yang menyelamatkan Anda nanti.',
                ],
              },
              {
                id: 'pmw-s2-b3',
                type: 'check',
                question:
                  'Bu Ratna ingin merenovasi warungnya. Tukang datang dan langsung membeli bahan di hari pertama. Apa yang paling mengkhawatirkan di sini?',
                options: [
                  { id: 'pmw-s2-b3-o1', text: 'Bahan mungkin dibeli di toko yang lebih mahal dari biasanya' },
                  { id: 'pmw-s2-b3-o2', text: 'Belum ada kesepakatan tertulis soal hasil akhir, jadi bahan dibeli untuk menebak' },
                  { id: 'pmw-s2-b3-o3', text: 'Tukang seharusnya libur dulu satu hari sebelum mulai' },
                  { id: 'pmw-s2-b3-o4', text: 'Tidak ada masalah, membeli bahan lebih awal selalu menghemat waktu' },
                ],
                correctOptionId: 'pmw-s2-b3-o2',
                explanation:
                  'Bahan yang dibeli sebelum kebutuhan disepakati adalah uang yang dipertaruhkan pada tebakan. Kalau ternyata Bu Ratna ingin menggeser posisi dapur, keramik dan kusen yang sudah dibeli bisa jadi salah ukuran. Harga toko dan jadwal libur tukang memang bisa dibicarakan, tetapi keduanya masalah kecil dibanding membeli barang untuk rencana yang belum ada.',
              },
              {
                id: 'pmw-s2-b4',
                type: 'text',
                title: 'Tahap 2 — Rancang',
                body: 'Merancang artinya mengubah keinginan menjadi bentuk yang bisa dikerjakan orang lain. Denah dengan ukuran, daftar bahan, urutan pengerjaan, dan perkiraan biaya.\n\nDi tahap inilah keputusan-keputusan mahal diambil selagi masih murah. Menggeser kamar mandi di atas kertas butuh satu jam kerja juru gambar. Menggesernya setelah lantai dicor butuh palu, tukang, dan uang baru.\n\nRancangan yang baik bisa dibaca orang yang tidak ikut rapat. Kalau harus dijelaskan dulu secara lisan supaya dimengerti, berarti ia belum selesai.',
              },
              {
                id: 'pmw-s2-b5',
                type: 'flashcard',
                front: 'Apa beda tahap kebutuhan dan tahap rancangan?',
                back: 'Kebutuhan menjawab APA yang ingin dicapai dan kenapa — misalnya "dapur harus muat dua orang memasak bersama". Rancangan menjawab BAGAIMANA mewujudkannya — ukuran meja, letak kompor, bahan yang dipakai. Mencampur keduanya membuat orang berdebat soal warna cat sebelum sepakat soal jumlah kamar.',
              },
              {
                id: 'pmw-s2-b6',
                type: 'text',
                title: 'Tahap 3 — Kerjakan',
                body: 'Inilah tahap yang paling terlihat: bata dipasang, tenda didirikan, berkas diketik, seragam dijahit. Sebagian besar uang dan tenaga habis di sini.\n\nJustru karena paling terlihat, tahap ini sering dikira satu-satunya pekerjaan yang nyata. Padahal kalau dua tahap sebelumnya dikerjakan asal-asalan, tahap ini berubah menjadi tempat semua salah paham bertemu — dan semuanya sudah terlanjur berbentuk barang.\n\nTugas pengelola di tahap ini sederhana tetapi tidak boleh putus: memastikan yang dikerjakan sama dengan yang dirancang, dan mencatat begitu ada yang menyimpang.',
              },
              {
                id: 'pmw-s2-b7',
                type: 'keypoint',
                title: 'Tanda tahap pengerjaan berjalan sehat',
                points: [
                  'Setiap orang tahu bagian mana yang menjadi tanggung jawabnya minggu ini.',
                  'Penyimpangan dari rancangan dilaporkan hari itu juga, bukan disimpan sampai akhir.',
                  'Bahan dan izin datang sebelum pekerjaan yang membutuhkannya dimulai.',
                  'Ada pemeriksaan kecil di sepanjang jalan, bukan hanya satu pemeriksaan besar di akhir.',
                ],
              },
              {
                id: 'pmw-s2-b8',
                type: 'fillblank',
                sentence:
                  'Hasil tahap kumpulkan kebutuhan bukan gambar, melainkan daftar kebutuhan yang ___ bersama.',
                answer: 'disepakati',
                options: ['disepakati', 'dihafalkan', 'dirahasiakan'],
              },
              {
                id: 'pmw-s2-b9',
                type: 'text',
                title: 'Tahap 4 — Periksa',
                body: 'Memeriksa berarti membuktikan, bukan mempercayai. Keran dinyalakan satu per satu, saklar ditekan semua, pintu dibuka-tutup, atap disiram air untuk mencari bocor.\n\nHasil pemeriksaan biasanya berupa daftar kekurangan: hal-hal kecil yang harus dibereskan sebelum diserahkan. Di dunia bangunan daftar ini sering disebut daftar cacat, atau dalam istilah asing punch list. Isinya misalnya: engsel jendela seret, satu keramik retak, cat kusen belum rata.\n\nDaftar kekurangan bukan tanda pekerjaan gagal. Ia tanda pemeriksaan dilakukan dengan sungguh-sungguh.',
              },
              {
                id: 'pmw-s2-b10',
                type: 'check',
                question:
                  'Panitia akan menerima 500 kursi sewaan untuk acara besok. Cara memeriksa yang paling masuk akal adalah...',
                options: [
                  { id: 'pmw-s2-b10-o1', text: 'Percaya pada nota pengiriman, karena vendornya sudah langganan' },
                  { id: 'pmw-s2-b10-o2', text: 'Hitung jumlahnya, cek acak beberapa kursi, catat yang rusak, minta ganti hari ini juga' },
                  { id: 'pmw-s2-b10-o3', text: 'Periksa besok pagi sebelum tamu datang supaya tidak dua kali kerja' },
                  { id: 'pmw-s2-b10-o4', text: 'Buka semua kursi satu per satu sampai malam meskipun acara masih dua hari lagi' },
                ],
                correctOptionId: 'pmw-s2-b10-o2',
                explanation:
                  'Memeriksa berarti membuktikan sambil masih ada waktu untuk memperbaiki. Menghitung dan mengecek acak sudah cukup untuk menangkap masalah besar tanpa menghabiskan semalaman. Percaya pada nota berarti menemukan kursi patah saat tamu duduk. Memeriksa besok pagi menghapus kesempatan minta ganti. Membuka semua 500 kursi satu per satu memang teliti, tetapi biayanya tidak sepadan untuk risiko yang ada.',
              },
              {
                id: 'pmw-s2-b11',
                type: 'text',
                title: 'Tahap 5 — Serahkan dan rawat',
                body: 'Rumah selesai bukan berarti pekerjaan selesai. Kunci diserahkan, tetapi masih ada yang harus dibereskan: cara merawat, siapa yang dihubungi kalau ada bocor, sampai kapan garansi berlaku.\n\nTahap ini sering dilupakan padahal murah. Cukup tiga hal: pernyataan resmi bahwa hasil diterima, penjelasan singkat cara memakai dan merawat, dan kesepakatan siapa yang menangani keluhan dalam beberapa bulan pertama.\n\nTanpa itu, proyek tidak pernah benar-benar berakhir. Tim tidak bisa pindah ke pekerjaan berikutnya dengan tenang, dan pemilik merasa ditinggalkan.',
              },
              {
                id: 'pmw-s2-b12',
                type: 'match',
                prompt: 'Pasangkan setiap tahap dengan pertanyaan yang dijawabnya.',
                pairs: [
                  { id: 'pmw-s2-b12-p1', left: 'Kumpulkan kebutuhan', right: 'Apa yang sebenarnya diinginkan, dan berhasil itu seperti apa?' },
                  { id: 'pmw-s2-b12-p2', left: 'Rancang', right: 'Bagaimana cara mewujudkannya, dengan bahan dan urutan apa?' },
                  { id: 'pmw-s2-b12-p3', left: 'Kerjakan', right: 'Apakah yang dibuat sama dengan yang dirancang?' },
                  { id: 'pmw-s2-b12-p4', left: 'Periksa', right: 'Apakah hasilnya benar-benar berfungsi seperti yang dijanjikan?' },
                  { id: 'pmw-s2-b12-p5', left: 'Serahkan dan rawat', right: 'Siapa yang memegang, merawat, dan menangani keluhan setelah ini?' },
                ],
              },
              {
                id: 'pmw-s2-b13',
                type: 'keypoint',
                title: 'Kesalahan paling sering di tiap tahap',
                points: [
                  'Kebutuhan: bertanya hanya kepada satu orang, lalu mengira itu suara semua pemakai.',
                  'Rancangan: buru-buru diselesaikan karena dianggap belum "kerja beneran".',
                  'Pengerjaan: penyimpangan kecil tidak dicatat, menumpuk, lalu ketahuan di akhir.',
                  'Pemeriksaan: hanya melihat yang paling gampang dilihat, melewatkan yang tersembunyi.',
                  'Serah terima: tidak ada pernyataan terima, sehingga proyek menggantung berbulan-bulan.',
                ],
              },
              {
                id: 'pmw-s2-b14',
                type: 'text',
                title: 'Boleh tumpang tindih sedikit',
                body: 'Di buku, lima tahap itu digambar rapi berurutan. Di lapangan, sedikit tumpang tindih itu wajar dan sering menghemat waktu — misalnya mulai memesan bahan yang sudah pasti selagi rancangan bagian lain masih diselesaikan.\n\nYang berbahaya adalah tumpang tindih pada bagian yang saling menentukan: mengecor lantai selagi letak pipa masih diperdebatkan.\n\nAturan praktisnya satu kalimat: boleh menyerempet ke tahap berikutnya untuk hal yang sudah pasti, tidak boleh untuk hal yang masih bisa berubah.',
              },
              {
                id: 'pmw-s2-b15',
                type: 'reflect',
                prompt:
                  'Ambil satu pekerjaan yang pernah Anda tangani. Tulis apa hasil nyata dari tiap tahap: kebutuhan menghasilkan apa, rancangan menghasilkan apa, pemeriksaan menghasilkan apa. Tahap mana yang hasilnya tidak pernah ada bentuk tertulisnya?',
                placeholder: 'Kebutuhan: ... / Rancangan: ... / Pemeriksaan: ... / Yang tidak pernah tertulis: ...',
              },
            ],
          },
        },
        {
          id: 'pmw-s2-quiz',
          type: 'quiz',
          title: 'Kuis: Isi Setiap Tahap',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmw-s2-q1',
                text: 'Hasil utama dari tahap kumpulkan kebutuhan adalah...',
                points: 1,
                options: [
                  { id: 'pmw-s2-q1-o1', text: 'Gambar denah lengkap dengan ukuran' },
                  { id: 'pmw-s2-q1-o2', text: 'Daftar kebutuhan tertulis yang disepakati bersama' },
                  { id: 'pmw-s2-q1-o3', text: 'Kuitansi pembelian bahan pertama' },
                  { id: 'pmw-s2-q1-o4', text: 'Jadwal rapat mingguan untuk tiga bulan ke depan' },
                ],
                correctOptionId: 'pmw-s2-q1-o2',
              },
              {
                id: 'pmw-s2-q2',
                text: 'Kenapa tahap rancangan tidak boleh diburu-buru?',
                points: 1,
                options: [
                  { id: 'pmw-s2-q2-o1', text: 'Karena di sana keputusan mahal diambil selagi masih murah untuk diubah' },
                  { id: 'pmw-s2-q2-o2', text: 'Karena juru gambar dibayar per jam' },
                  { id: 'pmw-s2-q2-o3', text: 'Karena aturan mewajibkan minimal satu bulan untuk merancang' },
                  { id: 'pmw-s2-q2-o4', text: 'Karena tim butuh waktu istirahat sebelum pengerjaan dimulai' },
                ],
                correctOptionId: 'pmw-s2-q2-o1',
              },
              {
                id: 'pmw-s2-q3',
                text: 'Daftar kekurangan yang muncul dari tahap pemeriksaan paling tepat dipahami sebagai...',
                points: 1,
                options: [
                  { id: 'pmw-s2-q3-o1', text: 'Bukti bahwa pekerjaan gagal dan harus diulang' },
                  { id: 'pmw-s2-q3-o2', text: 'Tanda pemeriksaan dilakukan sungguh-sungguh, berisi hal yang harus dibereskan sebelum serah terima' },
                  { id: 'pmw-s2-q3-o3', text: 'Dokumen internal yang sebaiknya tidak diperlihatkan ke pemilik' },
                  { id: 'pmw-s2-q3-o4', text: 'Daftar keinginan tambahan dari pemilik pekerjaan' },
                ],
                correctOptionId: 'pmw-s2-q3-o2',
              },
              {
                id: 'pmw-s2-q4',
                text: 'Tumpang tindih antar tahap paling berbahaya ketika...',
                points: 1,
                options: [
                  { id: 'pmw-s2-q4-o1', text: 'Bahan yang sudah pasti dipesan lebih awal' },
                  { id: 'pmw-s2-q4-o2', text: 'Pekerjaan dimulai pada bagian yang keputusannya masih bisa berubah' },
                  { id: 'pmw-s2-q4-o3', text: 'Tim menyiapkan alat sebelum bahan datang' },
                  { id: 'pmw-s2-q4-o4', text: 'Pemilik ikut melihat hasil sebelum tahap selesai' },
                ],
                correctOptionId: 'pmw-s2-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pmw-s2-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmw-s2-c1', text: 'Saya tahu hasil nyata yang harus keluar dari setiap tahap, bukan sekadar namanya.' },
              { id: 'pmw-s2-c2', text: 'Saya sudah menuliskan daftar kebutuhan satu pekerjaan saya, termasuk bagian "tidak termasuk".' },
              { id: 'pmw-s2-c3', text: 'Saya bisa membedakan pertanyaan tahap kebutuhan dan pertanyaan tahap rancangan.' },
              { id: 'pmw-s2-c4', text: 'Saya punya cara memeriksa hasil yang membuktikan, bukan sekadar mempercayai laporan.' },
              { id: 'pmw-s2-c5', text: 'Saya menyiapkan serah terima yang jelas: pernyataan terima, cara merawat, dan siapa dihubungi.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 3 — Membuat rencana
    // -------------------------------------------------------------------
    {
      id: 'pmw-s3',
      title: 'Membuat Rencana yang Benar-Benar Bisa Dipakai',
      summary:
        'Memecah pekerjaan besar, mengurut mana menunggu mana, memasang tonggak waktu, dan menentukan siapa menyetujui apa.',
      activities: [
        {
          id: 'pmw-s3-lesson',
          type: 'lesson',
          title: 'Dari Pekerjaan Besar ke Daftar yang Bisa Dikerjakan',
          lesson: {
            blocks: [
              {
                id: 'pmw-s3-b1',
                type: 'text',
                title: '"Renovasi rumah" bukan sebuah pekerjaan',
                body: 'Kalau di daftar tugas Anda tertulis "renovasi rumah", tidak ada satu orang pun yang bisa mulai bekerja besok pagi. Terlalu besar, terlalu kabur.\n\nPecah menjadi: bongkar dinding belakang, pasang rangka kanopi, ganti keramik kamar mandi, cat ulang ruang tamu. Sekarang setiap barisnya bisa diberi nama orang, tanggal, dan angka biaya.\n\nMemecah pekerjaan besar menjadi kecil adalah keterampilan paling dasar dalam menyusun rencana. Tanpa itu, semua alat penjadwalan secanggih apa pun tidak menolong.',
              },
              {
                id: 'pmw-s3-b2',
                type: 'keypoint',
                title: 'Cara memecah: daftar pekerjaan bertingkat',
                points: [
                  'Mulai dari hasil akhir, lalu turunkan menjadi beberapa bagian besar.',
                  'Turunkan lagi setiap bagian menjadi pekerjaan yang bisa dikerjakan orang.',
                  'Berhenti ketika satu baris bisa selesai dalam hitungan hari dan punya satu penanggung jawab.',
                  'Susunan bertingkat ini di buku-buku disebut WBS. Menyebutnya "daftar pekerjaan bertingkat" sudah cukup dan lebih mudah dijelaskan ke tim.',
                ],
              },
              {
                id: 'pmw-s3-b3',
                type: 'check',
                question: 'Mana baris pekerjaan yang paling siap dimasukkan ke jadwal?',
                options: [
                  { id: 'pmw-s3-b3-o1', text: 'Membenahi sistem arsip kantor' },
                  {
                    id: 'pmw-s3-b3-o2',
                    text: 'Memindahkan arsip tahun 2020 sampai 2022 ke lemari baru dan memberi label per bulan (Bu Sari, 3 hari)',
                  },
                  { id: 'pmw-s3-b3-o3', text: 'Koordinasi arsip dengan semua divisi' },
                  { id: 'pmw-s3-b3-o4', text: 'Meningkatkan kerapian ruang kerja' },
                ],
                correctOptionId: 'pmw-s3-b3-o2',
                explanation:
                  'Hanya pilihan kedua yang menyebutkan hasil yang bisa dilihat, penanggung jawab, dan lama pengerjaan. "Membenahi", "koordinasi", dan "meningkatkan kerapian" adalah niat baik, bukan pekerjaan: tidak ada yang tahu kapan boleh mencentangnya sebagai selesai. Baris yang tidak bisa dinyatakan selesai juga tidak bisa dijadwalkan maupun dipantau.',
              },
              {
                id: 'pmw-s3-b4',
                type: 'text',
                title: 'Mana yang harus menunggu mana',
                body: 'Sebagian pekerjaan tidak bisa dimulai sebelum pekerjaan lain selesai. Mengecat butuh dinding. Memasang keramik butuh lantai yang sudah rata. Mencetak undangan butuh tanggal dan gedung yang sudah pasti.\n\nHubungan "menunggu" ini namanya ketergantungan. Menuliskannya penting karena ia menentukan urutan yang sebenarnya — dan sering mengungkap kenyataan pahit: jadwal yang tampak longgar ternyata sudah mepet sejak hari pertama.\n\nCara menemukannya gampang. Untuk setiap baris pekerjaan, tanyakan satu kalimat: "ini baru bisa mulai setelah apa?"',
              },
              {
                id: 'pmw-s3-b5',
                type: 'fillblank',
                sentence: 'Pekerjaan mengecat dinding ___ pada pekerjaan memasang dinding.',
                answer: 'bergantung',
                options: ['bergantung', 'tidak berhubungan', 'lebih dulu'],
              },
              {
                id: 'pmw-s3-b6',
                type: 'text',
                title: 'Rantai terpanjang menentukan tanggal selesai',
                body: 'Coba telusuri rantai pekerjaan yang saling menunggu, dari awal sampai akhir. Rantai terpanjang itulah yang menentukan kapan proyek selesai. Namanya jalur kritis.\n\nArtinya sederhana: kalau satu pekerjaan di rantai itu telat sehari, seluruh proyek ikut telat sehari. Sementara pekerjaan di luar rantai itu punya kelonggaran — telat sedikit tidak menggeser tanggal akhir sama sekali.\n\nAnda tidak butuh perangkat lunak mahal untuk menemukannya. Selembar kertas dan pertanyaan "ini menunggu apa?" sudah cukup untuk proyek berukuran normal.',
              },
              {
                id: 'pmw-s3-b7',
                type: 'flashcard',
                front: 'Apa itu tonggak waktu (milestone)?',
                back: 'Tanggal penanda bahwa satu tahap besar sudah selesai — misalnya "gedung dibayar uang muka", "undangan tercetak", "gladi bersih selesai". Ia tidak memakan waktu dan tidak dikerjakan siapa pun. Gunanya membuat kemajuan dan keterlambatan terlihat berminggu-minggu sebelum tanggal akhir.',
              },
              {
                id: 'pmw-s3-b8',
                type: 'keypoint',
                title: 'Memasang tonggak waktu yang berguna',
                points: [
                  'Pasang di titik yang benar-benar mengubah keadaan, bukan di tanggal acak.',
                  'Rumusnya harus bisa dijawab ya atau tidak: "izin sudah keluar" — bukan "izin hampir keluar".',
                  'Tiga sampai enam tonggak sudah cukup untuk proyek beberapa bulan.',
                  'Setiap tonggak punya satu nama yang bertanggung jawab mengumumkan tercapai atau meleset.',
                ],
              },
              {
                id: 'pmw-s3-b9',
                type: 'check',
                question:
                  'Pemasangan panggung ada di jalur kritis dan telat dua hari. Pemasangan spanduk tidak di jalur kritis dan juga telat dua hari. Mana yang Anda tangani lebih dulu?',
                options: [
                  { id: 'pmw-s3-b9-o1', text: 'Spanduk, karena paling terlihat oleh tamu dan bikin malu kalau kosong' },
                  { id: 'pmw-s3-b9-o2', text: 'Panggung, karena keterlambatannya langsung menggeser tanggal acara' },
                  { id: 'pmw-s3-b9-o3', text: 'Keduanya sama saja, kerjakan yang lebih mudah dulu' },
                  { id: 'pmw-s3-b9-o4', text: 'Tidak perlu ditangani, dua hari masih terhitung wajar' },
                ],
                correctOptionId: 'pmw-s3-b9-o2',
                explanation:
                  'Keterlambatan di jalur kritis langsung berubah menjadi keterlambatan proyek: dua hari di panggung berarti dua hari mundurnya acara. Spanduk punya kelonggaran, jadi telat dua hari bisa jadi tidak berdampak sama sekali. Memilih berdasarkan mana yang paling terlihat atau paling mudah adalah cara paling umum menghabiskan tenaga di tempat yang salah.',
              },
              {
                id: 'pmw-s3-b10',
                type: 'text',
                title: 'Siapa menyetujui apa',
                body: 'Rencana yang bagus tetap macet kalau tidak jelas siapa yang berhak memutuskan. Gejalanya khas: pekerjaan berhenti seminggu karena "menunggu keputusan", padahal tidak ada yang tahu siapa yang harus memutuskan.\n\nObatnya satu tabel kecil dengan dua kolom: jenis keputusan, dan satu nama. Contoh: perubahan denah — Pak Budi. Penambahan biaya di bawah dua juta — ketua panitia. Penambahan di atas dua juta — pemilik.\n\nSatu nama, bukan satu tim. Keputusan yang diserahkan ke "tim" adalah keputusan yang tidak pernah diambil.',
              },
              {
                id: 'pmw-s3-b11',
                type: 'match',
                prompt: 'Pasangkan istilah perencanaan dengan artinya dalam bahasa sehari-hari.',
                pairs: [
                  {
                    id: 'pmw-s3-b11-p1',
                    left: 'Daftar pekerjaan bertingkat',
                    right: 'Hasil besar yang dipecah sampai menjadi pekerjaan yang bisa dikerjakan orang',
                  },
                  { id: 'pmw-s3-b11-p2', left: 'Ketergantungan', right: 'Pekerjaan B baru bisa mulai setelah pekerjaan A selesai' },
                  { id: 'pmw-s3-b11-p3', left: 'Jalur kritis', right: 'Rantai pekerjaan yang menentukan tanggal selesai proyek' },
                  { id: 'pmw-s3-b11-p4', left: 'Tonggak waktu', right: 'Tanggal penanda selesainya satu tahap besar' },
                  { id: 'pmw-s3-b11-p5', left: 'Pemberi persetujuan', right: 'Satu nama yang berhak memutuskan jenis perubahan tertentu' },
                ],
              },
              {
                id: 'pmw-s3-b12',
                type: 'keypoint',
                title: 'Ciri rencana yang benar-benar bisa dipakai',
                points: [
                  'Setiap baris punya penanggung jawab, tanggal, dan penjelasan "selesai itu seperti apa".',
                  'Urutan menunggu sudah ditulis, bukan hanya ada di kepala satu orang.',
                  'Ada tiga sampai enam tonggak waktu yang bisa dijawab ya atau tidak.',
                  'Jelas siapa menyetujui apa, dengan satu nama untuk setiap jenis keputusan.',
                  'Muat dalam satu halaman yang bisa dibaca orang baru tanpa dijelaskan lisan.',
                ],
              },
              {
                id: 'pmw-s3-b13',
                type: 'text',
                title: 'Jadwal adalah janji, bukan harapan',
                body: 'Jadwal yang disusun dari harapan akan meleset di minggu kedua. Jadwal yang disusun dari perkiraan orang yang benar-benar mengerjakan biasanya bertahan.\n\nTanyakan langsung kepada pelaksananya. Lalu perbarui jadwal setiap minggu — jadwal yang tidak pernah diperbarui berhenti menjadi alat dan berubah menjadi hiasan dinding.\n\nDan ketika Anda menyebut sebuah tanggal, sebutkan juga syaratnya: "selesai Jumat, kalau bahan datang Senin". Angka tanpa syarat terdengar meyakinkan tetapi menyembunyikan risiko.',
              },
              {
                id: 'pmw-s3-b14',
                type: 'flashcard',
                front: 'Kenapa perlu cadangan waktu, dan berapa banyak?',
                back: 'Cadangan waktu adalah pengakuan jujur bahwa selalu ada hal yang tidak bisa diramal: vendor telat, orang sakit, hujan seharian. Untuk pekerjaan biasa, sekitar 10 sampai 20 persen dari total sudah masuk akal. Simpan di satu tempat yang terbuka sebagai milik proyek — bukan disembunyikan diam-diam di setiap baris pekerjaan.',
              },
              {
                id: 'pmw-s3-b15',
                type: 'reflect',
                prompt:
                  'Ambil satu pekerjaan besar Anda. Pecah menjadi lima baris, tandai satu tonggak waktu, lalu tulis untuk setiap baris: "ini baru bisa mulai setelah apa?" Baris mana yang ternyata ada di jalur kritis?',
                placeholder: '1. ... 2. ... 3. ... / Tonggak: ... / Jalur kritis: ...',
              },
            ],
          },
        },
        {
          id: 'pmw-s3-quiz',
          type: 'quiz',
          title: 'Kuis: Menyusun Rencana',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmw-s3-q1',
                text: 'Kapan sebaiknya berhenti memecah sebuah pekerjaan menjadi lebih kecil?',
                points: 1,
                options: [
                  { id: 'pmw-s3-q1-o1', text: 'Ketika sudah ada minimal lima puluh baris' },
                  { id: 'pmw-s3-q1-o2', text: 'Ketika satu baris bisa selesai dalam hitungan hari dan punya satu penanggung jawab' },
                  { id: 'pmw-s3-q1-o3', text: 'Ketika setiap baris bisa selesai dalam waktu satu jam' },
                  { id: 'pmw-s3-q1-o4', text: 'Ketika semua anggota tim sudah bosan membahasnya' },
                ],
                correctOptionId: 'pmw-s3-q1-o2',
              },
              {
                id: 'pmw-s3-q2',
                text: 'Keterlambatan satu hari pada pekerjaan di jalur kritis berarti...',
                points: 1,
                options: [
                  { id: 'pmw-s3-q2-o1', text: 'Tidak berdampak selama pekerjaan lain berjalan lancar' },
                  { id: 'pmw-s3-q2-o2', text: 'Seluruh proyek berpotensi mundur satu hari' },
                  { id: 'pmw-s3-q2-o3', text: 'Anggaran otomatis bertambah dua kali lipat' },
                  { id: 'pmw-s3-q2-o4', text: 'Jalur kritis harus dihapus dan disusun ulang dari nol' },
                ],
                correctOptionId: 'pmw-s3-q2-o2',
              },
              {
                id: 'pmw-s3-q3',
                text: 'Tonggak waktu yang baik dirumuskan seperti...',
                points: 1,
                options: [
                  { id: 'pmw-s3-q3-o1', text: '"Izin hampir keluar"' },
                  { id: 'pmw-s3-q3-o2', text: '"Izin sudah keluar" — bisa dijawab ya atau tidak' },
                  { id: 'pmw-s3-q3-o3', text: '"Progres izin sekitar 80 persen"' },
                  { id: 'pmw-s3-q3-o4', text: '"Tim sedang mengurus izin dengan sungguh-sungguh"' },
                ],
                correctOptionId: 'pmw-s3-q3-o2',
              },
              {
                id: 'pmw-s3-q4',
                text: 'Kenapa setiap jenis keputusan sebaiknya diberi satu nama, bukan diserahkan ke tim?',
                points: 1,
                options: [
                  { id: 'pmw-s3-q4-o1', text: 'Supaya ada yang bisa disalahkan kalau hasilnya jelek' },
                  { id: 'pmw-s3-q4-o2', text: 'Supaya pekerjaan tidak berhenti menunggu keputusan yang tidak pernah diambil siapa pun' },
                  { id: 'pmw-s3-q4-o3', text: 'Supaya rapat bisa dihapus seluruhnya' },
                  { id: 'pmw-s3-q4-o4', text: 'Supaya anggota tim lain tidak perlu tahu isi rencana' },
                ],
                correctOptionId: 'pmw-s3-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pmw-s3-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmw-s3-c1', text: 'Saya bisa memecah satu pekerjaan besar menjadi baris-baris yang bisa dijadwalkan.' },
              { id: 'pmw-s3-c2', text: 'Setiap baris pekerjaan saya punya penanggung jawab dan penjelasan "selesai itu seperti apa".' },
              { id: 'pmw-s3-c3', text: 'Saya sudah menuliskan urutan menunggu, bukan menyimpannya di kepala.' },
              { id: 'pmw-s3-c4', text: 'Saya sudah memasang minimal dua tonggak waktu yang bisa dijawab ya atau tidak.' },
              { id: 'pmw-s3-c5', text: 'Saya punya daftar siapa menyetujui apa, dengan satu nama untuk setiap jenis keputusan.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 4 — Kapan Waterfall justru terbaik
    // -------------------------------------------------------------------
    {
      id: 'pmw-s4',
      title: 'Kapan Waterfall Justru Pilihan Terbaik',
      summary:
        'Bagian jujurnya: situasi nyata di mana cara berurutan menang, dan memaksakan cara lain malah merugikan.',
      activities: [
        {
          id: 'pmw-s4-lesson',
          type: 'lesson',
          title: 'Bukan Peninggalan Masa Lalu',
          lesson: {
            blocks: [
              {
                id: 'pmw-s4-b1',
                type: 'text',
                title: 'Bagian yang jarang dibicarakan',
                body: 'Banyak pelatihan menggambarkan Waterfall sebagai cara lama yang harus ditinggalkan. Itu tidak jujur.\n\nKontraktor bangunan, penyelenggara pernikahan, panitia akreditasi sekolah, tim audit, dan panitia pengadaan barang di kantor pemerintah memakai cara berurutan setiap hari — dan hasilnya baik.\n\nBukan karena mereka belum pernah mendengar cara kerja yang lebih lincah. Tetapi karena bentuk pekerjaan mereka memang seperti itu: kebutuhannya sudah pasti, aturannya sudah ada, dan berubah di tengah jalan harganya mahal sekali.',
              },
              {
                id: 'pmw-s4-b2',
                type: 'keypoint',
                title: 'Lima tanda cara berurutan adalah pilihan yang tepat',
                points: [
                  'Hasil akhirnya sudah jelas sejak awal dan hampir tidak mungkin berubah.',
                  'Ada aturan, izin, atau standar resmi yang urutannya memang sudah baku dari sananya.',
                  'Biaya satu kesalahan sangat besar — membongkar berarti mengulang hampir dari nol.',
                  'Melibatkan banyak pihak luar dengan kontrak berharga tetap.',
                  'Tanggalnya mati dan tidak bisa digeser sedikit pun.',
                ],
              },
              {
                id: 'pmw-s4-b3',
                type: 'text',
                title: 'Izin bangunan: urutannya bukan pilihan Anda',
                body: 'Mengurus izin mendirikan bangunan tidak bisa dikerjakan sepotong-sepotong. Berkas harus lengkap, urutannya ditentukan pemerintah, dan tidak ada gunanya "mencoba setengah izin dulu untuk melihat reaksinya".\n\nGambar harus selesai sebelum diajukan. Pengajuan harus lengkap sebelum diperiksa. Pemeriksaan harus lolos sebelum izin terbit. Setiap kotak harus dicentang berurutan.\n\nDi situasi seperti ini, cara berurutan bukan sekadar cocok — ia satu-satunya yang mungkin. Yang bisa Anda atur hanyalah seberapa rapi persiapannya.',
              },
              {
                id: 'pmw-s4-b4',
                type: 'check',
                question: 'Manakah pekerjaan yang PALING cocok dikerjakan dengan cara berurutan?',
                options: [
                  { id: 'pmw-s4-b4-o1', text: 'Menyusun konten media sosial mingguan yang temanya sering berubah' },
                  { id: 'pmw-s4-b4-o2', text: 'Mengurus akreditasi sekolah dengan berkas dan urutan yang ditentukan lembaga resmi' },
                  { id: 'pmw-s4-b4-o3', text: 'Menguji tiga varian rasa baru untuk melihat mana yang paling laku' },
                  { id: 'pmw-s4-b4-o4', text: 'Merapikan alur penanganan keluhan pelanggan yang masih terus disesuaikan' },
                ],
                correctOptionId: 'pmw-s4-b4-o2',
                explanation:
                  'Akreditasi punya semua tandanya: hasil akhir baku, urutan ditentukan pihak luar, tenggat mati, dan tidak ada ruang bereksperimen. Menyusun konten dan menguji varian rasa justru hidup dari mencoba lalu menyesuaikan — mengunci rencananya di depan malah membuang keunggulan mereka. Alur penanganan keluhan yang masih dicari bentuknya juga akan rugi kalau dipaksa lewat gerbang persetujuan berlapis.',
              },
              {
                id: 'pmw-s4-b5',
                type: 'text',
                title: 'Akreditasi, audit, dan pengadaan barang',
                body: 'Akreditasi sekolah: instrumen penilaiannya sudah dibagikan jauh hari, buktinya harus dikumpulkan dalam urutan tertentu, dan tanggal kunjungan asesor tidak bisa ditawar.\n\nAudit tahunan: ruang lingkupnya ditentukan aturan, urutan pemeriksaannya baku, dan hasil akhirnya laporan resmi dengan format tetap.\n\nPengadaan barang pemerintah: dari penetapan kebutuhan, penyusunan syarat, pengumuman, penawaran, sampai penetapan pemenang — semua urutannya diatur, dan melompatinya bukan sekadar tidak efisien, melainkan tidak sah.\n\nMemaksakan putaran dua mingguan pada tiga pekerjaan ini hanya menambah rapat tanpa menambah manfaat.',
              },
              {
                id: 'pmw-s4-b6',
                type: 'flashcard',
                front: 'Kenapa acara pernikahan lebih cocok dikerjakan dengan cara berurutan?',
                back: 'Tanggalnya mati, tidak ada kesempatan mengulang, dan hampir semua pekerjaan dikontrak ke pihak luar dengan harga tetap jauh hari — gedung, katering, rias, dokumentasi. Di situasi seperti itu kepastian jauh lebih berharga daripada kelenturan.',
              },
              {
                id: 'pmw-s4-b7',
                type: 'text',
                title: 'Harga tetap menuntut rencana lengkap',
                body: 'Kalau pemberi kerja meminta satu angka harga untuk seluruh pekerjaan, sebenarnya ia sedang meminta Anda menjamin ruang lingkupnya tidak akan berubah. Ruang lingkup artinya daftar apa saja yang dikerjakan dan apa yang tidak.\n\nJaminan seperti itu hanya bisa diberikan kalau Anda merancang lengkap di depan. Itu sebabnya kontrak harga tetap dan cara berurutan hampir selalu berpasangan.\n\nMenandatangani harga tetap lalu bekerja dengan ruang lingkup yang bebas berubah adalah resep kerugian — dan yang menanggung biasanya pihak yang mengerjakan.',
              },
              {
                id: 'pmw-s4-b8',
                type: 'fillblank',
                sentence:
                  'Cara berurutan paling cocok ketika ___ sudah jelas sejak awal dan hampir tidak mungkin berubah.',
                answer: 'hasil akhir',
                options: ['hasil akhir', 'jumlah anggota tim', 'nama pemberi kerja'],
              },
              {
                id: 'pmw-s4-b9',
                type: 'keypoint',
                title: 'Tanda cara lincah dipaksakan di tempat yang salah',
                points: [
                  'Cara lincah (sering disebut Agile) berarti bekerja sepotong-sepotong lalu menyesuaikan dari hasilnya.',
                  'Tanda pertama: rapat bertambah banyak, tetapi tidak ada satu pun keputusan yang benar-benar masih bisa diubah.',
                  'Tanda kedua: hasil sepotong-sepotong tidak bisa dipakai siapa pun sampai semuanya selesai.',
                  'Tanda ketiga: pihak luar terus menanyakan tanggal pasti dan tidak pernah mendapat jawaban.',
                  'Tanda keempat: istilah baru bertambah banyak, sementara cara kerja sebenarnya tidak berubah.',
                ],
              },
              {
                id: 'pmw-s4-b10',
                type: 'match',
                prompt: 'Pasangkan situasi dengan alasan cara berurutan cocok di sana.',
                pairs: [
                  { id: 'pmw-s4-b10-p1', left: 'Izin bangunan', right: 'Urutan berkas ditentukan aturan resmi, tidak bisa dilompati' },
                  { id: 'pmw-s4-b10-p2', left: 'Acara pernikahan', right: 'Tanggal mati dan tidak ada kesempatan mengulang' },
                  { id: 'pmw-s4-b10-p3', left: 'Audit tahunan', right: 'Ruang lingkup dan format laporan sudah baku' },
                  { id: 'pmw-s4-b10-p4', left: 'Pengadaan barang pemerintah', right: 'Melompati tahap bukan sekadar tidak rapi, tetapi tidak sah' },
                  { id: 'pmw-s4-b10-p5', left: 'Kontrak harga tetap', right: 'Butuh rancangan lengkap sebelum satu angka harga bisa dijanjikan' },
                ],
              },
              {
                id: 'pmw-s4-b11',
                type: 'check',
                question:
                  'Tim katering diminta memakai cara kerja dua mingguan untuk acara yang tanggalnya mati enam minggu lagi. Tanggapan paling masuk akal?',
                options: [
                  { id: 'pmw-s4-b11-o1', text: 'Ikuti saja sepenuhnya, karena cara dua mingguan selalu lebih modern' },
                  { id: 'pmw-s4-b11-o2', text: 'Tolak semua cara baru dan kerjakan seperti biasa tanpa penjelasan apa pun' },
                  {
                    id: 'pmw-s4-b11-o3',
                    text: 'Tetap pakai rencana berurutan untuk pemesanan dan tanggal, tetapi ambil kebiasaan baiknya: mencicipi menu lebih awal dan evaluasi singkat mingguan',
                  },
                  { id: 'pmw-s4-b11-o4', text: 'Hapus seluruh jadwal, ganti dengan papan tugas tanpa tanggal' },
                ],
                correctOptionId: 'pmw-s4-b11-o3',
                explanation:
                  'Pemesanan bahan dan tanggal acara tidak bisa dilenturkan, jadi di sana rencana berurutan wajib. Tetapi kebiasaan baik dari cara lincah tetap bisa diambil: menunjukkan hasil lebih awal lewat sesi mencicipi, dan evaluasi rutin yang singkat. Menelan mentah-mentah atau menolak mentah-mentah sama-sama malas berpikir, dan menghapus jadwal untuk acara bertanggal mati adalah cara tercepat menuju kekacauan.',
              },
              {
                id: 'pmw-s4-b12',
                type: 'text',
                title: 'Campuran itu sah',
                body: 'Anda tidak wajib memilih satu cara dan membuang yang lain. Banyak organisasi menyusun rencana besar dan tonggak waktu secara berurutan, lalu menjalankan pekerjaan harian dengan cara yang lebih mengalir.\n\nContohnya panitia hajatan: tanggal, gedung, dan katering dikunci berurutan sejak awal; sementara urusan dekorasi, susunan acara, dan pembagian tugas panitia dibahas ulang setiap minggu.\n\nYang penting bukan kesetiaan pada satu nama metode, melainkan kejujuran menilai: bagian mana dari pekerjaan ini yang benar-benar tidak boleh berubah, dan bagian mana yang masih perlu dicari bentuknya.',
              },
              {
                id: 'pmw-s4-b13',
                type: 'keypoint',
                title: 'Ringkasan',
                points: [
                  'Waterfall menang saat kebutuhan sudah pasti, aturan sudah baku, atau perubahan sangat mahal.',
                  'Izin, akreditasi, audit, pengadaan pemerintah, dan acara bertanggal mati adalah wilayahnya.',
                  'Kontrak harga tetap hampir selalu menuntut rancangan lengkap di depan.',
                  'Campuran itu sah — dan sering merupakan jawaban paling dewasa.',
                ],
              },
              {
                id: 'pmw-s4-b14',
                type: 'reflect',
                prompt:
                  'Sebutkan satu pekerjaan di tempat Anda yang justru lebih baik dikerjakan berurutan. Tanda mana dari lima tanda tadi yang paling kuat terlihat di sana?',
                placeholder: 'Pekerjaan: ... / Tanda yang paling terlihat: ... / Alasannya: ...',
              },
            ],
          },
        },
        {
          id: 'pmw-s4-quiz',
          type: 'quiz',
          title: 'Kuis: Kapan Waterfall Tepat',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmw-s4-q1',
                text: 'Manakah yang BUKAN tanda bahwa cara berurutan cocok dipakai?',
                points: 1,
                options: [
                  { id: 'pmw-s4-q1-o1', text: 'Ada aturan resmi dengan urutan yang sudah baku' },
                  { id: 'pmw-s4-q1-o2', text: 'Biaya satu kesalahan sangat besar' },
                  { id: 'pmw-s4-q1-o3', text: 'Kebutuhan pemakai masih terus berubah setiap minggu' },
                  { id: 'pmw-s4-q1-o4', text: 'Tanggal selesai mati dan tidak bisa digeser' },
                ],
                correctOptionId: 'pmw-s4-q1-o3',
              },
              {
                id: 'pmw-s4-q2',
                text: 'Kenapa kontrak harga tetap biasanya berpasangan dengan cara berurutan?',
                points: 1,
                options: [
                  { id: 'pmw-s4-q2-o1', text: 'Karena harga tetap melarang penggunaan papan kerja' },
                  { id: 'pmw-s4-q2-o2', text: 'Karena satu angka harga hanya bisa dijanjikan kalau ruang lingkupnya dirancang lengkap di depan' },
                  { id: 'pmw-s4-q2-o3', text: 'Karena cara berurutan selalu lebih murah bagi kedua pihak' },
                  { id: 'pmw-s4-q2-o4', text: 'Karena aturan pajak mensyaratkan demikian' },
                ],
                correctOptionId: 'pmw-s4-q2-o2',
              },
              {
                id: 'pmw-s4-q3',
                text: 'Pada pengadaan barang pemerintah, melompati salah satu tahap berarti...',
                points: 1,
                options: [
                  { id: 'pmw-s4-q3-o1', text: 'Prosesnya jadi lebih efisien dan patut ditiru' },
                  { id: 'pmw-s4-q3-o2', text: 'Prosesnya bukan hanya tidak rapi, tetapi bisa menjadi tidak sah' },
                  { id: 'pmw-s4-q3-o3', text: 'Tidak berpengaruh selama hasil akhirnya bagus' },
                  { id: 'pmw-s4-q3-o4', text: 'Cukup diperbaiki dengan menambah satu rapat' },
                ],
                correctOptionId: 'pmw-s4-q3-o2',
              },
              {
                id: 'pmw-s4-q4',
                text: 'Pendekatan campuran paling tepat digambarkan sebagai...',
                points: 1,
                options: [
                  { id: 'pmw-s4-q4-o1', text: 'Memakai dua metode bergantian setiap bulan' },
                  {
                    id: 'pmw-s4-q4-o2',
                    text: 'Mengunci rencana besar dan tonggak waktu secara berurutan, lalu menjalankan pekerjaan harian secara lebih mengalir',
                  },
                  { id: 'pmw-s4-q4-o3', text: 'Membiarkan setiap orang memilih cara kerjanya sendiri-sendiri' },
                  { id: 'pmw-s4-q4-o4', text: 'Menghapus semua jadwal dan mengandalkan rapat harian' },
                ],
                correctOptionId: 'pmw-s4-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pmw-s4-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmw-s4-c1', text: 'Saya bisa menyebutkan lima tanda bahwa cara berurutan adalah pilihan yang tepat.' },
              { id: 'pmw-s4-c2', text: 'Saya bisa memberi satu contoh nyata dari lingkungan saya sendiri, bukan contoh di buku.' },
              { id: 'pmw-s4-c3', text: 'Saya paham hubungan antara kontrak harga tetap dan rancangan lengkap di depan.' },
              { id: 'pmw-s4-c4', text: 'Saya bisa mengenali tanda cara lincah yang dipaksakan di tempat yang salah.' },
              { id: 'pmw-s4-c5', text: 'Saya tahu bahwa pendekatan campuran itu sah dan sering paling masuk akal.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 5 — Kelemahan jujurnya
    // -------------------------------------------------------------------
    {
      id: 'pmw-s5',
      title: 'Kelemahan Jujurnya',
      summary:
        'Biaya perubahan yang naik terus, hasil yang baru terlihat di akhir, dan permintaan tambahan yang diam-diam menjebol jadwal.',
      activities: [
        {
          id: 'pmw-s5-lesson',
          type: 'lesson',
          title: 'Rumah Selesai, Ternyata Salah Kamar',
          lesson: {
            blocks: [
              {
                id: 'pmw-s5-b1',
                type: 'text',
                title: 'Kisah yang terlalu sering terjadi',
                body: 'Pak Hasan membangun rumah. Denah disetujui, dinding berdiri, cat kering, kunci diserahkan.\n\nBaru saat pindahan ia sadar: kamar anak terlalu sempit untuk dua tempat tidur, dan dapur menghadap matahari sore sehingga panas sepanjang siang.\n\nTidak ada yang berbuat curang. Denahnya memang ditandatangani Pak Hasan sendiri. Masalahnya, ia tidak bisa membayangkan denah itu sampai ia berdiri di dalamnya.\n\nInilah kelemahan paling dalam dari cara berurutan: hasil utuh baru terlihat di akhir, saat memperbaikinya paling mahal.',
              },
              {
                id: 'pmw-s5-b2',
                type: 'keypoint',
                title: 'Empat kelemahan yang harus Anda tahu',
                points: [
                  'Hasil utuh baru terlihat menjelang akhir — salah paham ketahuan terlambat.',
                  'Kesalahan di tahap kebutuhan bisa tidak ketahuan berbulan-bulan karena semua tahap berikutnya berdiri di atasnya.',
                  'Perubahan di tengah jalan menabrak pekerjaan yang sudah selesai dan sudah dibayar.',
                  'Dokumen tebal bertanda tangan tidak sama dengan kesepahaman yang nyata.',
                ],
              },
              {
                id: 'pmw-s5-b3',
                type: 'text',
                title: 'Harga sebuah kesalahan naik seiring waktu',
                body: 'Mengubah letak kamar mandi di atas kertas: satu jam kerja juru gambar. Mengubahnya setelah fondasi dicor: bongkar dan cor ulang. Mengubahnya setelah rumah jadi: hampir sama dengan membangun ulang bagian itu.\n\nKesalahannya sama persis. Yang berbeda hanya kapan ia ditemukan.\n\nItu sebabnya semua cara meredam kelemahan Waterfall bermuara pada satu kalimat: temukan salah paham lebih awal, selagi masih murah.',
              },
              {
                id: 'pmw-s5-b4',
                type: 'check',
                question:
                  'Kenapa kesalahan di tahap kebutuhan jauh lebih berbahaya daripada kesalahan di tahap pengerjaan?',
                options: [
                  { id: 'pmw-s5-b4-o1', text: 'Karena tahap kebutuhan biasanya dikerjakan orang yang kurang berpengalaman' },
                  { id: 'pmw-s5-b4-o2', text: 'Karena semua tahap berikutnya dibangun di atasnya, sehingga koreksinya membongkar banyak pekerjaan' },
                  { id: 'pmw-s5-b4-o3', text: 'Karena tahap kebutuhan tidak pernah didokumentasikan siapa pun' },
                  { id: 'pmw-s5-b4-o4', text: 'Karena tahap kebutuhan memakan biaya paling besar' },
                ],
                correctOptionId: 'pmw-s5-b4-o2',
                explanation:
                  'Tahap kebutuhan adalah fondasi semua keputusan berikutnya: rancangan, pengerjaan, dan pemeriksaan semuanya mengacu ke sana. Satu salah paham di titik itu menular ke seluruh pekerjaan setelahnya. Bukan karena orangnya kurang pintar, bukan karena tidak dicatat, dan bukan karena mahal — tahap kebutuhan justru tahap paling murah. Bahayanya murni karena posisinya paling awal.',
              },
              {
                id: 'pmw-s5-b5',
                type: 'text',
                title: 'Ruang lingkup yang melar',
                body: 'Ada godaan yang sangat manusiawi: menambah permintaan kecil di tengah jalan tanpa mengubah tanggal maupun biaya. "Cuma tambah satu spanduk." "Sekalian rak kecil di pojok." "Tambah satu kolom saja di laporannya."\n\nSatu per satu terasa sepele dan menolaknya terasa tidak enak. Tetapi digabung, tambahan-tambahan itu menjebol jadwal, dan tidak ada satu pun yang tercatat sebagai penyebab.\n\nIstilah untuk gejala ini adalah ruang lingkup yang melar, atau dalam bahasa asing scope creep — creep artinya merayap, karena ia bertambah pelan-pelan sampai Anda tidak sadar sudah kejauhan.',
              },
              {
                id: 'pmw-s5-b6',
                type: 'flashcard',
                front: 'Apa itu ruang lingkup yang melar (scope creep)?',
                back: 'Permintaan tambahan kecil yang terus masuk tanpa pernah dicatat atau dihitung dampaknya pada tanggal dan biaya. Bedanya dengan perubahan yang sah: perubahan yang sah diajukan, dihitung, dan disetujui. Yang melar cuma diucapkan lewat obrolan, lalu dikerjakan diam-diam.',
              },
              {
                id: 'pmw-s5-b7',
                type: 'keypoint',
                title: 'Tanda ruang lingkup Anda sedang melar',
                points: [
                  'Tim sering mengerjakan hal yang tidak ada di rencana, tetapi semua merasa itu wajar.',
                  'Kalimat "sekalian saja" muncul beberapa kali dalam seminggu.',
                  'Tidak ada catatan tambahan permintaan, jadi tidak ada yang bisa menghitung totalnya.',
                  'Tanggal selesai mundur berkali-kali tanpa satu pun sebab yang bisa ditunjuk.',
                ],
              },
              {
                id: 'pmw-s5-b8',
                type: 'check',
                question:
                  'Klien menelepon dan meminta dua halaman tambahan pada brosur. Anda menyanggupi. Apa langkah berikutnya yang paling penting?',
                options: [
                  { id: 'pmw-s5-b8-o1', text: 'Langsung memberi tahu tim supaya segera dikerjakan hari ini' },
                  {
                    id: 'pmw-s5-b8-o2',
                    text: 'Menuliskan permintaan itu beserta dampaknya pada tanggal cetak dan biaya, lalu mengirimkannya untuk dikonfirmasi',
                  },
                  { id: 'pmw-s5-b8-o3', text: 'Menunggu sampai rapat bulanan berikutnya untuk membahasnya' },
                  { id: 'pmw-s5-b8-o4', text: 'Mencatatnya di buku pribadi supaya tidak lupa' },
                ],
                correctOptionId: 'pmw-s5-b8-o2',
                explanation:
                  'Permintaan lisan yang tidak pernah dituliskan adalah sumber perselisihan nomor satu di proyek berurutan. Menuliskan dampaknya dan meminta konfirmasi butuh lima menit, dan mengubah percakapan telepon menjadi kesepakatan yang bisa dirujuk. Langsung mengerjakan memindahkan seluruh risiko ke tim. Menunggu rapat bulanan terlalu lambat untuk pekerjaan yang sedang berjalan. Catatan pribadi tidak menolong karena hanya Anda yang melihatnya.',
              },
              {
                id: 'pmw-s5-b9',
                type: 'text',
                title: 'Obat paling murah: contoh awal',
                body: 'Sebelum membangun yang besar, buat sesuatu kecil yang bisa dilihat dan disentuh. Maket kardus. Denah yang digambar dengan lakban di lantai supaya pemilik bisa berjalan di dalamnya. Satu potong seragam contoh. Satu porsi menu untuk dicicipi. Satu halaman brosur jadi.\n\nDalam istilah teknis ini disebut purwarupa atau contoh awal. Biayanya kecil, dibuat dalam hitungan jam, dan hampir selalu memunculkan pertanyaan yang tidak pernah terpikir saat orang membaca dokumen.\n\nSeandainya Pak Hasan sempat berjalan di antara garis lakban di lantai, ia mungkin langsung berkata: "kamar anak ini kok sempit ya?"',
              },
              {
                id: 'pmw-s5-b10',
                type: 'fillblank',
                sentence: 'Semakin ___ sebuah kesalahan ditemukan, semakin mahal biaya memperbaikinya.',
                answer: 'terlambat',
                options: ['terlambat', 'cepat', 'sering'],
              },
              {
                id: 'pmw-s5-b11',
                type: 'match',
                prompt: 'Pasangkan kelemahan dengan cara meredamnya.',
                pairs: [
                  { id: 'pmw-s5-b11-p1', left: 'Hasil baru terlihat di akhir', right: 'Buat contoh awal atau maket sejak dini' },
                  { id: 'pmw-s5-b11-p2', left: 'Salah paham di tahap kebutuhan', right: 'Tinjauan berkala bersama pemilik, bukan hanya di gerbang tahap' },
                  { id: 'pmw-s5-b11-p3', left: 'Ruang lingkup yang melar', right: 'Catat setiap permintaan tambahan beserta dampaknya sebelum menyanggupi' },
                  { id: 'pmw-s5-b11-p4', left: 'Dokumen tebal tanpa kesepahaman', right: 'Pastikan penandatangan benar-benar melihat dan mengerti isinya' },
                ],
              },
              {
                id: 'pmw-s5-b12',
                type: 'text',
                title: 'Kesimpulan yang jujur',
                body: 'Waterfall bukan cara yang buruk. Ia cara yang menuntut satu syarat: kebutuhannya harus benar-benar sudah diketahui.\n\nKalau syarat itu terpenuhi, ia memberi kepastian yang sulit ditandingi cara lain. Kalau tidak terpenuhi, ia mengubah ketidaktahuan Anda menjadi rencana yang tampak meyakinkan lengkap dengan tanggal dan angka.\n\nDan rencana yang tampak meyakinkan padahal berdiri di atas tebakan jauh lebih berbahaya daripada mengakui terus terang bahwa Anda memang belum tahu.',
              },
              {
                id: 'pmw-s5-b13',
                type: 'keypoint',
                title: 'Tiga obat yang bisa dipakai besok',
                points: [
                  'Buat satu contoh awal yang bisa dilihat sebelum pekerjaan besar dimulai.',
                  'Jadwalkan tinjauan bersama pemilik di tengah jalan, bukan hanya di akhir tahap.',
                  'Punya satu tempat mencatat semua permintaan tambahan beserta dampaknya.',
                  'Pastikan orang yang menandatangani benar-benar melihat hasilnya, bukan sekadar percaya laporan.',
                ],
              },
              {
                id: 'pmw-s5-b14',
                type: 'reflect',
                prompt:
                  'Ingat satu pekerjaan yang hasilnya mengecewakan padahal semua sudah disetujui di awal. Contoh awal sederhana seperti apa yang, seandainya dibuat, bisa memunculkan masalah itu lebih cepat?',
                placeholder: 'Kejadiannya: ... / Contoh awal yang seharusnya dibuat: ... / Biayanya kira-kira: ...',
              },
            ],
          },
        },
        {
          id: 'pmw-s5-quiz',
          type: 'quiz',
          title: 'Kuis: Kelemahan Waterfall',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmw-s5-q1',
                text: 'Kelemahan paling mendasar cara berurutan adalah...',
                points: 1,
                options: [
                  { id: 'pmw-s5-q1-o1', text: 'Tidak bisa dipakai untuk proyek besar' },
                  { id: 'pmw-s5-q1-o2', text: 'Hasil utuh baru terlihat menjelang akhir, saat perbaikan paling mahal' },
                  { id: 'pmw-s5-q1-o3', text: 'Tidak memerlukan dokumen sama sekali' },
                  { id: 'pmw-s5-q1-o4', text: 'Selalu membutuhkan tim yang sangat besar' },
                ],
                correctOptionId: 'pmw-s5-q1-o2',
              },
              {
                id: 'pmw-s5-q2',
                text: '"Ruang lingkup yang melar" paling tepat dijelaskan sebagai...',
                points: 1,
                options: [
                  { id: 'pmw-s5-q2-o1', text: 'Satu perubahan besar yang diajukan resmi dan disetujui pemilik' },
                  { id: 'pmw-s5-q2-o2', text: 'Banyak tambahan kecil yang tidak pernah dicatat maupun dihitung dampaknya' },
                  { id: 'pmw-s5-q2-o3', text: 'Anggaran yang sengaja dinaikkan di tengah jalan' },
                  { id: 'pmw-s5-q2-o4', text: 'Tim yang bekerja lebih lambat dari perkiraan' },
                ],
                correctOptionId: 'pmw-s5-q2-o2',
              },
              {
                id: 'pmw-s5-q3',
                text: 'Apa gunanya membuat contoh awal (purwarupa)?',
                points: 1,
                options: [
                  { id: 'pmw-s5-q3-o1', text: 'Memenuhi syarat administrasi proyek' },
                  { id: 'pmw-s5-q3-o2', text: 'Memunculkan salah paham lebih awal dengan biaya yang masih kecil' },
                  { id: 'pmw-s5-q3-o3', text: 'Menggantikan seluruh tahap pengerjaan' },
                  { id: 'pmw-s5-q3-o4', text: 'Menghapus kebutuhan akan persetujuan tertulis' },
                ],
                correctOptionId: 'pmw-s5-q3-o2',
              },
              {
                id: 'pmw-s5-q4',
                text: 'Pernyataan yang paling tepat tentang dokumen bertanda tangan adalah...',
                points: 1,
                options: [
                  { id: 'pmw-s5-q4-o1', text: 'Tanda tangan menjamin kedua pihak benar-benar sepaham' },
                  { id: 'pmw-s5-q4-o2', text: 'Tanda tangan mencatat persetujuan, tetapi tidak menjamin isinya benar-benar dipahami' },
                  { id: 'pmw-s5-q4-o3', text: 'Dokumen sebaiknya dihindari supaya tidak memperlambat pekerjaan' },
                  { id: 'pmw-s5-q4-o4', text: 'Semakin tebal dokumennya, semakin kecil risiko salah paham' },
                ],
                correctOptionId: 'pmw-s5-q4-o2',
              },
            ],
          },
        },
        {
          id: 'pmw-s5-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmw-s5-c1', text: 'Saya bisa menjelaskan kenapa biaya perbaikan naik seiring berjalannya pekerjaan.' },
              { id: 'pmw-s5-c2', text: 'Saya bisa menjelaskan arti "ruang lingkup yang melar" dengan contoh dari tempat saya.' },
              { id: 'pmw-s5-c3', text: 'Saya sudah memikirkan satu contoh awal murah untuk pekerjaan saya berikutnya.' },
              { id: 'pmw-s5-c4', text: 'Saya punya satu tempat mencatat permintaan tambahan beserta dampaknya.' },
              { id: 'pmw-s5-c5', text: 'Saya jujur menilai apakah kebutuhan pekerjaan saya benar-benar sudah diketahui.' },
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------------
    // 6 — Rambu praktis + menjalankan dengan rapi
    // -------------------------------------------------------------------
    {
      id: 'pmw-s6',
      title: 'Rambu Praktis: Memilih, Menjalankan, Menutup',
      summary:
        'Kebiasaan mingguan yang membuat rencana tetap hidup, cara menutup pekerjaan dengan rapi, dan rambu memilih Waterfall atau tidak.',
      activities: [
        {
          id: 'pmw-s6-lesson',
          type: 'lesson',
          title: 'Dari Irama Mingguan sampai Kunci Diserahkan',
          lesson: {
            blocks: [
              {
                id: 'pmw-s6-b1',
                type: 'text',
                title: 'Rencana bagus tidak menjalankan dirinya sendiri',
                body: 'Banyak pekerjaan berurutan gagal bukan karena rencananya jelek, tetapi karena setelah rencana disetujui, tidak ada lagi yang membandingkannya dengan kenyataan.\n\nRencana masuk laci. Semua orang sibuk. Tiga bulan kemudian baru ketahuan sudah melenceng jauh.\n\nYang dibutuhkan cuma satu kebiasaan: pertemuan singkat mingguan, tiga puluh menit, dengan satu pertanyaan utama — di mana kita sekarang dibanding rencana?',
              },
              {
                id: 'pmw-s6-b2',
                type: 'keypoint',
                title: 'Laporan status tiga baris',
                points: [
                  'Sudah selesai minggu ini — apa yang benar-benar tuntas, bukan yang "hampir".',
                  'Akan dikerjakan minggu depan — lengkap dengan nama orangnya.',
                  'Yang menghambat — hal yang butuh keputusan atau bantuan orang lain.',
                  'Lalu satu baris penutup: tanggal selesai masih sama atau bergeser? Jawab dengan tanggal, bukan dengan kata "aman".',
                ],
              },
              {
                id: 'pmw-s6-b3',
                type: 'check',
                question: 'Manakah laporan status yang paling berguna bagi pemilik pekerjaan?',
                options: [
                  { id: 'pmw-s6-b3-o1', text: '"Semua berjalan aman dan lancar."' },
                  {
                    id: 'pmw-s6-b3-o2',
                    text: '"Tiga dari empat pekerjaan minggu ini tuntas. Pemasangan listrik mundur karena bahan telat; tanggal serah terima bergeser dari 12 ke 14."',
                  },
                  { id: 'pmw-s6-b3-o3', text: '"Tim sudah bekerja sangat keras minggu ini."' },
                  { id: 'pmw-s6-b3-o4', text: '"Kemajuan sekitar 80 persen."' },
                ],
                correctOptionId: 'pmw-s6-b3-o2',
                explanation:
                  'Laporan yang berguna menyebut apa yang tuntas, apa yang tersendat beserta sebabnya, dan dampaknya pada tanggal. "Aman dan lancar" tidak bisa ditindaklanjuti siapa pun. Pujian atas kerja keras itu baik, tetapi bukan informasi kemajuan. Dan angka persen tanpa penjelasan hampir selalu menyembunyikan bagian yang paling sulit — 80 persen bisa bertahan tiga minggu.',
              },
              {
                id: 'pmw-s6-b4',
                type: 'text',
                title: 'Mengatur perubahan tanpa birokrasi',
                body: 'Mengatur perubahan terdengar berat, padahal isinya cuma empat langkah: permintaan ditulis, dampaknya dihitung, satu orang memutuskan, keputusannya dicatat.\n\nUntuk pekerjaan berukuran kecil dan menengah, satu tabel dengan lima kolom sudah cukup: tanggal, siapa yang meminta, apa yang diminta, dampak pada tanggal dan biaya, disetujui atau tidak.\n\nSatu tabel itu menghentikan sebagian besar perselisihan di akhir pekerjaan. Bukan karena isinya sakti, tetapi karena semua orang melihat angka yang sama.',
              },
              {
                id: 'pmw-s6-b5',
                type: 'flashcard',
                front: 'Apa isi permintaan perubahan yang lengkap?',
                back: 'Apa yang diminta, alasannya, dampaknya pada tanggal dan biaya, pilihan yang tersedia, dan siapa yang memutuskan. Tanpa bagian dampak, itu bukan permintaan perubahan — itu baru sebuah harapan.',
              },
              {
                id: 'pmw-s6-b6',
                type: 'text',
                title: 'Serah terima yang tidak menggantung',
                body: 'Banyak pekerjaan tidak pernah benar-benar berakhir. Hasilnya sudah dipakai, tetapi masih ada daftar kecil yang menggantung berbulan-bulan, dan tidak ada yang berani bilang selesai.\n\nSerah terima yang rapi punya tiga bagian: pemilik memeriksa hasil bersama pelaksana, semua kekurangan dicatat dalam satu daftar lengkap dengan tanggal penyelesaian, lalu ada pernyataan bahwa hasil diterima.\n\nTanpa langkah ketiga, tim tidak pernah bisa pindah ke pekerjaan berikutnya dengan tenang — dan pekerjaan lama diam-diam terus memakan waktu mereka.',
              },
              {
                id: 'pmw-s6-b7',
                type: 'keypoint',
                title: 'Daftar penutupan pekerjaan',
                points: [
                  'Hasil sudah diperiksa dan diterima secara tertulis oleh pemilik.',
                  'Daftar kekurangan sudah tuntas, atau disepakati siapa yang menyelesaikan dan kapan.',
                  'Semua pembayaran dan tagihan pihak luar sudah beres.',
                  'Dokumen, kunci, akun, dan panduan pemakaian sudah diserahkan.',
                  'Evaluasi akhir sudah dilakukan dan catatannya disimpan di tempat yang mudah ditemukan.',
                ],
              },
              {
                id: 'pmw-s6-b8',
                type: 'fillblank',
                sentence: 'Sebelum sebuah pekerjaan ditutup, hasilnya harus diperiksa dan ___ oleh pemilik.',
                answer: 'diterima',
                options: ['diterima', 'dipublikasikan', 'diarsipkan'],
              },
              {
                id: 'pmw-s6-b9',
                type: 'text',
                title: 'Rambu memilih: tiga pertanyaan sebelum memutuskan',
                body: 'Sebelum menentukan cara kerja, jawab tiga pertanyaan dengan jujur.\n\nPertama: apakah kami sudah benar-benar tahu hasil akhir yang diinginkan, atau masih menebak? Kedua: kalau nanti berubah di tengah jalan, seberapa mahal biayanya? Ketiga: apakah ada aturan, izin, atau kontrak yang urutannya sudah dikunci pihak lain?\n\nSemakin sering jawabannya "sudah tahu, mahal kalau berubah, dan urutannya dikunci", semakin jelas cara berurutan adalah pilihan yang benar.',
              },
              {
                id: 'pmw-s6-b10',
                type: 'keypoint',
                title: 'Pilih Waterfall kalau...',
                points: [
                  'Hasil akhirnya sudah pasti dan bisa dijelaskan sekarang juga.',
                  'Ada aturan, izin, atau standar yang urutannya tidak bisa Anda atur.',
                  'Membongkar hasil yang sudah jadi sangat mahal atau tidak mungkin.',
                  'Tanggalnya mati, dan pihak luar butuh kepastian jauh hari.',
                  'Anda harus menjanjikan satu angka harga untuk seluruh pekerjaan.',
                ],
              },
              {
                id: 'pmw-s6-b11',
                type: 'check',
                question:
                  'Sebuah sekolah ingin membuat program ekstrakurikuler baru: bentuknya belum jelas, mau dicoba dulu ke beberapa kelas, dan bisa dihentikan kalau tidak diminati. Cara kerja yang lebih pas?',
                options: [
                  { id: 'pmw-s6-b11-o1', text: 'Waterfall penuh: kunci seluruh rancangan setahun ke depan sebelum mulai' },
                  {
                    id: 'pmw-s6-b11-o2',
                    text: 'Cara yang lebih mengalir: coba di satu kelas dulu, tinjau hasilnya, sesuaikan, baru diperluas',
                  },
                  { id: 'pmw-s6-b11-o3', text: 'Waterfall, karena sekolah adalah lembaga resmi sehingga wajib berurutan' },
                  { id: 'pmw-s6-b11-o4', text: 'Tidak usah direncanakan sama sekali, biarkan berjalan apa adanya' },
                ],
                correctOptionId: 'pmw-s6-b11-o2',
                explanation:
                  'Bentuknya belum jelas dan biaya berubah arah masih murah — dua tanda kuat bahwa mencoba lalu menyesuaikan lebih menguntungkan. Mengunci rancangan setahun ke depan berarti mengunci tebakan. Status sekolah sebagai lembaga resmi tidak otomatis mewajibkan cara berurutan; yang mewajibkan adalah aturan tertentu seperti akreditasi. Dan tanpa rencana sama sekali, tidak ada yang bisa dipelajari dari percobaannya.',
              },
              {
                id: 'pmw-s6-b12',
                type: 'keypoint',
                title: 'Pikir ulang kalau...',
                points: [
                  'Kebutuhannya masih berubah setiap kali Anda berbicara dengan pemakainya.',
                  'Anda ingin tahu dulu apakah sesuatu diminati sebelum membuatnya penuh.',
                  'Biaya mengubah arah masih murah — misalnya baru berupa tulisan atau contoh kecil.',
                  'Tidak ada pihak luar yang menuntut kepastian tanggal maupun angka harga.',
                ],
              },
              {
                id: 'pmw-s6-b13',
                type: 'match',
                prompt: 'Pasangkan kegiatan dengan tujuannya.',
                pairs: [
                  { id: 'pmw-s6-b13-p1', left: 'Laporan status mingguan', right: 'Membandingkan kenyataan dengan rencana secara rutin' },
                  { id: 'pmw-s6-b13-p2', left: 'Tabel permintaan perubahan', right: 'Memastikan setiap tambahan tercatat dan dihitung dampaknya' },
                  { id: 'pmw-s6-b13-p3', left: 'Serah terima', right: 'Menyatakan hasil sudah diperiksa dan diterima' },
                  { id: 'pmw-s6-b13-p4', left: 'Evaluasi akhir', right: 'Mengambil pelajaran supaya pekerjaan berikutnya lebih baik' },
                ],
              },
              {
                id: 'pmw-s6-b14',
                type: 'text',
                title: 'Penutup: bukan soal setia pada satu nama',
                body: 'Waterfall bukan lawan dari cara kerja yang lebih lincah. Keduanya alat, dan setiap alat punya bahan yang cocok untuknya.\n\nAnda tidak akan memakai palu untuk memasang sekrup, dan tidak akan memakai obeng untuk memaku. Sama sekali tidak ada gengsi di dalamnya.\n\nJadi pulanglah dengan satu kebiasaan sederhana: sebelum memilih cara kerja, tanyakan dulu seberapa pasti kebutuhannya dan seberapa mahal berubah di tengah jalan. Jawaban jujur atas dua pertanyaan itu hampir selalu menunjukkan jalannya sendiri.',
              },
              {
                id: 'pmw-s6-b15',
                type: 'reflect',
                prompt:
                  'Tulis laporan status tiga baris untuk pekerjaan Anda minggu ini: sudah selesai, akan dikerjakan, yang menghambat. Lalu jawab dengan tanggal: masih sama atau bergeser?',
                placeholder: 'Selesai: ... / Berikutnya: ... / Hambatan: ... / Tanggal selesai: ...',
              },
            ],
          },
        },
        {
          id: 'pmw-s6-quiz',
          type: 'quiz',
          title: 'Kuis: Menjalankan, Menutup, Memilih',
          quiz: {
            passPercent: 60,
            questions: [
              {
                id: 'pmw-s6-q1',
                text: 'Laporan status yang berguna harus memuat...',
                points: 1,
                options: [
                  { id: 'pmw-s6-q1-o1', text: 'Pujian untuk tim dan catatan semangat kerja minggu ini' },
                  { id: 'pmw-s6-q1-o2', text: 'Apa yang tuntas, apa yang menghambat, dan dampaknya pada tanggal selesai' },
                  { id: 'pmw-s6-q1-o3', text: 'Satu angka persentase kemajuan saja' },
                  { id: 'pmw-s6-q1-o4', text: 'Daftar hadir rapat mingguan' },
                ],
                correctOptionId: 'pmw-s6-q1-o2',
              },
              {
                id: 'pmw-s6-q2',
                text: 'Sebuah permintaan perubahan belum lengkap kalau tidak memuat...',
                points: 1,
                options: [
                  { id: 'pmw-s6-q2-o1', text: 'Nama lengkap semua anggota tim' },
                  { id: 'pmw-s6-q2-o2', text: 'Dampaknya pada tanggal dan biaya' },
                  { id: 'pmw-s6-q2-o3', text: 'Riwayat seluruh perubahan sebelumnya' },
                  { id: 'pmw-s6-q2-o4', text: 'Tanda tangan seluruh pelaksana di lapangan' },
                ],
                correctOptionId: 'pmw-s6-q2-o2',
              },
              {
                id: 'pmw-s6-q3',
                text: 'Kenapa pekerjaan butuh pernyataan penerimaan di akhir?',
                points: 1,
                options: [
                  { id: 'pmw-s6-q3-o1', text: 'Supaya ada satu dokumen tambahan untuk arsip' },
                  { id: 'pmw-s6-q3-o2', text: 'Supaya pekerjaan benar-benar berakhir dan tim bisa pindah dengan tenang' },
                  { id: 'pmw-s6-q3-o3', text: 'Supaya pembayaran bisa ditunda lebih lama' },
                  { id: 'pmw-s6-q3-o4', text: 'Supaya daftar kekurangan tidak perlu dibuat' },
                ],
                correctOptionId: 'pmw-s6-q3-o2',
              },
              {
                id: 'pmw-s6-q4',
                text: 'Manakah situasi yang sebaiknya TIDAK dipaksakan memakai Waterfall?',
                points: 1,
                options: [
                  { id: 'pmw-s6-q4-o1', text: 'Mengurus izin bangunan dengan urutan berkas yang ditentukan pemerintah' },
                  { id: 'pmw-s6-q4-o2', text: 'Menggelar pernikahan dengan tanggal yang tidak bisa digeser' },
                  { id: 'pmw-s6-q4-o3', text: 'Mencoba layanan baru yang bentuknya belum jelas dan masih ingin diuji ke sedikit orang' },
                  { id: 'pmw-s6-q4-o4', text: 'Mengerjakan kontrak berharga tetap untuk pemasangan 500 kursi' },
                ],
                correctOptionId: 'pmw-s6-q4-o3',
              },
            ],
          },
        },
        {
          id: 'pmw-s6-check',
          type: 'checklist',
          title: 'Tinjauan Mandiri',
          checklist: {
            items: [
              { id: 'pmw-s6-c1', text: 'Saya punya kebiasaan laporan status mingguan tiga baris beserta jawaban soal tanggal.' },
              { id: 'pmw-s6-c2', text: 'Saya mencatat setiap permintaan perubahan beserta dampaknya sebelum menyanggupi.' },
              { id: 'pmw-s6-c3', text: 'Saya tahu tiga bagian serah terima yang rapi dan punya daftar penutupan yang bisa dipakai berulang.' },
              { id: 'pmw-s6-c4', text: 'Saya bisa menjawab tiga pertanyaan rambu sebelum memilih cara kerja untuk pekerjaan baru.' },
              { id: 'pmw-s6-c5', text: 'Saya bisa menjelaskan kapan Waterfall sebaiknya TIDAK dipakai, tanpa merendahkan cara mana pun.' },
            ],
          },
        },
      ],
    },
  ],
};
