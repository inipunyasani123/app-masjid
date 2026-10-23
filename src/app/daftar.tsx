import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AGENDA, KAJIAN } from '@/lib/data';
import { meta } from '@/lib/meta';
import { kini } from '@/lib/sekarang';
import { type Pendaftaran, useSimpan } from '@/lib/simpan';
import { jam, tanggalPendek, tglWib } from '@/lib/waktu';
import { Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Tombol } from '@/ui/Komponen';
import { Label, Redup, Teks, Text } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/daftar',
    'Daftar Relawan & Kegiatan Masjid | Nurul Ufuk',
    'Contoh formulir pendaftaran relawan dan kelas di aplikasi masjid: panitia Ramadan, kurban, kerja bakti, dan kelas tahsin. Data tersimpan di perangkat.',
  );
}

const KEGIATAN = [
  ...AGENDA.filter((a) => a.relawan).map((a) => ({ id: a.id, nama: a.judul, peran: a.relawan! })),
  ...KAJIAN.filter((k) => k.kuota).map((k) => ({ id: k.id, nama: k.judul, peran: ['Peserta'] })),
];

export default function Daftar() {
  const params = useLocalSearchParams<{ kegiatan?: string }>();
  const [kegiatan, setKegiatan] = useState('ramadan');
  useEffect(() => {
    if (params.kegiatan && KEGIATAN.some((k) => k.id === params.kegiatan)) setKegiatan(params.kegiatan);
  }, [params.kegiatan]);
  const [peran, setPeran] = useState<string[]>([]);
  const [nama, setNama] = useState('');
  const [wa, setWa] = useState('');
  const [catatan, setCatatan] = useState('');
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [baru, setBaru] = useState<string | null>(null);
  const [daftar, setDaftar] = useSimpan<Pendaftaran[]>('pendaftaran', []);

  const k = useMemo(() => KEGIATAN.find((x) => x.id === kegiatan) ?? KEGIATAN[0], [kegiatan]);
  useEffect(() => setPeran(k.peran.length === 1 ? [k.peran[0]] : []), [k.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const kirim = () => {
    const e: Record<string, string> = {};
    if (nama.trim().length < 3) e.nama = 'Tulis nama lengkapmu (minimal 3 huruf).';
    const angka = wa.replace(/[\s-]/g, '');
    if (!/^(\+62|62|0)8\d{7,11}$/.test(angka)) e.wa = 'Nomor WhatsApp diawali 08 atau +62, 10–13 digit.';
    if (!peran.length) e.peran = 'Pilih minimal satu peran.';
    setGalat(e);
    if (Object.keys(e).length) return;
    const p: Pendaftaran = { id: `R${Date.now().toString(36).toUpperCase().slice(-5)}`, kegiatan: k.id, peran, nama: nama.trim(), wa: angka, catatan: catatan.trim(), waktu: kini().getTime() };
    setDaftar((l) => [p, ...l].slice(0, 20));
    setBaru(p.id);
    setNama('');
    setWa('');
    setCatatan('');
  };

  const galatList = Object.values(galat);

  return (
    <Layar kembali label="Pendaftaran" judul="Daftar relawan & kelas" sub="Isi sekali, koordinator kegiatan menghubungimu lewat WhatsApp. Di demo ini data hanya tersimpan di perangkatmu.">
      {baru && (
        <Kartu nada="malam" style={{ gap: 6, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ikon nama="centang" warna={W.emas} />
            <Text style={g.suksesJudul} role="status">
              Pendaftaran tersimpan
            </Text>
          </View>
          <Text style={g.suksesTeks}>Kode {baru}. Pada aplikasi sungguhan, data ini masuk ke koordinator dan kamu mendapat pesan konfirmasi.</Text>
        </Kartu>
      )}

      <Bagian judul="Kegiatan" style={{ marginTop: 0 }}>
        <View role="radiogroup" aria-label="Pilih kegiatan" style={{ gap: 8 }}>
          {KEGIATAN.map((x) => {
            const on = x.id === kegiatan;
            return (
              <Pressable key={x.id} role="radio" aria-checked={on} onPress={() => setKegiatan(x.id)} style={[g.opsi, on && g.opsiAktif]}>
                <View style={[g.radio, on && g.radioAktif]}>{on && <View style={g.radioIsi} />}</View>
                <Text style={g.opsiTeks}>{x.nama}</Text>
              </Pressable>
            );
          })}
        </View>
      </Bagian>

      <Bagian judul="Peran">
        <View role="group" aria-label="Pilih peran" style={g.chips}>
          {k.peran.map((p) => {
            const on = peran.includes(p);
            return (
              <Pressable key={p} role="checkbox" aria-checked={on} onPress={() => setPeran((l) => (on ? l.filter((x) => x !== p) : [...l, p]))} style={[g.chip, on && g.chipAktif]}>
                {on && <Ikon nama="centang" ukuran={16} warna={W.krem} />}
                <Text style={[g.chipTeks, on && { color: W.krem }]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>
        {galat.peran && <Text style={g.galat}>{galat.peran}</Text>}
      </Bagian>

      <Bagian judul="Data diri">
        <Isian id="nama" label="Nama lengkap" nilai={nama} ubah={setNama} galat={galat.nama} autoComplete="name" />
        <Isian id="wa" label="Nomor WhatsApp" nilai={wa} ubah={setWa} galat={galat.wa} inputMode="tel" autoComplete="tel" placeholder="08xx xxxx xxxx" />
        <Isian id="catatan" label="Catatan (opsional)" nilai={catatan} ubah={setCatatan} placeholder="Misalnya: bisa hadir setelah Isya" multiline />
        {galatList.length > 0 && (
          <Text role="alert" style={g.galat}>
            Periksa lagi: {galatList.join(' ')}
          </Text>
        )}
        <Tombol onPress={kirim} ikon="kanan">
          Kirim pendaftaran
        </Tombol>
      </Bagian>

      <Bagian judul="Pendaftaranmu">
        {daftar.length === 0 ? (
          <Redup>Belum ada pendaftaran di perangkat ini.</Redup>
        ) : (
          <View role="list" style={{ gap: 8 }}>
            {daftar.map((p) => (
              <View key={p.id} role="listitem">
              <Kartu style={g.riwayat}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Label>{`${p.id} · menunggu konfirmasi`}</Label>
                  <Teks style={{ ...F.body(600) }}>{KEGIATAN.find((x) => x.id === p.kegiatan)?.nama ?? p.kegiatan}</Teks>
                  <Redup>
                    {p.peran.join(', ')} · {p.nama} · {tanggalPendek(tglWib(new Date(p.waktu)))} {jam(new Date(p.waktu))}
                  </Redup>
                </View>
                <Pressable role="button" aria-label={`Batalkan pendaftaran ${p.id}`} onPress={() => setDaftar((l) => l.filter((x) => x.id !== p.id))} style={g.batal}>
                  <Ikon nama="silang" ukuran={18} warna={W.terakota} />
                </Pressable>
              </Kartu>
              </View>
            ))}
          </View>
        )}
      </Bagian>
    </Layar>
  );
}

function Isian({
  id,
  label,
  nilai,
  ubah,
  galat,
  ...lain
}: {
  id: string;
  label: string;
  nilai: string;
  ubah: (s: string) => void;
  galat?: string;
  inputMode?: 'tel' | 'text';
  autoComplete?: 'name' | 'tel';
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text nativeID={`label-${id}`} style={g.isianLabel}>
        {label}
      </Text>
      <TextInput
        aria-labelledby={`label-${id}`}
        aria-label={label}
        aria-invalid={galat ? true : undefined}
        value={nilai}
        onChangeText={ubah}
        placeholderTextColor="#6B6F80"
        style={[g.input, lain.multiline && { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' }, galat && { borderColor: W.terakota }]}
        {...lain}
      />
      {galat && <Text style={g.galatKecil}>{galat}</Text>}
    </View>
  );
}

const g = StyleSheet.create({
  opsi: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 14, borderRadius: 16, backgroundColor: W.kartu, borderWidth: 1.5, borderColor: W.garis },
  opsiAktif: { borderColor: W.kuningan, backgroundColor: '#FBF3DF' },
  opsiTeks: { ...F.body(500), fontSize: 15, color: W.tinta, flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: W.tinta2, alignItems: 'center', justifyContent: 'center' },
  radioAktif: { borderColor: W.kuningan },
  radioIsi: { width: 10, height: 10, borderRadius: 5, backgroundColor: W.kuningan },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: W.garisTua, backgroundColor: W.kartu },
  chipAktif: { backgroundColor: W.malam, borderColor: W.malam },
  chipTeks: { ...F.body(600), fontSize: 14, color: W.tinta },
  isianLabel: { ...F.body(500), fontSize: 13, color: W.tinta },
  input: { ...F.body(400), minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: W.garisTua, backgroundColor: W.kartu, paddingHorizontal: 14, fontSize: 16, color: W.tinta },
  galat: { ...F.body(500), fontSize: 14, lineHeight: 20, color: W.terakota },
  galatKecil: { ...F.body(400), fontSize: 13, color: W.terakota },
  suksesJudul: { ...F.display(700), fontSize: 19, color: W.krem },
  suksesTeks: { ...F.body(400), fontSize: 14, lineHeight: 20, color: W.kremRedup },
  riwayat: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  batal: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: W.garis },
});
