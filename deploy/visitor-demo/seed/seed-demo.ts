/**
 * TaskView visitor demo — seeds realistic sample data via the API.
 * Run automatically by docker compose, or manually:
 *   API_URL=http://localhost:1725 bun run seed-demo.ts
 */

const API_URL = process.env.API_URL ?? 'http://localhost:1725'
const DEMO_LOGIN = process.env.DEMO_LOGIN ?? 'visitor'
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'visitor!!'
const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'visitor@demo.taskview.local'
const SEED_MARKER = 'IT Infrastructure'

const DB = {
  host: process.env.DB_HOST ?? 'db',
  user: process.env.DB_USER ?? 'taskview_demo',
  password: process.env.DB_PASSWORD ?? 'demo_db_pass_change_me',
  database: process.env.DB_NAME ?? 'taskview_demo',
  port: Number(process.env.DB_PORT ?? 5432),
}

type ApiResponse<T> = { response: T }
type Goal = { id: number; name: string; archive?: number }
type TaskRef = { id: number; col?: string; sprint?: boolean }

function ymd(offsetDays = 0): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

function isoDaysAgo(days: number, hour = 10, minutes = 0): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  d.setUTCHours(hour, minutes, 0, 0)
  return d.toISOString()
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

async function waitForApi(maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${API_URL}/module/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: 'probe', password: 'probe' }),
      })
      if (res.status === 400 || res.status === 401 || res.status === 200) return
    } catch { /* not ready */ }
    await sleep(2000)
  }
  throw new Error(`API not reachable at ${API_URL}`)
}

async function api<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`)
  }

  const json = await res.json()
  if (json && typeof json === 'object' && 'response' in json) {
    return (json as ApiResponse<T>).response
  }
  return json as T
}

async function apiLogin(userLogin: string, password: string) {
  const res = await fetch(`${API_URL}/module/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: userLogin, password }),
  })
  if (!res.ok) return null
  return res.json() as Promise<{ access: string; userData: { id: number; email: string } }>
}

async function register(userLogin: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/module/auth/registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: userLogin, email, password, passwordRepeat: password }),
  })
  return res.ok
}

async function unblockUser(login: string) {
  const { Client } = await import('pg')
  const client = new Client(DB)
  await client.connect()
  await client.query('UPDATE tv_auth.users SET block = 0 WHERE login = $1', [login])
  await client.end()
}

async function resetUserPassword(login: string, password: string) {
  const { hashSync } = await import('bcryptjs')
  const { Client } = await import('pg')
  const client = new Client(DB)
  await client.connect()
  await client.query('UPDATE tv_auth.users SET password = $1, block = 0 WHERE login = $2', [
    hashSync(password, 10),
    login,
  ])
  await client.end()
}

async function ensureDemoUser() {
  let auth = await apiLogin(DEMO_LOGIN, DEMO_PASSWORD)
  if (auth?.access) {
    console.log(`✓ Demo user "${DEMO_LOGIN}" ready`)
    return auth.access
  }

  try {
    await unblockUser(DEMO_LOGIN)
    auth = await apiLogin(DEMO_LOGIN, DEMO_PASSWORD)
    if (auth?.access) return auth.access
  } catch { /* not in DB */ }

  try {
    await resetUserPassword(DEMO_LOGIN, DEMO_PASSWORD)
    auth = await apiLogin(DEMO_LOGIN, DEMO_PASSWORD)
    if (auth?.access) {
      console.log(`✓ Demo user "${DEMO_LOGIN}" password updated`)
      return auth.access
    }
  } catch { /* user may not exist yet */ }

  console.log(`Creating demo user "${DEMO_LOGIN}"...`)
  if (!(await register(DEMO_LOGIN, DEMO_EMAIL, DEMO_PASSWORD))) {
    await unblockUser(DEMO_LOGIN).catch(() => {})
    auth = await apiLogin(DEMO_LOGIN, DEMO_PASSWORD)
    if (auth?.access) return auth.access
    throw new Error('Failed to register demo user')
  }

  await unblockUser(DEMO_LOGIN).catch(() => {})
  auth = await apiLogin(DEMO_LOGIN, DEMO_PASSWORD)
  if (!auth?.access) throw new Error('Failed to login after registration')
  return auth.access
}

