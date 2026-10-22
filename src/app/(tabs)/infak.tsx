import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NOMINAL, PROGRAM_INFAK, type ProgramInfak } from '@/lib/data';
import { terkumpulRenovasi } from '@/lib/kas';
import { meta } from '@/lib/meta';
import { kini, useHariIni } from '@/lib/sekarang';
import { type RiwayatInfak, useSimpan } from '@/lib/simpan';
import { jam, kunciTgl, rupiah, rupiahRingkas, tanggalPendek, tglWib } from '@/lib/waktu';
import { FotoLengkung } from '@/ui/Foto';
import { Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Tombol } from '@/ui/Komponen';
import { QrSimulasi } from '@/ui/QrSimulasi';
import { Label, Redup, Teks } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/infak',
    'Infak & Sedekah lewat QRIS (Simulasi) | Nurul Ufuk',
    'Coba alur infak masjid di aplikasi: pilih program, nominal, lalu QRIS simulasi. Tidak ada uang yang berpindah; contoh untuk aplikasi masjid sungguhan.',
  );
}

type Tahap = 'isi' | 'qr' | 'selesai';

export default function Infak() {
  const { hari } = useHariIni();
  const [riwayat, setRiwayat] = useSimpan<RiwayatInfak[]>('infak', []);
  const [program, setProgram] = useState<string>('wudu');
  const [nominal, setNominal] = useState<number>(50_000);
  const [lain, setLain] = useState('');
  const [nama, setNama] = useState('');
  const [tahap, setTahap] = useState<Tahap>('isi');
  const [galat, setGalat] = useState('');
  const [bukti, setBukti] = useState<RiwayatInfak | null>(null);

  const jumlah = lain ? Number(lain.replace(/\D/g, '')) : nominal;
  const prog = PROGRAM_INFAK.find((p) => p.id === program)!;
  const dasar = useMemo(() => {
    const m: Record<string, number> = {};
    if (!hari) return m;
    for (const p of PROGRAM_INFAK) if (p.target) m[p.id] = p.id === 'wudu' ? terkumpulRenovasi(hari, p.dasar ?? 0) : (p.dasar ?? 0);
    return m;
  }, [hari ? kunciTgl(hari) : '']); // eslint-disable-line react-hooks/exhaustive-deps
  const milikku = (id: string) => riwayat.filter((r) => r.program === id).reduce((a, r) => a + r.nominal, 0);

  const lanjut = () => {
    if (!jumlah || jumlah < 1000) return setGalat('Nominal paling sedikit Rp1.000.');
    if (jumlah > 50_000_000) return setGalat('Untuk simulasi, nominal paling banyak Rp50.000.000.');
    setGalat('');
    setTahap('qr');
  };
  const konfirmasi = () => {
    const r: RiwayatInfak = { id: `NU-${Date.now().toString(36).toUpperCase().slice(-6)}`, program, nominal: jumlah, nama: nama.trim() || 'Hamba Allah', waktu: kini().getTime() };
    setRiwayat((l) => [r, ...l].slice(0, 30));
    setBukti(r);
    setTahap('selesai');
  };

  return (
    <Layar label="Simulasi QRIS" judul="Infak & sedekah" sub="Alur ini hanya simulasi: QR tidak bisa dipindai dan tidak ada uang yang berpindah.">
      {tahap === 'isi' && (
        <>
          <View role="radiogroup" aria-label="Pilih program infak" style={{ gap: 10 }}>
            {PROGRAM_INFAK.map((p) => (
              <KartuProgram key={p.id} p={p} aktif={program === p.id} onPilih={() => setProgram(p.id)} terkumpul={p.target ? (dasar[p.id] ?? 0) + milikku(p.id) : null} />
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
            <Tombol onPress={lanjut} ikon="kanan">
              {`Buat QR simulasi · ${jumlah ? rupiah(jumlah) : 'Rp0'}`}
            </Tombol>
          </Bagian>
        </>
      )}

      {tahap === 'qr' && (
        <Kartu style={g.qrKartu}>
          <Label style={{ color: W.terakota }}>Simulasi — jangan dibayar</Label>
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
        <Kartu nada="malam" style={g.selesai}>
          <View style={g.centang}>
            <Ikon nama="centang" ukuran={28} warna={W.malam} tebal={2.4} />
          </View>
          <Text style={g.selesaiJudul}>Terima kasih, {bukti.nama}</Text>
          <Text style={g.selesaiTeks}>
            Infak simulasi {rupiah(bukti.nominal)} untuk {PROGRAM_INFAK.find((p) => p.id === bukti.program)?.judul.toLowerCase()} tercatat di perangkat ini.
          </Text>
          <Text style={g.selesaiKecil}>
            Bukti simulasi {bukti.id} · {tanggalPendek(tglWib(new Date(bukti.waktu)))} {jam(new Date(bukti.waktu))} WIB
          </Text>
          <Tombol varian="emas" onPress={() => setTahap('isi')}>
            Kembali ke program infak
          </Tombol>
        </Kartu>
      )}

      <Bagian judul="Riwayat infakmu">
        {riwayat.length === 0 ? (
          <Redup>Belum ada infak simulasi di perangkat ini.</Redup>
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

function KartuProgram({ p, aktif, onPilih, terkumpul }: { p: ProgramInfak; aktif: boolean; onPilih: () => void; terkumpul: number | null }) {
  const persen = terkumpul != null && p.target ? Math.min(100, Math.round((terkumpul / p.target) * 100)) : 0;
  return (
    <Pressable role="radio" aria-checked={aktif} onPress={onPilih} style={[g.program, aktif && g.programAktif]}>
      {p.foto && (
        <View style={{ width: 84 }}>
          <FotoLengkung nama={p.foto} tegak latar={aktif ? '#FBF3DF' : W.kartu} hias={aktif} />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[g.radio, aktif && g.radioAktif]}>{aktif && <View style={g.radioIsi} />}</View>
          <Text style={g.programJudul}>{p.judul}</Text>
        </View>
        <Redup>{p.ringkas}</Redup>
        {terkumpul != null && p.target && (
          <View style={{ gap: 4, marginTop: 2 }}>
            <View style={g.progres}>
              <View style={[g.progresIsi, { width: `${persen}%` }]} />
            </View>
            <Text style={g.progresTeks}>
              {rupiahRingkas(terkumpul)} dari {rupiahRingkas(p.target)} · {persen}%
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const g = StyleSheet.create({
  program: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 20, backgroundColor: W.kartu, borderWidth: 1.5, borderColor: W.garis },
  programAktif: { borderColor: W.kuningan, backgroundColor: '#FBF3DF' },
  programJudul: { ...F.display(600), fontSize: 17, lineHeight: 22, color: W.tinta, flexShrink: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: W.tinta2, alignItems: 'center', justifyContent: 'center' },
  radioAktif: { borderColor: W.kuningan },
  radioIsi: { width: 10, height: 10, borderRadius: 5, backgroundColor: W.kuningan },
  progres: { height: 6, borderRadius: 3, backgroundColor: W.kartu2, overflow: 'hidden' },
  progresIsi: { height: 6, borderRadius: 3, backgroundColor: W.terakota },
  progresTeks: { ...F.body(500), fontSize: 12, color: W.tinta2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: W.garisTua, alignItems: 'center', justifyContent: 'center', backgroundColor: W.kartu },
  chipAktif: { backgroundColor: W.malam, borderColor: W.malam },
  chipTeks: { ...F.body(600), fontSize: 14, color: W.tinta },
  isian: { gap: 6 },
  isianLabel: { ...F.body(500), fontSize: 13, color: W.tinta },
  input: { ...F.body(400), minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: W.garisTua, backgroundColor: W.kartu, paddingHorizontal: 14, fontSize: 16, color: W.tinta },
  galat: { ...F.body(500), fontSize: 14, color: W.terakota },
  qrKartu: { alignItems: 'stretch', gap: 12, padding: 18 },
  qrJudul: { ...F.display(600), fontSize: 20, lineHeight: 26, color: W.tinta, textAlign: 'center' },
  qrNominal: { ...F.display(700), fontSize: 32, lineHeight: 38, color: W.tinta, textAlign: 'center' },
  qrBingkai: { alignSelf: 'center', padding: 10, borderRadius: 20, borderWidth: 2, borderColor: W.malam, borderStyle: 'dashed' },
  selesai: { alignItems: 'center', gap: 10, padding: 22 },
  centang: { width: 56, height: 56, borderRadius: 28, backgroundColor: W.emas, alignItems: 'center', justifyContent: 'center' },
  selesaiJudul: { ...F.display(700), fontSize: 22, lineHeight: 28, color: W.krem, textAlign: 'center' },
  selesaiTeks: { ...F.body(400), fontSize: 15, lineHeight: 22, color: W.krem, textAlign: 'center' },
  selesaiKecil: { ...F.body(400), fontSize: 12, color: W.kremRedup, textAlign: 'center', marginBottom: 6 },
  riwayat: { backgroundColor: W.kartu, borderRadius: 20, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' },
  riwayatBaris: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EFE7D8' },
  riwayatAngka: { ...F.body(600), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
});
