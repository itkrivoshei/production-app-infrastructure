# Web Dashboard

React/Vite dashboard for the DevOps Control Center.

- Local Compose uses `BrowserRouter` behind the Nginx edge.
- The GitHub Pages build uses `HashRouter` and mock API data.
- API calls use same-origin `/api` paths with timeout and readable errors.
- Mobile navigation and the root error boundary are covered by unit and browser tests.

Run from the repository root:

```bash
pnpm web:dev
pnpm --filter @production-app-infrastructure/web test:coverage
pnpm web:build
pnpm e2e:pages
```

See the root [README](../../README.md) and [demo guide](../../docs/demo.md).
