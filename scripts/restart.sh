#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

cd_project_root
require_docker

SERVICE="${1:-}"

if [[ -z "$SERVICE" ]]; then
  die "Service name is required. Usage: ./scripts/restart.sh [api|web|nginx]"
fi

validate_service_or_empty "$SERVICE"

wait_for_service_health() {
  local service="$1"
  local container_id
  local has_healthcheck
  local health_status

  container_id="$(compose ps -q "$service")"

  if [[ -z "$container_id" ]]; then
    die "Could not find container for service: $service"
  fi

  has_healthcheck="$(docker inspect --format '{{if .State.Health}}true{{else}}false{{end}}' "$container_id")"

  if [[ "$has_healthcheck" != "true" ]]; then
    warn "Service ${service} does not define a container healthcheck"
    return 0
  fi

  info "Waiting for service to become healthy: $service"

  for attempt in $(seq 1 30); do
    health_status="$(docker inspect --format '{{.State.Health.Status}}' "$container_id" 2>/dev/null || true)"

    if [[ "$health_status" == "healthy" ]]; then
      success "Service is healthy: $service"
      return 0
    fi

    info "Service health is ${health_status:-unknown} (${attempt}/30)"
    sleep 2
  done

  compose logs --tail=80 "$service" >&2 || true
  die "Service did not become healthy after restart: $service"
}

info "Restarting service: $SERVICE"
compose restart "$SERVICE"
wait_for_service_health "$SERVICE"

success "Service restarted: $SERVICE"
info "Current service status:"
compose ps "$SERVICE"
