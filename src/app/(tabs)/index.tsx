import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MASJID, PENGUMUMAN, PROGRAM_INFAK } from '@/lib/data';
import { terkumpulRenovasi, laporanKas } from '@/lib/kas';
import { agendaMendatang, jumatMendatang, kajianMendatang } from '@/lib/kegiatan';
import { meta } from '@/lib/meta';
import { ARAH_KIBLAT, jadwalHari, NAMA_WAKTU, salatBerikutnya, URUTAN_SALAT } from '@/lib/salat';
import { useHariIni } from '@/lib/sekarang';
import { useSimpan } from '@/lib/simpan';
import { jam, kunciTgl, relatifHari, rupiah, rupiahRingkas, samaTgl, selisihHari, tanggalPendek, tambahHari } from '@/lib/waktu';

const kapital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
import { FotoLengkung } from '@/ui/Foto';
import { Bintang8, Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Tautan } from '@/ui/Komponen';
import { Kompas } from '@/ui/Kompas';
import { Pahlawan } from '@/ui/Pahlawan';
import { Siluet } from '@/ui/Siluet';
import { Arab, Label, Redup, Teks } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/',
    'Nurul Ufuk: Aplikasi Jemaah Masjid | Demo PintuWeb',
    'Demo aplikasi masjid: jadwal salat Tulungagung metode Kemenag, hitung mundur, kiblat, kajian, laporan kas, dan infak simulasi QRIS.',
  );
}

