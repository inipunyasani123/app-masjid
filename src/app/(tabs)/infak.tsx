import { useLocalSearchParams } from 'expo-router';
import { type ComponentRef, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { bagikanTeks, bingkaiLengkung, bisaSimpanGambar, simpanGambar } from '@/lib/bagikan';
import { NOMINAL, PROGRAM_INFAK, type ProgramInfak } from '@/lib/data';
import { doaUntuk, terkumpulProgram } from '@/lib/infak';
import { meta } from '@/lib/meta';
import { kini, useHariIni } from '@/lib/sekarang';
import { type RiwayatInfak, useSimpan } from '@/lib/simpan';
import { jam, kunciTgl, rupiah, rupiahRingkas, tanggalPanjang, tanggalPendek, tglWib } from '@/lib/waktu';
import { Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Tautan, Tombol } from '@/ui/Komponen';
import { QrSimulasi } from '@/ui/QrSimulasi';
import { Label, Redup, Teks, Text } from '@/ui/Teks';
import { F, W } from '@/ui/tema';
import { VisualProgram } from '@/ui/VisualProgram';

export function generateMetadata() {
  return meta(
    '/infak',
    'Infak & Sedekah lewat QRIS (Simulasi) | Nurul Ufuk',
    'Coba alur infak masjid di aplikasi: pilih program, nominal, lalu QRIS simulasi dan bukti. Tidak ada uang yang berpindah; contoh untuk masjid sungguhan.',
  );
}

type Tahap = 'isi' | 'qr' | 'selesai';

export default function Infak() {
  const params = useLocalSearchParams<{ program?: string }>();
  const { now, hari } = useHariIni();
  const gulir = useRef<ComponentRef<typeof ScrollView>>(null);
  const [riwayat, setRiwayat] = useSimpan<RiwayatInfak[]>('infak', []);
  const [program, setProgram] = useState<string>('wudu');
  useEffect(() => {
    if (params.program && PROGRAM_INFAK.some((p) => p.id === params.program)) setProgram(params.program);
  }, [params.program]);
  const [nominal, setNominal] = useState<number>(50_000);
  const [lain, setLain] = useState('');
  const [nama, setNama] = useState('');
  const [tahap, setTahap] = useState<Tahap>('isi');
  const [galat, setGalat] = useState('');
  const [bukti, setBukti] = useState<RiwayatInfak | null>(null);
  const [kabar, setKabar] = useState('');

  const jumlah = lain ? Number(lain.replace(/\D/g, '')) : nominal;
  const prog = PROGRAM_INFAK.find((p) => p.id === program)!;
  const dasar = useMemo(() => {
    const m: Record<string, number | null> = {};
    for (const p of PROGRAM_INFAK) m[p.id] = terkumpulProgram(p, now);
    return m;
  }, [hari ? kunciTgl(hari) : '']); // eslint-disable-line react-hooks/exhaustive-deps
  const milikku = (id: string) => riwayat.filter((r) => r.program === id).reduce((a, r) => a + r.nominal, 0);

  const lanjut = () => {
    if (!jumlah || jumlah < 1000) return setGalat('Nominal paling sedikit Rp1.000.');
    if (jumlah > 50_000_000) return setGalat('Untuk simulasi, nominal paling banyak Rp50.000.000.');
    setGalat('');
    setTahap('qr');
    gulir.current?.scrollTo({ y: 0, animated: false });
  };
  const konfirmasi = () => {
    const r: RiwayatInfak = { id: `NU-${Date.now().toString(36).toUpperCase().slice(-6)}`, program, nominal: jumlah, nama: nama.trim() || 'Hamba Allah', waktu: kini().getTime() };
    setRiwayat((l) => [r, ...l].slice(0, 30));
    setBukti(r);
    setKabar('');
    setTahap('selesai');
    gulir.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <Layar
      gulirRef={gulir}
      label="Simulasi QRIS"
      judul="Infak & sedekah"
      sub="Alur ini hanya simulasi: QR tidak bisa dipindai dan tidak ada uang yang berpindah."
      bawah={
        tahap === 'isi' ? (
          <Tombol onPress={lanjut} ikon="kanan">
            {`Buat QR simulasi · ${jumlah ? rupiah(jumlah) : 'Rp0'}`}
          </Tombol>
        ) : undefined
      }
    >
      {tahap === 'isi' && (
        <>
          <View role="radiogroup" aria-label="Pilih program infak" style={{ gap: 10 }}>
            {PROGRAM_INFAK.map((p) => (
              <KartuProgram key={p.id} p={p} aktif={program === p.id} onPilih={() => setProgram(p.id)} terkumpul={dasar[p.id] != null ? (dasar[p.id] as number) + milikku(p.id) : null} />
            ))}
          </View>

          <Bagian judul="Nominal">
            <View role="radiogroup" aria-label="Pilih nominal" style={g.chips}>
              {NOMINAL.map((n) => {
                const on = !lain && nominal === n;
                return (
                  <Pressable
                    key={n}
                    role="radio"
                    aria-checked={on}
                    aria-label={rupiah(n)}
                    onPress={() => {
                      setNominal(n);
                      setLain('');
                    }}
                    style={[g.chip, on && g.chipAktif]}
                  >
                    <Text style={[g.chipTeks, on && { color: W.krem }]}>{rupiahRingkas(n).replace(' rb', 'rb')}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={g.isian}>
              <Text style={g.isianLabel} nativeID="label-lain">
                Nominal lain (Rp)
              </Text>
              <TextInput
                aria-labelledby="label-lain"
                aria-label="Nominal lain dalam rupiah"
                value={lain}
                onChangeText={(t) => setLain(t.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                inputMode="numeric"
                placeholder="misalnya 75.000"
                placeholderTextColor="#6B6F80"
                style={g.input}
              />
            </View>
            <View style={g.isian}>
              <Text style={g.isianLabel} nativeID="label-nama">
                Nama di bukti (boleh dikosongkan)
              </Text>
              <TextInput aria-labelledby="label-nama" aria-label="Nama di bukti" value={nama} onChangeText={setNama} placeholder="Hamba Allah" placeholderTextColor="#6B6F80" style={g.input} maxLength={40} autoComplete="name" />
            </View>
            {!!galat && (
              <Text role="alert" style={g.galat}>
                {galat}
              </Text>
            )}
            <Redup style={{ fontSize: 13 }}>Infak transfer dan QRIS direkap bendahara tiap tanggal 15 dan 28, lalu masuk laporan kas.</Redup>
          </Bagian>
        </>
      )}

      {tahap === 'qr' && (
        <Kartu style={g.qrKartu}>
          <Label style={{ color: W.terakota, textAlign: 'center' }}>Simulasi — jangan dibayar</Label>
          <Text style={g.qrJudul}>{prog.judul}</Text>
          <Text style={g.qrNominal}>{rupiah(jumlah)}</Text>
          <View style={g.qrBingkai}>
            <QrSimulasi benih={jumlah * 31 + program.length * 7 + (hari?.d ?? 1)} ukuran={220} />
          </View>
          <Redup style={{ textAlign: 'center' }}>
            Pada aplikasi sungguhan, di sini tampil QRIS resmi milik masjid. Di demo ini polanya sengaja dibuat tidak bisa dipindai.
          </Redup>
          <Tombol onPress={konfirmasi} varian="emas" ikon="centang">
            Tandai sudah dibayar (simulasi)
          </Tombol>
          <Tombol onPress={() => setTahap('isi')} varian="garis">
            Ubah pilihan
          </Tombol>
        </Kartu>
      )}

      {tahap === 'selesai' && bukti && (
        <View style={{ gap: 14 }}>
          <View style={g.stempel} aria-hidden>
            <Svg width={84} height={96} viewBox="0 0 84 96">
              <Path d="M4 96 V40 C4 20 20 8 42 2 C64 8 80 20 80 40 V96 Z" fill={W.malam} />
              <Path d="M26 56 L38 68 L60 44" stroke={W.emas} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
          <Text role="status" style={g.selesaiJudul}>
            Infak simulasi tercatat
          </Text>
          <Text style={g.doa}>{doaUntuk(bukti.program)}</Text>

          <View style={g.kuitansi}>
            <Label style={{ textAlign: 'center' }}>Bukti infak · simulasi</Label>
            <Text style={g.kuitansiNominal}>{rupiah(bukti.nominal)}</Text>
            <Baris label="Program" isi={PROGRAM_INFAK.find((p) => p.id === bukti.program)?.judul ?? ''} />
            <Baris label="Atas nama" isi={bukti.nama} />
            <Baris label="Waktu" isi={`${tanggalPanjang(tglWib(new Date(bukti.waktu)))}, ${jam(new Date(bukti.waktu))} WIB`} />
            <Baris label="Kode" isi={bukti.id} />
            <Redup style={{ fontSize: 12, textAlign: 'center', marginTop: 6 }}>Bukan bukti pembayaran sungguhan · Masjid Nurul Ufuk (rekaan)</Redup>
          </View>

          <View style={g.aksi}>
            <Tombol
              varian="garis"
              ikon="bagikan"
              onPress={async () => {
                const h = await bagikanTeks('Bukti infak simulasi', teksBukti(bukti));
                setKabar(h === 'disalin' ? 'Teks bukti disalin ke papan klip.' : h === 'dibagikan' ? 'Bukti dibagikan.' : h === 'batal' ? '' : 'Gagal membagikan di perangkat ini.');
              }}
            >
              Bagikan bukti
            </Tombol>
            {bisaSimpanGambar && (
              <Tombol varian="garis" ikon="unduh" onPress={() => simpanKuitansi(bukti)}>
                Simpan gambar
              </Tombol>
            )}
          </View>
          {!!kabar && (
            <Text role="status" style={g.kabar}>
              {kabar}
            </Text>
          )}
          <Tautan href="/kas" style={g.tautan}>
            <Text style={g.tautanTeks}>Lihat laporan kas masjid</Text>
            <Ikon nama="kanan" ukuran={16} warna={W.nila} />
          </Tautan>
          <Redup style={{ fontSize: 13 }}>Infak transfer dan QRIS direkap bendahara tiap tanggal 15 dan 28. Infak simulasi ini hanya tersimpan di perangkatmu.</Redup>
          <Tombol onPress={() => setTahap('isi')}>Kembali ke program infak</Tombol>
        </View>
      )}

      <Bagian judul="Riwayat infakmu">
        {riwayat.length === 0 ? (
          <View style={g.kosong}>
            <Svg width={56} height={70} viewBox="0 0 48 60" aria-hidden>
              <Path d="M4 58 V26 C4 14 12 6 24 2 C36 6 44 14 44 26 V58 Z" fill="#F3E3C4" stroke={W.emas} strokeWidth={1.4} />
              <Path d="M16 40 h16 M16 46 h10" stroke={W.kuningan} strokeWidth={1.8} strokeLinecap="round" />
              <Path d="M24 16 26.2 19.1 30 19.8 29.3 23.6 32.4 25.8 29.3 28 30 31.8 26.2 32.5 24 35.6 21.8 32.5 18 31.8 18.7 28 15.6 25.8 18.7 23.6 18 19.8 21.8 19.1Z" fill={W.emas} opacity={0.7} />
            </Svg>
            <View style={{ flex: 1, gap: 6 }}>
              <Teks style={{ ...F.body(600) }}>Infak pertamamu akan tercatat di sini</Teks>
              <Redup>Riwayat hanya tersimpan di perangkat ini.</Redup>
              <Pressable
                role="button"
                onPress={() => {
                  setTahap('isi');
                  gulir.current?.scrollTo({ y: 0, animated: true });
                }}
                style={g.pilihProgram}
              >
                <Text style={g.tautanTeks}>Pilih program</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View role="list" style={g.riwayat}>
            {riwayat.map((r) => (
              <View key={r.id} role="listitem" style={g.riwayatBaris}>
                <View style={{ flex: 1 }}>
                  <Teks style={{ fontSize: 14 }}>{PROGRAM_INFAK.find((p) => p.id === r.program)?.judul}</Teks>
                  <Redup style={{ fontSize: 12 }}>
                    {r.id} · {tanggalPendek(tglWib(new Date(r.waktu)))} · {r.nama}
                  </Redup>
                </View>
                <Text style={g.riwayatAngka}>{rupiah(r.nominal)}</Text>
              </View>
            ))}
          </View>
        )}
      </Bagian>
    </Layar>
  );
}

function teksBukti(b: RiwayatInfak) {
  const p = PROGRAM_INFAK.find((x) => x.id === b.program)?.judul ?? b.program;
  return [
    'Bukti infak (SIMULASI) · Masjid Nurul Ufuk',
    `${p}: ${rupiah(b.nominal)}`,
    `Atas nama ${b.nama} · ${tanggalPendek(tglWib(new Date(b.waktu)))} ${jam(new Date(b.waktu))} WIB · ${b.id}`,
    doaUntuk(b.program),
    'Demo aplikasi buatan PintuWeb, bukan pembayaran sungguhan: https://app-masjid.pintuweb.id/infak',
  ].join('\n');
}

function simpanKuitansi(b: RiwayatInfak) {
  const p = PROGRAM_INFAK.find((x) => x.id === b.program)?.judul ?? b.program;
  simpanGambar(`bukti-infak-${b.id}.png`, 900, 1200, (c, w, h) => {
    bingkaiLengkung(c, w, h);
    c.textAlign = 'center';
    c.fillStyle = '#85560F';
    c.font = '600 26px Readex, sans-serif';
    c.fillText('BUKTI INFAK · SIMULASI', w / 2, 300);
    c.fillStyle = '#17203A';
    c.font = '700 84px Messiri, Georgia, serif';
    c.fillText(rupiah(b.nominal), w / 2, 410);
    c.font = '600 40px Messiri, Georgia, serif';
    c.fillText(p, w / 2, 490);
    c.font = '400 30px Readex, sans-serif';
    c.fillStyle = '#4E5368';
    c.fillText(`Atas nama ${b.nama}`, w / 2, 570);
    c.fillText(`${tanggalPanjang(tglWib(new Date(b.waktu)))} · ${jam(new Date(b.waktu))} WIB`, w / 2, 620);
    c.fillText(`Kode ${b.id}`, w / 2, 670);
    c.fillStyle = '#17203A';
    c.font = '500 28px Readex, sans-serif';
    const doa = doaUntuk(b.program).split('. ');
    c.fillText(doa[0] + '.', w / 2, 780);
    c.fillText(doa[1] ?? '', w / 2, 822);
    c.fillStyle = '#9E3F18';
    c.font = '600 24px Readex, sans-serif';
    c.fillText('Bukan bukti pembayaran sungguhan', w / 2, h - 150);
    c.fillStyle = '#4E5368';
    c.font = '400 22px Readex, sans-serif';
    c.fillText('Masjid Nurul Ufuk (rekaan) · demo aplikasi PintuWeb', w / 2, h - 110);
  });
}

function Baris({ label, isi }: { label: string; isi: string }) {
  return (
    <View style={g.baris}>
      <Text style={g.barisLabel}>{label}</Text>
      <Text style={g.barisIsi}>{isi}</Text>
    </View>
  );
}

function KartuProgram({ p, aktif, onPilih, terkumpul }: { p: ProgramInfak; aktif: boolean; onPilih: () => void; terkumpul: number | null }) {
  const persen = terkumpul != null && p.target ? Math.min(100, Math.round((terkumpul / p.target) * 100)) : 0;
  return (
    <View style={[g.program, aktif && g.programAktif]}>
      <Pressable role="radio" aria-checked={aktif} onPress={onPilih} style={g.programPilih}>
        <View style={{ width: 80 }}>
          <VisualProgram p={p} latar={aktif ? '#FBF3DF' : W.kartu} hias={aktif} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[g.radio, aktif && g.radioAktif]}>{aktif && <View style={g.radioIsi} />}</View>
            <Text style={g.programJudul}>{p.judul}</Text>
          </View>
          <Redup>{p.ringkas}</Redup>
          {terkumpul != null && p.target ? (
            <View style={{ gap: 4, marginTop: 2 }}>
              <View style={g.progres}>
                <View style={[g.progresIsi, { width: `${persen}%` }]} />
              </View>
              <Text style={g.progresTeks}>
                {rupiahRingkas(terkumpul)} dari {rupiahRingkas(p.target)} · {persen}%
              </Text>
            </View>
          ) : (
            <Text style={g.progresTeks}>Kebutuhan rutin, tanpa target</Text>
          )}
        </View>
      </Pressable>
      <Tautan href={`/infak/${p.id}`} style={g.rincian}>
        <Text style={g.tautanTeks}>Rincian program</Text>
        <Ikon nama="kanan" ukuran={16} warna={W.nila} />
      </Tautan>
    </View>
  );
}

const g = StyleSheet.create({
  program: { borderRadius: 20, backgroundColor: W.kartu, borderWidth: 1.5, borderColor: W.garis, overflow: 'hidden' },
  programAktif: { borderColor: W.kuningan, backgroundColor: '#FBF3DF' },
  programPilih: { flexDirection: 'row', gap: 12, padding: 12, paddingBottom: 4 },
  programJudul: { ...F.display(600), fontSize: 17, lineHeight: 22, color: W.tinta, flexShrink: 1 },
  rincian: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'flex-end', paddingHorizontal: 14 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: W.tinta2, alignItems: 'center', justifyContent: 'center' },
  radioAktif: { borderColor: W.kuningan },
  radioIsi: { width: 10, height: 10, borderRadius: 5, backgroundColor: W.kuningan },
  progres: { height: 6, borderRadius: 3, backgroundColor: W.kartu2, overflow: 'hidden' },
  progresIsi: { height: 6, borderRadius: 3, backgroundColor: W.terakota },
  progresTeks: { ...F.body(500), fontSize: 12, color: W.tinta2, fontVariant: ['tabular-nums'] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: W.garisTua, alignItems: 'center', justifyContent: 'center', backgroundColor: W.kartu },
  chipAktif: { backgroundColor: W.malam, borderColor: W.malam },
  chipTeks: { ...F.body(600), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
  isian: { gap: 6 },
  isianLabel: { ...F.body(500), fontSize: 13, color: W.tinta },
  input: { ...F.body(400), minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: W.garisTua, backgroundColor: W.kartu, paddingHorizontal: 14, fontSize: 16, color: W.tinta },
  galat: { ...F.body(500), fontSize: 14, color: W.terakota },
  qrKartu: { alignItems: 'stretch', gap: 12, padding: 18 },
  qrJudul: { ...F.display(600), fontSize: 20, lineHeight: 26, color: W.tinta, textAlign: 'center' },
  qrNominal: { ...F.display(700), fontSize: 32, lineHeight: 38, color: W.tinta, textAlign: 'center', fontVariant: ['tabular-nums'] },
  qrBingkai: { alignSelf: 'center', padding: 10, borderRadius: 20, borderWidth: 2, borderColor: W.malam, borderStyle: 'dashed' },
  stempel: { alignSelf: 'center', marginTop: 4 },
  selesaiJudul: { ...F.display(700), fontSize: 24, lineHeight: 30, color: W.tinta, textAlign: 'center' },
  doa: { ...F.display(600), fontSize: 17, lineHeight: 25, color: W.kuningan, textAlign: 'center', paddingHorizontal: 8 },
  kuitansi: { backgroundColor: W.kartu, borderWidth: 1.5, borderColor: W.emas, borderTopLeftRadius: 120, borderTopRightRadius: 120, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, paddingTop: 34, paddingBottom: 16, paddingHorizontal: 18, gap: 8 },
  kuitansiNominal: { ...F.display(700), fontSize: 34, lineHeight: 40, color: W.tinta, textAlign: 'center', fontVariant: ['tabular-nums'] },
  baris: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: '#EFE7D8', paddingTop: 8 },
  barisLabel: { ...F.body(400), fontSize: 13, color: W.tinta2 },
  barisIsi: { ...F.body(600), fontSize: 13, color: W.tinta, flexShrink: 1, textAlign: 'right' },
  aksi: { gap: 8 },
  kabar: { ...F.body(500), fontSize: 14, color: W.zaitun, textAlign: 'center' },
  tautan: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'center' },
  tautanTeks: { ...F.body(600), fontSize: 14, color: W.nila },
  kosong: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: W.kartu, borderRadius: 20, borderWidth: 1, borderColor: W.garis, padding: 14 },
  pilihProgram: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  riwayat: { backgroundColor: W.kartu, borderRadius: 20, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' },
  riwayatBaris: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EFE7D8' },
  riwayatAngka: { ...F.body(600), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
});
