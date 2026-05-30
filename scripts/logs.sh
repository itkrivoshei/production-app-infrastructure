#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

cd_project_root
require_docker

SERVICE="${1:-}"
TAIL_LINES="${TAIL_LINES:-100}"

validate_service_or_empty "$SERVICE"

if [[ -z "$SERVICE" ]]; then
  info "Streaming logs for all services..."
  compose logs -f --tail="$TAIL_LINES"
else
  info "Streaming logs for service: $SERVICE"
  compose logs -f --tail="$TAIL_LINES" "$SERVICE"
fi
