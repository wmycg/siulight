<script setup>
defineProps({
  event: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <article class="event-card">
    <div class="event-date" aria-label="活动日期">
      <span class="event-date-label">DATE</span>
      <strong>{{ event.date }}</strong>
    </div>

    <div class="event-info">
      <p class="event-code">
        EVENT LOG / {{ String(index + 1).padStart(2, "0") }}
      </p>
      <h3>{{ event.title }}</h3>
      <p class="event-brief">{{ event.brief }}</p>
      <p class="event-place"><span>PLACE</span>{{ event.place }}</p>
    </div>

    <span class="event-arrow" aria-hidden="true">↗</span>
  </article>
</template>

<style scoped>
.event-card {
  min-height: 168px;
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr) auto;
  gap: 26px;
  align-items: center;
  padding: 25px 8px 25px 0;
  position: relative;
  border-bottom: 1px solid var(--line);
  transition:
    background-color 0.28s ease,
    padding 0.28s ease,
    border-color 0.28s ease;
}
.event-card::before {
  content: "";
  width: 3px;
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--coral);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.28s ease;
}
.event-card:hover {
  padding-left: 14px;
  background: color-mix(in srgb, var(--paper) 90%, var(--coral) 10%);
  border-bottom-color: var(--coral);
}
.event-card:hover::before {
  transform: scaleY(1);
}
.event-date {
  min-height: 94px;
  padding: 11px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  background: var(--ink);
  color: var(--paper);
  clip-path: polygon(0 0, 91% 0, 100% 18%, 100% 100%, 9% 100%, 0 82%);
}
.event-date::after {
  content: "";
  width: 24px;
  height: 1px;
  position: absolute;
  right: 13px;
  bottom: 12px;
  background: var(--cyan);
  box-shadow:
    -6px 0 0 rgba(112, 214, 208, 0.55),
    -12px 0 0 rgba(112, 214, 208, 0.25);
}
.event-date-label,
.event-code,
.event-place span {
  color: var(--coral-dark);
  font: 9px var(--mono);
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.event-date-label {
  color: var(--cyan);
}
.event-date strong {
  max-width: 100%;
  overflow-wrap: anywhere;
  font: 500 25px/1.1 var(--serif);
}
.event-info {
  min-width: 0;
}
.event-code {
  margin: 0 0 9px;
}
.event-info h3 {
  margin: 0;
  color: var(--ink);
  font: 600 clamp(20px, 2.4vw, 30px)/1.2 var(--serif);
  text-wrap: balance;
}
.event-brief {
  max-width: 52em;
  margin: 10px 0 14px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.75;
}
.event-place {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 9px;
  color: var(--ink);
  font-size: 11px;
}
.event-place span {
  color: var(--muted);
  font-size: 8px;
}
.event-arrow {
  align-self: start;
  padding-top: 5px;
  color: var(--coral-dark);
  font: 20px/1 var(--mono);
  transition: transform 0.28s ease;
}
.event-card:hover .event-arrow {
  transform: translate(3px, -3px);
}

:global(.event-preview) .event-card {
  min-height: 226px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 19px;
  padding: 20px 24px 23px 0;
  border-right: 1px solid var(--line);
  border-bottom: 0;
}
:global(.event-preview) .event-card + .event-card {
  padding-left: 24px;
}
:global(.event-preview) .event-card:last-child {
  border-right: 0;
}
:global(.event-preview) .event-date {
  min-height: 72px;
  flex-direction: row;
  align-items: end;
  gap: 13px;
}
:global(.event-preview) .event-date-label {
  align-self: start;
  margin-top: 2px;
}
:global(.event-preview) .event-date strong {
  font-size: 23px;
}
:global(.event-preview) .event-info h3 {
  font-size: 20px;
}
:global(.event-preview) .event-brief {
  margin-top: 8px;
}
:global(.event-preview) .event-arrow {
  display: none;
}

@media (max-width: 880px) {
  :global(.event-preview) .event-card,
  :global(.event-preview) .event-card + .event-card {
    min-height: 168px;
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr) auto;
    gap: 18px;
    padding: 22px 0;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  :global(.event-preview) .event-date {
    min-height: 82px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }
  :global(.event-preview) .event-date strong {
    font-size: 20px;
  }
  :global(.event-preview) .event-arrow {
    display: block;
  }
}

@media (max-width: 620px) {
  .event-card,
  :global(.event-preview) .event-card,
  :global(.event-preview) .event-card + .event-card {
    grid-template-columns: 78px minmax(0, 1fr) auto;
    gap: 13px;
    padding: 18px 0;
  }
  .event-date,
  :global(.event-preview) .event-date {
    min-height: 79px;
    padding: 10px 11px;
  }
  .event-date strong,
  :global(.event-preview) .event-date strong {
    font-size: 17px;
  }
  .event-info h3,
  :global(.event-preview) .event-info h3 {
    font-size: 19px;
  }
  .event-brief {
    margin: 8px 0 11px;
    font-size: 11px;
  }
  .event-arrow,
  :global(.event-preview) .event-arrow {
    padding-top: 3px;
    font-size: 16px;
  }
}
</style>
