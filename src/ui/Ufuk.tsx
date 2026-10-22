import { Platform } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { type Jadwal, type KunciSalat, NAMA_WAKTU } from '@/lib/salat';
import { jam } from '@/lib/waktu';

export type Fase = 'malam' | 'fajar' | 'siang' | 'sore' | 'senja';

export const LANGIT: Record<Fase, { atas: string; bawah: string; pijar: string; bintang: number }> = {
  malam: { atas: '#10172C', bawah: '#22305A', pijar: '#2D3C74', bintang: 0.9 },
  fajar: { atas: '#1A2244', bawah: '#5B4C7E', pijar: '#F3B38A', bintang: 0.45 },
  siang: { atas: '#1D2E5C', bawah: '#4C72A3', pijar: '#E2B657', bintang: 0 },
  sore: { atas: '#1C2650', bawah: '#8A5A4A', pijar: '#F3B38A', bintang: 0 },
  senja: { atas: '#151B36', bawah: '#6B3344', pijar: '#E07A4C', bintang: 0.35 },
};

export function faseDari(now: Date | null, j: Jadwal | null): Fase {
  if (!now || !j) return 'malam';
  const t = now.getTime();
  if (t < j.subuh.getTime()) return 'malam';
  if (t < j.terbit.getTime() + 20 * 60000) return 'fajar';
  if (t < j.asar.getTime()) return 'siang';
  if (t < j.magrib.getTime()) return 'sore';
  if (t < j.isya.getTime() + 15 * 60000) return 'senja';
  return 'malam';
}

const BINTANG: [number, number, number][] = [
  [22, 18, 1.1], [58, 40, 0.8], [96, 14, 1.3], [128, 52, 0.7], [160, 22, 0.9], [205, 12, 1.2], [236, 44, 0.8],
  [268, 20, 1], [300, 50, 0.7], [334, 26, 1.2], [18, 78, 0.7], [342, 84, 0.9], [74, 96, 0.6], [290, 104, 0.6],
];

const CX = 180, CY = 150, RX = 140, RY = 108, RYB = 30;
const titikSiang = (f: number) => {
  const a = Math.PI * (1 - Math.min(1, Math.max(0, f)));
  return { x: CX + RX * Math.cos(a), y: CY - RY * Math.sin(a) };
};
const titikMalam = (g: number) => {
  const a = Math.PI * Math.min(1, Math.max(0, g));
  return { x: CX + RX * Math.cos(a), y: CY + RYB * Math.sin(a) };
};

const FONT = Platform.OS === 'web' ? 'Readex, system-ui, sans-serif' : 'ReadexPro-Medium';

type Props = { now: Date | null; kemarin: Jadwal | null; hariIni: Jadwal | null; besok: Jadwal | null; berikut: KunciSalat | null; fase: Fase };

