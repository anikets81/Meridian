import { expect, type Page } from '@playwright/test'
import { TEST_USER } from './fixtures/auth'

export const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:1725'
export const WEB_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5174'

const createdProjectIds: number[] = []

export function trackProjectId(id: number | null) {
  if (id) createdProjectIds.push(id)
}

export async function cleanupProjects(page: Page) {
  if (createdProjectIds.length === 0) return

  const loginResponse = await page.request.post(`${API_URL}/module/auth/login`, {
    form: { login: TEST_USER.login, password: TEST_USER.password },
  })
  const loginData = await loginResponse.json()
  const token = loginData.access
  if (!token) {
    console.error('Cleanup: failed to get auth token, skipping project deletion')
    return
  }

  for (const id of createdProjectIds) {
    try {
      await page.request.delete(`${API_URL}/module/goals`, {
        data: { goalId: id },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      })
    } catch {
      console.error(`Failed to delete project ${id} via API`)
    }
  }
  createdProjectIds.length = 0
}

export async function prepareApp(page: Page) {
  await page.goto('/')
  await page.evaluate((apiUrl) => {
    localStorage.setItem('store_task_view.task_view.locale', 'en')
    localStorage.setItem('store_task_view.task_view.mainServer', apiUrl)
  }, API_URL)
  await page.reload()
}

export async function setEnglishLocale(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('store_task_view.task_view.locale', 'en')
  })
}

export async function login(page: Page, user = TEST_USER) {
  const passwordTab = page.getByRole('tab', { name: /password/i })
  if (await passwordTab.isVisible().catch(() => false)) {
    await passwordTab.click()
  }

  await page.getByTestId('login-input').fill(user.login)
  await page.getByTestId('password-input').fill(user.password)
  await page.getByTestId('sign-in-button').click()
  await expect(page).toHaveURL(/\/org-[a-z0-9]+/i, { timeout: 15000 })
}

export async function setupAndLogin(page: Page, user = TEST_USER) {
  await prepareApp(page)
  await login(page, user)
}

export async function registerUser(
  page: Page,
  user: { email: string; login: string; password: string },
) {
  await prepareApp(page)
  await page.getByTestId('create-account-link').click()
  await page.getByTestId('register-email-input').fill(user.email)
  await page.getByTestId('register-login-input').fill(user.login)
  await page.getByTestId('register-password-input').fill(user.password)
  await page.getByTestId('register-password-repeat-input').fill(user.password)
  await page.getByTestId('register-submit-button').click()
  await expect(page.getByText(/account created/i)).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: /back to login/i }).click()
}

export function extractProjectId(url: string): number | null {
  const match = url.match(/\/org-[^/]+\/(\d+)(?:\/|$)/i) || url.match(/\/user\/(\d+)(?:\/|$)/)
  return match ? Number(match[1]) : null
}

export async function addProject(page: Page, name: string): Promise<number | null> {
  const urlBefore = page.url()
  const input = page.getByTestId('project-add-input').first()
  await input.waitFor({ state: 'visible', timeout: 15000 })
  await input.scrollIntoViewIfNeeded()
  await input.fill(name)
  await input.press('Enter')
  await expect(page.getByText(name).first()).toBeVisible({ timeout: 15000 })
  await page.waitForFunction(
    (prev) => location.href !== prev && /\/org-[^/]+\/\d+\//i.test(location.href),
    urlBefore,
    { timeout: 15000 },
  )
  const id = extractProjectId(page.url())
  trackProjectId(id)
  return id
}

export async function createProjectAndNavigate(page: Page, prefix = 'Test') {
  const projectName = `${prefix} ${Date.now()}`
  const id = await addProject(page, projectName)
  await expect(page.getByTestId('task-search-add-input')).toBeVisible({ timeout: 15000 })
  return { name: projectName, id }
}

export async function selectProject(page: Page, projectName: string) {
  const trigger = page.getByTestId('project-select-trigger')
  await trigger.click()
  await page.getByTestId(`project-option-${projectName}`).click()
  await page.waitForURL(/\/org-[^/]+\/\d+\//i, { timeout: 10000 })
}

export async function editCurrentProject(page: Page, newName: string) {
  await page.getByTestId('project-edit-button').click()
  await page.getByTestId('project-edit-name').fill(newName)
  await page.getByTestId('project-edit-save').click()
  await expect(page.getByText(newName).first()).toBeVisible({ timeout: 10000 })
}

export async function archiveCurrentProject(page: Page) {
  await page.getByTestId('project-archive-button').click()
  await expect(page.getByTestId('project-restore-button')).toBeVisible({ timeout: 10000 })
}

export async function restoreCurrentProject(page: Page) {
  await page.getByTestId('project-restore-button').click()
  await expect(page.getByTestId('project-archive-button')).toBeVisible({ timeout: 10000 })
}

export async function deleteCurrentProject(page: Page) {
  await page.getByTestId('project-delete-button').click()
  await page.getByTestId('confirm-delete-button').click()
}

/** @deprecated kept for older specs — use selectProject + action buttons */
export async function openProjectMenu(page: Page, projectName: string) {
  await selectProject(page, projectName)
}

export async function navigateToKanban(page: Page, _projectName?: string) {
  await page.getByRole('link', { name: /^kanban$/i }).click()
  await page.waitForURL(/\/kanban/, { timeout: 10000 })
}

export async function navigateToGraph(page: Page, _projectName?: string) {
  await page.getByRole('link', { name: /^graph$/i }).click()
  await page.waitForURL(/\/graph/, { timeout: 10000 })
}

export async function addTaskFromList(page: Page, taskName: string) {
  const input = page.getByTestId('task-search-add-input')
  await input.waitFor({ state: 'visible', timeout: 10000 })
  await input.fill(taskName)
  await input.press('Enter')
  await expect(page.getByText(taskName).first()).toBeVisible({ timeout: 10000 })
}

export async function openTaskDetail(page: Page, taskName: string) {
  await page.getByText(taskName).first().click()
  await expect(page.getByTestId('add-subtask-button')).toBeVisible({ timeout: 10000 })
}

export async function addSubtask(page: Page) {
  await page.getByTestId('add-subtask-button').click()
  await expect(page.getByTestId('subtasks-list')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(500)
  return page.locator('[data-testid^="subtask-item-"]').count()
}

export function getSubtaskCount(page: Page) {
  return page.locator('[data-testid^="subtask-item-"]').count()
}
