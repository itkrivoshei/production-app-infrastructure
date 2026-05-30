#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-}"

if [ -z "$SERVICE" ]; then
  docker compose logs -f
else
  docker compose logs -f "$SERVICE"
fi