async function ensureTeamMember(userLogin: string, email: string, password: string) {
  if (await apiLogin(userLogin, password)) return
  if (await register(userLogin, email, password)) {
    await unblockUser(userLogin).catch(() => {})
  }
}

function pickColor(name: string): string {
  const colors: Record<string, string> = {
    bug: '#ef4444', feature: '#3b82f6', design: '#a855f7', urgent: '#f97316',
    backend: '#6366f1', frontend: '#06b6d4', qa: '#22c55e', devops: '#14b8a6',
    docs: '#eab308', meeting: '#8b5cf6', client: '#ec4899',
  }
  return colors[name] ?? '#64748b'
}

function goalByName(goals: Goal[], name: string) {
  const g = goals.find((x) => x.name === name)
  if (!g) throw new Error(`Goal not found: ${name}`)
  return g.id
}

async function createKanbanColumns(token: string, goalId: number, names: string[]) {
  const columns: Record<string, number> = {}
  for (const name of names) {
    const col = await api<{ id: number }>('POST', '/module/kanban/add-status', { goalId, name }, token)
    columns[name] = col.id
  }
  return columns
}

async function createTask(
  token: string,
  data: {
    goalId: number
    description: string
    priorityId?: 1 | 2 | 3
    complete?: boolean
    statusId?: number | null
    goalListId?: number | null
    note?: string | null
    parentId?: number | null
    amount?: number | null
    transactionType?: number | null
    startDate?: string
    endDate?: string
  },
) {
  return api<{ id: number }>('POST', '/module/tasks', {
    priorityId: 2,
    complete: false,
    statusId: null,
    goalListId: null,
    note: null,
    parentId: null,
    amount: null,
    transactionType: null,
    startDate: ymd(-7),
    endDate: ymd(14),
    ...data,
  }, token)
}

async function seedFullWorkspace(token: string) {
  console.log('Creating full demo workspace...')

  const mobileId = (await api<{ id: number }>('POST', '/module/goals', { name: 'Acme Mobile App' }, token)).id
  const websiteId = (await api<{ id: number }>('POST', '/module/goals', { name: 'Website Redesign' }, token)).id
  const marketingId = (await api<{ id: number }>('POST', '/module/goals', { name: 'Q4 Marketing Campaign' }, token)).id
  const infraId = (await api<{ id: number }>('POST', '/module/goals', { name: SEED_MARKER }, token)).id
  const supportId = (await api<{ id: number }>('POST', '/module/goals', { name: 'Customer Support — Legacy' }, token)).id

  await seedProjectContent(token, { mobileId, websiteId, marketingId, infraId, supportId })
}

async function seedExpansion(token: string, goals: Goal[]) {
  console.log('Adding expanded demo data to existing workspace...')

  const mobileId = goalByName(goals, 'Acme Mobile App')
  const websiteId = goalByName(goals, 'Website Redesign')
  const marketingId = goalByName(goals, 'Q4 Marketing Campaign')
  const infraId = (await api<{ id: number }>('POST', '/module/goals', { name: SEED_MARKER }, token)).id
  const supportId = (await api<{ id: number }>('POST', '/module/goals', { name: 'Customer Support — Legacy' }, token)).id

  await seedProjectContent(token, { mobileId, websiteId, marketingId, infraId, supportId }, true)
}

