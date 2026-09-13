<script setup>
import { reactive, ref } from "vue";
import Eyebrow from "../../../shared/components/Eyebrow.vue";
import joinPoster from "../../../assets/images/qq.jpg";
import {
  createSubmit,
  submitError,
  submitLoading,
  submitReceipt,
} from "../services/submits.js";

const isSubmitOpen = ref(false);
const form = reactive({
  webname: "",
  truename: "",
  ncunum: "",
  qq: "",
  aimpartment: "",
});

function openSubmit() {
  isSubmitOpen.value = true;
}

function closeSubmit() {
  if (!submitLoading.value) isSubmitOpen.value = false;
}

async function submit() {
  const receipt = await createSubmit(form);
  if (receipt) {
    Object.keys(form).forEach((key) => {
      form[key] = "";
    });
  }
}
</script>

<template>
  <main class="view view-inner">
    <section class="inner-hero join-hero">
      <div class="inner-hero-copy">
        <Eyebrow label="COME AS YOU ARE" />
        <h1>加入<br />微光漫摄喵</h1>
        <p>不需要“会什么”，只要你真的喜欢。</p>
      </div>
      <div class="inner-hero-number"><span>05</span><span>OPEN CALL</span></div>
    </section>
    <section class="join-grid page-section">
      <div class="join-copy">
        <div class="join-label">
          <span>START HERE</span><i></i><span>01 / 02</span>
        </div>
        <h2>下一帧，<br /><em>等你来按下。</em></h2>
        <p class="join-intro">
          微光漫摄欢迎每一个对动画、漫画、游戏或影像感兴趣的人。带着你的好奇心来，剩下的我们一起完成。
        </p>
        <div class="join-note" aria-label="招新信息">
          <div class="join-note-row">
            <span>01</span>
            <div>
              <strong>常年开放</strong
              ><small>没有固定截止日期，准备好就来</small>
            </div>
          </div>
          <div class="join-note-row">
            <span>02</span>
            <div>
              <strong>新人友好</strong
              ><small>不要求经验，先从一次见面开始</small>
            </div>
          </div>
        </div>
      </div>
      <div class="join-side">
        <aside class="join-application">
          <div class="join-application-meta">
            <span>APPLICATION DESK</span><span>02 / 02</span>
          </div>
          <h3>从一份申请<br /><em>开始见面。</em></h3>
          <p>留下你的基本信息和想加入的部门，我们会尽快和你联系。</p>
          <dl class="join-application-list">
            <div>
              <dt>01</dt>
              <dd>填写基本资料</dd>
            </div>
            <div>
              <dt>02</dt>
              <dd>选择意向部门</dd>
            </div>
            <div>
              <dt>03</dt>
              <dd>等待管理员联系</dd>
            </div>
          </dl>
          <button class="join-apply" type="button" @click="openSubmit">
            <span>提交申请</span><b aria-hidden="true">↗</b>
          </button>
          <span class="join-action-note">约 2 分钟完成</span>
        </aside>
        <figure class="join-visual">
          <img :src="joinPoster" alt="微光漫摄 QQ 群二维码海报" />
          <figcaption>扫码加入群聊，和同频的人在线见面。</figcaption>
        </figure>
      </div>
    </section>
    <Teleport to="body">
      <div v-if="isSubmitOpen" class="modal-layer" @click.self="closeSubmit">
        <section
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-title"
        >
          <div class="modal-heading">
            <div>
              <span class="modal-kicker">OPEN CALL / FORM</span>
              <h2 id="submit-title">提交加入申请</h2>
            </div>
            <button
              class="modal-close"
              type="button"
              aria-label="关闭申请窗口"
              @click="closeSubmit"
            >
              ×
            </button>
          </div>
          <form class="join-form" @submit.prevent="submit">
            <label
              >网名<input v-model.trim="form.webname" required maxlength="20"
            /></label>
            <label
              >真实姓名<input
                v-model.trim="form.truename"
                required
                maxlength="20"
            /></label>
            <label
              >学号<input v-model.trim="form.ncunum" required maxlength="20"
            /></label>
            <label
              >QQ<input v-model.trim="form.qq" required maxlength="20"
            /></label>
            <label
              >意向部门<input
                v-model.trim="form.aimpartment"
                required
                maxlength="20"
            /></label>
            <p v-if="submitError" class="form-error">{{ submitError }}</p>
            <p v-if="submitReceipt" class="form-success">
              申请已提交，回执编号：{{ submitReceipt.id }}
            </p>
            <button class="join-submit" type="submit" :disabled="submitLoading">
              <span>{{ submitLoading ? "提交中…" : "确认提交" }}</span
              ><b aria-hidden="true">↗</b>
            </button>
          </form>
        </section>
      </div>
    </Teleport>
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
.join-hero {
  background: var(--coral-dark);
}
.join-hero .eyebrow {
  color: #f4c5b2;
}
.join-hero p {
  color: #f0cfc0;
}
.join-grid {
  width: 100%;
  max-width: none;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 420px) minmax(
      360px,
      0.86fr
    );
  gap: clamp(36px, 4.5vw, 84px);
  position: relative;
}
.join-grid::before {
  content: "DATA // OPEN CALL 2026";
  position: absolute;
  top: 24px;
  right: 0;
  color: var(--muted);
  font: 8px var(--mono);
  letter-spacing: 0.1em;
}
.join-copy {
  max-width: 520px;
  padding-top: 26px;
}
.join-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--coral-dark);
  font: 9px var(--mono);
  letter-spacing: 0.14em;
}
.join-label i {
  width: 36px;
  height: 1px;
  display: inline-block;
  background: var(--cyan);
}
.join-label span:last-child {
  color: var(--muted);
}
.join-copy h2 {
  margin: 28px 0 25px;
  font: 500 clamp(36px, 4.6vw, 62px)/1.13 var(--serif);
  text-shadow: 3px 3px 0 rgba(196, 82, 78, 0.1);
}
.join-copy h2 em {
  color: var(--coral-dark);
  font-style: normal;
}
.join-intro {
  max-width: 470px;
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 2;
}
.join-note {
  margin-top: 42px;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--line);
}
.join-note-row {
  min-height: 62px;
  display: grid;
  grid-template-columns: 38px 1fr;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}
