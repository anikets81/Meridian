# TaskView — Office / Team Setup

Self-hosted TaskView for your team with **password-only login** and **simple registration** (no email confirmation codes, no Google/GitHub SSO).

## What you get

- PostgreSQL database
- TaskView API (port **1725** by default)
- TaskView web app (port **8888** by default)
- Password login + open registration for your colleagues

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) (or Docker Engine + Compose)
- Ports **8888** (web) and **1725** (API) available

## Quick start

### 1. Configure environment

```powershell
cd deploy/office-setup
copy .env.postgresql.example .env.postgresql
copy .env.taskview.example .env.taskview
```

Edit both files and replace every `CHANGE_ME_*` value with strong secrets.

**Important:** After first login, change the default seeded admin account (see below).

### 2. Start the stack

**Windows (PowerShell):**
```powershell
.\start.ps1
```

**Linux / macOS:**
```bash
chmod +x start.sh
./start.sh
```

### 3. Open the app

- **Web:** http://localhost:8888
- **API:** http://localhost:1725

### 4. First-time admin setup

On a fresh install, a default account exists (change it immediately):

| Field    | Value          |
|----------|----------------|
| Login    | `user`         |
| Password | `user1!#Q`     |

1. Sign in with the default account.
2. Go to **Account settings** and set your own login, email, and password.
3. Invite teammates or let them **Create account** on the login page.

## Authentication settings

These are pre-configured in `.env.taskview.example`:

| Setting | Value | Meaning |
|---------|-------|---------|
| `AUTH_LOGIN_METHODS` | `password` | No SSO / social login |
| `ALLOW_PUBLIC_REGISTRATION` | `true` | Anyone can register |
| `REQUIRE_EMAIL_CONFIRMATION` | `false` | Instant account activation |
| `PASSWORD_CHANGE_CONFIRMATION` | `password` | Change password with current password (no email) |

To restrict sign-ups to invite-only, set `ALLOW_PUBLIC_REGISTRATION=false`.

## Custom ports

Set in a `.env` file next to `docker-compose.yml`:

```env
WEB_HOST_PORT=8888
API_HOST_PORT=1725
POSTGRES_HOST_PORT=5433
```

Update `CORS_ALLOWED_ORIGINS` and `APP_URL` in `.env.taskview` to match.

## Stop / restart

```powershell
docker compose down          # stop
docker compose up -d         # start again
docker compose down -v       # stop and DELETE all data
```

## Production checklist

- [ ] Replace all default passwords and `JWT_SIGN`
- [ ] Claim / change the default `user` account
- [ ] Set `APP_URL` to your real domain
- [ ] Add your domain to `CORS_ALLOWED_ORIGINS`
- [ ] Put Nginx or another reverse proxy in front with TLS
- [ ] Back up the `pgdata` Docker volume regularly
- [ ] Consider `ALLOW_PUBLIC_REGISTRATION=false` for invite-only teams

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | Change `WEB_HOST_PORT` / `API_HOST_PORT` |
| Web can't reach API | On login page, set server URL to `http://localhost:1725` |
| Docker not running | Start Docker Desktop, then run `start.ps1` again |

For full documentation see the [TaskView docs](../../docs/1.getting-started/2.installation.md).
