import { type ComponentRef, type ReactNode, useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ikon } from './Ikon';
import { Text } from './Teks';
import { F, W } from './tema';

const SELEKTOR_FOKUS = 'a[href],button,input,textarea,select,[tabindex]:not([tabindex="-1"])';

/**
 * Lembar bawah: latar diredupkan, pegangan terlihat, tombol Tutup berlabel.
 * Web: fokus pindah ke lembar, Tab terkunci di dalamnya, Esc menutup.
 */
export function LembarBawah({ judul, id, onTutup, children, kaki }: { judul: string; id: string; onTutup: () => void; children: ReactNode; kaki?: ReactNode }) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const el = ref.current as unknown as HTMLElement | null;
    if (!el) return;
    const daftar = () => [...el.querySelectorAll<HTMLElement>(SELEKTOR_FOKUS)].filter((x) => x.offsetParent !== null);
    const t = setTimeout(() => (el.querySelector<HTMLElement>('[data-fokus-awal]') ?? daftar()[0])?.focus(), 40);
    const tombol = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onTutup();
      } else if (e.key === 'Tab') {
        const f = daftar();
        if (!f.length) return;
        const awal = f[0], akhir = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === awal || !el.contains(document.activeElement))) {
          e.preventDefault();
          akhir.focus();
        } else if (!e.shiftKey && (document.activeElement === akhir || !el.contains(document.activeElement))) {
          e.preventDefault();
          awal.focus();
        }
      }
    };
    document.addEventListener('keydown', tombol);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', tombol);
    };
  }, [onTutup]);

  return (
    <View style={g.lapis}>
      <Pressable onPress={onTutup} style={g.latar} aria-hidden focusable={false} tabIndex={-1} />
      <View ref={ref} role="dialog" aria-modal aria-labelledby={`${id}-judul`} style={g.lembar}>
        <View style={g.pegangan} aria-hidden />
        <View style={g.kepala}>
          <Text nativeID={`${id}-judul`} role="heading" aria-level={2} style={g.judul}>
            {judul}
          </Text>
          <Pressable role="button" aria-label="Tutup" onPress={onTutup} style={g.tutup}>
            <Ikon nama="silang" ukuran={20} />
          </Pressable>
        </View>
        <ScrollView style={g.gulir} contentContainerStyle={g.isi} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {kaki && <View style={g.kaki}>{kaki}</View>}
      </View>
    </View>
  );
}

const g = StyleSheet.create({
  lapis: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 20 },
  latar: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,16,34,0.55)' },
  lembar: { backgroundColor: W.kertas, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', paddingTop: 8 },
  pegangan: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: W.garisTua, marginBottom: 6 },
  kepala: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 6, gap: 12 },
  judul: { ...F.display(700), fontSize: 22, lineHeight: 28, color: W.tinta, flex: 1 },
  tutup: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: W.kartu, borderWidth: 1, borderColor: W.garis },
  gulir: { flexGrow: 0, flexShrink: 1 },
  isi: { paddingHorizontal: 18, paddingBottom: 18, gap: 12 },
  kaki: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 16, borderTopWidth: 1, borderTopColor: W.garis, backgroundColor: W.kertas, gap: 8 },
});
