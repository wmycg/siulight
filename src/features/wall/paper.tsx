import type { CSSProperties } from 'react';
import { ArrowUpRight, Sparkle } from 'lucide-react';
import type { NoteColor, WallNote } from '@shared/types';

export const paperColors: Record<Exclude<NoteColor, 'random'>, string> = {
  butter: '#f5e8b8',
  rose: '#f0d6d1',
  sage: '#dfe5cf',
  sky: '#d8e6ed',
  lavender: '#e6dded',
};
export const colorLabels: Record<NoteColor, string> = {
  random: '随机颜色',
  butter: '奶油黄',
  rose: '樱花粉',
  sage: '鼠尾草绿',
  sky: '晴空蓝',
  lavender: '丁香紫',
};
export function resolvePaperColor(color: NoteColor, id = 0): string {
  if (color !== 'random') return paperColors[color];
  // Resolve automatic colours once per note identity, not once per animation frame.
  // Keep the wall and reader in sync without repaint flicker.
  const colors = Object.values(paperColors);
  const mixed = Math.sin(id * 127.1 + 311.7) * 43758.5453;
  return colors[Math.floor((mixed - Math.floor(mixed)) * colors.length)];
}
export function paperStyle(color: NoteColor, id = 0): CSSProperties {
  return { '--paper': resolvePaperColor(color, id) } as CSSProperties;
}
export function Paper({ note, onOpen }: { note: WallNote; onOpen: (note: WallNote) => void }) {
  return (
    <button
      className="wall-paper"
      style={paperStyle(note.color, note.id)}
      onClick={() => onOpen(note)}
      aria-label={`阅读${note.nickname}的纸条：${note.body.slice(0, 24)}`}
    >
      <span className="paper-tape" aria-hidden="true" />
      <span className="paper-topline">
        <span>{note.isDemo ? '示例纸条' : note.registered ? '来自微光' : '偶然路过'}</span>
        <Sparkle size={14} strokeWidth={1.2} />
      </span>
      <span className={`paper-body ${note.body.length < 40 ? 'paper-short' : ''}`}>
        {note.body}
      </span>
      <span className="paper-signature">
        <span>— {note.nickname}</span>
        <ArrowUpRight size={15} />
      </span>
    </button>
  );
}
