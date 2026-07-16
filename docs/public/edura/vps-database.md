# Edura — VPS veritabanı (canonical prod)

**Durum:** Canlı veritabanı **Cloud SQL değil**, VPS üzerindeki MySQL container’ıdır.  
**Son teyit / local dev geçişi:** **2026-07-04**

---

## Özet

| Alan | Değer |
|------|--------|
| Ortam | `apps-vm` (`207.175.26.150`) |
| MySQL container | `hvworkcloud2-apps-mysql-1` |
| Veritabanı adı | `edura` |
| İlk prod import | **2026-06-25** — Cloud SQL dump → GCS → VM import |
| DNS cutover | **2026-06-29** — `myedura.com` → VPS |
| Eski Cloud SQL IP | `34.140.20.220:3306` — **artık local/prod için kullanılmamalı** |

Prod API sağlık: `https://myedura.com/api/health` → `200`

---

## Veri bütünlüğü

2026-06-25 migration’ında Edura Cloud SQL dump’ı VM MySQL’e import edildi (bkz. [`gce-vps-migration-log.md`](../../general/gce-vps-migration-log.md)). Canlı site bu DB üzerinde çalışıyor.

**Local geliştirme** eski Cloud SQL IP’sine bağlanmamalı; aynı VPS verisini kullanmak için SSH tunnel kullanın (aşağıda).

---

## Local geliştirme (VPS DB)

### 1. Gcloud

```powershell
gcloud config configurations activate default
# hvworkcloud2@gmail.com + project-3d78acd3-8c14-4744-a1a
```

### 2. `.env` güncelle (bir kez)

```powershell
.\scripts\setup-local-vps-db.ps1
```

Bu script VPS’teki `edura-api` container’ından `DATABASE_URL` alır ve `backend/.env` içinde host’u `127.0.0.1:3308` yapar.

### 3. VM proxy (bir kez — zaten kuruluysa atla)

Tunnel, MySQL’e docker ağı üzerinden erişir. VM’de proxy yoksa:

```powershell
gcloud compute scp scripts/remote-mysql-proxy.sh apps-vm:/tmp/ --zone=europe-west1-b --project=project-3d78acd3-8c14-4744-a1a
gcloud compute ssh apps-vm --zone=europe-west1-b --project=project-3d78acd3-8c14-4744-a1a --command="bash /tmp/remote-mysql-proxy.sh"
```

### 4. Tunnel (her oturum)

Ayrı terminal:

```powershell
.\scripts\vps-db-tunnel.ps1
```

Pencere açık kalmalı. Sonra:

```powershell
cd backend
npm run dev
```

### 5. Migration (gerekirse)

Tunnel açıkken:

```powershell
cd backend
npx prisma migrate deploy
```

---

## Prod (VM)

- Secrets: `/opt/apps/secrets/stack.env` → `EDURA_DATABASE_URL`
- Docker iç URL: `mysql://...@mysql:3306/edura`
- Deploy notları: [vps-notes.md](./vps-notes.md)

---

## Legacy

Cloud Run / Cloud SQL dokümantasyonu yalnızca arşiv:

- [cloud-sql-database-url.md](./cloud-sql-database-url.md) — **legacy**, yeni kurulumda kullanmayın

---

## Aksiyon günlüğü

| Tarih (UTC) | Özet |
|-------------|------|
| 2026-07-04 | Local dev Cloud SQL → VPS tunnel; `setup-local-vps-db.ps1`, `vps-db-tunnel.ps1`; bu doküman |
| 2026-06-29 | Prod DNS + HTTPS VPS |
| 2026-06-25 | Cloud SQL → VM MySQL import (Edura dahil) |
