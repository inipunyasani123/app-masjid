import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import type { ProgramInfak } from '@/lib/data';
import { FotoLengkung } from './Foto';
import { BINTANG8 } from './Ikon';
import { W } from './tema';

/** Ilustrasi santunan buatan sendiri (tanpa orang): karung beras dan amplop di dalam lengkung mihrab. */
function IlustrasiSantunan({ tegak, latar }: { tegak: boolean; latar: string }) {
  const w = 100, h = tegak ? 133.3 : 75;
  const p = Math.min(h * 0.42, 34);
  const lengkung = `M0 ${h} V${p + 8} C0 ${p * 0.45} ${w * 0.3} ${p * 0.15} ${w / 2} 0 C${w * 0.7} ${p * 0.15} ${w} ${p * 0.45} ${w} ${p + 8} V${h} Z`;
  const cy = h - 18;
  return (
    <Svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" aria-hidden>
      <Rect x={0} y={0} width={w} height={h} fill={latar} />
      <Path d={lengkung} fill="#F3E3C4" />
      <G opacity={0.35} transform={`translate(${w / 2 - 15} ${p * 0.9}) scale(1.25)`}>
        <Path d={BINTANG8} fill="none" stroke={W.kuningan} strokeWidth={0.8} />
      </G>
      {/* karung beras */}
      <Path d={`M24 ${cy} C20 ${cy - 22} 26 ${cy - 36} 36 ${cy - 40} L33 ${cy - 46} H47 L44 ${cy - 40} C54 ${cy - 36} 60 ${cy - 22} 56 ${cy} Z`} fill="#FFFCF5" stroke={W.kuningan} strokeWidth={1.2} />
      <Path d={`M34 ${cy - 41} H46`} stroke={W.terakota} strokeWidth={2} strokeLinecap="round" />
      <Path d={`M32 ${cy - 18} H48 M34 ${cy - 12} H46`} stroke={W.garisTua} strokeWidth={1.2} strokeLinecap="round" />
      {/* amplop */}
      <G transform={`translate(52 ${cy - 26}) rotate(-8)`}>
        <Rect x={0} y={0} width={28} height={19} rx={2} fill={W.terakota} />
        <Path d="M0 1 L14 11 L28 1" stroke="#F5EAD2" strokeWidth={1.3} fill="none" />
        <Circle cx={14} cy={11} r={2.4} fill={W.emas} />
      </G>
      <Path d={`M10 ${cy + 1} H90`} stroke={W.kuningan} strokeWidth={1} />
      <Path d={lengkung} fill="none" stroke={W.emas} strokeWidth={0.9} />
    </Svg>
  );
}

export function VisualProgram({ p, tegak = true, latar = W.kartu, hias = true }: { p: ProgramInfak; tegak?: boolean; latar?: string; hias?: boolean }) {
  if (p.visual === 'santunan') {
    return (
      <View style={[g.wadah, { aspectRatio: tegak ? 3 / 4 : 4 / 3 }]} role="img" aria-label={p.keterangan}>
        <IlustrasiSantunan tegak={tegak} latar={latar} />
      </View>
    );
  }
  return <FotoLengkung nama={p.visual} tegak={tegak} latar={latar} hias={hias} />;
}

const g = StyleSheet.create({ wadah: { width: '100%', overflow: 'hidden' } });
