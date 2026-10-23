import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { bagikanTeks, bingkaiLengkung, bisaSimpanGambar, simpanGambar, tautanWa } from '@/lib/bagikan';
import { BULAN_HIJRIAH, BULAN_HIJRIAH_PENDEK, hijriah, teksHijriah } from '@/lib/hijriah';
import { meta } from '@/lib/meta';
import { type Jadwal as JadwalHari, jadwalHari, LOKASI, METODE, NAMA_WAKTU, salatBerikutnya, URUTAN_SALAT, URUTAN_WAKTU } from '@/lib/salat';
import { useHariIni } from '@/lib/sekarang';
import { useSimpan } from '@/lib/simpan';
import { bukaLembar } from '@/lib/tampilan';
import { BULAN, durasiKata, HARI, HARI_PENDEK, hariDalamPekan, jam, jumlahHari, samaTgl, tanggalPendek, type Tgl } from '@/lib/waktu';
import { Bintang8, Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Tautan, Tombol } from '@/ui/Komponen';
import { TombolLonceng } from '@/ui/Pengingat';
import { Label, Redup, Teks, Text } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/jadwal',
    'Jadwal Salat Tulungagung Sebulan | Nurul Ufuk',
    'Jadwal salat Tulungagung sebulan, dihitung di perangkat dengan kriteria Kemenag RI (Subuh −20°, Isya −18°). Ada pengingat, Imsak, Duha, dan Hijriah.',
  );
}

// Pita warna per waktu salat (token palet Ufuk): fajar → kertas → kuningan → terakota → malam.
const PITA: Record<string, string> = { subuh: W.fajar, zuhur: '#E9D9B8', asar: W.kuningan, magrib: W.terakota, isya: W.malam };
const lengket = (Platform.OS === 'web' ? { position: 'sticky', top: 0, zIndex: 3 } : {}) as unknown as ViewStyle;

type BarisBulan = { t: Tgl; j: JadwalHari; h: { y: number; m: number; d: number } };

function namaWaktu(k: (typeof URUTAN_WAKTU)[number], t: Tgl) {
  return k === 'zuhur' && hariDalamPekan(t) === 5 ? 'Jumat' : NAMA_WAKTU[k].label;
}

function teksBulan(y: number, m: number, baris: BarisBulan[]) {
  const isi = baris.map(({ t, j }) => `${HARI_PENDEK[hariDalamPekan(t)]} ${t.d} · ${URUTAN_SALAT.map((k) => `${namaWaktu(k, t)} ${jam(j[k])}`).join(' · ')}`);
  return [
    `Jadwal Salat Tulungagung · ${BULAN[m - 1]} ${y}`,
    'Masjid Nurul Ufuk (demo aplikasi PintuWeb)',
    '',
    ...isi,
    '',
    `Metode Kemenag RI (Subuh −20°, Isya −18°, ihtiyath 2 menit), dihitung untuk Tulungagung ${LOKASI.label}.`,
    'https://app-masjid.pintuweb.id/jadwal',
  ].join('\n');
}

