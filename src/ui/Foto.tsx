import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { W } from './tema';

// Dua potongan per foto: mendatar 4:3 (720×540) dan tegak 3:4 (360×480), supaya rasio bingkai = rasio berkas.
export const FOTO = {
  wudu: require('../../assets/foto/wudu.webp'),
  kurma: require('../../assets/foto/kurma.webp'),
  kambing: require('../../assets/foto/kambing.webp'),
  bedug: require('../../assets/foto/bedug.webp'),
};
const FOTO_TEGAK: Record<keyof typeof FOTO, number> = {
  wudu: require('../../assets/foto/wudu-tegak.webp'),
  kurma: require('../../assets/foto/kurma-tegak.webp'),
  kambing: require('../../assets/foto/kambing-tegak.webp'),
  bedug: require('../../assets/foto/bedug-tegak.webp'),
};
export type NamaFoto = keyof typeof FOTO;

export const KETERANGAN_FOTO: Record<NamaFoto, string> = {
  wudu: 'Deretan kran di tempat wudu berdinding keramik putih',
  kurma: 'Tandan kurma kuning yang mulai matang di pohonnya',
  kambing: 'Dua anak kambing putih berbaring di halaman',
  bedug: 'Bedug kayu dan kentongan di serambi masjid',
};

/**
 * Foto berbingkai lengkung runcing (mihrab). Bingkai dibuat dengan lapisan SVG berwarna latar,
 * jadi bekerja sama di Android, iOS, dan web.
 */
export function FotoLengkung({ nama, latar = W.kartu, style, tegak = false, hias = true }: { nama: NamaFoto; latar?: string; style?: ViewStyle; tegak?: boolean; hias?: boolean }) {
  const rasio = tegak ? 3 / 4 : 4 / 3;
  const w = 100, h = 100 / rasio;
  const puncak = Math.min(h * 0.42, 34);
  const d = `M0 0 H${w} V${h} H0 Z M0 ${h} V${puncak + 8} C0 ${puncak * 0.45} ${w * 0.3} ${puncak * 0.15} ${w / 2} 0 C${w * 0.7} ${puncak * 0.15} ${w} ${puncak * 0.45} ${w} ${puncak + 8} V${h} Z`;
  const garis = `M1.2 ${h} V${puncak + 8} C1.2 ${puncak * 0.47} ${w * 0.3} ${puncak * 0.2} ${w / 2} 1.6 C${w * 0.7} ${puncak * 0.2} ${w - 1.2} ${puncak * 0.47} ${w - 1.2} ${puncak + 8} V${h}`;
  return (
    <View style={[{ aspectRatio: rasio, width: '100%', overflow: 'hidden' }, style]}>
      <Image source={tegak ? FOTO_TEGAK[nama] : FOTO[nama]} style={g.foto} resizeMode="cover" alt={KETERANGAN_FOTO[nama]} aria-label={KETERANGAN_FOTO[nama]} />
      <Svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={StyleSheet.absoluteFill} aria-hidden>
        <Path d={d} fill={latar} fillRule="evenodd" />
        {hias && <Path d={garis} stroke={W.emas} strokeWidth={0.9} fill="none" vectorEffect="non-scaling-stroke" />}
      </Svg>
    </View>
  );
}

const g = StyleSheet.create({
  foto: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
