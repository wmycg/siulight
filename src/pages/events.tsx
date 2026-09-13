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
export function EventsPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ClubEvent | null>(null);
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => api<ClubEvent[]>('/events'),
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
    <div className="page-shell">
      <Reveal className="page-intro">
        <span className="eyebrow">MEET OFFLINE, CONNECT FOR REAL</span>
        <h1>
          把「下次一定」，
          <br />
          变成<span className="serif-accent">这次见面。</span>
        </h1>
        <p>创作、放映、漫展、散步。和喜欢的人，做喜欢的事。</p>
        <span className="intro-decoration" aria-hidden="true">
          ↗
        </span>
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
        <div className="event-grid events-page-grid">
          {items.map((e, i) => (
            <Reveal key={e.id} delay={(i % 3) * 0.05}>
              <EventCard event={e} onOpen={setSelected} />
            </Reveal>
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
