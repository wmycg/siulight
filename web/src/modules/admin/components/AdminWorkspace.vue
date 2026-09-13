<script setup>
import { onMounted, reactive, ref, toRef } from "vue";
import {
  createEvent,
  deleteEvent,
  events,
  eventsError,
  eventsLoading,
  eventsMutating,
  loadEvents,
  updateEvent,
} from "../../events/services/events.js";
import {
  adminError,
  adminLoading,
  adminMutating,
  admins,
  checkSession,
  createAdmin,
  currentAdmin,
  deleteAdmin,
  loadAdmins,
  login,
  updatePassword,
} from "../services/admins.js";
import {
  getSubmit,
  loadSubmits,
  submitDetailError,
  submitDetailLoading,
  submitError,
  submitLoading,
  submits,
} from "../../submit/services/submits.js";
import {
  adminMilestones,
  adminMilestonesError,
  adminMilestonesLoading,
  adminMilestonesMutating,
  deleteAdminMilestone,
  loadAdminMilestones,
} from "../services/adminMilestones.js";

const adminProps = defineProps({
  section: {
    type: String,
    required: true,
    validator: (value) =>
      ["events", "submits", "milestones", "profile", "managers"].includes(
        value,
      ),
  },
});
const section = toRef(adminProps, "section");

const modal = ref("");
const selectedSubmit = ref(null);
const eventForm = reactive({ date: "", title: "", place: "", brief: "" });
const adminForm = reactive({ username: "", password: "", supe: false });
const passwordForm = reactive({ oldPassword: "", newPassword: "" });
const loginForm = reactive({ username: "", password: "" });
const editingEventId = ref(null);
const loginPasswordVisible = ref(false);
const adminPasswordVisible = ref(false);
const oldPasswordVisible = ref(false);
const newPasswordVisible = ref(false);

function resetEventForm(event = null) {
  editingEventId.value = event?.id || null;
  eventForm.date = event?.date || "";
  eventForm.title = event?.title || "";
  eventForm.place = event?.place || "";
  eventForm.brief = event?.brief || "";
}

function openEventModal(event = null) {
  resetEventForm(event);
  modal.value = "event";
}

function closeModal() {
  modal.value = "";
  selectedSubmit.value = null;
}

async function saveEvent() {
  const result = editingEventId.value
    ? await updateEvent(editingEventId.value, eventForm)
    : await createEvent(eventForm);
  if (result) closeModal();
}

async function removeEvent(id) {
  if (window.confirm("确定删除这个活动吗？")) await deleteEvent(id);
}

async function removeMilestone(milestone) {
  if (window.confirm("确定删除这条里程碑吗？删除后无法恢复。")) {
    await deleteAdminMilestone(milestone.id);
  }
}

function formatMilestoneTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function submitLogin() {
  const admin = await login(loginForm);
  if (admin) {
    modal.value = "";
    if (adminProps.section === "events") await loadEvents();
    if (adminProps.section === "submits") await loadSubmits();
    if (adminProps.section === "milestones") await loadAdminMilestones();
    if (adminProps.section === "managers" && admin.supe) await loadAdmins();
  }
}

async function openSubmit(submit) {
  selectedSubmit.value = submit;
  modal.value = "submit";
  const detail = await getSubmit(submit.id);
  if (detail) selectedSubmit.value = detail;
}

async function saveAdmin() {
  const result = await createAdmin(adminForm);
  if (result) {
    adminForm.username = "";
    adminForm.password = "";
    adminForm.supe = false;
    closeModal();
  }
}

async function savePassword() {
  const result = await updatePassword(passwordForm);
  if (result) {
    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
    closeModal();
  }
}

onMounted(async () => {
  modal.value = "login";
  if (!currentAdmin.value) {
    await checkSession();
  }
  if (!currentAdmin.value) {
    return;
  }
  modal.value = "";
  if (adminProps.section === "events") await loadEvents();
  if (adminProps.section === "submits") await loadSubmits();
  if (adminProps.section === "milestones") await loadAdminMilestones();
  if (adminProps.section === "managers" && currentAdmin.value.supe) {
    await loadAdmins();
  }
});
</script>

