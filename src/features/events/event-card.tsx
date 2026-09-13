import { ArrowUpRight, MapPin } from 'lucide-react';
import type { ClubEvent } from '@shared/types';
import { today } from '@/lib/utils';
export function EventCard({
  event,
  onOpen,
}: {
  event: ClubEvent;
  onOpen: (event: ClubEvent) => void;
}) {
  const ended = event.date < today();
  return (
    <button
      className="event-card event-ticket-card"
      onClick={() => onOpen(event)}
      aria-label={`查看活动：${event.title}`}
    >
      <div className="event-image">
        <img src={event.image || '/images/club-days.webp'} alt="" loading="lazy" />
        <span className={`image-tag ${ended ? 'ended' : ''}`}>
          {ended ? '活动回顾' : '即将相遇'}
        </span>
        <span className="event-image-label" aria-hidden="true">
          SIULIGHT / MEET YOU THERE
        </span>
        <span className="image-arrow">
          <ArrowUpRight size={21} />
        </span>
      </div>
      <div className="event-ticket-body">
        <time className="event-ticket-date" dateTime={event.date}>
          <b>{event.date.slice(8)}</b>
          <span>{event.date.slice(0, 7).replace('-', '.')}</span>
        </time>
        <div className="event-ticket-copy">
          <span className="event-ticket-category">{event.category}</span>
          <h3>{event.title}</h3>
          <p>{event.brief}</p>
          <span className="event-place">
            <MapPin size={13} />
            {event.place}
          </span>
        </div>
      </div>
      <div className="event-ticket-foot">
        <span>{ended ? '珍藏这次相遇' : '你的席位，等你来领取'}</span>
        <span aria-hidden="true">✦ ADMIT ONE</span>
      </div>
    </button>
  );
}
