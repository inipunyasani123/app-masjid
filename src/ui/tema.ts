import { Platform, type TextStyle } from 'react-native';

/** Palet "Ufuk": kapur batu, tinta malam, kuningan, terakota. Semua pasangan teks lolos kontras ≥ 4,5:1. */
export const W = {
  kertas: '#F4EEE2',
  kartu: '#FFFCF5',
  kartu2: '#EDE3CF',
  garis: '#DCD0BA',
  garisTua: '#B9A98C',
  tinta: '#17203A',
  tinta2: '#4E5368',
  kuningan: '#85560F',
  terakota: '#9E3F18',
  zaitun: '#3A6235',
  nila: '#2D3C74',
  malam: '#141C33',
  malam2: '#1F2A4A',
  emas: '#E2B657',
  krem: '#F5EAD2',
  kremRedup: '#C9C3B5',
  fajar: '#F3B38A',
} as const;

const web = Platform.OS === 'web';
const DISPLAY_WEB = 'Messiri, "Iowan Old Style", Georgia, serif';
const BODY_WEB = 'Readex, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const F = {
  display(w: 600 | 700 = 600): TextStyle {
    return web ? { fontFamily: DISPLAY_WEB, fontWeight: String(w) as TextStyle['fontWeight'] } : { fontFamily: w === 700 ? 'ElMessiri-Bold' : 'ElMessiri-SemiBold' };
  },
  body(w: 400 | 500 | 600 = 400): TextStyle {
    return web
      ? { fontFamily: BODY_WEB, fontWeight: String(w) as TextStyle['fontWeight'] }
      : { fontFamily: w === 600 ? 'ReadexPro-SemiBold' : w === 500 ? 'ReadexPro-Medium' : 'ReadexPro-Regular' };
  },
};

export const R = { kecil: 10, sedang: 16, besar: 24 };
export const JARAK = 16;
