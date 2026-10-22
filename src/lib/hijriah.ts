import { tambahHari, type Tgl } from './waktu';

export const BULAN_HIJRIAH = [
  'Muharam', 'Safar', 'Rabiulawal', 'Rabiulakhir', 'Jumadilawal', 'Jumadilakhir',
  'Rajab', 'Syakban', 'Ramadan', 'Syawal', 'Zulkaidah', 'Zulhijah',
];

export const BULAN_HIJRIAH_PENDEK = ['Muh', 'Saf', 'R.awal', 'R.akhir', 'J.awal', 'J.akhir', 'Raj', 'Syak', 'Ram', 'Syaw', 'Zulk', 'Zulh'];

export type TglH = { y: number; m: number; d: number };

let fmt: Intl.DateTimeFormat | null | undefined;
function pemformat() {
  if (fmt !== undefined) return fmt;
  try {
    const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const uji = f.formatToParts(new Date(Date.UTC(2026, 9, 22)));
    const y = Number(uji.find((p) => p.type === 'year')?.value);
    fmt = y > 1400 && y < 1500 ? f : null;
  } catch {
    fmt = null;
  }
  return fmt;
}

// Cadangan bila mesin JS tidak punya kalender Ummul Qura: kalender Hijriah tabular (aritmetis).
function jdDariMasehi(y: number, m: number, d: number) {
  if (m < 3) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}
function jdDariHijriah(y: number, m: number, d: number) {
  return d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + 1948439.5 - 1;
}
function tabular(t: Tgl): TglH {
  const jd = Math.floor(jdDariMasehi(t.y, t.m, t.d)) + 0.5;
  const y = Math.floor((30 * (jd - 1948439.5) + 10646) / 10631);
  const m = Math.min(12, Math.ceil((jd - (29 + jdDariHijriah(y, 1, 1))) / 29.5) + 1);
  const d = jd - jdDariHijriah(y, m, 1) + 1;
  return { y, m, d };
}

/** Tanggal Hijriah (perkiraan kalender Ummul Qura) untuk tanggal Masehi; `koreksi` menggeser ±hari. */
export function hijriah(t: Tgl, koreksi = 0): TglH {
  const x = koreksi ? tambahHari(t, koreksi) : t;
  const f = pemformat();
  if (f) {
    const parts = f.formatToParts(new Date(Date.UTC(x.y, x.m - 1, x.d, 12)));
    const ambil = (k: string) => Number(parts.find((p) => p.type === k)?.value);
    return { y: ambil('year'), m: ambil('month'), d: ambil('day') };
  }
  return tabular(x);
}

export function teksHijriah(h: TglH) {
  return `${h.d} ${BULAN_HIJRIAH[h.m - 1]} ${h.y} H`;
}

/** Cari tanggal Masehi pertama (mulai `dari`) yang jatuh pada bulan & tanggal Hijriah tertentu. */
export function cariMasehi(bulanH: number, tglH: number, dari: Tgl, koreksi = 0, batas = 420): { tgl: Tgl; h: TglH } | null {
  for (let i = 0; i <= batas; i++) {
    const t = tambahHari(dari, i);
    const h = hijriah(t, koreksi);
    if (h.m === bulanH && h.d === tglH) return { tgl: t, h };
  }
  return null;
}
