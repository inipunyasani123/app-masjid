import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { JUDUL } from '@/lib/judul';
import { useSimpan } from '@/lib/simpan';
import { bukaLembar, lembar, skalaHuruf, useLembar } from '@/lib/tampilan';
import { LembarKenalan } from '@/ui/Kenalan';
import { BannerPengingat, LembarPengingat } from '@/ui/Pengingat';
import { W } from '@/ui/tema';

/** Memuat ukuran huruf tersimpan dan membuka pengenalan sekali untuk pengunjung baru. */
function Pemuat() {
  const [huruf, , siapHuruf] = useSimpan<number>('huruf', 1);
  const [kenalan, , siapKenalan] = useSimpan<boolean>('kenalan', false);
  useEffect(() => {
    if (siapHuruf) skalaHuruf.atur(huruf);
  }, [huruf, siapHuruf]);
  useEffect(() => {
    // Web: Spasi menyalakan sakelar/radio/kotak centang seperti kontrol bawaan (Enter sudah ditangani react-native-web).
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const f = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if ((e.key === ' ' || e.key === 'Spacebar') && el && ['switch', 'radio', 'checkbox'].includes(el.getAttribute('role') ?? '')) {
        e.preventDefault();
        el.click();
      }
    };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, []);
  useEffect(() => {
    if (!siapKenalan || kenalan) return;
    const t = setTimeout(() => {
      if (lembar.ambil() === null) bukaLembar('kenalan');
    }, 900);
    return () => clearTimeout(t);
  }, [kenalan, siapKenalan]);
  return null;
}

/** Web: judul tab ikut berganti saat pindah halaman di dalam aplikasi (HTML statis sudah benar sejak awal). */
function JudulTab() {
  const path = usePathname();
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const judul = JUDUL[path] ?? JUDUL['/404'];
    if (document.title !== judul) document.title = judul;
  }, [path]);
  return null;
}

function Lapisan() {
  const nama = useLembar();
  return (
    <>
      <BannerPengingat />
      {nama === 'pengingat' && <LembarPengingat />}
      {nama === 'kenalan' && <LembarKenalan />}
    </>
  );
}

export default function RootLayout() {
  return (
    <View style={g.akar}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.kertas }, animation: 'slide_from_right' }} />
      <Pemuat />
      <JudulTab />
      <Lapisan />
    </View>
  );
}

const g = StyleSheet.create({ akar: { flex: 1, backgroundColor: W.kertas } });
