import { useMemo } from 'react';
import { Platform } from 'react-native';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { W } from './tema';

const N = 29;

/**
 * Pola mirip QR untuk simulasi pembayaran. Sengaja BUKAN kode QR yang sah (tak bisa dipindai),
 * agar tidak ada yang mengira ini QRIS sungguhan.
 */
export function QrSimulasi({ benih, ukuran = 220 }: { benih: number; ukuran?: number }) {
  const d = useMemo(() => {
    let a = benih >>> 0 || 1;
    const acak = () => {
      a ^= a << 13; a >>>= 0;
      a ^= a >>> 17;
      a ^= a << 5; a >>>= 0;
      return a / 4294967296;
    };
    const pola = (x: number, y: number) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    let p = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!pola(x, y) && acak() > 0.52) p += `M${x} ${y}h1v1h-1z`;
    for (const [ox, oy] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
      p += `M${ox} ${oy}h7v7h-7z M${ox + 1} ${oy + 1}v5h5v-5z M${ox + 2} ${oy + 2}h3v3h-3z`;
    }
    return p;
  }, [benih]);
  return (
    <Svg width={ukuran} height={ukuran} viewBox={`-2 -2 ${N + 4} ${N + 4}`} aria-hidden>
      <Rect x={-2} y={-2} width={N + 4} height={N + 4} fill="#FFFFFF" rx={2} />
      <Path d={d} fill={W.malam} fillRule="evenodd" />
      <G transform={`rotate(-28 ${N / 2} ${N / 2})`}>
        <Rect x={-6} y={N / 2 - 2.6} width={N + 12} height={5.2} fill={W.terakota} />
        <SvgText x={N / 2} y={N / 2 + 1.4} fontSize={4} fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing={0.8} fontFamily={Platform.OS === 'web' ? 'Readex, system-ui, sans-serif' : 'ReadexPro-SemiBold'}>
          SIMULASI
        </SvgText>
      </G>
    </Svg>
  );
}
