import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CornerDownLeft, Hand, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WallNote } from '@shared/types';
import { createClaw, drawClaw, grab, prizes, tickClaw, type ClawPhase } from './claw-engine';

type GameWindow = Window & {
  render_game_to_text?: () => string;
  advanceTime?: (ms: number) => void;
};
export function ClawMachine({
  notes,
  onCaught,
  paused,
}: {
  notes: WallNote[];
  onCaught: (note: WallNote) => void;
  paused: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cabinet = useRef<HTMLDivElement>(null);
  const state = useRef(createClaw());
  const props = useRef({ notes, onCaught, paused });
  props.current = { notes, onCaught, paused };
  const [phase, setPhase] = useState<ClawPhase>('aiming');
  const [aim, setAim] = useState(340);
  const running = phase === 'dropping' || phase === 'lifting';
  const catchNote = () => {
    if (!props.current.paused && notes.length) grab(state.current);
  };
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    cabinet.current?.focus({ preventScroll: true });
    let raf = 0,
      previous = performance.now();
    const advance = (ms: number) => {
      const s = state.current;
      const before = s.phase;
      if (!props.current.paused) {
        let left = Math.min(ms, 10000);
        while (left > 0) {
          const step = Math.min(left, 16.67);
          tickClaw(s, step, props.current.notes);
          left -= step;
        }
      }
      setPhase(s.phase);
      setAim(s.x);
      if (s.phase === 'delivered' && before !== 'delivered' && s.caught)
        props.current.onCaught(s.caught);
      drawClaw(ctx, s, props.current.notes);
    };
    const loop = (now: number) => {
      advance(Math.min(now - previous, 40));
      previous = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const gameWindow = window as GameWindow;
    gameWindow.advanceTime = advance;
    gameWindow.render_game_to_text = () =>
      JSON.stringify({
        mode: 'claw',
        coordinates: '680×450, origin top left; x right, y down',
        phase: state.current.phase,
        claw: { x: state.current.x, y: state.current.y },
        prizes: prizes(props.current.notes, state.current.round).map((p) => ({
          id: p.note.id,
          x: p.x,
          y: p.y,
        })),
        caughtId: state.current.caught?.id || null,
        paused: props.current.paused,
        controls: 'Left/Right to aim, Space to grab. Catch within 32px.',
      });
    return () => {
      cancelAnimationFrame(raf);
      delete gameWindow.advanceTime;
      delete gameWindow.render_game_to_text;
    };
  }, []);
  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if (props.current.paused || (e.target as HTMLElement).matches('input,textarea,select'))
        return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        state.current.direction = e.key === 'ArrowLeft' ? -1 : 1;
      }
      if (e.code === 'Space' && !(e.target as HTMLElement).closest('button,a')) {
        e.preventDefault();
        if (!e.repeat) catchNote();
      }
      if (e.key === 'f' && !e.repeat) {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void cabinet.current?.requestFullscreen().catch(() => {});
      }
    }
    const stop = () => {
      state.current.direction = 0;
    };
    const keyup = (e: KeyboardEvent) => {
      if (e.key.startsWith('Arrow')) stop();
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', stop);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', stop);
    };
  }, []);
  useEffect(() => {
    if (paused) state.current.direction = 0;
  }, [paused]);
  return (
    <div className="claw-stage" ref={cabinet} tabIndex={0} aria-label="娃娃机操作区">
      <div className="claw-caption">
        <span className="eyebrow">LETTER CATCHER · FREE PLAY</span>
        <p>让一张纸条，偶然遇见你。</p>
      </div>
      <canvas
        ref={canvas}
        width={680}
        height={450}
        aria-label="纸条娃娃机：用下方方向控制移动爪子，对准纸条后抓取。"
        role="img"
      />
      <div className="claw-console">
        <div className="claw-direction">
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              disabled={running || paused}
              aria-label={dir < 0 ? '向左移动' : '向右移动'}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                state.current.direction = dir;
              }}
              onPointerUp={() => {
                state.current.direction = 0;
              }}
              onPointerCancel={() => {
                state.current.direction = 0;
              }}
              onLostPointerCapture={() => {
                state.current.direction = 0;
              }}
              onClick={(e) => {
                if (e.detail === 0)
                  state.current.x = Math.max(68, Math.min(612, state.current.x + dir * 24));
              }}
            >
              {dir < 0 ? <ArrowLeft /> : <ArrowRight />}
            </button>
          ))}
        </div>
        {phase === 'delivered' || phase === 'missed' ? (
          <Button
            onClick={() => {
              const round = state.current.round + 1;
              state.current = { ...createClaw(), round };
              setPhase('aiming');
            }}
          >
            <RotateCcw size={16} />
            再抓一次
          </Button>
        ) : (
          <Button id="claw-grab" disabled={running || !notes.length || paused} onClick={catchNote}>
            <Hand size={17} />
            {running ? '心意上升中…' : '抓住这份心意'}
          </Button>
        )}
      </div>
      <label className="claw-slider">
        <span className="sr-only">爪子位置</span>
        <input
          type="range"
          min="68"
          max="612"
          value={aim}
          disabled={phase !== 'aiming' || paused}
          onChange={(e) => {
            state.current.x = Number(e.target.value);
            setAim(Number(e.target.value));
          }}
        />
      </label>
      <p className="claw-status" role="status">
        {!notes.length ? (
          '先贴一张纸条，再来抓一份心意。'
        ) : phase === 'missed' ? (
          '差一点点！试着再靠近纸条一点。'
        ) : phase === 'delivered' ? (
          '抓到了！愿这份心情，也能照亮你。'
        ) : (
          <>
            <CornerDownLeft size={12} />
            按住方向移动 · 对准纸条后抓取
          </>
        )}
      </p>
    </div>
  );
}
