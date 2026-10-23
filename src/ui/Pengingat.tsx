import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { KAJIAN } from '@/lib/data';
import { teksPatokan } from '@/lib/kegiatan';
import { type ModeSalat, MODE_TEKS, type Pengingat, PENGINGAT_KOSONG, pemicuHari } from '@/lib/pengingat';
import { jadwalHari, NAMA_WAKTU, URUTAN_SALAT, type KunciSalat } from '@/lib/salat';
import { useSekarang } from '@/lib/sekarang';
import { useSimpan } from '@/lib/simpan';
import { pratinjau, tutupLembar, usePratinjau } from '@/lib/tampilan';
import { hariDalamPekan, jam, kunciTgl, tglWib } from '@/lib/waktu';
import { Ikon } from './Ikon';
import { Saklar, Tombol } from './Komponen';
import { LembarBawah } from './LembarBawah';
import { Label, Redup, Text } from './Teks';
import { F, W } from './tema';

export function usePengingat() {
  return useSimpan<Pengingat>('pengingat', PENGINGAT_KOSONG);
}

/** Lonceng per waktu salat: sakelar cepat (mati ↔ saat azan). */
export function TombolLonceng({ kunci, label, gelap }: { kunci: KunciSalat; label: string; gelap?: boolean }) {
  const [p, setP] = usePengingat();
  const mode = p.salat[kunci];
  const aktif = !!mode;
  return (
    <Pressable
      role="switch"
      aria-checked={aktif}
      aria-label={`Pengingat ${label}${mode === '10' ? ', 10 menit sebelum' : ''}`}
      onPress={() => setP((l) => ({ ...l, salat: { ...l.salat, [kunci]: aktif ? undefined : 'azan' } }))}
      style={g.lonceng}
    >
      <Ikon nama="lonceng" ukuran={19} warna={gelap ? (aktif ? W.emas : W.kremRedup) : aktif ? W.kuningan : W.tinta2} isi={aktif ? (gelap ? W.emas : '#F2D9A2') : undefined} tebal={1.7} />
    </Pressable>
  );
}

