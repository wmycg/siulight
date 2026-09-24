import { useEffect } from 'react';
import { DepartmentSection } from '@/features/about/department-section';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Camera, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
export function AboutPage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const frame = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <>
      <section className="about-hero">
        <img src="/images/summer.webp" alt="微光的夏日，伙伴们一起看海" />
        <div />
        <Reveal className="about-hero-copy">
          <span className="eyebrow">HELLO, WE ARE SIULIGHT</span>
          <h1>
            微光漫摄
            <span>
              从屏幕出发，
              <br />
              在现实相遇。
            </span>
          </h1>
          <p>
            一个以 ACGN 为坐标的大学社团。
            <br />
            也是一群愿意为热爱，多走一步的人。
          </p>
        </Reveal>
      </section>
      <section className="section about-story">
        <Reveal>
          <span className="eyebrow">WHY WE GATHER</span>
          <h2>
            喜欢这件事，
            <br />
            本身就很<span className="serif-accent">了不起。</span>
          </h2>
        </Reveal>
        <Reveal>
          <p>
            可能是一部动画，让你第一次想要画画；也可能是一次漫展，让你拿起相机。那些看起来微不足道的心动，都是我们聚在一起的理由。
          </p>
          <p>
            在微光漫摄，我们做动画、拍照片、做游戏，也听日音、出 cos。你不必样样精通，更不用先证明自己。带着好奇心来，一起把喜欢变成作品，把陌生人变成伙伴。
          </p>
          <Link to="/about#departments" className="text-arrow">
            找到属于你的部门
            <ArrowUpRight size={18} />
          </Link>
        </Reveal>
      </section>
      <section className="section values-section">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow">THE THINGS WE BELIEVE</span>
            <h2>
              微光里的三个约定<span className="heading-dot">.</span>
            </h2>
          </div>
        </Reveal>
        <div className="values-grid">
          {[
            {
              icon: Heart,
              title: '热爱没有门槛',
              text: '入坑一天也好，资深同好也好。在这里，每一种真诚的喜欢都值得被认真对待。',
            },
            {
              icon: Camera,
              title: '一起创造一点什么',
              text: '从第一帧画面、第一段旋律开始。让脑海里的想法，慢慢长成真实的作品。',
            },
            {
              icon: Sparkles,
              title: '记住每一个小小的你',
              text: '大事有纪念，小事也有回声。我们为社团庆祝，也为每个人的成长留下一页。',
            },
          ].map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <span className="value-index">0{i + 1}</span>
              <v.icon strokeWidth={1.3} />
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <DepartmentSection />
      <section className="about-image-section">
        <img
          src="/images/studio.webp"
          alt="阳光下的画室，散放着画稿、明信片和相机"
          loading="lazy"
        />
        <div>
          <span className="eyebrow">CREATE SOMETHING YOU LOVE</span>
          <h2>
            你的脑洞，
            <br />
            我们一起实现。
          </h2>
          <Button asChild variant="outline">
            <Link to="/join">
              成为微光的一员
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
