<template>
  <div class="space-y-4">
    <template v-if="isRegistered">
      <div class="text-center space-y-4">
        <div class="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
          <UIcon
            name="i-lucide-user-check"
            class="w-6 h-6 text-success"
          />
        </div>
        <div>
          <h3 class="font-medium">
            {{ t('auth.registrationSuccess') }}
          </h3>
          <p class="text-sm text-muted mt-1">
            {{ t('auth.registrationReady') }}
          </p>
        </div>
        <UButton
          :label="t('auth.backToLogin')"
          variant="outline"
          color="neutral"
          block
          @click="emit('back')"
        />
      </div>
    </template>

    <template v-else>
      <UForm
        :state="state"
        :schema="RegistrationSchema"
        :validate="validatePasswordsMatch"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('auth.email')"
          name="email"
        >
          <UInput
            v-model="state.email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            icon="i-lucide-mail"
            class="w-full"
            data-testid="register-email-input"
          />
        </UFormField>

        <UFormField
          :label="t('auth.login')"
          name="login"
        >
          <UInput
            v-model="state.login"
            :placeholder="t('auth.usernamePlaceholder')"
            icon="i-lucide-user"
            class="w-full"
            data-testid="register-login-input"
          />
        </UFormField>

        <UFormField
          :label="t('auth.passwordLabel')"
          name="password"
        >
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.passwordPlaceholder')"
            icon="i-lucide-lock"
            class="w-full"
            data-testid="register-password-input"
          >
            <template #trailing>
              <UButton
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                color="neutral"
                variant="link"
                size="sm"
                :padded="false"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          :label="t('auth.confirmPassword')"
          name="passwordRepeat"
        >
          <UInput
            v-model="state.passwordRepeat"
            :type="showPasswordRepeat ? 'text' : 'password'"
            :placeholder="t('auth.confirmPasswordPlaceholder')"
            icon="i-lucide-lock"
            class="w-full"
            data-testid="register-password-repeat-input"
          >
            <template #trailing>
              <UButton
                :icon="showPasswordRepeat ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                color="neutral"
                variant="link"
                size="sm"
                :padded="false"
                @click="showPasswordRepeat = !showPasswordRepeat"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton
          :label="t('auth.createAccount')"
          type="submit"
          color="primary"
          block
          :loading="isLoading"
          data-testid="register-submit-button"
        />

        <UButton
          :label="t('auth.backToLogin')"
          variant="link"
          color="neutral"
          block
          @click="emit('back')"
        />
      </UForm>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type } from 'arktype'
import qs from 'qs'
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import $api from '@/helpers/axios'

const { t } = useI18n()

const emit = defineEmits<{
  back: []
  success: []
}>()

const toast = useToast()
const isLoading = ref(false)
const isRegistered = ref(false)
const showPassword = ref(false)
const showPasswordRepeat = ref(false)

const RegistrationSchema = type({
  email: type('string.email').configure({ message: t('auth.invalidEmail') }),
  login: type('string >= 3').configure({ message: t('auth.usernameRequired') }),
  password: type('string >= 6').configure({ message: t('auth.passwordTooShort') }),
  passwordRepeat: type('string >= 6').configure({ message: t('auth.passwordTooShort') }),
})

type RegistrationState = typeof RegistrationSchema.infer

type RegistrationResponse = {
  registration: boolean
  confirmEmail: boolean
}

const state = reactive<RegistrationState>({
  email: '',
  login: '',
  password: '',
  passwordRepeat: '',
})

function validatePasswordsMatch(formState: Partial<RegistrationState>) {
  const errors = []
  if (formState.password && formState.passwordRepeat && formState.password !== formState.passwordRepeat) {
    errors.push({ name: 'passwordRepeat', message: t('auth.passwordsDoNotMatch') })
  }
  return errors
}

async function onSubmit() {
  if (state.password !== state.passwordRepeat) {
    toast.add({
      title: t('auth.error'),
      description: t('auth.passwordsDoNotMatch'),
      color: 'error',
    })
    return
  }

  isLoading.value = true

  try {
    const result = await $api.post<RegistrationResponse>(
      '/module/auth/registration',
      qs.stringify({
        email: state.email.toLowerCase(),
        login: state.login.trim().toLowerCase(),
        password: state.password,
        passwordRepeat: state.passwordRepeat,
      }),
    )

    if (result.data.registration) {
      isRegistered.value = true
      toast.add({
        title: t('auth.success'),
        description: t('auth.registrationReady'),
        color: 'success',
      })
      emit('success')
    }
  } catch (error: unknown) {
    const axiosError = error as {
      code?: string
      message?: string
      response?: { status?: number, data?: { registrationDisabled?: boolean } }
    }
    if (axiosError.response?.status === 403 || axiosError.response?.data?.registrationDisabled) {
      toast.add({
        title: t('auth.error'),
        description: t('auth.registrationDisabled'),
        color: 'error',
      })
    } else if (!axiosError.response || axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED') {
      toast.add({
        title: t('auth.error'),
        description: t('auth.apiUnreachable'),
        color: 'error',
      })
    } else {
      toast.add({
        title: t('auth.error'),
        description: t('auth.registrationFailed'),
        color: 'error',
      })
    }
  } finally {
    isLoading.value = false
  }
}
</script>
