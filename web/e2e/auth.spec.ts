import { test, expect } from '@playwright/test'
import { TEST_USER } from './fixtures/auth'
import { prepareApp, login, registerUser, setupAndLogin } from './test-helpers'

test.describe('Auth', () => {
  test('shows login page with welcome message', async ({ page }) => {
    await prepareApp(page)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/welcome/i)
  })

  test('user can login with password and reach dashboard', async ({ page }) => {
    await setupAndLogin(page)
    await expect(page).toHaveURL(/\/org-[a-z0-9]+/i)
  })

  test('user can register and then login', async ({ page }) => {
    const stamp = Date.now()
    const user = {
      email: `e2e${stamp}@example.com`,
      login: `e2e${stamp}`,
      password: 'Test1234!',
    }

    await registerUser(page, user)
    await login(page, user)
    await expect(page).toHaveURL(/\/org-[a-z0-9]+/i)
  })

  test('seed user credentials still work', async ({ page }) => {
    await setupAndLogin(page, TEST_USER)
    await expect(page.getByTestId('project-add-input').first()).toBeVisible()
  })
})
