# Security

Security checks run in `.github/workflows/security.yml`.

## What Runs

- Trivy filesystem scan for vulnerabilities, secrets, and Dockerfile misconfigurations.
- Trivy image scans for API and web final images.
- Hadolint for Dockerfiles.
- ShellCheck for scripts.
- CodeQL in a separate workflow.

## Local Checks

```bash
trivy fs --scanners vuln,secret,misconfig \
  --severity HIGH,CRITICAL \
  --ignore-unfixed \
  --exit-code 1 \
  --skip-dirs node_modules \
  --skip-dirs apps/api/dist \
  --skip-dirs apps/web/dist \
  .

docker build -f apps/api/Dockerfile -t devops-control-center-api:local .
docker build -f apps/web/Dockerfile -t devops-control-center-web:local .

trivy image --scanners vuln \
  --severity HIGH,CRITICAL \
  --ignore-unfixed \
  --exit-code 1 \
  devops-control-center-api:local

trivy image --scanners vuln \
  --severity HIGH,CRITICAL \
  --ignore-unfixed \
  --exit-code 1 \
  devops-control-center-web:local
```

Dockerfile lint:

```bash
docker run --rm -i hadolint/hadolint:v2.12.0-alpine hadolint --ignore DL3002 - < apps/api/Dockerfile
docker run --rm -i hadolint/hadolint:v2.12.0-alpine hadolint --ignore DL3002 - < apps/web/Dockerfile
```

Shell scripts:

```bash
shellcheck -x scripts/*.sh scripts/lib/*.sh
```
