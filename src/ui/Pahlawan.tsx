import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BULAN_HIJRIAH, hijriah, teksHijriah } from '@/lib/hijriah';
import { jadwalHari, NAMA_WAKTU, salatBerikutnya, LOKASI } from '@/lib/salat';
import { useSekarang } from '@/lib/sekarang';
import { durasiKata, HARI, hariDalamPekan, jam, kunciTgl, mundur, tambahHari, tanggalPendek, tglWib } from '@/lib/waktu';
import { Arab } from './Teks';
import { F, W } from './tema';
import { faseDari, LANGIT, Ufuk } from './Ufuk';

/** Kartu utama beranda: hitung mundur ke salat berikutnya di atas busur ufuk. */
export function Pahlawan({ koreksi }: { koreksi: number }) {
  const now = useSekarang(1000);
  const hari = now ? tglWib(now) : null;
  const k = hari ? kunciTgl(hari) : '';
  const data = useMemo(() => {
    if (!hari) return null;
    return { kemarin: jadwalHari(tambahHari(hari, -1)), ini: jadwalHari(hari), besok: jadwalHari(tambahHari(hari, 1)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);
  const b = now && hari ? salatBerikutnya(now, hari) : null;
  // Hari Jumat: Zuhur diganti salat Jumat (azan pada waktu Zuhur).
  const jumat = !!(b && hari && b.kunci === 'zuhur' && !b.besok && hariDalamPekan(hari) === 5);
  const namaB = b ? (jumat ? 'salat Jumat' : NAMA_WAKTU[b.kunci].label) : '';
  const arabB = b ? (jumat ? 'الجمعة' : NAMA_WAKTU[b.kunci].arab) : '';
  const fase = faseDari(now, data?.ini ?? null);
  const L = LANGIT[fase];
  const h = hari ? hijriah(hari, koreksi) : null;
  const setelahMagrib = !!(now && data && now.getTime() >= data.ini.magrib.getTime());
  const hBesok = hari && setelahMagrib ? hijriah(tambahHari(hari, 1), koreksi) : null;
  const menit = now ? Math.floor(now.getTime() / 60000) : 0;
  const ringkasan = useMemo(
    () => (b ? `Berikutnya ${namaB}${b.besok ? ' besok' : ''} pukul ${jam(b.waktu)} WIB, ${durasiKata(b.waktu.getTime() - (now?.getTime() ?? 0))} lagi.` : 'Menghitung jadwal salat hari ini.'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [b?.kunci, menit],
  );

  return (
    <View style={[g.kartu, { backgroundColor: L.atas }]}>
      <View style={g.atas} role="group" aria-label={ringkasan}>
        <View style={g.barisLabel}>
          <Text style={g.label} aria-hidden>
            {b ? `Menuju ${namaB}${b.besok ? ' · besok' : ''}` : 'Salat berikutnya'}
          </Text>
          {b && (
            <Arab style={g.arab} aria-hidden>
              {arabB}
            </Arab>
          )}
        </View>
        <Text style={g.hitung} aria-hidden>
          {b ? mundur(b.waktu.getTime() - (now?.getTime() ?? 0)) : '--:--:--'}
        </Text>
        <Text style={g.pukul} aria-hidden>
          {b ? `${jumat ? 'Azan Jumat' : NAMA_WAKTU[b.kunci].label} pukul ${jam(b.waktu)} WIB · ${LOKASI.nama}` : `Jadwal salat ${LOKASI.nama} · WIB`}
        </Text>
      </View>
      <View style={g.busur}>
        <Ufuk now={now} kemarin={data?.kemarin ?? null} hariIni={data?.ini ?? null} besok={data?.besok ?? null} berikut={b?.kunci ?? null} fase={fase} />
      </View>
      <View style={g.tanggal}>
        <View style={{ flex: 1 }}>
          <Text style={g.tglH}>{h ? teksHijriah(h) : 'Tanggal Hijriah'}</Text>
          <Text style={g.tglKecil}>{hBesok ? `Sejak Magrib: ${hBesok.d} ${BULAN_HIJRIAH[hBesok.m - 1]}` : 'Perkiraan kalender Ummul Qura'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={g.tglM}>{hari ? `${HARI[hariDalamPekan(hari)]}, ${tanggalPendek(hari)}` : 'Hari ini'}</Text>
          <Text style={g.tglKecil}>{hari ? `${hari.y} M · WIB` : 'WIB'}</Text>
        </View>
      </View>
    </View>
  );
}

const g = StyleSheet.create({
  kartu: { borderRadius: 28, overflow: 'hidden' },
  atas: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4 },
  barisLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 26 },
  label: { ...F.body(600), fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', color: W.emas },
  arab: { color: W.emas, fontSize: 18, lineHeight: 26 },
  hitung: { ...F.body(500), fontSize: 50, lineHeight: 58, color: W.krem, fontVariant: ['tabular-nums'], letterSpacing: -1, marginTop: 2 },
  pukul: { ...F.body(400), fontSize: 14, lineHeight: 20, color: W.kremRedup },
  busur: { width: '100%', aspectRatio: 360 / 200, marginTop: -6 },
  tanggal: { flexDirection: 'row', backgroundColor: '#0B1022', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14, gap: 12 },
  tglH: { ...F.display(600), fontSize: 18, lineHeight: 24, color: W.krem },
  tglM: { ...F.body(500), fontSize: 14, lineHeight: 24, color: W.krem },
  tglKecil: { ...F.body(400), fontSize: 12, lineHeight: 17, color: W.kremRedup },
  pukulBaris: { height: 20 },
});
