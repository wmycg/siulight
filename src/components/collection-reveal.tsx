import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/** A short stagger on actual content; never clips or scales its text. */
export function CollectionReveal({ children, index = 0 }: { children: ReactNode; index?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      layout={reduced ? false : 'position'}
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: reduced ? 0 : 0.55,
        delay: reduced ? 0 : (index % 3) * 0.09,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