function gambarBulan(y: number, m: number, baris: BarisBulan[]) {
  const tinggi = 360 + baris.length * 34 + 150;
  simpanGambar(`jadwal-salat-tulungagung-${y}-${String(m).padStart(2, '0')}.png`, 1080, tinggi, (c, w, h) => {
    bingkaiLengkung(c, w, h);
    c.textAlign = 'center';
    c.fillStyle = '#85560F';
    c.font = '600 24px Readex, sans-serif';
    c.fillText('JADWAL SALAT · TULUNGAGUNG · WIB', w / 2, 210);
    c.fillStyle = '#17203A';
    c.font = '700 60px Messiri, Georgia, serif';
    c.fillText(`${BULAN[m - 1]} ${y}`, w / 2, 278);
    c.font = '400 24px Readex, sans-serif';
    c.fillStyle = '#4E5368';
    c.fillText('Masjid Nurul Ufuk (rekaan) · demo aplikasi PintuWeb', w / 2, 318);
    const kol = [150, 330, 470, 610, 750, 890];
    c.font = '600 22px Readex, sans-serif';
    c.fillStyle = '#4E5368';
    ['Tgl', 'Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya'].forEach((t, i) => c.fillText(t, kol[i], 362));
    baris.forEach(({ t, j }, r) => {
      const yy = 396 + r * 34;
      if (r % 2 === 0) {
        c.fillStyle = '#F6EFE2';
        c.fillRect(70, yy - 24, w - 140, 34);
      }
      const jumat = hariDalamPekan(t) === 5;
      c.fillStyle = jumat ? '#9E3F18' : '#17203A';
      c.font = '600 22px Readex, sans-serif';
      c.fillText(`${HARI_PENDEK[hariDalamPekan(t)]} ${t.d}`, kol[0], yy);
      c.font = '400 22px Readex, sans-serif';
      c.fillStyle = '#17203A';
      URUTAN_SALAT.forEach((k, i) => c.fillText(jam(j[k]), kol[i + 1], yy));
    });
    c.fillStyle = '#4E5368';
    c.font = '400 20px Readex, sans-serif';
    c.fillText('Metode Kemenag RI: Subuh −20°, Isya −18°, ihtiyath 2 menit · dihitung untuk Tulungagung', w / 2, h - 92);
  });
}

