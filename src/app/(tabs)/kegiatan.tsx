import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AGENDA, KAJIAN, ORANG, type Kajian } from '@/lib/data';
import { hijriah, teksHijriah } from '@/lib/hijriah';
import { agendaMendatang, jumatMendatang, mulaiKajian, tanggalAgenda, teksPatokan } from '@/lib/kegiatan';
import { meta } from '@/lib/meta';
import { jadwalHari } from '@/lib/salat';
import { useHariIni } from '@/lib/sekarang';
import { useSimpan } from '@/lib/simpan';
import { BULAN, HARI, HARI_PENDEK, hariDalamPekan, jam, kunciTgl, samaTgl, selisihHari, tambahHari, tanggalPanjang, tanggalPendek, type Tgl } from '@/lib/waktu';
import { FotoLengkung } from '@/ui/Foto';
import { Ikon } from '@/ui/Ikon';
import { Kartu, Layar, Pilihan, Saklar, Tautan } from '@/ui/Komponen';
import { usePengingat } from '@/ui/Pengingat';
import { Siluet } from '@/ui/Siluet';
import { Label, Redup, Text } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/kegiatan',
    'Kajian, Khatib Jumat & Agenda | Nurul Ufuk',
    'Jadwal kajian rutin urut pertemuan terdekat, petugas salat Jumat, dan agenda Masjid Nurul Ufuk (rekaan): Ramadan, Iduladha, santunan, kerja bakti.',
  );
}

type Tab = 'kajian' | 'jumat' | 'agenda';

// Warna titik strip pekan: kajian = nila, Jumat = terakota, agenda = kuningan (selalu disertai teks di legenda & label).
const TITIK = { kajian: W.nila, jumat: W.terakota, agenda: W.kuningan };

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
        {tab === 'kajian' && <DaftarKajian now={now} hari={hari} koreksi={koreksi} />}
        {tab === 'jumat' && <DaftarJumat now={now} hari={hari} koreksi={koreksi} />}
        {tab === 'agenda' && <DaftarAgenda hari={hari} koreksi={koreksi} />}
      </View>
    </Layar>
  );
}

type Pertemuan = { k: Kajian; tgl: Tgl; mulai: Date; selesai: Date; berlangsung: boolean; lewat: boolean };

function pertemuanPada(t: Tgl, now: Date): Pertemuan[] {
  return KAJIAN.filter((k) => k.hari.includes(hariDalamPekan(t)))
    .map((k) => {
      const mulai = mulaiKajian(k, t);
      const selesai = new Date(mulai.getTime() + k.durasi * 60000);
      return { k, tgl: t, mulai, selesai, berlangsung: mulai <= now && now < selesai, lewat: selesai <= now };
    })
    .sort((a, b) => a.mulai.getTime() - b.mulai.getTime());
}

