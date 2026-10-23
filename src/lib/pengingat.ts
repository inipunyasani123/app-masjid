// Pengingat azan, Jumat, dan kajian — simulasi lokal. Pengaturan disimpan di perangkat (useSimpan 'pengingat').
// Di web, pengingat tampil sebagai bilah dalam aplikasi saat waktunya tiba (bukan notifikasi sistem).
import { KAJIAN } from './data';
import { mulaiKajian } from './kegiatan';
import { jadwalHari, NAMA_WAKTU, type KunciSalat, URUTAN_SALAT } from './salat';
import { hariDalamPekan, jam, type Tgl } from './waktu';

export type ModeSalat = 'azan' | '10';
export type Pengingat = { salat: Partial<Record<KunciSalat, ModeSalat>>; jumat: boolean; kajian: string[] };
export const PENGINGAT_KOSONG: Pengingat = { salat: {}, jumat: false, kajian: [] };

export const MODE_TEKS: Record<ModeSalat | 'mati', string> = { azan: 'Saat azan', '10': '10 menit sebelum', mati: 'Mati' };

export function jumlahAktif(p: Pengingat) {
  return Object.values(p.salat).filter(Boolean).length + (p.jumat ? 1 : 0) + p.kajian.length;
}

export type Pemicu = { id: string; waktu: Date; judul: string; isi: string };

/** Semua pemicu pengingat untuk satu tanggal, urut waktu. */
export function pemicuHari(p: Pengingat, t: Tgl): Pemicu[] {
  const j = jadwalHari(t);
  const jumat = hariDalamPekan(t) === 5;
  const out: Pemicu[] = [];
  for (const k of URUTAN_SALAT) {
    const mode = p.salat[k];
    if (!mode) continue;
    const nama = k === 'zuhur' && jumat ? 'Jumat' : NAMA_WAKTU[k].label;
    if (mode === 'azan') out.push({ id: `${t.d}-${k}-azan`, waktu: j[k], judul: `Waktu ${nama} telah masuk`, isi: `${nama} pukul ${jam(j[k])} WIB · Tulungagung` });
    else out.push({ id: `${t.d}-${k}-10`, waktu: new Date(j[k].getTime() - 10 * 60000), judul: `10 menit lagi ${nama}`, isi: `Azan ${nama} pukul ${jam(j[k])} WIB` });
  }
  if (p.jumat && jumat) {
    out.push({ id: `${t.d}-jumat`, waktu: new Date(j.zuhur.getTime() - 30 * 60000), judul: 'Bersiap salat Jumat', isi: `Azan Jumat pukul ${jam(j.zuhur)} WIB. Datang lebih awal agar dapat saf depan.` });
  }
  for (const id of p.kajian) {
    const k = KAJIAN.find((x) => x.id === id);
    if (!k || !k.hari.includes(hariDalamPekan(t))) continue;
    const m = mulaiKajian(k, t);
    out.push({ id: `${t.d}-kajian-${id}`, waktu: new Date(m.getTime() - 30 * 60000), judul: `${k.judul} mulai ${jam(m)}`, isi: `30 menit lagi · ${k.tempat}` });
  }
  return out.sort((a, b) => a.waktu.getTime() - b.waktu.getTime());
}
