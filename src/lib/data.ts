// Semua nama orang, masjid, dan kegiatan di berkas ini rekaan untuk demo.

export const SITUS = {
  url: 'https://app-masjid.pintuweb.id',
  slug: 'masjid',
  kontak: 'https://www.pintuweb.id/kontak?demo=masjid',
};

export const MASJID = {
  nama: 'Masjid Nurul Ufuk',
  pendek: 'Nurul Ufuk',
  arab: 'مسجد نور الأفق',
  arti: 'Cahaya di cakrawala',
  kota: 'Tulungagung, Jawa Timur',
  alamat: 'Alamat rekaan untuk demo · Tulungagung',
  kapasitas: '± 650 jemaah',
  takmir: 'Ketua takmir: H. Mujib Santoso',
  bendahara: 'Bendahara: Ibu Laila Nur Hidayah',
};

export type Orang = { id: string; nama: string; peran: string; warna: string; jenis: 'peci' | 'kerudung' | 'sorban' };

export const ORANG: Record<string, Orang> = {
  hanif: { id: 'hanif', nama: 'Ustaz Hanif Arrozi', peran: 'Imam rawatib', warna: '#2D3C74', jenis: 'peci' },
  fathul: { id: 'fathul', nama: 'Ustaz Fathul Mubin', peran: 'Pengasuh kajian fikih', warna: '#3D6638', jenis: 'peci' },
  salim: { id: 'salim', nama: 'Kiai Nur Salim Hadi', peran: 'Penasihat takmir', warna: '#8A5A12', jenis: 'sorban' },
  zainal: { id: 'zainal', nama: 'Ustaz Zainal Muttaqin', peran: 'Pengajar tahsin', warna: '#A3441D', jenis: 'peci' },
  dimas: { id: 'dimas', nama: 'Ustaz Dimas Abdul Karim', peran: 'Khatib tamu', warna: '#4B3F72', jenis: 'peci' },
  farida: { id: 'farida', nama: 'Ustazah Nuril Farida', peran: 'Pengasuh kajian muslimah', warna: '#6B3A52', jenis: 'kerudung' },
  rizal: { id: 'rizal', nama: 'Mas Rizal Hamdani', peran: 'Muazin', warna: '#33566B', jenis: 'peci' },
  bagus: { id: 'bagus', nama: 'Mas Bagus Sholeh', peran: 'Muazin', warna: '#5A5A2E', jenis: 'peci' },
};

/** Patokan waktu kajian: setelah salat tertentu (jam dihitung dari jadwal hari itu) atau jam tetap. */
export type Patokan = { bakda: 'subuh' | 'asar' | 'magrib' | 'isya'; tunda: number } | { jam: string };

export type Kajian = {
  id: string;
  judul: string;
  kitab?: string;
  hari: number[]; // 0 = Minggu (Ahad)
  patokan: Patokan;
  durasi: number; // menit
  pemateri: string;
  tempat: string;
  untuk: string;
  ringkas: string;
  isi: string[];
  kuota?: number;
  terdaftar?: number;
};

