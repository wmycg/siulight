<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { currentAdmin } from "../../modules/admin/services/admins.js";

const headerProps = defineProps({
  activeRoute: { type: String, required: true },
  isNight: { type: Boolean, required: true },
  isAdmin: { type: Boolean, default: false },
});

const emit = defineEmits(["navigate", "toggle-theme"]);
const isMenuOpen = ref(false);
const isMobile = ref(false);
let mobileMediaQuery;

function detectMobileDevice() {
  const viewportIsMobile = window.matchMedia?.("(max-width: 880px)").matches;
  const mobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  return Boolean(viewportIsMobile || mobileUserAgent);
}

function syncDeviceMode() {
  const nextIsMobile = detectMobileDevice();
  isMobile.value = nextIsMobile;
  if (!nextIsMobile) closeMenu();
  if (!nextIsMobile) document.body.style.overflowY = "";
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function selectRoute(route) {
  closeMenu();
  emit("navigate", route);
}

function handleKeydown(event) {
  if (event.key === "Escape") closeMenu();
}

watch(
  () => headerProps.activeRoute,
  () => closeMenu(),
);

watch(isMenuOpen, (open) => {
  document.body.dataset.navOpen = open && isMobile.value ? "true" : "false";
  document.body.style.overflowY = open && isMobile.value ? "hidden" : "";
});

onMounted(() => {
  syncDeviceMode();
  mobileMediaQuery = window.matchMedia?.("(max-width: 880px)");
  mobileMediaQuery?.addEventListener("change", syncDeviceMode);
  window.addEventListener("resize", syncDeviceMode);
  window.addEventListener("orientationchange", syncDeviceMode);
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener("change", syncDeviceMode);
  window.removeEventListener("resize", syncDeviceMode);
  window.removeEventListener("orientationchange", syncDeviceMode);
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflowY = "";
  delete document.body.dataset.navOpen;
});

const publicNavItems = [
  { id: "/", label: "首页", note: "INDEX" },
  { id: "/about", label: "关于社团", note: "ABOUT" },
  { id: "/departments", label: "部门", note: "PARTMENTS" },
  { id: "/events", label: "活动日历", note: "EVENTS" },
  { id: "/join", label: "加入我们", note: "JOIN" },
  { id: "/milestones", label: "里程碑", note: "ARCHIVE" },
];

const adminNavItems = [
  { id: "/admin/events", label: "活动管理", note: "EVENTS" },
  { id: "/admin/submits", label: "查看提交", note: "SUBMITS" },
  { id: "/admin/milestones", label: "里程碑", note: "ARCHIVE" },
  { id: "/admin/profile", label: "个人信息", note: "PROFILE" },
  { id: "/admin/managers", label: "管理员", note: "SUPER ONLY" },
];

const navItems = computed(() =>
  headerProps.isAdmin
    ? adminNavItems.filter(
        (item) => item.id !== "/admin/managers" || currentAdmin.value?.supe,
      )
    : publicNavItems,
);
</script>

<template>
  <header class="site-header" :class="{ 'is-mobile': isMobile }">
    <a class="brand-mark" href="/" @click.prevent="emit('navigate', '/')">
      <span class="brand-dot"></span>
      <span class="brand-copy"
        ><strong>微光漫摄</strong><small>SUI LIGHT</small></span
      >
    </a>
    <nav
      id="main-navigation"
      class="main-nav"
      :class="{ 'is-open': isMenuOpen, 'is-mobile-nav': isMobile }"
      :style="{ '--nav-count': navItems.length }"
      aria-label="主导航"
    >
      <div class="drawer-heading">
        <span>NAVIGATION / {{ String(navItems.length).padStart(2, "0") }}</span>
        <button
          class="drawer-close"
          type="button"
          aria-label="关闭导航菜单"
          @click="closeMenu"
        >
          ×
        </button>
      </div>
      <a
        v-for="item in navItems"
        :key="item.id"
        class="nav-link"
        :class="{ 'is-active': headerProps.activeRoute === item.id }"
        :href="item.id"
        :aria-current="headerProps.activeRoute === item.id ? 'page' : undefined"
        @click.prevent="selectRoute(item.id)"
      >
        <span class="nav-index">0{{ navItems.indexOf(item) + 1 }}</span>
        <span class="nav-label">{{ item.label }}</span>
        <small>{{ item.note }}</small>
      </a>
    </nav>
    <div class="header-status" aria-label="快速操作">
      <span class="status-chip status-chip-cyan">SYNCED</span>
      <div class="header-tool-row">
        <button
          class="header-tool"
          type="button"
          aria-label="返回首页"
          @click="emit('navigate', '/')"
        >
          ⌂
        </button>
      </div>
    </div>
    <div class="header-actions">
      <button
        v-if="isMobile"
        class="nav-toggle"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-controls="main-navigation"
        aria-label="打开导航菜单"
        @click="toggleMenu"
      >
        <span aria-hidden="true">{{ isMenuOpen ? "×" : "☰" }}</span>
        <small>MENU</small>
      </button>
      <button
        class="theme-toggle"
        type="button"
        :aria-pressed="headerProps.isNight"
        @click="emit('toggle-theme')"
      >
        <span>{{ headerProps.isNight ? "☀" : "☾" }}</span>
        <small>{{ headerProps.isNight ? "日间" : "夜摄" }}</small>
      </button>
      <span class="system-status"><i></i>SYS / READY</span>
    </div>
    <button
      v-if="isMobile && isMenuOpen"
      class="mobile-nav-backdrop"
      type="button"
      aria-label="关闭导航菜单"
      @click="closeMenu"
    ></button>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  inset: 0 0 auto;
  width: 100%;
  height: var(--header-height);
  padding: 12px clamp(18px, 4vw, 62px);
  z-index: 20;
  background: var(--panel-deep);
  color: #f4eee5;
  border-bottom: 1px solid rgba(244, 238, 229, 0.2);
}
.site-header::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: var(--coral);
}
.site-header::after {
  content: "LFC // 2026 // TOP COMMAND DECK";
  position: absolute;
  right: clamp(18px, 4vw, 62px);
  bottom: 7px;
  color: rgba(244, 238, 229, 0.35);
  font: 7px var(--mono);
  letter-spacing: 0.1em;
}
.brand-mark {
  min-width: 0;
  position: absolute;
  top: 50%;
  left: clamp(18px, 4vw, 62px);
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translateY(-50%);
}
.brand-dot {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  position: relative;
  border-radius: 4px;
  background: var(--coral);
  box-shadow: 0 0 0 4px rgba(196, 82, 78, 0.15);
  transform: rotate(45deg);
}
.brand-dot::after {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  top: 10px;
  left: 10px;
  border: 1px solid var(--paper);
  border-radius: 50%;
  transform: rotate(-45deg);
}
.brand-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.brand-copy strong {
  color: #f4eee5;
  font: 600 15px var(--serif);
  letter-spacing: 0.14em;
  white-space: nowrap;
}
.brand-copy small {
  color: var(--cyan);
  font: 8px var(--mono);
  letter-spacing: 0.12em;
}
.main-nav {
  min-width: 0;
  width: min(752px, calc(100% - 370px));
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  grid-template-columns: repeat(var(--nav-count, 6), minmax(0, 1fr));
  gap: 4px;
  transform: translate(-50%, -50%);
}

