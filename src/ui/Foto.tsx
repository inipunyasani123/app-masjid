import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FotoGambar, type NamaFotoBerkas } from './FotoGambar';
import { W } from './tema';

export type NamaFoto = NamaFotoBerkas;

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
export function FotoLengkung({
  nama,
  latar = W.kartu,
  style,
  tegak = false,
  hias = true,
  prioritas,
  ukuran,
}: {
  nama: NamaFoto;
  latar?: string;
  style?: ViewStyle;
  tegak?: boolean;
  hias?: boolean;
  prioritas?: boolean;
  /** atribut sizes (web) */
  ukuran?: string;
}) {
  const rasio = tegak ? 3 / 4 : 4 / 3;
  const w = 100, h = 100 / rasio;
  const puncak = Math.min(h * 0.42, 34);
  const d = `M0 0 H${w} V${h} H0 Z M0 ${h} V${puncak + 8} C0 ${puncak * 0.45} ${w * 0.3} ${puncak * 0.15} ${w / 2} 0 C${w * 0.7} ${puncak * 0.15} ${w} ${puncak * 0.45} ${w} ${puncak + 8} V${h} Z`;
  const garis = `M1.2 ${h} V${puncak + 8} C1.2 ${puncak * 0.47} ${w * 0.3} ${puncak * 0.2} ${w / 2} 1.6 C${w * 0.7} ${puncak * 0.2} ${w - 1.2} ${puncak * 0.47} ${w - 1.2} ${puncak + 8} V${h}`;
  return (
    <View style={[{ aspectRatio: rasio, width: '100%', overflow: 'hidden' }, style]}>
      <FotoGambar nama={nama} tegak={tegak} alt={KETERANGAN_FOTO[nama]} prioritas={prioritas} ukuran={ukuran} />
      <Svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={StyleSheet.absoluteFill} aria-hidden>
        <Path d={d} fill={latar} fillRule="evenodd" />
        {hias && <Path d={garis} stroke={W.emas} strokeWidth={0.9} fill="none" vectorEffect="non-scaling-stroke" />}
      </Svg>
    </View>
  );
}
