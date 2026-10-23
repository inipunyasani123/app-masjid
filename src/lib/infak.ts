import { type ProgramInfak } from './data';
import { terkumpulRenovasi } from './kas';

/** Doa singkat untuk pemberi infak (tanpa kutipan dalil). */
export function doaUntuk(program: string) {
  return program === 'wudu' || program === 'operasional'
    ? 'Jazakumullahu khairan. Semoga menjadi amal jariyah yang terus mengalir pahalanya.'
    : 'Jazakumullahu khairan. Semoga Allah menerima dan membalas kebaikanmu.';
}

/** Dana terkumpul program bertarget; renovasi wudu dihitung dari laporan kas supaya angkanya sama. */
export function terkumpulProgram(p: ProgramInfak, now: Date | null) {
  if (!p.target) return null;
  if (!now) return p.dasar ?? 0;
  return p.id === 'wudu' ? terkumpulRenovasi(now, p.dasar ?? 0) : (p.dasar ?? 0);
}