<template>
  <main class="admin-view view-inner" :class="{ 'is-locked': !currentAdmin }">
    <div v-if="!currentAdmin" class="admin-locked-state"></div>
    <template v-else>
      <section class="admin-hero">
        <div>
          <span class="admin-kicker">LUMEN FRAME / ADMIN DECK</span>
          <h1>后台工作台</h1>
          <p>把活动、报名与社团日常，放在同一块清晰的工作面上。</p>
        </div>
        <div class="admin-identity" v-if="currentAdmin">
          <span>ACTIVE OPERATOR</span>
          <strong>{{ currentAdmin.username }}</strong>
          <small>{{ currentAdmin.supe ? "SUPER ADMIN" : "ADMIN" }}</small>
        </div>
      </section>

      <section class="admin-content page-section">
        <div v-if="section === 'events'" class="admin-section">
          <div class="admin-section-heading">
            <div>
              <span class="admin-kicker">01 / EVENTS</span>
              <h2>活动档案</h2>
            </div>
            <span class="admin-count">{{ events.length }} RECORDS</span>
          </div>
          <p v-if="eventsLoading" class="admin-state">正在同步活动……</p>
          <p v-else-if="eventsError" class="admin-state admin-state-error">
            {{ eventsError }}
          </p>
          <div v-else class="admin-event-grid">
            <p v-if="events.length === 0" class="admin-state admin-event-empty">
              暂无活动记录，先添加一个活动吧。
            </p>
            <article
              v-for="event in events"
              :key="event.id"
              class="admin-event-card"
            >
              <span class="admin-card-code">EVENT / {{ event.id }}</span>
              <strong>{{ event.title }}</strong>
              <p>{{ event.date }} · {{ event.place }}</p>
              <small>{{ event.brief }}</small>
              <div class="admin-card-actions">
                <button type="button" @click="openEventModal(event)">
                  编辑
                </button>
                <button type="button" @click="removeEvent(event.id)">
                  删除
                </button>
              </div>
            </article>
            <button
              class="admin-add-card"
              type="button"
              @click="openEventModal()"
            >
              <span>＋</span><strong>添加事件</strong
              ><small>NEW EVENT RECORD</small>
            </button>
          </div>
        </div>

        <div v-else-if="section === 'submits'" class="admin-section">
          <div class="admin-section-heading">
            <div>
              <span class="admin-kicker">02 / SUBMITS</span>
              <h2>申请提交</h2>
            </div>
          </div>
          <p v-if="submitLoading" class="admin-state">正在读取申请……</p>
          <p v-else-if="submitError" class="admin-state admin-state-error">
            {{ submitError }}
          </p>
          <div v-else class="admin-table">
            <div
              v-for="submit in submits"
              :key="submit.id"
              class="admin-row"
              @click="openSubmit(submit)"
            >
              <span>#{{ submit.id }}</span
              ><strong>{{ submit.truename }}</strong
              ><span>{{ submit.aimpartment }}</span
              ><small>{{ submit.date }}</small>
            </div>
            <p v-if="submits.length === 0" class="admin-state">
              暂无提交记录。
            </p>
          </div>
        </div>

        <div v-else-if="section === 'milestones'" class="admin-section">
          <div class="admin-section-heading">
            <div>
              <span class="admin-kicker">03 / MILESTONES</span>
              <h2>里程碑留言</h2>
            </div>
            <span class="admin-count"
              >{{ adminMilestones.length }} RECORDS</span
            >
          </div>
          <p v-if="adminMilestonesLoading" class="admin-state">
            正在读取里程碑……
          </p>
          <p
            v-else-if="adminMilestonesError"
            class="admin-state admin-state-error"
          >
            {{ adminMilestonesError }}
          </p>
          <div v-else class="admin-table admin-milestone-table">
            <div
              class="admin-milestone-row admin-milestone-heading"
              aria-hidden="true"
            >
              <span>ID</span><span>CONTENT</span><span>SEMESTER</span
              ><span>CREATED</span><span></span>
            </div>
            <div
              v-for="milestone in adminMilestones"
              :key="milestone.id"
              class="admin-milestone-row"
            >
              <span>#{{ milestone.id }}</span>
              <strong>{{ milestone.content }}</strong>
              <span>{{ milestone.semester }}</span>
              <small>{{ formatMilestoneTimestamp(milestone.timestamp) }}</small>
              <button
                type="button"
                :disabled="adminMilestonesMutating"
                @click="removeMilestone(milestone)"
              >
                删除
              </button>
            </div>
            <p v-if="adminMilestones.length === 0" class="admin-state">
              暂无里程碑留言。
            </p>
          </div>
        </div>

        <div
          v-else-if="section === 'profile'"
          class="admin-section profile-section"
        >
          <span class="admin-kicker">04 / PROFILE</span>
          <h2>个人信息</h2>
          <p>当前登录身份：{{ currentAdmin?.username || "未登录" }}</p>
          <button
            class="profile-password-button"
            type="button"
            @click="modal = 'password'"
          >
            <span>修改密码</span><b aria-hidden="true">↗</b>
          </button>
        </div>

        <div
          v-else-if="section === 'managers' && currentAdmin?.supe"
          class="admin-section"
        >
          <div class="admin-section-heading">
            <div>
              <span class="admin-kicker">05 / ADMINS</span>
              <h2>管理员名册</h2>
            </div>
            <button
              class="button button-primary"
              type="button"
              @click="modal = 'admin'"
            >
              添加管理员
            </button>
          </div>
          <p v-if="adminLoading" class="admin-state">正在读取管理员……</p>
          <div v-else class="admin-table">
            <div v-for="admin in admins" :key="admin.id" class="admin-row">
              <span>#{{ admin.id }}</span
              ><strong>{{ admin.username }}</strong
              ><span>{{ admin.supe ? "SUPER ADMIN" : "ADMIN" }}</span
              ><button type="button" @click="deleteAdmin(admin.id)">
                删除
              </button>
            </div>
          </div>
        </div>
        <div v-else class="admin-section">
          <span class="admin-kicker">ACCESS DENIED</span>
          <h2>需要超级管理员权限</h2>
        </div>
      </section>
    </template>
    <Teleport to="body">
      <div
        v-if="modal"
        class="admin-modal-layer"
        @click.self="modal === 'login' ? null : closeModal()"
      >
        <section class="admin-modal" role="dialog" aria-modal="true">
          <button
            v-if="modal !== 'login'"
            class="admin-modal-close"
            type="button"
            aria-label="关闭窗口"
            @click="closeModal"
          >
            ×
          </button>
          <template v-if="modal === 'login'"
            ><span class="admin-kicker">SECURE ACCESS</span>
            <h2>管理员登录</h2>
            <form @submit.prevent="submitLogin">
              <label
                >用户名<input
                  v-model.trim="loginForm.username"
                  required /></label
              ><label
                >密码
                <div class="password-field">
                  <input
                    v-model="loginForm.password"
                    required
                    :type="loginPasswordVisible ? 'text' : 'password'"
                  /><button
                    class="password-toggle"
                    type="button"
                    :aria-pressed="loginPasswordVisible"
                    @click="loginPasswordVisible = !loginPasswordVisible"
                  >
                    {{ loginPasswordVisible ? "隐藏" : "显示" }}
                  </button>
                </div></label
              >
              <p v-if="adminError" class="admin-form-error">{{ adminError }}</p>
              <button
                class="button button-primary"
                type="submit"
                :disabled="adminMutating"
              >
                进入工作台
              </button>
            </form></template
          >
          <template v-else-if="modal === 'event'"
            ><span class="admin-kicker">EVENT RECORD</span>
            <h2>{{ editingEventId ? "编辑活动" : "添加活动" }}</h2>
            <form @submit.prevent="saveEvent">
              <label
                >日期<input
                  v-model.trim="eventForm.date"
                  required
                  maxlength="20" /></label
              ><label
                >标题<input
                  v-model.trim="eventForm.title"
                  required
                  maxlength="20" /></label
              ><label
                >地点<input
                  v-model.trim="eventForm.place"
                  required
                  maxlength="20" /></label
              ><label
                >简介<textarea
                  v-model.trim="eventForm.brief"
                  required
                  maxlength="300"
                ></textarea>
              </label>
              <p v-if="eventsError" class="admin-form-error">
                {{ eventsError }}
              </p>
              <button
                class="button button-primary"
                type="submit"
                :disabled="eventsMutating"
              >
                保存活动
              </button>
            </form></template
          >
          <template v-else-if="modal === 'submit'"
            ><span class="admin-kicker">APPLICATION DETAIL</span>
            <h2>申请详情</h2>
            <p v-if="submitDetailLoading" class="admin-state">正在读取详情……</p>
            <p v-else-if="submitDetailError" class="admin-form-error">
              {{ submitDetailError }}
            </p>
            <dl v-else class="submit-detail">
              <div>
                <dt>网名</dt>
                <dd>{{ selectedSubmit?.webname || "—" }}</dd>
              </div>
              <div>
                <dt>姓名</dt>
                <dd>{{ selectedSubmit?.truename || "—" }}</dd>
              </div>
              <div>
                <dt>学号</dt>
                <dd>{{ selectedSubmit?.ncunum || "—" }}</dd>
              </div>
              <div>
                <dt>QQ</dt>
                <dd>{{ selectedSubmit?.qq || "—" }}</dd>
              </div>
              <div>
                <dt>意向部门</dt>
                <dd>{{ selectedSubmit?.aimpartment || "—" }}</dd>
              </div>
            </dl></template
          >
          <template v-else-if="modal === 'password'"
            ><span class="admin-kicker">PROFILE UPDATE</span>
            <h2>修改密码</h2>
            <form @submit.prevent="savePassword">
              <label
                >旧密码
                <div class="password-field">
                  <input
                    v-model="passwordForm.oldPassword"
                    required
                    :type="oldPasswordVisible ? 'text' : 'password'"
                  /><button
                    class="password-toggle"
                    type="button"
                    :aria-pressed="oldPasswordVisible"
                    @click="oldPasswordVisible = !oldPasswordVisible"
                  >
                    {{ oldPasswordVisible ? "隐藏" : "显示" }}
                  </button>
                </div></label
              ><label
                >新密码
                <div class="password-field">
                  <input
                    v-model="passwordForm.newPassword"
                    required
                    :type="newPasswordVisible ? 'text' : 'password'"
                  /><button
                    class="password-toggle"
                    type="button"
                    :aria-pressed="newPasswordVisible"
                    @click="newPasswordVisible = !newPasswordVisible"
                  >
                    {{ newPasswordVisible ? "隐藏" : "显示" }}
                  </button>
                </div></label
              >
              <p v-if="adminError" class="admin-form-error">{{ adminError }}</p>
              <button
                class="button button-primary"
                type="submit"
                :disabled="adminMutating"
              >
                更新密码
              </button>
            </form></template
          >
          <template v-else-if="modal === 'admin'"
            ><span class="admin-kicker">ADMIN RECORD</span>
            <h2>添加管理员</h2>
            <form @submit.prevent="saveAdmin">
              <label
                >用户名<input
                  v-model.trim="adminForm.username"
                  required
                  maxlength="20" /></label
              ><label
                >密码
                <div class="password-field">
                  <input
                    v-model="adminForm.password"
                    required
                    maxlength="20"
                    :type="adminPasswordVisible ? 'text' : 'password'"
                  /><button
                    class="password-toggle"
                    type="button"
                    :aria-pressed="adminPasswordVisible"
                    @click="adminPasswordVisible = !adminPasswordVisible"
                  >
                    {{ adminPasswordVisible ? "隐藏" : "显示" }}
                  </button>
                </div></label
              ><label class="check-label"
                ><input v-model="adminForm.supe" type="checkbox" />
                超级管理员</label
              >
              <p v-if="adminError" class="admin-form-error">{{ adminError }}</p>
              <button
                class="button button-primary"
                type="submit"
                :disabled="adminMutating"
              >
                创建管理员
              </button>
            </form></template
          >
        </section>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.admin-view {
  min-height: calc(100dvh - var(--header-height) - 34px);
}
.admin-view.is-locked {
  min-height: calc(100dvh - var(--header-height));
  background: var(--panel-deep);
}
.admin-locked-state {
  min-height: calc(100dvh - var(--header-height));
}
.admin-hero {
  padding: clamp(54px, 8vw, 96px) clamp(24px, 9vw, 150px);
  display: flex;
  justify-content: space-between;
  gap: 40px;
  background: var(--panel-deep);
  color: #f4eee5;
  border-bottom: 1px solid rgba(244, 238, 229, 0.18);
}
.admin-hero h1 {
  margin: 12px 0 16px;
  font: 600 clamp(42px, 6vw, 78px)/1 var(--serif);
}
.admin-hero p {
  max-width: 520px;
  margin: 0;
  color: #b9aaa2;
  line-height: 1.8;
}
.admin-kicker {
  color: var(--cyan);
  font: 9px var(--mono);
  letter-spacing: 0.14em;
}
.admin-identity {
  align-self: end;
  min-width: 180px;
  padding-left: 20px;
  border-left: 1px solid var(--cyan);
  display: grid;
  gap: 7px;
  font: 9px var(--mono);
  color: #a89a90;
}
.admin-identity strong {
  color: #f4eee5;
  font: 22px var(--serif);
}
.admin-identity small {
  color: var(--coral);
  font: 9px var(--mono);
}
.admin-content {
  max-width: 1200px;
  margin: 0 auto;
  padding-right: clamp(24px, 7vw, 110px);
  padding-left: clamp(24px, 7vw, 110px);
}
.admin-section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}
.admin-section h2 {
  margin: 10px 0 0;
  font: 500 clamp(30px, 4vw, 50px) var(--serif);
}
.admin-count {
  color: var(--muted);
  font: 9px var(--mono);
  letter-spacing: 0.1em;
}
.admin-event-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.admin-event-empty {
  grid-column: 1 / -1;
  margin: 0;
  padding: 10px 0 4px;
}
.admin-event-card,
.admin-add-card {
  min-height: 190px;
  padding: 22px;
  border: 1px solid var(--line);
  background: var(--soft-band);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}
