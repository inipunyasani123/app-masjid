import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KAJIAN, ORANG } from '@/lib/data';
import { hijriah, teksHijriah } from '@/lib/hijriah';
import { agendaMendatang, jumatMendatang, mulaiKajian, teksPatokan } from '@/lib/kegiatan';
import { meta } from '@/lib/meta';
import { useHariIni } from '@/lib/sekarang';
import { useSimpan } from '@/lib/simpan';
import { HARI, hariDalamPekan, jam, kunciTgl, selisihHari, tambahHari, tanggalPanjang, tanggalPendek, type Tgl } from '@/lib/waktu';
import { FotoLengkung } from '@/ui/Foto';
import { Ikon } from '@/ui/Ikon';
import { Kartu, Layar, Pilihan, Tautan } from '@/ui/Komponen';
import { Siluet } from '@/ui/Siluet';
import { Label, Redup, Teks } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/kegiatan',
    'Kajian, Khatib Jumat & Agenda | Nurul Ufuk',
    'Jadwal kajian rutin, petugas salat Jumat, dan agenda besar Masjid Nurul Ufuk (rekaan): Ramadan, Iduladha, santunan, dan kerja bakti.',
  );
}

type Tab = 'kajian' | 'jumat' | 'agenda';

export default function Kegiatan() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>('kajian');
  useEffect(() => {
    if (params.tab === 'jumat' || params.tab === 'agenda' || params.tab === 'kajian') setTab(params.tab);
  }, [params.tab]);
  const { now, hari } = useHariIni();
  const [koreksi] = useSimpan<number>('koreksi', 0);

  return (
    <Layar label="Kegiatan masjid" judul="Kajian & agenda" sub="Jam kajian bakda salat menyesuaikan jadwal salat hari itu.">
      <Pilihan<Tab>
        label="Jenis kegiatan"
        nilai={tab}
        onPilih={setTab}
        pilihan={[
          { id: 'kajian', teks: 'Kajian' },
          { id: 'jumat', teks: 'Jumat' },
          { id: 'agenda', teks: 'Agenda' },
        ]}
      />
      <View style={{ marginTop: 16, gap: 12 }}>
        {tab === 'kajian' && <DaftarKajian now={now} hari={hari} />}
        {tab === 'jumat' && <DaftarJumat now={now} hari={hari} koreksi={koreksi} />}
        {tab === 'agenda' && <DaftarAgenda hari={hari} koreksi={koreksi} />}
      </View>
    </Layar>
  );
}

// Urutan tetap (Senin → Ahad) agar daftar tidak berpindah posisi setelah jam perangkat terbaca.
const URUTAN_PEKAN = ['tpq', 'safinah', 'kuliah-subuh', 'muslimah', 'yasinan', 'tahsin', 'riyadhus'];

function kapanTeks(hari: Tgl, t: Tgl) {
  const n = selisihHari(hari, t);
  if (n === 0) return 'hari ini';
  if (n === 1) return 'besok';
  return `${HARI[hariDalamPekan(t)]} ${tanggalPendek(t)}`;
}