.nav-toggle,
.drawer-heading,
.mobile-nav-backdrop {
  display: none;
}
.nav-link {
  min-width: 0;
  min-height: 54px;
  padding: 7px 9px;
  position: relative;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  grid-template-rows: 1fr auto;
  align-items: center;
  color: rgba(244, 238, 229, 0.56);
  border: 1px solid transparent;
  border-left-color: rgba(244, 238, 229, 0.14);
  background: rgba(244, 238, 229, 0.035);
  clip-path: polygon(0 0, 96% 0, 100% 18%, 100% 100%, 0 100%);
  transition:
    background 0.25s,
    color 0.25s,
    border-color 0.25s;
}
.nav-index {
  grid-row: 1 / span 2;
  color: rgba(244, 238, 229, 0.3);
  font: 10px var(--mono);
}
.nav-label {
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font: 500 13px var(--serif);
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-link small {
  color: rgba(244, 238, 229, 0.32);
  font: 7px var(--mono);
  letter-spacing: 0.13em;
}
.nav-link:hover,
.nav-link.is-active {
  color: #fffaf2;
  border-left-color: var(--cyan);
  background: var(--coral-dark);
}
.nav-link.is-active::after {
  content: "";
  position: absolute;
  right: 9px;
  bottom: 4px;
  left: 9px;
  height: 2px;
  background: var(--cyan);
}
.nav-link:hover .nav-index,
.nav-link.is-active .nav-index,
.nav-link:hover small,
.nav-link.is-active small {
  color: rgba(255, 250, 242, 0.72);
}
.header-status,
.header-tool-row,
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.header-status {
  position: absolute;
  top: 50%;
  right: calc(clamp(18px, 4vw, 62px) + 158px);
  transform: translateY(-50%);
}
.status-chip {
  min-height: 22px;
  padding: 5px 7px;
  color: rgba(244, 238, 229, 0.52);
  border: 1px solid rgba(244, 238, 229, 0.16);
  font: 8px var(--mono);
  letter-spacing: 0.08em;
}
.status-chip-cyan {
  color: var(--cyan);
  border-color: rgba(112, 214, 208, 0.36);
}
.header-tool,
.theme-toggle {
  border: 1px solid rgba(244, 238, 229, 0.2);
  background: rgba(244, 238, 229, 0.04);
  color: rgba(244, 238, 229, 0.78);
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}
.header-tool {
  width: 32px;
  height: 32px;
  font-size: 16px;
  line-height: 1;
}
.header-tool:hover,
.theme-toggle:hover {
  color: #fffaf2;
  border-color: var(--cyan);
  background: var(--coral-dark);
}
.header-actions {
  position: absolute;
  top: 50%;
  right: clamp(18px, 4vw, 62px);
  justify-content: flex-end;
  gap: 9px;
  transform: translateY(-50%);
}
.theme-toggle {
  min-height: 34px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font: 9px var(--mono);
}
.theme-toggle span {
  font-size: 15px;
}
.system-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(244, 238, 229, 0.42);
  font: 8px var(--mono);
  letter-spacing: 0.1em;
}
.system-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 0 3px rgba(112, 214, 208, 0.12);
}
@media (max-width: 1120px) {
  .header-status {
    display: none;
  }

  .nav-link {
    padding-right: 7px;
    padding-left: 7px;
    grid-template-columns: 22px minmax(0, 1fr);
  }

  .nav-label {
    font-size: 12px;
    letter-spacing: 0.04em;
  }
}

