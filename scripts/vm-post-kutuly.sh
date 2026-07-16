#!/usr/bin/env bash
set -euo pipefail

# Disable seed on future restarts
STACK=/opt/apps/secrets/stack.env
sed -i 's/^KUTULY_RUN_SEED=.*/KUTULY_RUN_SEED=false/' "$STACK"

cd /opt/apps/hasanvuralcom/deploy/gce
COMPOSE=(docker compose --env-file /opt/apps/secrets/stack.env -f docker-compose.yml -f docker-compose.edura.yml -f docker-compose.kutuly.yml)

# Recreate API with RUN_SEED=false (no reseed)
"${COMPOSE[@]}" up -d --force-recreate kutuly-api

sleep 12
echo "==== container health ===="
docker inspect -f '{{.Name}} {{.State.Status}}' hvworkcloud2-apps-kutuly-api-1 hvworkcloud2-apps-kutuly-web-1 hvworkcloud2-apps-caddy-1

echo "==== local http api ===="
curl -sS -H "Host: kutuly.com" http://127.0.0.1/api/health || true
echo
echo "==== local https api ===="
curl -skS https://kutuly.com/api/health || true
echo
echo "==== local https home ===="
curl -skS -o /dev/null -w "https_home=%{http_code}\n" https://kutuly.com/ || true

# Commit deploy files into hasanvuralcom if clean enough
cd /opt/apps/hasanvuralcom
git add deploy/gce/Caddyfile deploy/gce/docker-compose.kutuly.yml deploy/gce/mysql/init/05-kutuly.sql deploy/gce/scripts/deploy-all.sh || true
if ! git diff --cached --quiet; then
  git commit -m "Add Kutuly VPS compose overlay and Caddy host."
  git push || true
fi

echo DONE
