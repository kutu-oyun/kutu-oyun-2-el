#!/usr/bin/env bash
set -euo pipefail

APPS_ROOT=/opt/apps
DEPLOY_GCE="$APPS_ROOT/hasanvuralcom/deploy/gce"
STACK_ENV=/opt/apps/secrets/stack.env

echo "==> Clone / update kutuly repo"
if [[ ! -d "$APPS_ROOT/kutuly/.git" ]]; then
  git clone https://github.com/kutu-oyun/kutu-oyun-2-el.git "$APPS_ROOT/kutuly"
else
  git -C "$APPS_ROOT/kutuly" pull --ff-only || true
fi

echo "==> MySQL init SQL (for fresh mysql volumes)"
cat > "$DEPLOY_GCE/mysql/init/05-kutuly.sql" <<'SQL'
CREATE DATABASE IF NOT EXISTS kutuly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SQL

echo "==> docker-compose.kutuly.yml"
cat > "$DEPLOY_GCE/docker-compose.kutuly.yml" <<'YAML'
# Overlay:
# docker compose --env-file /opt/apps/secrets/stack.env \
#   -f docker-compose.yml -f docker-compose.edura.yml -f docker-compose.kutuly.yml up -d

services:
  kutuly-api:
    build:
      context: ${APPS_ROOT}/kutuly/backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      DATABASE_URL: ${KUTULY_DATABASE_URL}
      JWT_SECRET: ${KUTULY_JWT_SECRET}
      JWT_EXPIRES_IN: 24h
      PORT: "8080"
      FRONTEND_URL: ${KUTULY_FRONTEND_URL:-https://kutuly.com}
      GCS_PROJECT_ID: ${KUTULY_GCS_PROJECT_ID:-}
      GCS_BUCKET_NAME: ${KUTULY_GCS_BUCKET_NAME:-}
      FIREBASE_PROJECT_ID: ${KUTULY_FIREBASE_PROJECT_ID:-}
      FIREBASE_CLIENT_EMAIL: ${KUTULY_FIREBASE_CLIENT_EMAIL:-}
      FIREBASE_PRIVATE_KEY: ${KUTULY_FIREBASE_PRIVATE_KEY:-}
      PAYTR_MERCHANT_ID: ${KUTULY_PAYTR_MERCHANT_ID:-}
      PAYTR_MERCHANT_KEY: ${KUTULY_PAYTR_MERCHANT_KEY:-}
      PAYTR_MERCHANT_SALT: ${KUTULY_PAYTR_MERCHANT_SALT:-}
      RUN_SEED: ${KUTULY_RUN_SEED:-false}
      NODE_ENV: production
    depends_on:
      mysql:
        condition: service_healthy
    mem_limit: 768m

  kutuly-web:
    build:
      context: ${APPS_ROOT}/kutuly/frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${KUTULY_NEXT_PUBLIC_API_URL:-https://kutuly.com/api}
        NEXT_PUBLIC_SOCKET_URL: ${KUTULY_NEXT_PUBLIC_SOCKET_URL:-https://kutuly.com}
        NEXT_PUBLIC_FIREBASE_API_KEY: ${KUTULY_NEXT_PUBLIC_FIREBASE_API_KEY:-}
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${KUTULY_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:-}
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${KUTULY_NEXT_PUBLIC_FIREBASE_PROJECT_ID:-}
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${KUTULY_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:-}
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${KUTULY_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:-}
        NEXT_PUBLIC_FIREBASE_APP_ID: ${KUTULY_NEXT_PUBLIC_FIREBASE_APP_ID:-}
    restart: unless-stopped
    mem_limit: 1g

  caddy:
    depends_on:
      - kutuly-api
      - kutuly-web
YAML

echo "==> Caddyfile kutuly block"
if ! grep -q 'kutuly.com' "$DEPLOY_GCE/Caddyfile"; then
  cat >> "$DEPLOY_GCE/Caddyfile" <<'CADDY'

# Kutuly
kutuly.com, www.kutuly.com {
	@api path /api/*
	handle @api {
		reverse_proxy kutuly-api:8080
	}
	handle {
		reverse_proxy kutuly-web:8080
	}
}
CADDY
fi

echo "==> Ensure stack.env Kutuly vars"
ROOT_PW=$(grep -E '^MYSQL_ROOT_PASSWORD=' "$STACK_ENV" | cut -d= -f2-)
if [[ -z "$ROOT_PW" ]]; then
  echo "MYSQL_ROOT_PASSWORD missing in stack.env" >&2
  exit 1
fi

KUTULY_DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 28)
KUTULY_JWT=$(openssl rand -base64 48 | tr -d '/+=' | head -c 48)

# Remove old KUTULY_ lines then append
grep -v -E '^KUTULY_' "$STACK_ENV" > "${STACK_ENV}.tmp" || true
mv "${STACK_ENV}.tmp" "$STACK_ENV"

{
  echo "KUTULY_DATABASE_URL=mysql://kutuly_app:${KUTULY_DB_PASS}@mysql:3306/kutuly"
  echo "KUTULY_JWT_SECRET=${KUTULY_JWT}"
  echo "KUTULY_FRONTEND_URL=https://kutuly.com"
  echo "KUTULY_NEXT_PUBLIC_API_URL=https://kutuly.com/api"
  echo "KUTULY_NEXT_PUBLIC_SOCKET_URL=https://kutuly.com"
  echo "KUTULY_GCS_PROJECT_ID=project-3d78acd3-8c14-4744-a1a"
  echo "KUTULY_GCS_BUCKET_NAME=hvworkcloud2-kutuly-uploads"
  echo "KUTULY_RUN_SEED=true"
} >> "$STACK_ENV"
chmod 600 "$STACK_ENV"

echo "==> Create MySQL database + user (running mysql)"
docker exec -i hvworkcloud2-apps-mysql-1 mysql -uroot -p"$ROOT_PW" <<SQL
CREATE DATABASE IF NOT EXISTS kutuly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'kutuly_app'@'%' IDENTIFIED BY '${KUTULY_DB_PASS}';
ALTER USER 'kutuly_app'@'%' IDENTIFIED BY '${KUTULY_DB_PASS}';
GRANT ALL PRIVILEGES ON kutuly.* TO 'kutuly_app'@'%';
FLUSH PRIVILEGES;
SQL

echo "==> GCS bucket (ignore if exists)"
gcloud storage buckets describe gs://hvworkcloud2-kutuly-uploads --project=project-3d78acd3-8c14-4744-a1a >/dev/null 2>&1 \
  || gcloud storage buckets create gs://hvworkcloud2-kutuly-uploads --location=europe-west1 --project=project-3d78acd3-8c14-4744-a1a || true

echo "==> Update deploy-all.sh for kutuly + overlays"
cat > "$DEPLOY_GCE/scripts/deploy-all.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Pull latest repos (if git remotes configured)"
for repo in hasanvuralcom bhmcontrol godiva-elix edura kutuly; do
  if [[ -d "/opt/apps/$repo/.git" ]]; then
    git -C "/opt/apps/$repo" pull --ff-only || true
  fi
done

COMPOSE_FILES=(-f docker-compose.yml)
[[ -f docker-compose.edura.yml ]] && COMPOSE_FILES+=(-f docker-compose.edura.yml)
[[ -f docker-compose.kutuly.yml ]] && COMPOSE_FILES+=(-f docker-compose.kutuly.yml)

echo "==> Build & restart"
docker compose --env-file /opt/apps/secrets/stack.env "${COMPOSE_FILES[@]}" build
docker compose --env-file /opt/apps/secrets/stack.env "${COMPOSE_FILES[@]}" up -d --remove-orphans

echo "==> Smoke test localhost"
./scripts/smoke-test.sh || true
SH
chmod +x "$DEPLOY_GCE/scripts/deploy-all.sh"

echo "==> Build & up kutuly services"
cd "$DEPLOY_GCE"
COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.edura.yml -f docker-compose.kutuly.yml)
docker compose --env-file "$STACK_ENV" "${COMPOSE_FILES[@]}" build kutuly-api kutuly-web
docker compose --env-file "$STACK_ENV" "${COMPOSE_FILES[@]}" up -d kutuly-api kutuly-web
docker compose --env-file "$STACK_ENV" "${COMPOSE_FILES[@]}" up -d caddy

echo "==> Wait for API"
sleep 8
docker compose --env-file "$STACK_ENV" "${COMPOSE_FILES[@]}" ps kutuly-api kutuly-web caddy
docker logs --tail 40 hvworkcloud2-apps-kutuly-api-1 || true
docker logs --tail 20 hvworkcloud2-apps-kutuly-web-1 || true

echo "==> Local smoke"
curl -sS -o /dev/null -w "http_host=%{http_code}\n" -H "Host: kutuly.com" http://127.0.0.1/ || true
curl -sS -H "Host: kutuly.com" http://127.0.0.1/api/health || true
echo
echo "DONE"
