#!/bin/sh
set -e

echo "==> Prisma generate"
npx prisma generate

echo "==> Prisma db push (no migrations folder)"
npx prisma db push --skip-generate

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "==> Running seed"
  npx tsx prisma/seed.ts
fi

echo "==> Starting API on PORT=${PORT:-8080}"
exec node dist/index.js
