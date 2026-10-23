import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { NAMA_WAKTU, URUTAN_SALAT } from '@/lib/salat';
import { useSimpan } from '@/lib/simpan';
import { SKALA_PILIHAN, skalaHuruf, tutupLembar, useSkala } from '@/lib/tampilan';
import { Bintang8 } from './Ikon';
import { Tombol } from './Komponen';
import { LembarBawah } from './LembarBawah';
import { usePengingat } from './Pengingat';
import { Redup, Teks, Text } from './Teks';
import { F, W } from './tema';

const LANGKAH = ['Jadwal dihitung di HP-mu', 'Pasang pengingat', 'Ukuran huruf'];

/** Pengenalan singkat 3 langkah; tampil sekali, bisa diputar ulang dari Tentang. */
export function LembarKenalan() {
  const [ke, setKe] = useState(0);
  const [, setKenalan] = useSimpan<boolean>('kenalan', false);
  const [p, setP] = usePengingat();
  const [, setHuruf] = useSimpan<number>('huruf', 1);
  const skala = useSkala();
  const selesai = () => {
    setKenalan(true);
    tutupLembar();
  };
  return (
    <LembarBawah
      id="lembar-kenalan"
      judul={LANGKAH[ke]}
      onTutup={selesai}
      kaki={
        <View style={g.kaki}>
          <Pressable role="button" onPress={selesai} style={g.lewati}>
            <Text style={g.lewatiTeks}>Lewati</Text>
          </Pressable>
          <Text style={g.langkah}>Langkah {ke + 1} dari 3</Text>
          <Tombol onPress={() => (ke < 2 ? setKe(ke + 1) : selesai())} ikon={ke < 2 ? 'kanan' : 'centang'} style={{ paddingHorizontal: 18 }}>
            {ke < 2 ? 'Lanjut' : 'Mulai'}
          </Tombol>
        </View>
      }
    >
      {ke === 0 && (
        <>
          <View style={g.gambar} aria-hidden>
            <Svg width="100%" height={110} viewBox="0 0 300 110">
              <Path d="M30 92 A120 80 0 0 1 270 92" stroke={W.kuningan} strokeWidth={1.6} strokeDasharray="2 6" fill="none" />
              <Path d="M0 92 H300" stroke={W.kuningan} strokeWidth={1.2} />
              <Circle cx={92} cy={38} r={11} fill={W.emas} />
              <Path d="M126 92 V78 H174 V92 Z M118 80 L150 66 L182 80 Z M128 68 L150 57 L172 68 Z M138 58 L150 50 L162 58 Z" fill={W.malam} />
              <Path d="M196 92 V60 L200 55 L204 60 V92 Z" fill={W.malam} />
            </Svg>
          </View>
          <View style={{ gap: 6 }}>
            {['Dihitung langsung di perangkat', 'Kriteria Kemenag RI, Tulungagung', 'Tetap jalan tanpa internet'].map((x) => (
              <View key={x} style={g.poin}>
                <Bintang8 ukuran={12} warna={W.kuningan} isi />
                <Teks style={g.poinTeks}>{x}</Teks>
              </View>
            ))}
          </View>
          <Redup>Hijriah perkiraan, bisa dikoreksi di Tentang.</Redup>
        </>
      )}
      {ke === 1 && (
        <>
          <Redup>Ketuk waktu yang ingin diingatkan. Bisa diubah kapan saja lewat ikon lonceng.</Redup>
          <View style={g.pilihan}>
            {URUTAN_SALAT.map((k) => {
              const on = !!p.salat[k];
              return (
                <Pressable
                  key={k}
                  role="switch"
                  aria-checked={on}
                  onPress={() => setP((l) => ({ ...l, salat: { ...l.salat, [k]: on ? undefined : 'azan' } }))}
                  style={[g.keping, on && g.kepingAktif]}
                >
                  <Text style={[g.kepingTeks, on && { color: W.krem }]}>{NAMA_WAKTU[k].label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Redup>Di demo web, pengingat tampil sebagai bilah di dalam aplikasi saat azan tiba.</Redup>
        </>
      )}
      {ke === 2 && (
        <>
          <View role="radiogroup" aria-label="Ukuran huruf" style={g.pilihan}>
            {SKALA_PILIHAN.map((s) => {
              const on = Math.abs(skala - s.id) < 0.01;
              return (
                <Pressable
                  key={s.id}
                  role="radio"
                  aria-checked={on}
                  onPress={() => {
                    skalaHuruf.atur(s.id);
                    setHuruf(s.id);
                  }}
                  style={[g.keping, on && g.kepingAktif]}
                >
                  <Text style={[g.kepingTeks, on && { color: W.krem }]}>{s.teks}</Text>
                </Pressable>
              );
            })}
          </View>
          <Teks>Contoh: Magrib pukul 17.30 WIB. Kajian fikih bakda Magrib di ruang utama.</Teks>
        </>
      )}
    </LembarBawah>
  );
}

const g = StyleSheet.create({
  poin: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  poinTeks: { ...F.body(500), fontSize: 15, lineHeight: 21 },
  gambar: { backgroundColor: W.kartu2, borderRadius: 20, paddingHorizontal: 10, paddingTop: 10 },
  pilihan: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keping: { minHeight: 44, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: W.garisTua, alignItems: 'center', justifyContent: 'center', backgroundColor: W.kartu },
  kepingAktif: { backgroundColor: W.malam, borderColor: W.malam },
  kepingTeks: { ...F.body(600), fontSize: 14, color: W.tinta },
  kaki: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  lewati: { minHeight: 48, paddingHorizontal: 10, justifyContent: 'center' },
  lewatiTeks: { ...F.body(600), fontSize: 15, color: W.tinta, textDecorationLine: 'underline' },
  langkah: { ...F.body(500), fontSize: 13, color: W.tinta2 },
});