export const KAJIAN: Kajian[] = [
  {
    id: 'safinah',
    judul: 'Fikih ibadah dasar',
    kitab: 'Kitab Safinatun Najah',
    hari: [1],
    patokan: { bakda: 'magrib', tunda: 10 },
    durasi: 50,
    pemateri: 'fathul',
    tempat: 'Ruang utama',
    untuk: 'Umum, putra dan putri',
    ringkas: 'Membaca kitab fikih ringkas bab demi bab: taharah, salat, dan puasa.',
    isi: [
      'Kitab dibaca bersama lalu dijelaskan dengan bahasa sehari-hari. Cocok untuk yang ingin memperbaiki dasar ibadah.',
      'Pekan ini melanjutkan bab tata cara wudu dan hal-hal yang membatalkannya.',
      'Kitab boleh dibawa sendiri; takmir menyediakan salinan pinjaman di rak serambi.',
    ],
  },
  {
    id: 'kuliah-subuh',
    judul: 'Kuliah Subuh: Tafsir Juz Amma',
    hari: [2, 4],
    patokan: { bakda: 'subuh', tunda: 15 },
    durasi: 30,
    pemateri: 'hanif',
    tempat: 'Ruang utama',
    untuk: 'Umum',
    ringkas: 'Kajian singkat selepas Subuh: makna surah-surah pendek yang sering dibaca dalam salat.',
    isi: [
      'Setiap pertemuan membahas satu surah pendek: arti per kata, makna umum, dan pelajaran untuk sehari-hari.',
      'Durasi dijaga 30 menit agar jemaah tetap bisa berangkat kerja dan sekolah tepat waktu.',
    ],
  },
  {
    id: 'muslimah',
    judul: 'Kajian Muslimah: Fikih keluarga',
    hari: [3],
    patokan: { bakda: 'asar', tunda: 15 },
    durasi: 60,
    pemateri: 'farida',
    tempat: 'Serambi utara',
    untuk: 'Jemaah putri',
    ringkas: 'Obrolan hangat seputar keluarga, pengasuhan, dan ibadah sehari-hari untuk ibu dan remaja putri.',
    isi: [
      'Kajian dibuka dengan tadarus bersama, lalu materi dan sesi tanya jawab.',
      'Tersedia sudut bermain anak yang dijaga relawan, jadi ibu bisa menyimak dengan tenang.',
    ],
  },
  {
    id: 'yasinan',
    judul: 'Yasinan dan tahlil bersama',
    hari: [4],
    patokan: { bakda: 'isya', tunda: 10 },
    durasi: 45,
    pemateri: 'salim',
    tempat: 'Ruang utama',
    untuk: 'Umum',
    ringkas: 'Rutinan malam Jumat: membaca Surah Yasin dan tahlil, dilanjut ramah tamah.',
    isi: [
      'Jemaah membaca Surah Yasin dan tahlil bersama, dipimpin bergiliran oleh imam dan takmir.',
      'Ramah tamah sederhana sesudahnya disiapkan bergantian oleh warga per RT.',
    ],
  },
  {
    id: 'tahsin',
    judul: 'Kelas tahsin tilawah dewasa',
    hari: [6],
    patokan: { bakda: 'magrib', tunda: 10 },
    durasi: 60,
    pemateri: 'zainal',
    tempat: 'Ruang belajar lantai 2',
    untuk: 'Dewasa, putra dan putri (kelas terpisah)',
    ringkas: 'Belajar memperbaiki bacaan Al-Qur\'an dari makhraj huruf sampai tajwid, dalam kelompok kecil.',
    isi: [
      'Peserta dikelompokkan sesuai kemampuan setelah tes bacaan singkat di pertemuan pertama.',
      'Satu kelompok paling banyak 8 orang agar setiap peserta sempat membaca dan dikoreksi.',
      'Kelas gratis; pendaftaran diperlukan karena kuota terbatas.',
    ],
    kuota: 24,
    terdaftar: 17,
  },
  {
    id: 'riyadhus',
    judul: 'Kajian Ahad pagi',
    kitab: 'Kitab Riyadhus Shalihin',
    hari: [0],
    patokan: { jam: '06.15' },
    durasi: 60,
    pemateri: 'salim',
    tempat: 'Ruang utama',
    untuk: 'Umum',
    ringkas: 'Membaca kitab karya Imam an-Nawawi tentang akhlak dan adab, bab demi bab.',
    isi: [
      'Kajian pekanan yang paling ramai: kitab dibaca, lalu diberi penjelasan dan contoh dalam kehidupan bertetangga.',
      'Sarapan sederhana tersedia dari kas konsumsi kajian; jemaah boleh ikut menyumbang lewat kotak di serambi.',
    ],
  },
  {
    id: 'tpq',
    judul: 'TPQ anak',
    hari: [1, 2, 3, 4, 5],
    patokan: { jam: '15.30' },
    durasi: 75,
    pemateri: 'farida',
    tempat: 'Serambi selatan',
    untuk: 'Anak usia 5–12 tahun',
    ringkas: 'Taman Pendidikan Al-Qur\'an: belajar mengaji, doa harian, dan praktik wudu serta salat.',
    isi: [
      'Diasuh empat pengajar TPQ dengan jadwal Senin sampai Jumat.',
      'Wali santri bisa melihat catatan perkembangan bacaan anak di papan pengumuman serambi.',
    ],
  },
];

