import type { ReactNode } from 'react';
import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { useSkala } from '@/lib/tampilan';
import { F, W } from './tema';

type P = TextProps & { children?: ReactNode; style?: TextStyle | (TextStyle | false | undefined | null)[]; maksSkala?: number };

/**
 * Text dengan skala huruf pilihan pengguna (Normal 1,0 · Besar 1,15 · Lebih besar 1,3).
 * `maksSkala` membatasi pembesaran untuk angka raksasa agar tidak terpotong.
 */
export function Text({ style, maksSkala = 1.3, ...p }: P) {
  const skala = Math.min(useSkala(), maksSkala);
  if (skala === 1) return <RNText {...p} style={style as TextStyle} />;
  const f = (StyleSheet.flatten(style as TextStyle) || {}) as TextStyle;
  const s = {
    ...f,
    ...(typeof f.fontSize === 'number' ? { fontSize: Math.round(f.fontSize * skala * 10) / 10 } : null),
    ...(typeof f.lineHeight === 'number' ? { lineHeight: Math.round(f.lineHeight * skala * 10) / 10 } : null),
  } as TextStyle;
  return <RNText {...p} style={s} />;
}

export function Judul({ level = 1, style, ...p }: P & { level?: 1 | 2 | 3 }) {
  const s = level === 1 ? g.h1 : level === 2 ? g.h2 : g.h3;
  return <Text role="heading" aria-level={level} {...p} style={[s, ...(Array.isArray(style) ? style : [style])]} />;
}

export function Teks({ style, ...p }: P) {
  return <Text {...p} style={[g.teks, ...(Array.isArray(style) ? style : [style])]} />;
}

export function Redup({ style, ...p }: P) {
  return <Text {...p} style={[g.redup, ...(Array.isArray(style) ? style : [style])]} />;
}

/** Label kecil berhuruf kapital renggang (bukan pil). */
export function Label({ style, ...p }: P) {
  return <Text {...p} style={[g.label, ...(Array.isArray(style) ? style : [style])]} />;
}

export function Arab({ style, ...p }: P) {
  return <Text {...({ lang: 'ar' } as object)} {...p} style={[g.arab, ...(Array.isArray(style) ? style : [style])]} />;
}

const g = StyleSheet.create({
  h1: { ...F.display(700), fontSize: 30, lineHeight: 36, color: W.tinta, letterSpacing: -0.3 },
  h2: { ...F.display(600), fontSize: 22, lineHeight: 28, color: W.tinta },
  h3: { ...F.body(600), fontSize: 16, lineHeight: 22, color: W.tinta },
  teks: { ...F.body(400), fontSize: 15, lineHeight: 22, color: W.tinta },
  redup: { ...F.body(400), fontSize: 13, lineHeight: 19, color: W.tinta2 },
  label: { ...F.body(600), fontSize: 12, lineHeight: 16, letterSpacing: 1.3, textTransform: 'uppercase', color: W.kuningan },
  arab: { ...F.display(600), fontSize: 16, lineHeight: 26, writingDirection: 'rtl', color: W.kuningan },
});
