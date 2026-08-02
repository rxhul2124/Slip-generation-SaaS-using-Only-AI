# Deploying Slipora

Slipora is a monorepo with two deployable apps:

| App | Path | Hosts on | Build output |
| --- | --- | --- | --- |
| Web (React + Vite) | `apps/web` | Vercel or Bolt | `apps/web/dist` |
| API (Express + MongoDB) | `apps/api` | Render | Node server |

## Prerequisites

1. A MongoDB instance (MongoDB Atlas free tier works great).
2. Copy `.env.example` to `.env` and fill in real values for production.

## Option A — Vercel (Web) + Render (API)

### 1. Deploy the API to Render

1. Push this repo to GitHub.
2. Go to [Render](https://dashboard.render.com) → New → Blueprint.
3. Connect your repo. Render will read `render.yaml` automatically.
4. Set the following environment variables in the Render dashboard:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `CLIENT_URL` — your Vercel web URL (e.g. `https://your-app.vercel.app`)
   - `API_URL` — your Render API URL (e.g. `https://slipora-api.onrender.com/api/v1`)
5. Render auto-generates `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, and `CSRF_SECRET` for you.
6. Deploy. The API will be available at `https://<your-service>.onrender.com/api/v1`.

### 2. Deploy the Web app to Vercel

1. Go to [Vercel](https://vercel.com) → New Project → Import your GitHub repo.
2. Vercel reads `vercel.json` automatically. Set these env vars in the Vercel dashboard:
   - `VITE_API_URL` — your Render API URL (e.g. `https://slipora-api.onrender.com/api/v1`)
3. Deploy. Your web app will be live at `https://<your-project>.vercel.app`.
4. Go back to Render and update `CLIENT_URL` to match your Vercel URL.

## Option B — Bolt

Bolt runs the web dev server automatically. To connect the API:

1. Set `VITE_API_URL` in your Bolt environment variables to point to your Render API URL.
2. The web app will proxy API requests to that URL.

## Environment Variables Reference

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `CLIENT_URL` | Yes | Comma-separated allowed web origins (CORS) |
| `JWT_ACCESS_SECRET` | Yes | 32+ char secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | 32+ char secret for refresh tokens |
| `COOKIE_SECRET` | Yes | 32+ char secret for signed cookies |
| `CSRF_SECRET` | Yes | 32+ char secret for CSRF tokens |
| `VITE_API_URL` | Yes (web) | API base URL, e.g. `https://api.example.com/api/v1` |
| `STRIPE_SECRET_KEY` | No | For Stripe payments |
| `GEMINI_API_KEY` | No | For AI image analysis |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | No | For transactional email |

## Local Development

```bash
cp .env.example .env
npm install
npm run dev
```

This starts both the API (port 5000) and web (port 5173) together.
