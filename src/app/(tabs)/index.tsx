import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MASJID, PENGUMUMAN, PROGRAM_INFAK } from '@/lib/data';
import { laporanKas, menungguRekapJumat, terkumpulRenovasi } from '@/lib/kas';
import { agendaMendatang, jumatMendatang, kajianMendatang } from '@/lib/kegiatan';
import { meta } from '@/lib/meta';
import { jumlahAktif, pemicuHari } from '@/lib/pengingat';
import { ARAH_KIBLAT, jadwalHari, NAMA_WAKTU, salatBerikutnya, URUTAN_SALAT } from '@/lib/salat';
import { useHariIni } from '@/lib/sekarang';
import { useSimpan } from '@/lib/simpan';
import { bukaLembar } from '@/lib/tampilan';
import { hariDalamPekan, jam, kunciTgl, relatifHari, rupiah, rupiahRingkas, samaTgl, selisihHari, tambahHari, tanggalPendek } from '@/lib/waktu';
import { FotoLengkung } from '@/ui/Foto';
import { Bintang8, Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Tautan } from '@/ui/Komponen';
import { Kompas } from '@/ui/Kompas';
import { Pahlawan } from '@/ui/Pahlawan';
import { TombolLonceng, usePengingat } from '@/ui/Pengingat';
import { Siluet } from '@/ui/Siluet';
import { Arab, Label, Redup, Teks, Text } from '@/ui/Teks';
import { F, W } from '@/ui/tema';
import { ORANG } from '@/lib/data';

const kapital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function generateMetadata() {
  return meta(
    '/',
    'Nurul Ufuk: Aplikasi Jemaah Masjid | Demo PintuWeb',
    'Demo aplikasi masjid: jadwal salat Tulungagung metode Kemenag, pengingat azan, kiblat, kajian, laporan kas, dan infak simulasi QRIS.',
  );
}

