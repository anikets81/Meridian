<template>
  <UPageCard
    :to="props.to"
    class="rounded-2xl transition-[transform,box-shadow,border-color] duration-200 bg-[color:var(--tv-ui-bg-elevated)] backdrop-blur-md"
    :class="[
      active
        ? 'bg-primary/10 border border-primary/25 shadow-[var(--tv-premium-shadow-lg)] ring-1 ring-primary/10'
        : 'border border-[color:var(--tv-premium-border)] shadow-[var(--tv-premium-shadow)] hover:shadow-[var(--tv-premium-shadow-lg)] hover:-translate-y-px',
    ]"
  >
    <div class="flex items-center justify-between gap-2">
      <slot />
    </div>
  </UPageCard>
</template>
<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to?: RouteLocationRaw
  active?: boolean
  variant?: string
}>()
</script>
