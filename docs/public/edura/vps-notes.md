# Edura — VPS notları

- **Domain:** myedura.com
- **VM path:** `/opt/apps/edura`
- **GitHub:** `Edura-Academy/edura`
- **Compose overlay:** `docker-compose.edura.yml` (hasanvuralcom repo `deploy/gce/` içinde)
- **DB:** `edura` (MySQL container, VM üzerinde) — **canonical prod**; bkz. [vps-database.md](./vps-database.md)
- **Deploy:** VM'de `git pull` + `docker compose` build/up (Cloud Build yok — bkz. migration log)

## Güncel prod (2026-06-29)

| Alan | Değer |
|------|-------|
| DNS | `207.175.26.150` (Namecheap A kaydı) |
| HTTPS | Caddy + Let's Encrypt ✅ |
| Eski model | Cloud Run (`foodistopia-edura`) — decommission bekliyor |

## Deploy (VM)

```bash
cd /opt/apps/edura
git pull
# deploy/gce scriptleri hasanvuralcom repo'sundan veya overlay ile
docker compose -f docker-compose.yml -f docker-compose.edura.yml build edura-api edura-web
docker compose -f docker-compose.yml -f docker-compose.edura.yml up -d edura-api edura-web
```

## İlgili dosyalar (bu repo)

| Dosya | Açıklama |
|-------|----------|
| [canli-sorun-giderme.md](./canli-sorun-giderme.md) | Canlı sorun giderme |
| [vps-database.md](./vps-database.md) | VPS MySQL — canonical DB + local tunnel |
| [cloud-sql-database-url.md](./cloud-sql-database-url.md) | Cloud SQL URL (**legacy** — kullanmayın) |
| [FIREBASE_STORAGE.md](./FIREBASE_STORAGE.md) | Storage entegrasyonu |

## Demo sayfası

- **URL:** https://myedura.com/demo
- **Kod:** `frontend/src/app/[locale]/demo/page.tsx`
- **Durum:** Video placeholder + mock arayüz önizlemeleri (video sonra eklenecek)
- **Login linki:** `/login` altında "Platform tanıtımı" → `/demo`

## Aksiyon günlüğü

| Tarih (UTC) | Özet |
|-------------|------|
| 2026-07-04 | Local dev DB: Cloud SQL IP kaldırıldı → VPS MySQL (SSH tunnel); `vps-database.md` |
| 2026-06-30 | `/demo` canlıya alındı (main push); `/presentation` → `/demo` redirect |
| 2026-06-29 | DNS cutover tamamlandı; myedura.com → VM HTTPS 200 |
| 2026-06-29 | Edura tarball deploy; edura-api/web container up |

Genel migration adımları: [`../../general/gce-vps-migration-log.md`](../../general/gce-vps-migration-log.md)
