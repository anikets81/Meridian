import { test, expect } from '@playwright/test'
import {
  setupAndLogin,
  addProject,
  editCurrentProject,
  archiveCurrentProject,
  restoreCurrentProject,
  deleteCurrentProject,
  cleanupProjects,
} from './test-helpers'

test.describe('Projects', () => {
  test.setTimeout(60_000)

  test.beforeEach(async ({ page }) => {
    await setupAndLogin(page)
  })

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage()
    await cleanupProjects(page)
    await page.close()
  })

  test('user can add project', async ({ page }) => {
    const projectName = `Test Project ${Date.now()}`
    await addProject(page, projectName)
  })

  test('user can edit project', async ({ page }) => {
    const projectName = `Edit Me ${Date.now()}`
    await addProject(page, projectName)
    const newName = `Edited ${Date.now()}`
    await editCurrentProject(page, newName)
  })

  test('user can delete project', async ({ page }) => {
    const projectName = `Delete Me ${Date.now()}`
    await addProject(page, projectName)
    await deleteCurrentProject(page)
    await page.getByTestId('project-select-trigger').click()
    await expect(page.getByTestId(`project-option-${projectName}`)).toHaveCount(0)
  })

  test('user can archive and unarchive project', async ({ page }) => {
    const projectName = `Archive Me ${Date.now()}`
    await addProject(page, projectName)
    await archiveCurrentProject(page)
    await restoreCurrentProject(page)
    await expect(page.getByTestId('project-select-trigger')).toContainText(projectName)
  })
})
