import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { Milestone } from '@shared/types';
import { formatDate } from '@/lib/utils';
import type { SceneProps } from './frame';
import { useMediaQuery } from '@/hooks/use-media-query';

function MemoryColumn({
  items,
  column,
  onOpen,
  progress,
  index,
  duration,
}: SceneProps & {
  duration: number;
  items: Milestone[];
  column: number;
  onOpen: (item: Milestone) => void;
}) {
  const element = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  useEffect(() => {
    const el = element.current;
    if (!el) return;
    const measure = () => {
      const viewport = el.closest('.cinema-memories')?.clientHeight || 700;
      setTravel(items.length > 1 ? Math.max(0, el.scrollHeight - (viewport - 280)) : 0);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.parentElement) observer.observe(el.parentElement);
    measure();
    return () => observer.disconnect();
  }, [items.length]);
  const reverse = column % 2 === 1;
  const start = reverse ? -travel : 15;
  const end = reverse ? 15 : -travel;
  const y = useTransform(
    progress,
    [index - 0.9, index, index + Math.max(0.1, duration - 1), index + duration - 0.1],
    [start + (reverse ? -100 : 100), start, end, end + (reverse ? 100 : -100)],
  );
  return (
    <motion.div ref={element} className="cinema-memory-column" style={{ y }}>
      {items.map((item, i) => (
        <button
          key={item.id}
          className={`cinema-memory-note ${item.image ? 'with-photo' : 'with-lines'}`}
          style={{ rotate: `${(i % 2 ? 1 : -1) * (column + 1)}deg` }}
          onClick={() => onOpen(item)}
          aria-label={`阅读：${item.title}`}
        >
          {item.image && <img src={item.image} alt="" draggable={false} />}
          <span className="cinema-note-meta">
            {item.kind === 'club' ? '✦ 社团纪念' : item.category}
            <time dateTime={item.date}>{formatDate(item.date, false)}</time>
          </span>
          <h3>{item.title}</h3>
          {!item.image && <p>{item.body}</p>}
          <span className="cinema-note-author">
            <i style={{ background: item.author.color }}>{item.author.name.slice(0, 1)}</i>
            {item.author.name}
            {item.participants.length > 1 && ` 等 ${item.participants.length} 人`}
            <ArrowUpRight size={15} />
          </span>
        </button>
      ))}
    </motion.div>
  );
}
export function MemoryWall({
  items,
  onOpen,
  ...scene
}: SceneProps & { duration: number; items: Milestone[]; onOpen: (item: Milestone) => void }) {
  const mobile = useMediaQuery('(max-width: 760px)');
  const visible = items.slice(0, 12);
  const count = Math.min(visible.length, mobile ? 2 : 3);
  return (
    <div className={`cinema-memories ${visible.length <= 2 ? 'is-small' : ''}`}>
      <div className="cinema-memory-heading">
        <span className="eyebrow">OUR LITTLE INFINITIES</span>
        <h2>
          微光纪念册<span className="serif-accent"> ✦</span>
        </h2>
        <p>
          社团的大日子，你的小成就。
          <br className="cinema-mobile-break" />
          每一帧，都历历在目。
        </p>
      </div>
      <div className="cinema-memory-river">
        {Array.from({ length: count }, (_, column) => (
          <MemoryColumn
            key={column}
            {...scene}
            column={column}
            onOpen={onOpen}
            items={visible.filter((_, i) => i % count === column)}
          />
        ))}
      </div>
      <Link to="/milestones" className="cinema-memory-link">
        翻开纪念册 · 写下你的故事 <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
