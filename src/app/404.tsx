import { meta } from '@/lib/meta';
import { TidakDitemukan } from '@/ui/TidakDitemukan';

export function generateMetadata() {
  return meta('/404', 'Halaman tidak ditemukan | Nurul Ufuk', 'Halaman yang kamu cari tidak ada di demo aplikasi Masjid Nurul Ufuk.', { noindex: true });
}

export default function HalamanTidakAda() {
  return <TidakDitemukan />;
}
