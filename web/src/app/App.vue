<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import SiteHeader from "../shared/layout/SiteHeader.vue";
import SiteFooter from "../shared/layout/SiteFooter.vue";
import { currentAdmin } from "../modules/admin/services/admins.js";
import { legacyRoutes, routeMeta, routeViews } from "./routes.js";

const route = ref(readRoute());
const theme = ref(readTheme());
const isAdminRoute = computed(() => route.value.startsWith("/admin"));
const isLockedAdmin = computed(() => isAdminRoute.value && !currentAdmin.value);
const currentView = computed(() => routeViews[route.value] || routeViews["/"]);
const currentRouteMeta = computed(
  () => routeMeta[route.value] || routeMeta["/"],
);

function readRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const hashRoute = legacyRoutes[window.location.hash.slice(1)];
  if (hashRoute) {
    window.history.replaceState({}, "", hashRoute);
    return hashRoute;
  }
  if (routeViews[pathname]) {
    if (window.location.hash) window.history.replaceState({}, "", pathname);
    return pathname;
  }
  const fallback = pathname.startsWith("/admin") ? "/admin/events" : "/";
  if (pathname !== fallback) window.history.replaceState({}, "", fallback);
  return fallback;
}

function readTheme() {
  try {
    return localStorage.getItem("weiguang-theme") || "day";
  } catch {
    return "day";
  }
}

function navigate(nextRoute) {
  const next = legacyRoutes[nextRoute] || nextRoute;
  const normalized = routeViews[next] ? next : "/";
  if (window.location.pathname !== normalized || window.location.hash) {
    window.history.pushState({}, "", normalized);
  }
  route.value = normalized;
}

function syncRoute() {
  const next = readRoute();
  route.value = next;
}

function toggleTheme() {
  theme.value = theme.value === "night" ? "day" : "night";
  try {
    localStorage.setItem("weiguang-theme", theme.value);
  } catch {}
}

watch(theme, (value) => {
  document.body.dataset.theme = value;
});

onMounted(() => {
  window.addEventListener("popstate", syncRoute);
  document.body.dataset.theme = theme.value;
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", syncRoute);
});
</script>

<template>
  <div class="app-shell">
    <SiteHeader
      v-if="!isLockedAdmin"
      :active-route="route"
      :is-night="theme === 'night'"
      :is-admin="isAdminRoute"
      @navigate="navigate"
      @toggle-theme="toggleTheme"
    />
    <div class="screen-shell">
      <div v-if="!isLockedAdmin" class="screen-topline">
        <span>{{ currentRouteMeta.index }} / LF-26</span>
        <span class="screen-topline-center"
          >MICRO LIGHT ANIME COMMUNITY // {{ currentRouteMeta.title }}</span
        >
        <span class="screen-topline-status"
          ><i></i>{{ currentRouteMeta.code }} / ONLINE</span
        >
      </div>
      <Transition name="page" mode="out-in">
        <component :is="currentView" :key="route" @navigate="navigate" />
      </Transition>
    </div>
    <SiteFooter v-if="!isLockedAdmin" />
  </div>
</template>

<style>
.app-shell {
  min-height: 100vh;
  background: var(--paper);
}

.screen-shell {
  min-height: 100vh;
  padding-top: var(--header-height);
  position: relative;
  overflow: hidden;
}

.screen-shell::before,
.screen-shell::after {
  content: "";
  position: fixed;
  z-index: 2;
  pointer-events: none;
}

.screen-shell::before {
  width: 22px;
  height: 22px;
  top: calc(var(--header-height) + 18px);
  right: 26px;
  border-top: 1px solid var(--coral);
  border-right: 1px solid var(--coral);
}

.screen-shell::after {
  width: 32px;
  height: 1px;
  right: 26px;
  bottom: 26px;
  background: var(--cyan);
  box-shadow:
    -9px 0 0 rgba(112, 214, 208, 0.35),
    -18px 0 0 rgba(112, 214, 208, 0.15);
}

.screen-topline {
  height: 38px;
  padding: 0 clamp(22px, 4vw, 70px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
  font: 9px var(--mono);
  letter-spacing: 0.12em;
}

.screen-topline::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 18%;
  height: 2px;
  background: var(--coral);
  animation: signal-pulse 2.8s ease-in-out infinite;
}

.screen-topline::after {
  content: "";
  width: 56px;
  height: 5px;
  margin-left: 14px;
  border-top: 1px solid var(--coral);
  border-bottom: 1px solid var(--coral);
  opacity: 0.7;
}

.screen-topline-center {
  color: var(--coral-dark);
}

.screen-topline-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.screen-topline-status i {
  width: 5px;
  height: 5px;
  display: inline-block;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 0 3px rgba(112, 214, 208, 0.14);
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}

@keyframes signal-pulse {
  0%,
  100% {
    transform: scaleX(0.55);
    transform-origin: left;
    opacity: 0.45;
  }
  50% {
    transform: scaleX(1);
    opacity: 1;
  }
}

@media (max-width: 880px) {
  :root {
    --header-height: 116px;
  }
  .screen-shell {
    padding-top: 0;
  }
  .screen-shell::before {
    top: 52px;
  }
  .screen-topline {
    padding: 0 22px;
  }
  .screen-topline-center,
  .screen-topline::before,
  .screen-topline::after {
    display: none;
  }
}

@media (max-width: 620px) {
  :root {
    --header-height: 112px;
  }
  .screen-topline {
    height: 32px;
    padding: 0 18px;
    font-size: 8px;
  }
  .screen-topline-status {
    font-size: 8px;
  }
}
</style>
