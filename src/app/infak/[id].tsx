import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AGENDA, PROGRAM_INFAK } from '@/lib/data';
import { terkumpulProgram } from '@/lib/infak';
import { laporanKas, rincianRenovasi, TAHAP_RENOVASI } from '@/lib/kas';
import { tanggalAgenda } from '@/lib/kegiatan';
import { meta, potong } from '@/lib/meta';
import { useHariIni } from '@/lib/sekarang';
import { type RiwayatInfak, useSimpan } from '@/lib/simpan';
import { BULAN, kunciTgl, rupiah, rupiahRingkas, tanggalPanjang, tanggalPendek } from '@/lib/waktu';
import { Ikon } from '@/ui/Ikon';
import { Bagian, Kartu, Layar, Tautan, Tombol } from '@/ui/Komponen';
import { Label, Redup, Teks, Text } from '@/ui/Teks';
import { TidakDitemukan } from '@/ui/TidakDitemukan';
import { F, W } from '@/ui/tema';
import { VisualProgram } from '@/ui/VisualProgram';

export function generateStaticParams() {
  return PROGRAM_INFAK.map((p) => ({ id: p.id }));
}

export function generateMetadata(_req: unknown, params: Record<string, string | string[]>) {
  const p = PROGRAM_INFAK.find((x) => x.id === params.id);
  if (!p) return meta('/404', 'Halaman tidak ditemukan | Nurul Ufuk', 'Halaman ini tidak ada.', { noindex: true });
  return meta(`/infak/${p.id}`, potong(`${p.judul} · Program Infak | Nurul Ufuk`, 60), potong(`${p.ringkas} Rincian dana dan kabar terbaru program infak (simulasi) Masjid Nurul Ufuk.`, 155));
}

export default function DetailProgram() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const p = PROGRAM_INFAK.find((x) => x.id === id);
  const { now, hari } = useHariIni();
  const [riwayat] = useSimpan<RiwayatInfak[]>('infak', []);
  const data = useMemo(() => {
    if (!p || !now || !hari) return null;
    const lap = laporanKas(now, 12);
    const ini = lap[lap.length - 1];
    return {
      terkumpul: terkumpulProgram(p, now),
      renovasi: p.id === 'wudu' ? rincianRenovasi(now, p.dasar ?? 0) : null,
      rutin: ini.kategori.filter((k) => !k.masuk && k.nama !== 'Renovasi' && k.nama !== 'Santunan'),
      bulanIni: ini,
      santunan: lap.flatMap((l) => l.entri.filter((e) => e.kategori === 'Santunan')).reverse(),
      santunanBerikut: tanggalAgenda(AGENDA.find((a) => a.id === 'santunan')!, hari),
    };
  }, [p?.id, hari ? kunciTgl(hari) : '', now ? Math.floor(now.getTime() / 300000) : 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return <TidakDitemukan />;
  const milikku = riwayat.filter((r) => r.program === p.id).reduce((a, r) => a + r.nominal, 0);
  const total = data?.terkumpul != null ? data.terkumpul + milikku : null;
  const persen = total != null && p.target ? Math.min(100, Math.round((total / p.target) * 100)) : 0;

  return (
    <Layar
      kembali
      label="Program infak"
      judul={p.judul}
      bawah={
        <Tombol onPress={() => router.push(`/infak?program=${p.id}`)} ikon="kanan">
          Infak untuk program ini
        </Tombol>
      }
    >
      <View style={{ marginBottom: 14 }}>
        <VisualProgram p={p} tegak={false} latar={W.kertas} />
      </View>

      <Kartu nada="malam" style={{ gap: 8 }}>
        {p.target ? (
          <>
            <Label style={{ color: W.emas }}>Terkumpul</Label>
            <Text style={g.besar}>{total != null ? rupiah(total) : 'Rp—'}</Text>
            <View style={g.progres} aria-hidden>
              <View style={[g.progresIsi, { width: `${persen}%` }]} />
            </View>
            <Text style={g.kecilMalam}>
              {persen}% dari target {rupiah(p.target)}
              {milikku ? ` · termasuk infak simulasimu ${rupiahRingkas(milikku)}` : ''}
            </Text>
          </>
        ) : (
          <>
            <Label style={{ color: W.emas }}>{p.id === 'santunan' ? 'Penyaluran berikutnya' : 'Kebutuhan rutin bulan ini'}</Label>
            <Text style={g.besar}>
              {p.id === 'santunan'
                ? data?.santunanBerikut
                  ? tanggalPendek(data.santunanBerikut.tgl)
                  : '—'
                : data
                  ? rupiah(data.rutin.reduce((a, k) => a + k.jumlah, 0))
                  : 'Rp—'}
            </Text>
            <Text style={g.kecilMalam}>
              {p.id === 'santunan' ? 'Ahad pertama tiap triwulan, bakda Asar di serambi selatan' : `Pengeluaran tercatat sampai hari ini, ${hari ? BULAN[hari.m - 1] : ''}`}
            </Text>
          </>
        )}
      </Kartu>

      <Bagian judul="Tentang program">
        <View style={{ gap: 10 }}>
          {p.isi.map((x) => (
            <Teks key={x}>{x}</Teks>
          ))}
        </View>
      </Bagian>

      {p.id === 'wudu' && data?.renovasi && (
        <>
          <Bagian judul="Kabar renovasi">
            <View role="list" style={g.garisWaktu}>
              {TAHAP_RENOVASI.map((t, i) => {
                const m = data.renovasi!.material[i];
                const k = data.renovasi!.kampanye;
                const idx = k.y * 12 + k.m - 1 + i;
                const bulan = BULAN[idx % 12];
                const selesai = !!m;
                return (
                  <View key={t} role="listitem" style={g.tahap}>
                    <View style={g.tahapTanda}>
                      <View style={[g.bulatan, selesai ? g.bulatanSelesai : g.bulatanTunggu]}>{selesai && <Ikon nama="centang" ukuran={14} warna={W.krem} tebal={2.4} />}</View>
                      {i < TAHAP_RENOVASI.length - 1 && <View style={g.garis} />}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 16, gap: 2 }}>
                      <Text style={g.tahapTgl}>{selesai ? tanggalPanjang(m.tgl) : `Perkiraan ${bulan} ${Math.floor(idx / 12)} · menunggu dana`}</Text>
                      <Text style={g.tahapJudul}>
                        Tahap {i + 1}: {t}
                      </Text>
                      <Redup>{selesai ? `Belanja material ${rupiah(m.jumlah)} (laporan kas, kategori Renovasi)` : 'Dikerjakan setelah dana tahap ini terkumpul.'}</Redup>
                    </View>
                  </View>
                );
              })}
            </View>
          </Bagian>
          <Bagian judul="Penggunaan dana">
            <Kartu style={{ gap: 8 }}>
              <Baris label="Terkumpul (termasuk saldo awal program)" isi={rupiah(data.renovasi.terkumpul)} />
              <Baris label="Sudah dibelanjakan material" isi={`−${rupiah(data.renovasi.terpakai)}`} />
              <Baris label="Sisa dana program" isi={rupiah(data.renovasi.terkumpul - data.renovasi.terpakai)} tebal />
              <Redup style={{ fontSize: 13 }}>
                {data.renovasi.donasi.length} kali rekap donasi sejak {BULAN[data.renovasi.kampanye.m - 1]} {data.renovasi.kampanye.y}, tiap tanggal 12 dan 26.
              </Redup>
            </Kartu>
          </Bagian>
        </>
      )}

      {p.id === 'operasional' && data && (
        <Bagian judul="Rincian bulan ini">
          <Kartu style={{ gap: 8 }}>
            {data.rutin.map((k) => (
              <Baris key={k.nama} label={k.nama} isi={rupiah(k.jumlah)} />
            ))}
            <Redup style={{ fontSize: 13 }}>Angka sama dengan laporan kas bulan {BULAN[data.bulanIni.m - 1]}.</Redup>
          </Kartu>
        </Bagian>
      )}

      {p.id === 'santunan' && data && (
        <Bagian judul="Penyaluran terakhir">
          <Kartu style={{ gap: 8 }}>
            {data.santunan.slice(0, 4).map((e) => (
              <Baris key={kunciTgl(e.tgl)} label={tanggalPanjang(e.tgl)} isi={rupiah(e.jumlah)} />
            ))}
            {!data.santunan.length && <Redup>Belum ada penyaluran dalam 12 bulan terakhir.</Redup>}
          </Kartu>
        </Bagian>
      )}

      {p.id === 'takjil' && (
        <Tautan href="/agenda/ramadan" style={g.tautan}>
          <Text style={g.tautanTeks}>Lihat persiapan Ramadan</Text>
          <Ikon nama="kanan" ukuran={16} warna={W.nila} />
        </Tautan>
      )}

      <Tautan href="/kas" style={g.tautan}>
        <Text style={g.tautanTeks}>Buka laporan kas lengkap</Text>
        <Ikon nama="kanan" ukuran={16} warna={W.nila} />
      </Tautan>
      <Redup style={{ fontSize: 12 }}>Semua angka rekaan untuk demo dan diambil dari laporan kas aplikasi ini.</Redup>
    </Layar>
  );
}