async function seedProjectContent(
  token: string,
  ids: { mobileId: number; websiteId: number; marketingId: number; infraId: number; supportId: number },
  isExpansion = false,
) {
  const { mobileId, websiteId, marketingId, infraId, supportId } = ids

  await ensureTeamMember('sarah.chen', 'sarah.chen@acme-demo.local', 'Team2024!')
  await ensureTeamMember('marcus.j', 'marcus.j@acme-demo.local', 'Team2024!')
  await ensureTeamMember('alex.kumar', 'alex.kumar@acme-demo.local', 'Team2024!')

  const sarah = await api<{ id: number }>('POST', '/module/collaboration', { goalId: mobileId, email: 'sarah.chen@acme-demo.local' }, token).catch(() => null)
  const marcus = await api<{ id: number }>('POST', '/module/collaboration', { goalId: mobileId, email: 'marcus.j@acme-demo.local' }, token).catch(() => null)
  await api('POST', '/module/collaboration', { goalId: websiteId, email: 'sarah.chen@acme-demo.local' }, token).catch(() => {})

  const tagNames = ['bug', 'feature', 'design', 'urgent', 'backend', 'frontend', 'qa', 'devops', 'docs', 'meeting', 'client']
  const tags: Record<string, number> = {}
  for (const name of tagNames) {
    const t = await api<{ id: number }>('POST', '/module/tags', { name, color: pickColor(name), goalId: mobileId }, token).catch(() => null)
    if (t) tags[name] = t.id
  }

  let backlogList = { id: 0 }
  let columns: Record<string, number> = {}

  if (!isExpansion) {
    backlogList = await api<{ id: number }>('POST', '/module/goal_lists', {
      goalId: mobileId, name: 'Product Backlog', description: 'Prioritized feature requests',
    }, token)
    await api('POST', '/module/goal_lists', { goalId: mobileId, name: 'Icebox', description: 'Future ideas — not scheduled yet' }, token)
    await api('POST', '/module/goal_lists', { goalId: mobileId, name: 'Sprint Candidates', description: 'Ready for next sprint planning' }, token)
    columns = await createKanbanColumns(token, mobileId, ['Backlog', 'In Progress', 'Code Review', 'QA', 'Done'])
  } else {
    const lists = await api<Array<{ id: number; name: string }>>('GET', `/module/goal_lists?goalId=${mobileId}`, undefined, token).catch(() => [])
    backlogList = lists.find((l) => l.name === 'Product Backlog') ?? { id: 0 }
    const existingCols = await api<Array<{ id: number; name: string }>>('POST', '/module/kanban/fetch-statuses', { goalId: mobileId }, token).catch(() => [])
    for (const c of existingCols) columns[c.name] = c.id
  }

  const websiteCols = await createKanbanColumns(token, websiteId, ['To Do', 'Design', 'Development', 'Live'])

  const mobileTasks: TaskRef[] = []

  const pushNote = `## Push notifications\n\n- [x] FCM project setup\n- [ ] APNs certificates\n- [ ] Token refresh logic\n\n**Owner:** Sarah Chen\n\n> Target: Sprint 24.3 release`

  const taskDefs = [
    { desc: 'Implement push notification service', priority: 1 as const, col: 'In Progress', sprint: true, tags: ['feature', 'backend'], note: pushNote },
    { desc: 'Design onboarding flow screens', priority: 2 as const, col: 'Code Review', sprint: true, tags: ['design', 'frontend'] },
    { desc: 'Fix login timeout on slow networks', priority: 1 as const, col: 'QA', sprint: true, tags: ['bug', 'urgent'] },
    { desc: 'Add biometric authentication (Face ID)', priority: 2 as const, col: 'Backlog', sprint: true, tags: ['feature', 'frontend'] },
    { desc: 'Optimize app startup time (< 2s)', priority: 2 as const, col: 'In Progress', sprint: true, tags: ['backend'] },
    { desc: 'Write unit tests for payment module', priority: 3 as const, col: 'Backlog', tags: ['qa', 'backend'], listId: backlogList.id },
    { desc: 'Update App Store screenshots', priority: 3 as const, col: 'Done', sprint: true, complete: true, tags: ['design'] },
    { desc: 'Migrate user settings to encrypted storage', priority: 1 as const, col: 'In Progress', sprint: true, tags: ['backend', 'urgent'] },
    { desc: 'Dark mode theme polish', priority: 3 as const, col: 'Code Review', tags: ['design', 'frontend'] },
    { desc: 'Crash report dashboard integration', priority: 2 as const, col: 'Backlog', tags: ['feature', 'backend'], listId: backlogList.id },
    { desc: 'Offline mode for task list sync', priority: 2 as const, col: 'Backlog', sprint: true, tags: ['feature'] },
    { desc: 'Accessibility audit — WCAG 2.1 AA', priority: 2 as const, col: 'QA', tags: ['qa', 'design'] },
    { desc: 'Weekly engineering standup notes', priority: 3 as const, col: 'Done', complete: true, tags: ['meeting'], note: 'Recurring — every Monday 10:00 AM' },
    { desc: 'API rate limiting for public endpoints', priority: 1 as const, col: 'In Progress', sprint: true, tags: ['backend', 'urgent'] },
    { desc: 'In-app feedback widget', priority: 2 as const, col: 'Backlog', tags: ['feature', 'frontend'] },
  ]

  if (isExpansion) {
    for (const t of taskDefs.slice(12)) {
      const task = await createTask(token, {
        goalId: mobileId,
        description: t.desc,
        priorityId: t.priority,
        complete: t.complete ?? false,
        statusId: t.col ? columns[t.col] : columns['Backlog'],
        goalListId: t.listId ?? null,
        note: t.note ?? null,
      })
      mobileTasks.push({ id: task.id, col: t.col, sprint: t.sprint })
      for (const tagName of t.tags ?? []) {
        if (tags[tagName]) await api('PATCH', '/module/tags/toggle', { taskId: task.id, tagId: tags[tagName] }, token).catch(() => {})
      }
    }
  } else {
    for (const t of taskDefs) {
      const task = await createTask(token, {
        goalId: mobileId,
        description: t.desc,
        priorityId: t.priority,
        complete: t.complete ?? false,
        statusId: t.col ? columns[t.col] : columns['Backlog'],
        goalListId: t.listId ?? null,
        note: t.note ?? null,
      })
      mobileTasks.push({ id: task.id, col: t.col, sprint: t.sprint })
      for (const tagName of t.tags ?? []) {
        if (tags[tagName]) await api('PATCH', '/module/tags/toggle', { taskId: task.id, tagId: tags[tagName] }, token).catch(() => {})
      }
    }

    const parent = mobileTasks[0]
    await createTask(token, { goalId: mobileId, description: 'Configure FCM credentials', parentId: parent.id, priorityId: 2 })
    await createTask(token, { goalId: mobileId, description: 'Add notification preferences screen', parentId: parent.id, priorityId: 3 })
    await createTask(token, { goalId: mobileId, description: 'Handle token refresh on app resume', parentId: parent.id, priorityId: 2, complete: true })

    const designParent = mobileTasks[1]
    await createTask(token, { goalId: mobileId, description: 'Welcome screen illustrations', parentId: designParent.id, priorityId: 3 })
    await createTask(token, { goalId: mobileId, description: 'Permissions explainer copy', parentId: designParent.id, priorityId: 3 })

    if (mobileTasks.length >= 7) {
      await api('POST', '/module/graph', { source: mobileTasks[3].id, target: mobileTasks[0].id }, token).catch(() => {})
      await api('POST', '/module/graph', { source: mobileTasks[1].id, target: mobileTasks[6].id }, token).catch(() => {})
      await api('POST', '/module/graph', { source: mobileTasks[4].id, target: mobileTasks[0].id }, token).catch(() => {})
      await api('POST', '/module/graph', { source: mobileTasks[7].id, target: mobileTasks[4].id }, token).catch(() => {})
      await api('POST', '/module/graph', { source: mobileTasks[13]?.id ?? mobileTasks[10].id, target: mobileTasks[2].id }, token).catch(() => {})
    }
  }

  if (sarah && mobileTasks[0]) {
    await api('PATCH', '/module/tasks/task-users', { taskId: mobileTasks[0].id, userIds: [sarah.id] }, token).catch(() => {})
  }
  if (marcus && mobileTasks[4]) {
    await api('PATCH', '/module/tasks/task-users', { taskId: mobileTasks[4].id, userIds: [marcus.id] }, token).catch(() => {})
  }
  if (sarah && mobileTasks[1]) {
    await api('PATCH', '/module/tasks/task-users', { taskId: mobileTasks[1].id, userIds: [sarah.id] }, token).catch(() => {})
  }

  let activeSprintId = 0
  if (!isExpansion) {
    const closedSprint = await api<{ id: number }>('POST', '/module/sprints', {
      goalId: mobileId, name: 'Sprint 24.2 — Bug Bash',
      startDate: ymd(-28), endDate: ymd(-14),
      goalText: 'Fix top 20 customer-reported bugs', capacity: 40,
    }, token)
    await api('POST', `/module/sprints/sprint/${closedSprint.id}/activate`, {}, token).catch(() => {})
    await api('POST', `/module/sprints/sprint/${closedSprint.id}/review`, {}, token).catch(() => {})
    await api('PUT', `/module/sprints/sprint/${closedSprint.id}/retro`, {
      wentWell: 'Fixed 18 of 20 reported bugs. Crash-free sessions up to 99.2%.',
      wentBad: 'Underestimated time for Android-specific issues.',
      actionItems: 'Add Android QA device to every sprint. Start bug triage on Wednesdays.',
    }, token).catch(() => {})
    await api('POST', `/module/sprints/sprint/${closedSprint.id}/close`, { outcomes: [], goalAchieved: true }, token).catch(() => {})

    const activeSprint = await api<{ id: number }>('POST', '/module/sprints', {
      goalId: mobileId, name: 'Sprint 24.3 — Mobile Release',
      startDate: ymd(-7), endDate: ymd(7),
      goalText: 'Ship v2.4 with push notifications and biometric login', capacity: 80,
    }, token)
    activeSprintId = activeSprint.id
    await api('POST', `/module/sprints/sprint/${activeSprintId}/activate`, {}, token).catch(() => {})

    await api('POST', '/module/sprints', {
      goalId: mobileId, name: 'Sprint 24.4 — Performance',
      startDate: ymd(8), endDate: ymd(22),
      goalText: 'Reduce startup time and improve offline sync', capacity: 60,
    }, token)

    for (const t of mobileTasks.filter((x) => x.sprint)) {
      await api('PATCH', `/module/sprints/task/${t.id}/sprint`, { sprintId: activeSprintId }, token).catch(() => {})
    }
  } else {
    const sprints = await api<Array<{ id: number; status: string }>>('GET', `/module/sprints/${mobileId}`, undefined, token).catch(() => [])
    activeSprintId = sprints.find((s) => s.status === 'active')?.id ?? 0
    for (const t of mobileTasks.filter((x) => x.sprint && activeSprintId)) {
      await api('PATCH', `/module/sprints/task/${t.id}/sprint`, { sprintId: activeSprintId }, token).catch(() => {})
    }
  }

  const webTaskDefs = [
    { desc: 'Homepage hero section mockup', priority: 2 as const, col: 'Design', amount: 2500, type: 1, complete: true },
    { desc: 'Migrate blog to headless CMS', priority: 1 as const, col: 'Development', amount: 4800, type: 1 },
    { desc: 'SEO audit and meta tags update', priority: 2 as const, col: 'To Do', amount: 1200, type: 1 },
    { desc: 'Contact form spam protection', priority: 1 as const, col: 'Development', amount: 350, type: 0 },
    { desc: 'Performance: Lighthouse score > 90', priority: 2 as const, col: 'Development' },
    { desc: 'Customer testimonials section', priority: 3 as const, col: 'Design', amount: 800, type: 1 },
    { desc: '404 page redesign', priority: 3 as const, col: 'Live', complete: true },
    { desc: 'Analytics dashboard embed', priority: 2 as const, col: 'To Do', amount: 1500, type: 1 },
  ]

  const webTasks: number[] = []
  for (const t of webTaskDefs) {
    const task = await createTask(token, {
      goalId: websiteId,
      description: t.desc,
      priorityId: t.priority,
      complete: t.complete ?? false,
      statusId: websiteCols[t.col] ?? null,
      amount: t.amount ?? null,
      transactionType: t.type ?? null,
      startDate: ymd(-10),
      endDate: ymd(20),
    })
    webTasks.push(task.id)
  }

  const mktTasks = [
    { desc: 'Launch email campaign for v2.4 release', end: 5, complete: false },
    { desc: 'Social media content calendar — October', end: 30, complete: false },
    { desc: 'Partner webinar: "TaskView for Teams"', end: 14, complete: false, note: 'Co-host with TechFlow Inc. 200 registrants so far.' },
    { desc: 'Case study: Acme Corp productivity gains', end: 21, complete: true },
    { desc: 'Press release draft for Product Hunt launch', end: 10, complete: false },
    { desc: 'Influencer outreach — productivity niche', end: 25, complete: false },
    { desc: 'Monthly newsletter — September edition', end: -3, complete: true },
  ]
  for (const t of mktTasks) {
    await createTask(token, {
      goalId: marketingId,
      description: t.desc,
      priorityId: 2,
      complete: t.complete,
      endDate: ymd(t.end),
      note: t.note ?? null,
    })
  }

  const infraTasks = [
    { desc: 'Upgrade PostgreSQL to v17 on staging', priority: 1 as const, tags: ['devops', 'backend'] },
    { desc: 'Set up Grafana dashboards for API latency', priority: 2 as const, tags: ['devops'] },
    { desc: 'Rotate SSL certificates (expires Nov 15)', priority: 1 as const, tags: ['devops', 'urgent'] },
    { desc: 'Document disaster recovery runbook', priority: 2 as const, tags: ['docs', 'devops'] },
    { desc: 'Implement automated DB backups to S3', priority: 1 as const, tags: ['devops', 'backend'], complete: true },
    { desc: 'Review IAM policies for production access', priority: 2 as const, tags: ['devops'] },
  ]
  const infraTaskIds: number[] = []
  for (const t of infraTasks) {
    const task = await createTask(token, {
      goalId: infraId,
      description: t.desc,
      priorityId: t.priority,
      complete: t.complete ?? false,
      note: 'Infrastructure & DevOps backlog',
    })
    infraTaskIds.push(task.id)
    for (const tagName of t.tags ?? []) {
      if (tags[tagName]) await api('PATCH', '/module/tags/toggle', { taskId: task.id, tagId: tags[tagName] }, token).catch(() => {})
    }
  }

  const supportTasks = [
    'Ticket #4821 — Export CSV formatting issue',
    'Ticket #4798 — SSO login loop on Safari',
    'Ticket #4755 — Bulk task import failed',
  ]
  for (const desc of supportTasks) {
    await createTask(token, {
      goalId: supportId,
      description: desc,
      priorityId: 2,
      complete: true,
      endDate: ymd(-60),
      note: 'Resolved and closed — archived project',
    })
  }
  await api('PATCH', '/module/goals', { id: supportId, archive: 1 }, token).catch(() => {})

  const standupTask = mobileTasks.find((_, i) => taskDefs[i]?.desc.includes('standup'))
    ?? (await createTask(token, { goalId: mobileId, description: 'Weekly engineering standup notes', priorityId: 3, complete: false }))
  await api('POST', '/module/recurrence', {
    taskId: standupTask.id,
    rrule: 'FREQ=WEEKLY;BYDAY=MO',
    dtstart: `${ymd(0)}T10:00:00`,
    timezone: 'UTC',
    scheduleMode: 'fixed',
  }, token).catch(() => {})

  const backupTask = await createTask(token, {
    goalId: infraId,
    description: 'Daily backup verification check',
    priorityId: 3,
    complete: false,
  })
  await api('POST', '/module/recurrence', {
    taskId: backupTask.id,
    rrule: 'FREQ=DAILY',
    dtstart: `${ymd(0)}T06:00:00`,
    timezone: 'UTC',
  }, token).catch(() => {})

  const timeTargets = [
    { taskId: mobileTasks[0]?.id, days: 5, h1: 9, h2: 12, billable: true, desc: 'FCM integration — architecture review' },
    { taskId: mobileTasks[0]?.id, days: 4, h1: 10, h2: 13, billable: true, desc: 'Push notification handlers' },
    { taskId: mobileTasks[0]?.id, days: 3, h1: 14, h2: 17, billable: true, desc: 'APNs certificate setup' },
    { taskId: mobileTasks[4]?.id, days: 3, h1: 9, h2: 11, billable: true, desc: 'Startup profiling with Instruments' },
    { taskId: mobileTasks[4]?.id, days: 2, h1: 10, h2: 12, billable: false, desc: 'Performance benchmark suite' },
    { taskId: webTasks[1], days: 4, h1: 13, h2: 16, billable: true, desc: 'CMS migration planning' },
    { taskId: webTasks[1], days: 2, h1: 9, h2: 12, billable: true, desc: 'Content model design' },
    { taskId: webTasks[4], days: 1, h1: 14, h2: 17, billable: true, desc: 'Lighthouse optimization pass' },
    { taskId: infraTaskIds[0], days: 6, h1: 10, h2: 14, billable: false, desc: 'Postgres upgrade on staging' },
    { taskId: infraTaskIds[2], days: 1, h1: 11, h2: 12, billable: false, desc: 'SSL cert review' },
  ]
  for (const e of timeTargets) {
    if (!e.taskId) continue
    await api('POST', '/module/time-tracking/entries', {
      taskId: e.taskId,
      startedAt: isoDaysAgo(e.days, e.h1),
      endedAt: isoDaysAgo(e.days, e.h2),
      billable: e.billable,
      description: e.desc,
    }, token).catch(() => {})
  }

  console.log('✓ Projects: Acme Mobile App, Website Redesign, Q4 Marketing, IT Infrastructure, Customer Support (archived)')
  console.log(`✓ ${taskDefs.length}+ tasks with subtasks, tags, assignees, and markdown notes`)
  console.log('✓ Kanban boards, sprints (active/planned/closed + retro), dependency graph')
  console.log('✓ Recurring tasks, time entries, income/expense analytics data')
}

async function seedDemoData(token: string) {
  const goals = await api<Goal[]>('GET', '/module/goals', undefined, token)

  if (goals.some((g) => g.name === SEED_MARKER)) {
    console.log('✓ Full demo data already present')
    return
  }

  if (goals.some((g) => g.name === 'Acme Mobile App')) {
    await seedExpansion(token, goals)
  } else {
    await seedFullWorkspace(token)
  }
}

async function main() {
  console.log('TaskView demo seed')
  console.log(`API: ${API_URL}`)
  await waitForApi()
  const token = await ensureDemoUser()
  await seedDemoData(token)
  console.log('')
  console.log('Demo ready! Login with:')
  console.log(`  Username: ${DEMO_LOGIN}`)
  console.log(`  Password: ${DEMO_PASSWORD}`)
}

main().catch((err) => {
  console.error('Seed failed:', err.message ?? err)
  process.exit(1)
})
