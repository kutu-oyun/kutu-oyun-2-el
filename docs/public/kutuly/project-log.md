# Kutuly — proje günlüğü

Yeni kayıtlar bu dosyaya + ortak altyapı için hub [`../../general/gce-vps-migration-log.md`](../../general/gce-vps-migration-log.md).

---

## Proje özeti

| Alan | Değer |
|------|--------|
| GitHub | `kutu-oyun/kutu-oyun-2-el` (public) |
| Domain | kutuly.com |
| **Hedef prod** | GCE VPS — hvworkcloud2, `/opt/apps/kutuly` |
| Legacy | Cloud Run + Vercel + Cloud SQL — kutuli@gmail.com (trial bitti) |
| Stack | Next.js frontend · Express/Prisma backend · MySQL · Firebase · PayTR · GCS |

---

## Kayıtlar

### 2026-07-17 — docs yeri netleştirme + oturum log

- **Kural teyidi:** Kutuly public → docs yalnızca `docs/public/kutuly/`. `docs/private/` altında kutuly klasörü **yok** (ve açılmayacak).
- **Index:** `docs/public/README.md` Kutuly eklendi; `docs/private/README.md` “public projeler buraya değil” notu güncellendi.
- **Repo durumu (WIP, henüz VPS’e taşınmadı):** GitHub Actions Cloud Run preview/production workflow’ları; guest/bypass auth; admin kullanıcı/sipariş sayfaları; ödeme sayfası; PayTR / Firebase / storage dokunuşları — hedef prod hâlâ GCE VPS (`vps-notes.md`).
- **Sonraki:** VPS path + Caddy + MySQL; legacy Cloud Run rehberi (`DEPLOYMENT.md`) ile hedef VPS ayrımını kod deploy’unda net tut.

### 2026-07-16 — website-logic hub + VPS yönü

- **GCP (hedef):** `hvworkcloud2@gmail.com` → proje `hvworkcloud2-apps` (`project-3d78acd3-8c14-4744-a1a`)
- **VM:** `apps-vm` RUNNING · IP `207.175.26.150` · Ubuntu 24.04 · 80 GB
- **VM’de mevcut:** edura, godiva-elix, hasanvuralcom, bhmcontrol (+ mysql, caddy) — **kutuly yok**
- **GCP (eski):** kutuli@gmail.com credential yok; free trial bitmiş; Cloud Run/SQL envanteri alınamadı
- **Docs:** `docs/public/kutuly/` oluşturuldu; proje `docs-hub.config.json` + `projects-registry.md` kaydı
- **Sonraki:** VM clone, compose/Caddy, DB, DNS cutover (bkz. [`vps-notes.md`](./vps-notes.md))

---

## Sonraki adımlar (açık)

- [ ] `/opt/apps/kutuly` + deploy key
- [ ] Docker Compose + Caddy (kutuly.com)
- [ ] MySQL `kutuly` + veri taşıma / seed
- [ ] Env (Firebase, PayTR, GCS) VPS’e
- [ ] DNS cutover → `207.175.26.150`
- [ ] Legacy Vercel / Cloud Run temizliği (erişilebilirse)