export default function Beranda() {
  const { now, hari } = useHariIni();
  const [koreksi] = useSimpan<number>('koreksi', 0);
  const [pengingat] = usePengingat();
  const k = hari ? kunciTgl(hari) : '';
  const menit = now ? Math.floor(now.getTime() / 60000) : 0;
  const jumatHariIni = hari ? hariDalamPekan(hari) === 5 : false;

  const hitung = useMemo(() => {
    if (!now || !hari) return null;
    const lap = laporanKas(now, 2);
    const bulanIni = lap[lap.length - 1];
    const wudu = PROGRAM_INFAK[0];
    const kajian = kajianMendatang(now, hari, 1, (x) => x.id !== 'tpq')[0];
    const semuaAgenda = agendaMendatang(hari, koreksi);
    return {
      jadwal: jadwalHari(hari),
      berikut: salatBerikutnya(now, hari),
      jumat: jumatMendatang(now, hari, 1)[0],
      kajian,
      agenda: semuaAgenda.find((a) => a.agenda.id === 'ramadan') ?? semuaAgenda[0],
      saldo: bulanIni.saldoAkhir,
      masukBulan: bulanIni.masuk,
      terkumpul: terkumpulRenovasi(now, wudu.dasar ?? 0),
      menungguJumat: menungguRekapJumat(now),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, menit, koreksi]);

  const pemicuBerikut = useMemo(() => {
    if (!now || !hari) return null;
    const semua = [...pemicuHari(pengingat, hari), ...pemicuHari(pengingat, tambahHari(hari, 1))];
    return semua.find((x) => x.waktu.getTime() > now.getTime()) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pengingat, k, menit]);

  const wudu = PROGRAM_INFAK[0];
  const persen = hitung ? Math.min(100, Math.round((hitung.terkumpul / (wudu.target ?? 1)) * 100)) : 0;
  const nAktif = jumlahAktif(pengingat);
  const kj = hitung?.kajian;
  const pengisi = kj ? ORANG[kj.kajian.pemateri] : null;

  return (
    <Layar>
      <View style={g.kepala}>
        <View style={{ flex: 1 }}>
          <Label>Assalamualaikum, jemaah</Label>
          <Text role="heading" aria-level={1} style={g.nama}>
            {MASJID.nama}
          </Text>
          <View style={g.lokasi}>
            <Arab style={{ fontSize: 15, lineHeight: 22 }}>{MASJID.arab}</Arab>
            <Redup>· {MASJID.kota}</Redup>
          </View>
        </View>
        <Tautan href="/tentang" label="Tentang aplikasi dan pengaturan" style={g.info}>
          <Ikon nama="info" ukuran={22} />
        </Tautan>
      </View>

      <Pahlawan koreksi={koreksi} />

      <View style={g.limaWaktu} role="list" aria-label="Jadwal salat hari ini">
        {URUTAN_SALAT.map((s) => {
          const aktif = hitung?.berikut.kunci === s && !hitung?.berikut.besok;
          const nama = s === 'zuhur' && jumatHariIni ? 'Jumat' : NAMA_WAKTU[s].label;
          return (
            <View key={s} role="listitem" style={[g.waktu, aktif && g.waktuAktif]}>
              <Text style={[g.waktuNama, aktif && { color: W.emas }]}>{nama}</Text>
              <Text style={[g.waktuJam, aktif && { color: W.krem }]}>{hitung ? jam(hitung.jadwal[s]) : '--.--'}</Text>
              <TombolLonceng kunci={s} label={nama} gelap={aktif} />
            </View>
          );
        })}
      </View>
      <View style={g.barisImsak}>
        <Redup style={g.angka}>
          Imsak {hitung ? jam(hitung.jadwal.imsak) : '--.--'} · Terbit {hitung ? jam(hitung.jadwal.terbit) : '--.--'} · Duha {hitung ? jam(hitung.jadwal.duha) : '--.--'}
        </Redup>
      </View>

      <View style={g.pengingat}>
        <View style={g.pengingatIkon}>
          <Ikon nama="lonceng" ukuran={20} warna={W.kuningan} isi={nAktif ? '#F2D9A2' : undefined} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={g.pengingatJudul}>{nAktif ? `${nAktif} pengingat aktif` : 'Belum ada pengingat'}</Text>
          <Redup style={{ fontSize: 13 }}>
            {pemicuBerikut ? `Berikutnya ${pemicuBerikut.judul.charAt(0).toLowerCase()}${pemicuBerikut.judul.slice(1)} · ${jam(pemicuBerikut.waktu)}` : 'Ketuk lonceng di atas atau atur azan, Jumat, dan kajian.'}
          </Redup>
        </View>
        <Pressable role="button" onPress={() => bukaLembar('pengingat')} style={g.atur}>
          <Text style={g.aturTeks}>Atur</Text>
        </Pressable>
      </View>

      {/* Bento */}
      <View style={g.bento}>
        <View style={g.baris}>
          <Tautan href="/kiblat" style={[g.sel, g.selKiblat]}>
            <Label>Arah kiblat</Label>
            <View style={g.kiblatIsi}>
              <Kompas kiblat={ARAH_KIBLAT} ukuran={64} mini />
              <View>
                <Text style={g.angkaBesar}>{ARAH_KIBLAT.toFixed(1).replace('.', ',')}°</Text>
                <Redup>dari utara</Redup>
              </View>
            </View>
          </Tautan>
          <Tautan href="/kas" style={[g.sel, g.selKas]}>
            <Label style={{ color: W.zaitun }}>Saldo kas</Label>
            <Text style={[g.angkaSedang, g.angka]} maksSkala={1}>
              {hitung ? rupiah(hitung.saldo) : 'Rp—'}
            </Text>
            <Redup>{hitung ? (hitung.menungguJumat ? 'Kotak Jumat direkap bakda Jumat' : `Bulan ini +${rupiahRingkas(hitung.masukBulan)}`) : 'Laporan terbuka'}</Redup>
          </Tautan>
        </View>

        <Tautan href="/kegiatan?tab=jumat" style={[g.sel, g.selJumat]}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            {hitung ? <Siluet orang={hitung.jumat.khatib} ukuran={52} /> : <View style={{ width: 52, height: 67 }} />}
            <View style={{ flex: 1, gap: 2 }}>
              <Label style={{ color: W.emas }}>
                {hitung ? `Jumat ${samaTgl(hitung.jumat.tgl, hari!) ? 'ini' : tanggalPendek(hitung.jumat.tgl)} · khatib` : 'Khatib Jumat'}
              </Label>
              <Text style={g.jumatNama}>{hitung ? hitung.jumat.khatib.nama : 'Memuat jadwal…'}</Text>
              <Text style={g.jumatTema}>
                {hitung ? `“${hitung.jumat.tema}”` : ' '}
              </Text>
            </View>
          </View>
          <View style={g.jumatBawah}>
            <Text style={g.jumatKecil}>{hitung ? `Imam ${hitung.jumat.imam.nama.replace('Ustaz ', '')}` : ' '}</Text>
            <Text style={[g.jumatKecil, g.angka]}>{hitung ? `Azan ${jam(hitung.jumat.azan)} WIB` : ' '}</Text>
          </View>
        </Tautan>

        <Tautan href="/infak/wudu" style={[g.sel, g.selInfak]}>
          <View style={{ width: 104 }}>
            <FotoLengkung nama="wudu" tegak latar={W.kartu} />
          </View>
          <View style={{ flex: 1, gap: 6, justifyContent: 'center' }}>
            <Label style={{ color: W.terakota }}>Program infak</Label>
            <Text style={g.selJudul}>{wudu.judul}</Text>
            <View style={g.progres} aria-hidden>
              <View style={[g.progresIsi, { width: `${persen}%` }]} />
            </View>
            <Redup style={g.angka}>{hitung ? `${rupiahRingkas(hitung.terkumpul)} dari ${rupiahRingkas(wudu.target ?? 0)} · ${persen}%` : 'Rp— dari Rp85,0 jt'}</Redup>
            <Text style={g.lihat}>Lihat kabar renovasi</Text>
          </View>
        </Tautan>

        <View style={g.baris}>
          <Tautan href={kj ? `/kajian/${kj.kajian.id}` : '/kegiatan'} style={[g.sel, g.selKajian]}>
            <Label>{kj?.berlangsung ? 'Berlangsung' : 'Kajian'}</Label>
            <Text style={g.kajianJam}>{kj ? jam(kj.mulai) : '--.--'}</Text>
            <Redup style={{ fontSize: 12, marginTop: -2 }}>{kj ? `${kapital(relatifHari(selisihHari(hari!, kj.tgl)))} · WIB` : ' '}</Redup>
            <Text style={g.selJudulKecil}>
              {kj ? kj.kajian.judul : 'Jadwal kajian pekan ini'}
            </Text>
            <View style={g.pengisi}>
              {pengisi ? <Siluet orang={pengisi} ukuran={22} /> : <View style={{ width: 22, height: 28 }} />}
              <Redup style={{ fontSize: 12, flex: 1 }}>
                {pengisi ? pengisi.nama : ' '}
              </Redup>
            </View>
            {kj?.kajian.materi && (
              <View style={{ gap: 3 }}>
                <View style={g.progresTipis} aria-hidden>
                  <View style={[g.progresTipisIsi, { width: `${Math.round((kj.kajian.materi.ke / kj.kajian.materi.dari) * 100)}%` }]} />
                </View>
                <Redup style={{ fontSize: 12 }}>
                  {kj.kajian.materi.ke}/{kj.kajian.materi.dari} {kj.kajian.materi.satuan.split(' ')[0]}
                </Redup>
              </View>
            )}
          </Tautan>
          <Tautan href={hitung?.agenda ? `/agenda/${hitung.agenda.agenda.id}` : '/kegiatan?tab=agenda'} style={[g.sel, g.selAgenda]}>
            <View style={{ marginHorizontal: -12, marginTop: -12, marginBottom: 8 }}>
              <FotoLengkung nama="kurma" latar={W.kartu2} hias={false} />
            </View>
            <Label style={{ color: W.terakota }}>{hitung?.agenda?.h ? `${hitung.agenda.h.y} H` : 'Agenda'}</Label>
            <Text style={g.selJudul}>{hitung?.agenda ? hitung.agenda.agenda.pendek : 'Ramadan'}</Text>
            <Redup>{hitung?.agenda ? `± ${hitung.agenda.sisa} hari lagi` : ' '}</Redup>
            <Redup style={{ fontSize: 12 }}>{hitung?.agenda?.agenda.id === 'ramadan' ? 'Imsakiyah & takjil' : ' '}</Redup>
          </Tautan>
        </View>
      </View>

      <Bagian judul="Pengumuman" kanan={<Bintang8 ukuran={18} />}>
        {PENGUMUMAN.map((p) => (
          <Kartu key={p.id} style={g.umum}>
            <View style={g.umumAtas}>
              <Bintang8 ukuran={12} warna={W.kuningan} isi />
              <Redup style={{ fontSize: 12 }}>{hari ? tanggalPendek(tambahHari(hari, -p.hariLalu)) : `${p.hariLalu} hari lalu`}</Redup>
              {p.hariLalu <= 2 && (
                <View style={g.baru}>
                  <Text style={g.baruTeks}>Baru</Text>
                </View>
              )}
            </View>
            <Teks style={g.umumJudul}>{p.judul}</Teks>
            <Redup>{p.isi}</Redup>
            {p.tautan && (
              <Tautan href={p.tautan as never} style={g.tautanKecil}>
                <Text style={g.tautanTeks}>{p.label}</Text>
                <Ikon nama="kanan" ukuran={16} warna={W.nila} />
              </Tautan>
            )}
          </Kartu>
        ))}
      </Bagian>

      <View style={g.kakiBaris}>
        <Tautan href="/jadwal" style={g.tautanKecil}>
          <Text style={g.tautanTeks}>Jadwal salat sebulan</Text>
          <Ikon nama="kanan" ukuran={16} warna={W.nila} />
        </Tautan>
      </View>
      <Redup style={g.kaki}>
        Aplikasi demo buatan PintuWeb. Nama masjid, pengurus, kajian, dan angka kas rekaan; jadwal salat dihitung sungguhan untuk Tulungagung.
      </Redup>
    </Layar>
  );
}

const g = StyleSheet.create({
  kepala: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  nama: { ...F.display(700), fontSize: 28, lineHeight: 34, color: W.tinta, marginTop: 4 },
  lokasi: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  info: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: W.kartu, borderWidth: 1, borderColor: W.garis },
  angka: { fontVariant: ['tabular-nums'] },
  limaWaktu: { flexDirection: 'row', gap: 6, marginTop: 14 },
  waktu: { flex: 1, backgroundColor: W.kartu, borderRadius: 16, paddingTop: 10, alignItems: 'center', borderWidth: 1, borderColor: W.garis },
  waktuAktif: { backgroundColor: W.malam, borderColor: W.malam },
  waktuNama: { ...F.body(500), fontSize: 12, color: W.tinta2 },
  waktuJam: { ...F.body(600), fontSize: 15, color: W.tinta, fontVariant: ['tabular-nums'], marginTop: 2 },
  barisImsak: { marginTop: 8 },
  pengingat: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, padding: 12, paddingLeft: 14, borderRadius: 20, backgroundColor: '#FBF3DF', borderWidth: 1, borderColor: '#EAD9AF' },
  pengingatIkon: { width: 40, height: 40, borderRadius: 20, backgroundColor: W.kartu, alignItems: 'center', justifyContent: 'center' },
  pengingatJudul: { ...F.body(600), fontSize: 15, lineHeight: 20, color: W.tinta },
  atur: { minHeight: 44, minWidth: 64, paddingHorizontal: 16, borderRadius: 999, backgroundColor: W.malam, alignItems: 'center', justifyContent: 'center' },
  aturTeks: { ...F.body(600), fontSize: 14, color: W.krem },
  tautanKecil: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'flex-start' },
  tautanTeks: { ...F.body(600), fontSize: 14, color: W.nila },
  bento: { marginTop: 14, gap: 10 },
  baris: { flexDirection: 'row', gap: 10 },
  sel: { borderRadius: 22, padding: 14, borderWidth: 1, borderColor: W.garis, backgroundColor: W.kartu, overflow: 'hidden' },
  selKiblat: { flex: 1, gap: 8 },
  kiblatIsi: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selKas: { flex: 1, gap: 6, backgroundColor: '#E6EBDD', borderColor: '#D3DCC6' },
  angkaBesar: { ...F.display(700), fontSize: 26, lineHeight: 30, color: W.tinta },
  angkaSedang: { ...F.display(700), fontSize: 19, lineHeight: 26, color: W.tinta },
  selJumat: { backgroundColor: W.malam, borderColor: W.malam, gap: 12 },
  jumatNama: { ...F.display(600), fontSize: 19, lineHeight: 24, color: W.krem },
  jumatTema: { ...F.body(400), fontSize: 13, lineHeight: 19, color: W.kremRedup },
  jumatBawah: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2D3756', paddingTop: 10 },
  jumatKecil: { ...F.body(500), fontSize: 13, color: W.krem },
  selInfak: { flexDirection: 'row', gap: 14 },
  selJudul: { ...F.display(600), fontSize: 18, lineHeight: 23, color: W.tinta },
  selJudulKecil: { ...F.display(600), fontSize: 16, lineHeight: 21, color: W.tinta },
  lihat: { ...F.body(600), fontSize: 13, color: W.nila },
  progres: { height: 8, borderRadius: 4, backgroundColor: W.kartu2, overflow: 'hidden' },
  progresIsi: { height: 8, borderRadius: 4, backgroundColor: W.terakota },
  progresTipis: { height: 5, borderRadius: 3, backgroundColor: W.kartu2, overflow: 'hidden' },
  progresTipisIsi: { height: 5, borderRadius: 3, backgroundColor: W.nila },
  selKajian: { flex: 1, gap: 4 },
  kajianJam: { ...F.display(700), fontSize: 30, lineHeight: 34, color: W.tinta, fontVariant: ['tabular-nums'] },
  pengisi: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selAgenda: { flex: 1, gap: 2, padding: 12, backgroundColor: W.kartu2, borderColor: W.kartu2 },
  umum: { gap: 4 },
  umumAtas: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  baru: { backgroundColor: W.terakota, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  baruTeks: { ...F.body(600), fontSize: 12, color: '#FFFFFF' },
  umumJudul: { ...F.body(600), fontSize: 16, lineHeight: 22 },
  kakiBaris: { marginTop: 18, alignItems: 'center' },
  kaki: { marginTop: 6, textAlign: 'center', fontSize: 12, lineHeight: 18 },
});
