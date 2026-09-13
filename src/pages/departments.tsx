import { Link } from 'react-router-dom';
import { Camera, Palette, Gamepad2, PenTool, Sparkles, ArrowUpRight } from 'lucide-react';
import { departments } from '@shared/content';
import { Reveal } from '@/components/reveal';
import { Button } from '@/components/ui/button';
export function DepartmentsPage() {
  const icons = [Palette, Camera, Gamepad2, PenTool, Sparkles];
  return (
    <div className="page-shell">
      <Reveal className="page-intro">
        <span className="eyebrow">DIFFERENT PASSIONS, ONE SIULIGHT</span>
        <h1>
          五种热爱，
          <br />
          同一种<span className="serif-accent">心动。</span>
        </h1>
        <p>找到和你一起开脑洞、做作品、熬过截稿日的伙伴。</p>
        <span className="intro-decoration" aria-hidden="true">
          ✳
        </span>
      </Reveal>
      <div className="department-list">
        {departments.map((d, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={d.id}>
              <section className="department-row" id={d.id}>
                <span className="department-number">0{i + 1}</span>
                <div className="department-title">
                  <span className="eyebrow">{d.en}</span>
                  <h2>{d.name}</h2>
                  <Icon strokeWidth={1} />
                </div>
                <div className="department-detail">
                  <h3>{d.intro}</h3>
                  <p>{d.detail}</p>
                  <Link to={`/join?department=${d.id}`} className="text-arrow">
                    这就是我的频道
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </section>
            </Reveal>
          );
        })}
      </div>
      <div className="department-outro">
        <p>还没想好也没关系，先认识一下。</p>
        <Button variant="outline" asChild>
          <Link to="/join">
            来和我们聊聊
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
