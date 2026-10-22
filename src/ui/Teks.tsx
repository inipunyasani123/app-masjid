import type { ReactNode } from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { F, W } from './tema';

type P = TextProps & { children?: ReactNode; style?: TextStyle | (TextStyle | false | undefined)[] };

export function Judul({ level = 1, style, ...p }: P & { level?: 1 | 2 | 3 }) {
  const s = level === 1 ? g.h1 : level === 2 ? g.h2 : g.h3;
  return <Text role="heading" aria-level={level} {...p} style={[s, style as TextStyle]} />;
}

export function Teks({ style, ...p }: P) {
  return <Text {...p} style={[g.teks, style as TextStyle]} />;
}

export function Redup({ style, ...p }: P) {
  return <Text {...p} style={[g.redup, style as TextStyle]} />;
}

/** Label kecil berhuruf kapital renggang (bukan pil). */
export function Label({ style, ...p }: P) {
  return <Text {...p} style={[g.label, style as TextStyle]} />;
}

export function Arab({ style, ...p }: P) {
  return <Text {...({ lang: 'ar' } as object)} {...p} style={[g.arab, style as TextStyle]} />;
}

const g = StyleSheet.create({
  h1: { ...F.display(700), fontSize: 30, lineHeight: 36, color: W.tinta, letterSpacing: -0.3 },
  h2: { ...F.display(600), fontSize: 22, lineHeight: 28, color: W.tinta },
  h3: { ...F.body(600), fontSize: 16, lineHeight: 22, color: W.tinta },
  teks: { ...F.body(400), fontSize: 15, lineHeight: 22, color: W.tinta },
  redup: { ...F.body(400), fontSize: 13, lineHeight: 19, color: W.tinta2 },
  label: { ...F.body(600), fontSize: 11, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase', color: W.kuningan },
  arab: { ...F.display(600), fontSize: 16, lineHeight: 26, writingDirection: 'rtl', color: W.kuningan },
});
