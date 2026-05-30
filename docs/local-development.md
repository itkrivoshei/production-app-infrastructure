# Local Development

## Run Backend

```bash
pnpm api:dev
```

Backend runs on:

```text
http://localhost:8080
```

## Run Frontend

```bash
pnpm web:dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Run Both

```bash
pnpm dev:local
```

## Useful Checks

```bash
pnpm api:typecheck
pnpm api:test
pnpm web:typecheck
pnpm web:test
pnpm web:build
```

## Docker Compose

Run the full local production-like stack:

```bash
docker compose up --build
```

Services:

| Service | URL |
| --- | --- |
| Frontend through Nginx | [http://localhost:8088](http://localhost:8088) |
| API through Nginx | [http://localhost:8088/api/health](http://localhost:8088/api/health) |
| Direct API | [http://localhost:8080/health](http://localhost:8080/health) |

Health check:

```bash
bash scripts/healthcheck.sh
```

Logs:

```bash
bash scripts/logs.sh
bash scripts/logs.sh api
bash scripts/logs.sh web
bash scripts/logs.sh nginx
```

Restart:

```bash
bash scripts/restart.sh api
```

Clean:

```bash
bash scripts/clean.sh
```
