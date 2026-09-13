import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';

export function ClubStory() {
  return (
    <>
      <section className="section club-introduction" id="discover">
        <Reveal className="club-signature">
          <img
            src="/images/club-original.png"
            alt="南昌大学软件学院微光漫摄协会原始徽标：金发猫耳角色与红色圆环"
            width="1920"
            height="1920"
            loading="lazy"
          />
          <span>
            微光漫摄协会<small>OUR CLUB. OUR LITTLE UNIVERSE.</small>
          </span>
        </Reveal>
        <Reveal className="club-introduction-copy">
          <span className="eyebrow">01 / MORE THAN A FANDOM</span>
          <h2>
            喜欢的世界很大，
            <br />
            幸好<span className="serif-accent">我们同频。</span>
          </h2>
          <div>
            <p>
              一部反复重温的番剧，一个还没画完的角色。
              <br />
              在微光，你的「小众」热爱，总有人懂。
            </p>
            <Link to="/about" className="text-arrow">
              认识微光 <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
