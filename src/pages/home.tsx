import { useMediaQuery } from '@/hooks/use-media-query';
import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Plus } from 'lucide-react';
import { Opening } from '@/features/home/opening';
import { ClubStory } from '@/features/home/club-story';
import { WorldSelector } from '@/features/home/world-selector';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { EventShowcase } from '@/features/home/event-showcase';
import { MemoryCarousel } from '@/features/home/memory-carousel';
import { EventDialog } from '@/features/events/event-dialog';
import { MilestoneDialog } from '@/features/milestones/milestone-dialog';
import { MilestoneEditor } from '@/features/milestones/milestone-editor';
import { api } from '@/lib/api';
import { today } from '@/lib/utils';
import type { ClubEvent, Milestone, Page, Stats } from '@shared/types';
import { ErrorState, Loading, EmptyState } from '@/components/states';

const ScrollStory = lazy(() =>
  import('@/features/home/cinema/scroll-story').then((module) => ({ default: module.ScrollStory })),
);
export function HomePage() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const shortLandscape = useMediaQuery('(max-height: 500px) and (min-aspect-ratio: 1/1)');
  const events = useQuery({
    queryKey: ['events'],
    queryFn: ({ signal }) => api<ClubEvent[]>('/events', { signal }),
  });
  const memories = useQuery({
    queryKey: ['milestones', 'home'],
    queryFn: ({ signal }) => api<Page<Milestone>>('/milestones', { signal }),
  });
  const stats = useQuery({
    queryKey: ['stats'],
    queryFn: ({ signal }) => api<Stats>('/stats', { signal }),
  });
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [memory, setMemory] = useState<Milestone | null>(null);
  const [editing, setEditing] = useState<Milestone>();
  const selectedEvents = [...(events.data || [])]
    .sort((a, b) => {
      const aPast = a.date < today(),
        bPast = b.date < today();
      return aPast !== bPast
        ? Number(aPast) - Number(bPast)
        : aPast
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
    })
    .slice(0, 3);
  return (
    <>
      {!reduced && !shortLandscape ? (
        <Suspense fallback={<Loading />}>
          <ScrollStory
            events={selectedEvents}
            memories={memories.data?.items || []}
            onEvent={setEvent}
            onMemory={setMemory}
            eventState={
              events.isPending ? (
                <Loading />
              ) : events.error ? (
                <ErrorState error={events.error} retry={() => events.refetch()} />
              ) : (
                <EmptyState
                  title="下一次相遇，正在酝酿"
                  body="活动发布后，会第一时间出现在这里。"
                />
              )
            }
            memoryState={
              memories.isPending ? (
                <Loading />
              ) : memories.error ? (
                <ErrorState error={memories.error} retry={() => memories.refetch()} />
              ) : (
                <EmptyState
                  title="故事，等你写下第一笔"
                  action={
                    <Button asChild>
                      <Link to="/milestones">写下第一条纪念</Link>
                    </Button>
                  }
                />
              )
            }
          />
        </Suspense>
      ) : (
        <>
          <Opening />
          <ClubStory />
          <section className="section events-section editorial-events">
            <Reveal className="section-heading">
              <div>
                <span className="eyebrow">02 / NEXT CHAPTER</span>
                <h2>
                  下一次，<span className="serif-accent">一起入镜。</span>
                </h2>
                <p>从线上聊到线下，让热爱真的发生。</p>
              </div>
              <Link to="/events" className="text-arrow">
                全部活动
                <ArrowUpRight size={18} />
              </Link>
            </Reveal>
            {events.isPending ? (
              <Loading />
            ) : events.error ? (
              <ErrorState error={events.error} retry={() => events.refetch()} />
            ) : selectedEvents.length ? (
              <EventShowcase events={selectedEvents} onOpen={setEvent} />
            ) : (
              <EmptyState title="下一次相遇，正在酝酿" body="活动发布后，会第一时间出现在这里。" />
            )}
          </section>
          <section className="home-memories scrapbook-section">
            <div className="section">
              <Reveal className="section-heading">
                <div>
                  <span className="eyebrow">03 / OUR LITTLE INFINITIES</span>
                  <h2>
                    微光纪念册<span className="heading-dot">✦</span>
                  </h2>
                  <p>社团的大日子，你的小成就。一起收进这本纪念册。</p>
                </div>
                <Link to="/milestones" className="text-arrow">
                  翻开纪念册
                  <ArrowUpRight size={18} />
                </Link>
              </Reveal>
              {memories.isPending ? (
                <Loading />
              ) : memories.error ? (
                <ErrorState error={memories.error} retry={() => memories.refetch()} />
              ) : memories.data?.items.length ? (
                <MemoryCarousel items={memories.data.items} onOpen={setMemory} />
              ) : (
                <EmptyState
                  title="故事，等你写下第一笔"
                  action={
                    <Button asChild>
                      <Link to="/milestones">
                        写下第一条纪念
                        <Plus />
                      </Link>
                    </Button>
                  }
                />
              )}
              <div className="memory-footnote">
                <span>每个人的故事，都有自己的位置。</span>
                {stats.data && (
                  <span>
                    已珍藏 <b>{stats.data.milestones}</b> 个闪光时刻<small>✦</small>
                  </span>
                )}
              </div>
            </div>
          </section>
          <WorldSelector />
          <section className="join-banner">
            <Reveal>
              <span className="eyebrow">YOUR STORY STARTS HERE</span>
              <h2>
                下一帧，<span>有你才完整。</span>
              </h2>
              <p>不需要自带技能点，带上喜欢的心情就好。</p>
              <Button asChild size="lg">
                <Link to="/join">
                  加入微光，开始我们的故事
                  <ArrowUpRight />
                </Link>
              </Button>
            </Reveal>
            <img
              className="join-mascot"
              src="/images/mascot-key-visual.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          </section>
        </>
      )}
      <EventDialog event={event} onClose={() => setEvent(null)} />
      <MilestoneDialog
        item={memory}
        onClose={() => setMemory(null)}
        onEdit={(m) => {
          setMemory(null);
          setEditing(m);
        }}
      />
      {editing && (
        <MilestoneEditor
          key={editing.id}
          open
          item={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
