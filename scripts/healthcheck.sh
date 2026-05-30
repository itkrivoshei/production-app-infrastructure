#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

cd_project_root
require_command curl

check_url() {
  local name="$1"
  local url="$2"

  info "Checking ${name}: ${url}"

  if curl -fsS --max-time 5 "$url" >/dev/null; then
    success "${name} is healthy"
  else
    die "${name} health check failed: ${url}"
  fi
}

check_json_contains() {
  local name="$1"
  local url="$2"
  local expected="$3"

  info "Checking ${name}: ${url}"

  local response
  response="$(curl -fsS --max-time 5 "$url")"

  if [[ "$response" == *"$expected"* ]]; then
    success "${name} returned expected response"
  else
    error "Unexpected response from ${name}:"
    printf "%s\n" "$response"
    die "${name} did not contain expected text: $expected"
  fi
}

info "Running local stack health checks..."

check_url "Frontend through Nginx" "http://localhost:${NGINX_PORT}"
check_url "Nginx" "http://localhost:${NGINX_PORT}/nginx-health"
check_json_contains "API through Nginx" "http://localhost:${NGINX_PORT}/api/health" '"status":"ok"'
check_json_contains "API direct" "http://localhost:${API_PORT}/health" '"status":"ok"'

success "All health checks passed."
