# Demo Screenshots

This folder is reserved for portfolio proof screenshots.

Start the full local demo before capturing:

```bash
docker compose up --build -d
./scripts/healthcheck.sh
```

Recommended captures:

| File | Capture |
| --- | --- |
| `dashboard.png` | http://localhost:3000 overview with healthy API, ready status, version, commit, uptime, requests, errors, and error rate. |
| `grafana.png` | http://localhost:3001 provisioned DevOps Control Center dashboard after running `pnpm k6:docker:load`. |
| `loki-logs.png` | Grafana Explore with the Loki data source after clicking `Generate Logs` or running a log-generation curl. |
| `k6-load.png` | Terminal output from `pnpm k6:docker:load` showing successful checks and request metrics. |
| `rollback.png` | Terminal output from `./scripts/rollback-demo.sh v1.0.0` showing version verification and healthy rollback target. |

Optional Chromium capture for the dashboard, when Chromium is installed locally:

```bash
chromium --headless --disable-gpu --window-size=1440,1100 \
  --screenshot=docs/screenshots/dashboard.png \
  http://localhost:3000
```

Do not commit secrets, local `.env` files, or cloud credentials in screenshots.
