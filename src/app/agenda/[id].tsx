import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AGENDA } from '@/lib/data';
import { teksHijriah } from '@/lib/hijriah';
import { tanggalAgenda } from '@/lib/kegiatan';
import { meta, potong } from '@/lib/meta';
import { useHariIni } from '@/lib/sekarang';
import { useSimpan } from '@/lib/simpan';
import { kunciTgl, tanggalPanjang } from '@/lib/waktu';
import { FotoLengkung } from '@/ui/Foto';
import { Bagian, Kartu, Layar, Tombol } from '@/ui/Komponen';
import { Label, Redup, Teks } from '@/ui/Teks';
import { TidakDitemukan } from '@/ui/TidakDitemukan';
import { F, W } from '@/ui/tema';

export function generateStaticParams() {
  return AGENDA.map((a) => ({ id: a.id }));
}

export function generateMetadata(_req: unknown, params: Record<string, string | string[]>) {
  const a = AGENDA.find((x) => x.id === params.id);
  if (!a) return meta('/404', 'Halaman tidak ditemukan | Nurul Ufuk', 'Halaman ini tidak ada.', { noindex: true });
  return meta(`/agenda/${a.id}`, potong(`${a.judul} | Nurul Ufuk`, 60), potong(`${a.ringkas} Agenda rekaan Masjid Nurul Ufuk, Tulungagung, di demo aplikasi masjid PintuWeb.`, 155));
}

export default function DetailAgenda() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const a = AGENDA.find((x) => x.id === id);
  const { hari } = useHariIni();
  const [koreksi] = useSimpan<number>('koreksi', 0);
  const jadwal = useMemo(() => (a && hari ? tanggalAgenda(a, hari, koreksi) : null), [a?.id, hari ? kunciTgl(hari) : '', koreksi]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!a) return <TidakDitemukan />;
  return (
    <Layar kembali label={a.perkiraan ? 'Agenda · tanggal perkiraan' : 'Agenda masjid'} judul={a.judul}>
      {a.foto && (
        <View style={{ marginBottom: 14 }}>
          <FotoLengkung nama={a.foto} latar={W.kertas} />
        </View>
      )}
      <Kartu nada="malam" style={{ gap: 6 }}>
        <Label style={{ color: W.emas }}>{jadwal ? (jadwal.sisa === 0 ? 'Hari ini' : `${a.perkiraan ? '± ' : ''}${jadwal.sisa} hari lagi`) : 'Tanggal'}</Label>
        <Text style={g.tgl}>{jadwal ? tanggalPanjang(jadwal.tgl) : 'Menghitung tanggal…'}</Text>
        {a.jenis === 'hijriah' && <Text style={g.hijriah}>{jadwal?.h ? teksHijriah(jadwal.h) : ' '}</Text>}
        <Text style={g.kecil}>
          {a.jam} · {a.tempat}
        </Text>
      </Kartu>
      {a.perkiraan && (
        <Redup style={{ marginTop: 10 }}>
          Tanggal dihitung dari kalender Hijriah perkiraan. Penetapan resmi mengikuti Kementerian Agama dan diumumkan takmir.
        </Redup>
      )}

      <Bagian judul="Rincian">
        <View style={{ gap: 10 }}>
          <Teks>{a.ringkas}</Teks>
          {a.isi.map((p) => (
            <Teks key={p}>{p}</Teks>
          ))}
        </View>
      </Bagian>

      {a.relawan && (
        <Kartu nada="krem" style={{ marginTop: 22, gap: 10 }}>
          <Teks style={{ ...F.body(600) }}>Relawan yang dibutuhkan</Teks>
          <View style={g.peran}>
            {a.relawan.map((r) => (
              <View key={r} style={g.peranItem}>
                <Text style={g.peranTeks}>{r}</Text>
              </View>
            ))}
          </View>
          <Tombol onPress={() => router.push(`/daftar?kegiatan=${a.id}`)} ikon="kanan">
            Daftar jadi relawan
          </Tombol>
        </Kartu>
      )}
    </Layar>
  );
}

const g = StyleSheet.create({
  tgl: { ...F.display(700), fontSize: 24, lineHeight: 30, color: W.krem },
  hijriah: { ...F.display(600), fontSize: 17, lineHeight: 22, color: W.emas },
  kecil: { ...F.body(400), fontSize: 13, color: W.kremRedup, marginTop: 4 },
  peran: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  peranItem: { borderRadius: 8, borderWidth: 1, borderColor: W.garisTua, paddingHorizontal: 10, paddingVertical: 6 },
  peranTeks: { ...F.body(500), fontSize: 13, color: W.tinta },
});
