import { useRef, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { Button } from '@/components/ui/button';

const ease = [0.22, 1, 0.36, 1] as const;

/** Pointer depth is local to the artwork; scrolling always remains native. */
export function Opening() {
  const target = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end start'] });
  const artY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const typeX = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const orbitRotate = useTransform(scrollYProgress, [0, 1], [-22, 22]);
  const pointerX = useSpring(0, { stiffness: 90, damping: 22 });
  const pointerY = useSpring(0, { stiffness: 90, damping: 22 });
  function move(event: PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width - 0.5) * 22);
    pointerY.set(((event.clientY - box.top) / box.height - 0.5) * 14);
  }
  return (
    <section
      className="opening"
      ref={target}
      onPointerMove={move}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <motion.div
        className="opening-wordmark"
        aria-hidden="true"
        style={reduced ? undefined : { x: typeX }}
      >
        SIULIGHT
      </motion.div>
      <div className="opening-grain" aria-hidden="true" />
      <div className="opening-composition">
        <div className="opening-copy">
          <motion.p
            className="opening-kicker"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <span /> 南昌大学 · 软件学院 <i>ACGN & PHOTOGRAPHY</i>
          </motion.p>
          <h1 aria-label="微光漫摄">
            {['微', '光', '漫', '摄'].map((letter, i) => (
              <span className="opening-letter-mask" key={letter} aria-hidden="true">
                <motion.span
                  initial={reduced ? false : { y: '110%', rotate: 8 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ delay: 0.1 + i * 0.065, duration: 0.85, ease }}
                >
                  {letter}
                </motion.span>
              </span>
            ))}
            <span className="opening-punctuation" aria-hidden="true">
              ✳
            </span>
          </h1>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease }}
          >
            <p className="opening-line">
              热爱，是我们的<span>另一种次元。</span>
            </p>
            <p className="opening-description">
              从喜欢的角色，到并肩的伙伴。
              <br />
              一起画、一起拍，把脑洞变成闪闪发光的日常。
            </p>
            <div className="opening-actions">
              <Button asChild size="lg">
                <Link to="/join">
                  进入我们的世界 <ArrowUpRight />
                </Link>
              </Button>
              <Link className="opening-secondary" to="/milestones">
                翻开微光纪念册 <ArrowUpRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="opening-stage"
          style={reduced ? undefined : { y: artY }}
          aria-hidden="true"
        >
          <motion.div
            className="opening-orbit"
            style={reduced ? undefined : { rotate: orbitRotate }}
          />
          <div className="opening-orbit-thin" />
          <div className="opening-dotfield" />
          <motion.div
            className="opening-character-depth"
            style={reduced ? undefined : { x: pointerX, y: pointerY }}
          >
            <motion.img
              className="opening-character"
              src="/images/mascot-key-visual.webp"
              alt=""
              width="1024"
              height="1536"
              fetchPriority="high"
              initial={reduced ? false : { opacity: 0, y: 55, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.12, duration: 1.1, ease }}
            />
          </motion.div>
          <motion.span
            className="opening-greeting"
            initial={reduced ? false : { scale: 0.7, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: -8 }}
            transition={{ delay: 0.8, duration: 0.5, ease }}
          >
            同好，
            <br />
            发现！<span>HELLO, MY FRIEND!</span>
          </motion.span>
          <span className="opening-spark opening-spark-one">✦</span>
          <span className="opening-spark opening-spark-two">✧</span>
          <span className="opening-coordinate">
            CHARACTER / SIULIGHT
            <br />A LITTLE LIGHT, AN INFINITE WORLD.
          </span>
        </motion.div>
      </div>
      <div className="opening-bottom">
        <span>
          好きなことを、一緒に。<small>把喜欢的事，一起做下去。</small>
        </span>
        <a href="#discover">
          <span>向下，发现同频的世界</span>
          <ArrowDown size={17} />
        </a>
        <span className="opening-edition">
          OUR YOUTH, OUR STORY <b>01 — ∞</b>
        </span>
      </div>
    </section>
  );
}
