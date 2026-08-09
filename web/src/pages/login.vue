<template>
  <div class="relative min-h-screen flex items-center justify-center p-4 sm:p-8 premium-shell-bg overflow-hidden">
    <PremiumBackground />

    <div class="relative z-10 w-full max-w-[440px]">
      <div
        ref="brandRef"
        class="mb-8 text-center"
      >
        <div class="inline-flex items-center gap-3 mb-4">
          <div class="size-11 rounded-2xl premium-glass-panel flex items-center justify-center shadow-[var(--tv-premium-shadow-lg)]">
            <AppBrandLogo image-class="size-7" />
          </div>
          <span class="font-display text-2xl font-bold tracking-tight text-[color:var(--tv-premium-ink)]">{{ brand.name }}</span>
        </div>
        <p class="text-sm premium-subtle max-w-xs mx-auto leading-relaxed">
          {{ t('brand.tagline') }}
        </p>
      </div>

      <PremiumGlassCard class="p-1 sm:p-2">
        <div
          ref="formRef"
          class="p-6 sm:p-8"
        >
          <LoginForm @success="handleSuccess" />
        </div>
      </PremiumGlassCard>

      <p class="mt-6 text-center text-[11px] premium-subtle tracking-wide uppercase">
        Trusted by product teams worldwide
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import $api from '@/helpers/axios'
import { $ls } from '@/plugins/axios'
import { redirectToUser } from '@/components/features/auth/auth.helper'
import LoginForm from '@/components/features/auth/LoginForm.vue'
import AppBrandLogo from '@/components/brand/AppBrandLogo.vue'
import PremiumBackground from '@/components/premium/PremiumBackground.vue'
import PremiumGlassCard from '@/components/premium/PremiumGlassCard.vue'
import { useBrand } from '@/composables/useBrand'
import { usePremiumMotion } from '@/composables/usePremiumMotion'

type LoginTokens = {
  code: string
  email: string
}

type LoginResponse = {
  access: string
  refresh: string
}

const { t } = useI18n()
const brand = useBrand()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const brandRef = ref<HTMLElement | null>(null)
const formRef = ref<HTMLElement | null>(null)
const { fadeInUp, staggerChildren } = usePremiumMotion()
fadeInUp(brandRef, { delay: 0.05, y: 16 })
staggerChildren(formRef, '[data-premium-reveal]')

async function loginByCode(code: string, email: string) {
  const result = await $api.post<LoginResponse>('/module/auth/login-by-code', { code, email })
  if (result?.data.access) {
    $ls.setToken(result.data.access)
    $ls.setRefreshToken(result.data.refresh)
    await $ls.updateUserStoreByToken()
    await redirectToUser(router)
  }
}

onMounted(async () => {
  if (route.query.resetCode) {
    await router.replace({ path: '/reset-password', query: route.query })
    return
  }

  const existingToken = await $ls.getToken()
  if (existingToken) {
    await $ls.updateUserStoreByToken()
    await redirectToUser(router)
    return
  }

  if (route.query.sso_error) {
    toast.add({
      title: t('auth.error'),
      description: route.query.sso_error === 'registration-disabled'
        ? t('auth.registrationDisabled')
        : t('auth.ssoError'),
      color: 'error',
    })
  }

  try {
    const tokens = route.query.tokens as string
    if (!tokens) return

    const result = JSON.parse(decodeURIComponent(tokens)) as LoginTokens
    await loginByCode(result.code, result.email)
  } catch (error) {
    console.error('Failed to process tokens from URL:', error)
    toast.add({
      title: t('auth.error'),
      description: t('auth.loginFailed'),
      color: 'error',
    })
  }
})

App.addListener('appUrlOpen', async ({ url }) => {
  if (!url) return

  if (url.startsWith('taskview://login?tokens')) {
    const parsed = new URL(url)
    const tokens = parsed.searchParams.get('tokens')

    if (!tokens) return

    try {
      const result = JSON.parse(decodeURIComponent(tokens)) as LoginTokens
      await loginByCode(result.code, result.email)
    } catch (error) {
      console.error('Failed to process deep link tokens:', error)
      toast.add({
        title: t('auth.error'),
        description: t('auth.loginFailed'),
        color: 'error',
      })
    }
  }

  await Browser.close()
})

async function handleSuccess() {
  console.log('Login successful')
}
</script>
