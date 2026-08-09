type TaskViewDemoConfig = {
  login: string
  password: string
  hideRegistration?: boolean
}

type TaskViewRuntimeConfig = {
  apiUrl?: string
  demo?: TaskViewDemoConfig
}

declare global {
  interface Window {
    __TASKVIEW_CONFIG__?: TaskViewRuntimeConfig
  }
}

export const getConfiguredApiUrl = (): string | null => {
  const url = window.__TASKVIEW_CONFIG__?.apiUrl?.trim()
  return url ? url.replace(/\/+$/, '') : null
}

export const getDemoConfig = (): TaskViewDemoConfig | null => {
  const demo = window.__TASKVIEW_CONFIG__?.demo
  if (!demo?.login?.trim() || !demo?.password) return null
  return {
    login: demo.login.trim(),
    password: demo.password,
    hideRegistration: demo.hideRegistration ?? true,
  }
}

export const isDemoDeployment = (): boolean => getDemoConfig() !== null
