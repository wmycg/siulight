import { useLayoutEffect, useRef, useState } from 'react';

/** Reflow with the usable viewport while keeping the reader in the same chapter. */
export function useStageGeometry() {
  const initialHeader = window.innerWidth <= 760 ? 71 : 89;
  const [geometry, setGeometry] = useState(() => {
    const height = window.innerHeight - initialHeader;
    return { height, header: initialHeader, step: Math.max(640, height * 1.6) };
  });
  const current = useRef(geometry);
  const pendingPosition = useRef<number | null>(null);
  useLayoutEffect(() => {
    const resize = () => {
      const viewport = window.visualViewport;
      // Preserve pinch zoom and avoid reflowing the story behind an open form/keyboard.
      if (
        (viewport && viewport.scale !== 1) ||
        document.querySelector('[role="dialog"][data-state="open"]')
      )
        return;
      const header =
        (document.querySelector('.header-inner')?.getBoundingClientRect().height || 88) + 1;
      const height = Math.round((viewport?.height || window.innerHeight) - header);
      if (height === current.current.height && header === current.current.header) return;
      pendingPosition.current = window.scrollY / current.current.step;
      const next = { height, header, step: Math.max(640, height * 1.6) };
      current.current = next;
      setGeometry(next);
    };
    resize();
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
    };
  }, []);
  useLayoutEffect(() => {
    if (pendingPosition.current !== null) {
      window.scrollTo({ top: pendingPosition.current * geometry.step, behavior: 'instant' });
      pendingPosition.current = null;
    }
  }, [geometry]);
  return geometry;
}
