import { AGENDA, type Agenda, IMAM_GILIRAN, KAJIAN, type Kajian, KHATIB_GILIRAN, MUAZIN_GILIRAN, ORANG, TEMA_KHUTBAH } from './data';
import { cariMasehi, type TglH } from './hijriah';
import { jadwalHari } from './salat';
import { hariDalamPekan, instanWib, selisihHari, tambahHari, type Tgl } from './waktu';

const MENIT = 60000;

/** Jam mulai kajian pada tanggal tertentu. "Bakda Magrib" dihitung dari jadwal Magrib hari itu, dibulatkan ke 5 menit. */
export function mulaiKajian(k: Kajian, t: Tgl): Date {
  if ('jam' in k.patokan) {
    const [h, m] = k.patokan.jam.split('.').map(Number);
    return instanWib(t, h, m);
  }
  const dasar = jadwalHari(t)[k.patokan.bakda].getTime() + k.patokan.tunda * MENIT;
  return new Date(Math.ceil(dasar / (5 * MENIT)) * 5 * MENIT);
}

export function teksPatokan(k: Kajian) {
  if ('jam' in k.patokan) return `Pukul ${k.patokan.jam} WIB`;
  const nama = { subuh: 'Subuh', asar: 'Asar', magrib: 'Magrib', isya: 'Isya' }[k.patokan.bakda];
  return `Bakda ${nama}`;
}

export type JadwalKajian = { kajian: Kajian; tgl: Tgl; mulai: Date; selesai: Date; berlangsung: boolean };

export function kajianMendatang(now: Date, hari: Tgl, banyak = 6, saring?: (k: Kajian) => boolean): JadwalKajian[] {
  const out: JadwalKajian[] = [];
  for (let i = 0; i < 9 && out.length < banyak * 2; i++) {
    const t = tambahHari(hari, i);
    const h = hariDalamPekan(t);
    for (const k of KAJIAN) {
      if (!k.hari.includes(h) || (saring && !saring(k))) continue;
      const mulai = mulaiKajian(k, t);
      const selesai = new Date(mulai.getTime() + k.durasi * MENIT);
      if (selesai.getTime() <= now.getTime()) continue;
      out.push({ kajian: k, tgl: t, mulai, selesai, berlangsung: mulai.getTime() <= now.getTime() });
    }
  }
  return out.sort((a, b) => a.mulai.getTime() - b.mulai.getTime()).slice(0, banyak);
}

const PEKAN = 7 * 86400000;
function pekanKe(t: Tgl) {
  return Math.floor(Date.UTC(t.y, t.m - 1, t.d) / PEKAN);
}

export type JadwalJumat = { tgl: Tgl; khatib: (typeof ORANG)[string]; imam: (typeof ORANG)[string]; muazin: (typeof ORANG)[string]; tema: string; azan: Date };

/** Jumat mendatang (hari ini dihitung bila Jumat dan salat Jumat belum selesai). */
export function jumatMendatang(now: Date, hari: Tgl, banyak = 4): JadwalJumat[] {
  let t = hari;
  const h = hariDalamPekan(hari);
  const selisih = (5 - h + 7) % 7;
  t = tambahHari(hari, selisih);
  if (selisih === 0 && now.getTime() > jadwalHari(hari).zuhur.getTime() + 45 * MENIT) t = tambahHari(hari, 7);
  const out: JadwalJumat[] = [];
  for (let i = 0; i < banyak; i++) {
    const tg = tambahHari(t, i * 7);
    const p = pekanKe(tg);
    out.push({
      tgl: tg,
      khatib: ORANG[KHATIB_GILIRAN[p % KHATIB_GILIRAN.length]],
      imam: ORANG[IMAM_GILIRAN[p % IMAM_GILIRAN.length]],
      muazin: ORANG[MUAZIN_GILIRAN[p % MUAZIN_GILIRAN.length]],
      tema: TEMA_KHUTBAH[p % TEMA_KHUTBAH.length],
      azan: jadwalHari(tg).zuhur,
    });
  }
  return out;
}

export type JadwalAgenda = { agenda: Agenda; tgl: Tgl; h?: TglH; sisa: number };

export function tanggalAgenda(a: Agenda, hari: Tgl, koreksi = 0): JadwalAgenda | null {
  if (a.jenis === 'ahad') {
    const s = (7 - hariDalamPekan(hari)) % 7;
    const tgl = tambahHari(hari, s);
    return { agenda: a, tgl, sisa: s };
  }
  if (a.jenis === 'ahadPertama') {
    for (let i = 0; i < 2; i++) {
      const y = hari.y + Math.floor((hari.m - 1 + i) / 12);
      const m = ((hari.m - 1 + i) % 12) + 1;
      const awal = { y, m, d: 1 };
      const tgl = tambahHari(awal, (7 - hariDalamPekan(awal)) % 7);
      const s = selisihHari(hari, tgl);
      if (s >= 0) return { agenda: a, tgl, sisa: s };
    }
    return null;
  }
  const hasil = cariMasehi(a.bulanH!, a.tglH!, hari, koreksi);
  return hasil ? { agenda: a, tgl: hasil.tgl, h: hasil.h, sisa: selisihHari(hari, hasil.tgl) } : null;
}

export function agendaMendatang(hari: Tgl, koreksi = 0): JadwalAgenda[] {
  return AGENDA.map((a) => tanggalAgenda(a, hari, koreksi))
    .filter((x): x is JadwalAgenda => !!x)
    .sort((a, b) => a.sisa - b.sisa);
}