export default function Beranda() {
  const { now, hari } = useHariIni();
  const [koreksi] = useSimpan<number>('koreksi', 0);
  const k = hari ? kunciTgl(hari) : '';
  const menit = now ? Math.floor(now.getTime() / 60000) : 0;

  const hitung = useMemo(() => {
    if (!now || !hari) return null;
    const lap = laporanKas(hari, 2);
    const bulanIni = lap[lap.length - 1];
    const wudu = PROGRAM_INFAK[0];
    return {
      jadwal: jadwalHari(hari),
      berikut: salatBerikutnya(now, hari),
      jumat: jumatMendatang(now, hari, 1)[0],
      kajian: kajianMendatang(now, hari, 1, (x) => x.id !== 'tpq')[0],
      agenda: agendaMendatang(hari, koreksi).find((a) => a.agenda.id === 'ramadan') ?? agendaMendatang(hari, koreksi)[0],
      saldo: bulanIni.saldoAkhir,
      masukBulan: bulanIni.masuk,
      terkumpul: terkumpulRenovasi(hari, wudu.dasar ?? 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, menit, koreksi]);

  const wudu = PROGRAM_INFAK[0];
  const persen = hitung ? Math.min(100, Math.round((hitung.terkumpul / (wudu.target ?? 1)) * 100)) : 0;

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
        <Tautan href="/tentang" label="Tentang aplikasi dan metode hitung" style={g.info}>
          <Ikon nama="info" ukuran={22} />
        </Tautan>
      </View>

      <Pahlawan koreksi={koreksi} />

      <View style={g.limaWaktu} role="list" aria-label="Jadwal salat hari ini">
        {URUTAN_SALAT.map((s) => {
          const aktif = hitung?.berikut.kunci === s && !hitung?.berikut.besok;
          return (
            <View key={s} role="listitem" style={[g.waktu, aktif && g.waktuAktif]}>
              <Text style={[g.waktuNama, aktif && { color: W.emas }]}>{NAMA_WAKTU[s].label}</Text>
              <Text style={[g.waktuJam, aktif && { color: W.krem }]}>{hitung ? jam(hitung.jadwal[s]) : '--.--'}</Text>
            </View>
          );
        })}
      </View>
      <View style={g.barisImsak}>
        <Redup>
          Imsak {hitung ? jam(hitung.jadwal.imsak) : '--.--'} · Terbit {hitung ? jam(hitung.jadwal.terbit) : '--.--'}
        </Redup>
        <Tautan href="/jadwal" style={g.tautanKecil}>
          <Text style={g.tautanTeks}>Jadwal sebulan</Text>
          <Ikon nama="kanan" ukuran={16} warna={W.nila} />
        </Tautan>
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
            <Text style={g.angkaSedang} numberOfLines={1} adjustsFontSizeToFit>
              {hitung ? rupiah(hitung.saldo) : 'Rp…'}
            </Text>
            <Redup>{hitung ? `Bulan ini +${rupiahRingkas(hitung.masukBulan)}` : 'Laporan terbuka'}</Redup>
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
              <Text style={g.jumatTema} numberOfLines={2}>
                {hitung ? `“${hitung.jumat.tema}”` : ''}
              </Text>
            </View>
          </View>
          {hitung && (
            <View style={g.jumatBawah}>
              <Text style={g.jumatKecil}>Imam {hitung.jumat.imam.nama.replace('Ustaz ', '')}</Text>
              <Text style={g.jumatKecil}>Azan {jam(hitung.jumat.azan)} WIB</Text>
            </View>
          )}
        </Tautan>

        <Tautan href="/infak" style={[g.sel, g.selInfak]}>
          <View style={{ width: 112 }}>
            <FotoLengkung nama="wudu" tegak latar={W.kartu} />
          </View>
          <View style={{ flex: 1, gap: 6, justifyContent: 'center' }}>
            <Label style={{ color: W.terakota }}>Program infak</Label>
            <Text style={g.selJudul}>{wudu.judul}</Text>
            <View style={g.progres} aria-hidden>
              <View style={[g.progresIsi, { width: `${persen}%` }]} />
            </View>
            <Redup>{hitung ? `${rupiahRingkas(hitung.terkumpul)} dari ${rupiahRingkas(wudu.target ?? 0)} · ${persen}%` : 'Memuat…'}</Redup>
          </View>
        </Tautan>

        <View style={g.baris}>
          <Tautan href={hitung?.kajian ? `/kajian/${hitung.kajian.kajian.id}` : '/kegiatan'} style={[g.sel, g.selKajian]}>
            <Label>Kajian terdekat</Label>
            <Text style={g.selJudul} numberOfLines={3}>
              {hitung?.kajian ? hitung.kajian.kajian.judul : 'Jadwal kajian pekan ini'}
            </Text>
            <Redup>
              {hitung?.kajian
                ? `${hitung.kajian.berlangsung ? 'Sedang berlangsung' : kapital(relatifHari(selisihHari(hari!, hitung.kajian.tgl)))}, ${jam(hitung.kajian.mulai)}`
                : ' '}
            </Redup>
          </Tautan>
          <Tautan href={hitung?.agenda ? `/agenda/${hitung.agenda.agenda.id}` : '/kegiatan?tab=agenda'} style={[g.sel, g.selAgenda]}>
            <View style={{ marginHorizontal: -12, marginTop: -12, marginBottom: 8 }}>
              <FotoLengkung nama="kurma" latar={W.kartu2} hias={false} />
            </View>
            <Label style={{ color: W.terakota }}>{hitung?.agenda?.h ? `${hitung.agenda.h.y} H` : 'Agenda'}</Label>
            <Text style={g.selJudul}>{hitung?.agenda ? hitung.agenda.agenda.pendek : 'Ramadan'}</Text>
            <Redup>{hitung?.agenda ? `± ${hitung.agenda.sisa} hari lagi` : ' '}</Redup>
          </Tautan>
        </View>
      </View>

      <Bagian judul="Pengumuman" kanan={<Bintang8 ukuran={18} />}>
        {PENGUMUMAN.map((p) => (
          <Kartu key={p.id} style={g.umum}>
            <Redup style={{ fontSize: 12 }}>{hari ? tanggalPendek(tambahHari(hari, -p.hariLalu)) : `${p.hariLalu} hari lalu`}</Redup>
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
  limaWaktu: { flexDirection: 'row', gap: 6, marginTop: 14 },
  waktu: { flex: 1, backgroundColor: W.kartu, borderRadius: 16, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: W.garis },
  waktuAktif: { backgroundColor: W.malam, borderColor: W.malam },
  waktuNama: { ...F.body(500), fontSize: 12, color: W.tinta2 },
  waktuJam: { ...F.body(600), fontSize: 15, color: W.tinta, fontVariant: ['tabular-nums'], marginTop: 2 },
  barisImsak: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  tautanKecil: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'flex-start' },
  tautanTeks: { ...F.body(600), fontSize: 14, color: W.nila },
  bento: { marginTop: 14, gap: 10 },
  baris: { flexDirection: 'row', gap: 10 },
  sel: { borderRadius: 22, padding: 14, borderWidth: 1, borderColor: W.garis, backgroundColor: W.kartu, overflow: 'hidden' },
  selKiblat: { flex: 1, gap: 8 },
  kiblatIsi: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selKas: { flex: 1, gap: 6, backgroundColor: '#E6EBDD', borderColor: '#D3DCC6' },
  angkaBesar: { ...F.display(700), fontSize: 26, lineHeight: 30, color: W.tinta },
  angkaSedang: { ...F.display(700), fontSize: 21, lineHeight: 28, color: W.tinta },
  selJumat: { backgroundColor: W.malam, borderColor: W.malam, gap: 12 },
  jumatNama: { ...F.display(600), fontSize: 19, lineHeight: 24, color: W.krem },
  jumatTema: { ...F.body(400), fontSize: 13, lineHeight: 19, color: W.kremRedup },
  jumatBawah: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2D3756', paddingTop: 10 },
  jumatKecil: { ...F.body(500), fontSize: 13, color: W.krem },
  selInfak: { flexDirection: 'row', gap: 14 },
  selJudul: { ...F.display(600), fontSize: 18, lineHeight: 23, color: W.tinta },
  progres: { height: 8, borderRadius: 4, backgroundColor: W.kartu2, overflow: 'hidden' },
  progresIsi: { height: 8, borderRadius: 4, backgroundColor: W.terakota },
  selKajian: { flex: 1, gap: 6 },
  selAgenda: { flex: 1, gap: 2, padding: 12, backgroundColor: W.kartu2, borderColor: W.kartu2 },
  umum: { gap: 4 },
  umumJudul: { ...F.body(600), fontSize: 16, lineHeight: 22 },
  kaki: { marginTop: 24, textAlign: 'center', fontSize: 12, lineHeight: 18 },
});
