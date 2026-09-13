<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { milestoneConfig, seasons } from "../config.js";
import { formatMilestoneDate, seasonFromTimestamp } from "../seasons.js";

const props = defineProps({
  messages: { type: Array, required: true },
});
const emit = defineEmits(["season-change"]);

const viewport = ref(null);
const offset = ref(0);
const viewportWidth = ref(0);
const dragging = ref(false);
let dragStartX = 0;
let dragStartOffset = 0;
let resizeObserver;

const cardWidth = computed(() => (viewportWidth.value <= 700 ? 214 : 244));
const trackSidePadding = computed(() =>
  Math.max(24, (viewportWidth.value - cardWidth.value) / 2),
);
const trackWidth = computed(() =>
  Math.max(
    viewportWidth.value,
    (props.messages.length - 1) * milestoneConfig.cardSpacing +
      trackSidePadding.value * 2 +
      cardWidth.value,
  ),
);
const maxOffset = computed(() =>
  Math.max(0, trackWidth.value - viewportWidth.value),
);
const progress = computed(() =>
  maxOffset.value ? offset.value / maxOffset.value : 0,
);

function cardX(index) {
  return trackSidePadding.value + index * milestoneConfig.cardSpacing;
}

function clampOffset(value) {
  return Math.min(maxOffset.value, Math.max(0, value));
}

function updateSeason() {
  if (!props.messages.length) {
    emit("season-change", seasonFromTimestamp(new Date().toISOString()));
    return;
  }
  const center = offset.value + viewportWidth.value / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  props.messages.forEach((message, index) => {
    const distance = Math.abs(cardX(index) + cardWidth.value / 2 - center);
    if (distance < closestDistance) {
      closestIndex = index;
      closestDistance = distance;
    }
  });
  emit(
    "season-change",
    seasonFromTimestamp(props.messages[closestIndex].timestamp),
  );
}

function setOffset(value) {
  offset.value = clampOffset(value);
  updateSeason();
}

function onWheel(event) {
  const movement =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
  setOffset(offset.value + movement);
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  dragging.value = true;
  dragStartX = event.clientX;
  dragStartOffset = offset.value;
  viewport.value?.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!dragging.value) return;
  setOffset(dragStartOffset + dragStartX - event.clientX);
}

function onPointerUp(event) {
  dragging.value = false;
  if (viewport.value?.hasPointerCapture(event.pointerId)) {
    viewport.value.releasePointerCapture(event.pointerId);
  }
}

function move(direction) {
  setOffset(offset.value + direction * milestoneConfig.cardSpacing);
}

function scrollToEnd() {
  nextTick(() => setOffset(maxOffset.value));
}

function resize() {
  viewportWidth.value = viewport.value?.clientWidth || 0;
  setOffset(offset.value);
}

watch(
  () => props.messages.length,
  () => scrollToEnd(),
);

onMounted(() => {
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport.value);
  resize();
  scrollToEnd();
});

onBeforeUnmount(() => resizeObserver?.disconnect());

defineExpose({ scrollToEnd });
</script>

<template>
  <div class="timeline-frame">
    <div
      ref="viewport"
      class="timeline-viewport"
      :class="{ 'is-dragging': dragging }"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div
        v-if="messages.length"
        class="timeline-track"
        :style="{
          width: `${trackWidth}px`,
          transform: `translate3d(${-offset}px, 0, 0)`,
        }"
      >
        <div class="track-line"></div>
        <article
          v-for="(message, index) in messages"
          :key="message.id || message.timestamp"
          class="milestone-card"
          :class="[
            `season-${seasonFromTimestamp(message.timestamp)}`,
            `level-${index % 3}`,
          ]"
          :style="{ left: `${cardX(index)}px` }"
        >
          <span class="card-code">{{
            String(index + 1).padStart(2, "0")
          }}</span>
          <p>{{ message.content }}</p>
          <footer>
            <time :datetime="message.timestamp">{{
              formatMilestoneDate(message.timestamp)
            }}</time>
            <span>{{
              seasons[seasonFromTimestamp(message.timestamp)].name
            }}</span>
          </footer>
          <i class="connector" aria-hidden="true"></i>
        </article>
      </div>
      <div v-else class="timeline-empty">
        <span>NO SIGNAL</span>
        <strong>尚无铭文</strong>
      </div>
    </div>

    <div class="timeline-controls">
      <button
        type="button"
        title="向前移动"
        aria-label="向前移动"
        @click="move(-1)"
      >
        ←
      </button>
      <div class="progress-track" aria-hidden="true">
        <i :style="{ width: `${Math.max(4, progress * 100)}%` }"></i>
      </div>
      <span>{{ Math.round(progress * 100) }}%</span>
      <button
        type="button"
        title="向后移动"
        aria-label="向后移动"
        @click="move(1)"
      >
        →
      </button>
    </div>
  </div>
