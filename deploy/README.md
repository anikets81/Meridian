# Meridian deployment packages

Two ready-to-run folders for different audiences:

| Folder | Purpose | Login |
|--------|---------|-------|
| **[office-setup](./office-setup/)** | Your team — password auth, registration, production-oriented config | `user` / `user1!#Q` (change immediately) |
| **[visitor-demo](./visitor-demo/)** | Show visitors the product with realistic sample data | `visitor` / `visitor!!` |
| **[render-vercel](./render-vercel/)** | Host online: **Vercel** (web) + **Render** (API + Postgres) | See [render-vercel README](./render-vercel/README.md) |

## Which one should I use?

**Office setup** — You want to deploy TaskView for your team. Colleagues register with email + password. No SSO, no email confirmation codes.

**Visitor demo** — You want someone to click around and see kanban, sprints, time tracking, analytics, etc. without creating their own data. Run `reset-demo.ps1` anytime to restore the sample workspace.

## Quick start

```powershell
# For your team
cd deploy/office-setup
copy .env.*.example .env.*
.\start.ps1

# For visitors / demos
cd deploy/visitor-demo
copy .env.*.example .env.*
.\start.ps1
```

Both stacks open at **http://localhost:8888** (web) and **http://localhost:1725** (API).

See each folder's README for full details.