function DaftarKajian({ now, hari, koreksi }: { now: Date | null; hari: Tgl | null; koreksi: number }) {
  const [pilih, setPilih] = useState<string | null>(null);
  const menit = now ? Math.floor(now.getTime() / 60000) : 0;

  const data = useMemo(() => {
    if (!now || !hari) return null;
    const hariList = Array.from({ length: 7 }, (_, i) => tambahHari(hari, i));
    const agenda = AGENDA.map((a) => tanggalAgenda(a, hari, koreksi)).filter((x) => x && x.sisa < 7);
    const perHari = hariList.map((t) => ({
      t,
      kajian: pertemuanPada(t, now),
      jumat: hariDalamPekan(t) === 5,
      agenda: agenda.filter((a) => a && samaTgl(a.tgl, t)).map((a) => a!.agenda),
    }));
    // Tiap kajian sekali, pada pertemuan terdekat yang belum selesai.
    const sudah = new Set<string>();
    const terdekat: Pertemuan[] = [];
    for (const h of perHari) for (const p of h.kajian) if (!p.lewat && !sudah.has(p.k.id)) { sudah.add(p.k.id); terdekat.push(p); }
    terdekat.sort((a, b) => a.mulai.getTime() - b.mulai.getTime());
    return { perHari, terdekat };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hari ? kunciTgl(hari) : '', Math.floor(menit / 5), koreksi]);

  if (!data || !hari || !now) {
    return (
      <View aria-hidden style={{ gap: 12 }}>
        <View style={g.strip}>
          {Array.from({ length: 7 }, (_, i) => (
            <View key={i} style={[g.hariItem, g.kerangka]} />
          ))}
        </View>
        <View style={[g.kerangkaKartu]} />
        <View style={[g.kerangkaKartu]} />
        <View style={[g.kerangkaKartu]} />
      </View>
    );
  }

  const kelompok = (p: Pertemuan) => (p.berlangsung ? 'Sedang berlangsung' : samaTgl(p.tgl, hari) ? 'Hari ini' : selisihHari(hari, p.tgl) === 1 ? 'Besok' : 'Pekan ini');
  const hariDipilih = pilih ? data.perHari.find((h) => kunciTgl(h.t) === pilih) : null;

  return (
    <>
      <View role="radiogroup" aria-label="Saring menurut hari" style={g.strip}>
        {data.perHari.map((h, i) => {
          const kunci = kunciTgl(h.t);
          const on = pilih === kunci;
          const isi = [h.kajian.length ? `${h.kajian.length} kajian` : '', h.jumat ? 'salat Jumat' : '', h.agenda.length ? `${h.agenda.length} agenda` : ''].filter(Boolean).join(', ');
          return (
            <Pressable
              key={kunci}
              role="radio"
              aria-checked={on}
              aria-label={`${i === 0 ? 'Hari ini, ' : ''}${HARI[hariDalamPekan(h.t)]} ${h.t.d} ${BULAN[h.t.m - 1]}: ${isi || 'tanpa kegiatan'}`}
              onPress={() => setPilih(on ? null : kunci)}
              style={[g.hariItem, on && g.hariAktif, i === 0 && !on && g.hariIni]}
            >
              <Text style={[g.hariNama, on && { color: W.emas }]}>{i === 0 ? 'Ini' : HARI_PENDEK[hariDalamPekan(h.t)]}</Text>
              <Text style={[g.hariTgl, on && { color: W.krem }]}>{h.t.d}</Text>
              <View style={g.titikBaris}>
                {h.kajian.length > 0 && <View style={[g.titik, { backgroundColor: on ? W.krem : TITIK.kajian }]} />}
                {h.jumat && <View style={[g.titik, { backgroundColor: on ? W.fajar : TITIK.jumat }]} />}
                {h.agenda.length > 0 && <View style={[g.titik, { backgroundColor: on ? W.emas : TITIK.agenda }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={g.legenda} aria-hidden>
        <Legenda warna={TITIK.kajian} teks="kajian" />
        <Legenda warna={TITIK.jumat} teks="Jumat" />
        <Legenda warna={TITIK.agenda} teks="agenda" />
      </View>

      {hariDipilih ? (
        <>
          <View style={g.kepalaKelompok}>
            <Text role="heading" aria-level={2} style={g.kelompok}>
              {tanggalPanjang(hariDipilih.t).replace(/ \d{4}$/, '')}
            </Text>
            <Pressable role="button" onPress={() => setPilih(null)} style={g.semua}>
              <Text style={g.semuaTeks}>Semua hari</Text>
            </Pressable>
          </View>
          {hariDipilih.jumat && (
            <Kartu nada="malam" style={{ gap: 4 }}>
              <Label style={{ color: W.fajar }}>Salat Jumat</Label>
              <Text style={g.malamJudul}>Azan {jam(mulaiAzan(hariDipilih.t))} WIB</Text>
              <Redup style={{ color: W.kremRedup }}>Lihat khatib dan petugas di tab Jumat.</Redup>
            </Kartu>
          )}
          {hariDipilih.agenda.map((a) => (
            <Tautan key={a.id} href={`/agenda/${a.id}`} style={g.agendaKecil}>
              <Label style={{ color: W.kuningan }}>Agenda</Label>
              <Text style={g.judul}>{a.judul}</Text>
              <Redup>{a.jam}</Redup>
            </Tautan>
          ))}
          {hariDipilih.kajian.map((p) => (
            <KartuKajian key={p.k.id} p={p} hari={hari} />
          ))}
          {!hariDipilih.kajian.length && !hariDipilih.jumat && !hariDipilih.agenda.length && <Redup>Tidak ada kegiatan terjadwal di hari ini.</Redup>}
        </>
      ) : (
        data.terdekat.map((p, i) => {
          const kel = kelompok(p);
          const baru = i === 0 || kelompok(data.terdekat[i - 1]) !== kel;
          return (
            <View key={p.k.id} style={{ gap: 10 }}>
              {baru && (
                <Text role="heading" aria-level={2} style={[g.kelompok, i > 0 && { marginTop: 6 }]}>
                  {kel}
                </Text>
              )}
              <KartuKajian p={p} hari={hari} />
            </View>
          );
        })
      )}
    </>
  );
}

function mulaiAzan(t: Tgl) {
  return jadwalHari(t).zuhur;
}

function Legenda({ warna, teks }: { warna: string; teks: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={[g.titik, { backgroundColor: warna }]} />
      <Text style={g.legendaTeks}>{teks}</Text>
    </View>
  );
}

function KartuKajian({ p, hari }: { p: Pertemuan; hari: Tgl }) {
  const o = ORANG[p.k.pemateri];
  const n = selisihHari(hari, p.tgl);
  const kapan = n === 0 ? 'Hari ini' : n === 1 ? 'Besok' : `${HARI[hariDalamPekan(p.tgl)]}, ${tanggalPendek(p.tgl)}`;
  return (
    <Tautan href={`/kajian/${p.k.id}`} style={[g.kajian, p.berlangsung && g.kajianAktif, p.lewat && { opacity: 0.75 }]}>
      <View style={g.kolomJam}>
        <Text style={[g.jamBesar, p.berlangsung && { color: W.krem }]}>{jam(p.mulai)}</Text>
        <Text style={[g.jamKecil, p.berlangsung && { color: W.kremRedup }]}>{p.berlangsung ? 'berlangsung' : p.lewat ? 'selesai' : kapan}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[g.patokan, p.berlangsung && { color: W.emas }]}>{teksPatokan(p.k)}</Text>
        <Text style={[g.judul, p.berlangsung && { color: W.krem }]}>{p.k.judul}</Text>
        {p.k.kitab && <Text style={[g.kitab, p.berlangsung && { color: W.emas }]}>{p.k.kitab}</Text>}
        <View style={g.pengisi}>
          <Siluet orang={o} ukuran={20} />
          <Text style={[g.kecil, p.berlangsung && { color: W.kremRedup }]}>
            {o.nama} · {p.k.tempat}
          </Text>
        </View>
        {p.k.materi && (
          <Text style={[g.materi, p.berlangsung && { color: W.krem }]}>
            {p.k.materi.satuan === 'surah' ? 'Berikutnya' : `Pertemuan ${p.k.materi.ke}`}: {p.k.materi.bab}
          </Text>
        )}
      </View>
      <Ikon nama="kanan" ukuran={18} warna={p.berlangsung ? W.krem : W.tinta2} />
    </Tautan>
  );
}

function DaftarJumat({ now, hari, koreksi }: { now: Date | null; hari: Tgl | null; koreksi: number }) {
  const [p, setP] = usePengingat();
  const daftar = useMemo(() => (now && hari ? jumatMendatang(now, hari, 4) : []), [now && hari ? kunciTgl(hari) : '']); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Kartu nada="krem" style={{ paddingVertical: 8 }}>
        <Saklar nilai={p.jumat} onUbah={(v) => setP((l) => ({ ...l, jumat: v }))} label="Ingatkan aku sebelum Jumat" keterangan="30 menit sebelum azan, tiap Jumat (simulasi)" />
      </Kartu>
      {!daftar.length && <Redup>Memuat jadwal petugas Jumat…</Redup>}
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
  strip: { flexDirection: 'row', gap: 4 },
  hariItem: { flex: 1, minHeight: 66, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: W.kartu, borderWidth: 1, borderColor: W.garis },
  hariIni: { borderColor: W.kuningan, borderWidth: 1.5 },
  hariAktif: { backgroundColor: W.malam, borderColor: W.malam },
  hariNama: { ...F.body(500), fontSize: 12, color: W.tinta2 },
  hariTgl: { ...F.display(700), fontSize: 18, lineHeight: 22, color: W.tinta, fontVariant: ['tabular-nums'] },
  titikBaris: { flexDirection: 'row', gap: 3, height: 6 },
  titik: { width: 6, height: 6, borderRadius: 3 },
  legenda: { flexDirection: 'row', gap: 14, marginTop: -4 },
  legendaTeks: { ...F.body(400), fontSize: 12, color: W.tinta2 },
  kerangka: { backgroundColor: W.kartu2, borderColor: W.kartu2 },
  kerangkaKartu: { height: 118, borderRadius: 20, backgroundColor: W.kartu2 },
  kepalaKelompok: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kelompok: { ...F.display(600), fontSize: 19, lineHeight: 24, color: W.tinta },
  semua: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 999, borderWidth: 1.5, borderColor: W.tinta },
  semuaTeks: { ...F.body(600), fontSize: 14, color: W.tinta },
  malamJudul: { ...F.display(700), fontSize: 20, lineHeight: 26, color: W.krem },
  agendaKecil: { gap: 3, backgroundColor: '#FBF3DF', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#EAD9AF' },
  kajian: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: W.kartu, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: W.garis },
  kajianAktif: { backgroundColor: W.malam, borderColor: W.malam },
  kolomJam: { width: 66, alignItems: 'flex-start' },
  jamBesar: { ...F.display(700), fontSize: 22, lineHeight: 26, color: W.tinta, fontVariant: ['tabular-nums'] },
  jamKecil: { ...F.body(500), fontSize: 12, lineHeight: 16, color: W.tinta2 },
  patokan: { ...F.body(600), fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: W.kuningan },
  judul: { ...F.display(600), fontSize: 18, lineHeight: 23, color: W.tinta },
  kitab: { ...F.body(400), fontSize: 13, color: W.kuningan },
  pengisi: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kecil: { ...F.body(400), fontSize: 13, lineHeight: 18, color: W.tinta2, flex: 1 },
  materi: { ...F.body(500), fontSize: 13, lineHeight: 18, color: W.nila },
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
