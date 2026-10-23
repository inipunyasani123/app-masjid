// Web: <img> biasa yang ikut dirender statis, jadi peramban bisa mengunduhnya sebelum JavaScript jalan
// (react-native-web Image baru memuat gambar setelah hidrasi). Ada srcset 360w/720w untuk foto mendatar.
import { unstable_createElement } from 'react-native-web';

export type NamaFotoBerkas = 'wudu' | 'kurma' | 'kambing' | 'bedug';

export function FotoGambar({ nama, tegak, alt, prioritas, ukuran }: { nama: NamaFotoBerkas; tegak: boolean; alt: string; prioritas?: boolean; ukuran?: string }) {
  return unstable_createElement('img', {
    src: tegak ? `/foto/${nama}-tegak.webp` : `/foto/${nama}.webp`,
    srcSet: tegak ? undefined : `/foto/${nama}-360.webp 360w, /foto/${nama}.webp 720w`,
    sizes: tegak ? undefined : (ukuran ?? '(min-width: 768px) 360px, 100vw'),
    width: tegak ? 360 : 720,
    height: tegak ? 480 : 540,
    alt,
    loading: prioritas ? 'eager' : 'lazy',
    fetchPriority: prioritas ? 'high' : undefined,
    decoding: 'async',
    style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  });
}
