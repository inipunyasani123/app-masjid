import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { create as buatQr } from 'qrcode/lib/core/qrcode';
import { SITUS } from '@/lib/data';

// Hanya berjalan di Node saat render statis (web). Kode QR dibuat di sini, saat build, tanpa layanan luar.
function qrPath(teks: string) {
  const qr = buatQr(teks, { errorCorrectionLevel: 'M' });
  const n = qr.modules.size;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(x, y)) d += `M${x} ${y}h1v1h-1z`;
  return { n, d };
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'Nurul Ufuk',
  alternateName: 'Aplikasi jemaah Masjid Nurul Ufuk (demo)',
  description:
    'Demo aplikasi masjid buatan PintuWeb: jadwal salat Tulungagung metode Kemenag RI, hitung mundur, tanggal Hijriah, arah kiblat, kajian, laporan kas, dan infak simulasi. Masjid dan pengurusnya rekaan.',
  url: `${SITUS.url}/`,
  image: `${SITUS.url}/og.jpg`,
  inLanguage: 'id',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Android, iOS, Web',
  isAccessibleForFree: true,
  creator: { '@type': 'Organization', name: 'PintuWeb', url: 'https://www.pintuweb.id' },
  publisher: { '@type': 'Organization', name: 'PintuWeb', url: 'https://www.pintuweb.id' },
};

