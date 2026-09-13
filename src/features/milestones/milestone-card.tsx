import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Milestone } from '@shared/types';
import { AvatarGroup } from '@/components/avatar';
import { MilestoneLike } from './milestone-like';
import { formatDate } from '@/lib/utils';
export function MilestoneCard({
  item,
  onOpen,
  compact = false,
}: {
  item: Milestone;
  onOpen: (m: Milestone) => void;
  compact?: boolean;
}) {
  return (
    <article
      className={`memory-card ${item.image ? 'has-image' : 'text-memory'} ${compact ? 'compact' : ''}`}
    >
      <span className="memory-paper-tab" aria-hidden="true">
        {item.kind === 'club' ? 'OUR STORY' : 'MY CHAPTER'}
      </span>
      <button
        className="memory-open"
        onClick={() => onOpen(item)}
        aria-label={`阅读：${item.title}`}
      >
        {item.image && (
          <div className="memory-image">
            <img src={item.image} alt="" loading="lazy" />
            <span className="memory-open-arrow">
              <ArrowUpRight size={18} />
            </span>
          </div>
        )}
        <div className="memory-copy">
          <div className="memory-meta">
            <span className={item.kind === 'club' ? 'club-label' : ''}>
              {item.kind === 'club' ? '✦ 社团纪念' : item.category}
            </span>
            <time dateTime={item.date}>{formatDate(item.date, false)}</time>
          </div>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </div>
      </button>
      <div className="memory-bottom">
        <div className="memory-authors">
          <AvatarGroup members={item.participants.length ? item.participants : [item.author]} />
          <span>
            {item.participants.length > 1 ? (
              `${item.author.name}等 ${item.participants.length} 人`
            ) : (
              <Link to={`/members/${item.authorId}`}>{item.author.name}</Link>
            )}
          </span>
        </div>
        <MilestoneLike item={item} />
      </div>
    </article>
  );
}
