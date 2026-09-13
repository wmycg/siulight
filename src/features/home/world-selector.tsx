import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Reveal } from '@/components/reveal';
import { departments } from '@shared/content';

const scenes = [
  {
    image: 'studio',
    position: '50% 50%',
    title: '让想象，有了形状。',
    caption: '配色、角色、版式。让每一个灵感，都有自己的表达。',
  },
  {
    image: 'summer',
    position: '70% 50%',
    title: '日常，也值得一部电影。',
    caption: '带上相机，走出房间。光线和故事，都在路上。',
  },
  {
    image: 'evening',
    position: '45% 50%',
    title: '下一个世界，由你创造。',
    caption: '从「如果可以」到「开始游戏」，一起把脑洞做成作品。',
  },
  {
    image: 'studio',
    position: '20% 75%',
    title: '故事，从第一根线条开始。',
    caption: '原创、同人、分镜与涂鸦。每个角色，都等着被你画出来。',
  },
  {
    image: 'evening',
    position: '70% 50%',
    title: '让热爱，真的发生。',
    caption: '从一个好点子，到一场难忘的相聚。这次，由我们来策划。',
  },
];

export function WorldSelector() {
  const [active, setActive] = useState<string>(departments[0].id);
  const reduced = useReducedMotion();
  return (
    <section className="section worlds">
      <Reveal className="section-heading">
        <div>
          <span className="eyebrow">04 / CHOOSE YOUR WORLD</span>
          <h2>
            你的热爱，<span className="serif-accent">在哪个次元？</span>
          </h2>
          <p>五个部门，无数种一起发光的方式。</p>
        </div>
        <Link to="/about#departments" className="text-arrow">
          认识所有部门 <ArrowUpRight size={18} />
        </Link>
      </Reveal>
      <Tabs value={active} onValueChange={setActive} orientation="vertical" className="world-tabs">
        <TabsList className="world-list" aria-label="探索社团部门">
          {departments.map((department, i) => (
            <TabsTrigger key={department.id} value={department.id} className="world-trigger">
              <span className="world-index">0{i + 1}</span>
              <span>
                <b>{department.name}</b>
                <small>{department.en}</small>
              </span>
              <ArrowUpRight size={19} />
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="world-panels">
          {departments.map((department, i) => (
            <TabsContent value={department.id} key={department.id} className="world-panel">
              <motion.div
                className="world-scene"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={`/images/${scenes[i].image}.webp`}
                  alt={`${department.name}的创作灵感场景`}
                  style={{ objectPosition: scenes[i].position }}
                  loading="lazy"
                />
                <span className="world-scene-index" aria-hidden="true">
                  0{i + 1}
                </span>
                <div className="world-scene-copy">
                  <span>{department.en}</span>
                  <h3>{scenes[i].title}</h3>
                  <p>{scenes[i].caption}</p>
                  <Link to={`/about#${department.id}`}>
                    探索{department.name} <ArrowUpRight size={18} />
                  </Link>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </section>
  );
}