const BINTANG = 'M12 2L14.93 4.93L19.07 4.93L19.07 9.07L22 12L19.07 14.93L19.07 19.07L14.93 19.07L12 22L9.07 19.07L4.93 19.07L4.93 14.93L2 12L4.93 9.07L4.93 4.93L9.07 4.93Z';
const POLA = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><g fill="none" stroke="#DCCFB8" stroke-width="1"><path transform="translate(32 32) scale(2)" d="${BINTANG}"/><path d="M0 56h12M100 56h12M56 0v12M56 100v12"/></g></svg>`,
);

const CSS = `
@font-face{font-family:Messiri;src:url(/fonts/messiri.woff2) format('woff2');font-weight:500 700;font-style:normal;font-display:swap}
@font-face{font-family:Readex;src:url(/fonts/readex.woff2) format('woff2');font-weight:300 700;font-style:normal;font-display:swap}
:root{color-scheme:light;--kertas:#F4EEE2;--kartu:#FFFCF5;--tinta:#17203A;--tinta2:#4E5368;--kuningan:#85560F;--malam:#141C33;--emas:#E2B657;--krem:#F5EAD2;--garis:#DCD0BA}
html,body{background:var(--kertas)}
body{margin:0;display:flex;flex-direction:column;height:100vh;height:100dvh;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
.panggung{flex:1;min-height:0;display:flex;position:relative}
.perangkat{flex:1;min-width:0;min-height:0;display:flex;background:var(--kertas)}
#root{flex:1;min-width:0;min-height:0;height:auto!important}
.panel{display:none}
:focus{outline:none}
:focus-visible{outline:2px solid var(--tinta)!important;box-shadow:0 0 0 5px var(--emas)!important;border-radius:12px}
input:focus-visible,textarea:focus-visible{outline-offset:0}
.bilah-demo{flex:none;margin:0;padding:10px 16px;background:#0f1b33;color:#dfe6f3;font:400 13px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center}
.bilah-demo a{color:#fff;font-weight:600;text-decoration:underline;text-underline-offset:3px}
@media (min-width:768px){
  body{background:var(--kertas) url("data:image/svg+xml,${POLA}") center/140px 140px}
  .panggung{align-items:center;justify-content:center;gap:clamp(28px,5vw,80px);padding:24px;overflow:hidden}
  .panggung::before{content:"";position:absolute;left:50%;top:58%;width:1500px;height:1500px;margin-left:-750px;border-radius:50%;border:1px dashed #B9A98C;opacity:.7;pointer-events:none}
  .perangkat{flex:none;position:relative;z-index:1;flex-direction:column;width:390px;height:min(844px,100%);padding:34px 0 16px;box-sizing:border-box;background:linear-gradient(var(--kertas) 50%,#FFFCF5 50%);border:11px solid #0B1022;border-radius:54px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(20,28,51,.45),0 0 0 1px #2a3350}
  .perangkat::before{content:"";position:absolute;top:9px;left:50%;width:92px;height:26px;margin-left:-46px;border-radius:13px;background:#0B1022}
  .panel{display:block;position:relative;z-index:1;width:clamp(250px,calc(100vw - 540px),380px);max-height:100%;overflow:auto;color:var(--tinta);font:400 15px/1.55 Readex,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
}
.panel-label{margin:0 0 10px;font-weight:600;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--kuningan)}
.panel-judul{margin:0;font:700 46px/1.02 Messiri,Georgia,serif;letter-spacing:-.5px}
.panel-arab{margin:4px 0 0;font:600 22px/1.6 Messiri,serif;color:var(--kuningan);text-align:left}
.panel-tagline{margin:12px 0 18px;font-size:17px;line-height:1.45;color:var(--tinta)}
.panel-fitur{list-style:none;margin:0 0 20px;padding:0;display:grid;gap:10px}
.panel-fitur li{display:grid;grid-template-columns:18px 1fr;gap:10px;align-items:start;color:var(--tinta2);font-size:14px}
.panel-fitur svg{margin-top:3px}
.panel-fitur b{color:var(--tinta);font-weight:600}
.panel-qr{display:grid;grid-template-columns:112px 1fr;gap:14px;align-items:center;padding:14px;background:var(--kartu);border:1px solid var(--garis);border-radius:20px;margin-bottom:16px}
.panel-qr svg{display:block;width:112px;height:112px;background:#fff;border-radius:8px}
.panel-qr p{margin:0;font-size:13px;line-height:1.5;color:var(--tinta2)}
.panel-cta{display:flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:0 22px;border-radius:999px;background:var(--malam);color:var(--krem);font-weight:600;text-decoration:none}
.panel-cta:hover{background:#24305a}
.panel-teknis{margin:14px 0 4px;font-size:13px;color:var(--tinta2)}
.panel-catatan{margin:0;font-size:12px;line-height:1.5;color:var(--tinta2)}
@media (min-width:768px) and (max-height:880px){
  .panel-judul{font-size:38px}.panel-arab{font-size:18px}.panel-tagline{font-size:15px;margin:8px 0 12px}
  .panel-fitur{gap:6px;margin-bottom:14px}.panel-fitur li{font-size:13px;line-height:1.45}
  .panel-qr{grid-template-columns:92px 1fr;padding:10px;margin-bottom:12px}.panel-qr svg{width:92px;height:92px}
  .panel-teknis{margin-top:10px}
}
`;

const FITUR = [
  ['Jadwal salat dihitung di perangkat', 'metode Kemenag RI, cocok dengan jadwal resmi Tulungagung'],
  ['Hitung mundur, tanggal Hijriah, kiblat', 'termasuk jam bayangan kiblat harian'],
  ['Kajian, khatib Jumat, agenda', 'plus pendaftaran relawan kegiatan'],
  ['Laporan kas terbuka', 'dan infak lewat QRIS simulasi'],
];

export default function Root({ children, pathname }: PropsWithChildren<{ pathname?: string }>) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();
  const qr = qrPath(`${SITUS.url}/`);
  const beranda = pathname === '/' || pathname === '' || pathname === '/index';
  return (
    <html lang="id" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#141C33" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Nurul Ufuk" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preload" href="/fonts/readex.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/messiri.woff2" as="font" type="font/woff2" crossOrigin="" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {headNodes}
        {beranda && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />}
      </head>
      <body {...bodyAttributes}>
        <div className="panggung">
          <aside className="panel" aria-label="Tentang demo aplikasi ini">
            <p className="panel-label">Demo aplikasi mobile · PintuWeb</p>
            <h2 className="panel-judul">Nurul Ufuk</h2>
            <p className="panel-arab">
              <span lang="ar" dir="rtl">مسجد نور الأفق</span>
            </p>
            <p className="panel-tagline">Jadwal salat akurat, kas terbuka, jemaah makin dekat.</p>
            <ul className="panel-fitur">
              {FITUR.map(([a, b]) => (
                <li key={a}>
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={BINTANG} fill="#E2B657" stroke="#85560F" strokeWidth="1.4" />
                  </svg>
                  <span>
                    <b>{a}</b> — {b}
                  </span>
                </li>
              ))}
            </ul>
            <div className="panel-qr">
              <svg viewBox={`-2 -2 ${qr.n + 4} ${qr.n + 4}`} role="img" aria-label="Kode QR menuju app-masjid.pintuweb.id" shapeRendering="crispEdges">
                <path d={qr.d} fill="#141C33" />
              </svg>
              <p>Pindai dengan kamera HP untuk mencoba di layar penuh, lalu pasang ke layar utama seperti aplikasi.</p>
            </div>
            <a className="panel-cta" href={SITUS.kontak}>
              Pesan aplikasi seperti ini <span aria-hidden="true">→</span>
            </a>
            <p className="panel-teknis">React Native + Expo SDK 58 · satu kode untuk Android, iOS, dan web.</p>
            <p className="panel-catatan">Nama masjid, pengurus, kajian, dan angka kas rekaan. Jadwal salat dihitung sungguhan untuk Tulungagung.</p>
          </aside>
          <div className="perangkat">{children}</div>
        </div>
        <aside aria-label="Tentang situs demo ini" className="bilah-demo">
          Situs demo buatan PintuWeb — nama dan isinya rekaan.{' '}
          <a href={SITUS.kontak}>Pesan aplikasi seperti ini →</a>
        </aside>
        {bodyNodes}
      </body>
    </html>
  );
}
