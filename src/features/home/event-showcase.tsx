import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClubEvent } from '@shared/types';
import { today } from '@/lib/utils';

export function EventShowcase({
  events,
  onOpen,
}: {
  events: ClubEvent[];
  onOpen: (event: ClubEvent) => void;
}) {
  const [selectedId, setSelectedId] = useState(events[0]?.id);
  const reduced = useReducedMotion();
  const swiped = useRef(false);
  const index = Math.max(
    0,
    events.findIndex((event) => event.id === selectedId),
  );
  const current = events[index];
  if (!current) return null;
  function step(direction: number) {
    setSelectedId(events[(index + direction + events.length) % events.length].id);
  }
  return (
    <div className="event-showcase">
      <motion.div
        className="showcase-poster"
        onPointerDownCapture={() => {
          swiped.current = false;
        }}
        onPanStart={() => {
          swiped.current = true;
        }}
        onPanEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 45 && Math.abs(info.offset.x) > Math.abs(info.offset.y))
            step(info.offset.x < 0 ? 1 : -1);
        }}
        onClickCapture={(event) => {
          if (swiped.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <div className="showcase-art" aria-hidden="true">
          {events.map((event) => (
            <motion.img
              key={event.id}
              src={event.image || '/images/club-days.webp'}
              alt=""
              draggable={false}
              initial={false}
              animate={{ opacity: event.id === current.id ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.3 }}
            />
          ))}
          <span className="showcase-category">
            {current.category} <i> / </i> {current.date < today() ? 'REPLAY' : 'COMING SOON'}
          </span>
        </div>
        <div className="showcase-ticket">
          <time dateTime={current.date}>
            <b>{current.date.slice(8)}</b>
            <span>{current.date.slice(0, 7).replace('-', ' / ')}</span>
          </time>
          <motion.div
            key={current.id}
            initial={reduced ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h3>{current.title}</h3>
            <p>
              <MapPin size={13} />
              {current.place}
            </p>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpen(current)}
            aria-label={`查看活动：${current.title}`}
          >
            <ArrowUpRight />
          </Button>
        </div>
      </motion.div>
      <div className="showcase-program">
        <div className="showcase-program-label">
          <span>相遇预告 / THE PROGRAM</span>
          <span>
            0{index + 1} — 0{events.length}
          </span>
        </div>
        <div className="showcase-options" role="group" aria-label="选择主推活动">
          {events.map((event, i) => (
            <button
              key={event.id}
              aria-pressed={index === i}
              onClick={() => setSelectedId(event.id)}
            >
              <span className="showcase-option-index">0{i + 1}</span>
              <span>
                <small>
                  {event.date.replaceAll('-', '.')} · {event.category}
                </small>
                <b>{event.title}</b>
              </span>
              <ArrowUpRight size={19} />
            </button>
          ))}
        </div>
        <div className="showcase-controls">
          <p>
            <span className="showcase-desktop-caption">把「下次一定」，变成这次见面。</span>
            <span className="showcase-mobile-caption">左右滑动，发现下一场相遇</span>
          </p>
          <div>
            <Button
              variant="outline"
              size="icon"
              aria-label="上一个主推活动"
              onClick={() => step(-1)}
              disabled={events.length < 2}
            >
              <ArrowLeft size={17} />
            </Button>
            <span className="showcase-mobile-page" aria-live="polite" aria-atomic="true">
              {String(index + 1).padStart(2, '0')} <i>/ {String(events.length).padStart(2, '0')}</i>
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="下一个主推活动"
              onClick={() => step(1)}
              disabled={events.length < 2}
            >
              <ArrowRight size={17} />
            </Button>
          </div>
        </div>
        <Button className="showcase-open" onClick={() => onOpen(current)}>
          翻开这场相遇 <ArrowUpRight size={18} />
        </Button>
      </div>
    </div>
  );
}
