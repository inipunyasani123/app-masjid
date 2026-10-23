import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { tautanWa } from '@/lib/bagikan';
import { KAJIAN, ORANG } from '@/lib/data';
import { mulaiKajian, teksPatokan } from '@/lib/kegiatan';
import { meta, potong } from '@/lib/meta';
import { useHariIni } from '@/lib/sekarang';
import { HARI, hariDalamPekan, jam, kunciTgl, tambahHari, tanggalPendek, type Tgl } from '@/lib/waktu';
import { Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Saklar, Tombol } from '@/ui/Komponen';
import { usePengingat } from '@/ui/Pengingat';
import { Siluet } from '@/ui/Siluet';
import { Label, Redup, Teks, Text } from '@/ui/Teks';
import { F, W } from '@/ui/tema';
import { TidakDitemukan } from '@/ui/TidakDitemukan';

export function generateStaticParams() {
  return KAJIAN.map((k) => ({ id: k.id }));
}

export function generateMetadata(_req: unknown, params: Record<string, string | string[]>) {
  const k = KAJIAN.find((x) => x.id === params.id);
  if (!k) return meta('/404', 'Halaman tidak ditemukan | Nurul Ufuk', 'Halaman ini tidak ada.', { noindex: true });
  return meta(`/kajian/${k.id}`, potong(`${k.judul} | Nurul Ufuk`, 60), potong(`${k.ringkas} ${teksPatokan(k)}, ${k.tempat}. Kajian rutin rekaan di demo aplikasi masjid.`, 155));
}

export default function DetailKajian() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const k = KAJIAN.find((x) => x.id === id);
  const { hari } = useHariIni();
  const [pengingat, setPengingat] = usePengingat();
  const pertemuan = useMemo(() => {
    if (!k || !hari) return [];
    const out: { tgl: Tgl; mulai: Date }[] = [];
    for (let i = 0; i < 21 && out.length < 3; i++) {
      const t = tambahHari(hari, i);
      if (k.hari.includes(hariDalamPekan(t))) out.push({ tgl: t, mulai: mulaiKajian(k, t) });
    }
    return out;
  }, [k?.id, hari ? kunciTgl(hari) : '']); // eslint-disable-line react-hooks/exhaustive-deps

  if (!k) return <TidakDitemukan />;
  const o = ORANG[k.pemateri];
  const ajak = `Assalamualaikum, yuk ikut ${k.judul}${k.kitab ? ` (${k.kitab})` : ''} di Masjid Nurul Ufuk${pertemuan[0] ? `, ${HARI[hariDalamPekan(pertemuan[0].tgl)]} ${tanggalPendek(pertemuan[0].tgl)} pukul ${jam(pertemuan[0].mulai)} WIB` : ''}. ${k.tempat}. (Demo aplikasi: https://app-masjid.pintuweb.id/kajian/${k.id})`;
  const aktif = pengingat.kajian.includes(k.id);
  const hariTeks = k.hari.length === 5 ? 'Senin sampai Jumat' : k.hari.map((h) => (h === 0 ? 'Ahad' : HARI[h])).join(' dan ');

  return (
    <Layar kembali label="Kajian rutin" judul={k.judul} sub={k.kitab}>
      <Kartu style={g.pemateri}>
        <Siluet orang={o} ukuran={60} />
        <View style={{ flex: 1, gap: 2 }}>
          <Label>Pengisi</Label>
          <Text style={g.nama}>{o.nama}</Text>
          <Redup>{o.peran}</Redup>
        </View>
      </Kartu>

      <View style={g.fakta}>
        <Fakta label="Jadwal" isi={`${hariTeks}, ${teksPatokan(k).replace(/^B/, 'b').replace(/^P/, 'p')}`} />
        <Fakta label="Durasi" isi={`± ${k.durasi} menit`} />
        <Fakta label="Tempat" isi={k.tempat} />
        <Fakta label="Untuk" isi={k.untuk} />
      </View>

      <Kartu nada="krem" style={{ marginTop: 14, paddingVertical: 8 }}>
        <Saklar
          nilai={aktif}
          onUbah={(v) => setPengingat((l) => ({ ...l, kajian: v ? [...l.kajian.filter((x) => x !== k.id), k.id] : l.kajian.filter((x) => x !== k.id) }))}
          label="Ingatkan aku"
          keterangan="30 menit sebelum kajian dimulai (simulasi)"
        />
      </Kartu>

      {k.materi && (
        <Bagian judul="Materi">
          <Kartu style={{ gap: 10 }}>
            <Label>
              {k.materi.satuan === 'surah'
                ? `Surah ke-${k.materi.ke} dari ${k.materi.dari} di Juz Amma`
                : `Pertemuan ${k.materi.ke} dari ${k.materi.dari}${k.materi.satuan.includes('tahun') ? ' tahun ini' : ''}`}
            </Label>
            <View style={g.progres} aria-hidden>
              <View style={[g.progresIsi, { width: `${Math.round((k.materi.ke / k.materi.dari) * 100)}%` }]} />
            </View>
            <Text style={g.bab}>Berikutnya: {k.materi.bab}</Text>
            <Text style={g.lalu}>Ringkasan pertemuan lalu</Text>
            {k.materi.lalu.map((x) => (
              <View key={x} style={g.poin}>
                <View style={g.titikPoin} />
                <Teks style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>{x}</Teks>
              </View>
            ))}
          </Kartu>
        </Bagian>
      )}

      <Bagian judul="Pertemuan terdekat">
        <Kartu nada="malam" style={{ gap: 10, minHeight: 'jam' in k.patokan ? 150 : 178 }}>
          {pertemuan.length === 0 && <Text style={g.teksMalam}>Menghitung jadwal…</Text>}
          {pertemuan.map((p, i) => (
            <View key={i} style={[g.pertemuan, i > 0 && { borderTopWidth: 1, borderTopColor: '#2D3756', paddingTop: 10 }]}>
              <Text style={g.pertemuanTgl}>
                {HARI[hariDalamPekan(p.tgl)]}, {tanggalPendek(p.tgl)}
              </Text>
              <Text style={g.pertemuanJam}>{jam(p.mulai)} WIB</Text>
            </View>
          ))}
          {!('jam' in k.patokan) && <Text style={g.teksMalam}>Jam mengikuti jadwal salat hari itu, dibulatkan ke 5 menit.</Text>}
        </Kartu>
      </Bagian>

      <Bagian judul="Tentang kajian ini">
        <View style={{ gap: 10 }}>
          {k.isi.map((p) => (
            <Teks key={p}>{p}</Teks>
          ))}
        </View>
      </Bagian>

      <Link href={tautanWa(ajak) as never} target="_blank" rel="noopener" asChild>
        <Pressable style={g.ajak}>
          <Ikon nama="bagikan" ukuran={18} warna={W.tinta} />
          <Text style={g.ajakTeks}>Ajak lewat WhatsApp</Text>
        </Pressable>
      </Link>

      {k.kuota && (
        <Kartu nada="krem" style={{ marginTop: 22, gap: 10 }}>
          <Teks style={{ ...F.body(600) }}>Kuota kelas</Teks>
          <View style={g.progres}>
            <View style={[g.progresIsi, { width: `${Math.round(((k.terdaftar ?? 0) / k.kuota) * 100)}%` }]} />
          </View>
          <Redup>
            {k.terdaftar} dari {k.kuota} kursi terisi. Pendaftaranmu tersimpan di perangkat (simulasi).
          </Redup>
          <Tombol onPress={() => router.push(`/daftar?kegiatan=${k.id}`)} ikon="kanan">
            Daftar kelas ini
          </Tombol>
        </Kartu>
      )}
    </Layar>
  );
}

