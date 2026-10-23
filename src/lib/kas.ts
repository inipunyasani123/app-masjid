// Laporan kas rekaan yang selalu "terkini": dibangkitkan dari tanggal hari ini (WIB) dengan angka acak berbenih,
// jadi angka untuk satu tanggal selalu sama di setiap perangkat.
import { bagianWib, hariDalamPekan, jumlahHari, type Tgl } from './waktu';

/** Entri punya jam catat (menit sejak 00.00 WIB): entri hari ini baru muncul setelah jamnya lewat. */
export type Entri = { tgl: Tgl; ket: string; kategori: string; jumlah: number; masuk: boolean; menit: number };
/** Batas waktu laporan: tanggal + menit WIB "sekarang". */
export type Batas = { tgl: Tgl; menit: number };

export function batasDari(now: Date): Batas {
  const b = bagianWib(now);
  return { tgl: { y: b.y, m: b.m, d: b.d }, menit: b.jam * 60 + b.menit };
}

const J = (jam: number, menit = 0) => jam * 60 + menit;

/** Tahap renovasi; tiap bulan kampanye membelanjakan material satu tahap (bulan ke-0 = awal kampanye). */
export const TAHAP_RENOVASI = [
  'Bongkar keramik lama dan perbaiki lantai',
  'Pipa dan saluran pembuangan baru',
  'Pasang keramik antiselip',
  'Kran dan wastafel baru',
  'Sekat bilik dan pengecatan',
  'Pemeriksaan akhir dan pemakaian kembali',
];
export type LaporanBulan = {
  y: number;
  m: number;
  saldoAwal: number;
  masuk: number;
  keluar: number;
  saldoAkhir: number;
  entri: Entri[];
  kategori: { nama: string; masuk: boolean; jumlah: number }[];
  berjalan: boolean;
};

