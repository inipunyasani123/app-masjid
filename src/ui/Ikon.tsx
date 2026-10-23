import Svg, { Circle, Path } from 'react-native-svg';
import { W } from './tema';

export type NamaIkon =
  | 'kubah' | 'jam' | 'lentera' | 'buku' | 'tangan' | 'kompas' | 'kembali' | 'kanan' | 'centang'
  | 'info' | 'orang' | 'megafon' | 'lokasi' | 'kalender' | 'silang' | 'atas' | 'bawah' | 'tambah'
  | 'lonceng' | 'bagikan' | 'unduh' | 'salin' | 'kurang';

const PATH: Record<NamaIkon, string> = {
  kubah: 'M12 2.5v2.2M12 4.7c-3.9 0-6.4 3.4-6.4 8.3h12.8c0-4.9-2.5-8.3-6.4-8.3ZM4.5 13h15M5.5 13v7.5M18.5 13v7.5M3 20.5h18M10 20.5v-3.2a2 2 0 0 1 4 0v3.2',
  jam: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.2V12l3.2 2',
  lentera: 'M9 3.5h6M12 3.5V5M8 8l1.2-3h5.6L16 8M7.5 8h9l-.8 9.5h-7.4L7.5 8ZM9.5 20.5h5M12 11v3.5',
  buku: 'M5 3.5h11.5a2 2 0 0 1 2 2v15H7a2 2 0 0 1-2-2v-15ZM5 18.5a2 2 0 0 1 2-2h11.5M9 8h6M9 11.5h4',
  tangan: 'M3 14.5h3.2l3.3 1.3h3.3a1.5 1.5 0 0 1 0 3H9.8M14.5 17.6l4.4-2.4a1.6 1.6 0 0 1 2 2.4L15 21H8.5L6 20M3 13.5v8M14 4.3c.9-1.3 3.4-1.1 3.4 1.2 0 1.7-2.3 3.2-3.4 4-1.1-.8-3.4-2.3-3.4-4 0-2.3 2.5-2.5 3.4-1.2Z',
  kompas: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z',
  kembali: 'M15 5l-7 7 7 7',
  kanan: 'M5 12h14M13 6l6 6-6 6',
  centang: 'M5 12.5l4.5 4.5L19 7.5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5.5M12 7.6v.4',
  orang: 'M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6',
  megafon: 'M4 10v4h3l7 4.5v-13L7 10H4ZM17.5 9.5a3.5 3.5 0 0 1 0 5M8 14.5l1.4 5',
  lokasi: 'M12 21s-6.5-6-6.5-11a6.5 6.5 0 1 1 13 0c0 5-6.5 11-6.5 11ZM12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z',
  kalender: 'M4 6.5h16v14H4v-14ZM4 10.5h16M8.5 3.5v5M15.5 3.5v5',
  silang: 'M6 6l12 12M18 6 6 18',
  atas: 'M6 15l6-6 6 6',
  bawah: 'M6 9l6 6 6-6',
  tambah: 'M12 5v14M5 12h14',
  kurang: 'M5 12h14',
  lonceng: 'M6 16.5V11a6 6 0 1 1 12 0v5.5l1.6 2.2H4.4L6 16.5ZM9.8 20.6a2.3 2.3 0 0 0 4.4 0',
  bagikan: 'M12 3.5v11.5M7.8 7.7 12 3.5l4.2 4.2M5 12.5v7.5h14v-7.5',
  unduh: 'M12 3.5v12M7.8 11.3 12 15.5l4.2-4.2M5 20h14',
  salin: 'M8.5 8.5h11v11h-11zM5 15.5v-11h11',
};

export function Ikon({ nama, ukuran = 22, warna = W.tinta, tebal = 1.8, isi }: { nama: NamaIkon; ukuran?: number; warna?: string; tebal?: number; isi?: string }) {
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 24 24" fill="none" aria-hidden>
      <Path d={PATH[nama]} stroke={warna} strokeWidth={tebal} strokeLinecap="round" strokeLinejoin="round" fill={isi ?? 'none'} />
    </Svg>
  );
}

/** Garis luar dua persegi bertumpuk (khatam, bintang delapan). */
export const BINTANG8 = 'M12 2L14.93 4.93L19.07 4.93L19.07 9.07L22 12L19.07 14.93L19.07 19.07L14.93 19.07L12 22L9.07 19.07L4.93 19.07L4.93 14.93L2 12L4.93 9.07L4.93 4.93L9.07 4.93Z';

/** Bintang delapan (khatam) — motif khas aplikasi. */
export function Bintang8({ ukuran = 16, warna = W.kuningan, isi = false, tebal = 1.4 }: { ukuran?: number; warna?: string; isi?: boolean; tebal?: number }) {
  const d = BINTANG8;
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 24 24" aria-hidden>
      <Path d={d} fill={isi ? warna : 'none'} stroke={warna} strokeWidth={tebal} strokeLinejoin="round" />
      {!isi && <Circle cx={12} cy={12} r={2.2} fill={warna} />}
    </Svg>
  );
}
