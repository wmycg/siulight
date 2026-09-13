<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import MilestoneTimeline from "../components/MilestoneTimeline.vue";
import SeasonParticles from "../components/SeasonParticles.vue";
import { milestoneConfig, seasons } from "../config.js";
import { seasonFromTimestamp } from "../seasons.js";
import {
  createMilestone,
  loadMilestoneStatus,
  loadMilestones,
  milestoneStatus,
  milestones,
  milestonesError,
  milestonesLoading,
  milestonesMutating,
} from "../services/milestones.js";

const messages = milestones;
const activeSeason = ref(seasonFromTimestamp(new Date().toISOString()));
const composeOpen = ref(false);
const content = ref("");
const hasPosted = ref(false);
const statusMessage = ref("");
const timeline = ref(null);
const textarea = ref(null);

const season = computed(() => seasons[activeSeason.value]);
const remaining = computed(
  () => milestoneConfig.maxLength - content.value.length,
);
const canSubmit = computed(
  () =>
    content.value.trim().length > 0 && remaining.value >= 0 && !hasPosted.value,
);

function openCompose() {
  if (hasPosted.value) {
    statusMessage.value = "本学期的铭文已经保存";
    return;
  }
  content.value = "";
  composeOpen.value = true;
  nextTick(() => textarea.value?.focus());
}

function closeCompose() {
  composeOpen.value = false;
}

async function submitMilestone() {
  if (!canSubmit.value) return;
  const saved = await createMilestone(content.value);
  if (!saved) {
    hasPosted.value = milestoneStatus.value.posted;
    statusMessage.value = milestonesError.value || "铭文提交失败";
    if (hasPosted.value) closeCompose();
    return;
  }
  hasPosted.value = true;
  statusMessage.value = "铭文已写入时间轴";
  closeCompose();
  nextTick(() => timeline.value?.scrollToEnd());
}

function onModalKeydown(event) {
  if (event.key === "Escape") closeCompose();
}

onMounted(async () => {
  await Promise.all([loadMilestones(), loadMilestoneStatus()]);
  hasPosted.value = milestoneStatus.value.posted;
});
</script>

<template>
  <main class="view milestone-view" :class="`is-${activeSeason}`">
    <SeasonParticles :season="activeSeason" />

    <header class="milestone-header">
      <div>
        <span class="milestone-kicker">06 / COMMUNITY ARCHIVE</span>
        <h1>里程碑</h1>
        <p>把此刻的想法留在这里，让后来的人沿着时间读到。</p>
      </div>
      <div class="season-status" aria-live="polite">
        <i></i>
        <span>{{ season.code }}</span>
        <strong>{{ season.name }}</strong>
      </div>
    </header>

    <section class="milestone-stage" aria-label="社团里程碑时间轴">
      <div class="stage-meta">
        <span>{{ String(messages.length).padStart(2, "0") }} ENTRIES</span>
        <span>DATABASE / SHARED</span>
      </div>
      <div class="milestone-canvas">
        <p v-if="milestonesLoading" class="milestone-state">正在读取里程碑……</p>
        <p
          v-else-if="milestonesError"
          class="milestone-state milestone-state-error"
        >
          {{ milestonesError }}
        </p>
        <MilestoneTimeline
          v-else
          ref="timeline"
          :messages="messages"
          @season-change="activeSeason = $event"
        />
      </div>
    </section>

    <div class="milestone-action">
      <span v-if="statusMessage" role="status">{{ statusMessage }}</span>
      <button
        type="button"
        :disabled="hasPosted || milestonesMutating"
        @click="openCompose"
      >
        {{ hasPosted ? "本学期已留存" : "刻下铭文" }}
      </button>
    </div>

    <div
      v-if="composeOpen"
      class="compose-layer"
      role="presentation"
      @click.self="closeCompose"
      @keydown="onModalKeydown"
    >
      <section
        class="compose-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title"
      >
        <button
          class="dialog-close"
          type="button"
          title="关闭"
          aria-label="关闭"
          @click="closeCompose"
        >
          ×
        </button>
        <span class="milestone-kicker">NEW ENTRY / {{ season.code }}</span>
        <h2 id="compose-title">刻下你的铭文</h2>
        <form @submit.prevent="submitMilestone">
          <label for="milestone-content">铭文内容</label>
          <textarea
            id="milestone-content"
            ref="textarea"
            v-model="content"
            :maxlength="milestoneConfig.maxLength"
            placeholder="写下想留给未来社员的话"
            required
          ></textarea>
          <div class="compose-meta">
            <span>SESSION / DATABASE</span>
            <span :class="{ 'is-warning': remaining < 20 }">{{
              remaining
            }}</span>
          </div>
          <div class="dialog-actions">
            <button
              class="button-secondary"
              type="button"
              @click="closeCompose"
            >
              取消
            </button>
            <button
              class="button-primary"
              type="submit"
              :disabled="!canSubmit || milestonesMutating"
            >
              镌刻
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<style scoped>
.milestone-view {
  min-height: calc(100dvh - var(--header-height) - 38px);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--ink);
  background: var(--season-surface);
  transition: background-color 0.45s ease;
}

