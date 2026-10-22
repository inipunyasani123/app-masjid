import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// Data demo hanya disimpan di perangkat (AsyncStorage; di web = localStorage). Tidak ada server.
const AWALAN = 'nurulufuk:';
const pendengar = new Map<string, Set<(v: unknown) => void>>();
const bawaanKunci = new Map<string, unknown>();

async function baca<T>(kunci: string, bawaan: T): Promise<T> {
  try {
    const s = await AsyncStorage.getItem(AWALAN + kunci);
    return s == null ? bawaan : (JSON.parse(s) as T);
  } catch {
    return bawaan;
  }
}

async function tulis<T>(kunci: string, nilai: T) {
  try {
    await AsyncStorage.setItem(AWALAN + kunci, JSON.stringify(nilai));
  } catch {
    // penyimpanan ditolak (mode privat): tetap jalan di memori
  }
  pendengar.get(kunci)?.forEach((f) => f(nilai));
}

/** State yang tersimpan di perangkat. `siap` = sudah dibaca dari penyimpanan (selalu false saat render statis). */
export function useSimpan<T>(kunci: string, bawaan: T): [T, (v: T | ((lama: T) => T)) => void, boolean] {
  const [nilai, setNilai] = useState<T>(bawaan);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    let hidup = true;
    baca(kunci, bawaan).then((v) => {
      if (hidup) {
        setNilai(v);
        setSiap(true);
      }
    });
    bawaanKunci.set(kunci, bawaan);
    const f = (v: unknown) => setNilai(v as T);
    if (!pendengar.has(kunci)) pendengar.set(kunci, new Set());
    pendengar.get(kunci)!.add(f);
    return () => {
      hidup = false;
      pendengar.get(kunci)?.delete(f);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci]);

  const set = useCallback(
    (v: T | ((lama: T) => T)) => {
      setNilai((lama) => {
        const baru = typeof v === 'function' ? (v as (l: T) => T)(lama) : v;
        tulis(kunci, baru);
        return baru;
      });
    },
    [kunci],
  );

  return [nilai, set, siap];
}

export async function hapusSemua() {
  try {
    const semua = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(semua.filter((k) => k.startsWith(AWALAN)));
  } catch {
    // abaikan
  }
  pendengar.forEach((set, k) => set.forEach((f) => f(bawaanKunci.get(k))));
}

export type Pendaftaran = { id: string; kegiatan: string; peran: string[]; nama: string; wa: string; catatan: string; waktu: number };
export type RiwayatInfak = { id: string; program: string; nominal: number; nama: string; waktu: number };