function DaftarKajian({ now, hari }: { now: Date | null; hari: Tgl | null }) {
  // Satu kartu per kajian rutin, dengan pertemuan terdekat yang belum selesai.
  const menit = now ? Math.floor(now.getTime() / 60000) : 0;
  const isi = useMemo(() => {
    return KAJIAN.map((k) => {
      let terdekat: { tgl: Tgl; mulai: Date } | null = null;
      if (hari && now) {
        for (let i = 0; i < 9; i++) {
          const t = tambahHari(hari, i);
          if (!k.hari.includes(hariDalamPekan(t))) continue;
          const mulai = mulaiKajian(k, t);
          if (mulai.getTime() + k.durasi * 60000 <= now.getTime()) continue;
          terdekat = { tgl: t, mulai };
          break;
        }
      }
      return { k, terdekat };
    }).sort((a, b) => URUTAN_PEKAN.indexOf(a.k.id) - URUTAN_PEKAN.indexOf(b.k.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hari ? kunciTgl(hari) : '', Math.floor(menit / 5)]);

  return (
    <>
      {isi.map(({ k, terdekat }) => {
        const o = ORANG[k.pemateri];
        const hariTeks = k.hari.length === 5 ? 'Senin–Jumat' : k.hari.map((h) => (h === 0 ? 'Ahad' : HARI[h])).join(' & ');
        return (
          <Tautan key={k.id} href={`/kajian/${k.id}`} style={g.kajian}>
            <Siluet orang={o} ukuran={46} />
            <View style={{ flex: 1, gap: 3 }}>
              <Label>{`${hariTeks} · ${teksPatokan(k)}`}</Label>
              <Text style={g.judul}>{k.judul}</Text>
              {k.kitab && <Redup style={{ color: W.kuningan }}>{k.kitab}</Redup>}
              <Redup>
                {o.nama} · {k.tempat}
              </Redup>
              {!(terdekat && hari) && <Text style={g.terdekat}> </Text>}
              {terdekat && hari && (
                <Text style={g.terdekat}>
                  {terdekat.mulai.getTime() <= (now?.getTime() ?? 0) ? 'Sedang berlangsung' : `Berikutnya: ${kapanTeks(hari, terdekat.tgl)}, ${jam(terdekat.mulai)} WIB`}
                </Text>
              )}
            </View>
            <Ikon nama="kanan" ukuran={18} warna={W.tinta2} />
          </Tautan>
        );
      })}
    </>
  );
}

function DaftarJumat({ now, hari, koreksi }: { now: Date | null; hari: Tgl | null; koreksi: number }) {
  const daftar = useMemo(() => (now && hari ? jumatMendatang(now, hari, 4) : []), [now && hari ? kunciTgl(hari) : '']); // eslint-disable-line react-hooks/exhaustive-deps
  if (!daftar.length) return <Redup>Memuat jadwal petugas Jumat…</Redup>;
  return (
    <>
      {daftar.map((j, i) => (
        <Kartu key={kunciTgl(j.tgl)} nada={i === 0 ? 'malam' : 'kartu'} style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={[g.jumatTgl, i === 0 && { color: W.krem }]}>{tanggalPanjang(j.tgl).replace(/ \d{4}$/, '')}</Text>
            <Text style={[g.jumatH, i === 0 && { color: W.emas }]}>{teksHijriah(hijriah(j.tgl, koreksi)).replace(/ \d{4} H$/, '')}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Siluet orang={j.khatib} ukuran={48} />
            <View style={{ flex: 1 }}>
              <Label style={i === 0 ? { color: W.emas } : undefined}>Khatib</Label>
              <Text style={[g.judul, i === 0 && { color: W.krem }]}>{j.khatib.nama}</Text>
              <Text style={[g.tema, i === 0 && { color: W.kremRedup }]}>Tema: {j.tema}</Text>
            </View>
          </View>
          <View style={[g.petugas, i === 0 && { borderTopColor: '#2D3756' }]}>
            <Petugas label="Imam" nama={j.imam.nama} gelap={i === 0} />
            <Petugas label="Muazin" nama={j.muazin.nama} gelap={i === 0} />
            <Petugas label="Azan" nama={`${jam(j.azan)} WIB`} gelap={i === 0} />
          </View>
        </Kartu>
      ))}
      <Redup>Petugas Jumat disusun takmir tiap bulan. Bila berhalangan, tugas digantikan imam rawatib.</Redup>
    </>
  );
}

function Petugas({ label, nama, gelap }: { label: string; nama: string; gelap: boolean }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={[g.petugasLabel, gelap && { color: W.kremRedup }]}>{label}</Text>
      <Text style={[g.petugasNama, gelap && { color: W.krem }]}>{nama.replace(/^(Ustaz|Mas) /, '')}</Text>
    </View>
  );
}

function DaftarAgenda({ hari, koreksi }: { hari: Tgl | null; koreksi: number }) {
  const daftar = useMemo(() => (hari ? agendaMendatang(hari, koreksi) : []), [hari ? kunciTgl(hari) : '', koreksi]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!daftar.length) return <Redup>Memuat agenda…</Redup>;
  return (
    <>
      {daftar.map(({ agenda: a, tgl, h, sisa }) => (
        <Tautan key={a.id} href={`/agenda/${a.id}`} style={g.agenda}>
          {a.foto ? (
            <View style={{ width: 92 }}>
              <FotoLengkung nama={a.foto} tegak />
            </View>
          ) : (
            <View style={g.agendaTgl}>
              <Text style={g.agendaD}>{tgl.d}</Text>
              <Text style={g.agendaM}>{tanggalPendek(tgl).split(' ')[1]}</Text>
            </View>
          )}
          <View style={{ flex: 1, gap: 3 }}>
            <Label style={{ color: W.terakota }}>{sisa === 0 ? 'Hari ini' : sisa === 1 ? 'Besok' : `${a.perkiraan ? '± ' : ''}${sisa} hari lagi`}</Label>
            <Text style={g.judul}>{a.judul}</Text>
            <Redup>
              {tanggalPanjang(tgl)}
              {h ? ` · ${teksHijriah(h)}` : ''}
            </Redup>
            {a.perkiraan && <Text style={g.perkiraan}>Tanggal perkiraan, menunggu penetapan resmi</Text>}
          </View>
        </Tautan>
      ))}
    </>
  );
}

const g = StyleSheet.create({
  kajian: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: W.kartu, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: W.garis },
  judul: { ...F.display(600), fontSize: 18, lineHeight: 23, color: W.tinta },
  terdekat: { ...F.body(500), fontSize: 13, color: W.nila, marginTop: 2 },
  jumatTgl: { ...F.body(600), fontSize: 15, color: W.tinta },
  jumatH: { ...F.body(400), fontSize: 13, color: W.kuningan },
  tema: { ...F.body(400), fontSize: 13, lineHeight: 19, color: W.tinta2, marginTop: 2 },
  petugas: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: W.garis, paddingTop: 10 },
  petugasLabel: { ...F.body(400), fontSize: 12, color: W.tinta2 },
  petugasNama: { ...F.body(600), fontSize: 13.5, color: W.tinta },
  agenda: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: W.kartu, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: W.garis },
  agendaTgl: { width: 92, aspectRatio: 3 / 4, borderTopLeftRadius: 46, borderTopRightRadius: 46, borderRadius: 12, backgroundColor: W.kartu2, alignItems: 'center', justifyContent: 'center' },
  agendaD: { ...F.display(700), fontSize: 34, lineHeight: 38, color: W.tinta },
  agendaM: { ...F.body(600), fontSize: 13, color: W.kuningan, textTransform: 'uppercase', letterSpacing: 1 },
  perkiraan: { ...F.body(400), fontSize: 12, color: W.tinta2, fontStyle: 'italic' },
});