.milestone-view.is-spring {
  --season-surface: color-mix(in srgb, var(--paper) 90%, #d89a96);
  --season-strong: #a8413e;
}

.milestone-view.is-summer {
  --season-surface: color-mix(in srgb, var(--paper) 87%, #70d6d0);
  --season-strong: #267f7b;
}

.milestone-view.is-autumn {
  --season-surface: color-mix(in srgb, var(--paper) 88%, #c9875f);
  --season-strong: #925131;
}

.milestone-view.is-winter {
  --season-surface: color-mix(in srgb, var(--paper) 88%, #82b9c6);
  --season-strong: #417e8e;
}

.milestone-header {
  min-height: 174px;
  padding: 30px clamp(24px, 7vw, 112px) 26px;
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 36px;
  border-bottom: 1px solid var(--line-strong);
}

.milestone-kicker {
  color: var(--season-strong, var(--coral-dark));
  font: 9px var(--mono);
}

.milestone-header h1 {
  margin: 8px 0 10px;
  font: 600 clamp(42px, 6vw, 76px)/1 var(--serif);
}

.milestone-header p {
  max-width: 510px;
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.75;
}

.season-status {
  min-width: 132px;
  padding: 12px 0 4px 18px;
  display: grid;
  grid-template-columns: 8px 1fr;
  align-items: center;
  gap: 5px 9px;
  border-left: 1px solid var(--season-strong);
}

.season-status i {
  width: 7px;
  height: 7px;
  background: var(--season-strong);
  border-radius: 50%;
}

.season-status span {
  color: var(--muted);
  font: 9px var(--mono);
}

.season-status strong {
  grid-column: 2;
  font: 500 26px var(--serif);
}

.milestone-stage {
  min-height: 534px;
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-rows: 38px minmax(496px, 1fr);
}

.milestone-canvas {
  min-height: 496px;
  position: relative;
}

.milestone-state {
  margin: 0;
  padding: 34px clamp(24px, 4vw, 64px);
  color: var(--muted);
  font-size: 13px;
}

.milestone-state-error {
  color: var(--coral-dark);
}

.stage-meta {
  padding: 0 clamp(24px, 7vw, 112px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
  font: 8px var(--mono);
}

.milestone-action {
  min-height: 76px;
  padding: 16px clamp(24px, 7vw, 112px);
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--season-surface) 78%, transparent);
}

.milestone-action span {
  color: var(--muted);
  font: 9px var(--mono);
}

.milestone-action button {
  min-width: 136px;
  min-height: 42px;
  padding: 0 18px;
  color: #fffaf2;
  background: var(--coral);
  border: 1px solid var(--coral);
  font-size: 12px;
}

.milestone-action button:hover:not(:disabled) {
  background: var(--coral-dark);
}

.milestone-action button:disabled {
  color: var(--muted);
  background: color-mix(in srgb, var(--paper) 85%, transparent);
  border-color: var(--line-strong);
  cursor: not-allowed;
}

.compose-layer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(10, 12, 13, 0.72);
}

.compose-dialog {
  width: min(100%, 510px);
  padding: 30px;
  position: relative;
  background: var(--paper);
  border: 1px solid var(--coral);
  box-shadow: 10px 10px 0 var(--panel-deep);
}

.dialog-close {
  width: 32px;
  height: 32px;
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 0;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--line-strong);
  font-size: 20px;
}

.compose-dialog h2 {
  margin: 10px 0 24px;
  font: 500 32px var(--serif);
}

.compose-dialog form {
  display: grid;
  gap: 8px;
}

.compose-dialog label {
  color: var(--muted);
  font: 9px var(--mono);
}

.compose-dialog textarea {
  width: 100%;
  min-height: 138px;
  padding: 13px;
  resize: vertical;
  color: var(--ink);
  background: var(--soft-band);
  border: 1px solid var(--line-strong);
  font-size: 14px;
  line-height: 1.7;
}

.compose-dialog textarea:focus {
  outline: 2px solid var(--cyan);
  outline-offset: 1px;
}

.compose-meta {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font: 9px var(--mono);
}

.compose-meta .is-warning {
  color: var(--coral-dark);
}

.dialog-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 9px;
}

.dialog-actions button {
  min-height: 38px;
  padding: 0 18px;
  border: 1px solid var(--line-strong);
}

.dialog-actions .button-secondary {
  color: var(--ink);
  background: transparent;
}

.dialog-actions .button-primary {
  color: #fffaf2;
  background: var(--coral);
  border-color: var(--coral);
}

.dialog-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 880px) {
  .milestone-view {
    min-height: calc(100dvh - 38px);
  }
}

@media (max-width: 620px) {
  .milestone-view {
    min-height: calc(100dvh - var(--header-height) - 32px);
  }

  .milestone-header {
    min-height: 182px;
    padding: 28px 20px 24px;
    align-items: start;
  }

  .milestone-header h1 {
    font-size: 46px;
  }

  .milestone-header p {
    max-width: 270px;
  }

  .season-status {
    min-width: 70px;
    padding-left: 10px;
  }

  .season-status span {
    display: none;
  }

  .season-status strong {
    grid-column: 2;
    font-size: 23px;
  }

  .milestone-action {
    min-height: 82px;
    padding: 15px 20px 18px;
    align-items: flex-end;
    gap: 10px;
  }

  .milestone-action span {
    margin-right: auto;
    max-width: 52%;
    line-height: 1.45;
  }

  .compose-dialog {
    padding: 26px 20px 22px;
  }
}
</style>
