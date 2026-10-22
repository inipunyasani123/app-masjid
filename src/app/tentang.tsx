import { useState } from 'react';
import type { Href } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { MASJID, SITUS } from '@/lib/data';
import { hijriah, teksHijriah } from '@/lib/hijriah';
import { meta } from '@/lib/meta';
import { LOKASI, METODE } from '@/lib/salat';
import { useHariIni } from '@/lib/sekarang';
import { hapusSemua, useSimpan } from '@/lib/simpan';
import { Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Pilihan, Tautan, Tombol } from '@/ui/Komponen';
import { Arab, Label, Redup, Teks } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/tentang',
    'Tentang Aplikasi & Metode Hitung | Nurul Ufuk',
    'Cara aplikasi Nurul Ufuk menghitung jadwal salat, kiblat, dan tanggal Hijriah; sumber foto; dan catatan bahwa masjid serta pengurusnya rekaan.',
  );
}

const FOTO = [
  { nama: 'Tempat wudu', judul: 'Ablution area Masjid Inabah Kamal Semporna', oleh: 'Taufik', lisensi: 'CC0' },
  { nama: 'Bedug', judul: 'Masjid Agung Karimun 13', oleh: 'Sandi rambe', lisensi: 'CC0' },
  { nama: 'Kurma', judul: 'Ripe and dry dates fruit bunches', oleh: 'Kerina yin', lisensi: 'CC0' },
  { nama: 'Anak kambing', judul: 'Goat pic', oleh: 'Divya Chinnasamy', lisensi: 'CC0' },
];

export default function Tentang() {
  const [koreksi, setKoreksi] = useSimpan<number>('koreksi', 0);
  const { hari } = useHariIni();
  const [direset, setDireset] = useState(false);

  return (
    <Layar kembali label="Tentang" judul="Tentang aplikasi">
      <Kartu nada="malam" style={{ gap: 6 }}>
        <Arab style={{ color: W.emas, fontSize: 22, lineHeight: 34 }}>{MASJID.arab}</Arab>
        <Text style={g.nama}>{MASJID.nama}</Text>
        <Text style={g.teksMalam}>
          “{MASJID.arti}”. Masjid, alamat, pengurus, kajian, dan angka kas di aplikasi ini rekaan untuk demo. Yang sungguhan: jadwal salat, arah kiblat, dan
          bayangan kiblat untuk {LOKASI.nama}.
        </Text>
      </Kartu>

      <Bagian judul="Koreksi tanggal Hijriah">
        <Kartu style={{ gap: 10 }}>
          <Redup>
            Kalender perkiraan bisa selisih sehari dengan penetapan resmi. Geser bila perlu; pengaturan tersimpan di perangkat ini.
          </Redup>
          <Pilihan<string>
            label="Koreksi hari Hijriah"
            nilai={String(koreksi)}
            onPilih={(v) => setKoreksi(Number(v))}
            pilihan={[
              { id: '-1', teks: '−1 hari' },
              { id: '0', teks: 'Tanpa' },
              { id: '1', teks: '+1 hari' },
            ]}
          />
          <Teks style={{ ...F.body(500) }}>Hari ini: {hari ? teksHijriah(hijriah(hari, koreksi)) : '…'}</Teks>
        </Kartu>
      </Bagian>

      <Bagian judul="Cara menghitung">
        <Kartu style={{ gap: 8 }}>
          <Label>Jadwal salat</Label>
          {METODE.rinci.map((r) => (
            <Teks key={r} style={{ fontSize: 14, lineHeight: 21 }}>
              • {r}
            </Teks>
          ))}
          <Redup>
            Titik hitung {LOKASI.label}. Hasilnya dicocokkan dengan jadwal Kemenag RI untuk Kabupaten Tulungagung sepanjang 2026: 97,8% waktu sama persis, sisanya
            selisih 1 menit. Pustaka: {METODE.pustaka}.
          </Redup>
          <Label style={{ marginTop: 6 }}>Kiblat & bayangan kiblat</Label>
          <Redup>Rumus segitiga bola untuk arah; posisi matahari (algoritme NOAA) untuk jam bayangan kiblat harian.</Redup>
          <Label style={{ marginTop: 6 }}>Tanggal Hijriah</Label>
          <Redup>Kalender Ummul Qura bawaan perangkat; bila tidak tersedia, kalender Hijriah tabular. Penetapan resmi tetap mengikuti sidang isbat.</Redup>
          <Label style={{ marginTop: 6 }}>Waktu</Label>
          <Redup>Semua jam memakai WIB (UTC+7), apa pun zona waktu perangkatmu.</Redup>
        </Kartu>
      </Bagian>

      <Bagian judul="Data di perangkat">
        <Kartu style={{ gap: 10 }}>
          <Redup>
            Pendaftaran relawan, riwayat infak simulasi, dan koreksi Hijriah hanya disimpan di perangkat ini. Tidak ada yang dikirim ke server.
          </Redup>
          <Tombol
            varian="garis"
            onPress={async () => {
              await hapusSemua();
              setDireset(true);
            }}
          >
            Hapus data demo di perangkat ini
          </Tombol>
          {direset && (
            <Text role="status" style={g.ok}>
              Data demo sudah dihapus.
            </Text>
          )}
        </Kartu>
      </Bagian>

      <Bagian judul="Foto & huruf">
        <Kartu style={{ gap: 8 }}>
          {FOTO.map((f) => (
            <Redup key={f.nama}>
              <Text style={{ ...F.body(600), color: W.tinta }}>{f.nama}</Text>: “{f.judul}” oleh {f.oleh}, Wikimedia Commons, {f.lisensi}.
            </Redup>
          ))}
          <Redup>Ilustrasi tokoh (tanpa wajah), busur ufuk, siluet masjid, dan ikon dibuat sendiri. Huruf El Messiri dan Readex Pro berlisensi SIL OFL.</Redup>
        </Kartu>
      </Bagian>

      <Bagian judul="Dibuat oleh PintuWeb">
        <Kartu nada="krem" style={{ gap: 10 }}>
          <Teks>
            Demo aplikasi mobile dari PintuWeb, Tulungagung. Dibangun dengan React Native dan Expo: satu kode untuk Android, iOS, dan web. Untuk masjidmu, data
            bisa disambungkan ke panel takmir dan QRIS resmi masjid.
          </Teks>
          <Tautan href={SITUS.kontak as Href} style={g.cta}>
            <Text style={g.ctaTeks}>Pesan aplikasi seperti ini</Text>
            <Ikon nama="kanan" ukuran={18} warna={W.krem} />
          </Tautan>
        </Kartu>
      </Bagian>
    </Layar>
  );
}

const g = StyleSheet.create({
  nama: { ...F.display(700), fontSize: 26, lineHeight: 32, color: W.krem },
  teksMalam: { ...F.body(400), fontSize: 14, lineHeight: 21, color: W.kremRedup },
  ok: { ...F.body(500), fontSize: 14, color: W.zaitun },
  cta: { minHeight: 50, borderRadius: 999, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: W.malam },
  ctaTeks: { ...F.body(600), fontSize: 15, color: W.krem },
});
