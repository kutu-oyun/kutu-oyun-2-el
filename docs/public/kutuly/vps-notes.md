# Kutuly — VPS notları (güncel prod)

| Alan | Değer |
|------|--------|
| **Domain** | kutuly.com |
| **VM path** | `/opt/apps/kutuly` |
| **GitHub** | `kutu-oyun/kutu-oyun-2-el` (public org) |
| **GCP hesap** | hvworkcloud2@gmail.com |
| **GCP proje** | `project-3d78acd3-8c14-4744-a1a` (`hvworkcloud2-apps`) |
| **VM** | `apps-vm` · `europe-west1-b` · `e2-standard-4` |
| **Static IP** | `207.175.26.150` (ortak) |
| **Reverse proxy** | Caddy + Docker Compose |
| **Compose overlay** | `hasanvuralcom/deploy/gce/docker-compose.kutuly.yml` |
| **DB** | MySQL (Docker), database `kutuly` (seed ile kuruldu) |
| **GCS** | `gs://hvworkcloud2-kutuly-uploads` |
| **Eski GCP** | kutuli@gmail.com — free trial bitti |
| **Deploy** | `deploy/gce/scripts/deploy-all.sh` veya compose overlay build/up |

## Trafik

```
Internet → DNS A → 207.175.26.150 → Caddy → kutuly-web / kutuly-api
```

## Mevcut durum (2026-07-16)

| Öğe | Durum |
|-----|--------|
| Hub docs kaydı | ✅ |
| VM `/opt/apps/kutuly` | ✅ |
| Caddy host kutuly.com | ✅ |
| MySQL DB `kutuly` + seed | ✅ |
| DNS → VPS IP | ✅ |
| HTTPS `https://kutuly.com/` | ✅ 200 |
| API `https://kutuly.com/api/health` | ✅ ok |
| Firebase / PayTR secrets | ⚠️ henüz stack.env’e eklenmedi (mock/fallback) |

## Deploy (VM)

```bash
cd /opt/apps/hasanvuralcom/deploy/gce
git -C /opt/apps/kutuly pull --ff-only
docker compose --env-file /opt/apps/secrets/stack.env \
  -f docker-compose.yml -f docker-compose.edura.yml -f docker-compose.kutuly.yml \
  build kutuly-api kutuly-web
docker compose --env-file /opt/apps/secrets/stack.env \
  -f docker-compose.yml -f docker-compose.edura.yml -f docker-compose.kutuly.yml \
  up -d kutuly-api kutuly-web caddy
```

## Aksiyon günlüğü

| Tarih (UTC) | Özet |
|-------------|------|
| 2026-07-16 | Hub kaydı; VPS henüz yok |
| 2026-07-16 ~21:58 | Cutover tamam: clone, compose, Caddy, MySQL seed, HTTPS 200 |

## İlgili belgeler

- Legacy Cloud Run: [`legacy-cloud-run.md`](./legacy-cloud-run.md)
- Proje günlüğü: [`project-log.md`](./project-log.md)
- Ortak migration log: [`../../general/gce-vps-migration-log.md`](../../general/gce-vps-migration-log.md)
