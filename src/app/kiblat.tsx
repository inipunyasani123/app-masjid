import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { bayanganKiblat } from '@/lib/matahari';
import { meta } from '@/lib/meta';
import { ARAH_KIBLAT, JARAK_KAABAH_KM, LOKASI } from '@/lib/salat';
import { useHariIni } from '@/lib/sekarang';
import { HARI, hariDalamPekan, jam, kunciTgl, tambahHari, tanggalPendek, type Tgl } from '@/lib/waktu';
import { Bagian, Kartu, Layar, Tombol } from '@/ui/Komponen';
import { Kompas } from '@/ui/Kompas';
import { Label, Redup, Teks, Text } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/kiblat',
    'Arah Kiblat Tulungagung 294,4° | Nurul Ufuk',
    'Arah kiblat dari Tulungagung 294,4° dari utara sejati, plus jam bayangan kiblat harian: saat bayangan benda tegak tepat menunjuk arah Kakbah.',
  );
}

const derajat = ARAH_KIBLAT.toFixed(1).replace('.', ',');
const dariBarat = (ARAH_KIBLAT - 270).toFixed(1).replace('.', ',');

function cariBayangan(hari: Tgl) {
  const ini = bayanganKiblat(hari, LOKASI.lat, LOKASI.lng, ARAH_KIBLAT);
  if (ini.length) return { hariIni: ini, berikut: null as null | { tgl: Tgl; b: ReturnType<typeof bayanganKiblat>[number] } };
  for (let i = 1; i <= 120; i++) {
    const t = tambahHari(hari, i);
    const b = bayanganKiblat(t, LOKASI.lat, LOKASI.lng, ARAH_KIBLAT);
    if (b.length) return { hariIni: [], berikut: { tgl: t, b: b[0] } };
  }
  return { hariIni: [], berikut: null };
}

type Arah = { status: 'mati' } | { status: 'tunggu' } | { status: 'aktif'; arah: number } | { status: 'tidak'; pesan: string };

