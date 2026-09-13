<script setup>
import { club } from "../club.js";
import Eyebrow from "../../../shared/components/Eyebrow.vue";
import SectionHeading from "../../../shared/components/SectionHeading.vue";
</script>

<template>
  <main class="view view-inner">
    <section class="inner-hero club-hero">
      <div class="inner-hero-copy">
        <Eyebrow label="ABOUT THE CLUB" />
        <h1>关于<br />微光漫摄</h1>
        <p>
          不只是二次元社团，你还接触到各领域喜欢二次元的开发者，学到更多实用的知识
        </p>
      </div>
      <div class="inner-hero-number"><span>02</span><span>PROFILE</span></div>
    </section>
    <section class="about-grid page-section">
      <div class="about-lead">
        <h2>从屏幕出发，<br />在现实相遇。</h2>
        <p>{{ club.intro }}</p>
      </div>
      <div class="about-details">
        <div class="detail-row">
          <span>我们做什么</span>
          <p>游戏开发 / 动画制作 / cosplay</p>
        </div>
        <div class="detail-row">
          <span>我们相信</span>
          <p>好奇心比技术更重要，真诚比技巧更动人。</p>
        </div>
        <div class="detail-row">
          <span>活动地点</span>
          <p>线上频道</p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.view-inner {
  min-height: calc(100dvh - var(--header-height) - 34px);
}
.page-section {
  padding: clamp(64px, 8vw, 110px) clamp(24px, 9vw, 150px);
}
.inner-hero {
  min-height: 430px;
  padding: 84px clamp(24px, 9vw, 150px);
  display: flex;
  align-items: end;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  background: var(--panel);
  color: #f4eee5;
  border-bottom: 1px solid rgba(244, 238, 229, 0.16);
  clip-path: polygon(0 0, 97% 0, 100% 10%, 100% 100%, 3% 100%, 0 91%);
}
.inner-hero::before {
  content: "";
  position: absolute;
  inset: 22px;
  border: 1px solid rgba(244, 238, 229, 0.1);
  pointer-events: none;
}
.inner-hero::after {
  content: "";
  width: 170px;
  height: 1px;
  position: absolute;
  top: 64px;
  right: 8%;
  background: var(--cyan);
  box-shadow:
    0 9px 0 rgba(112, 214, 208, 0.35),
    0 18px 0 rgba(112, 214, 208, 0.15);
}
.inner-hero-copy,
.inner-hero-number {
  position: relative;
  z-index: 1;
}
.inner-hero-copy {
  max-width: 670px;
}
.inner-hero h1 {
  margin: 0;
  white-space: pre-line;
  font: 600 clamp(55px, 8vw, 104px)/0.98 var(--serif);
  letter-spacing: -0.03em;
  text-shadow: 4px 4px 0 rgba(196, 82, 78, 0.22);
}
.inner-hero p {
  margin: 26px 0 0;
  color: #b9aaa2;
  font-size: 14px;
}
.inner-hero .eyebrow {
  color: #e17a70;
}
.inner-hero-copy .eyebrow::after {
  content: "";
  width: 46px;
  height: 1px;
  margin-left: 8px;
  background: var(--cyan);
}
.inner-hero-copy h1::after {
  content: "/";
  display: inline-block;
  margin-left: 12px;
  color: var(--cyan);
  font: 400 0.45em var(--mono);
  vertical-align: top;
  transform: translateY(12px);
}
.inner-hero-number {
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #a5958b;
  font: 10px var(--mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.inner-hero-number span:first-child {
  color: var(--coral);
  font: 34px var(--serif);
}
.inner-hero-number span:last-child {
  color: var(--cyan);
}
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12vw;
  position: relative;
}
.about-grid::before {
  content: "DATA // NO EXTERNAL FEED";
  position: absolute;
  top: 30px;
  right: clamp(24px, 9vw, 150px);
  color: var(--muted);
  font: 8px var(--mono);
  letter-spacing: 0.1em;
}
.about-lead h2 {
  margin: 0 0 24px;
  font: 500 clamp(30px, 4vw, 50px)/1.2 var(--serif);
  text-shadow: 3px 3px 0 rgba(196, 82, 78, 0.1);
}
.about-lead p {
  max-width: 460px;
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.9;
}
.about-details {
  border-top: 1px solid var(--line);
}
.detail-row {
  padding: 20px 0;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 18px;
  border-bottom: 1px solid var(--line);
}
.detail-row > span {
  color: var(--coral-dark);
  font: 10px var(--mono);
}
.detail-row p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
}
@media (max-width: 880px) {
  .inner-hero {
    clip-path: polygon(0 0, 96% 0, 100% 5%, 100% 100%, 4% 100%, 0 95%);
  }
  .about-grid {
    gap: 56px;
  }
}
@media (max-width: 620px) {
  .page-section,
  .inner-hero {
    padding-right: 22px;
    padding-left: 22px;
  }
  .inner-hero {
    min-height: 330px;
    padding-top: 70px;
    padding-bottom: 55px;
  }
  .inner-hero h1 {
    font-size: clamp(49px, 15vw, 76px);
  }
  .inner-hero-number {
    display: none;
  }
  .about-grid {
    grid-template-columns: 1fr;
    gap: 52px;
  }
}
</style>