/** Busur ufuk: lintasan matahari dari terbit ke terbenam, lima waktu salat ditandai di sepanjang busur. */
export function Ufuk({ now, kemarin, hariIni, besok, berikut, fase }: Props) {
  const L = LANGIT[fase];
  let benda: { x: number; y: number; siang: boolean } | null = null;
  const tanda: { k: KunciSalat; x: number; y: number; bawah: boolean }[] = [];

  if (hariIni && besok && kemarin) {
    const d0 = hariIni.terbit.getTime(), d1 = hariIni.magrib.getTime();
    const fr = (t: Date) => (t.getTime() - d0) / (d1 - d0);
    const z = titikSiang(fr(hariIni.zuhur)), a = titikSiang(fr(hariIni.asar));
    tanda.push({ k: 'zuhur', ...z, bawah: false }, { k: 'asar', ...a, bawah: false });
    tanda.push({ k: 'magrib', x: CX + RX, y: CY, bawah: false });
    const n0 = hariIni.magrib.getTime(), n1 = besok.terbit.getTime();
    tanda.push({ k: 'isya', ...titikMalam((hariIni.isya.getTime() - n0) / (n1 - n0)), bawah: true });
    const p0 = kemarin.magrib.getTime();
    tanda.push({ k: 'subuh', ...titikMalam((hariIni.subuh.getTime() - p0) / (d0 - p0)), bawah: true });

    if (now) {
      const t = now.getTime();
      if (t >= d0 && t <= d1) benda = { ...titikSiang(fr(now)), siang: true };
      else if (t > d1) benda = { ...titikMalam((t - n0) / (n1 - n0)), siang: false };
      else benda = { ...titikMalam((t - p0) / (d0 - p0)), siang: false };
    }
  }

  return (
    <Svg viewBox="0 0 360 200" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <Defs>
        <LinearGradient id="langit" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={L.atas} />
          <Stop offset="1" stopColor={L.bawah} />
        </LinearGradient>
        <RadialGradient id="pijar" cx="0.5" cy="1" rx="0.6" ry="0.5" fx="0.5" fy="1">
          <Stop offset="0" stopColor={L.pijar} stopOpacity={0.55} />
          <Stop offset="1" stopColor={L.pijar} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={360} height={200} fill="url(#langit)" />
      <Rect x={0} y={60} width={360} height={100} fill="url(#pijar)" />
      {L.bintang > 0 && BINTANG.map(([x, y, rr], i) => <Circle key={i} cx={x} cy={y} r={rr} fill="#F5EAD2" opacity={L.bintang * (0.5 + (i % 3) * 0.25)} />)}

      {/* lintasan siang (atas ufuk) & malam (bawah ufuk) */}
      <Path d={`M${CX - RX} ${CY} A${RX} ${RY} 0 0 1 ${CX + RX} ${CY}`} stroke="#F5EAD2" strokeOpacity={0.4} strokeWidth={1.2} strokeDasharray="2 5" fill="none" />

      {/* siluet: masjid beratap tumpang tiga ala Jawa, menara, dan pohon kelapa */}
      <G fill="#0B1022">
        <Path d="M0 150 H360 V200 H0 Z" />
        <Path d="M150 150 V125 H226 V150 Z" />
        <Path d="M138.7 127.4 Q142.3 125.1 145.8 123.9 L188 106 L230.2 123.9 Q233.7 125.1 237.3 127.4 Z" />
        <Path d="M151.8 108.4 Q154.7 106.6 157.7 105.4 L188 91.8 L218.3 105.4 Q221.3 106.6 224.2 108.4 Z" />
        <Path d="M164.2 93.6 L188 81.7 L211.8 93.6 Z" />
        <Path d="M187 82.9 V71 H189 V82.9 Z" />
        <Circle cx={188} cy={69.5} r={3.2} />
        <Path d="M252 150 V96 L256 90 L260 96 V150 Z" />
        <Path d="M250.5 104 H261.5 V108 H250.5 Z" />
        <Path d="M253.2 90 L256 82 L258.8 90 Z" />
        <Path d="M56 150 C57 132 59 118 63 104 L65 104 C62 118 61 132 61 150 Z" />
        <Path d="M64 104 C54 98 46 100 40 106 C48 102 56 102 64 106 C60 96 52 92 44 92 C54 90 60 94 65 102 C66 92 72 88 80 88 C72 92 68 98 66 104 C74 98 82 98 90 104 C82 102 74 102 66 106 Z" />
        <Path d="M306 150 C305 136 303 126 300 116 L302 116 C305 126 307 136 309 150 Z" />
        <Path d="M301 116 C293 111 286 112 281 117 C288 114 294 114 301 118 C298 110 292 106 285 106 C293 105 298 108 302 114 C304 106 309 103 316 103 C309 106 305 111 303 116 C310 112 316 112 322 117 C315 115 309 115 303 118 Z" />
        <Path d="M96 150 V140 L106 133 L116 140 V150 Z M118 150 V142 L126 137 L134 142 V150 Z M268 150 V141 L278 135 L288 141 V150 Z" />
      </G>
      <Path d={`M${CX + RX} ${CY} A${RX} ${RYB} 0 0 1 ${CX - RX} ${CY}`} stroke="#E2B657" strokeOpacity={0.35} strokeWidth={1.2} strokeDasharray="1.5 5" fill="none" />
      <Path d={`M0 ${CY} H360`} stroke="#E2B657" strokeOpacity={0.5} strokeWidth={0.8} />

      {hariIni &&
        tanda.map((t) => {
          const aktif = t.k === berikut;
          const kiri = t.x > 300;
          return (
            <G key={t.k}>
              <Circle cx={t.x} cy={t.y} r={aktif ? 4.2 : 2.6} fill={aktif ? '#E2B657' : '#F5EAD2'} stroke={aktif ? '#141C33' : 'none'} strokeWidth={1.2} />
              <SvgText
                x={kiri ? t.x - 7 : t.x + 7}
                y={t.bawah ? t.y + 13 : t.y - 7}
                fill={aktif ? '#E2B657' : '#F5EAD2'}
                fillOpacity={aktif ? 1 : 0.85}
                fontSize={9.5}
                fontFamily={FONT}
                fontWeight="500"
                textAnchor={kiri ? 'end' : 'start'}
              >
                {`${NAMA_WAKTU[t.k].label} ${jam(hariIni[t.k])}`}
              </SvgText>
            </G>
          );
        })}

      {benda && benda.siang && (
        <G>
          <Circle cx={benda.x} cy={benda.y} r={18} fill="#F6CF7A" opacity={0.18} />
          <Circle cx={benda.x} cy={benda.y} r={8} fill="#F6CF7A" />
        </G>
      )}
      {benda && !benda.siang && (
        <G>
          <Circle cx={benda.x} cy={benda.y} r={14} fill="#F5EAD2" opacity={0.12} />
          <Path d={`M${benda.x + 2} ${benda.y - 7} a7 7 0 1 0 5.2 11.4 a5.6 5.6 0 1 1 -5.2 -11.4 Z`} fill="#F5EAD2" />
        </G>
      )}
    </Svg>
  );
}
