# Kutuly — proje günlüğü

Yeni kayıtlar bu dosyaya + ortak altyapı için hub [`../../general/gce-vps-migration-log.md`](../../general/gce-vps-migration-log.md).

---

## Proje özeti

| Alan | Değer |
|------|--------|
| GitHub | `kutu-oyun/kutu-oyun-2-el` (public) |
| Domain | kutuly.com |
| **Güncel prod (2026-07-16+)** | GCE VPS — hvworkcloud2, `/opt/apps/kutuly` |
| Legacy | Cloud Run + Vercel + Cloud SQL — kutuli@gmail.com (trial bitti) |
| Stack | Next.js frontend · Express/Prisma backend · MySQL · Firebase · PayTR · GCS |

---

## Kayıtlar

### 2026-07-16 — website-logic hub + VPS yönü

- Hub `docs/public/kutuly/` oluşturuldu; GCP hedef teyit (`apps-vm`).

### 2026-07-16 ~21:58 UTC — VPS cutover tamam

- Repo Dockerfiles + `/api/health`; GitHub `main` push
- VM: `/opt/apps/kutuly` clone; MySQL `kutuly` + user; seed çalıştı
- `docker-compose.kutuly.yml` + Caddy `kutuly.com` / `www`
- GCS bucket `hvworkcloud2-kutuly-uploads`
- DNS zaten `207.175.26.150`; HTTPS 200 + `/api/health` ok
- `hasanvuralcom` deploy dosyaları push edildi
- Açık: Firebase/PayTR gerçek secret’ları `stack.env`’e

---

## Sonraki adımlar (açık)

- [ ] Firebase Admin + frontend `NEXT_PUBLIC_FIREBASE_*` → stack.env + rebuild web
- [ ] PayTR merchant bilgileri
- [ ] GCS signed URL için VM service account yetkisi doğrula
- [ ] Deploy key (şu an HTTPS clone; private olursa key gerekir)
