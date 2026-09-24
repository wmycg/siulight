import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import type { ClubEvent } from '@shared/types';
import { api } from '@/lib/api';
import { today } from '@/lib/utils';
import { FilterTabs, FilterTabsList, FilterTabsTrigger } from '@/components/filter-tabs';
import { Input } from '@/components/ui/input';
import { Loading, ErrorState, EmptyState } from '@/components/states';
import { EventCard } from '@/features/events/event-card';
import { EventDialog } from '@/features/events/event-dialog';
import { Reveal } from '@/components/reveal';
import { CollectionReveal } from '@/components/collection-reveal';
export function EventsPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ClubEvent | null>(null);
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: ({ signal }) => api<ClubEvent[]>('/events', { signal }),
  });
  const items = data
    ?.filter(
      (e) =>
        (tab === 'all' || (tab === 'upcoming' ? e.date >= today() : e.date < today())) &&
        `${e.title}${e.brief}`.includes(search),
    )
    .sort((a, b) =>
      tab === 'upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
    );
  return (
    <div className="page-shell events-page">
      <Reveal className="page-intro event-page-intro">
        <div className="event-intro-copy">
          <span className="eyebrow">MEET OFFLINE, CONNECT FOR REAL</span>
          <h1>
            活动日历<span className="serif-accent"> / </span>
            <span className="event-intro-subtitle">热爱，约好了见。</span>
          </h1>
          <p>创作、放映、漫展、散步。和喜欢的人，做喜欢的事。</p>
          <div className="event-intro-note">
            <span>ANIMATION · PHOTOGRAPHY · GAME · MUSIC · COSPLAY</span>
            <span>MEET YOU THERE ↗</span>
          </div>
        </div>
        <div className="event-intro-art">
          <img src="/images/club-days.webp" alt="社团伙伴一起画画、分享摄影作品的二次元创作场景" />
          <span>OUR DAYS, IN FULL COLOR.</span>
        </div>
      </Reveal>
      <div className="filter-bar">
        <FilterTabs value={tab} onValueChange={setTab}>
          <FilterTabsList>
            <FilterTabsTrigger value="all">全部活动</FilterTabsTrigger>
            <FilterTabsTrigger value="upcoming">即将相遇</FilterTabsTrigger>
            <FilterTabsTrigger value="past">往期回顾</FilterTabsTrigger>
          </FilterTabsList>
        </FilterTabs>
        <div className="search-input">
          <Search size={16} />
          <Input
            aria-label="搜索活动"
            placeholder="找一场感兴趣的活动"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {isPending ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} retry={refetch} />
      ) : items?.length ? (
        <div className="event-grid events-page-grid" key={`${tab}:${search}`}>
          {items.map((e, i) => (
            <CollectionReveal key={e.id} index={i}>
              <EventCard event={e} onOpen={setSelected} />
            </CollectionReveal>
          ))}
        </div>
      ) : (
        <EmptyState
          title="这一页，还在等新的相遇"
          body={search ? '换个关键词，再找找看吧。' : '有新活动时，我们会把它放在这里。'}
        />
      )}
      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
