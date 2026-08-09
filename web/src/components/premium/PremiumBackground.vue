<template>
  <div
    ref="rootRef"
    class="premium-bg pointer-events-none absolute inset-0 overflow-hidden"
    aria-hidden="true"
  >
    <div class="premium-bg__mesh" />
    <div class="premium-bg__noise" />

    <div class="premium-orb premium-orb--1" />
    <div class="premium-orb premium-orb--2" />
    <div class="premium-orb premium-orb--3" />

    <div class="premium-grid-line absolute inset-0 opacity-[0.04]" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePremiumAnime } from '@/composables/usePremiumAnime'

const rootRef = ref<HTMLElement | null>(null)
usePremiumAnime(rootRef)
</script>

<style scoped>
.premium-bg__mesh {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(ellipse 80% 60% at 15% 10%, color-mix(in oklab, var(--color-primary-400) 18%, transparent), transparent 55%),
    radial-gradient(ellipse 70% 50% at 85% 20%, color-mix(in oklab, var(--color-amber-300) 14%, transparent), transparent 50%),
    radial-gradient(ellipse 60% 45% at 50% 100%, color-mix(in oklab, var(--color-stone-400) 12%, transparent), transparent 55%),
    linear-gradient(180deg, var(--tv-premium-bg-top) 0%, var(--tv-premium-bg-bottom) 100%);
}

.premium-bg__noise {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}

.premium-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  will-change: transform;
}

.premium-orb--1 {
  width: 28rem;
  height: 28rem;
  top: -6rem;
  left: -4rem;
  background: color-mix(in oklab, var(--color-primary-300) 35%, transparent);
}

.premium-orb--2 {
  width: 22rem;
  height: 22rem;
  top: 20%;
  right: -5rem;
  background: color-mix(in oklab, var(--color-amber-200) 40%, transparent);
}

.premium-orb--3 {
  width: 18rem;
  height: 18rem;
  bottom: -4rem;
  left: 35%;
  background: color-mix(in oklab, var(--color-stone-300) 30%, transparent);
}

.premium-grid-line {
  background-image:
    linear-gradient(to right, color-mix(in oklab, var(--tv-premium-ink) 8%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, var(--tv-premium-ink) 8%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent);
}

.dark .premium-bg__mesh {
  background:
    radial-gradient(ellipse 80% 60% at 15% 10%, color-mix(in oklab, var(--color-primary-500) 12%, transparent), transparent 55%),
    radial-gradient(ellipse 70% 50% at 85% 20%, color-mix(in oklab, var(--color-amber-600) 8%, transparent), transparent 50%),
    radial-gradient(ellipse 60% 45% at 50% 100%, color-mix(in oklab, var(--color-stone-600) 10%, transparent), transparent 55%),
    linear-gradient(180deg, var(--tv-premium-bg-top) 0%, var(--tv-premium-bg-bottom) 100%);
}
</style>
