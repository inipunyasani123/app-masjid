import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { hijriah } from '@/lib/hijriah';
import { jadwalHari } from '@/lib/salat';
import { useSimpan } from '@/lib/simpan';
import { durasiKata, HARI_PENDEK, hariDalamPekan, jam, tambahHari, tanggalPendek, type Tgl } from '@/lib/waktu';
import { Ikon } from './Ikon';
import { Bagian, Kartu, Tautan, Tombol } from './Komponen';
import { Label, Redup, Teks, Text } from './Teks';
import { F, W } from './tema';

const FONT = Platform.OS === 'web' ? 'Readex, system-ui, sans-serif' : 'ReadexPro-Medium';
const bulat5 = (d: Date, tambah: number) => new Date(Math.ceil((d.getTime() + tambah * 60000) / 300000) * 300000);

/** Pratinjau mode Ramadan: busur imsak→magrib, kegiatan harian, imsakiyah pekan pertama, pelacak tadarus. */
export function PratinjauRamadan({ awal, hari, now, koreksi }: { awal: Tgl; hari: Tgl; now: Date; koreksi: number }) {
  const j = jadwalHari(awal);
  const sedangRamadan = hijriah(hari, koreksi).m === 9;
  const jIni = sedangRamadan ? jadwalHari(hari) : j;
  const lama = jIni.magrib.getTime() - jIni.subuh.getTime();
  const tarawih = bulat5(jIni.isya, 15);
  const tadarus = bulat5(tarawih, 60);
  const takjil = bulat5(jIni.asar, 30);
  const [tadarusJuz, setJuz] = useSimpan<number>('tadarus', 0);

  // Busur: imsak (kiri) → magrib (kanan); posisi matahari hanya saat Ramadan berjalan.
  const t0 = jIni.imsak.getTime(), t1 = jIni.magrib.getTime();
  const titik = (d: Date) => {
    const f = Math.min(1, Math.max(0, (d.getTime() - t0) / (t1 - t0)));
    const a = Math.PI * (1 - f);
    return { x: 160 + 130 * Math.cos(a), y: 104 - 80 * Math.sin(a) };
  };
  const tanda = [
    { n: 'Imsak', d: jIni.imsak },
    { n: 'Subuh', d: jIni.subuh },
    { n: 'Zuhur', d: jIni.zuhur },
    { n: 'Asar', d: jIni.asar },
    { n: 'Buka', d: jIni.magrib },
  ];
  const matahari = sedangRamadan && now.getTime() > t0 && now.getTime() < t1 ? titik(now) : null;

  return (
    <>
      <Bagian judul={sedangRamadan ? 'Hari ini di bulan Ramadan' : 'Pratinjau hari pertama'}>
        <Kartu nada="malam" style={{ gap: 6, paddingBottom: 8 }}>
          <Label style={{ color: W.emas }}>{sedangRamadan ? 'Puasa hari ini' : `Perkiraan ${HARI_PENDEK[hariDalamPekan(awal)]} ${tanggalPendek(awal)}`}</Label>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={g.kecilMalam}>Imsak</Text>
              <Text style={g.jamBesar}>{jam(jIni.imsak)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={g.kecilMalam}>Buka (Magrib)</Text>
              <Text style={g.jamBesar}>{jam(jIni.magrib)}</Text>
            </View>
          </View>
          <View style={{ aspectRatio: 320 / 120, width: '100%' }} aria-hidden>
            <Svg viewBox="0 0 320 120" width="100%" height="100%">
              <Path d="M30 104 A130 80 0 0 1 290 104" stroke={W.krem} strokeOpacity={0.45} strokeWidth={1.2} strokeDasharray="2 5" fill="none" />
              <Path d="M0 104 H320" stroke={W.emas} strokeOpacity={0.55} strokeWidth={1} />
              <Path d="M140 104 V92 H180 V104 Z M132 94 L160 82 L188 94 Z M142 84 L160 75 L178 84 Z M150 76 L160 69 L170 76 Z" fill="#0B1022" />
              {tanda.map((x) => {
                const p = titik(x.d);
                return (
                  <SvgText key={x.n} x={p.x} y={x.n === 'Imsak' || x.n === 'Buka' ? p.y + 14 : p.y - 8} fill={W.krem} fontSize={9.5} fontFamily={FONT} textAnchor="middle">
                    {x.n}
                  </SvgText>
                );
              })}
              {tanda.map((x) => {
                const p = titik(x.d);
                return <Circle key={`t-${x.n}`} cx={p.x} cy={p.y} r={2.8} fill={x.n === 'Buka' ? W.emas : W.krem} />;
              })}
              {matahari && <Circle cx={matahari.x} cy={matahari.y} r={7} fill="#F6CF7A" />}
            </Svg>
          </View>
          <Text style={g.kecilMalam}>Lama puasa (Subuh–Magrib) ± {durasiKata(lama)}. Jam dihitung dari jadwal salat aplikasi untuk Tulungagung.</Text>
        </Kartu>
      </Bagian>

      <Bagian judul="Kegiatan harian">
        <Kartu style={{ gap: 8 }}>
          <Baris jam={jam(takjil)} judul="Pembagian takjil" isi="Bakda Asar di serambi, oleh relawan takjil" />
          <Baris jam={jam(jIni.magrib)} judul="Buka puasa dan salat Magrib" isi="Kurma dan air putih disediakan" />
          <Baris jam={jam(tarawih)} judul="Salat Isya dan Tarawih berjemaah" isi="Ruang utama dan serambi" />
          <Baris jam={jam(tadarus)} judul="Tadarus Al-Qur'an" isi="Bakda Tarawih, bergiliran per kelompok" />
        </Kartu>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Tautan href="/infak?program=takjil" style={g.tautanKotak}>
            <Text style={g.tautanTeks}>Infak takjil</Text>
            <Ikon nama="kanan" ukuran={16} warna={W.nila} />
          </Tautan>
          <Tautan href="/daftar?kegiatan=ramadan" style={g.tautanKotak}>
            <Text style={g.tautanTeks}>Jadi relawan</Text>
            <Ikon nama="kanan" ukuran={16} warna={W.nila} />
          </Tautan>
        </View>
      </Bagian>

      <Bagian judul="Imsakiyah pekan pertama">
        <View role="table" aria-label="Imsakiyah tujuh hari pertama Ramadan" style={g.tabel}>
          <View role="row" style={[g.baris, g.kepala]}>
            {['Tanggal', 'Imsak', 'Subuh', 'Buka'].map((x) => (
              <Text key={x} role="columnheader" style={[g.sel, g.kepalaTeks, x === 'Tanggal' && g.selKiri]}>
                {x}
              </Text>
            ))}
          </View>
          {Array.from({ length: 7 }, (_, i) => {
            const t = tambahHari(awal, i);
            const jj = jadwalHari(t);
            return (
              <View key={i} role="row" style={[g.baris, i % 2 === 1 && { backgroundColor: '#F8F3E9' }]}>
                <Text role="rowheader" style={[g.sel, g.selKiri, g.isi]}>
                  {`${i + 1} Ram · ${tanggalPendek(t)}`}
                </Text>
                <Text role="cell" style={[g.sel, g.isi]}>{jam(jj.imsak)}</Text>
                <Text role="cell" style={[g.sel, g.isi]}>{jam(jj.subuh)}</Text>
                <Text role="cell" style={[g.sel, g.isi]}>{jam(jj.magrib)}</Text>
              </View>
            );
          })}
        </View>
        <Redup style={{ fontSize: 13 }}>Tanggal perkiraan; awal Ramadan resmi mengikuti sidang isbat Kementerian Agama.</Redup>
      </Bagian>

      <Bagian judul="Pelacak tadarus">
        <Kartu style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={g.juz}>Juz {tadarusJuz}/30</Text>
            <Redup style={{ fontSize: 12 }}>{sedangRamadan ? 'Tersimpan di perangkat' : 'Aktif saat Ramadan'}</Redup>
          </View>
          <View style={g.segmen} aria-hidden>
            {Array.from({ length: 30 }, (_, i) => (
              <View key={i} style={[g.ruas, i < tadarusJuz && { backgroundColor: W.zaitun }]} />
            ))}
          </View>
          {sedangRamadan ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Tombol varian="garis" ikon="kurang" style={{ flex: 1 }} label="Kurangi satu juz" nonaktif={tadarusJuz <= 0} onPress={() => setJuz(Math.max(0, tadarusJuz - 1))}>
                Kurangi
              </Tombol>
              <Tombol ikon="tambah" style={{ flex: 1 }} label="Tambah satu juz" nonaktif={tadarusJuz >= 30} onPress={() => setJuz(Math.min(30, tadarusJuz + 1))}>
                Tambah juz
              </Tombol>
            </View>
          ) : (
            <Teks style={{ fontSize: 14, lineHeight: 21 }}>Pelacak bisa dipakai mulai 1 Ramadan (perkiraan {tanggalPendek(awal)} {awal.y}).</Teks>
          )}
        </Kartu>
      </Bagian>
    </>
  );
}