export default function Jadwal() {
  const { now, hari } = useHariIni();
  const [koreksi] = useSimpan<number>('koreksi', 0);
  const [geser, setGeser] = useState(0);
  const [lengkap, setLengkap] = useState(false);
  const [kabar, setKabar] = useState('');
  useEffect(() => setGeser(0), [hari?.m]);

  const bulan = useMemo(() => {
    if (!hari) return null;
    const idx = hari.y * 12 + hari.m - 1 + geser;
    const y = Math.floor(idx / 12), m = (idx % 12) + 1;
    const baris: BarisBulan[] = Array.from({ length: jumlahHari(y, m) }, (_, i) => {
      const t: Tgl = { y, m, d: i + 1 };
      return { t, j: jadwalHari(t), h: hijriah(t, koreksi) };
    });
    const hAwal = baris[0].h, hAkhir = baris[baris.length - 1].h;
    const rentangH = hAwal.m === hAkhir.m ? `${BULAN_HIJRIAH[hAwal.m - 1]} ${hAwal.y} H` : `${BULAN_HIJRIAH[hAwal.m - 1]}–${BULAN_HIJRIAH[hAkhir.m - 1]} ${hAkhir.y} H`;
    return { y, m, baris, rentangH };
  }, [hari?.y, hari?.m, hari?.d, geser, koreksi]);

  const kolom = lengkap ? URUTAN_WAKTU : URUTAN_SALAT;
  const ji = hari ? jadwalHari(hari) : null;
  const berikut = now && hari ? salatBerikutnya(now, hari) : null;

  return (
    <Layar label={`${LOKASI.nama} · WIB`} judul="Jadwal salat" sub={`Dihitung langsung di perangkat untuk ${LOKASI.nama} (${LOKASI.label}), tanpa internet.`}>
      <Kartu style={g.hariIni}>
        <View style={g.hariIniKepala}>
          <View style={{ flex: 1 }}>
            <Label>Hari ini</Label>
            <Text style={g.hariIniTgl}>{hari ? `${HARI[hariDalamPekan(hari)]}, ${tanggalPendek(hari)}` : 'Hari ini'}</Text>
            <Text style={g.hariIniH}>{hari ? teksHijriah(hijriah(hari, koreksi)) : ' '}</Text>
          </View>
          <Pressable role="button" onPress={() => bukaLembar('pengingat')} style={g.atur}>
            <Ikon nama="lonceng" ukuran={16} warna={W.krem} />
            <Text style={g.aturTeks}>Pengingat</Text>
          </Pressable>
        </View>
        <View role="list" aria-label="Lima waktu salat hari ini" style={{ gap: 6 }}>
          {URUTAN_SALAT.map((k) => {
            const aktif = !!berikut && berikut.kunci === k && !berikut.besok;
            const nama = hari ? namaWaktu(k, hari) : NAMA_WAKTU[k].label;
            return (
              <View key={k} role="listitem" style={[g.waktu, aktif && g.waktuAktif]}>
                <View style={[g.pita, { backgroundColor: PITA[k] }, aktif && { backgroundColor: W.emas }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[g.waktuNama, aktif && { color: W.krem }]}>{nama}</Text>
                  {aktif && now && berikut && <Text style={g.waktuSisa}>± {durasiKata(berikut.waktu.getTime() - now.getTime())} lagi</Text>}
                </View>
                <Text style={[g.waktuJam, aktif && { color: W.krem }]}>{ji ? jam(ji[k]) : '--.--'}</Text>
                <TombolLonceng kunci={k} label={nama} gelap={aktif} />
              </View>
            );
          })}
        </View>
        <Redup style={g.angka}>
          Imsak {ji ? jam(ji.imsak) : '--.--'} · Terbit {ji ? jam(ji.terbit) : '--.--'} · Duha {ji ? jam(ji.duha) : '--.--'}
        </Redup>
      </Kartu>

      <View style={g.bulanBar}>
        <Pressable role="button" aria-label="Bulan sebelumnya" onPress={() => setGeser((x) => Math.max(-12, x - 1))} style={g.panah} disabled={!bulan}>
          <Ikon nama="kembali" ukuran={20} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={g.bulanJudul} aria-live="polite">
            {bulan ? `${BULAN[bulan.m - 1]} ${bulan.y}` : 'Bulan ini'}
          </Text>
          <Redup style={{ fontSize: 12 }}>{bulan ? bulan.rentangH : ' '}</Redup>
        </View>
        <Pressable role="button" aria-label="Bulan berikutnya" onPress={() => setGeser((x) => Math.min(12, x + 1))} style={g.panah} disabled={!bulan}>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <Ikon nama="kembali" ukuran={20} />
          </View>
        </Pressable>
      </View>

      <View style={g.pilihKolom}>
        <Pressable role="switch" aria-checked={lengkap} onPress={() => setLengkap((x) => !x)} style={g.saklar}>
          <View style={[g.saklarJalur, lengkap && { backgroundColor: W.malam }]}>
            <View style={[g.saklarBulat, lengkap && { transform: [{ translateX: 16 }] }]} />
          </View>
          <Text style={g.saklarTeks}>Tampilkan Imsak & Terbit</Text>
        </Pressable>
      </View>

      <View role="table" aria-label="Jadwal salat sebulan" style={g.tabel}>
        <View role="row" style={[g.baris, g.kepala, lengket]}>
          <Text role="columnheader" style={[g.sel, g.selTgl, g.kepalaTeks]} maksSkala={1.1}>
            Tgl
          </Text>
          {kolom.map((k) => (
            <Text key={k} role="columnheader" style={[g.sel, g.kepalaTeks, lengkap && { fontSize: 12 }]} maksSkala={1.1}>
              {NAMA_WAKTU[k].label}
            </Text>
          ))}
        </View>
        {bulan
          ? bulan.baris.map(({ t, j, h }, i) => {
              const ini = hari ? samaTgl(t, hari) : false;
              const jumat = hariDalamPekan(t) === 5;
              const akhir = i === bulan.baris.length - 1;
              return (
                <View key={t.d} role="row" style={[g.baris, ini && g.barisIni, t.d % 2 === 0 && !ini && g.barisGenap, akhir && g.barisAkhir]} aria-current={ini ? 'date' : undefined}>
                  <View role="rowheader" style={[g.sel, g.selTgl]}>
                    <Text style={[g.tgl, ini && { color: W.krem }]} maksSkala={1.15}>
                      {t.d} <Text style={[g.hari, jumat && !ini && { color: W.terakota }, ini && { color: W.emas }]}>{HARI_PENDEK[hariDalamPekan(t)]}</Text>
                    </Text>
                    <Text style={[g.hTgl, ini && { color: W.kremRedup }]} aria-label={`${h.d} ${BULAN_HIJRIAH[h.m - 1]}`} maksSkala={1.1}>
                      {ini ? `${h.d} ${BULAN_HIJRIAH[h.m - 1]}` : `${h.d} ${BULAN_HIJRIAH_PENDEK[h.m - 1]}`}
                    </Text>
                  </View>
                  {kolom.map((k) => (
                    <Text key={k} role="cell" style={[g.sel, g.jam, lengkap && { fontSize: 12.5 }, ini && { color: W.krem }]} maksSkala={1.15}>
                      {jam(j[k])}
                    </Text>
                  ))}
                </View>
              );
            })
          : Array.from({ length: 31 }, (_, i) => (
              <View key={i} role="row" style={[g.baris, g.barisKosong, i % 2 === 1 && g.barisGenap]}>
                <Text role="cell" style={[g.sel, g.selTgl, g.jam]}>
                  {i + 1}
                </Text>
              </View>
            ))}
      </View>

      <Bagian judul="Bagikan jadwal bulan ini">
        <Kartu style={{ gap: 10 }}>
          <Redup>Kirim ke grup WhatsApp jemaah atau simpan sebagai gambar untuk papan pengumuman. Sumber metode ikut tertulis.</Redup>
          {bulan && (
            <Link href={tautanWa(teksBulan(bulan.y, bulan.m, bulan.baris)) as never} target="_blank" rel="noopener" asChild>
              <Pressable style={g.wa}>
                <Ikon nama="bagikan" ukuran={18} warna={W.krem} />
                <Text style={g.waTeks}>Kirim ke WhatsApp</Text>
              </Pressable>
            </Link>
          )}
          <View style={{ gap: 8 }}>
            <Tombol
              varian="garis"
              ikon="salin"
              nonaktif={!bulan}
              onPress={async () => {
                if (!bulan) return;
                const h = await bagikanTeks(`Jadwal salat ${BULAN[bulan.m - 1]} ${bulan.y}`, teksBulan(bulan.y, bulan.m, bulan.baris));
                setKabar(h === 'disalin' ? 'Teks jadwal disalin ke papan klip.' : h === 'dibagikan' ? 'Jadwal dibagikan.' : h === 'batal' ? '' : 'Gagal membagikan di perangkat ini.');
              }}
            >
              Bagikan teks
            </Tombol>
            {bisaSimpanGambar && (
              <Tombol varian="garis" ikon="unduh" nonaktif={!bulan} onPress={() => bulan && gambarBulan(bulan.y, bulan.m, bulan.baris)}>
                Simpan gambar
              </Tombol>
            )}
          </View>
          {!!kabar && (
            <Text role="status" style={g.kabar}>
              {kabar}
            </Text>
          )}
        </Kartu>
      </Bagian>

      <Bagian judul="Metode hitung" kanan={<Bintang8 ukuran={18} />}>
        <Kartu style={{ gap: 10 }}>
          <Label>{METODE.ringkas}</Label>
          {METODE.rinci.map((r) => (
            <View key={r} style={g.poin}>
              <Bintang8 ukuran={10} warna={W.emas} isi />
              <Teks style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>{r}</Teks>
            </View>
          ))}
          <Redup>
            Diuji terhadap jadwal resmi Kemenag RI untuk Kabupaten Tulungagung sepanjang 2026: 97,8% dari 2.555 waktu salat, imsak, dan terbit sama persis (sisanya
            selisih 1 menit); Duha cocok 360 dari 365 hari. Pustaka: {METODE.pustaka}.
          </Redup>
        </Kartu>
        <Kartu nada="krem" style={{ gap: 6 }}>
          <Teks style={{ ...F.body(600) }}>Tentang tanggal Hijriah</Teks>
          <Redup>
            Tanggal Hijriah adalah perkiraan kalender Ummul Qura. Awal Ramadan, Syawal, dan Zulhijah resmi mengikuti sidang isbat Kementerian Agama, jadi bisa
            bergeser satu hari. Koreksi ±1 hari bisa diatur di halaman Tentang.
          </Redup>
          <Tautan href="/tentang" style={g.tautan}>
            <Text style={g.tautanTeks}>Atur koreksi Hijriah</Text>
            <Ikon nama="kanan" ukuran={16} warna={W.nila} />
          </Tautan>
        </Kartu>
      </Bagian>
    </Layar>
  );
}

const g = StyleSheet.create({
  angka: { fontVariant: ['tabular-nums'] },
  hariIni: { gap: 12, marginBottom: 16 },
  hariIniKepala: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  hariIniTgl: { ...F.display(700), fontSize: 20, lineHeight: 26, color: W.tinta },
  hariIniH: { ...F.body(400), fontSize: 13, color: W.kuningan },
  atur: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: 999, backgroundColor: W.malam },
  aturTeks: { ...F.body(600), fontSize: 13, color: W.krem },
  waktu: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingLeft: 0, paddingRight: 2, borderRadius: 14, backgroundColor: '#FAF5EA', overflow: 'hidden' },
  waktuAktif: { backgroundColor: W.malam, shadowColor: '#141C33', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  pita: { width: 6, alignSelf: 'stretch' },
  waktuNama: { ...F.display(600), fontSize: 17, lineHeight: 22, color: W.tinta },
  waktuSisa: { ...F.body(500), fontSize: 12, lineHeight: 16, color: W.emas },
  waktuJam: { ...F.body(600), fontSize: 17, color: W.tinta, fontVariant: ['tabular-nums'] },
  bulanBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: W.kartu, borderRadius: 999, borderWidth: 1, borderColor: W.garis, padding: 4 },
  panah: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bulanJudul: { ...F.display(600), fontSize: 19, lineHeight: 24, color: W.tinta },
  pilihKolom: { marginTop: 10, marginBottom: 8 },
  saklar: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, alignSelf: 'flex-start' },
  saklarJalur: { width: 40, height: 24, borderRadius: 12, backgroundColor: W.garisTua, padding: 3 },
  saklarBulat: { width: 18, height: 18, borderRadius: 9, backgroundColor: W.kartu },
  saklarTeks: { ...F.body(500), fontSize: 14, color: W.tinta },
  tabel: { backgroundColor: W.kartu, borderRadius: 20, borderWidth: 1, borderColor: W.garis },
  baris: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 8 },
  barisGenap: { backgroundColor: '#F8F3E9' },
  barisKosong: { height: 48 },
  barisIni: { backgroundColor: W.malam },
  barisAkhir: { borderBottomLeftRadius: 19, borderBottomRightRadius: 19 },
  kepala: { backgroundColor: W.kartu2, minHeight: 40, borderTopLeftRadius: 19, borderTopRightRadius: 19 },
  kepalaTeks: { ...F.body(600), fontSize: 12, color: W.tinta2 },
  sel: { flex: 1, textAlign: 'center' },
  selTgl: { flex: 1.35, textAlign: 'left', alignItems: 'flex-start' },
  tgl: { ...F.body(600), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
  hari: { ...F.body(400), fontSize: 12, color: W.tinta2 },
  hTgl: { ...F.body(400), fontSize: 12, color: W.kuningan, fontVariant: ['tabular-nums'] },
  jam: { ...F.body(500), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
  wa: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 999, backgroundColor: W.malam },
  waTeks: { ...F.body(600), fontSize: 15, color: W.krem },
  kabar: { ...F.body(500), fontSize: 14, color: W.zaitun },
  poin: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingTop: 2 },
  tautan: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'flex-start' },
  tautanTeks: { ...F.body(600), fontSize: 14, color: W.nila },
});
