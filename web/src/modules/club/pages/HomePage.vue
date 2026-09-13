<script setup>
import { onMounted } from "vue";
import logo from "../../../assets/images/1757438527327.png";
import { club } from "../club.js";
import {
  events,
  eventsError,
  eventsLoading,
  loadEvents,
} from "../../events/services/events.js";
import Eyebrow from "../../../shared/components/Eyebrow.vue";
import SectionHeading from "../../../shared/components/SectionHeading.vue";
import EventCard from "../../events/components/EventCard.vue";

defineEmits(["navigate"]);

onMounted(loadEvents);
</script>

<template>
  <main class="view view-home">
    <section class="hero page-section">
      <div class="hero-copy">
        <Eyebrow label="ANIME · IMAGE · COMMUNITY" />
        <h1 class="hero-title">让喜欢的事，<br />发出微光。</h1>
        <p class="hero-intro">{{ club.intro }}</p>
        <div class="hero-actions">
          <button
            class="button button-primary"
            type="button"
            @click="$emit('navigate', '/departments')"
          >
            浏览部门档案 →</button
          ><button
            class="button button-quiet"
            type="button"
            @click="$emit('navigate', '/about')"
          >
            认识微光漫摄
          </button>
        </div>
        <div class="stat-strip">
          <div v-for="stat in club.stats" :key="stat.label" class="stat">
            <strong>{{ stat.value }}</strong
            ><span>{{ stat.label }}</span>
          </div>
        </div>
      </div>
      <div class="hero-art">
        <div class="art-rings"></div>
        <div class="hero-label hero-label-top">
          <span>EST.</span><strong>2026</strong>
        </div>
        <img class="club-logo" :src="logo" alt="微光漫摄社团徽章" />
        <div class="hero-stamp"><span>FRAME</span><span>01 / 05</span></div>
        <p class="badge-caption">SCHOOL OF SOFTWARE · NANCHANG UNIVERSITY</p>
      </div>
    </section>
    <section class="manifesto page-section">
      <div class="manifesto-index"><span>01</span><span>MANIFESTO</span></div>
      <div class="manifesto-body">
        <h2>我们把热爱做成作品。</h2>
        <p>
          一群喜欢动画、漫画、游戏与影像的年轻人，在课表的缝隙里共同创作。这里没有标准答案，只有每个人独特的观看方式。
        </p>
        <button
          class="text-link"
          type="button"
          @click="$emit('navigate', '/about')"
        >
          关于我们 ↗
        </button>
      </div>
      <div class="manifesto-side">
        <span>“</span>
        <p>每一束微光，<br />都值得被看见。</p>
      </div>
    </section>
    <section class="upcoming page-section">
      <SectionHeading
        kicker="NEXT ON THE REEL"
        title="接下来，一起做什么？"
        copy="把日期圈起来，现场见。"
      />
      <p v-if="eventsLoading" class="event-status">正在加载活动……</p>
      <div v-else-if="eventsError" class="event-status event-status-error">
        <p>{{ eventsError }}</p>
        <button
          class="button button-outline"
          type="button"
          @click="loadEvents(true)"
        >
          重新加载
        </button>
      </div>
      <div v-else-if="events.length === 0" class="event-empty">
        <div>
          <span>NO UPCOMING EVENTS</span>
          <p>下一场活动正在准备中。</p>
        </div>
        <button
          class="button button-outline"
          type="button"
          @click="$emit('navigate', '/events')"
        >
          查看活动日历 →
        </button>
      </div>
      <div v-else class="event-preview">
        <EventCard
          v-for="(event, index) in events.slice(0, 3)"
          :key="event.id"
          :event="event"
          :index="index"
        />
      </div>
      <button
        v-if="!eventsLoading && !eventsError && events.length > 0"
        class="button button-outline"
        type="button"
        @click="$emit('navigate', '/events')"
      >
        查看完整日历 →
      </button>
    </section>
  </main>
</template>

