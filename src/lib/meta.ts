import type { Metadata } from 'expo-router/server';
import { SITUS } from './data';

/** Metadata per halaman: judul ≤ 60, deskripsi ≤ 155, kanonis absolut, kartu OG. */
export function meta(jalur: string, judul: string, deskripsi: string, opsi: { noindex?: boolean } = {}): Metadata {
  const url = `${SITUS.url}${jalur === '/' ? '/' : jalur}`;
  return {
    title: judul,
    description: deskripsi,
    applicationName: 'Nurul Ufuk',
    authors: { name: 'PintuWeb', url: 'https://www.pintuweb.id' },
    creator: 'PintuWeb',
    publisher: 'PintuWeb',
    robots: opsi.noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: opsi.noindex ? undefined : { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      siteName: 'Nurul Ufuk · Demo PintuWeb',
      url,
      title: judul,
      description: deskripsi,
      images: [{ url: `${SITUS.url}/og.jpg`, width: 1200, height: 630, alt: 'Aplikasi jemaah Masjid Nurul Ufuk di layar ponsel: busur ufuk dengan lima waktu salat' }],
    },
    twitter: { card: 'summary_large_image', title: judul, description: deskripsi, images: [`${SITUS.url}/og.jpg`] },
    formatDetection: { telephone: false },
  };
}

/** Potong teks di batas kata agar ≤ n karakter. */
export function potong(s: string, n: number) {
  if (s.length <= n) return s;
  const t = s.slice(0, n - 1);
  return t.slice(0, t.lastIndexOf(' ')).replace(/[,.;:·|–-]+$/, '').trimEnd() + '…';
}
