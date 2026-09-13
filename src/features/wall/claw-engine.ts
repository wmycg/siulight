import type { WallNote } from '@shared/types';
import { resolvePaperColor } from './paper';

export type ClawPhase = 'aiming' | 'dropping' | 'lifting' | 'delivered' | 'missed';
export interface ClawState {
  x: number;
  y: number;
  phase: ClawPhase;
  elapsed: number;
  direction: number;
  caught: WallNote | null;
  round: number;
}
export const createClaw = (): ClawState => ({
  x: 340,
  y: 90,
  phase: 'aiming',
  elapsed: 0,
  direction: 0,
  caught: null,
  round: 0,
});
export function prizes(notes: WallNote[], round: number) {
  const count = Math.min(7, notes.length);
  return Array.from({ length: count }, (_, i) => ({
    note: notes[(i + round * 7) % notes.length],
    x: count === 1 ? 340 : 80 + (i * 520) / (count - 1),
    y: 344,
  }));
}
export function grab(state: ClawState) {
  if (state.phase !== 'aiming') return;
  state.phase = 'dropping';
  state.elapsed = 0;
  state.direction = 0;
  state.caught = null;
}
export function tickClaw(state: ClawState, dt: number, notes: WallNote[]) {
  if (state.phase === 'aiming') {
    state.x = Math.min(612, Math.max(68, state.x + state.direction * dt * 0.27));
    return;
  }
  if (state.phase === 'delivered' || state.phase === 'missed') return;
  state.elapsed += dt;
  if (state.phase === 'dropping') {
    state.y = 90 + Math.min(1, state.elapsed / 680) * 230;
    if (state.elapsed >= 680) {
      state.caught =
        prizes(notes, state.round).find((p) => Math.abs(p.x - state.x) <= 32)?.note || null;
      state.phase = 'lifting';
      state.elapsed = 0;
    }
  } else {
    state.y = 320 - Math.min(1, state.elapsed / 860) * 230;
    if (state.elapsed >= 860) {
      state.phase = state.caught ? 'delivered' : 'missed';
      state.elapsed = 0;
    }
  }
}
export function drawClaw(ctx: CanvasRenderingContext2D, state: ClawState, notes: WallNote[]) {
  const W = 680,
    H = 450;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#b74449';
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 20);
  ctx.fill();
  ctx.fillStyle = '#edd9c1';
  ctx.beginPath();
  ctx.roundRect(13, 13, W - 26, H - 26, 12);
  ctx.fill();
  ctx.fillStyle = '#faf4e8';
  ctx.beginPath();
  ctx.roundRect(26, 26, W - 52, H - 78, 7);
  ctx.fill();
  const glow = ctx.createLinearGradient(0, 30, 0, 400);
  glow.addColorStop(0, '#f8eedf');
  glow.addColorStop(1, '#e9ddc7');
  ctx.fillStyle = glow;
  ctx.fillRect(27, 27, 626, 343);
  ctx.strokeStyle = '#decdb6';
  ctx.lineWidth = 1;
  for (let x = 46; x < 650; x += 26)
    for (let y = 58; y < 355; y += 26) {
      ctx.beginPath();
      ctx.arc(x, y, 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }
  ctx.fillStyle = '#d9c6af';
  ctx.font = 'italic 60px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('a little serendipity', 340, 231);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#9c7770';
  ctx.fillText('每一次相遇，都是刚刚好。', 340, 260);
  ctx.strokeStyle = '#b7a293';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(47, 54);
  ctx.lineTo(633, 54);
  ctx.stroke();
  // The prize positions and the collision positions use the same coordinates.
  function drawPaper(x: number, y: number, note: WallNote, angle: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowColor = '#75574325';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = resolvePaperColor(note.color, note.id);
    ctx.fillRect(-29, -28, 58, 66);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#fffcdfaa';
    ctx.fillRect(-13, -32, 26, 9);
    ctx.fillStyle = '#856e61';
    ctx.font = '11px serif';
    ctx.textAlign = 'left';
    const characters = Array.from(note.body.replace(/\s/g, ''));
    for (let i = 0; i < 3; i++)
      ctx.fillText(characters.slice(i * 4, i * 4 + 4).join(''), -21, -9 + i * 14);
    ctx.fillStyle = '#a57369';
    ctx.font = '8px sans-serif';
    ctx.fillText('✳', 14, 30);
    ctx.restore();
  }
  for (const [i, p] of prizes(notes, state.round).entries()) {
    if (p.note.id === state.caught?.id) continue;
    drawPaper(p.x, p.y, p.note, ((i % 3) - 1) * 0.14);
  }
  if (state.caught) drawPaper(state.x, state.y + 27, state.caught, -0.04);
  ctx.strokeStyle = '#89766a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(state.x, 57);
  ctx.lineTo(state.x, state.y);
  ctx.stroke();
  ctx.fillStyle = '#ae4247';
  ctx.beginPath();
  ctx.roundRect(state.x - 21, 44, 42, 18, 5);
  ctx.fill();
  ctx.fillStyle = '#ad4045';
  ctx.beginPath();
  ctx.arc(state.x, state.y, 9, 0, Math.PI * 2);
  ctx.fill();
  const closed = state.phase === 'lifting' || state.phase === 'delivered';
  ctx.strokeStyle = '#7d6a60';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (const direction of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(state.x, state.y + 2);
    ctx.lineTo(state.x + direction * 23, state.y + 20);
    ctx.lineTo(state.x + direction * (closed ? 10 : 31), state.y + 36);
    ctx.stroke();
  }
  ctx.fillStyle = '#b74449';
  ctx.fillRect(26, 391, 628, 34);
  ctx.fillStyle = '#faecdb';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SIULIGHT  /  LETTER CATCHER', 44, 413);
  ctx.textAlign = 'right';
  ctx.fillText('✳  GOOD THINGS ARE WAITING', 633, 413);
}
