<template>
  <div
    class="rounded-2xl border border-[color:var(--tv-premium-primary)]/25 bg-[color:var(--tv-premium-primary)]/[0.06] p-4 space-y-3"
    data-premium-reveal
    data-testid="demo-login-panel"
  >
    <div class="flex items-start gap-3">
      <div class="size-9 shrink-0 rounded-xl bg-[color:var(--tv-premium-primary)]/15 flex items-center justify-center">
        <UIcon
          name="i-lucide-sparkles"
          class="size-4 text-[color:var(--tv-premium-primary)]"
        />
      </div>
      <div class="min-w-0 space-y-1">
        <p class="text-sm font-semibold text-[color:var(--tv-premium-ink)]">
          {{ t('auth.demoTitle') }}
        </p>
        <p class="text-xs premium-subtle leading-relaxed">
          {{ t('auth.demoDescription') }}
        </p>
      </div>
    </div>

    <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs rounded-xl bg-default/60 px-3 py-2.5 border border-default/60">
      <dt class="premium-subtle">
        {{ t('auth.login') }}
      </dt>
      <dd class="font-mono font-medium text-[color:var(--tv-premium-ink)] truncate">
        {{ login }}
      </dd>
      <dt class="premium-subtle">
        {{ t('auth.passwordLabel') }}
      </dt>
      <dd class="font-mono font-medium text-[color:var(--tv-premium-ink)] truncate">
        {{ password }}
      </dd>
    </dl>

    <UButton
      :label="t('auth.demoSignIn')"
      color="primary"
      block
      icon="i-lucide-log-in"
      :loading="loading"
      data-testid="demo-sign-in-button"
      @click="emit('signIn')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  login: string
  password: string
  loading?: boolean
}>()

const emit = defineEmits<{
  signIn: []
}>()

const { t } = useI18n()
</script>