function Baris({ jam: j, judul, isi }: { jam: string; judul: string; isi: string }) {
  return (
    <View style={g.kegiatan}>
      <Text style={g.kegiatanJam}>{j}</Text>
      <View style={{ flex: 1 }}>
        <Text style={g.kegiatanJudul}>{judul}</Text>
        <Redup style={{ fontSize: 13 }}>{isi}</Redup>
      </View>
    </View>
  );
}

const g = StyleSheet.create({
  kecilMalam: { ...F.body(400), fontSize: 13, lineHeight: 18, color: W.kremRedup },
  jamBesar: { ...F.display(700), fontSize: 30, lineHeight: 36, color: W.krem, fontVariant: ['tabular-nums'] },
  kegiatan: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 4 },
  kegiatanJam: { ...F.display(700), fontSize: 18, lineHeight: 24, color: W.kuningan, width: 58, fontVariant: ['tabular-nums'] },
  kegiatanJudul: { ...F.body(600), fontSize: 15, lineHeight: 21, color: W.tinta },
  tautanKotak: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: W.garis, backgroundColor: W.kartu },
  tautanTeks: { ...F.body(600), fontSize: 14, color: W.nila },
  tabel: { backgroundColor: W.kartu, borderRadius: 20, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' },
  baris: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 10 },
  kepala: { backgroundColor: W.kartu2 },
  kepalaTeks: { ...F.body(600), fontSize: 12, color: W.tinta2 },
  sel: { flex: 1, textAlign: 'center' },
  selKiri: { flex: 1.6, textAlign: 'left' },
  isi: { ...F.body(500), fontSize: 14, color: W.tinta, fontVariant: ['tabular-nums'] },
  juz: { ...F.display(700), fontSize: 24, lineHeight: 30, color: W.tinta, fontVariant: ['tabular-nums'] },
  segmen: { flexDirection: 'row', gap: 2 },
  ruas: { flex: 1, height: 10, borderRadius: 2, backgroundColor: W.kartu2 },
});