@media (min-width: 881px) and (max-width: 940px) {
  .nav-label {
    font-size: 11px;
    letter-spacing: 0;
  }
}

@media (max-width: 880px) {
  .site-header {
    position: sticky;
    inset: auto;
    height: auto;
    min-height: var(--header-height);
    padding: 12px 18px 9px;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    gap: 9px 14px;
  }
  .brand-mark,
  .header-actions {
    position: static;
    top: auto;
    right: auto;
    left: auto;
    transform: none;
  }
  .main-nav {
    top: auto;
    left: auto;
    transform: none;
  }
  .site-header::after {
    display: none;
  }
  .brand-mark {
    grid-column: 1;
    grid-row: 1;
  }
  .brand-dot {
    width: 23px;
    height: 23px;
  }
  .brand-dot::after {
    top: 7px;
    left: 7px;
  }
  .header-actions {
    grid-column: 2;
    grid-row: 1;
  }
  .system-status {
    display: none;
  }
  .main-nav {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 31;
    width: min(320px, 84vw);
    height: 100dvh;
    padding: 18px 16px 24px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    overflow-y: auto;
    background: var(--panel-deep);
    border-right: 1px solid rgba(244, 238, 229, 0.2);
    box-shadow: 18px 0 40px rgba(0, 0, 0, 0.24);
    transform: translateX(-105%);
    transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    scrollbar-width: thin;
  }

  .main-nav.is-open {
    transform: translateX(0);
  }

  .main-nav::-webkit-scrollbar {
    width: 4px;
  }

  .main-nav::-webkit-scrollbar-thumb {
    background: rgba(112, 214, 208, 0.45);
  }

  .drawer-heading {
    min-height: 42px;
    padding: 0 2px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--cyan);
    border-bottom: 1px solid rgba(244, 238, 229, 0.16);
    font: 9px var(--mono);
    letter-spacing: 0.14em;
  }

  .drawer-close {
    width: 32px;
    height: 32px;
    border: 1px solid rgba(244, 238, 229, 0.22);
    background: rgba(244, 238, 229, 0.04);
    color: rgba(244, 238, 229, 0.8);
    font: 20px/1 var(--mono);
  }

  .drawer-close:hover {
    color: #fffaf2;
    border-color: var(--cyan);
    background: var(--coral-dark);
  }

  .mobile-nav-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 30;
    padding: 0;
    border: 0;
    background: rgba(8, 10, 11, 0.62);
    cursor: default;
  }

  .nav-toggle {
    width: 42px;
    height: 34px;
    padding: 0;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: 1px solid rgba(244, 238, 229, 0.2);
    background: rgba(244, 238, 229, 0.04);
    color: rgba(244, 238, 229, 0.86);
  }

  .nav-toggle:hover,
  .nav-toggle[aria-expanded="true"] {
    border-color: var(--cyan);
    background: var(--coral-dark);
    color: #fffaf2;
  }

  .nav-toggle span {
    font-size: 18px;
    line-height: 16px;
  }

  .nav-toggle small {
    color: var(--cyan);
    font: 6px var(--mono);
    letter-spacing: 0.1em;
    line-height: 7px;
  }

  .nav-link {
    flex: 0 0 auto;
    width: 100%;
    min-height: 58px;
    padding: 9px 11px;
    display: grid;
    grid-template-columns: 30px 1fr;
    grid-template-rows: 1fr auto;
    align-items: center;
    text-align: left;
  }

  .nav-index {
    display: block;
    grid-row: 1 / span 2;
  }

  .nav-label {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
    line-height: 1.35;
  }
}
@media (max-width: 620px) {
  .site-header {
    padding-right: 12px;
    padding-left: 12px;
  }
  .brand-copy strong {
    font-size: 14px;
  }
  .brand-copy small {
    font-size: 7px;
  }
  .theme-toggle {
    min-height: 31px;
    padding: 0 8px;
  }
  .theme-toggle small {
    display: none;
  }
  .nav-link {
    flex-basis: auto;
    min-width: 92px;
  }
  .nav-label {
    font-size: 12px;
  }
}

