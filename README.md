# ControlIT Hours Tracker Panel

A lightweight panel to visualize and bulk‑register hours in ControlIT with a calendar UI, dry‑run simulation, and smart exclusion of time‑off days.

## Features

- Calendar view with legend and filters: registered, pending, holiday, vacation, leave, simulated.
- Dry‑run mode by default: simulates entries without sending to ControlIT.
- Bulk submission across date ranges with PRG (Post/Redirect/Get) to prevent resubmission on refresh.
- Time‑off detection from ControlIT API: classifies days as holiday, vacation, or leave.
- Cheerio‑based scraping of “registered days” report to color the calendar.
- Metrics endpoint for Prometheus and health checks.
- In‑memory caching with optional dev disable and admin endpoints.

## Tech Stack

- Node.js (ESM) + Express + EJS
- node-fetch, Cheerio (pinned `1.0.0` for Node 18)
- Luxon for dates, winston for logs, prom‑client for metrics

## Setup

```bash
npm install
npm run start   # production‑like (respects .env)
# or
npm run dev     # with nodemon
```

Default port is `3000`. You can set `PORT` in `.env` (example uses `3009`).

## Configuration

Create your `.env` from the example and edit values:

```bash
cp .env.example .env
```

Key variables:

- CONTROLIT_USERNAME / CONTROLIT_PASSWORD
- CONTROLIT_API_BASE_URL (default: https://api.controlit.es/api)
- CONTROLIT_REPORTS_BASE_URL (default: https://controlit.es/reports)
- PORT, USE_HTTPS, SSL_KEY_PATH, SSL_CERT_PATH
- CACHE_DISABLED=true to bypass cache during development
- Work schedule and summer dates (see `.env.example`)

The server loads `.env` automatically via `dotenv`.

## How It Works

- Registered days: POST to `/reports/get-detailed-report` and parse HTML with Cheerio to find days with entries.
- Time‑off days: GET `/vacations/get-vacations-and-onduty-ranges-from-employee` and classify each date:
  - `IsHoliday === true` → holiday
  - `IsWorkedDay === true` → vacation (vacaciones propias)
  - `IsLeaveDay === true` → leave (permisos)
- Calendar coloring rules (priority): holiday > vacation > leave > registered > pending.
- Dry‑run submission computes the same work blocks but does not call ControlIT APIs; UI marks those days as “simulated”.
- PRG pattern: POST `/submit` redirects (303) to `/` with query params so refresh doesn’t resend.

## Legend and Filters

The legend at the top of the calendar shows a color key and acts as a filter. Click to toggle categories:

- Registered: green
- Pending: red
- Holiday: yellow
- Vacation: blue
- Leave: purple
- Simulated: yellow with ⚡

Keyboard support: focus an item and press Enter/Space to toggle.

## Caching

- NodeCache with TTLs:
  - Time‑off map: 1h
  - Registered days report: 30min
- Disable in dev: set `CACHE_DISABLED=true`.
- Admin endpoints:
  - GET `/cache/keys` — list keys
  - GET `/cache/stats` — cache stats
  - POST `/cache/flush` — clear all
  - DELETE `/cache?key=...` — delete key

Submitting hours invalidates the relevant registered‑days cache keys to reflect changes immediately.

## Endpoints

- GET `/` — Calendar UI (reads query for PRG: `submitted`, `start`, `end`, `dry`)
- POST `/submit` — Submit or simulate hours; redirects back to `/`
- GET `/metrics` — Prometheus metrics
- GET `/health`, `/health/live`, `/health/ready` — health checks
- GET `/health/cache`, `/health/dependencies`, `/health/backups`, `/health/database`
- GET `/favicon.ico` — served to avoid 404s

## Testing

```bash
npm test
npm run test:coverage
npm run test:watch
```

## HTTPS (optional)

1) Set `USE_HTTPS=true` in `.env`
2) Generate certs (dev):

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

3) Point `SSL_KEY_PATH` and `SSL_CERT_PATH` if needed.

## Notes

- Node 18 users: Cheerio is pinned to `1.0.0` to avoid Undici API issues; Node 20+ can upgrade.
- Database features initialize only if `DB_PASSWORD` is set; not required for core usage.
- Use `CACHE_DISABLED=true` if no changes appear due to caching while iterating in development.
