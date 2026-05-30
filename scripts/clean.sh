#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

cd_project_root
require_docker

FORCE="${1:-}"

if [[ "$FORCE" != "--force" ]]; then
  warn "This will stop the local project stack and remove project volumes/orphans."
  warn "It will NOT run docker system prune."
  printf "Continue? [y/N] "

  read -r answer

  case "$answer" in
    y | Y | yes | YES)
      ;;
    *)
      info "Cancelled."
      exit 0
      ;;
  esac
fi

info "Stopping and cleaning local Docker Compose stack..."
compose down --volumes --remove-orphans

success "Project Docker Compose stack cleaned."
