#!/usr/bin/env bash
set -euo pipefail

NGINX_PORT="${NGINX_PORT:-8088}"
API_PORT="${API_PORT:-8080}"

echo "Checking Nginx..."
curl -fsS "http://localhost:${NGINX_PORT}/nginx-health"

echo "Checking API through Nginx..."
curl -fsS "http://localhost:${NGINX_PORT}/api/health"

echo "Checking API directly..."
curl -fsS "http://localhost:${API_PORT}/health"

echo "All health checks passed."
