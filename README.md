# PackSlip

PackSlip is a production-oriented SaaS platform for packing slip, label, thermal label, pagination, printing, PDF export, template design, audit, analytics, team, billing, and desktop workflows.

## What Is Included

- React + Vite + Tailwind + Framer Motion dashboard
- ShadCN-style reusable UI components
- React Router, Zustand, TanStack Query, React Hook Form, Zod
- Express + MongoDB + Mongoose API
- JWT auth, refresh token sessions, secure cookies, bcrypt password hashing
- Multi-tenant RBAC for owner, admin, manager, and staff roles
- Product, customer, template, preset, slip, analytics, audit, billing, team, settings, backup, search APIs
- Drag-and-drop template builder with dnd-kit
- Print-safe slip renderer, barcode/QR rendering, smart pagination engine
- react-to-print browser printing and jsPDF export hook
- CSV bulk generation workflow
- Preset management, global search, print queue, backup register, and activity stream screens
- Lazy-loaded web routes for a smaller operational shell bundle
- Toast notifications for auth, catalog, preset, backup, and slip-generation workflows
- Electron desktop shell for local/offline print workflows
- Docker, Nginx, PM2, CI, seed data, and test scaffolding

## Folder Structure

```txt
apps/
  api/          Express API, Mongoose models, routes, services, validators
  web/          React SaaS frontend, print engine, template builder
  electron/     Desktop shell for offline/local printing
packages/
  shared/       Shared print layout primitives
infra/
  nginx/        Production reverse proxy config
scripts/
  seed.mjs      Demo tenant seed script
```

## Local Setup

1. Copy `.env.example` to `.env` and update secrets.
2. Install dependencies from the repo root.
3. Start MongoDB locally or use Docker.
4. Run the seed script.
5. Start API and web together.

```bash
npm install
npm run seed
npm run dev
```

Useful validation commands:

```bash
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

Default seeded credentials:

```txt
Email: ops@packslip.example
Password: ChangeMe123!
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

The web app is served on `http://localhost:8080`; the API is on `http://localhost:5000/api/v1`.

## Key API Modules

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/products`
- `GET /api/v1/customers`
- `GET /api/v1/templates`
- `POST /api/v1/slips`
- `POST /api/v1/slips/bulk`
- `POST /api/v1/slips/:id/print`
- `GET /api/v1/analytics/dashboard`
- `GET /api/v1/audit-logs`
- `GET /api/v1/billing`
- `GET /api/v1/settings`

## Print Engine

The smart pagination engine calculates rows, columns, scale, pages, margins, and placements for A4, Letter, 4x6, 2x4, and custom sizes. It is used by:

- single slip preview
- browser print rendering
- bulk generation
- PDF export flow
- reusable shared package

## Production Notes

Before a real launch, set strong JWT/cookie secrets, configure SMTP, configure Stripe/Razorpay webhooks, choose Cloudinary or S3 uploads, harden CORS origins, attach Redis-backed workers for very large batch rendering, and run the full test suite in CI.
