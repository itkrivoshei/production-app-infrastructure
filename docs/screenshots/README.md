# Demo Screenshots

This folder stores visual proof for the local demo and project documentation.

Screenshots should show the full DevOps workflow: dashboard status, action feedback, static guidance, observability, logs, load testing, and rollback behavior.

## Before Capturing

Start the full local stack:

```bash
export COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml
docker compose --profile observability up --build -d
pnpm demo:health
```

Generate traffic before capturing observability screens:

```bash
pnpm k6:docker:load
```

Generate demo logs before capturing Loki/Grafana Explore:

```bash
curl -fsS -X POST http://localhost:3000/api/logs/generate \
  -H "Content-Type: application/json" \
  -H "X-Demo-Action: true" \
  -d '{"level":"info","message":"screenshot demo log"}'
```

## Committed Screenshots

| File                   | Capture                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `dashboard.png` | Dashboard at `http://localhost:3000` showing healthy API, ready status, version, commit, uptime, requests, errors, and error rate. |
| `activity-console.png` | Dashboard after running load/error/log actions, showing timestamped Activity Console entries. |
| `static-guidance.png` | GitHub Pages static preview with a local-only service guidance panel open. |
| `mobile-dashboard.png` | Dashboard static preview or local dashboard at a mobile viewport with controls readable and not overlapping. |

## Optional Runtime Captures

Capture these when preparing a live environment walkthrough:

- Grafana dashboard after running `pnpm k6:docker:load`.
- Grafana Explore showing Loki logs.
- Terminal output from `pnpm k6:docker:load`.
- Terminal output from `./scripts/rollback-demo.sh HEAD^` showing the real
  source refs, derived versions, and healthy rollback target.

## Capture Standards

Use consistent screenshot settings where possible:

| Setting        | Recommendation                                                                        |
| -------------- | ------------------------------------------------------------------------------------- |
| Resolution     | `1440x1100` or similar desktop viewport                                               |
| Theme          | Default project theme / dark Grafana theme                                            |
| Browser chrome | Hide if possible for clean documentation screenshots                                  |
| Terminal font  | Use a readable monospace font                                                         |
| Content        | Show successful health, metrics, logs, or rollback output clearly                     |
| Secrets        | Do not include tokens, credentials, `.env` values, cloud account IDs, or private URLs |

## Optional Headless Capture

When Chromium is installed locally, capture the dashboard automatically:

```bash
chromium --headless --disable-gpu --window-size=1440,1100 \
  --screenshot=docs/screenshots/dashboard.png \
  http://localhost:3000
```

## Cleanup

Stop the local stack after capturing:

```bash
docker compose down
```

## Safety

Before committing screenshots:

- Check that no secrets, credentials, local `.env` values, or cloud identifiers are visible.
- Prefer local demo data over real production data.
- Keep image names stable so README and documentation links do not break.
- Compress large screenshots if they become unnecessarily heavy.