</template>

<style scoped>
.timeline-frame {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(430px, 1fr) 42px;
  position: relative;
}

.timeline-viewport {
  min-width: 0;
  min-height: 0;
  position: relative;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

.timeline-viewport.is-dragging {
  cursor: grabbing;
}

.timeline-track {
  height: 100%;
  position: relative;
  transition: transform 0.12s ease-out;
  will-change: transform;
}

.is-dragging .timeline-track {
  transition: none;
}

.track-line {
  height: 2px;
  position: absolute;
  right: 0;
  bottom: 76px;
  left: 0;
  background: var(--line-strong);
}

.track-line::before {
  content: "";
  width: 100%;
  height: 1px;
  position: absolute;
  top: 8px;
  background: var(--line);
}

.milestone-card {
  width: 244px;
  min-height: 148px;
  padding: 18px;
  position: absolute;
  bottom: 116px;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--paper) 91%, transparent);
  border: 1px solid var(--line-strong);
  border-top: 3px solid var(--season-accent);
  box-shadow: 7px 7px 0 color-mix(in srgb, var(--ink) 8%, transparent);
}

.milestone-card.level-1 {
  bottom: 190px;
}

.milestone-card.level-2 {
  bottom: 264px;
}

.season-spring {
  --season-accent: #c4524e;
}
.season-summer {
  --season-accent: #2f9691;
}
.season-autumn {
  --season-accent: #aa653b;
}
.season-winter {
  --season-accent: #529bb0;
}

.card-code {
  color: var(--season-accent);
  font: 10px var(--mono);
}

.milestone-card p {
  margin: 15px 0 18px;
  color: var(--ink);
  font: 500 14px/1.75 var(--serif);
  overflow-wrap: anywhere;
}

.milestone-card footer {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  border-top: 1px solid var(--line);
  font: 9px var(--mono);
}

.connector {
  width: 1px;
  height: var(--connector-height, 39px);
  position: absolute;
  bottom: calc(-1 * var(--connector-height, 39px));
  left: 50%;
  background: var(--season-accent);
}

.level-1 .connector {
  --connector-height: 113px;
}
.level-2 .connector {
  --connector-height: 187px;
}

.connector::after {
  content: "";
  width: 7px;
  height: 7px;
  position: absolute;
  right: -3px;
  bottom: -3px;
  background: var(--season-accent);
  border-radius: 50%;
}

.timeline-controls {
  padding: 0 clamp(18px, 4vw, 54px);
  display: grid;
  grid-template-columns: 34px minmax(120px, 240px) 42px 34px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-top: 1px solid var(--line);
}

.timeline-controls button {
  width: 34px;
  height: 30px;
  padding: 0;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--line-strong);
}

.timeline-controls button:hover {
  color: var(--paper);
  background: var(--ink);
}

.progress-track {
  height: 3px;
  overflow: hidden;
  background: var(--line);
}

.progress-track i {
  height: 100%;
  display: block;
  background: var(--coral);
  transition: width 0.15s ease;
}

.timeline-controls > span {
  color: var(--muted);
  font: 9px var(--mono);
}

.timeline-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 8px;
  text-align: center;
}

.timeline-empty span {
  color: var(--coral-dark);
  font: 9px var(--mono);
}

.timeline-empty strong {
  font: 500 28px var(--serif);
}

@media (max-width: 700px) {
  .timeline-frame {
    grid-template-rows: minmax(470px, 1fr) 42px;
  }

  .milestone-card {
    width: 214px;
  }

  .milestone-card.level-1 {
    bottom: 176px;
  }

  .milestone-card.level-2 {
    bottom: 236px;
  }

  .level-1 .connector {
    --connector-height: 99px;
  }
  .level-2 .connector {
    --connector-height: 159px;
  }
}
</style>
