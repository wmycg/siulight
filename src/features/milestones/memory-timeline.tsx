import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'motion/react';
import { ArrowDown, ArrowUpRight, ChevronDown, ChevronUp, LoaderCircle, Users } from 'lucide-react';
import type { MemoryChapter, MemoryGroup, Milestone, Page } from '@shared/types';
import { api } from '@/lib/api';
import { Avatar } from '@/components/avatar';
import { MilestoneCard } from './milestone-card';
import { MilestoneLike } from './milestone-like';
import { ErrorState } from '@/components/states';

function endpoint(path: string, filters: string, extra: Record<string, string>) {
  const params = new URLSearchParams(filters);
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  return `${path}?${params}`;
}
function LittleMoment({ item, onOpen }: { item: Milestone; onOpen: (item: Milestone) => void }) {
  return (
    <article className={`little-moment ${item.image ? 'with-photo' : ''}`}>
      <div className="moment-person">
        <Avatar member={item.author} />
        <span>{item.author.name}</span>
        <small>
          {item.category} ·{' '}
          <time dateTime={item.date}>{item.date.slice(5).replace('-', ' / ')}</time>
        </small>
      </div>
      <button
        className="moment-read"
        onClick={() => onOpen(item)}
        aria-label={`阅读：${item.title}`}
      >
        {item.image && <img src={item.image} alt="" loading="lazy" />}
        <div>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          <span className="moment-more">
            翻开这一刻 <ArrowUpRight size={14} />
          </span>
        </div>
      </button>
      <div className="moment-foot">
        <span>
          {item.participants.length > 1
            ? `与 ${item.participants
                .filter((person) => person.id !== item.authorId)
                .slice(0, 2)
                .map((person) => person.name)
                .join('、')}等伙伴共同记录`
            : '一个人的小小里程碑'}
        </span>
        <MilestoneLike item={item} />
      </div>
    </article>
  );
}
function StoryGroup({
  group,
  month,
  filters,
  index,
  onOpen,
}: {
  group: MemoryGroup;
  month: string;
  filters: string;
  index: number;
  onOpen: (item: Milestone) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const detail = useInfiniteQuery({
    queryKey: ['milestones', 'group', filters, month, group.key],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      api<Page<Milestone>>(
        endpoint('/milestones', filters, {
          month,
          page: String(pageParam),
          ...(group.eventId ? { eventId: group.eventId } : { date: group.date, unlinked: 'true' }),
        }),
        { signal },
      ),
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
    enabled: expanded,
  });
  const moments =
    expanded && detail.data ? detail.data.pages.flatMap((page) => page.items) : group.preview;
  const event = group.type === 'event';
  const official = !event && group.preview.some((item) => item.kind === 'club');
  const date = group.date.slice(8);
  const bodyId = `story-${month}-${group.key.replaceAll(':', '-')}`;
  return (
    <motion.section
      className={`chronicle-node ${event || official ? 'is-featured' : index % 2 ? 'node-right' : 'node-left'}`}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: reduced ? 0 : 0.4 }}
    >
      <div className="node-date">
        <time dateTime={group.date}>{date}</time>
        <small>{month.slice(5)} 月</small>
        <i />
      </div>
      <div className="node-content">
        {event && (
          <button
            className="event-story-cover"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={bodyId}
          >
            {group.cover ? (
              <img src={group.cover} alt="" loading="lazy" />
            ) : (
              <div className="event-story-blank">
                <span>✳</span>一起发生的故事
              </div>
            )}
            <div className="event-story-caption">
              <span className="eyebrow">
                共同活动 ·{' '}
                <time dateTime={group.date}>
                  {Number(month.slice(5))} 月 {Number(group.date.slice(8))} 日
                </time>
              </span>
              <h3>{group.title}</h3>
              <p>
                <Users size={14} />
                {group.people} 位伙伴 <span>·</span> {group.count} 段回忆
              </p>
              <span className="event-story-open">
                {expanded ? '收起故事' : '展开大家的回忆'}{' '}
                {expanded ? <ChevronUp size={17} /> : <ArrowUpRight size={17} />}
              </span>
            </div>
            <span className="event-story-stamp" aria-hidden="true">
              OUR
              <br />
              DAYS.
            </span>
          </button>
        )}
        <AnimatePresence initial={false}>
          {(!event || expanded) && (
            <motion.div
              key="content"
              id={bodyId}
              initial={reduced || !event ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.24 }}
              className="node-details"
            >
              {!event && group.count > 1 && (
                <div className="day-caption">这一天，留下了 {group.count} 个瞬间</div>
              )}
              <div className={event ? 'event-memory-list' : 'day-memory-list'}>
                {moments.map((item) =>
                  item.kind === 'club' && !event ? (
                    <MilestoneCard key={item.id} item={item} onOpen={onOpen} />
                  ) : (
                    <LittleMoment key={item.id} item={item} onOpen={onOpen} />
                  ),
                )}
              </div>
              {detail.isError && <ErrorState error={detail.error} retry={() => detail.refetch()} />}
              {expanded && detail.isPending && (
                <div className="chronicle-loading">
                  <LoaderCircle size={16} className="animate-spin" />
                  正在翻开更多回忆…
                </div>
              )}
              {!event && !expanded && group.count > group.preview.length && (
                <button
                  className="more-moments"
                  onClick={() => setExpanded(true)}
                  aria-expanded={false}
                >
                  这一天还有 {group.count - group.preview.length} 个瞬间 <ChevronDown size={15} />
                </button>
              )}
              {expanded && detail.hasNextPage && (
                <button
                  className="more-moments"
                  disabled={detail.isFetchingNextPage}
                  onClick={() => void detail.fetchNextPage()}
                >
                  {detail.isFetchingNextPage ? '正在翻页…' : '继续看这段故事'}{' '}
                  <ArrowDown size={15} />
                </button>
              )}
              {!event && expanded && (
                <button
                  className="more-moments"
                  onClick={() => setExpanded(false)}
                  aria-expanded={true}
                >
                  收起这一天 <ChevronUp size={15} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
function MonthStories({
  month,
  filters,
  onOpen,
}: {
  month: string;
  filters: string;
  onOpen: (item: Milestone) => void;
}) {
  const stories = useInfiniteQuery({
    queryKey: ['milestones', 'timeline', filters, month],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      api<Page<MemoryGroup>>(
        endpoint('/milestones/timeline', filters, { month, page: String(pageParam) }),
        { signal },
      ),
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
  });
  if (stories.isPending)
    return (
      <div className="chronicle-loading">
        <LoaderCircle className="animate-spin" size={18} />
        正在翻开这一月…
      </div>
    );
  if (stories.isError) return <ErrorState error={stories.error} retry={() => stories.refetch()} />;
  return (
    <div className="month-stories">
      {stories.data.pages
        .flatMap((page) => page.items)
        .map((group, index) => (
          <StoryGroup
            key={group.key}
            group={group}
            index={index}
            month={month}
            filters={filters}
            onOpen={onOpen}
          />
        ))}
      {stories.hasNextPage && (
        <button
          className="month-more"
          disabled={stories.isFetchingNextPage}
          onClick={() => void stories.fetchNextPage()}
        >
          {stories.isFetchingNextPage ? '正在翻页…' : '继续翻阅这一月'} <ArrowDown size={15} />
        </button>
      )}
    </div>
  );
}
export function MemoryTimeline({
  chapters,
  filters,
  onOpen,
}: {
  chapters: MemoryChapter[];
  filters: string;
  onOpen: (item: Milestone) => void;
}) {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(chapters[0] ? [chapters[0].month] : []),
  );
  const [activeYear, setActiveYear] = useState(chapters[0]?.month.slice(0, 4));
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: root, offset: ['start center', 'end center'] });
  const years = [...new Set(chapters.map((chapter) => chapter.month.slice(0, 4)))];
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveYear(visible.target.id.slice(8, 12));
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    root.current?.querySelectorAll('.chronicle-month').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [chapters]);
  function toggle(month: string) {
    setActiveYear(month.slice(0, 4));
    setOpen((old) => {
      const next = new Set(old);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  }
  return (
    <div className="memory-chronicle" ref={root}>
      <aside className="chronicle-rail">
        <span className="eyebrow">THE YEARS</span>
        <nav aria-label="纪念册年份导航">
          {years.map((year) => (
            <button
              key={year}
              className={activeYear === year ? 'active' : ''}
              onClick={() => {
                const first = chapters.find((chapter) => chapter.month.startsWith(year))!;
                setActiveYear(year);
                setOpen((old) => new Set([...old, first.month]));
                document
                  .getElementById(`chapter-${first.month}`)
                  ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
              }}
            >
              {year}
              <span>
                {chapters
                  .filter((c) => c.month.startsWith(year))
                  .reduce((sum, c) => sum + c.count, 0)}{' '}
                个瞬间
              </span>
            </button>
          ))}
        </nav>
        <p>
          展开月份，
          <br />
          翻看每一天。
        </p>
      </aside>
      <div className="chronicle-main">
        <div className="chronicle-line" aria-hidden="true">
          <motion.i style={{ scaleY: reduced ? 1 : scrollYProgress }} />
        </div>
        {chapters.map((chapter, index) => {
          const expanded = open.has(chapter.month);
          const newYear =
            index === 0 || chapters[index - 1].month.slice(0, 4) !== chapter.month.slice(0, 4);
          return (
            <section
              className="chronicle-month"
              key={chapter.month}
              id={`chapter-${chapter.month}`}
            >
              {newYear && (
                <div className="chronicle-year">
                  <span>{chapter.month.slice(0, 4)}</span>
                  <small>我们的这一年</small>
                </div>
              )}
              <button
                className={`month-heading ${expanded ? 'expanded' : ''}`}
                aria-expanded={expanded}
                aria-controls={`month-${chapter.month}`}
                onClick={() => toggle(chapter.month)}
              >
                <span className="month-number">
                  {chapter.month.slice(5)}
                  <small>月</small>
                </span>
                <span className="month-heading-copy">
                  <strong>这一月的回忆</strong>
                  <small>
                    {chapter.count} 个瞬间 · {chapter.people} 位伙伴
                  </small>
                </span>
                {!expanded && chapter.cover && (
                  <span className="month-photo-stack" aria-hidden="true">
                    <img src={chapter.cover} alt="" loading="lazy" />
                  </span>
                )}
                <span className="month-toggle">
                  {expanded ? '收起本月' : '展开本月'}
                  {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    key={chapter.month}
                    id={`month-${chapter.month}`}
                    initial={index === 0 || reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.25 }}
                    className="month-reveal"
                  >
                    <MonthStories month={chapter.month} filters={filters} onOpen={onOpen} />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
        <div className="chronicle-end">
          <span>✳</span>
          <p>每一步，都算数。</p>
        </div>
      </div>
    </div>
  );
}
