import { motion, useTransform } from 'motion/react';
import type { SceneProps } from './frame';

export type MascotPose = 'photographer' | 'artist' | 'keeper';

export const mascotImage = (pose: MascotPose) => `/images/mascot-${pose}.webp`;

/** Each pose stays mounted, so changing chapters never waits for an image entrance. */
export function SceneMascot({
  pose,
  className = '',
  progress,
  index,
}: SceneProps & { pose: MascotPose; className?: string }) {
  const y = useTransform(progress, [index - 1, index, index + 1], [8, 0, -6]);
  return (
    <motion.span className={`scene-mascot ${className}`} style={{ y }} aria-hidden="true">
      <img src={mascotImage(pose)} alt="" draggable={false} width={768} height={1152} />
    </motion.span>
  );
}