function acak(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const bulat = (n: number, ke = 5000) => Math.round(n / ke) * ke;
const antara = (r: () => number, a: number, b: number, ke = 5000) => bulat(a + r() * (b - a), ke);

const JANGKAR = { y: 2026, m: 1, saldo: 36_400_000 };

function urutBulan(y: number, m: number) {
  return y * 12 + (m - 1);
}

export function entriBulan(y: number, m: number, sampai?: Batas, kampanye?: { y: number; m: number }): Entri[] {
  const r = acak(y * 100 + m);
  const n = jumlahHari(y, m);
  const e: Entri[] = [];
  // Angka acak selalu diambil (urutan tetap), entri yang belum terjadi saja yang dibuang.
  const tambah = (d: number, ket: string, kategori: string, jumlah: number, masuk: boolean, menit = J(9)) => {
    if (sampai) {
      const t = sampai.tgl;
      if (y > t.y || (y === t.y && (m > t.m || (m === t.m && (d > t.d || (d === t.d && menit > sampai.menit)))))) return;
    }
    e.push({ tgl: { y, m, d }, ket, kategori, jumlah, masuk, menit });
  };
  const idx = urutBulan(y, m);
  const renovasi = kampanye ? idx >= urutBulan(kampanye.y, kampanye.m) : false;

  tambah(1, 'Honor marbot (2 orang)', 'Honor & insentif', 2_500_000, false);
  tambah(1, 'Insentif pengajar TPQ (4 orang)', 'Honor & insentif', 1_600_000, false);
  tambah(1, 'Insentif imam rawatib', 'Honor & insentif', 1_200_000, false);
  tambah(1, 'Insentif muazin (2 orang)', 'Honor & insentif', 800_000, false);
  tambah(5, 'Tagihan listrik PLN', 'Listrik & air', antara(r, 1_120_000, 1_460_000, 1000), false, J(10));
  tambah(7, 'Tagihan air PDAM', 'Listrik & air', antara(r, 175_000, 265_000, 1000), false, J(10));
  tambah(10, 'Sabun, karbol, dan alat kebersihan', 'Kebersihan', antara(r, 210_000, 460_000, 1000), false, J(10));

  let jumatKe = 0;
  for (let d = 1; d <= n; d++) {
    const h = hariDalamPekan({ y, m, d });
    if (h === 5) {
      jumatKe++;
      // Kotak amal dihitung bendahara bakda salat Jumat, ±13.00 WIB.
      tambah(d, `Kotak amal Jumat pekan ke-${jumatKe}`, 'Kotak amal', antara(r, 1_250_000, 2_450_000), true, J(13));
      tambah(d, 'Transport khatib Jumat', 'Honor & insentif', 250_000, false, J(13));
    }
    if (h === 0) {
      tambah(d, 'Konsumsi kajian Ahad pagi', 'Konsumsi kajian', antara(r, 160_000, 320_000, 1000), false, J(8));
      tambah(d, 'Rekap kotak amal harian', 'Kotak amal', antara(r, 250_000, 520_000), true, J(19, 30));
    }
  }
  tambah(15, 'Infak transfer dan QRIS (rekap)', 'Infak transfer', antara(r, 700_000, 1_700_000), true, J(20));
  tambah(Math.min(28, n), 'Infak transfer dan QRIS (rekap)', 'Infak transfer', antara(r, 450_000, 1_250_000), true, J(20));

  if (renovasi) {
    const ke = Math.min(TAHAP_RENOVASI.length - 1, idx - urutBulan(kampanye!.y, kampanye!.m));
    tambah(12, 'Donasi renovasi tempat wudu putri', 'Donasi renovasi', antara(r, 2_400_000, 6_200_000), true, J(20));
    tambah(26, 'Donasi renovasi tempat wudu putri', 'Donasi renovasi', antara(r, 1_200_000, 3_800_000), true, J(20));
    tambah(18, `Material renovasi: ${TAHAP_RENOVASI[ke].toLowerCase()}`, 'Renovasi', antara(r, 3_600_000, 6_900_000), false, J(11));
  }
  if (m % 3 === 1) {
    tambah(Math.min(8, n), 'Penyaluran santunan yatim dan duafa', 'Santunan', 2_600_000, false, J(16, 30));
    tambah(3, 'Infak program santunan', 'Infak transfer', antara(r, 1_800_000, 2_900_000), true, J(20));
  }
  if (m % 6 === 4) tambah(20, 'Servis pengeras suara dan kipas angin', 'Perawatan', antara(r, 1_900_000, 3_400_000), false, J(10));

  return e.sort((a, b) => a.tgl.d - b.tgl.d || a.menit - b.menit || Number(b.masuk) - Number(a.masuk));
}

function ringkas(entri: Entri[]) {
  let masuk = 0, keluar = 0;
  const kat = new Map<string, { nama: string; masuk: boolean; jumlah: number }>();
  for (const x of entri) {
    if (x.masuk) masuk += x.jumlah; else keluar += x.jumlah;
    const k = `${x.masuk ? '+' : '-'}${x.kategori}`;
    const ada = kat.get(k) || { nama: x.kategori, masuk: x.masuk, jumlah: 0 };
    ada.jumlah += x.jumlah;
    kat.set(k, ada);
  }
  return { masuk, keluar, kategori: [...kat.values()].sort((a, b) => b.jumlah - a.jumlah) };
}

/** Kampanye renovasi wudu selalu "dimulai" tiga bulan sebelum bulan berjalan. */
export function awalKampanye(hariIni: Tgl) {
  const i = urutBulan(hariIni.y, hariIni.m) - 3;
  return { y: Math.floor(i / 12), m: (i % 12) + 1 };
}

export function laporanKas(now: Date, banyak = 6): LaporanBulan[] {
  const batas = batasDari(now);
  const hariIni = batas.tgl;
  const kampanye = awalKampanye(hariIni);
  const akhir = urutBulan(hariIni.y, hariIni.m);
  let saldo = JANGKAR.saldo;
  const hasil: LaporanBulan[] = [];
  for (let i = urutBulan(JANGKAR.y, JANGKAR.m); i <= akhir; i++) {
    const y = Math.floor(i / 12), m = (i % 12) + 1;
    const berjalan = i === akhir;
    const entri = entriBulan(y, m, berjalan ? batas : undefined, kampanye);
    const s = ringkas(entri);
    const lap: LaporanBulan = { y, m, saldoAwal: saldo, masuk: s.masuk, keluar: s.keluar, saldoAkhir: saldo + s.masuk - s.keluar, entri, kategori: s.kategori, berjalan };
    saldo = lap.saldoAkhir;
    if (i > akhir - banyak) hasil.push(lap);
  }
  return hasil;
}

/** Dana renovasi wudu yang sudah terkumpul (dasar + donasi sejak awal kampanye sampai hari ini). */
export function terkumpulRenovasi(now: Date, dasar: number) {
  return rincianRenovasi(now, dasar).terkumpul;
}

/** Semua entri kampanye renovasi wudu (donasi & material) sampai sekarang, untuk halaman program. */
export function rincianRenovasi(now: Date, dasar: number) {
  const batas = batasDari(now);
  const k = awalKampanye(batas.tgl);
  const donasi: Entri[] = [];
  const material: Entri[] = [];
  for (let i = urutBulan(k.y, k.m); i <= urutBulan(batas.tgl.y, batas.tgl.m); i++) {
    const y = Math.floor(i / 12), m = (i % 12) + 1;
    for (const x of entriBulan(y, m, batas, k)) {
      if (x.kategori === 'Donasi renovasi') donasi.push(x);
      if (x.kategori === 'Renovasi') material.push(x);
    }
  }
  const terkumpul = dasar + donasi.reduce((a, x) => a + x.jumlah, 0);
  const terpakai = material.reduce((a, x) => a + x.jumlah, 0);
  return { kampanye: k, donasi, material, terkumpul, terpakai };
}

/** Hari Jumat sebelum ±13.00: kotak amal belum direkap. */
export function menungguRekapJumat(now: Date) {
  const b = bagianWib(now);
  return b.hari === 5 && b.jam * 60 + b.menit < J(13);
}
