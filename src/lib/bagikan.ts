import { Platform, Share } from 'react-native';

export type HasilBagikan = 'dibagikan' | 'disalin' | 'batal' | 'gagal';

/** Bagikan teks: Share (native) / Web Share API, cadangannya salin ke papan klip. */
export async function bagikanTeks(judul: string, teks: string): Promise<HasilBagikan> {
  try {
    if (Platform.OS !== 'web') {
      await Share.share({ title: judul, message: teks });
      return 'dibagikan';
    }
    const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string }) => Promise<void> };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: judul, text: teks });
        return 'dibagikan';
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return 'batal';
      }
    }
    await navigator.clipboard.writeText(teks);
    return 'disalin';
  } catch {
    return 'gagal';
  }
}

export function tautanWa(teks: string) {
  return `https://wa.me/?text=${encodeURIComponent(teks)}`;
}

export const bisaSimpanGambar = Platform.OS === 'web';

type Gambar = (c: CanvasRenderingContext2D, w: number, h: number) => void;

/** Web: gambar kartu di kanvas lalu unduh sebagai PNG. */
export async function simpanGambar(namaBerkas: string, w: number, h: number, gambar: Gambar) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return false;
  try {
    await Promise.all([document.fonts.load('700 40px Messiri'), document.fonts.load('400 20px Readex'), document.fonts.load('600 20px Readex')]);
  } catch {
    // huruf cadangan tetap jalan
  }
  const kanvas = document.createElement('canvas');
  kanvas.width = w;
  kanvas.height = h;
  const c = kanvas.getContext('2d');
  if (!c) return false;
  gambar(c, w, h);
  const url = kanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = namaBerkas;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}

/** Bingkai lengkung mihrab + bintang delapan di sudut, gaya Nurul Ufuk. */
export function bingkaiLengkung(c: CanvasRenderingContext2D, w: number, h: number) {
  c.fillStyle = '#F4EEE2';
  c.fillRect(0, 0, w, h);
  const m = 40, puncak = 150;
  c.beginPath();
  c.moveTo(m, h - m);
  c.lineTo(m, m + puncak);
  c.bezierCurveTo(m, m + puncak * 0.4, w * 0.32, m + 20, w / 2, m);
  c.bezierCurveTo(w * 0.68, m + 20, w - m, m + puncak * 0.4, w - m, m + puncak);
  c.lineTo(w - m, h - m);
  c.closePath();
  c.fillStyle = '#FFFCF5';
  c.fill();
  c.lineWidth = 3;
  c.strokeStyle = '#E2B657';
  c.stroke();
}