function Fakta({ label, isi }: { label: string; isi: string }) {
  return (
    <View style={g.faktaBaris}>
      <Text style={g.faktaLabel}>{label}</Text>
      <Text style={g.faktaIsi}>{isi}</Text>
    </View>
  );
}

const g = StyleSheet.create({
  pemateri: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  nama: { ...F.display(600), fontSize: 19, lineHeight: 24, color: W.tinta },
  fakta: { marginTop: 14, backgroundColor: W.kartu, borderRadius: 20, borderWidth: 1, borderColor: W.garis, paddingHorizontal: 16 },
  faktaBaris: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EFE7D8' },
  faktaLabel: { ...F.body(500), fontSize: 13, color: W.tinta2, width: 72 },
  faktaIsi: { ...F.body(500), fontSize: 14, lineHeight: 20, color: W.tinta, flex: 1 },
  pertemuan: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  pertemuanTgl: { ...F.body(500), fontSize: 15, color: W.krem },
  pertemuanJam: { ...F.display(700), fontSize: 20, color: W.emas },
  teksMalam: { ...F.body(400), fontSize: 13, color: W.kremRedup },
  progres: { height: 8, borderRadius: 4, backgroundColor: W.kartu2, overflow: 'hidden' },
  bab: { ...F.display(600), fontSize: 17, lineHeight: 23, color: W.tinta },
  lalu: { ...F.body(600), fontSize: 13, color: W.tinta2, marginTop: 4 },
  poin: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  titikPoin: { width: 6, height: 6, borderRadius: 3, backgroundColor: W.emas, marginTop: 8 },
  ajak: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 999, borderWidth: 1.5, borderColor: W.tinta, marginTop: 22 },
  ajakTeks: { ...F.body(600), fontSize: 15, color: W.tinta },
  progresIsi: { height: 8, borderRadius: 4, backgroundColor: W.kuningan },
});