.admin-event-card strong {
  margin: 15px 0 8px;
  color: var(--ink);
  font: 500 24px var(--serif);
}
.admin-event-card p {
  margin: 0 0 14px;
  color: var(--coral-dark);
  font: 10px var(--mono);
}
.admin-event-card small {
  color: var(--muted);
  line-height: 1.7;
}
.admin-card-code {
  color: var(--coral-dark);
  font: 9px var(--mono);
  letter-spacing: 0.1em;
}
.admin-card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 18px;
}
.admin-card-actions button,
.admin-row button {
  border: 0;
  border-bottom: 1px solid var(--coral);
  padding: 2px 0;
  background: transparent;
  color: var(--coral-dark);
  font: 10px var(--mono);
}
.admin-add-card {
  justify-content: center;
  align-items: center;
  border: 1px dashed var(--coral);
  background: transparent;
  color: var(--coral-dark);
  cursor: pointer;
}
.admin-add-card span {
  font-size: 30px;
  line-height: 1;
}
.admin-add-card strong {
  margin-top: 12px;
  font: 500 22px var(--serif);
}
.admin-add-card small {
  margin-top: 8px;
  font: 8px var(--mono);
  letter-spacing: 0.12em;
}
.admin-state {
  padding: 26px 0;
  color: var(--muted);
}
.admin-state-error,
.admin-form-error {
  color: var(--coral-dark);
}
.admin-table {
  border-top: 1px solid var(--line);
}
.admin-row {
  min-height: 64px;
  padding: 14px 4px;
  display: grid;
  grid-template-columns: 70px 1.2fr 1fr 1fr auto;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}
