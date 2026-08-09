import { test, expect } from '@playwright/test'
import {
  setupAndLogin,
  addProject,
  selectProject,
  editCurrentProject,
  archiveCurrentProject,
  restoreCurrentProject,
  deleteCurrentProject,
  cleanupProjects,
  createProjectAndNavigate,
  addTaskFromList,
  openTaskDetail,
  addSubtask,
  navigateToKanban,
  navigateToGraph,
} from './test-helpers'

test.describe('Core features', () => {
  test.setTimeout(90_000)

  test.beforeEach(async ({ page }) => {
    await setupAndLogin(page)
  })

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage()
    await cleanupProjects(page)
    await page.close()
  })

  test('create project from sidebar', async ({ page }) => {
    const projectName = `PW Project ${Date.now()}`
    const id = await addProject(page, projectName)
    expect(id).toBeTruthy()
    await expect(page.getByTestId('task-search-add-input')).toBeVisible()
  })

  test('create task in project', async ({ page }) => {
    await createProjectAndNavigate(page, 'TaskProj')
    const taskName = `Task ${Date.now()}`
    await addTaskFromList(page, taskName)
    await expect(page.getByText(taskName).first()).toBeVisible()
  })

  test('open task detail and add subtask', async ({ page }) => {
    await createProjectAndNavigate(page, 'SubtaskProj')
    const taskName = `Parent ${Date.now()}`
    await addTaskFromList(page, taskName)
    await openTaskDetail(page, taskName)
    const count = await addSubtask(page)
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('navigate to kanban and see task', async ({ page }) => {
    const project = await createProjectAndNavigate(page, 'KanbanProj')
    const taskName = `Kanban ${Date.now()}`
    await addTaskFromList(page, taskName)
    await navigateToKanban(page, project.name)
    await expect(page.getByText(taskName).first()).toBeVisible({ timeout: 15000 })
  })

  test('navigate to graph view', async ({ page }) => {
    const project = await createProjectAndNavigate(page, 'GraphProj')
    const taskName = `Graph ${Date.now()}`
    await addTaskFromList(page, taskName)
    await navigateToGraph(page, project.name)
    await expect(page.getByText(taskName).first()).toBeVisible({ timeout: 15000 })
  })

  test('edit project name', async ({ page }) => {
    const projectName = `Edit Me ${Date.now()}`
    await addProject(page, projectName)
    const newName = `Edited ${Date.now()}`
    await editCurrentProject(page, newName)
  })

  test('archive and restore project', async ({ page }) => {
    const projectName = `Archive Me ${Date.now()}`
    await addProject(page, projectName)
    await archiveCurrentProject(page)
    await restoreCurrentProject(page)
    await expect(page.getByTestId('project-select-trigger')).toContainText(projectName)
  })

  test('delete project', async ({ page }) => {
    const projectName = `Delete Me ${Date.now()}`
    await addProject(page, projectName)
    await deleteCurrentProject(page)
    await page.getByTestId('project-select-trigger').click()
    await expect(page.getByTestId(`project-option-${projectName}`)).toHaveCount(0)
  })
})