export const KHATIB_GILIRAN = ['salim', 'fathul', 'dimas', 'hanif', 'zainal'];
export const IMAM_GILIRAN = ['hanif', 'zainal', 'hanif', 'fathul'];
export const MUAZIN_GILIRAN = ['rizal', 'bagus'];
export const TEMA_KHUTBAH = [
  'Menjaga lisan di zaman media sosial',
  'Amanah dalam pekerjaan sehari-hari',
  'Adab bertetangga di kampung',
  'Bersyukur saat musim hujan tiba',
  'Merawat masjid sebagai rumah bersama',
  'Jujur dalam jual beli',
  'Menyayangi anak yatim di sekitar kita',
];

export type JenisAgenda = 'hijriah' | 'ahad' | 'ahadPertama';
export type Agenda = {
  id: string;
  judul: string;
  pendek: string;
  jenis: JenisAgenda;
  bulanH?: number;
  tglH?: number;
  jam: string;
  tempat: string;
  foto?: 'kurma' | 'kambing' | 'bedug' | 'wudu';
  ringkas: string;
  isi: string[];
  relawan?: string[];
  perkiraan?: boolean;
};

export const AGENDA: Agenda[] = [
  {
    id: 'kerja-bakti',
    judul: 'Kerja bakti bersih masjid',
    pendek: 'Kerja bakti',
    jenis: 'ahad',
    jam: '07.00–10.00 WIB',
    tempat: 'Halaman dan tempat wudu',
    foto: 'bedug',
    ringkas: 'Membersihkan karpet, kaca, talang, dan halaman bersama warga. Peralatan disediakan takmir.',
    isi: [
      'Fokus pekan ini: menyedot debu karpet ruang utama dan membersihkan talang menjelang musim hujan.',
      'Bawa lap dan sarung tangan bila ada. Teh hangat dan gorengan disiapkan ibu-ibu RT 03.',
    ],
    relawan: ['Kebersihan', 'Konsumsi', 'Dokumentasi'],
  },
  {
    id: 'santunan',
    judul: 'Santunan anak yatim dan duafa',
    pendek: 'Santunan',
    jenis: 'ahadPertama',
    jam: '15.30 WIB (bakda Asar)',
    tempat: 'Serambi selatan',
    ringkas: 'Penyaluran santunan triwulan untuk 32 anak yatim dan 18 keluarga duafa di sekitar masjid.',
    isi: [
      'Data penerima diperbarui bersama ketua RT agar tepat sasaran.',
      'Dana berasal dari infak program santunan; rinciannya masuk laporan kas bulan berjalan.',
    ],
    relawan: ['Among tamu', 'Pendataan', 'Konsumsi'],
  },
  {
    id: 'isra-mikraj',
    judul: 'Peringatan Isra Mikraj',
    pendek: 'Isra Mikraj',
    jenis: 'hijriah',
    bulanH: 7,
    tglH: 27,
    jam: '19.30 WIB (bakda Isya)',
    tempat: 'Ruang utama',
    ringkas: 'Pengajian umum bersama warga, diisi pembacaan selawat dan tausiah.',
    isi: [
      'Tanggal mengikuti kalender Hijriah; bila ada perubahan, takmir mengumumkannya sepekan sebelumnya.',
      'Panitia membuka pendaftaran relawan konsumsi dan parkir.',
    ],
    relawan: ['Parkir', 'Konsumsi', 'Among tamu'],
    perkiraan: true,
  },
  {
    id: 'ramadan',
    judul: 'Menyambut Ramadan',
    pendek: 'Ramadan',
    jenis: 'hijriah',
    bulanH: 9,
    tglH: 1,
    jam: 'Tarawih berjemaah setiap malam',
    tempat: 'Ruang utama dan serambi',
    foto: 'kurma',
    ringkas: 'Tarawih berjemaah, tadarus, dan takjil gratis bakda Asar selama sebulan penuh.',
    isi: [
      'Awal Ramadan resmi mengikuti hasil sidang isbat Kementerian Agama; tanggal di aplikasi adalah perkiraan.',
      'Panitia membutuhkan relawan takjil, keamanan parkir, dan kebersihan untuk 30 malam.',
      'Infak program takjil dibuka sejak sekarang agar menu berbuka bisa direncanakan.',
    ],
    relawan: ['Takjil', 'Parkir', 'Kebersihan', 'Tadarus'],
    perkiraan: true,
  },
  {
    id: 'idulfitri',
    judul: 'Salat Idulfitri',
    pendek: 'Idulfitri',
    jenis: 'hijriah',
    bulanH: 10,
    tglH: 1,
    jam: '06.00 WIB',
    tempat: 'Halaman masjid dan jalan kampung',
    ringkas: 'Salat Id berjemaah di halaman, dilanjutkan halalbihalal warga.',
    isi: [
      'Tanggal resmi mengikuti sidang isbat Kementerian Agama; tanggal di aplikasi adalah perkiraan.',
      'Penerimaan dan penyaluran zakat fitrah diatur panitia; jadwalnya diumumkan saat Ramadan.',
    ],
    relawan: ['Parkir', 'Kebersihan', 'Among tamu'],
    perkiraan: true,
  },
  {
    id: 'iduladha',
    judul: 'Salat Iduladha dan penyembelihan kurban',
    pendek: 'Iduladha',
    jenis: 'hijriah',
    bulanH: 12,
    tglH: 10,
    jam: '06.00 WIB',
    tempat: 'Halaman masjid',
    foto: 'kambing',
    ringkas: 'Salat Id, penyembelihan hewan kurban, dan pembagian daging ke warga.',
    isi: [
      'Tabungan kurban sudah dibuka: setoran mulai Rp50.000 per bulan, dicatat bendahara.',
      'Relawan dibutuhkan untuk penyembelihan, pengemasan, dan distribusi kupon.',
    ],
    relawan: ['Penyembelihan', 'Pengemasan', 'Distribusi'],
    perkiraan: true,
  },
];