export default function Kiblat() {
  const { hari } = useHariIni();
  const bayang = useMemo(() => (hari ? cariBayangan(hari) : null), [hari ? kunciTgl(hari) : '']); // eslint-disable-line react-hooks/exhaustive-deps
  const [arah, setArah] = useState<Arah>({ status: 'mati' });
  const lepas = useRef<(() => void) | null>(null);
  useEffect(() => () => lepas.current?.(), []);

  const nyalakan = async () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setArah({ status: 'tidak', pesan: 'Perangkat ini tidak punya sensor kompas. Pakai angka derajat di atas dengan kompas biasa.' });
      return;
    }
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    try {
      if (typeof DOE.requestPermission === 'function') {
        const izin = await DOE.requestPermission();
        if (izin !== 'granted') {
          setArah({ status: 'tidak', pesan: 'Izin sensor arah ditolak. Kamu tetap bisa memakai angka derajat di atas.' });
          return;
        }
      }
    } catch {
      setArah({ status: 'tidak', pesan: 'Browser tidak mengizinkan akses sensor arah.' });
      return;
    }
    setArah({ status: 'tunggu' });
    let dapat = false;
    const tangkap = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      let h: number | null = null;
      if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
      else if (e.absolute && typeof e.alpha === 'number') h = (360 - e.alpha) % 360;
      if (h == null) return;
      dapat = true;
      setArah({ status: 'aktif', arah: h });
    };
    const namaEvent = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(namaEvent, tangkap as EventListener);
    lepas.current = () => window.removeEventListener(namaEvent, tangkap as EventListener);
    setTimeout(() => {
      if (!dapat) {
        lepas.current?.();
        setArah({ status: 'tidak', pesan: 'Sensor kompas tidak terdeteksi (umumnya laptop atau komputer). Pakai angka derajat di atas dengan kompas biasa.' });
      }
    }, 2500);
  };

  const putar = arah.status === 'aktif' ? arah.arah : 0;
  const selisih = arah.status === 'aktif' ? ((ARAH_KIBLAT - arah.arah + 540) % 360) - 180 : 0;

  return (
    <Layar kembali label={`Dari ${LOKASI.nama}`} judul="Arah kiblat">
      <Kartu style={g.kompasKartu}>
        <Kompas kiblat={ARAH_KIBLAT} putar={putar} ukuran={260} />
        <Text style={g.derajat}>{derajat}°</Text>
        <Teks style={{ textAlign: 'center' }}>dari utara sejati, searah jarum jam</Teks>
        <Redup style={{ textAlign: 'center' }}>
          Hadap barat, lalu putar {dariBarat}° ke kanan (ke arah utara). Jarak ke Kakbah ± {String(Math.round(JARAK_KAABAH_KM)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} km.
        </Redup>
        {arah.status === 'aktif' && (
          <Text style={g.arahan} aria-live="polite">
            {Math.abs(selisih) < 3 ? 'Sudah menghadap kiblat' : `Putar ${Math.abs(Math.round(selisih))}° ke ${selisih > 0 ? 'kanan' : 'kiri'}`}
          </Text>
        )}
        {arah.status === 'tidak' && (
          <Text style={g.pesan} role="alert">
            {arah.pesan}
          </Text>
        )}
        {arah.status !== 'aktif' && (
          <Tombol varian="garis" onPress={nyalakan} nonaktif={arah.status === 'tunggu'}>
            {arah.status === 'tunggu' ? 'Membaca sensor…' : 'Pakai kompas HP'}
          </Tombol>
        )}
        {arah.status !== 'mati' && (
          <Redup style={{ textAlign: 'center' }}>
            Agar akurat: gerakkan HP membentuk angka 8 beberapa kali untuk kalibrasi, dan jauhkan dari benda logam atau magnet seperti pengeras suara dan motor.
          </Redup>
        )}
      </Kartu>

      <Bagian judul="Bayangan kiblat">
        <Kartu nada="malam" style={{ gap: 8, minHeight: 132 }}>
          <Label style={{ color: W.emas }}>{hari ? `Hari ini, ${HARI[hariDalamPekan(hari)]} ${tanggalPendek(hari)}` : 'Hari ini'}</Label>
          {bayang && bayang.hariIni.length > 0 &&
            bayang.hariIni.map((b) => (
              <View key={b.waktu.getTime()} style={{ gap: 4 }}>
                <Text style={g.jamBayang}>{jam(b.waktu)} WIB</Text>
                <Text style={g.teksMalam}>
                  {b.tinggi > 65 ? 'Matahari sudah tinggi sehingga bayangan pendek; pakai benda yang tinggi dan benar-benar tegak. ' : ''}
                  {b.jenis === 'menuju'
                    ? 'Bayangan benda yang berdiri tegak (tiang, kusen pintu) menunjuk tepat ke arah kiblat.'
                    : 'Matahari tepat di arah kiblat: arah dari ujung bayangan ke benda tegak adalah arah kiblat.'}
                </Text>
              </View>
            ))}
          {bayang && bayang.hariIni.length === 0 && (
            <>
              <Text style={g.teksMalam}>
                Hari ini matahari terlalu tinggi saat melintasi arah kiblat, jadi bayangannya tidak bisa dipakai.
              </Text>
              {bayang.berikut && (
                <Text style={g.teksMalamKuat}>
                  Momen berikutnya: {HARI[hariDalamPekan(bayang.berikut.tgl)]}, {tanggalPendek(bayang.berikut.tgl)} pukul {jam(bayang.berikut.b.waktu)} WIB.
                </Text>
              )}
            </>
          )}
          {!bayang && <Text style={g.teksMalam}>Menghitung posisi matahari…</Text>}
        </Kartu>
        <Redup>
          Dihitung dari posisi matahari untuk koordinat {LOKASI.label}. Setiap 28 Mei sekitar pukul 16.18 WIB dan 16 Juli sekitar 16.27 WIB, matahari tepat di atas
          Kakbah sehingga bayangan di mana pun mengarah ke kiblat.
        </Redup>
      </Bagian>

      <Kartu nada="krem" style={{ marginTop: 22, gap: 6 }}>
        <Teks style={{ ...F.body(600) }}>Cara hitung</Teks>
        <Redup>
          Arah dihitung dengan rumus segitiga bola (pustaka adhan-js) dari {LOKASI.label} ke Kakbah (21°25′ LU 39°50′ BT). Jarum kompas magnet di Jawa Timur
          menyimpang sekitar 1° dari utara sejati, selisih yang masih wajar untuk menentukan arah salat.
        </Redup>
      </Kartu>
    </Layar>
  );
}

const g = StyleSheet.create({
  kompasKartu: { alignItems: 'center', gap: 6, paddingVertical: 20 },
  derajat: { ...F.display(700), fontSize: 46, lineHeight: 52, color: W.tinta, marginTop: 8 },
  arahan: { ...F.body(600), fontSize: 16, color: W.zaitun, marginTop: 6 },
  pesan: { ...F.body(500), fontSize: 14, color: W.terakota, textAlign: 'center', marginTop: 4 },
  jamBayang: { ...F.display(700), fontSize: 30, lineHeight: 36, color: W.krem },
  teksMalam: { ...F.body(400), fontSize: 14, lineHeight: 21, color: W.kremRedup },
  teksMalamKuat: { ...F.body(600), fontSize: 14, lineHeight: 21, color: W.krem },
});
