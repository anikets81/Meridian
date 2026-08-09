# Meridian — Visitor Demo

A **ready-to-explore** Meridian instance pre-loaded with realistic sample data so visitors can see every major feature without setting anything up.

## Demo login

| Field    | Value            |
|----------|------------------|
| **URL**  | http://localhost:8888 |
| **Username** | `visitor`    |
| **Password** | `visitor!!` |

Click **Continue as demo user** on the login page for one-click access (dev web or a web image built from this repo).

### Local dev (Vite on :5174 + API on :8080)

The demo user is **not** created automatically. Run once from the repo root:

```powershell
.\deploy\visitor-demo\seed-local.ps1
```

```bash
./deploy/visitor-demo/seed-local.sh
```

For Docker demo, confirm the API server is set to `http://localhost:1725`. For local dev, `config.js` pins `http://localhost:8080`.

## What's inside the demo

The sample workspace looks like a real product team at **Acme Corp**:

### Projects
| Project | Highlights |
|---------|------------|
| **Acme Mobile App** | Main project — kanban, sprints, subtasks, graph, assignees, time tracking |
| **Website Redesign** | Kanban board, income/expense tasks for analytics |
| **Q4 Marketing Campaign** | Campaign tasks with deadlines (some completed) |
| **IT Infrastructure** | DevOps tasks, recurring daily backup check |
| **Customer Support — Legacy** | Archived project with resolved tickets |

### Features you can explore

| Feature | Where to look |
|---------|---------------|
| **Kanban board** | Acme Mobile App & Website Redesign → Kanban view |
| **Sprints** | Acme Mobile App → Sprints (active, planned, closed + retrospective) |
| **Task lists** | Acme Mobile App → Product Backlog, Icebox, Sprint Candidates |
| **Subtasks** | "Implement push notification service" and "Design onboarding flow" |
| **Dependency graph** | Acme Mobile App → Graph view (5 linked tasks) |
| **Tags** | bug, feature, design, urgent, backend, frontend, qa, devops, docs, meeting, client |
| **Assignees** | Push notifications (Sarah), startup optimization (Marcus) |
| **Team collaboration** | Sarah Chen & Marcus J invited to projects (`Team2024!`) |
| **Recurring tasks** | Weekly standup (Mon), daily backup verification |
| **Time tracking** | 10+ entries across mobile, web, and infra tasks |
| **Analytics** | Income/expense from Website Redesign tasks |
| **Archived project** | Customer Support — Legacy (sidebar archive section) |

## Quick start

```powershell
cd deploy/visitor-demo
copy .env.postgresql.example .env.postgresql
copy .env.taskview.example .env.taskview
.\start.ps1
```

First start takes **2–4 minutes** (downloads images, runs migrations, seeds data).

## Reset demo data

If visitors changed things and you want a fresh demo:

**Windows:**
```powershell
.\reset-demo.ps1
```

**Linux / macOS:**
```bash
./reset-demo.sh
```

This deletes the database volume and re-seeds everything.

## Ports

| Service | Default port |
|---------|-------------|
| Web     | 8888 |
| API     | 1725 |
| Postgres | 5433 |

Override with `WEB_HOST_PORT`, `API_HOST_PORT`, `POSTGRES_HOST_PORT` in a `.env` file.

## Notes for hosts

- Demo data is **reset-on-demand** — run `reset-demo.ps1` before important demos.
- Registration stays enabled on the API so the seed script can create users; the login UI hides self-registration in demo mode.
- This setup is **not for production** — default secrets are intentionally simple.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Seed container failed | Check `docker compose logs seed-demo` |
| Empty workspace after login | Run `.\reset-demo.ps1` |
| Web can't reach API | Set server URL to `http://localhost:1725` on login page |
