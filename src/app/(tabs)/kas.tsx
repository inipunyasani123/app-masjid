import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MASJID } from '@/lib/data';
import { laporanKas, menungguRekapJumat, type LaporanBulan } from '@/lib/kas';
import { meta } from '@/lib/meta';
import { useHariIni } from '@/lib/sekarang';
import { BULAN, BULAN_PENDEK, jumlahHari, kunciTgl, rupiah, rupiahRingkas, tanggalPendek } from '@/lib/waktu';
import { Bagian, Kartu, Layar } from '@/ui/Komponen';
import { Label, Redup, Teks, Text } from '@/ui/Teks';
import { F, W } from '@/ui/tema';

export function generateMetadata() {
  return meta(
    '/kas',
    'Laporan Kas Masjid Terbuka | Nurul Ufuk',
    'Contoh laporan kas masjid yang transparan: saldo, pemasukan kotak amal dan infak, pengeluaran listrik, honor, renovasi. Semua angka rekaan untuk demo.',
  );
}

// Warna seri grafik (lolos uji buta warna): masuk = biru, keluar = jingga. Teks tetap memakai warna tinta.
const BIRU = '#2D4F9E';
const JINGGA = '#C26A1E';

export default function Kas() {
  const { now, hari } = useHariIni();
  const ketuk = now ? Math.floor(now.getTime() / 300000) : 0; // segarkan tiap 5 menit agar entri hari ini muncul tepat waktu
  const lap = useMemo(() => (now ? laporanKas(now, 6) : null), [hari ? kunciTgl(hari) : '', ketuk]); // eslint-disable-line react-hooks/exhaustive-deps
  const menunggu = now ? menungguRekapJumat(now) : false;
  const [pilih, setPilih] = useState<number | null>(null);
  const idx = lap ? (pilih ?? lap.length - 1) : 0;
  const b = lap?.[idx];
  const [semua, setSemua] = useState(false);

  return (
    <Layar label="Terbuka untuk semua jemaah" judul="Laporan kas" sub={`${MASJID.bendahara}. Diperiksa dua perwakilan jemaah setiap akhir bulan.`}>
      <Kartu nada="malam" style={g.ringkas}>
        <Label style={{ color: W.emas }}>{b ? (b.berjalan ? `Saldo per ${tanggalPendek(hari!)} ${hari!.y}` : `Saldo akhir ${BULAN[b.m - 1]} ${b.y}`) : 'Saldo kas'}</Label>
        <Text style={g.saldo} maksSkala={1.1}>
          {b ? rupiah(b.saldoAkhir) : 'Rp—'}
        </Text>
        <View style={g.tigaKolom}>
          <Angka label="Saldo awal" nilai={b ? rupiahRingkas(b.saldoAwal) : '…'} />
          <Angka label="Masuk" nilai={b ? `+${rupiahRingkas(b.masuk)}` : '…'} />
          <Angka label="Keluar" nilai={b ? `−${rupiahRingkas(b.keluar)}` : '…'} />
        </View>
      </Kartu>

      <Bagian judul="Enam bulan terakhir">
        <Kartu style={{ gap: 12 }}>
          <View style={g.legenda}>
            <Legenda warna={BIRU} teks="Pemasukan" />
            <Legenda warna={JINGGA} teks="Pengeluaran" />
          </View>
          {lap ? <Grafik lap={lap} aktif={idx} onPilih={setPilih} /> : <View style={{ height: 167 }} />}
          <Redup style={{ fontSize: 12 }}>Ketuk bulan untuk melihat rinciannya.</Redup>
        </Kartu>
        <Kartu nada="krem" style={{ gap: 6 }}>
          <Teks style={{ ...F.body(600) }}>Catatan</Teks>
          <Redup>
            Angka di laporan ini rekaan untuk demo dan diperbarui otomatis mengikuti tanggal; infak simulasi tidak masuk laporan. Pada aplikasi sungguhan,
            bendahara mengisi transaksi dari panel takmir dan jemaah melihat hasilnya di sini.
          </Redup>
        </Kartu>
      </Bagian>

      {b && (
        <>
          <Bagian judul={`Rincian ${BULAN[b.m - 1]}${b.berjalan ? ' (berjalan)' : ''}`}>
            <Redup style={{ marginTop: -4 }}>
              {b.berjalan
                ? 'Bulan berjalan: diperiksa perwakilan jemaah di akhir bulan.'
                : `Diperiksa ${jumlahHari(b.y, b.m)} ${BULAN[b.m - 1]} ${b.y} oleh bendahara dan 2 perwakilan jemaah.`}
            </Redup>
            <Kartu style={{ gap: 10 }}>
              {b.kategori.map((k) => {
                const total = k.masuk ? b.masuk : b.keluar;
                const p = total ? k.jumlah / total : 0;
                return (
                  <View key={(k.masuk ? '+' : '-') + k.nama} style={{ gap: 4 }}>
                    <View style={g.katBaris}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <View style={[g.kotak, { backgroundColor: k.masuk ? BIRU : JINGGA }]} />
                        <Teks style={{ fontSize: 14, flexShrink: 1 }}>{k.nama}</Teks>
                      </View>
                      <Text style={g.katAngka}>
                        {k.masuk ? '+' : '−'}
                        {rupiah(k.jumlah)}
                      </Text>
                    </View>
                    <View style={g.batangLatar} aria-hidden>
                      <View style={[g.batangIsi, { width: `${Math.max(2, p * 100)}%`, backgroundColor: k.masuk ? BIRU : JINGGA }]} />
                    </View>
                  </View>
                );
              })}
            </Kartu>
          </Bagian>

          <Bagian judul="Transaksi">
            <View role="list" style={g.daftar}>
              {b.berjalan && menunggu && (
                <View role="listitem" style={[g.entri, { backgroundColor: '#FBF3DF' }]}>
                  <View style={g.entriTgl}>
                    <Text style={g.entriD}>{hari!.d}</Text>
                    <Text style={g.entriM}>{BULAN_PENDEK[hari!.m - 1]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Teks style={{ fontSize: 14, lineHeight: 20 }}>Kotak amal Jumat hari ini</Teks>
                    <Redup style={{ fontSize: 12 }}>Menunggu rekap bakda Jumat (±13.00 WIB)</Redup>
                  </View>
                  <Text style={[g.entriAngka, { color: W.tinta2 }]}>Rp—</Text>
                </View>
              )}
              {(semua ? b.entri : b.entri.slice(-10)).slice().reverse().map((e, i) => (
                <View key={i} role="listitem" style={g.entri}>
                  <View style={g.entriTgl}>
                    <Text style={g.entriD}>{e.tgl.d}</Text>
                    <Text style={g.entriM}>{BULAN_PENDEK[e.tgl.m - 1]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Teks style={{ fontSize: 14, lineHeight: 20 }}>{e.ket}</Teks>
                    <Redup style={{ fontSize: 12 }}>{e.kategori}</Redup>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <Text style={g.entriAngka}>
                      {e.masuk ? '+' : '−'}
                      {rupiah(e.jumlah)}
                    </Text>
                    <View style={[g.titik, { backgroundColor: e.masuk ? BIRU : JINGGA }]} aria-hidden />
                  </View>
                </View>
              ))}
            </View>
            {b.entri.length > 10 && (
              <Pressable role="button" onPress={() => setSemua((x) => !x)} style={g.lagi}>
                <Text style={g.lagiTeks}>{semua ? 'Tampilkan 10 terakhir' : `Tampilkan semua (${b.entri.length})`}</Text>
              </Pressable>
            )}
          </Bagian>
        </>
      )}

    </Layar>
  );
}

function Angka({ label, nilai }: { label: string; nilai: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={g.angkaLabel}>{label}</Text>
      <Text style={g.angkaNilai}>{nilai}</Text>
    </View>
  );
}

function Legenda({ warna, teks }: { warna: string; teks: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={[g.kotak, { backgroundColor: warna }]} />
      <Text style={g.legendaTeks}>{teks}</Text>
    </View>
  );
}

function Grafik({ lap, aktif, onPilih }: { lap: LaporanBulan[]; aktif: number; onPilih: (i: number) => void }) {
  const maks = Math.max(...lap.map((x) => Math.max(x.masuk, x.keluar)), 1);
  const TINGGI = 130;
  return (
    <View role="radiogroup" aria-label="Pilih bulan laporan" style={g.grafik}>
      {lap.map((x, i) => {
        const on = i === aktif;
        return (
          <Pressable
            key={`${x.y}-${x.m}`}
            role="radio"
            aria-checked={on}
            aria-label={`${BULAN[x.m - 1]} ${x.y}: masuk ${rupiah(x.masuk)}, keluar ${rupiah(x.keluar)}`}
            onPress={() => onPilih(i)}
            style={[g.kolom, on && g.kolomAktif]}
          >
            <View style={[g.batangWadah, { height: TINGGI }]}>
              <View style={[g.batang, { height: Math.max(2, (x.masuk / maks) * TINGGI), backgroundColor: BIRU }]} />
              <View style={[g.batang, { height: Math.max(2, (x.keluar / maks) * TINGGI), backgroundColor: JINGGA }]} />
            </View>
            <Text style={[g.kolomTeks, on && { ...F.body(600), color: W.tinta }]}>{BULAN_PENDEK[x.m - 1]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const g = StyleSheet.create({
  ringkas: { gap: 6, padding: 18, borderRadius: 24 },
  saldo: { ...F.display(700), fontSize: 36, lineHeight: 44, color: W.krem },
  tigaKolom: { flexDirection: 'row', gap: 10, marginTop: 8, borderTopWidth: 1, borderTopColor: '#2D3756', paddingTop: 12 },
  angkaLabel: { ...F.body(400), fontSize: 12, color: W.kremRedup },
  angkaNilai: { ...F.body(600), fontSize: 14, color: W.krem, fontVariant: ['tabular-nums'] },
  legenda: { flexDirection: 'row', gap: 16 },
  legendaTeks: { ...F.body(500), fontSize: 13, color: W.tinta },
  kotak: { width: 10, height: 10, borderRadius: 3 },
  grafik: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, borderBottomWidth: 1, borderBottomColor: W.garisTua },
  kolom: { flex: 1, alignItems: 'center', gap: 6, paddingTop: 6, paddingBottom: 6, borderRadius: 12, minHeight: 44 },
  kolomAktif: { backgroundColor: W.kartu2 },
  batangWadah: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  batang: { width: 12, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  kolomTeks: { ...F.body(400), fontSize: 12, color: W.tinta2 },
  katBaris: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  katAngka: { ...F.body(600), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
  batangLatar: { height: 6, borderRadius: 3, backgroundColor: W.kartu2, overflow: 'hidden' },
  batangIsi: { height: 6, borderRadius: 3 },
  daftar: { backgroundColor: W.kartu, borderRadius: 20, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' },
  entri: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#EFE7D8' },
  entriTgl: { width: 34, alignItems: 'center' },
  entriD: { ...F.display(700), fontSize: 18, lineHeight: 22, color: W.tinta },
  entriM: { ...F.body(500), fontSize: 12, color: W.tinta2 },
  entriAngka: { ...F.body(600), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
  titik: { width: 8, height: 8, borderRadius: 4 },
  lagi: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 1.5, borderColor: W.tinta, marginTop: 4 },
  lagiTeks: { ...F.body(600), fontSize: 14, color: W.tinta },
});
