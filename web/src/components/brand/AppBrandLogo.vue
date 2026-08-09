<template>
  <img
    :src="brand.logoSrc"
    :alt="brand.name"
    :class="imageClass"
  >
</template>

<script setup lang="ts">
import { useBrand } from '@/composables/useBrand'

defineProps<{
  imageClass?: string
}>()

const brand = useBrand()
</script>
