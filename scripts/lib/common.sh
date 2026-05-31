#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"

API_PORT="${API_PORT:-8080}"
NGINX_PORT="${NGINX_PORT:-8088}"
PROMETHEUS_PORT="${PROMETHEUS_PORT:-9090}"
GRAFANA_PORT="${GRAFANA_PORT:-3001}"

VALID_SERVICES=("api" "web" "nginx" "prometheus" "grafana")

info() {
  printf "\033[1;34m[INFO]\033[0m %s\n" "$*"
}

success() {
  printf "\033[1;32m[OK]\033[0m %s\n" "$*"
}

warn() {
  printf "\033[1;33m[WARN]\033[0m %s\n" "$*"
}

error() {
  printf "\033[1;31m[ERROR]\033[0m %s\n" "$*" >&2
}

die() {
  error "$*"
  exit 1
}

cd_project_root() {
  cd "$PROJECT_ROOT"
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    die "Required command not found: $command_name"
  fi
}

require_docker() {
  require_command docker

  if ! docker compose version >/dev/null 2>&1; then
    die "Docker Compose v2 is required. Expected command: docker compose"
  fi

  if ! docker info >/dev/null 2>&1; then
    die "Docker daemon is not running or not reachable. Start Docker and try again."
  fi
}

is_valid_service() {
  local service="${1:-}"

  for valid_service in "${VALID_SERVICES[@]}"; do
    if [[ "$service" == "$valid_service" ]]; then
      return 0
    fi
  done

  return 1
}

validate_service_or_empty() {
  local service="${1:-}"

  if [[ -z "$service" ]]; then
    return 0
  fi

  if ! is_valid_service "$service"; then
    die "Invalid service: $service. Valid services: ${VALID_SERVICES[*]}"
  fi
}

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}
