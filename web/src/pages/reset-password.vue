<template>
  <div class="relative min-h-screen flex items-center justify-center p-4 sm:p-8 premium-shell-bg overflow-hidden">
    <PremiumBackground />
    <div class="relative z-10 w-full max-w-[440px]">
      <PremiumGlassCard class="p-6 sm:p-8">
        <ResetPassword />
      </PremiumGlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import ResetPassword from '@/components/features/auth/ResetPassword.vue'
import PremiumBackground from '@/components/premium/PremiumBackground.vue'
import PremiumGlassCard from '@/components/premium/PremiumGlassCard.vue'
</script>
