import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  ArrowDown,
  Camera,
  Palette,
  Gamepad2,
  PenTool,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { EventCard } from '@/features/events/event-card';
import { EventDialog } from '@/features/events/event-dialog';
import { MilestoneCard } from '@/features/milestones/milestone-card';
import { MilestoneDialog } from '@/features/milestones/milestone-dialog';
import { MilestoneEditor } from '@/features/milestones/milestone-editor';
import { api } from '@/lib/api';
import { today } from '@/lib/utils';
import { departments } from '@shared/content';
import type { ClubEvent, Milestone, Page, Stats } from '@shared/types';
import { ErrorState, Loading, EmptyState } from '@/components/states';
export function HomePage() {
  const target = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const events = useQuery({ queryKey: ['events'], queryFn: () => api<ClubEvent[]>('/events') });
  const memories = useQuery({
    queryKey: ['milestones', 'home'],
    queryFn: () => api<Page<Milestone>>('/milestones'),
  });
  const stats = useQuery({ queryKey: ['stats'], queryFn: () => api<Stats>('/stats') });
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [memory, setMemory] = useState<Milestone | null>(null);
  const [editing, setEditing] = useState<Milestone>();
  const icons = [Palette, Camera, Gamepad2, PenTool, Sparkles];
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
      <section className="home-hero" ref={target}>
        <motion.img
          className="hero-art"
          src="/images/summer.webp"
          alt="夏日海边，两位带着相机的伙伴站在山坡上，望向明亮的远方"
          style={reduced ? undefined : { y }}
          fetchPriority="high"
        />
        <div className="hero-wash" />
        <div className="hero-content">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-eyebrow">
              <span />
              把喜欢的事，变成我们的日常
            </div>
            <h1>
              微光漫摄<span className="hero-star">✦</span>
            </h1>
            <p className="hero-headline">
              把热爱，
              <br />
              留在这一帧。
            </p>
            <p className="hero-description">
              在二次元与现实之间，
              <br />
              和同频的人，一起创作、相遇、发光。
            </p>
            <div className="hero-actions">
              <Button asChild size="lg">
                <Link to="/join">
                  找到你的同好
                  <ArrowUpRight />
                </Link>
              </Button>
              <Link className="hero-secondary" to="/milestones">
                翻开微光纪念册
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="hero-bottom">
          <span>青春没有标准答案，热爱就是我们的坐标。</span>
          <a href="#discover" aria-label="向下探索">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown size={16} />
          </a>
        </div>
        <div className="hero-side-note">A LITTLE LIGHT. AN INFINITE WORLD.</div>
      </section>
      <div className="interest-ribbon" aria-label="我们的热爱">
        <span>ANIMATION</span>
        <i>✦</i>
        <span>COMICS</span>
        <i>✦</i>
        <span>GAMES</span>
        <i>✦</i>
        <span>PHOTOGRAPHY</span>
        <i>✦</i>
        <span>AND YOU</span>
      </div>
      <section className="section about-teaser" id="discover">
        <Reveal className="about-aside">
          <span className="eyebrow">01 / HELLO, WE ARE SIULIGHT</span>
          <span className="outline-star">✳</span>
        </Reveal>
        <Reveal className="about-teaser-copy">
          <h2>
            一个人热爱，
            <br />
            一群人<span className="accent-hand">闪闪发光。</span>
          </h2>
          <div className="about-description">
            <p>
              一部反复重温的番剧，一张舍不得删的照片，
              <br className="desktop-break" />
              一个还没讲完的故事——
              <br />
              在微光，你的「小众」热爱，总有人懂。
            </p>
            <Link to="/about" className="text-arrow">
              认识微光
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
      <section className="section events-section">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow">02 / NEXT CHAPTER</span>
            <h2>
              下一次相遇<span className="heading-dot">.</span>
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
          <div className="event-grid">
            {selectedEvents.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.08}>
                <EventCard event={e} onOpen={setEvent} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="下一次相遇，正在酝酿" body="活动发布后，会第一时间出现在这里。" />
        )}
      </section>
      <section className="home-memories">
        <div className="section">
          <Reveal className="section-heading">
            <div>
              <span className="eyebrow">03 / OUR LITTLE INFINITIES</span>
              <h2>
                每一束微光，都值得被记住<span className="heading-dot">.</span>
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
            <div className="home-memory-grid">
              {memories.data.items.slice(0, 3).map((m, i) => (
                <Reveal key={m.id} delay={i * 0.07}>
                  <MilestoneCard item={m} onOpen={setMemory} compact />
                </Reveal>
              ))}
            </div>
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
      <section className="section departments-teaser">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow">04 / FIND YOUR PEOPLE</span>
            <h2>
              你的热爱，有处安放<span className="heading-dot">.</span>
            </h2>
          </div>
          <Link to="/departments" className="text-arrow">
            认识五个部门
            <ArrowUpRight size={18} />
          </Link>
        </Reveal>
        <div className="department-links">
          {departments.map((d, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={d.id} delay={i * 0.04}>
                <Link to={`/departments#${d.id}`}>
                  <span className="department-icon">
                    <Icon strokeWidth={1.4} />
                  </span>
                  <h3>{d.name}</h3>
                  <p>{d.intro}</p>
                  <ArrowUpRight className="department-arrow" size={17} />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
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
        <span className="banner-star" aria-hidden="true">
          ✦
        </span>
      </section>
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
