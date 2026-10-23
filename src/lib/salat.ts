import { CalculationParameters, Coordinates, Madhab, PrayerTimes, Qibla, Rounding } from 'adhan';
import { posisiMatahari } from './matahari';
import { tambahHari, type Tgl } from './waktu';

/**
 * Titik hitung: Kabupaten Tulungagung, 8°04' LS 111°54' BT (titik rujukan yang sama
 * dengan jadwal Kemenag untuk kabupaten ini).
 */
export const LOKASI = { nama: 'Tulungagung', lat: -8.0667, lng: 111.9, label: '8°04′ LS · 111°54′ BT' };

/** Selisih waktu terbit/terbenam akibat kerendahan ufuk (ketinggian tempat), dalam menit. */
const KOREKSI_UFUK = 0.7;
const IHTIYATH = 2;

const koordinat = new Coordinates(LOKASI.lat, LOKASI.lng);
const parameter = (() => {
  // Kriteria Kemenag RI: matahari −20° untuk Subuh, −18° untuk Isya; Asar mazhab Syafi'i (bayangan 1×).
  const p = new CalculationParameters('Other', 20, 18);
  p.madhab = Madhab.Shafi;
  p.rounding = Rounding.None;
  p.adjustments = {
    fajr: IHTIYATH,
    sunrise: -IHTIYATH - KOREKSI_UFUK,
    dhuhr: IHTIYATH + 1, // +1 menit sampai piringan matahari lewat meridian
    asr: IHTIYATH,
    maghrib: IHTIYATH + KOREKSI_UFUK,
    isha: IHTIYATH,
  };
  return p;
})();

export const METODE = {
  ringkas: 'Kemenag RI · Subuh −20° · Isya −18°',
  rinci: [
    'Subuh: matahari 20° di bawah ufuk timur.',
    'Duha: matahari 4,5° di atas ufuk timur.',
    'Isya: matahari 18° di bawah ufuk barat.',
    'Asar: panjang bayangan = tinggi benda + bayangan saat Zuhur (mazhab Syafi\'i).',
    'Ihtiyath (pengaman) 2 menit; Zuhur ditambah 1 menit agar piringan matahari lewat meridian.',
    'Terbit dibulatkan ke bawah, waktu lain ke atas. Imsak = Subuh − 10 menit.',
  ],
  pustaka: 'adhan-js 4.4.6 (lisensi MIT)',
};

export type KunciWaktu = 'imsak' | 'subuh' | 'terbit' | 'zuhur' | 'asar' | 'magrib' | 'isya';
export type KunciSalat = 'subuh' | 'zuhur' | 'asar' | 'magrib' | 'isya';

export const NAMA_WAKTU: Record<KunciWaktu, { label: string; arab: string }> = {
  imsak: { label: 'Imsak', arab: 'الإمساك' },
  subuh: { label: 'Subuh', arab: 'الصبح' },
  terbit: { label: 'Terbit', arab: 'الشروق' },
  zuhur: { label: 'Zuhur', arab: 'الظهر' },
  asar: { label: 'Asar', arab: 'العصر' },
  magrib: { label: 'Magrib', arab: 'المغرب' },
  isya: { label: 'Isya', arab: 'العشاء' },
};

export const URUTAN_WAKTU: KunciWaktu[] = ['imsak', 'subuh', 'terbit', 'zuhur', 'asar', 'magrib', 'isya'];
export const URUTAN_SALAT: KunciSalat[] = ['subuh', 'zuhur', 'asar', 'magrib', 'isya'];

/** Jadwal satu hari. `duha` = matahari 4,5° di atas ufuk + ihtiyath 2 menit (kriteria jadwal Kemenag). */
export type Jadwal = Record<KunciWaktu, Date> & { duha: Date };

function hitungDuha(terbit: Date) {
  // Mulai dari terbit, maju per 20 detik sampai tinggi matahari ≥ 4,5°.
  let t = terbit.getTime();
  for (let i = 0; i < 300; i++) {
    if (posisiMatahari(new Date(t), LOKASI.lat, LOKASI.lng).tinggi >= 4.5) break;
    t += 20000;
  }
  return keAtas(new Date(t + IHTIYATH * MENIT));
}

const MENIT = 60000;
const keAtas = (d: Date) => new Date(Math.ceil(d.getTime() / MENIT) * MENIT);
const keBawah = (d: Date) => new Date(Math.floor(d.getTime() / MENIT) * MENIT);

const cache = new Map<string, Jadwal>();

