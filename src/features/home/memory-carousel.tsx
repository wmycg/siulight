import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollectionReveal } from '@/components/collection-reveal';
import { MilestoneCard } from '@/features/milestones/milestone-card';
import type { Milestone } from '@shared/types';

export function MemoryCarousel({
  items,
  onOpen,
}: {
  items: Milestone[];
  onOpen: (item: Milestone) => void;
}) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const [active, setActive] = useState(0);
  const dragged = useRef(false);
  const reduced = useReducedMotion();
  const count = Math.min(3, items.length);
  const current = Math.min(active, Math.max(0, count - 1));
  const item = items[current];
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  function go(index: number) {
    if (index < 0 || index >= count || index === current) return;
    setActive(index);
  }
  if (!mobile)
    return (
      <div className="home-memory-grid">
        {items.slice(0, 3).map((memory, index) => (
          <CollectionReveal key={memory.id} index={index}>
            <MilestoneCard item={memory} onOpen={onOpen} compact />
          </CollectionReveal>
        ))}
      </div>
    );
  if (!item) return null;
  return (
    <div className="memory-carousel">
      <div className="memory-deck-viewport">
        <div
          className="memory-deck"
          role="region"
          aria-label="叠放纪念卡片，左划下一张、右划上一张"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              go(current + (event.key === 'ArrowRight' ? 1 : -1));
            }
          }}
        >
          {items.slice(0, count).map((memory, index) => {
            const depth = index - current;
            const front = depth === 0;
            return (
              <motion.div
                key={memory.id}
                className={`memory-deck-card ${front ? 'memory-deck-front' : ''}`}
                style={{ zIndex: count - index }}
                aria-hidden={!front}
                inert={!front}
                initial={false}
                animate={{
                  opacity: depth < 0 ? 0 : 1,
                  x: depth < 0 ? -460 : 0,
                  y: depth > 0 ? -depth * 13 : 0,
                  scale: depth > 0 ? 1 - depth * 0.035 : 1,
                  rotate: depth < 0 ? -9 : depth > 0 ? (depth % 2 ? 2.5 : -2.8) : 0,
                }}
                transition={{ duration: reduced ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                drag={front && count > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.65}
                dragMomentum={false}
                onPointerDownCapture={() => {
                  dragged.current = false;
                }}
                onDragStart={() => {
                  dragged.current = true;
                }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -55 || (info.offset.x < -15 && info.velocity.x < -500))
                    go(current + 1);
                  else if (info.offset.x > 55 || (info.offset.x > 15 && info.velocity.x > 500))
                    go(current - 1);
                }}
                onClickCapture={(event) => {
                  if (dragged.current) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                }}
              >
                <MilestoneCard item={memory} onOpen={onOpen} compact />
              </motion.div>
            );
          })}
        </div>
      </div>
      {count > 1 && (
        <div className="memory-swipe-controls">
          <span>划走这一张，发现下一份微光</span>
          <div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="上一张纪念"
              disabled={current === 0}
              onClick={() => go(current - 1)}
            >
              <ArrowLeft size={17} />
            </Button>
            <span className="memory-swipe-page" aria-live="polite" aria-atomic="true">
              {String(current + 1).padStart(2, '0')} <i>/ {String(count).padStart(2, '0')}</i>
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="下一张纪念"
              disabled={current === count - 1}
              onClick={() => go(current + 1)}
            >
              <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
