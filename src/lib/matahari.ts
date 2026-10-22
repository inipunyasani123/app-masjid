import { instanWib, type Tgl } from './waktu';

const r = Math.PI / 180;

/** Posisi matahari (algoritme NOAA ringkas). Azimut dari utara sejati searah jarum jam. */
export function posisiMatahari(date: Date, lat: number, lng: number) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545) / 36525;
  const L0 = (((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = Math.sin(M * r) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * r) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * r) * 0.000289;
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * r);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * r);
  const decl = Math.asin(Math.sin(eps * r) * Math.sin(lambda * r));
  const y = Math.tan((eps / 2) * r) ** 2;
  const eot = 4 / r * (y * Math.sin(2 * L0 * r) - 2 * e * Math.sin(M * r) + 4 * e * y * Math.sin(M * r) * Math.cos(2 * L0 * r) - 0.5 * y * y * Math.sin(4 * L0 * r) - 1.25 * e * e * Math.sin(2 * M * r));
  const menitUtc = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const tst = (((menitUtc + eot + 4 * lng) % 1440) + 1440) % 1440;
  const ha = (tst / 4 - 180) * r;
  const cosZ = Math.sin(lat * r) * Math.sin(decl) + Math.cos(lat * r) * Math.cos(decl) * Math.cos(ha);
  const zenit = Math.acos(Math.min(1, Math.max(-1, cosZ)));
  const az = (Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat * r) - Math.tan(decl) * Math.cos(lat * r)) / r + 180 + 360) % 360;
  return { tinggi: 90 - zenit / r, azimut: az };
}

const bedaSudut = (a: number, b: number) => ((a - b + 540) % 360) - 180;

export type BayanganKiblat = { waktu: Date; jenis: 'menuju' | 'membelakangi'; tinggi: number };

/**
 * Rashdul kiblat harian: saat azimut matahari = arah kiblat (bayangan benda tegak membelakangi kiblat)
 * atau = arah kiblat + 180° (bayangan menunjuk ke kiblat). Hanya dihitung saat matahari 8°–80° di atas ufuk.
 */
export function bayanganKiblat(t: Tgl, lat: number, lng: number, kiblat: number): BayanganKiblat[] {
  const hasil: BayanganKiblat[] = [];
  const targets: [number, BayanganKiblat['jenis']][] = [[kiblat, 'membelakangi'], [(kiblat + 180) % 360, 'menuju']];
  const mulai = instanWib(t, 5, 0).getTime();
  const akhir = instanWib(t, 18, 0).getTime();
  for (const [sasaran, jenis] of targets) {
    let prev: { t: number; d: number } | null = null;
    for (let ms = mulai; ms <= akhir; ms += 60000) {
      const p = posisiMatahari(new Date(ms), lat, lng);
      const d = bedaSudut(p.azimut, sasaran);
      if (prev && Math.sign(prev.d) !== Math.sign(d) && Math.abs(d - prev.d) < 30) {
        const f = prev.d / (prev.d - d);
        const tt = prev.t + f * 60000;
        const pos = posisiMatahari(new Date(tt), lat, lng);
        if (pos.tinggi >= 8 && pos.tinggi <= 80) hasil.push({ waktu: new Date(Math.round(tt / 60000) * 60000), jenis, tinggi: pos.tinggi });
      }
      prev = { t: ms, d };
    }
  }
  return hasil.sort((a, b) => a.waktu.getTime() - b.waktu.getTime());
}
