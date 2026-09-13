<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  season: { type: String, required: true },
});

const canvas = ref(null);
let context;
let animationFrame;
let particles = [];
let resizeObserver;

const palettes = {
  spring: ["196,82,78", "239,140,128"],
  summer: ["112,214,208", "244,238,229"],
  autumn: ["196,82,78", "229,221,210"],
  winter: ["112,214,208", "255,255,255"],
};

function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1.5 + Math.random() * 3.5,
    speedX: (Math.random() - 0.5) * (props.season === "autumn" ? 0.8 : 0.35),
    speedY: 0.15 + Math.random() * (props.season === "autumn" ? 0.75 : 0.4),
    alpha: 0.18 + Math.random() * 0.38,
    rotation: Math.random() * Math.PI,
    color: palettes[props.season][Math.random() > 0.5 ? 0 : 1],
  };
}

function resize() {
  if (!canvas.value) return;
  const bounds = canvas.value.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.value.width = Math.round(bounds.width * ratio);
  canvas.value.height = Math.round(bounds.height * ratio);
  context = canvas.value.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: bounds.width < 700 ? 18 : 32 }, () =>
    createParticle(bounds.width, bounds.height),
  );
}

function drawParticle(particle, time) {
  const bounds = canvas.value.getBoundingClientRect();
  particle.x += particle.speedX;
  particle.y += particle.speedY;
  particle.rotation += 0.008;
  if (particle.y > bounds.height + 10) particle.y = -10;
  if (particle.x < -10) particle.x = bounds.width + 10;
  if (particle.x > bounds.width + 10) particle.x = -10;

  context.save();
  context.translate(particle.x, particle.y);
  context.rotate(particle.rotation);
  context.fillStyle = `rgba(${particle.color},${particle.alpha})`;

  if (props.season === "summer") {
    const pulse = 0.55 + Math.sin(time * 0.002 + particle.x) * 0.35;
    context.globalAlpha = pulse;
    context.beginPath();
    context.arc(0, 0, particle.size * 0.65, 0, Math.PI * 2);
    context.fill();
  } else if (props.season === "winter") {
    context.beginPath();
    context.arc(0, 0, particle.size * 0.55, 0, Math.PI * 2);
    context.fill();
  } else {
    context.beginPath();
    context.ellipse(
      0,
      0,
      particle.size,
      particle.size * 0.42,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  context.restore();
}

function animate(time) {
  if (!context || !canvas.value) return;
  const bounds = canvas.value.getBoundingClientRect();
  context.clearRect(0, 0, bounds.width, bounds.height);
  particles.forEach((particle) => drawParticle(particle, time));
  animationFrame = requestAnimationFrame(animate);
}

watch(() => props.season, resize);

onMounted(() => {
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.value);
  resize();
  animationFrame = requestAnimationFrame(animate);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  cancelAnimationFrame(animationFrame);
});
</script>

<template>
  <canvas ref="canvas" class="season-particles" aria-hidden="true"></canvas>
</template>

<style scoped>
.season-particles {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
