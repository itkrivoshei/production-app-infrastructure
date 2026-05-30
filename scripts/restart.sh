#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-}"

if [ -z "$SERVICE" ]; then
  docker compose restart
else
  docker compose restart "$SERVICE"
fi
