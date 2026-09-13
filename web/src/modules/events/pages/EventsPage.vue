<script setup>
import { onMounted } from "vue";
import {
  events,
  eventsError,
  eventsLoading,
  loadEvents,
} from "../services/events.js";
import Eyebrow from "../../../shared/components/Eyebrow.vue";
import EventCard from "../components/EventCard.vue";
import SectionHeading from "../../../shared/components/SectionHeading.vue";

onMounted(loadEvents);
</script>

<template>
  <main class="view view-inner">
    <section class="inner-hero events-hero">
      <div class="inner-hero-copy">
        <Eyebrow label="MARK YOUR CALENDAR" />
        <h1>活动<br />日历</h1>
        <p>线下见面、线上放映，保持一点期待。</p>
      </div>
      <div class="inner-hero-number"><span>04</span><span>SCHEDULE</span></div>
    </section>
    <section class="calendar page-section">
      <SectionHeading kicker="FALL" title="把日期圈起来。" />
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
      <p v-else-if="events.length === 0" class="event-status">暂无活动。</p>
      <div v-else class="event-list">
        <EventCard
          v-for="(event, index) in events"
          :key="event.id"
          :event="event"
          :index="index"
        />
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
.calendar {
  max-width: 1120px;
  position: relative;
}
.calendar::before {
  content: "DATA // NO EXTERNAL FEED";
  position: absolute;
  top: 30px;
  right: clamp(24px, 9vw, 150px);
  color: var(--muted);
  font: 8px var(--mono);
  letter-spacing: 0.1em;
}
.event-list {
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
@media (max-width: 880px) {
  .inner-hero {
    clip-path: polygon(0 0, 96% 0, 100% 5%, 100% 100%, 4% 100%, 0 95%);
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
}
</style>
