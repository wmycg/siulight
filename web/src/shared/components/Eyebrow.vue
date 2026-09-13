<script setup>
defineProps({ label: { type: String, required: true } });
</script>

<template>
  <p class="eyebrow">
    <span>✦</span><span>{{ label }}</span>
  </p>
</template>

<style scoped>
.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 22px;
  color: var(--coral-dark);
  font: 10px var(--mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.eyebrow span:first-child {
  font-size: 13px;
}
</style>