.join-note-row > span {
  color: var(--coral-dark);
  font: 10px var(--mono);
  letter-spacing: 0.1em;
}
.join-note-row div {
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.join-note-row strong {
  color: var(--ink);
  font: 500 14px var(--serif);
}
.join-note-row small {
  color: var(--muted);
  font: 11px var(--sans);
}
.join-side {
  display: contents;
}
.join-application {
  grid-column: 3;
  grid-row: 1;
  width: min(100%, 500px);
  justify-self: start;
  min-height: 100%;
  padding: 24px 22px 22px;
  display: flex;
  flex-direction: column;
  background: var(--soft-band);
  border: 1px solid var(--line);
  border-top: 3px solid var(--coral);
}
.join-application-meta {
  display: flex;
  justify-content: space-between;
  color: var(--coral-dark);
  font: 8px var(--mono);
  letter-spacing: 0.12em;
}
.join-application-meta span:last-child {
  color: var(--muted);
}
.join-application h3 {
  margin: 34px 0 16px;
  color: var(--ink);
  font: 500 clamp(27px, 3vw, 40px)/1.15 var(--serif);
}
.join-application h3 em {
  color: var(--coral-dark);
  font-style: normal;
}
.join-application > p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}
.join-application-list {
  margin: 26px 0 30px;
  border-top: 1px solid var(--line);
}
.join-application-list > div {
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}
.join-application-list dt {
  color: var(--coral-dark);
  font: 9px var(--mono);
}
.join-application-list dd {
  margin: 0;
  color: var(--ink);
  font: 12px var(--sans);
}
.join-application .join-apply {
  margin-top: auto;
}
.join-action-note {
  display: block;
  margin-top: 11px;
  color: var(--muted);
  font: 10px var(--mono);
  letter-spacing: 0.08em;
}
.join-apply,
.join-submit {
  min-height: 50px;
  padding: 0 16px 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 42px;
  border: 1px solid var(--coral-dark);
  border-left: 4px solid var(--cyan);
  background: var(--coral);
  color: #fffaf2;
  font: 500 13px var(--sans);
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}
.join-apply b,
.join-submit b {
  color: #f4c5b2;
  font: 19px var(--sans);
  line-height: 1;
  transition: transform 0.2s;
}
.join-apply:hover,
.join-submit:hover:not(:disabled) {
  background: var(--coral-dark);
  border-color: var(--coral-dark);
  box-shadow: 5px 5px 0 rgba(196, 82, 78, 0.18);
  transform: translate(-2px, -2px);
}
.join-apply:hover b,
.join-submit:hover:not(:disabled) b {
  transform: translate(3px, -3px);
}
.join-apply:active,
.join-submit:active:not(:disabled) {
  transform: translate(0, 1px);
  box-shadow: none;
}
.join-apply:focus-visible,
.join-submit:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 3px;
}
.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(8, 10, 11, 0.72);
}
.modal-panel {
  width: min(100%, 520px);
  padding: 28px;
  background: var(--paper);
  border: 1px solid var(--coral);
  box-shadow: 12px 12px 0 var(--panel-deep);
}
.modal-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
}
.modal-kicker {
  color: var(--coral-dark);
  font: 9px var(--mono);
  letter-spacing: 0.14em;
}
.modal-heading h2 {
  margin: 8px 0 0;
  color: var(--ink);
  font: 500 30px var(--serif);
}
.modal-close {
  width: 34px;
  height: 34px;
  border: 1px solid var(--line);
  color: var(--ink);
  background: transparent;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s,
    transform 0.2s;
}
.modal-close:hover {
  border-color: var(--coral);
  background: var(--coral);
  color: #fffaf2;
  transform: rotate(4deg);
}
.modal-close:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 2px;
}
.join-form {
  display: grid;
  gap: 14px;
  padding-top: 22px;
}
.join-form label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font: 10px var(--mono);
  letter-spacing: 0.08em;
}
.join-form input {
  width: 100%;
  min-height: 42px;
  padding: 9px 11px;
  border: 1px solid var(--line);
  background: var(--soft-band);
  color: var(--ink);
  font: 14px var(--sans);
}
.join-form input:focus {
  outline: 2px solid var(--cyan);
  outline-offset: 1px;
}
.join-submit {
  width: 100%;
  margin-top: 4px;
  border-left-width: 3px;
  background: var(--ink);
  border-color: var(--ink);
}
.join-submit b {
  color: var(--cyan);
}
.join-submit:disabled {
  cursor: wait;
  opacity: 0.55;
}
.form-error,
.form-success {
  margin: 2px 0 0;
  font-size: 12px;
}
.form-error {
  color: var(--coral-dark);
}
.form-success {
  color: #357d74;
}
.join-visual {
  grid-column: 2;
  grid-row: 1;
  width: min(100%, 420px);
  margin: 0;
  padding: clamp(10px, 1.4vw, 16px);
  position: relative;
  justify-self: end;
  overflow: hidden;
  background: #111113;
  border: 1px solid var(--cyan);
  box-shadow: 12px 12px 0 var(--coral-dark);
  clip-path: polygon(0 0, 96% 0, 100% 4%, 100% 100%, 4% 100%, 0 96%);
}
.join-visual::before,
.join-visual::after {
  position: absolute;
  z-index: 2;
  font: 8px var(--mono);
  letter-spacing: 0.12em;
}
.join-visual::before {
  content: "JOIN / 2026";
  top: 24px;
  right: 24px;
  color: rgba(255, 255, 255, 0.62);
}
.join-visual::after {
  content: "SCAN / CONNECT";
  right: 22px;
  bottom: 52px;
  color: var(--cyan);
}
.join-visual img {
  width: 100%;
  height: auto;
  aspect-ratio: 0.6;
  display: block;
  object-fit: contain;
}
.join-visual figcaption {
  margin: 13px 4px 2px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 11px;
  line-height: 1.6;
}
@media (max-width: 880px) {
  .inner-hero {
    clip-path: polygon(0 0, 96% 0, 100% 5%, 100% 100%, 4% 100%, 0 95%);
  }
  .join-grid {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.85fr);
    gap: 56px;
  }
  .join-copy {
    padding-top: 12px;
    grid-column: 1 / -1;
  }
  .join-visual {
    justify-self: center;
    grid-column: 1;
    grid-row: 2;
  }
  .join-application {
    grid-column: 2;
    grid-row: 2;
    padding: 22px 18px 20px;
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
  .join-grid {
    grid-template-columns: 1fr;
    gap: 52px;
  }
  .join-grid::before {
    top: 16px;
    right: 22px;
    font-size: 7px;
  }
  .join-copy {
    padding-top: 18px;
  }
  .join-copy h2 {
    margin-top: 23px;
    font-size: clamp(36px, 12vw, 54px);
  }
  .join-note-row {
    min-height: 68px;
  }
  .join-note-row div {
    display: grid;
    gap: 3px;
  }
  .join-side {
    display: contents;
  }
  .join-application {
    grid-column: 1;
    grid-row: 3;
    min-height: 0;
    padding: 22px 18px 20px;
  }
  .join-action-note {
    margin-top: 10px;
  }
  .join-visual {
    grid-column: 1;
    grid-row: 2;
    width: min(100%, 430px);
    margin: 0 auto;
    justify-self: stretch;
    box-shadow: 8px 8px 0 var(--coral-dark);
  }
  .modal-panel {
    padding: 22px 18px;
    box-shadow: 7px 7px 0 var(--panel-deep);
  }
  .modal-heading h2 {
    font-size: 26px;
  }
}
</style>
