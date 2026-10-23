import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Platform, Pressable, type PressableProps, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Ikon, type NamaIkon } from '@/ui/Ikon';
import { Text } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

const MENU: { name: string; href: '/' | '/jadwal' | '/kegiatan' | '/kas' | '/infak'; teks: string; ikon: NamaIkon }[] = [
  { name: 'beranda', href: '/', teks: 'Beranda', ikon: 'kubah' },
  { name: 'jadwal', href: '/jadwal', teks: 'Jadwal', ikon: 'jam' },
  { name: 'kegiatan', href: '/kegiatan', teks: 'Kegiatan', ikon: 'lentera' },
  { name: 'kas', href: '/kas', teks: 'Kas', ikon: 'buku' },
  { name: 'infak', href: '/infak', teks: 'Infak', ikon: 'tangan' },
];

type TombolTabProps = TabTriggerSlotProps & { ikon: NamaIkon; teks: string };

function TombolTab({ ikon, teks, isFocused, ref: _ref, ...props }: TombolTabProps) {
  return (
    <Pressable {...(props as PressableProps)} aria-current={isFocused ? 'page' : undefined} style={g.tab}>
      <View style={g.ikonWadah}>
        {isFocused && (
          <Svg width={44} height={34} viewBox="0 0 44 34" style={StyleSheet.absoluteFill} aria-hidden>
            <Path d="M2 34 V18 C2 9 10 4 22 0 C34 4 42 9 42 18 V34 Z" fill={W.malam} />
          </Svg>
        )}
        <Ikon nama={ikon} ukuran={21} warna={isFocused ? W.emas : W.tinta2} />
      </View>
      <Text style={[g.teks, isFocused && g.teksAktif]} maksSkala={1.1}>
        {teks}
      </Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const ins = useSafeAreaInsets();
  return (
    <Tabs style={g.akar}>
      <TabSlot style={g.slot} />
      <TabList asChild>
        <View role="navigation" aria-label="Menu utama" style={[g.bilah, { paddingBottom: (Platform.OS === 'web' ? 0 : ins.bottom) + 6 }]}>
          {MENU.map((m) => (
            <TabTrigger key={m.name} name={m.name} href={m.href} asChild>
              <TombolTab ikon={m.ikon} teks={m.teks} />
            </TabTrigger>
          ))}
        </View>
      </TabList>
    </Tabs>
  );
}

const g = StyleSheet.create({
  akar: { flex: 1, backgroundColor: W.kertas },
  slot: { flex: 1 },
  bilah: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: W.kartu,
    borderTopWidth: 1,
    borderTopColor: W.garis,
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 56, paddingVertical: 2 },
  ikonWadah: { width: 44, height: 34, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  teks: { ...F.body(500), fontSize: 13, color: W.tinta2 },
  teksAktif: { ...F.body(600), color: W.tinta },
});
