import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Tautan } from './Komponen';
import { Redup } from './Teks';
import { F, W } from './tema';

/** Halaman 404 bergaya: busur ufuk kosong, bulan sabit tersesat di bawah cakrawala. */
export function TidakDitemukan() {
  return (
    <View role="main" style={g.wadah}>
      <Svg width={240} height={140} viewBox="0 0 240 140" aria-hidden>
        <Path d="M20 100 A100 80 0 0 1 220 100" stroke={W.garisTua} strokeWidth={1.5} strokeDasharray="3 6" fill="none" />
        <Path d="M0 100 H240" stroke={W.kuningan} strokeWidth={1.2} />
        <Path d="M220 100 A100 26 0 0 1 20 100" stroke={W.emas} strokeWidth={1.2} strokeDasharray="2 6" fill="none" />
        <Circle cx={120} cy={122} r={12} fill={W.malam} />
        <Path d="M124 112 a10 10 0 1 0 7.4 16.3 a8 8 0 1 1 -7.4 -16.3 Z" fill={W.emas} />
      </Svg>
      <Text style={g.kode}>404</Text>
      <Text role="heading" aria-level={1} style={g.judul}>
        Halaman ini tidak ada di cakrawala
      </Text>
      <Redup style={{ textAlign: 'center', maxWidth: 300 }}>Mungkin tautannya keliru atau halamannya sudah dipindah. Jadwal salat hari ini tetap menunggu di beranda.</Redup>
      <Tautan href="/" style={g.tombol}>
        <Text style={g.tombolTeks}>Kembali ke beranda</Text>
      </Tautan>
    </View>
  );
}

const g = StyleSheet.create({
  wadah: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, backgroundColor: W.kertas },
  kode: { ...F.display(700), fontSize: 64, lineHeight: 70, color: W.kuningan },
  judul: { ...F.display(700), fontSize: 24, lineHeight: 30, color: W.tinta, textAlign: 'center' },
  tombol: { marginTop: 10, minHeight: 50, paddingHorizontal: 24, borderRadius: 999, backgroundColor: W.malam, alignItems: 'center', justifyContent: 'center' },
  tombolTeks: { ...F.body(600), fontSize: 15, color: W.krem },
});
