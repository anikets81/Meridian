<template>
  <div
    ref="cardRef"
    class="premium-glass relative overflow-hidden rounded-[1.75rem] border border-[color:var(--tv-premium-border)] bg-[color:var(--tv-premium-surface)] shadow-[var(--tv-premium-shadow-lg)] backdrop-blur-xl"
    :class="props.class"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePremiumMotion } from '@/composables/usePremiumMotion'

const props = defineProps<{ class?: string | string[] | Record<string, boolean> }>()
const cardRef = ref<HTMLElement | null>(null)
const { fadeInUp } = usePremiumMotion()
fadeInUp(cardRef, { duration: 0.65, y: 24 })
</script>
