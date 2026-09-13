import { motion, useTransform, type MotionValue } from 'motion/react';
import type { ReactNode } from 'react';

export type SceneProps = { progress: MotionValue<number>; index: number };

/** Every chapter stays mounted: scroll can reverse without an entrance/loading gap. */
export function Frame({
  progress,
  index,
  active,
  name,
  children,
  className = '',
  duration = 1,
}: SceneProps & {
  active: boolean;
  name: string;
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  const opacity = useTransform(
    progress,
    [index - 0.8, index - 0.2, index + duration - 0.8, index + duration - 0.2],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [index - 1, index, index + duration - 0.9, index + duration],
    [55, 0, 0, -55],
  );
  return (
    <motion.section
      className={`cinema-frame ${className}`}
      style={{ opacity, y }}
      aria-label={name}
      aria-hidden={!active}
      inert={!active}
      data-active={active}
    >
      {children}
    </motion.section>
  );
}
