<script setup>
defineProps({
  kicker: { type: String, required: true },
  title: { type: String, required: true },
  copy: { type: String, default: "" },
});
</script>

<template>
  <div class="section-heading">
    <p class="eyebrow">
      <span>✦</span><span>{{ kicker }}</span>
    </p>
    <h2>{{ title }}</h2>
    <p v-if="copy">{{ copy }}</p>
  </div>
</template>

<style scoped>
.section-heading {
  display: flex;
  align-items: baseline;
  gap: 26px;
  margin-bottom: 42px;
  flex-wrap: wrap;
}
.eyebrow {
  flex-basis: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--coral-dark);
  font: 10px var(--mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.eyebrow span:first-child {
  font-size: 13px;
}
.section-heading h2 {
  margin: 0;
  font: 500 clamp(30px, 4vw, 52px) var(--serif);
  text-shadow: 3px 3px 0 rgba(196, 82, 78, 0.1);
}
.section-heading > p:last-child {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}
@media (max-width: 620px) {
  .section-heading {
    gap: 14px;
  }
  .section-heading h2 {
    width: 100%;
  }
}
</style>
