import { useCallback, useEffect, useRef } from 'react';

const REST_MS = 140;
const MEMORY_SCROLL_SPEED = 2.5;
const WORLD_SETTLE_MS = 650;
const GESTURE_GAP_MS = 180;

/** A short detent between scenes; deliberate continuous input can keep advancing. */
export function useChapterScroll(
  step: number,
  last: number,
  memoryStart: number,
  memoryEnd: number,
) {
  const guard = useRef({
    until: 0,
    target: 0,
    settlingUntil: 0,
    lastInput: 0,
    total: 0,
    worldGate: false,
  });
  const go = useCallback(
    (position: number) => {
      const target = Math.max(0, Math.min(last, position));
      guard.current.worldGate = target === memoryEnd + 1;
      guard.current.until =
        performance.now() + (guard.current.worldGate ? WORLD_SETTLE_MS : REST_MS);
      guard.current.settlingUntil = performance.now() + 800;
      guard.current.target = target;
      guard.current.total = 0;
      // Use an immediate jump. Native smooth scrolling queues animations when users click rapidly.
      window.scrollTo({ top: target * step, behavior: 'auto' });
    },
    [step, last, memoryEnd],
  );

  useEffect(() => {
    function outsideStage(target: EventTarget | null) {
      if (document.querySelector('[role="dialog"][data-state="open"]')) return true;
      return (
        target instanceof Element &&
        !!target.closest(
          '[role="dialog"], input, textarea, select, [contenteditable="true"], .mobile-nav',
        )
      );
    }
    function move(delta: number, fresh = false) {
      const now = performance.now(),
        state = guard.current;
      const newGesture = fresh || now - state.lastInput > GESTURE_GAP_MS;
      state.lastInput = now;
      if (now < state.until) return;
      // Let the department cards settle. The incoming gesture must not carry into the finale.
      if (state.worldGate) {
        if (!newGesture) return;
        state.worldGate = false;
      }
      if (newGesture) {
        state.total = 0;
      }
      const position = window.scrollY / step;
      // Inside the album, glide through the real cards. Pause again at either edge.
      if (
        memoryEnd > memoryStart &&
        position >= memoryStart - 0.002 &&
        position <= memoryEnd + 0.002
      ) {
        const forward = delta > 0 && position < memoryEnd - 0.002;
        const backward = delta < 0 && position > memoryStart + 0.002;
        if (forward || backward) {
          const next = Math.max(
            memoryStart,
            Math.min(memoryEnd, position + (delta * MEMORY_SCROLL_SPEED) / step),
          );
          window.scrollTo({ top: next * step, behavior: 'instant' });
          if (next === memoryStart || next === memoryEnd) {
            state.until = now + REST_MS;
            state.target = next;
            state.settlingUntil = 0;
          }
          return;
        }
      }
      state.total += delta;
      if (Math.abs(state.total) < 45) return;
      const anchor = now < state.settlingUntil ? state.target : Math.round(position);
      go(anchor + Math.sign(state.total));
      return true;
    }
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        outsideStage(event.target) ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      event.preventDefault();
      move(
        event.deltaY *
          (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1),
      );
    };
    let touch: { x: number; y: number; previous: number; first: boolean; turned: boolean } | null =
      null;
    const start = (event: TouchEvent) => {
      if (event.touches.length !== 1 || outsideStage(event.target)) {
        touch = null;
        return;
      }
      const point = event.touches[0];
      touch = {
        x: point.clientX,
        y: point.clientY,
        previous: point.clientY,
        first: true,
        turned: false,
      };
    };
    const drag = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return;
      const point = event.touches[0];
      if (Math.abs(point.clientY - touch.y) <= Math.abs(point.clientX - touch.x)) return;
      if (event.cancelable) event.preventDefault();
      if (!touch.turned) touch.turned = Boolean(move(touch.previous - point.clientY, touch.first));
      touch.previous = point.clientY;
      touch.first = false;
    };
    const end = () => {
      touch = null;
    };
    const key = (event: KeyboardEvent) => {
      if (
        outsideStage(event.target) ||
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        (event.target instanceof Element && event.target.closest('button, a'))
      )
        return;
      const direction = ['ArrowDown', 'PageDown', ' '].includes(event.key)
        ? event.shiftKey
          ? -1
          : 1
        : ['ArrowUp', 'PageUp'].includes(event.key)
          ? -1
          : 0;
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        go(event.key === 'Home' ? 0 : last);
      } else if (direction) {
        event.preventDefault();
        if (performance.now() >= guard.current.until) {
          const anchor =
            performance.now() < guard.current.settlingUntil
              ? guard.current.target
              : Math.round(window.scrollY / step);
          go(anchor + direction);
        }
      }
    };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchmove', drag);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', end);
      window.removeEventListener('keydown', key);
    };
  }, [go, step, last, memoryStart, memoryEnd]);
  return go;
}
