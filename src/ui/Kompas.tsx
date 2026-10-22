import { Platform } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { BINTANG8 } from './Ikon';
import { W } from './tema';

const FONT = Platform.OS === 'web' ? 'Readex, system-ui, sans-serif' : 'ReadexPro-SemiBold';

/** Mawar kompas dengan jarum kiblat. `putar` = arah hadap perangkat (derajat) bila kompas aktif. */
export function Kompas({ kiblat, putar = 0, ukuran = 280, mini = false }: { kiblat: number; putar?: number; ukuran?: number; mini?: boolean }) {
  const c = 150;
  const ticks = [];
  for (let a = 0; a < 360; a += mini ? 30 : 5) {
    const besar = a % 90 === 0, sedang = a % 30 === 0;
    const r1 = 132, r2 = besar ? 116 : sedang ? 121 : 126;
    const t = ((a - 90) * Math.PI) / 180;
    ticks.push(
      <Line key={a} x1={c + r1 * Math.cos(t)} y1={c + r1 * Math.sin(t)} x2={c + r2 * Math.cos(t)} y2={c + r2 * Math.sin(t)} stroke={besar ? W.tinta : W.garisTua} strokeWidth={besar ? 2.4 : sedang ? 1.6 : 1} strokeLinecap="round" />,
    );
  }
  const mata = [
    ['U', 0],
    ['T', 90],
    ['S', 180],
    ['B', 270],
  ] as const;
  const tk = ((kiblat - 90) * Math.PI) / 180;
  const ujung = { x: c + 98 * Math.cos(tk), y: c + 98 * Math.sin(tk) };
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 300 300" aria-hidden>
      <Circle cx={c} cy={c} r={146} fill={W.kartu} stroke={W.garis} strokeWidth={2} />
      <G transform={`rotate(${-putar} ${c} ${c})`}>
        <G opacity={0.16} transform={`translate(${c - 84} ${c - 84}) scale(7)`}>
          <Path d={BINTANG8} fill="none" stroke={W.kuningan} strokeWidth={0.25} />
        </G>
        {ticks}
        {!mini &&
          mata.map(([h, a]) => {
            const t = ((a - 90) * Math.PI) / 180;
            return (
              <SvgText key={h} x={c + 100 * Math.cos(t)} y={c + 100 * Math.sin(t) + 6} fontSize={17} fontFamily={FONT} fontWeight="600" fill={h === 'U' ? W.terakota : W.tinta} textAnchor="middle">
                {h}
              </SvgText>
            );
          })}
        <Line x1={c} y1={c} x2={ujung.x} y2={ujung.y} stroke={W.malam} strokeWidth={mini ? 9 : 5} strokeLinecap="round" />
        <G transform={`translate(${ujung.x} ${ujung.y}) rotate(${kiblat})`}>
          <Rect x={-13} y={-13} width={26} height={26} rx={3} fill={W.malam} />
          <Rect x={-13} y={-6} width={26} height={4.5} fill={W.emas} />
        </G>
        <Circle cx={c} cy={c} r={mini ? 10 : 7} fill={W.emas} stroke={W.malam} strokeWidth={3} />
      </G>
      {putar !== 0 && <Path d={`M${c} 6 L${c - 9} 24 H${c + 9} Z`} fill={W.terakota} />}
    </Svg>
  );
}
