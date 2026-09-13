<template>
  <footer class="site-footer">
    <div class="footer-brand">
      <strong>微光漫摄</strong><span>SUI LIGHT CLUB / 2026</span>
    </div>
    <p>在屏幕之外，和同频的人见面。</p>
    <div class="footer-links">
      <span>QQ群:1005621268</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 28px clamp(24px, 5vw, 76px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: relative;
  z-index: 3;
  background: var(--soft-band);
  color: var(--muted);
  border-top: 1px solid var(--line);
  font-size: 11px;
}
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.footer-brand strong {
  color: var(--ink);
  font: 600 15px var(--serif);
}
.footer-brand span,
.footer-links {
  font: 8px var(--mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.site-footer p {
  margin: 0;
}
@media (max-width: 620px) {
  .site-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
