import { Link } from 'react-router-dom';
import { motion, useTransform } from 'motion/react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { departments } from '@shared/content';
import type { ClubEvent } from '@shared/types';
import type { SceneProps } from './frame';
import { useMediaQuery } from '@/hooks/use-media-query';
import { SceneMascot } from './scene-mascot';

export function Introduction({ progress, index }: SceneProps) {
  const spread = useTransform(progress, [index - 1, index, index + 1], [0.65, 1, 1.4]);
  const rotate = useTransform(progress, [index - 1, index + 1], [-35, 35]);
  return (
    <div className="cinema-introduction">
      <motion.div className="cinema-frequency" style={{ scale: spread, rotate }} aria-hidden="true">
        <i />
        <i />
        <i />
      </motion.div>
      <div className="cinema-intro-copy">
        <img src="/images/club-original.png" alt="微光漫摄社团徽标" className="cinema-seal" />
        <span className="eyebrow">MORE THAN A FANDOM</span>
        <h2>
          喜欢的世界很大，
          <br />
          幸好<span className="serif-accent">我们同频。</span>
        </h2>
        <p>
          一部反复重温的番剧，一个还没画完的角色。
          <br />
          在微光，你的「小众」热爱，总有人懂。
        </p>
        <Link to="/about" className="text-arrow">
          认识微光 <ArrowUpRight size={18} />
        </Link>
      </div>
      <span className="cinema-margin-note">OUR CLUB. OUR LITTLE UNIVERSE.</span>
    </div>
  );
}

export function EventScene({
  event,
  order,
  total,
  onOpen,
  progress,
  index,
}: SceneProps & {
  event: ClubEvent;
  order: number;
  total: number;
  onOpen: (event: ClubEvent) => void;
}) {
  const x = useTransform(progress, [index - 1, index, index + 1], ['16%', '0%', '-12%']);
  const imageX = useTransform(progress, [index - 1, index, index + 1], ['-5%', '0%', '5%']);
  return (
    <div className="cinema-event">
      <motion.div className="cinema-event-image" style={{ x }}>
        <motion.img
          style={{ x: imageX }}
          src={event.image || '/images/club-days.webp'}
          alt=""
          draggable={false}
        />
        <span className="cinema-photo-caption">
          SIULIGHT / RENDEZVOUS {String(order + 1).padStart(2, '0')}
        </span>
      </motion.div>
      <div className="cinema-event-copy">
        <SceneMascot
          pose={
            event.category.includes('摄影')
              ? 'photographer'
              : event.category.includes('漫画')
                ? 'artist'
                : 'keeper'
          }
          progress={progress}
          index={index}
          className="mascot-event-ghost"
        />
        <span className="eyebrow">
          NEXT CHAPTER / {String(order + 1).padStart(2, '0')} — {String(total).padStart(2, '0')}
        </span>
        <p className="cinema-event-prelude">
          下一次，<span>一起入镜。</span>
        </p>
        <time dateTime={event.date}>
          <b>{event.date.slice(8)}</b>
          <span>
            {event.date.slice(0, 7).replace('-', ' / ')}
            <i>{event.category}</i>
          </span>
        </time>
        <h2>{event.title}</h2>
        <p className="cinema-event-place">
          <MapPin size={15} />
          {event.place}
        </p>
        <div className="cinema-scene-actions">
          <Button onClick={() => onOpen(event)}>
            翻开这场相遇 <ArrowUpRight size={17} />
          </Button>
          <Link to="/events" className="text-arrow">
            全部活动 <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
      <span className="cinema-event-serial" aria-hidden="true">
        0{order + 1}
      </span>
    </div>
  );
}

const worldImages = ['studio', 'summer', 'evening', 'club-days', 'studio'];
function WorldCard({ progress, index, order }: SceneProps & { order: number }) {
  const department = departments[order];
  const mobile = useMediaQuery('(max-width: 760px)');
  const spreadX = mobile ? (order === 4 ? 0 : order % 2 ? 23 : -23) : (order - 2) * 16;
  const spreadY = mobile ? `${Math.floor(order / 2) * 120}%` : `${Math.abs(order - 2) * 22}px`;
  const x = useTransform(
    progress,
    [index - 0.8, index, index + 0.5],
    ['0vw', `${spreadX}vw`, '0vw'],
  );
  const rotate = useTransform(
    progress,
    [index - 0.8, index, index + 0.5],
    [0, mobile ? (order % 2 ? 2 : -2) : (order - 2) * 7, 0],
  );
  const y = useTransform(
    progress,
    [index - 0.8, index, index + 0.5],
    [mobile ? '100%' : '90px', spreadY, mobile ? '100%' : '100px'],
  );
  return (
    <motion.div
      className="cinema-world-card"
      style={{ x, y, rotate, zIndex: 5 - Math.abs(order - 2) }}
    >
      <Link to={`/about#${department.id}`}>
        <img src={`/images/${worldImages[order]}.webp`} alt="" />
        <span>
          <small>
            0{order + 1} / {department.en}
          </small>
          <b>{department.name}</b>
          <ArrowUpRight size={18} />
        </span>
      </Link>
    </motion.div>
  );
}
export function WorldsScene(props: SceneProps) {
  return (
    <div className="cinema-worlds">
      <div className="cinema-world-heading">
        <span className="eyebrow">CHOOSE YOUR WORLD</span>
        <h2>
          你的热爱，
          <br className="cinema-mobile-break" />
          <span className="cinema-world-question">
            <span className="serif-accent">在哪个次元？</span>
            <SceneMascot pose="artist" {...props} className="mascot-sentence-companion" />
          </span>
        </h2>
        <p>五个部门，无数种一起发光的方式。</p>
      </div>
      <div className="cinema-world-fan">
        {departments.map((d, i) => (
          <WorldCard key={d.id} {...props} order={i} />
        ))}
      </div>
      <Link className="text-arrow cinema-world-link" to="/about#departments">
        寻找我的次元 <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
export function ClosingScene({ progress, index }: SceneProps) {
  const scale = useTransform(progress, [index - 1, index], [0.25, 1]);
  const rotate = useTransform(progress, [index - 1, index], [-30, 0]);
  return (
    <div className="cinema-closing">
      <motion.div className="cinema-closing-ring" style={{ scale, rotate }} aria-hidden="true" />
      <div className="cinema-closing-copy">
        <img className="cinema-seal" src="/images/club-original.png" alt="微光漫摄社团徽标" />
        <span className="eyebrow">YOUR STORY STARTS HERE</span>
        <h2>
          下一帧，
          <br />
          <span className="serif-accent">有你才完整。</span>
        </h2>
        <p>不需要自带技能点，带上喜欢的心情就好。</p>
        <Button asChild size="lg">
          <Link to="/join">
            加入微光，开始我们的故事 <ArrowUpRight />
          </Link>
        </Button>
      </div>
      <img className="cinema-closing-character" src="/images/mascot-key-visual.webp" alt="" />
      <div className="cinema-endnote">
        <span>© {new Date().getFullYear()} 微光漫摄协会</span>
        <span>OUR YOUTH, OUR STORY.</span>
        <Link to="/admin">社团管理</Link>
      </div>
    </div>
  );
}