<style scoped>
.page-section {
  padding: clamp(64px, 8vw, 110px) clamp(24px, 9vw, 150px);
}
.hero {
  min-height: calc(100dvh - var(--header-height) - 110px);
  padding-top: 56px;
  padding-bottom: 56px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.82fr);
  align-items: center;
  gap: clamp(48px, 6vw, 90px);
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
}
.hero::before {
  content: "01 / SIGNAL RECEIVED";
  position: absolute;
  top: 26px;
  left: clamp(24px, 9vw, 150px);
  color: var(--coral-dark);
  font: 9px var(--mono);
  letter-spacing: 0.14em;
}
.hero-copy {
  max-width: 620px;
  align-self: center;
  position: relative;
  z-index: 1;
}
.hero-copy .eyebrow::after {
  content: "";
  width: 46px;
  height: 1px;
  margin-left: 8px;
  background: var(--cyan);
}
.hero-title {
  max-width: 680px;
  margin: 0;
  white-space: pre-line;
  font: 600 76px/1.02 var(--serif);
  letter-spacing: 0;
  text-shadow: 5px 5px 0 rgba(196, 82, 78, 0.12);
}
.hero-intro {
  max-width: 455px;
  margin: 26px 0 24px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.9;
}
.hero-actions {
  margin-bottom: 38px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.button,
.text-link {
  border: 0;
  background: transparent;
  color: var(--ink);
  font-size: 12px;
  letter-spacing: 0.08em;
}
.button {
  min-height: 44px;
  padding: 0 21px;
  border: 1px solid var(--ink);
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s,
    transform 0.2s;
}
.button-primary {
  background: var(--coral);
  border-color: var(--coral);
  color: #fffaf2;
}
.button-primary:hover {
  background: var(--coral-dark);
  border-color: var(--coral-dark);
  transform: translateY(-2px);
}
.button-quiet {
  padding-left: 0;
  border-color: transparent;
  color: var(--muted);
}
.stat-strip {
  display: flex;
  gap: 36px;
}
.stat {
  min-width: 86px;
  padding-left: 13px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 2px solid var(--coral);
}
.stat strong {
  font: 500 32px var(--serif);
}
.stat span {
  color: var(--muted);
  font: 9px var(--mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.hero-art {
  width: 100%;
  height: min(35vw, 500px);
  min-height: 420px;
  align-self: center;
  position: relative;
  display: grid;
  place-items: center;
  background: var(--soft-band);
  border: 1px solid var(--line);
  clip-path: polygon(8% 0, 100% 0, 100% 92%, 92% 100%, 0 100%, 0 8%);
}
.hero-art::before,
.hero-art::after {
  position: absolute;
  z-index: 2;
  color: var(--coral-dark);
  font: 9px var(--mono);
  letter-spacing: 0.12em;
}
.hero-art::before {
  content: "VISUAL UNIT / 001";
  top: 18px;
  left: 22px;
}
.hero-art::after {
  content: "REC / LIVE";
  right: 22px;
  bottom: 18px;
}
.club-logo {
  width: min(29vw, 388px);
  min-width: 240px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 22px 20px rgba(27, 24, 24, 0.2));
}
.art-rings {
  width: min(33vw, 440px);
  aspect-ratio: 1;
  position: absolute;
  border: 1px dashed var(--coral-dark);
  border-radius: 50%;
}
.art-rings::before,
.art-rings::after {
  content: "";
  position: absolute;
  inset: 7%;
  border: 1px solid currentColor;
  border-radius: 50%;
  opacity: 0.45;
}
.art-rings::after {
  inset: 19%;
  border-color: var(--coral);
}
.hero-label,
.hero-stamp {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--muted);
  font: 10px var(--mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.hero-label-top {
  top: 15%;
  right: 2%;
}
.hero-label strong {
  color: var(--ink);
  font-size: 14px;
}
.hero-stamp {
  bottom: 12%;
  left: 6%;
  color: var(--coral-dark);
}
.badge-caption {
  position: absolute;
  right: 14%;
  bottom: 5%;
  left: 14%;
  z-index: 2;
  margin: 0;
  color: var(--coral-dark);
  font: 8px var(--mono);
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
}
.manifesto {
  min-height: 350px;
  padding-top: 72px;
  padding-bottom: 72px;
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) 220px;
  align-items: center;
  gap: clamp(38px, 6vw, 88px);
  position: relative;
  overflow: hidden;
  background: var(--ink);
  color: var(--paper);
}
.manifesto-index {
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #b5a59b;
  font: 10px var(--mono);
  letter-spacing: 0.14em;
}
.manifesto-index span:first-child {
  color: var(--coral);
  font-size: 22px;
}
.manifesto-body h2 {
  margin: 0 0 22px;
  font: 500 44px/1.25 var(--serif);
}
.manifesto-body p {
  max-width: 510px;
  color: #b7aaa1;
  font-size: 14px;
  line-height: 1.9;
}
.manifesto .text-link {
  padding: 0;
  margin-top: 16px;
  color: inherit;
}
.manifesto-side {
  align-self: center;
  color: var(--coral);
}
.manifesto-side > span {
  font:
    70px/0.4 Georgia,
    serif;
}
.manifesto-side p {
  color: var(--paper);
  font: 16px/1.7 var(--serif);
}
.upcoming {
  min-height: 360px;
  padding-top: 78px;
  padding-bottom: 78px;
}
.event-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--line);
}
.event-status {
  padding: 28px 0;
  color: var(--muted);
  font-size: 13px;
}
.event-status-error p {
  margin: 0 0 18px;
}
.event-empty {
  min-height: 104px;
  padding: 22px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.event-empty span {
  color: var(--coral-dark);
  font: 9px var(--mono);
}
.event-empty p {
  margin: 7px 0 0;
  color: var(--muted);
  font-size: 13px;
}
.event-empty .button-outline {
  flex: 0 0 auto;
  margin-top: 0;
}
.button-outline {
  margin-top: 38px;
  border-color: var(--line);
}
.button-outline:hover {
  background: var(--ink);
  color: var(--paper);
}
@media (max-width: 880px) {
  .hero {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 24px;
    padding-top: 48px;
    padding-bottom: 42px;
  }
  .hero-art {
    width: min(100%, 620px);
    height: 280px;
    min-height: 0;
  }
  .club-logo {
    width: min(36vw, 250px);
    min-width: 220px;
  }
  .art-rings {
    width: min(42vw, 286px);
  }
  .manifesto {
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 42px;
  }
  .manifesto-side {
    display: none;
  }
  .event-preview {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 620px) {
  .page-section,
  .hero {
    padding-right: 22px;
    padding-left: 22px;
  }
  .hero {
    gap: 20px;
    padding-top: 44px;
    padding-bottom: 36px;
  }
  .hero-title {
    font-size: 49px;
    line-height: 1.03;
  }
  .hero-copy .eyebrow {
    margin-bottom: 15px;
  }
  .hero-intro {
    margin: 20px 0 18px;
  }
  .hero-actions {
    margin-bottom: 26px;
    gap: 10px;
  }
  .hero-actions .button {
    padding-right: 15px;
    padding-left: 15px;
  }
  .stat-strip {
    justify-content: space-between;
    gap: 0;
  }
  .stat {
    min-width: 0;
    padding-left: 10px;
  }
  .stat strong {
    font-size: 27px;
  }
  .hero-art {
    height: 220px;
    min-height: 0;
  }
  .club-logo {
    width: 190px;
    min-width: 0;
  }
  .art-rings {
    width: 208px;
  }
  .hero-label-top {
    top: 16%;
    right: 4%;
  }
  .hero-stamp {
    bottom: 9%;
  }
  .badge-caption {
    right: 12%;
    bottom: 4%;
    left: 12%;
    font-size: 7px;
    letter-spacing: 0.06em;
  }
  .manifesto {
    grid-template-columns: 1fr;
    gap: 34px;
    min-height: 0;
    padding-top: 54px;
    padding-bottom: 56px;
  }
  .manifesto-body h2 {
    font-size: 31px;
  }
  .upcoming {
    min-height: 0;
    padding-top: 58px;
    padding-bottom: 58px;
  }
  .event-empty {
    align-items: flex-start;
    flex-direction: column;
  }
  .event-empty .button-outline {
    width: 100%;
  }
}
</style>
