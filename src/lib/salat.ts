import { CalculationParameters, Coordinates, Madhab, PrayerTimes, Qibla, Rounding } from 'adhan';
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

export type Jadwal = Record<KunciWaktu, Date>;

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
  };
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
