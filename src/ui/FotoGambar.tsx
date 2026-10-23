// Android/iOS: foto dibundel lewat require (berkas sama dengan versi web di public/foto).
import { Image, StyleSheet } from 'react-native';

const DATAR = {
  wudu: require('../../public/foto/wudu.webp'),
  kurma: require('../../public/foto/kurma.webp'),
  kambing: require('../../public/foto/kambing.webp'),
  bedug: require('../../public/foto/bedug.webp'),
};
const TEGAK = {
  wudu: require('../../public/foto/wudu-tegak.webp'),
  kurma: require('../../public/foto/kurma-tegak.webp'),
  kambing: require('../../public/foto/kambing-tegak.webp'),
  bedug: require('../../public/foto/bedug-tegak.webp'),
};

export type NamaFotoBerkas = keyof typeof DATAR;

export function FotoGambar({ nama, tegak, alt }: { nama: NamaFotoBerkas; tegak: boolean; alt: string; prioritas?: boolean; ukuran?: string }) {
  return <Image source={tegak ? TEGAK[nama] : DATAR[nama]} style={g.isi} resizeMode="cover" accessibilityLabel={alt} />;
}

const g = StyleSheet.create({ isi: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' } });
