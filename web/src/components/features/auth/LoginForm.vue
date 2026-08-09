<template>
  <div class="w-full max-w-sm mx-auto space-y-6">
    <!-- Header -->
    <div
      class="text-center"
      data-premium-reveal
    >
      <h1 class="premium-heading text-3xl font-bold">
        {{ headerTitle }}
      </h1>
      <p class="premium-subtle mt-2 text-sm leading-relaxed">
        {{ headerSubtitle }}
      </p>
    </div>

    <!-- Forgot Password View -->
    <template v-if="currentView === 'forgot'">
      <ForgotPassword
        @back="currentView = 'password'"
        @success="currentView = 'password'"
      />
    </template>

    <!-- Registration View -->
    <template v-else-if="currentView === 'register'">
      <RegistrationForm
        @back="currentView = 'password'"
        @success="onRegistrationSuccess"
      />
    </template>

    <!-- Login Views -->
    <template v-else-if="isLoadingOptions">
      <div class="flex justify-center py-10">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-6 animate-spin text-muted"
        />
      </div>
    </template>

    <template v-else>
      <DemoLoginPanel
        v-if="demoConfig && currentView === 'password'"
        :login="demoConfig.login"
        :password="demoConfig.password"
        :loading="isDemoSigningIn"
        @sign-in="signInWithDemo"
      />

      <div
        v-if="demoConfig && currentView === 'password'"
        class="relative"
        data-premium-reveal
      >
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-default" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-default px-2 text-muted">{{ t('auth.orSignInManually') }}</span>
        </div>
      </div>

      <div data-premium-reveal>
        <SocialButtons
          v-if="loginOptions.socialProviders.length > 0"
          :providers="loginOptions.socialProviders"
        />
      </div>

      <!-- Divider -->
      <div
        v-if="loginOptions.socialProviders.length > 0 && tabs.length > 0"
        class="relative"
        data-premium-reveal
      >
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-default" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-default px-2 text-muted">{{ t('auth.orContinueWith') }}</span>
        </div>
      </div>

      <!-- Single method — no tabs needed -->
      <template v-if="tabs.length === 1">
        <div data-premium-reveal>
          <LoginByCode
            v-if="tabs[0].value === 'code'"
            @success="handleSuccess"
          />
          <LoginByPassword
            v-else-if="tabs[0].value === 'password'"
            ref="passwordLoginRef"
            @success="handleSuccess"
            @forgot-password="currentView = 'forgot'"
          />
          <LoginBySso v-else-if="tabs[0].value === 'sso'" />
        </div>
      </template>

      <!-- Tabs -->
      <UTabs
        v-else-if="tabs.length > 1"
        v-model="currentView"
        :items="tabs"
        class="w-full"
        data-premium-reveal
        :ui="{ list: 'bg-[color:var(--tv-premium-border)]/40 p-1 rounded-2xl', trigger: 'rounded-xl data-[state=active]:bg-default data-[state=active]:shadow-sm' }"
        @update:model-value="onTabChange"
      >
        <template #code>
          <div class="pt-4">
            <LoginByCode @success="handleSuccess" />
          </div>
        </template>

        <template #password>
          <div class="pt-4">
            <LoginByPassword
              ref="passwordLoginRef"
              @success="handleSuccess"
              @forgot-password="currentView = 'forgot'"
            />
          </div>
        </template>

        <template #sso>
          <div class="pt-4">
            <LoginBySso />
          </div>
        </template>
      </UTabs>

      <p
        v-if="showRegisterLink"
        class="text-center text-sm premium-subtle"
        data-premium-reveal
      >
        {{ t('auth.noAccount') }}
        <UButton
          :label="t('auth.createAccount')"
          variant="link"
          color="primary"
          size="sm"
          class="px-1"
          data-testid="create-account-link"
          @click="currentView = 'register'"
        />
      </p>
    </template>
    
    <!-- Server Selector (hidden when the API URL is pinned at deploy time) -->
    <UCollapsible
      v-if="!isServerLocked"
      class="flex flex-col gap-2"
      data-premium-reveal
    >
      <UButton
        class="group"
        :label="t('server.selectServer')"
        color="neutral"
        variant="ghost"
        icon="i-lucide-server"
        trailing-icon="i-lucide-chevron-down"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
        }"
        block
      />

      <template #content>
        <ServerSelector class="p-2 border border-default rounded-lg" />
      </template>
    </UCollapsible>

    <!-- Footer -->
    <p
      class="text-center text-[11px] premium-subtle leading-relaxed"
      data-premium-reveal
    >
      {{ t('auth.termsText') }}
      <a
        href="#"
        class="underline hover:text-foreground"
      >{{ t('auth.termsOfService') }}</a>
      {{ t('auth.and') }}
      <a
        href="#"
        class="underline hover:text-foreground"
      >{{ t('auth.privacyPolicy') }}</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import $api from '@/helpers/axios'
