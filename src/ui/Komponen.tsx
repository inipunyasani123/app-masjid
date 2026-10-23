import { Link, useRouter, type Href } from 'expo-router';
import type { ComponentRef, ReactNode, Ref } from 'react';
import { Platform, Pressable, ScrollView, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ikon, type NamaIkon } from './Ikon';
import { Judul, Label, Redup, Text } from './Teks';
import { F, W } from './tema';

const web = Platform.OS === 'web';

export function Layar({
  children,
  judul,
  label,
  sub,
  kembali,
  kanan,
  bawah,
  gulirRef,
}: {
  children: ReactNode;
  judul?: string;
  label?: string;
  sub?: string;
  kembali?: boolean;
  kanan?: ReactNode;
  /** Bilah aksi lengket di bawah layar (di atas menu tab). */
  bawah?: ReactNode;
  gulirRef?: Ref<ComponentRef<typeof ScrollView>>;
}) {
  const ins = useSafeAreaInsets();
  return (
    <View role="main" style={g.layar}>
      <ScrollView
        ref={gulirRef}
        contentContainerStyle={[g.isi, { paddingTop: (web ? 0 : ins.top) + 14 }]}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
        {(kembali || kanan) && (
          <View style={g.bilahAtas}>
            {kembali ? <TombolKembali /> : <View />}
            {kanan}
          </View>
        )}
        {judul && (
          <View style={g.kepala}>
            {label && <Label>{label}</Label>}
            <Judul level={1}>{judul}</Judul>
            {sub && <Redup style={g.sub}>{sub}</Redup>}
          </View>
        )}
        {children}
      </ScrollView>
      {bawah && <View style={g.bawah}>{bawah}</View>}
    </View>
  );
}

/** Sakelar hidup/mati (role="switch"), target sentuh ≥ 44. */
export function Saklar({ nilai, onUbah, label, keterangan, gelap }: { nilai: boolean; onUbah: (v: boolean) => void; label: string; keterangan?: string; gelap?: boolean }) {
  return (
    <Pressable role="switch" aria-checked={nilai} onPress={() => onUbah(!nilai)} style={g.saklar}>
      <View style={{ flex: 1 }}>
        <Text style={[g.saklarLabel, gelap && { color: W.krem }]}>{label}</Text>
        {keterangan && <Text style={[g.saklarKet, gelap && { color: W.kremRedup }]}>{keterangan}</Text>}
      </View>
      <View style={[g.jalur, nilai && { backgroundColor: gelap ? W.emas : W.malam }]}>
        <View style={[g.bulat, nilai && { transform: [{ translateX: 18 }] }]} />
      </View>
    </Pressable>
  );
}

export function TombolKembali() {
  const router = useRouter();
  return (
    <Pressable
      role="button"
      aria-label="Kembali"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={({ pressed }) => [g.kembali, pressed && { opacity: 0.6 }]}
      hitSlop={6}
    >
      <Ikon nama="kembali" ukuran={20} />
      <Text style={g.kembaliTeks}>Kembali</Text>
    </Pressable>
  );
}

export function Kartu({ children, style, nada = 'kartu' }: { children: ReactNode; style?: ViewStyle | ViewStyle[]; nada?: 'kartu' | 'krem' | 'malam' | 'garis' }) {
  const n = nada === 'krem' ? g.kartuKrem : nada === 'malam' ? g.kartuMalam : nada === 'garis' ? g.kartuGaris : null;
  return <View style={[g.kartu, n, style as ViewStyle]}>{children}</View>;
}

type Varian = 'utama' | 'garis' | 'emas' | 'halus';

export function Tombol({
  children,
  onPress,
  varian = 'utama',
  ikon,
  label,
  nonaktif,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  varian?: Varian;
  ikon?: NamaIkon;
  label?: string;
  nonaktif?: boolean;
  style?: ViewStyle;
}) {
  const v = VARIAN[varian];
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={nonaktif || undefined}
      disabled={nonaktif}
      onPress={onPress}
      style={({ pressed }) => [g.tombol, v.box, nonaktif && { opacity: 0.45 }, pressed && { opacity: 0.75 }, style]}
    >
      <Text style={[g.tombolTeks, { color: v.teks }]}>{children}</Text>
      {ikon && <Ikon nama={ikon} ukuran={18} warna={v.teks} />}
    </Pressable>
  );
}