export function jadwalHari(t: Tgl): Jadwal {
  const k = `${t.y}-${t.m}-${t.d}`;
  const ada = cache.get(k);
  if (ada) return ada;
  // adhan membaca tahun/bulan/tanggal lokal dari objek Date; dibuat dari komponen WIB agar tak bergantung zona perangkat.
  const pt = new PrayerTimes(koordinat, new Date(t.y, t.m - 1, t.d, 12), parameter);
  const subuh = keAtas(pt.fajr);
  const j: Jadwal = {
    imsak: new Date(subuh.getTime() - 10 * MENIT),
    subuh,
    terbit: keBawah(pt.sunrise),
    zuhur: keAtas(pt.dhuhr),
    asar: keAtas(pt.asr),
    magrib: keAtas(pt.maghrib),
    isya: keAtas(pt.isha),
    duha: new Date(0),
  };
  j.duha = hitungDuha(j.terbit);
  cache.set(k, j);
  return j;
}

export type Berikutnya = { kunci: KunciSalat; waktu: Date; sebelumnya: { kunci: KunciSalat; waktu: Date }; besok: boolean };

/** Salat wajib berikutnya setelah `now` (WIB). Setelah Isya → Subuh besok. */
export function salatBerikutnya(now: Date, hariIni: Tgl): Berikutnya {
  const j = jadwalHari(hariIni);
  const t = now.getTime();
  for (let i = 0; i < URUTAN_SALAT.length; i++) {
    const k = URUTAN_SALAT[i];
    if (j[k].getTime() > t) {
      const prevK = i === 0 ? 'isya' : URUTAN_SALAT[i - 1];
      const prevW = i === 0 ? jadwalHari(tambahHari(hariIni, -1)).isya : j[prevK];
      return { kunci: k, waktu: j[k], sebelumnya: { kunci: prevK, waktu: prevW }, besok: false };
    }
  }
  const besok = jadwalHari(tambahHari(hariIni, 1));
  return { kunci: 'subuh', waktu: besok.subuh, sebelumnya: { kunci: 'isya', waktu: j.isya }, besok: true };
}

/** Arah kiblat dari utara sejati, searah jarum jam. */
export const ARAH_KIBLAT = Qibla(koordinat);

const KAABAH = { lat: 21.4225, lng: 39.8262 };
export const JARAK_KAABAH_KM = (() => {
  const r = Math.PI / 180;
  const dLat = (KAABAH.lat - LOKASI.lat) * r;
  const dLng = (KAABAH.lng - LOKASI.lng) * r;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(LOKASI.lat * r) * Math.cos(KAABAH.lat * r) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
})();

export type WaktuKini = { kunci: KunciWaktu | 'duha'; teks: string; sampai: Date };

/** Waktu yang sedang berjalan dan kapan berakhir, untuk satu kalimat di beranda. */
export function waktuSekarang(now: Date, hariIni: Tgl, jumat: boolean): WaktuKini {
  const j = jadwalHari(hariIni);
  const t = now.getTime();
  const fmt = (d: Date) => {
    const x = new Date(d.getTime() + 7 * 3600e3);
    return `${String(x.getUTCHours()).padStart(2, '0')}.${String(x.getUTCMinutes()).padStart(2, '0')}`;
  };
  const zuhur = jumat ? 'Jumat' : 'Zuhur';
  if (t < j.subuh.getTime()) return { kunci: 'isya', teks: `Sekarang waktu Isya · sampai Subuh ${fmt(j.subuh)}`, sampai: j.subuh };
  if (t < j.terbit.getTime()) return { kunci: 'subuh', teks: `Sekarang waktu Subuh · sampai terbit ${fmt(j.terbit)}`, sampai: j.terbit };
  if (t < j.duha.getTime()) return { kunci: 'terbit', teks: `Matahari sedang naik · Duha mulai ${fmt(j.duha)}`, sampai: j.duha };
  if (t < j.zuhur.getTime()) return { kunci: 'duha', teks: `Sekarang waktu Duha · ${zuhur} masuk ${fmt(j.zuhur)}`, sampai: j.zuhur };
  if (t < j.asar.getTime()) return { kunci: 'zuhur', teks: `Sekarang waktu ${zuhur} · sampai Asar ${fmt(j.asar)}`, sampai: j.asar };
  if (t < j.magrib.getTime()) return { kunci: 'asar', teks: `Sekarang waktu Asar · sampai Magrib ${fmt(j.magrib)}`, sampai: j.magrib };
  if (t < j.isya.getTime()) return { kunci: 'magrib', teks: `Sekarang waktu Magrib · sampai Isya ${fmt(j.isya)}`, sampai: j.isya };
  const besok = jadwalHari(tambahHari(hariIni, 1));
  return { kunci: 'isya', teks: `Sekarang waktu Isya · sampai Subuh ${fmt(besok.subuh)}`, sampai: besok.subuh };
}
