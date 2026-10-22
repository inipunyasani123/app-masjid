import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import type { Orang } from '@/lib/data';
import { BINTANG8 } from './Ikon';

const LENGKUNG = 'M4 60 V26 C4 14 12 6 24 2 C36 6 44 14 44 26 V60 Z';

/**
 * Ilustrasi tokoh buatan sendiri tanpa wajah: sosok di dalam lengkung mihrab.
 * Pembeda tiap orang hanya warna busana dan penutup kepala (peci, sorban, kerudung).
 */
export function Siluet({ orang, ukuran = 56 }: { orang: Orang; ukuran?: number }) {
  const id = `l-${orang.id}`;
  const kulit = '#C99A74';
  return (
    <Svg width={ukuran} height={(ukuran * 62) / 48} viewBox="0 0 48 62" aria-hidden>
      <Defs>
        <ClipPath id={id}>
          <Path d={LENGKUNG} />
        </ClipPath>
      </Defs>
      <Path d={LENGKUNG} fill="#EDE3CF" />
      <G clipPath={`url(#${id})`}>
        <G opacity={0.35} transform="translate(13 10) scale(0.92)">
          <Path d={BINTANG8} fill="none" stroke={orang.warna} strokeWidth={1} />
        </G>
        {orang.jenis === 'kerudung' ? (
          <G>
            <Path d="M24 25 C15 25 12 33 12 40 L8 62 H40 L36 40 C36 33 33 25 24 25 Z" fill={orang.warna} />
            <Path d="M24 16 C30 16 33 20.5 33 26 C33 31 29 34.5 24 34.5 C19 34.5 15 31 15 26 C15 20.5 18 16 24 16 Z" fill={orang.warna} />
            <Path d="M24 19.5 C27.6 19.5 29.6 22.4 29.6 26 C29.6 29.4 27.2 31.4 24 31.4 C20.8 31.4 18.4 29.4 18.4 26 C18.4 22.4 20.4 19.5 24 19.5 Z" fill={kulit} />
            <Path d="M15 27 C16 36 20 39 24 39 C28 39 32 36 33 27 C33 36 31 43 24 43 C17 43 15 36 15 27 Z" fill={orang.warna} opacity={0.85} />
          </G>
        ) : (
          <G>
            <Path d="M9 62 C9 46 14 38 24 38 C34 38 39 46 39 62 Z" fill={orang.warna} />
            <Path d="M20.5 38 L24 45 L27.5 38 Z" fill="#FFFCF5" opacity={0.9} />
            <Rect x={21} y={30} width={6} height={9} rx={2} fill={kulit} />
            <Path d="M24 18.5 C28.6 18.5 31 21.8 31 26 C31 30.2 28.2 33.4 24 33.4 C19.8 33.4 17 30.2 17 26 C17 21.8 19.4 18.5 24 18.5 Z" fill={kulit} />
            {orang.jenis === 'sorban' ? (
              <G>
                <Path d="M16 23.5 C16 17 19.5 14 24 14 C28.5 14 32 17 32 23.5 Z" fill="#FFFCF5" />
                <Path d="M16 22 C20 20.5 28 20.5 32 22 V24.5 C28 23 20 23 16 24.5 Z" fill="#D8CDB6" />
              </G>
            ) : (
              <Path d="M17 23.5 V18.5 C17 16.6 20 15.5 24 15.5 C28 15.5 31 16.6 31 18.5 V23.5 Z" fill="#17203A" />
            )}
          </G>
        )}
      </G>
      <Path d={LENGKUNG} fill="none" stroke={orang.warna} strokeWidth={1.4} />
    </Svg>
  );
}
