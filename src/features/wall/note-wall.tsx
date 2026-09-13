import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { WallNote } from '@shared/types';
import { Paper } from './paper';

// Deterministic scatter: letters keep their place while the viewport moves.
export function noise(value: number) {
  const n = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}
const wrap = (value: number, size: number) =>
  ((((value + size / 2) % size) + size) % size) - size / 2;
export function NoteWall({
  notes,
  shuffle,
  windy,
  focusId,
  onOpen,
  onExplore,
}: {
  notes: WallNote[];
  shuffle: number;
  windy: boolean;
  focusId: number | null;
  onOpen: (note: WallNote) => void;
  onExplore: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const centered = useRef(false);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const [dragging, setDragging] = useState(false);
  const ordered = useMemo(
    () =>
      [...notes].sort((a, b) =>
        shuffle ? noise(a.id + shuffle * 29) - noise(b.id + shuffle * 29) : b.id - a.id,
      ),
    [notes, shuffle],
  );
  const cols = Math.max(
    1,
    Math.min(
      ordered.length,
      Math.max(Math.ceil(Math.sqrt(ordered.length * 1.25)), Math.round(size.width / 254)),
    ),
  );
  const rows = Math.max(1, Math.ceil(ordered.length / cols));
  const stepX = 254,
    stepY = 284;
  const worldW = cols * stepX;
  const repeating = ordered.length >= 8;
  function position(index: number) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const seed = ordered[index].id + shuffle * 53;
    const inColumn = Math.ceil((ordered.length - col) / cols);
    return {
      x: (col - (cols - 1) / 2) * stepX + (noise(seed * 3) - 0.5) * 64,
      y: row * stepY + noise(col * 41 + shuffle * 3) * 190 + (noise(seed * 7) - 0.5) * 55,
      period: inColumn * stepY,
      width: (ordered[index].body.length > 35 ? 226 : 190) + noise(seed * 11) * 30,
      height: (ordered[index].body.length > 35 ? 246 : 212) + noise(seed * 17) * 34,
      angle: (noise(seed * 23) - 0.5) * 17,
    };
  }
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    if (centered.current || !ordered.length) return;
    const index = Math.min(ordered.length - 1, Math.floor(rows / 2) * cols + Math.floor(cols / 2));
    const p = position(index);
    setCamera({ x: -p.x, y: -p.y - 25 });
    centered.current = true;
  }, [ordered.length]);
  useEffect(() => {
    if (focusId === null) return;
    const index = ordered.findIndex((note) => note.id === focusId);
    if (index >= 0) {
      const p = position(index);
      setCamera({ x: -p.x, y: -p.y });
    }
    // Focus only for a newly posted letter; a shuffle should rearrange the whole wall.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);
  const finishDrag = () => {
    if (drag.current?.moved) onExplore();
    drag.current = null;
    setDragging(false);
  };
  return (
    <div
      ref={container}
      className={`note-wall ${dragging ? 'is-dragging' : ''} ${windy ? 'is-windy' : ''}`}
      tabIndex={0}
      role="region"
      aria-label="留言墙，可拖拽浏览或使用方向键移动"
      onPointerDown={(e) => {
        if (windy || !e.isPrimary || e.button !== 0) return;
        suppressClick.current = false;
        drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const dx = e.clientX - d.x,
          dy = e.clientY - d.y;
        if (!d.moved && Math.hypot(dx, dy) < 6) return;
        d.moved = true;
        suppressClick.current = true;
        setDragging(true);
        container.current?.setPointerCapture(e.pointerId);
        d.x = e.clientX;
        d.y = e.clientY;
        setCamera((p) => ({ x: p.x + dx, y: p.y + dy }));
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick.current = false;
        }
      }}
      onKeyDown={(e) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) || windy) return;
        e.preventDefault();
        setCamera((p) => ({
          x: p.x + (e.key === 'ArrowLeft' ? 180 : e.key === 'ArrowRight' ? -180 : 0),
          y: p.y + (e.key === 'ArrowUp' ? 150 : e.key === 'ArrowDown' ? -150 : 0),
        }));
        onExplore();
      }}
    >
      <div className="wall-ink" aria-hidden="true">
        DEAR
        <br />
        <i>SOMEONE.</i>
      </div>
      {ordered.flatMap((note, index) => {
        const p = position(index);
        const centerX =
          (repeating ? wrap(p.x + camera.x, worldW) : p.x + camera.x) + size.width / 2;
        const centerY =
          (repeating ? wrap(p.y + camera.y, p.period) : p.y + camera.y) + size.height / 2;
        const copiesX = repeating ? Math.ceil(size.width / worldW / 2) + 1 : 0;
        const copiesY = repeating ? Math.ceil(size.height / p.period / 2) + 1 : 0;
        const tiles = [];
        // Wrap real letters across the edges of the world. Copies share the same note ID;
        // there is no fabricated content, and short/empty walls are never multiplied.
        for (let tx = -copiesX; tx <= copiesX; tx++) {
          for (let ty = -copiesY; ty <= copiesY; ty++) {
            const x = centerX + tx * worldW - p.width / 2;
            const y = centerY + ty * p.period - p.height / 2;
            if (x < -300 || x > size.width + 80 || y < -320 || y > size.height + 80) continue;
            tiles.push(
              <div
                key={`${note.id}:${tx}:${ty}`}
                className="wall-note-position"
                style={{
                  width: p.width,
                  height: p.height,
                  transform: `translate(${x}px, ${y}px) rotate(${p.angle}deg)`,
                }}
              >
                <Paper note={note} onOpen={onOpen} />
              </div>,
            );
          }
        }
        return tiles;
      })}
      {!notes.length && (
        <div className="wall-empty">
          <span>✳</span>
          <h2>
            风已经到了，
            <br />
            等你的第一张纸条。
          </h2>
          <p>写给同好，也写给偶然路过的人。</p>
        </div>
      )}
    </div>
  );
}
