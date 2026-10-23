import { useSyncExternalStore } from 'react';

// Wadah kecil untuk keadaan tampilan lintas layar: skala huruf, lembar bawah yang terbuka, dan pratinjau pengingat.
function wadah<T>(awal: T) {
  let nilai = awal;
  const dengar = new Set<() => void>();
  return {
    ambil: () => nilai,
    atur: (v: T) => {
      nilai = v;
      dengar.forEach((f) => f());
    },
    langgan: (f: () => void) => {
      dengar.add(f);
      return () => dengar.delete(f);
    },
  };
}

export const SKALA_PILIHAN = [
  { id: 1, teks: 'Normal' },
  { id: 1.15, teks: 'Besar' },
  { id: 1.3, teks: 'Lebih besar' },
] as const;

export const skalaHuruf = wadah<number>(1);
export function useSkala() {
  return useSyncExternalStore(skalaHuruf.langgan, skalaHuruf.ambil, () => 1);
}

export type NamaLembar = 'pengingat' | 'kenalan' | null;
export const lembar = wadah<NamaLembar>(null);
export function useLembar() {
  return useSyncExternalStore(lembar.langgan, lembar.ambil, () => null);
}

/** Pratinjau bilah pengingat (tombol "Coba pengingat"). */
export const pratinjau = wadah<{ judul: string; isi: string } | null>(null);
export function usePratinjau() {
  return useSyncExternalStore(pratinjau.langgan, pratinjau.ambil, () => null);
}

// Pemicu terakhir yang membuka lembar, supaya fokus kembali ke sana saat lembar ditutup (web).
let pemicu: { focus?: () => void } | null = null;
export function bukaLembar(nama: Exclude<NamaLembar, null>) {
  if (typeof document !== 'undefined') pemicu = document.activeElement as unknown as { focus?: () => void };
  lembar.atur(nama);
}
export function tutupLembar() {
  lembar.atur(null);
  const p = pemicu;
  pemicu = null;
  if (p && typeof p.focus === 'function') setTimeout(() => p.focus?.(), 30);
}
