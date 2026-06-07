#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

PROJECT_NAME="${COMPOSE_INTEGRATION_PROJECT:-production-app-integration}"
EDGE_PORT="${COMPOSE_INTEGRATION_PORT:-38080}"
BASE_URL="http://127.0.0.1:${EDGE_PORT}"

compose_safe() {
  NGINX_BIND_ADDRESS=127.0.0.1 NGINX_PORT="$EDGE_PORT" docker compose \
    --project-name "$PROJECT_NAME" \
    -f docker-compose.yml \
    "$@"
}

compose_demo() {
  NGINX_BIND_ADDRESS=127.0.0.1 NGINX_PORT="$EDGE_PORT" docker compose \
    --project-name "$PROJECT_NAME" \
    -f docker-compose.yml \
    -f docker-compose.demo.yml \
    "$@"
}

cleanup() {
  compose_demo --profile tools down --volumes --remove-orphans >/dev/null 2>&1 || true
}

status_for() {
  local method="$1"
  local path="$2"
  shift 2

  curl -sS -o /dev/null -w '%{http_code}' --max-time 10 \
    -X "$method" "$@" "${BASE_URL}${path}"
}

assert_status() {
  local expected="$1"
  local method="$2"
  local path="$3"
  shift 3
  local actual

  actual="$(status_for "$method" "$path" "$@")"
  if [[ "$actual" != "$expected" ]]; then
    die "Expected ${method} ${path} to return ${expected}, got ${actual}"
  fi
}

wait_for_edge() {
  for _ in $(seq 1 60); do
    if curl -fsS --max-time 5 "${BASE_URL}/api/health" >/dev/null; then
      return 0
    fi
    sleep 1
  done

  compose_demo logs >&2 || true
  die "Compose edge did not become healthy at ${BASE_URL}"
}

main() {
  cd_project_root
  require_docker
  require_command curl
  trap cleanup EXIT

  cleanup
  info "Starting isolated safe Compose stack"
  compose_safe up --build -d api web nginx
  wait_for_edge

  assert_status 200 GET /
  assert_status 200 GET /api/overview
  for route in load/cpu load/errors logs/generate; do
    assert_status 404 POST "/api/${route}" -H "X-Demo-Action: true"
  done

  if [[ "${RUN_BROWSER_E2E:-false}" == "true" ]]; then
    require_command pnpm
    info "Running browser E2E against safe local Compose"
    E2E_BASE_URL="$BASE_URL" E2E_RUNTIME_MODE=safe pnpm e2e:compose
  fi

  info "Switching isolated stack to demo mode"
  compose_demo up -d --force-recreate api nginx
  wait_for_edge
  assert_status 403 POST /api/logs/generate \
    -H "Content-Type: application/json" \
    --data '{"message":"missing demo header"}'
  assert_status 200 POST /api/logs/generate \
    -H "Content-Type: application/json" \
    -H "X-Demo-Action: true" \
    --data '{"message":"compose integration"}'

  info "Running k6 smoke test"
  compose_demo --profile tools run --rm k6 run /scripts/smoke-test.js

  if [[ "${RUN_BROWSER_E2E:-false}" == "true" ]]; then
    require_command pnpm
    info "Running browser E2E against demo local Compose"
    E2E_BASE_URL="$BASE_URL" E2E_RUNTIME_MODE=demo pnpm e2e:compose
  fi

  success "Safe/demo Compose integration, k6 smoke, and requested E2E checks passed."
}

main "$@"
