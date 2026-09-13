<script setup>
import { computed } from "vue";
import { departments } from "../departments.js";
import DepartmentCard from "../components/DepartmentCard.vue";
import Eyebrow from "../../../shared/components/Eyebrow.vue";

const visibleDepartments = computed(() =>
  departments.filter((department) => department?.name && department?.intro),
);
const departmentCount = computed(() =>
  String(visibleDepartments.value.length).padStart(2, "0"),
);
</script>

<template>
  <main class="view view-inner">
    <section class="inner-hero departments-hero">
      <div class="inner-hero-copy">
        <Eyebrow label="CREATIVE UNITS / REORGANIZED" />
        <h1>
          创作<br />
          部门
        </h1>
        <p>从共同兴趣出发，在不同方向里创作，再把彼此的成果汇成一束微光。</p>
      </div>
      <div class="unit-map" aria-label="当前部门索引">
        <header>
          <span>CURRENT STRUCTURE</span>
          <strong> 03 </strong>
        </header>
        <ol>
          <li
            v-for="(department, index) in visibleDepartments"
            :key="department.id"
          >
            <span>{{ String(index + 1).padStart(2, "0") }}</span>
            <strong>{{ department.name }}</strong>
            <small>{{ department.code }}</small>
          </li>
        </ol>
      </div>
    </section>

    <section class="department-directory page-section">
      <div class="list-heading">
        <div>
          <span class="list-kicker">UNIT DIRECTORY / 2026</span>
          <h2>{{ visibleDepartments.length }} 个部门，一起创作。</h2>
        </div>
        <p>找到你感兴趣的方向，也可以跨部门参与同一件作品。</p>
      </div>

      <TransitionGroup name="department-list" tag="div" class="department-grid">
        <DepartmentCard
          v-for="(department, index) in visibleDepartments"
          :key="department.id"
          :department="department"
          :index="index"
          :total="visibleDepartments.length"
        />
      </TransitionGroup>
      <div v-if="!visibleDepartments.length" class="department-empty">
        <span>NO UNIT DATA</span>
        <p>部门资料正在整理中。</p>
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
  min-height: 390px;
  padding: 72px clamp(24px, 9vw, 150px);
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
.unit-map {
  position: relative;
  z-index: 1;
}
.inner-hero-copy {
  max-width: 620px;
}
.inner-hero h1 {
  margin: 0;
  white-space: pre-line;
  font: 600 clamp(52px, 7vw, 92px)/0.98 var(--serif);
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
.unit-map {
  width: min(390px, 34vw);
  align-self: stretch;
  padding: 2px 0 0 26px;
  position: relative;
  z-index: 1;
  border-left: 1px solid rgba(112, 214, 208, 0.52);
}
.unit-map::before {
  content: "";
  height: 1px;
  position: absolute;
  top: 5px;
  right: 0;
  left: 26px;
  background: var(--cyan);
  box-shadow:
    0 9px 0 rgba(112, 214, 208, 0.35),
    0 18px 0 rgba(112, 214, 208, 0.15);
}
.unit-map header {
  padding-top: 30px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  color: #a5958b;
  font: 10px var(--mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.unit-map header strong {
  color: var(--coral);
  font: 34px var(--serif);
}
.unit-map ol {
  margin: 42px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px 18px;
  list-style: none;
}
.unit-map li {
  min-width: 0;
  padding-top: 10px;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: 9px;
  border-top: 1px solid rgba(244, 238, 229, 0.2);
}
.unit-map li > span {
  grid-row: 1 / span 2;
  color: var(--cyan);
  font: 9px var(--mono);
}
.unit-map li strong {
  min-width: 0;
  overflow: hidden;
  color: #f4eee5;
  font: 500 18px/1.3 var(--serif);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.unit-map li small {
  margin-top: 4px;
  color: #a5958b;
  font: 8px var(--mono);
  letter-spacing: 0.1em;
}
.department-directory {
  padding-top: 72px;
  position: relative;
}
.department-directory::before {
  content: "DATA // INTERNAL ARCHIVE";
  position: absolute;
  top: 30px;
  right: clamp(24px, 9vw, 150px);
  color: var(--muted);
  font: 8px var(--mono);
  letter-spacing: 0.1em;
}
.list-heading {
  margin-bottom: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  border-left: 3px solid var(--coral);
  padding-left: 17px;
}
.list-kicker {
  color: var(--muted);
  font: 9px var(--mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.list-heading h2 {
  margin: 10px 0 0;
  color: var(--ink);
  font: 500 clamp(28px, 4vw, 46px)/1.2 var(--serif);
  text-wrap: balance;
}
.list-heading > p {
  max-width: 260px;
  margin: 0 0 2px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.75;
}
.department-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  background: var(--line-strong);
}
.department-list-enter-active,
.department-list-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.department-list-enter-from,
.department-list-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.department-empty {
  padding: 52px 20px;
  border: 1px dashed var(--line-strong);
  color: var(--muted);
  text-align: center;
}
.department-empty span {
  color: var(--coral-dark);
  font: 10px var(--mono);
  letter-spacing: 0.14em;
}
.department-empty p {
  margin: 12px 0 0;
  font-size: 13px;
}
@media (max-width: 880px) {
  .inner-hero {
    clip-path: polygon(0 0, 96% 0, 100% 5%, 100% 100%, 4% 100%, 0 95%);
  }
  .unit-map {
    width: min(300px, 38vw);
    padding-left: 18px;
  }
  .unit-map::before {
    left: 18px;
  }
  .unit-map ol {
    margin-top: 34px;
    gap: 12px;
  }
  .unit-map li strong {
    font-size: 16px;
  }
  .department-grid {
    gap: 1px;
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
    display: block;
  }
  .inner-hero h1 {
    font-size: clamp(49px, 15vw, 76px);
  }
  .unit-map {
    display: none;
  }
  .list-heading {
    align-items: start;
    flex-direction: column;
    gap: 16px;
  }
  .list-heading > p {
    max-width: 30em;
  }
  .department-grid {
    grid-template-columns: 1fr;
    gap: 1px;
  }
}
</style>
