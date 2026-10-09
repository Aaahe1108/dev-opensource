<template>
  <section class="ldecor" aria-label="开源精神装饰">
    <div class="ldecor__inner">
      <img src="/tux.svg" alt="Tux · Linux 企鹅" class="ldecor__tux" />
      <div class="ldecor__text">
        <p class="ldecor__motto">
          <span class="ldecor__prompt">guest@opensource:~$</span>
          echo "In penguins we trust."
        </p>
        <p class="ldecor__sub"># 每一个文件，都是一段开源故事</p>
      </div>
      <img src="/tux.svg" alt="" class="ldecor__tux ldecor__tux--mirror" aria-hidden="true" />
    </div>
    <div class="ldecor__divider" aria-hidden="true">
      <span></span><i>🐧</i><span></span>
    </div>
  </section>
</template>

<style scoped>
.ldecor {
  text-align: center;
  margin: 0.5rem auto 1.8rem;
  max-width: 760px;
}
.ldecor__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.4rem;
}
.ldecor__tux {
  width: 88px;
  height: auto;
  flex: none;
  filter: drop-shadow(0 8px 18px rgba(63, 185, 80, 0.28));
  animation: ldecor-bob 4s ease-in-out infinite;
}
.ldecor__tux--mirror {
  transform: scaleX(-1);
  animation-delay: -2s;
}
@keyframes ldecor-bob {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -8px; }
}
.ldecor__text {
  text-align: left;
  font-family: var(--font-mono);
}
.ldecor__motto {
  font-size: 15px;
  color: var(--vp-c-text-1);
  margin: 0;
}
.ldecor__prompt {
  color: var(--vp-c-brand);
  font-weight: 600;
}
.ldecor__sub {
  color: var(--vp-c-text-2);
  font-size: 12.5px;
  margin: 0.35rem 0 0;
}
.ldecor__divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 1.5rem;
  color: var(--vp-c-brand);
}
.ldecor__divider span {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--vp-c-divider), transparent);
}
.ldecor__divider i {
  font-style: normal;
  font-size: 15px;
}
@media (max-width: 720px) {
  .ldecor__tux { width: 64px; }
  .ldecor__motto { font-size: 13px; }
}
</style>
