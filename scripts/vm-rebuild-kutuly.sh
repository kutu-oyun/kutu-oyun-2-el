#!/usr/bin/env bash
set -euo pipefail

git -C /opt/apps/kutuly pull --ff-only

cd /opt/apps/hasanvuralcom/deploy/gce
COMPOSE=(docker compose --env-file /opt/apps/secrets/stack.env -f docker-compose.yml -f docker-compose.edura.yml -f docker-compose.kutuly.yml)

"${COMPOSE[@]}" build kutuly-api kutuly-web
"${COMPOSE[@]}" up -d kutuly-api kutuly-web
"${COMPOSE[@]}" up -d --force-recreate caddy

sleep 20
"${COMPOSE[@]}" ps kutuly-api kutuly-web caddy

echo "==== API LOGS ===="
docker logs --tail 80 hvworkcloud2-apps-kutuly-api-1 || true
echo "==== WEB LOGS ===="
docker logs --tail 40 hvworkcloud2-apps-kutuly-web-1 || true
echo "==== SMOKE ===="
curl -sS -H "Host: kutuly.com" http://127.0.0.1/api/health || true
echo
curl -sS -o /dev/null -w "home=%{http_code}\n" -H "Host: kutuly.com" http://127.0.0.1/ || true
