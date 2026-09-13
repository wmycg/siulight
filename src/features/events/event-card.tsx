import { ArrowUpRight, MapPin } from 'lucide-react';
import type { ClubEvent } from '@shared/types';
import { formatDate, today } from '@/lib/utils';
export function EventCard({
  event,
  onOpen,
}: {
  event: ClubEvent;
  onOpen: (event: ClubEvent) => void;
}) {
  const ended = event.date < today();
  return (
    <button className="event-card" onClick={() => onOpen(event)}>
      <div className="event-image">
        {event.image ? (
          <img src={event.image} alt="" loading="lazy" />
        ) : (
          <div className="image-placeholder">
            <span>
              微光
              <br />
              相遇
            </span>
          </div>
        )}
        <span className={`image-tag ${ended ? 'ended' : ''}`}>
          {ended ? '活动回顾' : '即将相遇'}
        </span>
        <span className="image-arrow">
          <ArrowUpRight size={21} />
        </span>
      </div>
      <div className="event-meta">
        <span>{event.category}</span>
        <span>{formatDate(event.date)}</span>
      </div>
      <h3>{event.title}</h3>
      <p>{event.brief}</p>
      <div className="event-place">
        <MapPin size={13} />
        {event.place}
      </div>
    </button>
  );
}
