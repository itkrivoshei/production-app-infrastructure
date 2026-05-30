#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

cd_project_root
require_docker

MODE="${1:-up}"

case "$MODE" in
  up)
    info "Starting local Docker stack with rebuild..."
    compose up --build
    ;;
  detached | -d | --detach)
    info "Starting local Docker stack in detached mode with rebuild..."
    compose up --build -d
    success "Stack started in detached mode."
    info "Frontend: http://localhost:${NGINX_PORT}"
    info "API health: http://localhost:${NGINX_PORT}/api/health"
    ;;
  down)
    info "Stopping local Docker stack..."
    compose down
    success "Stack stopped."
    ;;
  *)
    die "Unknown mode: $MODE. Usage: ./scripts/dev.sh [up|detached|down]"
    ;;
esac
