// Semua logika tanggal memakai WIB (UTC+7, tanpa musim panas), apa pun zona waktu perangkat.
export const WIB = 7 * 3600 * 1000;
const HARI_MS = 86400000;

export type Tgl = { y: number; m: number; d: number }; // m: 1–12

// Aplikasi masjid: hari pertama pekan disebut Ahad.
export const HARI = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const HARI_PENDEK = ['Ahd', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function bagianWib(date: Date) {
  const t = new Date(date.getTime() + WIB);
  return {
    y: t.getUTCFullYear(),
    m: t.getUTCMonth() + 1,
    d: t.getUTCDate(),
    jam: t.getUTCHours(),
    menit: t.getUTCMinutes(),
    detik: t.getUTCSeconds(),
    hari: t.getUTCDay(),
  };
}

export function tglWib(date: Date): Tgl {
  const b = bagianWib(date);
  return { y: b.y, m: b.m, d: b.d };
}

/** Instan (Date) untuk jam tertentu WIB pada tanggal tertentu. */
export function instanWib(t: Tgl, jam = 0, menit = 0): Date {
  return new Date(Date.UTC(t.y, t.m - 1, t.d, jam, menit) - WIB);
}

export function tambahHari(t: Tgl, n: number): Tgl {
  const x = new Date(Date.UTC(t.y, t.m - 1, t.d) + n * HARI_MS);
  return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() };
}

export function hariDalamPekan(t: Tgl): number {
  return new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay();
}

export function selisihHari(a: Tgl, b: Tgl): number {
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / HARI_MS);
}

export function samaTgl(a: Tgl, b: Tgl) {
  return a.y === b.y && a.m === b.m && a.d === b.d;
}

export function kunciTgl(t: Tgl) {
  return `${t.y}-${String(t.m).padStart(2, '0')}-${String(t.d).padStart(2, '0')}`;
}

export function jumlahHari(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

const dua = (n: number) => String(n).padStart(2, '0');

/** Jam gaya Indonesia: 14.21 */
export function jam(date: Date) {
  const b = bagianWib(date);
  return `${dua(b.jam)}.${dua(b.menit)}`;
}

export function tanggalPanjang(t: Tgl) {
  return `${HARI[hariDalamPekan(t)]}, ${t.d} ${BULAN[t.m - 1]} ${t.y}`;
}

export function tanggalSedang(t: Tgl) {
  return `${t.d} ${BULAN[t.m - 1]} ${t.y}`;
}

export function tanggalPendek(t: Tgl) {
  return `${t.d} ${BULAN_PENDEK[t.m - 1]}`;
}

/** Hitung mundur hh:mm:ss */
export function mundur(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${dua(Math.floor(s / 3600))}:${dua(Math.floor((s % 3600) / 60))}:${dua(s % 60)}`;
}

/** "2 jam 14 menit" untuk pembaca layar dan teks pendek */
export function durasiKata(ms: number) {
  const menit = Math.max(0, Math.ceil(ms / 60000));
  const j = Math.floor(menit / 60);
  const m = menit % 60;
  if (j === 0) return `${m} menit`;
  if (m === 0) return `${j} jam`;
  return `${j} jam ${m} menit`;
}

export function relatifHari(n: number) {
  if (n === 0) return 'hari ini';
  if (n === 1) return 'besok';
  if (n === -1) return 'kemarin';
  if (n > 1) return `${n} hari lagi`;
  return `${-n} hari lalu`;
}

/** Rp1.250.000 (gaya PUEBI, tanpa spasi) */
export function rupiah(n: number) {
  const neg = n < 0;
  const s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '−' : ''}Rp${s}`;
}

/** Rp18,6 jt untuk ringkasan */
export function rupiahRingkas(n: number) {
  const a = Math.abs(n);
  if (a >= 1e6) return `Rp${(n / 1e6).toFixed(1).replace('.', ',')} jt`;
  if (a >= 1e3) return `Rp${Math.round(n / 1e3)} rb`;
  return rupiah(n);
}
