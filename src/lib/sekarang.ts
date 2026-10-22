import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { tglWib, type Tgl } from './waktu';

// Untuk uji tampilan: ?waktu=2026-10-22T18:30 (dibaca sebagai WIB) menggeser jam aplikasi.
let geser: number | null = null;
function selisih() {
  if (geser !== null) return geser;
  geser = 0;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const w = new URLSearchParams(window.location.search).get('waktu');
      if (w && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(w)) {
        const t = Date.parse(`${w}:00+07:00`);
        if (!Number.isNaN(t)) geser = t - Date.now();
      }
    } catch {
      geser = 0;
    }
  }
  return geser;
}

export function kini() {
  return new Date(Date.now() + selisih());
}

/**
 * Waktu sekarang, diperbarui tiap `tiap` ms. Bernilai null saat render statis dan render pertama,
 * supaya HTML statis tidak bentrok dengan jam di perangkat (hidrasi tetap cocok).
 */
export function useSekarang(tiap = 30000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(kini());
    const id = setInterval(() => setNow(kini()), tiap);
    return () => clearInterval(id);
  }, [tiap]);
  return now;
}

export function useHariIni(): { now: Date | null; hari: Tgl | null } {
  const now = useSekarang(30000);
  return { now, hari: now ? tglWib(now) : null };
}