export const PERAN_RELAWAN = ['Takjil', 'Parkir', 'Kebersihan', 'Konsumsi', 'Dokumentasi', 'Among tamu', 'Tadarus', 'Pendataan', 'Penyembelihan', 'Pengemasan', 'Distribusi'];

export type Pengumuman = { id: string; judul: string; isi: string; hariLalu: number; tautan?: string; label?: string };

export const PENGUMUMAN: Pengumuman[] = [
  {
    id: 'wudu',
    judul: 'Tempat wudu putri sedang direnovasi',
    isi: 'Selama pengerjaan, jemaah putri memakai tempat wudu sementara di sisi selatan. Parkir motor bergeser ke halaman depan.',
    hariLalu: 1,
    tautan: '/infak',
    label: 'Ikut berinfak',
  },
  {
    id: 'panitia',
    judul: 'Pendaftaran panitia Ramadan dibuka',
    isi: 'Takmir mencari relawan takjil, parkir, dan kebersihan. Daftar lewat aplikasi, nanti dihubungi koordinator.',
    hariLalu: 2,
    tautan: '/daftar?kegiatan=ramadan',
    label: 'Daftar relawan',
  },
  {
    id: 'kas',
    judul: 'Laporan kas pekan ini sudah terbit',
    isi: 'Rincian kotak amal Jumat dan pengeluaran listrik, honor marbot, serta material renovasi bisa dilihat siapa saja.',
    hariLalu: 3,
    tautan: '/kas',
    label: 'Lihat laporan',
  },
];

export type ProgramInfak = { id: string; judul: string; ringkas: string; target?: number; dasar?: number; foto?: 'wudu' | 'kurma' | 'bedug' | 'kambing' };

export const PROGRAM_INFAK: ProgramInfak[] = [
  { id: 'wudu', judul: 'Renovasi tempat wudu putri', ringkas: 'Keramik antiselip, 12 kran baru, dan saluran air yang tidak lagi meluap saat hujan.', target: 85_000_000, dasar: 21_500_000, foto: 'wudu' },
  { id: 'operasional', judul: 'Operasional masjid', ringkas: 'Listrik, air, kebersihan, dan honor marbot agar masjid tetap nyaman setiap hari.' },
  { id: 'santunan', judul: 'Santunan yatim dan duafa', ringkas: 'Disalurkan tiap triwulan untuk anak yatim dan keluarga duafa di sekitar masjid.' },
  { id: 'takjil', judul: 'Takjil Ramadan', ringkas: 'Menu berbuka gratis bakda Asar selama Ramadan untuk jemaah dan musafir.', target: 18_000_000, dasar: 2_350_000, foto: 'kurma' },
];

export const NOMINAL = [10_000, 20_000, 50_000, 100_000, 250_000];
