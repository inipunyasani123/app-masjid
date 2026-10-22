import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { hijriah, BULAN_HIJRIAH, BULAN_HIJRIAH_PENDEK } from '@/lib/hijriah';
import { meta } from '@/lib/meta';
import { jadwalHari, LOKASI, METODE, NAMA_WAKTU, URUTAN_SALAT, URUTAN_WAKTU } from '@/lib/salat';
import { useHariIni } from '@/lib/sekarang';
import { useSimpan } from '@/lib/simpan';
import { BULAN, HARI_PENDEK, hariDalamPekan, jam, jumlahHari, samaTgl, type Tgl } from '@/lib/waktu';
import { Bintang8, Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Tautan } from '@/ui/Komponen';
import { Label, Redup, Teks } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/jadwal',
    'Jadwal Salat Tulungagung Sebulan | Nurul Ufuk',
    'Jadwal salat Tulungagung sebulan penuh, dihitung di perangkat dengan kriteria Kemenag RI (Subuh −20°, Isya −18°). Lengkap dengan Imsak dan tanggal Hijriah.',
  );
}

export default function Jadwal() {
  const { hari } = useHariIni();
  const [koreksi] = useSimpan<number>('koreksi', 0);
  const [geser, setGeser] = useState(0);
  const [lengkap, setLengkap] = useState(false);
  useEffect(() => setGeser(0), [hari?.m]);

  const bulan = useMemo(() => {
    if (!hari) return null;
    const idx = hari.y * 12 + hari.m - 1 + geser;
    const y = Math.floor(idx / 12), m = (idx % 12) + 1;
    const baris = Array.from({ length: jumlahHari(y, m) }, (_, i) => {
      const t: Tgl = { y, m, d: i + 1 };
      return { t, j: jadwalHari(t), h: hijriah(t, koreksi) };
    });
    const hAwal = baris[0].h, hAkhir = baris[baris.length - 1].h;
    const rentangH = hAwal.m === hAkhir.m ? `${BULAN_HIJRIAH[hAwal.m - 1]} ${hAwal.y} H` : `${BULAN_HIJRIAH[hAwal.m - 1]}–${BULAN_HIJRIAH[hAkhir.m - 1]} ${hAkhir.y} H`;
    return { y, m, baris, rentangH };
  }, [hari?.y, hari?.m, hari?.d, geser, koreksi]);

  const kolom = lengkap ? URUTAN_WAKTU : URUTAN_SALAT;

  return (
    <Layar label={`${LOKASI.nama} · WIB`} judul="Jadwal salat" sub={`Dihitung langsung di perangkat untuk ${LOKASI.nama} (${LOKASI.label}), tanpa internet.`}>
      <View style={g.bulanBar}>
        <Pressable role="button" aria-label="Bulan sebelumnya" onPress={() => setGeser((x) => Math.max(-12, x - 1))} style={g.panah} disabled={!bulan}>
          <Ikon nama="kembali" ukuran={20} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={g.bulanJudul} aria-live="polite">
            {bulan ? `${BULAN[bulan.m - 1]} ${bulan.y}` : 'Bulan ini'}
          </Text>
          <Redup style={{ fontSize: 12 }}>{bulan ? bulan.rentangH : ' '}</Redup>
        </View>
        <Pressable role="button" aria-label="Bulan berikutnya" onPress={() => setGeser((x) => Math.min(12, x + 1))} style={g.panah} disabled={!bulan}>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <Ikon nama="kembali" ukuran={20} />
          </View>
        </Pressable>
      </View>

      <View style={g.pilihKolom}>
        <Pressable role="switch" aria-checked={lengkap} onPress={() => setLengkap((x) => !x)} style={g.saklar}>
          <View style={[g.saklarJalur, lengkap && { backgroundColor: W.malam }]}>
            <View style={[g.saklarBulat, lengkap && { transform: [{ translateX: 16 }] }]} />
          </View>
          <Text style={g.saklarTeks}>Tampilkan Imsak & Terbit</Text>
        </Pressable>
      </View>

      <View role="table" aria-label="Jadwal salat sebulan" style={g.tabel}>
        <View role="row" style={[g.baris, g.kepala]}>
          <Text role="columnheader" style={[g.sel, g.selTgl, g.kepalaTeks]}>
            Tgl
          </Text>
          {kolom.map((k) => (
            <Text key={k} role="columnheader" style={[g.sel, g.kepalaTeks, lengkap && { fontSize: 10.5 }]}>
              {NAMA_WAKTU[k].label}
            </Text>
          ))}
        </View>
        {bulan
          ? bulan.baris.map(({ t, j, h }) => {
              const ini = hari ? samaTgl(t, hari) : false;
              const jumat = hariDalamPekan(t) === 5;
              return (
                <View key={t.d} role="row" style={[g.baris, ini && g.barisIni, t.d % 2 === 0 && !ini && g.barisGenap]} aria-current={ini ? 'date' : undefined}>
                  <View role="rowheader" style={[g.sel, g.selTgl]}>
                    <Text style={[g.tgl, ini && { color: W.krem }]}>
                      {t.d} <Text style={[g.hari, jumat && !ini && { color: W.terakota }, ini && { color: W.emas }]}>{HARI_PENDEK[hariDalamPekan(t)]}</Text>
                    </Text>
                    <Text style={[g.hTgl, ini && { color: W.kremRedup }]}>{h.d} {BULAN_HIJRIAH_PENDEK[h.m - 1]}</Text>
                  </View>
                  {kolom.map((k) => (
                    <Text key={k} role="cell" style={[g.sel, g.jam, lengkap && { fontSize: 12 }, ini && { color: W.krem }]}>
                      {jam(j[k])}
                    </Text>
                  ))}
                </View>
              );
            })
          : Array.from({ length: 31 }, (_, i) => (
              <View key={i} role="row" style={[g.baris, g.barisKosong, i % 2 === 1 && g.barisGenap]}>
                <Text role="cell" style={[g.sel, g.selTgl, g.jam]}>
                  {i + 1}
                </Text>
              </View>
            ))}
      </View>

      <Bagian judul="Metode hitung" kanan={<Bintang8 ukuran={18} />}>
        <Kartu style={{ gap: 10 }}>
          <Label>{METODE.ringkas}</Label>
          {METODE.rinci.map((r) => (
            <View key={r} style={g.poin}>
              <View style={g.titik} />
              <Teks style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>{r}</Teks>
            </View>
          ))}
          <Redup>
            Diuji terhadap jadwal resmi Kemenag RI untuk Kabupaten Tulungagung sepanjang 2026 (2.555 waktu): 97,8% sama persis dan
            sisanya hanya selisih 1 menit. Dihitung dengan pustaka {METODE.pustaka}.
          </Redup>
        </Kartu>
        <Kartu nada="krem" style={{ gap: 6 }}>
          <Teks style={{ ...F.body(600) }}>Tentang tanggal Hijriah</Teks>
          <Redup>
            Tanggal Hijriah adalah perkiraan kalender Ummul Qura. Awal Ramadan, Syawal, dan Zulhijah resmi mengikuti sidang isbat Kementerian Agama, jadi bisa
            bergeser satu hari. Koreksi ±1 hari bisa diatur di halaman Tentang.
          </Redup>
          <Tautan href="/tentang" style={g.tautan}>
            <Text style={g.tautanTeks}>Atur koreksi Hijriah</Text>
            <Ikon nama="kanan" ukuran={16} warna={W.nila} />
          </Tautan>
        </Kartu>
      </Bagian>
    </Layar>
  );
}