const VARIAN: Record<Varian, { box: ViewStyle; teks: string }> = {
  utama: { box: { backgroundColor: W.malam }, teks: W.krem },
  emas: { box: { backgroundColor: W.emas }, teks: W.malam },
  garis: { box: { borderWidth: 1.5, borderColor: W.tinta, backgroundColor: 'transparent' }, teks: W.tinta },
  halus: { box: { backgroundColor: W.kartu2 }, teks: W.tinta },
};

/** Tautan berbentuk kartu/baris; di web menjadi <a href>. */
export function Tautan({ href, children, style, label }: { href: Href; children: ReactNode; style?: StyleProp<ViewStyle>; label?: string }) {
  return (
    <Link href={href} asChild>
      <Pressable aria-label={label} style={StyleSheet.flatten(style)}>
        {children}
      </Pressable>
    </Link>
  );
}

export function Bagian({ judul, kanan, children, style }: { judul: string; kanan?: ReactNode; children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[g.bagian, style]}>
      <View style={g.bagianKepala}>
        <Judul level={2} style={{ flexShrink: 1 }}>{judul}</Judul>
        {kanan}
      </View>
      {children}
    </View>
  );
}

export function Pilihan<T extends string>({
  nilai,
  pilihan,
  onPilih,
  label,
}: {
  nilai: T;
  pilihan: { id: T; teks: string }[];
  onPilih: (v: T) => void;
  label: string;
}) {
  return (
    <View role="radiogroup" aria-label={label} style={g.segmen}>
      {pilihan.map((p) => {
        const aktif = p.id === nilai;
        return (
          <Pressable
            key={p.id}
            role="radio"
            aria-checked={aktif}
            onPress={() => onPilih(p.id)}
            style={[g.segmenItem, aktif && g.segmenAktif]}
          >
            <Text style={[g.segmenTeks, aktif && { color: W.krem }]}>{p.teks}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Garis({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: W.garis }, style]} />;
}

const g = StyleSheet.create({
  layar: { flex: 1, backgroundColor: W.kertas },
  isi: { paddingHorizontal: 16, paddingBottom: 36 },
  bilahAtas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, minHeight: 44 },
  kepala: { marginBottom: 18, gap: 6 },
  sub: { fontSize: 14, lineHeight: 21, maxWidth: 520 },
  kembali: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingRight: 12, marginLeft: -4 },
  kembaliTeks: { ...F.body(500), fontSize: 15, color: W.tinta },
  kartu: { backgroundColor: W.kartu, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: W.garis },
  kartuKrem: { backgroundColor: W.kartu2, borderColor: W.kartu2 },
  kartuMalam: { backgroundColor: W.malam, borderColor: W.malam },
  kartuGaris: { backgroundColor: 'transparent' },
  tombol: { minHeight: 50, borderRadius: 999, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tombolTeks: { ...F.body(600), fontSize: 15 },
  bagian: { marginTop: 26, gap: 12 },
  bagianKepala: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 },
  segmen: { flexDirection: 'row', backgroundColor: W.kartu2, borderRadius: 999, padding: 4, gap: 4 },
  segmenItem: { flex: 1, minHeight: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  segmenAktif: { backgroundColor: W.malam },
  segmenTeks: { ...F.body(600), fontSize: 14, color: W.tinta },
  bawah: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: W.kertas, borderTopWidth: 1, borderTopColor: W.garis },
  saklar: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 4 },
  saklarLabel: { ...F.body(500), fontSize: 15, lineHeight: 21, color: W.tinta },
  saklarKet: { ...F.body(400), fontSize: 13, lineHeight: 18, color: W.tinta2 },
  jalur: { width: 44, height: 26, borderRadius: 13, backgroundColor: W.garisTua, padding: 3 },
  bulat: { width: 20, height: 20, borderRadius: 10, backgroundColor: W.kartu },
});