/* User-agent detection fallback: keep mobile browsers in drawer mode even
   when an embedded browser reports a desktop-sized viewport. */
@media (min-width: 881px) {
  .site-header.is-mobile {
    position: sticky;
    inset: auto;
    height: auto;
    min-height: 116px;
    padding: 12px 18px 9px;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    gap: 9px 14px;
  }

  .site-header.is-mobile .brand-mark,
  .site-header.is-mobile .header-actions {
    position: static;
    top: auto;
    right: auto;
    left: auto;
    transform: none;
  }

  .site-header.is-mobile::after {
    display: none;
  }

  .site-header.is-mobile .brand-mark {
    grid-column: 1;
    grid-row: 1;
  }

  .site-header.is-mobile .brand-dot {
    width: 23px;
    height: 23px;
  }

  .site-header.is-mobile .brand-dot::after {
    top: 7px;
    left: 7px;
  }

  .site-header.is-mobile .header-status,
  .site-header.is-mobile .system-status {
    display: none;
  }

  .site-header.is-mobile .header-actions {
    grid-column: 2;
    grid-row: 1;
  }

  .site-header.is-mobile .nav-toggle {
    width: 42px;
    height: 34px;
    padding: 0;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: 1px solid rgba(244, 238, 229, 0.2);
    background: rgba(244, 238, 229, 0.04);
    color: rgba(244, 238, 229, 0.86);
  }

  .site-header.is-mobile .nav-toggle span {
    font-size: 18px;
    line-height: 16px;
  }

  .site-header.is-mobile .nav-toggle small {
    color: var(--cyan);
    font: 6px var(--mono);
    letter-spacing: 0.1em;
    line-height: 7px;
  }

  .site-header.is-mobile .main-nav {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 31;
    width: min(320px, 84vw);
    height: 100dvh;
    padding: 18px 16px 24px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    overflow-y: auto;
    background: var(--panel-deep);
    border-right: 1px solid rgba(244, 238, 229, 0.2);
    box-shadow: 18px 0 40px rgba(0, 0, 0, 0.24);
    transform: translateX(-105%);
    transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    scrollbar-width: thin;
  }

  .site-header.is-mobile .main-nav.is-open {
    transform: translateX(0);
  }

  .site-header.is-mobile .drawer-heading {
    min-height: 42px;
    padding: 0 2px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--cyan);
    border-bottom: 1px solid rgba(244, 238, 229, 0.16);
    font: 9px var(--mono);
    letter-spacing: 0.14em;
  }

  .site-header.is-mobile .drawer-close {
    width: 32px;
    height: 32px;
    border: 1px solid rgba(244, 238, 229, 0.22);
    background: rgba(244, 238, 229, 0.04);
    color: rgba(244, 238, 229, 0.8);
    font: 20px/1 var(--mono);
  }

  .site-header.is-mobile .mobile-nav-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 30;
    padding: 0;
    border: 0;
    background: rgba(8, 10, 11, 0.62);
    cursor: default;
  }

  .site-header.is-mobile .nav-link {
    width: 100%;
    min-height: 58px;
    padding: 9px 11px;
    display: grid;
    grid-template-columns: 30px 1fr;
    grid-template-rows: 1fr auto;
    align-items: center;
    text-align: left;
  }

  .site-header.is-mobile .nav-index {
    display: block;
    grid-row: 1 / span 2;
  }

  .site-header.is-mobile .nav-label {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
    line-height: 1.35;
  }
}
</style>