function Baris({ label, isi, tebal }: { label: string; isi: string; tebal?: boolean }) {
  return (
    <View style={g.baris}>
      <Text style={g.barisLabel}>{label}</Text>
      <Text style={[g.barisIsi, tebal && { ...F.body(600) }]}>{isi}</Text>
    </View>
  );
}

const g = StyleSheet.create({
  besar: { ...F.display(700), fontSize: 30, lineHeight: 36, color: W.krem, fontVariant: ['tabular-nums'] },
  progres: { height: 8, borderRadius: 4, backgroundColor: '#2D3756', overflow: 'hidden' },
  progresIsi: { height: 8, borderRadius: 4, backgroundColor: W.emas },
  kecilMalam: { ...F.body(400), fontSize: 13, lineHeight: 19, color: W.kremRedup },
  garisWaktu: { paddingTop: 4 },
  tahap: { flexDirection: 'row', gap: 12 },
  tahapTanda: { alignItems: 'center', width: 24 },
  bulatan: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bulatanSelesai: { backgroundColor: W.zaitun },
  bulatanTunggu: { borderWidth: 2, borderColor: W.garisTua, backgroundColor: W.kartu },
  garis: { width: 2, flex: 1, backgroundColor: W.garis, marginTop: 2 },
  tahapTgl: { ...F.body(500), fontSize: 12, color: W.tinta2 },
  tahapJudul: { ...F.body(600), fontSize: 15, lineHeight: 21, color: W.tinta },
  baris: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' },
  barisLabel: { ...F.body(400), fontSize: 14, lineHeight: 20, color: W.tinta2, flex: 1 },
  barisIsi: { ...F.body(500), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
  tautan: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'flex-start', marginTop: 12 },
  tautanTeks: { ...F.body(600), fontSize: 14, color: W.nila },
});
