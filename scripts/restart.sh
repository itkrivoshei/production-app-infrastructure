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

info "Restarting service: $SERVICE"
compose restart "$SERVICE"

success "Service restarted: $SERVICE"
info "Current service status:"
compose ps "$SERVICE"