function PilihMode({ kunci, label, waktu }: { kunci: KunciSalat; label: string; waktu: string }) {
  const [p, setP] = usePengingat();
  const nilai: ModeSalat | 'mati' = p.salat[kunci] ?? 'mati';
  const opsi: (ModeSalat | 'mati')[] = ['mati', 'azan', '10'];
  return (
    <View style={g.baris}>
      <View style={g.barisKepala}>
        <Text style={g.nama}>{label}</Text>
        <Text style={g.jam}>{waktu} WIB</Text>
      </View>
      <View role="radiogroup" aria-label={`Pengingat ${label}`} style={g.segmen}>
        {opsi.map((o) => {
          const on = o === nilai;
          return (
            <Pressable
              key={o}
              role="radio"
              aria-checked={on}
              onPress={() => setP((l) => ({ ...l, salat: { ...l.salat, [kunci]: o === 'mati' ? undefined : o } }))}
              style={[g.segmenItem, on && g.segmenAktif]}
            >
              <Text style={[g.segmenTeks, on && { color: W.krem }]}>{MODE_TEKS[o]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function LembarPengingat() {
  const now = useSekarang(60000);
  const hari = now ? tglWib(now) : null;
  const j = hari ? jadwalHari(hari) : null;
  const jumat = hari ? hariDalamPekan(hari) === 5 : false;
  const [p, setP] = usePengingat();
  return (
    <LembarBawah
      id="lembar-pengingat"
      judul="Pengingat"
      onTutup={tutupLembar}
      kaki={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Tombol
            varian="garis"
            style={{ flex: 1 }}
            onPress={() => {
              tutupLembar();
              const w = j ? jam(j.asar) : '';
              pratinjau.atur({ judul: 'Contoh: 10 menit lagi Asar', isi: `Azan Asar pukul ${w} WIB · begini bilah pengingat tampil` });
            }}
          >
            Coba pengingat
          </Tombol>
          <Tombol style={{ flex: 1 }} onPress={tutupLembar}>
            Selesai
          </Tombol>
        </View>
      }
    >
      <Redup>
        Tersimpan di perangkat ini. Di demo web, pengingat muncul sebagai bilah di dalam aplikasi saat waktunya tiba; di aplikasi Android/iOS dikirim sebagai
        notifikasi.
      </Redup>
      <Label>Waktu salat</Label>
      {URUTAN_SALAT.map((k) => (
        <PilihMode key={k} kunci={k} label={k === 'zuhur' && jumat ? 'Zuhur / Jumat' : NAMA_WAKTU[k].label} waktu={j ? jam(j[k]) : '--.--'} />
      ))}
      <Label style={{ marginTop: 6 }}>Jumat & kajian</Label>
      <Saklar nilai={p.jumat} onUbah={(v) => setP((l) => ({ ...l, jumat: v }))} label="Bersiap salat Jumat" keterangan="30 menit sebelum azan Jumat" />
      {KAJIAN.filter((k) => k.id !== 'tpq').map((k) => (
        <Saklar
          key={k.id}
          nilai={p.kajian.includes(k.id)}
          onUbah={(v) => setP((l) => ({ ...l, kajian: v ? [...l.kajian, k.id] : l.kajian.filter((x) => x !== k.id) }))}
          label={k.judul}
          keterangan={`${teksPatokan(k)} · 30 menit sebelum`}
        />
      ))}
    </LembarBawah>
  );
}

/** Bilah pengingat dalam aplikasi: muncul saat pemicu tiba (≤ 3 menit lewat) atau saat "Coba pengingat". */
export function BannerPengingat() {
  const now = useSekarang(5000);
  const [p] = usePengingat();
  const coba = usePratinjau();
  const tutup = useRef(new Set<string>());
  const [, segarkan] = useState(0);
  const hari = now ? tglWib(now) : null;
  const pemicu = useMemo(() => (hari ? pemicuHari(p, hari) : []), [p, hari ? kunciTgl(hari) : '']); // eslint-disable-line react-hooks/exhaustive-deps
  const aktif = now ? pemicu.find((x) => now.getTime() >= x.waktu.getTime() && now.getTime() - x.waktu.getTime() < 3 * 60000 && !tutup.current.has(x.id)) : undefined;
  const isi = coba ?? (aktif ? { judul: aktif.judul, isi: aktif.isi } : null);

  if (!isi) return null;
  return (
    <View style={g.banner} role="status" aria-live="polite">
      <View style={g.bannerIkon}>
        <Ikon nama="lonceng" ukuran={20} warna={W.malam} isi={W.malam} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={g.bannerJudul}>{isi.judul}</Text>
        <Text style={g.bannerIsi}>{isi.isi}</Text>
        <Text style={g.bannerKecil}>Pengingat simulasi · Masjid Nurul Ufuk</Text>
      </View>
      <Pressable
        role="button"
        aria-label="Tutup pengingat"
        onPress={() => {
          if (coba) pratinjau.atur(null);
          if (aktif) tutup.current.add(aktif.id);
          segarkan((x) => x + 1);
        }}
        style={g.bannerTutup}
      >
        <Ikon nama="silang" ukuran={18} warna={W.krem} />
      </Pressable>
    </View>
  );
}

const g = StyleSheet.create({
  lonceng: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  baris: { gap: 8, paddingVertical: 4 },
  barisKepala: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  nama: { ...F.display(600), fontSize: 18, lineHeight: 24, color: W.tinta },
  jam: { ...F.body(500), fontSize: 14, color: W.tinta2, fontVariant: ['tabular-nums'] },
  segmen: { flexDirection: 'row', backgroundColor: W.kartu2, borderRadius: 999, padding: 3, gap: 3 },
  segmenItem: { flex: 1, minHeight: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  segmenAktif: { backgroundColor: W.malam },
  segmenTeks: { ...F.body(600), fontSize: 13, color: W.tinta, textAlign: 'center' },
  banner: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    zIndex: 30,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: W.malam,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2D3756',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  bannerIkon: { width: 40, height: 40, borderRadius: 20, backgroundColor: W.emas, alignItems: 'center', justifyContent: 'center' },
  bannerJudul: { ...F.display(700), fontSize: 17, lineHeight: 22, color: W.krem },
  bannerIsi: { ...F.body(400), fontSize: 13, lineHeight: 18, color: W.krem },
  bannerKecil: { ...F.body(400), fontSize: 12, lineHeight: 16, color: W.kremRedup, marginTop: 2 },
  bannerTutup: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