import { logError } from '@/helpers/Helper'
import { getConfiguredApiUrl, getDemoConfig } from '@/helpers/serverConfig'
import DemoLoginPanel from './DemoLoginPanel.vue'
import LoginByCode from './LoginByCode.vue'
import LoginByPassword from './LoginByPassword.vue'
import LoginBySso from './LoginBySso.vue'
import ForgotPassword from './ForgotPassword.vue'
import RegistrationForm from './RegistrationForm.vue'
import SocialButtons from './SocialButtons.vue'
import ServerSelector from './ServerSelector.vue'

const { t } = useI18n()

const emit = defineEmits<{
  success: [token: string]
}>()

type View = 'code' | 'password' | 'sso' | 'forgot' | 'register'

type LoginOptions = {
  magicLink: boolean
  password: boolean
  sso: boolean
  socialProviders: string[]
  publicRegistration: boolean
}

const currentView = ref<View>('password')
const passwordLoginRef = ref<InstanceType<typeof LoginByPassword> | null>(null)

const isLoadingOptions = ref(true)
const isServerLocked = getConfiguredApiUrl() !== null
const demoConfig = getDemoConfig()
const isDemoSigningIn = ref(false)

const loginOptions = reactive<LoginOptions>({
  magicLink: false,
  password: true,
  sso: false,
  socialProviders: [],
  publicRegistration: true,
})

onMounted(async () => {
  try {
    const result = await $api.get<LoginOptions>('/module/auth/login-options').catch(logError)
    if (result) Object.assign(loginOptions, result.data)
  } finally {
    isLoadingOptions.value = false
  }
})

const tabs = computed(() => {
  const items = []
  if (loginOptions.magicLink) items.push({ value: 'code', label: t('auth.magicLink'), slot: 'code' as const })
  if (loginOptions.password) items.push({ value: 'password', label: t('auth.password'), slot: 'password' as const })
  if (loginOptions.sso) items.push({ value: 'sso', label: 'SSO', slot: 'sso' as const })
  return items
})

const showRegisterLink = computed(
  () =>
    loginOptions.publicRegistration
    && loginOptions.password
    && !(demoConfig?.hideRegistration ?? false),
)

const headerTitle = computed(() => {
  if (currentView.value === 'register') return t('auth.createAccountTitle')
  if (currentView.value === 'forgot') return t('auth.forgotPasswordTitle')
  return t('auth.welcome')
})

const headerSubtitle = computed(() => {
  if (currentView.value === 'register') return t('auth.createAccountSubtitle')
  if (currentView.value === 'forgot') return t('auth.forgotPasswordDescription')
  return t('auth.signInToAccount')
})

watch(tabs, (items) => {
  if (currentView.value === 'forgot' || currentView.value === 'register') return
  if (!items.some((item) => item.value === currentView.value)) {
    currentView.value = (items[0]?.value ?? 'password') as View
  }
})

function onTabChange(value: string | number) {
  currentView.value = value as View
}

function onRegistrationSuccess() {
  // Keep success screen in RegistrationForm; user returns via Back to login
}

function handleSuccess(token: string) {
  emit('success', token)
}

async function signInWithDemo() {
  if (!demoConfig) return

  isDemoSigningIn.value = true
  try {
    await passwordLoginRef.value?.submitCredentials(demoConfig.login, demoConfig.password)
  } finally {
    isDemoSigningIn.value = false
  }
}

</script>
