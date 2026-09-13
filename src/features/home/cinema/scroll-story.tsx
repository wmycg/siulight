import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from 'motion/react';
import type { ClubEvent, Milestone } from '@shared/types';
import { Opening } from '../opening';
import { useChapterScroll } from './use-chapter-scroll';
import { useStageGeometry } from './use-stage-geometry';
import { Frame } from './frame';
import { ClosingScene, EventScene, Introduction, WorldsScene } from './scenes';
import { MemoryWall } from './memory-wall';

export function ScrollStory({
  events,
  memories,
  onEvent,
  onMemory,
  eventState,
  memoryState,
}: {
  events: ClubEvent[];
  memories: Milestone[];
  onEvent: (event: ClubEvent) => void;
  onMemory: (memory: Milestone) => void;
  eventState: ReactNode;
  memoryState: ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.classList.add('cinema-mode');
    return () => {
      document.documentElement.classList.remove('cinema-mode');
    };
  }, []);
  const geometry = useStageGeometry();
  const eventCount = Math.max(1, events.length);
  const memoryDuration =
    memories.length > 2 ? Math.max(2, Math.ceil(Math.min(12, memories.length) / 3)) : 1;
  const memoryIndex = 2 + eventCount,
    worldIndex = memoryIndex + memoryDuration,
    last = worldIndex + 1;
  const labels = [
    '初见',
    '同频',
    ...Array.from({ length: eventCount }, (_, i) => `相遇 ${i + 1}`),
    '纪念',
    '次元',
    '有你',
  ];
  const stops = [
    0,
    1,
    ...Array.from({ length: eventCount }, (_, i) => i + 2),
    memoryIndex,
    worldIndex,
    last,
  ];
  const [active, setActive] = useState(0);
  const { scrollY } = useScroll();
  const raw = useTransform(scrollY, (value) => {
    const position = Math.max(0, Math.min(last, value / geometry.step));
    // Let the memory wall flow during its extended chapter; other scenes get a reading pause.
    if (position >= memoryIndex && position <= worldIndex - 1) return position;
    const whole = Math.floor(position);
    const phase = position - whole;
    const transition = Math.max(0, Math.min(1, (phase - 0.3) / 0.45));
    return whole + transition;
  });
  const progress = useSpring(raw, { stiffness: 160, damping: 28, restDelta: 0.0005 });
  useLayoutEffect(() => {
    // Start from the actual first frame, without a spring journey from restored history.
    scrollY.jump(0);
    progress.jump(0);
  }, [scrollY, progress]);
  const departure = useTransform(progress, [0, 1], [0, 1]);
  useMotionValueEvent(progress, 'change', (value) =>
    setActive(stops.reduce((chapter, stop, i) => (value >= stop - 0.5 ? i : chapter), 0)),
  );
  const turnTo = useChapterScroll(geometry.step, last, memoryIndex, worldIndex - 1);
  function go(index: number) {
    turnTo(stops[Math.max(0, Math.min(labels.length - 1, index))]);
  }
  return (
    <div
      className="cinema-scroll"
      style={
        {
          height: geometry.height + last * geometry.step,
          '--cinema-header': `${geometry.header}px`,
        } as React.CSSProperties
      }
    >
      <div ref={stage} className="cinema-stage" style={{ height: geometry.height }}>
        <Frame
          progress={progress}
          index={0}
          active={active === 0}
          name="初见微光"
          className="cinema-first"
        >
          <motion.div
            className="cinema-opening"
            style={{ '--departure': departure } as MotionStyle}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a[href="#discover"]')) {
                e.preventDefault();
                go(1);
              }
            }}
          >
            <Opening immersive />
          </motion.div>
        </Frame>
        <Frame progress={progress} index={1} active={active === 1} name="幸好我们同频">
          <Introduction progress={progress} index={1} />
        </Frame>
        {events.length ? (
          events.map((event, i) => (
            <Frame
              key={event.id}
              progress={progress}
              index={i + 2}
              active={active === i + 2}
              name={`活动：${event.title}`}
            >
              <EventScene
                progress={progress}
                index={i + 2}
                event={event}
                order={i}
                total={events.length}
                onOpen={onEvent}
              />
            </Frame>
          ))
        ) : (
          <Frame progress={progress} index={2} active={active === 2} name="下一次相遇">
            <div className="cinema-state">{eventState}</div>
          </Frame>
        )}
        <Frame
          progress={progress}
          index={memoryIndex}
          duration={memoryDuration}
          active={active === memoryIndex}
          name="微光纪念册"
        >
          {memories.length ? (
            <MemoryWall
              duration={memoryDuration}
              progress={progress}
              index={memoryIndex}
              items={memories}
              onOpen={onMemory}
            />
          ) : (
            <div className="cinema-state">{memoryState}</div>
          )}
        </Frame>
        <Frame
          progress={progress}
          index={worldIndex}
          active={active === labels.length - 2}
          name="你的热爱在哪个次元"
        >
          <WorldsScene progress={progress} index={worldIndex} />
        </Frame>
        <Frame
          progress={progress}
          index={last}
          active={active === labels.length - 1}
          name="下一帧，有你才完整"
        >
          <ClosingScene progress={progress} index={last} />
        </Frame>
        <nav className="cinema-chapters" aria-label="首页章节">
          {labels.map((label, i) => (
            <button
              key={`${label}-${i}`}
              data-stop={stops[i]}
              aria-label={`前往${label}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => go(i)}
            >
              <span>{label}</span>
              <i />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