const g = StyleSheet.create({
  bulanBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: W.kartu, borderRadius: 999, borderWidth: 1, borderColor: W.garis, padding: 4 },
  panah: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bulanJudul: { ...F.display(600), fontSize: 19, lineHeight: 24, color: W.tinta },
  pilihKolom: { marginTop: 10, marginBottom: 8 },
  saklar: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, alignSelf: 'flex-start' },
  saklarJalur: { width: 40, height: 24, borderRadius: 12, backgroundColor: W.garisTua, padding: 3 },
  saklarBulat: { width: 18, height: 18, borderRadius: 9, backgroundColor: W.kartu },
  saklarTeks: { ...F.body(500), fontSize: 14, color: W.tinta },
  tabel: { backgroundColor: W.kartu, borderRadius: 20, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' },
  baris: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 8 },
  barisGenap: { backgroundColor: '#F8F3E9' },
  barisKosong: { height: 44 },
  barisIni: { backgroundColor: W.malam },
  kepala: { backgroundColor: W.kartu2, minHeight: 38 },
  kepalaTeks: { ...F.body(600), fontSize: 12, color: W.tinta2 },
  sel: { flex: 1, textAlign: 'center' },
  selTgl: { flex: 1.25, textAlign: 'left', alignItems: 'flex-start' },
  tgl: { ...F.body(600), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
  hari: { ...F.body(400), fontSize: 11, color: W.tinta2 },
  hTgl: { ...F.body(400), fontSize: 10.5, color: W.kuningan },
  jam: { ...F.body(500), fontSize: 13.5, color: W.tinta, fontVariant: ['tabular-nums'] },
  poin: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  titik: { width: 6, height: 6, borderRadius: 3, backgroundColor: W.emas, marginTop: 8 },
  tautan: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'flex-start' },
  tautanTeks: { ...F.body(600), fontSize: 14, color: W.nila },
});