.admin-row span,
.admin-row small {
  color: var(--muted);
  font: 10px var(--mono);
}
.admin-row strong {
  color: var(--ink);
  font: 16px var(--serif);
}
.admin-milestone-row {
  min-height: 68px;
  padding: 14px 4px;
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 110px 180px auto;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid var(--line);
}
.admin-milestone-row > span,
.admin-milestone-row > small {
  color: var(--muted);
  font: 10px var(--mono);
}
.admin-milestone-row strong {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--ink);
  font: 500 15px/1.6 var(--serif);
}
.admin-milestone-row button {
  justify-self: end;
  border: 0;
  border-bottom: 1px solid var(--coral);
  padding: 2px 0;
  background: transparent;
  color: var(--coral-dark);
  font: 10px var(--mono);
}
.admin-milestone-row button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.admin-milestone-heading {
  min-height: 38px;
  color: var(--muted);
  border-bottom: 1px solid var(--line-strong);
  font: 8px var(--mono);
  letter-spacing: 0.1em;
}
.admin-milestone-heading > span {
  color: var(--muted);
  font: 8px var(--mono);
  letter-spacing: 0.1em;
}
.profile-section > p {
  color: var(--muted);
  margin: 18px 0 28px;
}
.profile-password-button {
  min-height: 44px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 26px;
  border: 1px solid var(--line);
  border-left: 3px solid var(--cyan);
  background: var(--soft-band);
  color: var(--ink);
  font: 500 13px var(--serif);
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.2s;
}
.profile-password-button b {
  color: var(--coral-dark);
  font: 16px var(--mono);
}
.profile-password-button:hover {
  border-color: var(--coral);
  background: color-mix(in srgb, var(--soft-band) 82%, var(--coral) 18%);
  transform: translateX(3px);
}
.admin-modal-layer {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 22px;
  background: rgba(8, 10, 11, 0.72);
}
.admin-modal {
  width: min(100%, 520px);
  max-height: calc(100dvh - 44px);
  overflow: auto;
  padding: 30px;
  position: relative;
  background: var(--paper);
  border: 1px solid var(--coral);
  box-shadow: 12px 12px 0 var(--panel-deep);
}
.admin-modal h2 {
  margin: 10px 0 24px;
  color: var(--ink);
  font: 500 32px var(--serif);
}
.admin-modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 21px;
}
.admin-modal form {
  display: grid;
  gap: 15px;
}
.admin-modal label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font: 10px var(--mono);
  letter-spacing: 0.08em;
}
.admin-modal input,
.admin-modal textarea {
  width: 100%;
  min-height: 42px;
  padding: 9px 11px;
  border: 1px solid var(--line);
  background: var(--soft-band);
  color: var(--ink);
  font: 14px var(--sans);
}
.password-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
}
.password-field input {
  min-width: 0;
}
.password-toggle {
  min-width: 54px;
  min-height: 42px;
  padding: 0 9px;
  border: 1px solid var(--line);
  border-left: 0;
  background: var(--paper);
  color: var(--coral-dark);
  font: 9px var(--mono);
}
.password-toggle:hover,
.password-toggle[aria-pressed="true"] {
  background: var(--coral-dark);
  color: #fffaf2;
}
.admin-modal textarea {
  min-height: 90px;
  resize: vertical;
}
.admin-modal input:focus,
.admin-modal textarea:focus {
  outline: 2px solid var(--cyan);
  outline-offset: 1px;
}
.check-label {
  display: flex !important;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px !important;
}
.check-label input {
  width: 16px;
  min-height: 16px;
}
.submit-detail {
  margin: 0;
  display: grid;
  gap: 13px;
}
.submit-detail div {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}
.submit-detail dt {
  color: var(--muted);
  font: 10px var(--mono);
}
.submit-detail dd {
  margin: 0;
  color: var(--ink);
  font-size: 14px;
}
@media (max-width: 700px) {
  .admin-hero {
    display: block;
  }
  .admin-identity {
    margin-top: 28px;
  }
  .admin-event-grid {
    grid-template-columns: 1fr;
  }
  .admin-row {
    grid-template-columns: 45px 1fr auto;
  }
  .admin-row span:nth-child(3),
  .admin-row small {
    display: none;
  }
  .admin-milestone-row {
    grid-template-columns: 45px minmax(0, 1fr) auto;
    gap: 12px;
  }
  .admin-milestone-row > span:nth-child(3),
  .admin-milestone-row > small,
  .admin-milestone-heading {
    display: none;
  }
  .admin-milestone-row strong {
    font-size: 14px;
  }
}
</style>
