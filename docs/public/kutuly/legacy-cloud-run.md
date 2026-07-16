# Kutuly — legacy Cloud Run / Cloud SQL / Vercel

**Durum:** Decommission / erişilemez. Free trial (kutuli@gmail.com) bitti.

## Eski hesap ve yığın

| Alan | Değer |
|------|--------|
| GCP hesap | kutuli@gmail.com |
| Hosting modeli | Cloud Run (backend) + Vercel (frontend) + Cloud SQL (MySQL) + GCS |
| Domain | kutuly.com |
| Repo dokümanları (kök) | `DEPLOYMENT.md`, `BRANCHES.md`, `DEPLOYMENT-CHECKS.md` |
| CI (repo) | `.github/workflows/deploy-backend-preview.yml`, `deploy-backend-production.yml` |

## Ne biliniyor (repo dokümanlarından)

- Backend: Docker → Cloud Run; env Cloud Run Variables & Secrets
- Frontend: Vercel; `NEXT_PUBLIC_API_URL` → Cloud Run API
- DB: Cloud SQL MySQL; Prisma `DATABASE_URL`
- Storage: GCS bucket (ör. `kutuly-uploads`)
- Branch: `feat/*` → Preview; `main` → Production (Vercel + Cloud Run)

## 2026-07-16 konsol kontrolü

| Kontrol | Sonuç |
|---------|--------|
| `gcloud` credentialed accounts | kutuli@gmail.com **yok** |
| Aktif gcloud hesap | hvworkcloud2@gmail.com |
| Eski Cloud Run / SQL envanteri | Trial bittiği için API ile listelenemedi |

## Geçiş notu

Yeni prod hedefi: **hvworkcloud2** üzerindeki ortak `apps-vm` (diğer sitelerle aynı VPS).  
Güncel plan: [`vps-notes.md`](./vps-notes.md)
