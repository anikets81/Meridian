# Host on Render + Vercel

Split deployment for **Meridian / TaskView**:

| Platform | Hosts |
|----------|--------|
| **Render** | PostgreSQL + API |
| **Vercel** | Web UI (Vue/Vite SPA) |

```text
Browser → https://your-app.vercel.app          (frontend)
       → https://meridian-api.onrender.com    (API)
              → Render PostgreSQL
```

---

## Before you start

You need:

1. **GitHub account** — code pushed to a GitHub repository
2. **[Render](https://render.com)** account (free tier works for testing)
3. **[Vercel](https://vercel.com)** account (free tier works)
4. **~15–20 minutes** for first deploy (Docker build on Render is slow on free tier)

> **Free tier note:** Render free web services **sleep after 15 minutes** of inactivity. The first request after sleep can take 30–60 seconds. Use a paid plan for production demos.

---

## Step 1 — Push this repo to GitHub

If you have not already:

```bash
git init
git add .
git commit -m "Prepare Render + Vercel deployment"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USER/YOUR_REPO` with your repository.

---

## Step 2 — Deploy the backend on Render (Blueprint)

1. Open **[Render Dashboard](https://dashboard.render.com/)**
2. Click **New → Blueprint**
3. Connect your **GitHub** account and select this repository
4. When asked for the Blueprint file path, enter:
   ```
   deploy/render-vercel/render.yaml
   ```
5. Click **Apply**

Render creates:

| Resource | Name | Purpose |
|----------|------|---------|
| PostgreSQL | `meridian-db` | Database |
| Web Service | `meridian-api` | API (Docker) |

6. Wait for the first deploy to finish (**10–20 min** on free tier — Docker build + migrations)

7. When **meridian-api** is **Live**, open the service and copy its URL, e.g.:
   ```
   https://meridian-api.onrender.com
   ```
   (Your exact URL is shown at the top of the Render service page.)

8. Test the API in a browser or terminal:
   ```bash
   curl https://meridian-api.onrender.com/module/auth/login-options
   ```
   You should get JSON like `{"password":true,...}`.

---

## Step 3 — Deploy the frontend on Vercel

1. Open **[Vercel Dashboard](https://vercel.com/dashboard)**
2. Click **Add New → Project**
3. Import the **same GitHub repository**
4. Configure the project:

   | Setting | Root Directory = `.` | Root Directory = `web` |
   |---------|----------------------|-------------------------|
   | **Root Directory** | `.` | `web` |
   | **Include source files outside Root Directory** | — | **Enabled** |
   | **Node.js Version** | `24.x` | `24.x` |
   | **Build Command** | `node scripts/build-vercel.mjs` | `cd .. && node scripts/build-vercel.mjs` |
   | **Output Directory** | `web/dist` | `dist` |
   | **Install Command** | *(from root `vercel.json`)* | *(from `web/vercel.json` — starts with `cd ..`)* |

   > **Common mistake:** Root Directory = `web` but Build Command = `node web/scripts/build-vercel.mjs` — that path does not exist and exits with code **1**. Either turn overrides **off** and redeploy, or match the table above exactly.

5. Add **Environment Variable**:

   | Name | Value |
   |------|--------|
   | `TASKVIEW_API_URL` | `https://meridian-api.onrender.com` |

   Use **your** Render API URL from Step 2 (no trailing slash).

6. Click **Deploy**

7. When finished, copy your Vercel URL, e.g.:
   ```
   https://your-app.vercel.app
   ```

---

## Step 4 — Connect frontend and backend (Render env vars)

The API must allow requests from your Vercel domain.

1. Render Dashboard → **meridian-api** → **Environment**
2. Add or update these variables (use **your** URLs):

   | Key | Example value |
   |-----|----------------|
   | `APP_URL` | `https://your-app.vercel.app` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
   | `API_URL` | `https://meridian-api.onrender.com` |
   | `API_PUBLIC_URL` | `https://meridian-api.onrender.com` |

   On first deploy, `APP_URL` is auto-set from `RENDER_EXTERNAL_URL` so the service can start. Update `APP_URL` and `CORS_ALLOWED_ORIGINS` once Vercel is live.

   See [`.env.render.example`](./.env.render.example) for a template.

3. Click **Save Changes** — Render redeploys the API automatically.

---

## Step 5 — Redeploy Vercel (optional but recommended)

After Render env vars are set:

1. Vercel → your project → **Deployments**
2. Click **⋯** on the latest deployment → **Redeploy**

This ensures `config.js` is built with the correct `TASKVIEW_API_URL`.

---

## Step 6 — Sign in

1. Open your Vercel URL: `https://your-app.vercel.app`
2. On first deploy after migrations, the default admin account exists:

   | Login | Password |
   |-------|----------|
   | `user` | `user1!#Q` |

3. **Change this password immediately** in Account settings.

4. Teammates can use **Create account** on the login page (registration is enabled).

---

## Custom domains (optional)

### Vercel (app)

1. Vercel → Project → **Settings → Domains**
2. Add e.g. `app.yourdomain.com`
3. Update Render env vars:
   - `APP_URL=https://app.yourdomain.com`
   - `CORS_ALLOWED_ORIGINS=https://app.yourdomain.com`

### Render (API)

1. Render → **meridian-api** → **Settings → Custom Domains**
2. Add e.g. `api.yourdomain.com`
3. Update:
   - Render: `API_URL` and `API_PUBLIC_URL`
   - Vercel: `TASKVIEW_API_URL=https://api.yourdomain.com`
4. Redeploy both services.

---

## Demo mode on Vercel (optional)

To show the **visitor** demo login button, add Vercel env vars:

| Name | Value |
|------|--------|
| `TASKVIEW_DEMO_LOGIN` | `visitor` |
| `TASKVIEW_DEMO_PASSWORD` | `visitor!!` |

You must also seed the demo user against your Render database (run [`seed-local.ps1`](../visitor-demo/seed-local.ps1) pointed at Render Postgres **external** connection — advanced; not recommended for production).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing script: build:webapp` | Set **Root Directory** to `web`, enable **Include source files outside Root Directory**, redeploy |
| `conflicting paths or names` | Root Directory must be `web` (not `.`); see Step 3 |
| Vercel build exits with code 1/2 | Clear any **custom Build Command** override in Vercel settings; redeploy latest commit; set Node.js to **24.x** |
| Vercel build fails on `pnpm` | Check `vercel.json` install command; ensure repo has `pnpm-lock.yaml` |
| Login fails / network error | Confirm `TASKVIEW_API_URL` on Vercel matches Render API URL |
| CORS error in browser console | Add exact Vercel URL to `CORS_ALLOWED_ORIGINS` on Render (include `https://`) |
| API slow first request | Render free tier cold start — wait ~60s or upgrade plan |
| Render build fails | Check **Logs**; ensure Dockerfile path is `deploy/render-vercel/Dockerfile.api` |
| Health check timeout | Redeploy after latest fix; confirm `/health` returns 200 in logs; set `APP_URL` if needed |
| Empty app after login | Migrations failed — check **meridian-api** logs for Postgres errors |
| `Invalid environment variables` | Ensure all four URL env vars are set on Render after Vercel deploy |

---

## Files in this folder

| File | Purpose |
|------|---------|
| `render.yaml` | Render Blueprint (Postgres + API) |
| `Dockerfile.api` | Multi-stage API image built from monorepo |
| `docker-entrypoint.sh` | Waits for DB, runs migrations, starts API |
| `.env.render.example` | Render environment variable template |

Root **`vercel.json`** configures the Vercel frontend build.

---

## Updating after code changes

- **Frontend changes** → push to GitHub → Vercel auto-deploys
- **API changes** → push to GitHub → Render auto-rebuilds Docker image
- **Database schema changes** → migrations run automatically on each API container start

Always back up Render Postgres before major upgrades (Render Dashboard → **meridian-db** → **Backups** on paid plans).
