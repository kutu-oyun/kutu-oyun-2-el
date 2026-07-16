# GCE VPS migration — kronolojik günlük

**Kaynak hesap (export):** foodistopia@gmail.com  
**Hedef hesap:** hvworkcloud2@gmail.com  
**Mimari:** Tek VM (`apps-vm`) + Docker Compose + Caddy + MySQL  
**Static IP:** `207.175.26.150`

Bu dosya tüm migration adımlarının **tarih/saat bazlı** kaydıdır. Diğer projelerin `docs/` klasörlerine kopyalanacak **ana referans** burasıdır.

---

## 2026-06-25 — Dokümantasyon ve iskelet

| Saat (UTC) | Adım | Detay |
|------------|------|--------|
| — | docs-scaffold | `general-deployment-logic-Hasan.md` Bölüm 12 (GCE VPS); `gce-vps-migration-runbook.md`, `domain-mapping-cleanup-checklist.md`, `cutover-checklist.md` |
| — | deploy-gce-scaffold | `deploy/gce/`: compose, Caddyfile, setup-vm.sh, backup/deploy/export scriptleri |
| — | gcp-foundation | Proje `project-3d78acd3-8c14-4744-a1a`; VM e2-standard-4; IP `207.175.26.150`; firewall 80/443/22; snapshot; budget ~₺10k |
| — | data-export | 3× Cloud SQL → GCS; Godiva/Edura GCS sync; secret envanteri → `stack.env` |
| ~16:48 UTC | vm-bootstrap (ilk) | BHM, Godiva, hasanvural.com build+up; 3 DB import; Edura repo yok |

---

## 2026-06-27 — Edura repo + hasanvural.com GitHub

| Saat (UTC) | Adım | Detay |
|------------|------|--------|
| — | Edura repo düzeltmesi | Doğru repo: **`Edura-Academy/edura`** (Hasan-Vural/edura yok); `clone-repos.sh` güncellendi |
| — | hasanvural.com GitHub | Private repo: `git@github.com:Hasan-Vural/hasanvuralcom.git`; kök `.gitignore` + initial push |
| — | Caddy Edura | `myedura.com` routing; `docker-compose.edura.yml` (frontend/backend Dockerfile’ları repo içinden) |

---

## 2026-06-29 — Full stack + DNS cutover

| Saat (UTC) | Adım | Detay |
|------------|------|--------|
| ~09:28–09:34 | Edura VM deploy | Tarball upload; edura-api/web build (~6 dk); container up |
| ~09:50 | Caddy BHM | `bhmcontrol.com` Caddyfile’a eklendi |
| ~10:11–10:13 | DNS propagasyon | Google DNS 8.8.8.8: 4 domain → `207.175.26.150` |
| ~10:13 | SSL | Caddy restart; Let's Encrypt/ZeroSSL; VM’den HTTPS **200** (godiva, edura, hasan, bhm) |
| — | Namecheap cutover | Kullanıcı: godivaelix.com, myedura.com, hasanvural.com, bhmcontrol.com A/CNAME güncellendi |
| — | Domain mapping | Kullanıcı: eski Cloud Run mapping’leri sildi (godiva, edura) |
| — | Deploy keys | 4× ed25519 on VM; docs: `vm-github-deploy-keys.md` |

---

## Güncel prod durumu (2026-06-29)

| Domain | VM servis | DNS | HTTPS |
|--------|-----------|-----|-------|
| godivaelix.com | godiva-api/web | 207.175.26.150 | ✅ |
| myedura.com | edura-api/web | 207.175.26.150 | ✅ |
| hasanvural.com | hasanvuralcom-api/web | 207.175.26.150 | ✅ |
| api.hasanvural.com | hasanvuralcom-api | 207.175.26.150 | ✅ |
| bhmcontrol.com | bhm-api/web | 207.175.26.150 | ✅ |
| kutuly.com | kutuly-api/web | 207.175.26.150 | ✅ (2026-07-16) |

**Deploy modeli:** Cloud Build yok → `git push` + VM’de `deploy/gce/scripts/deploy-all.sh`

---

## Bekleyen adımlar

| Ne zaman | Adım |
|----------|------|
| **Şimdi** | GitHub'a 4 deploy key ekle → VM'de `setup-vm-git-remotes.sh` |
| Cutover sonrası | `decommission-foodistopia.ps1 -StopOnly -ConfirmCutover` |
| +7 gün | `-DeleteResources`; foodistopia projelerini sil |
| İsteğe bağlı | GitHub Actions → otomatik deploy |

---

## İlgili dosyalar (hasanvuralcom repo)

| Dosya | Açıklama |
|-------|----------|
| [general-deployment-logic.md](./general-deployment-logic.md) | Cloud Run (legacy) + GCE VPS (Bölüm 12) |
| [gce-vps-migration-runbook.md](./gce-vps-migration-runbook.md) | Adım adım komutlar |
| [cutover-checklist.md](./cutover-checklist.md) | Cutover checklist |
| [cutover-user-steps.md](./cutover-user-steps.md) | Kullanıcı adımları |
| [namecheap-dns-cutover.md](./namecheap-dns-cutover.md) | Namecheap DNS tablosu |
| [domain-mapping-cleanup-checklist.md](./domain-mapping-cleanup-checklist.md) | Mapping silme |
| [genel-hosting-mantigi-vps-hibrit-ve-secimler.md](./genel-hosting-mantigi-vps-hibrit-ve-secimler.md) | Hosting kararı |
| `deploy/gce/migration/migration-status.md` | Altyapı özeti |
| `deploy/gce/migration/github-repos.md` | Repo URL’leri |
| `deploy/gce/migration/export-inventory.md` | SQL/GCS export |
| `deploy/gce/migration/decommission-guide.md` | foodistopia kapatma |

---

## 2026-07-04 — Edura DB: Cloud SQL referansı kaldırıldı (local dev)

| Saat (UTC) | Adım | Detay |
|------------|------|--------|
| — | prod teyit | `myedura.com/api/health` → 200; VPS MySQL `edura` DB, **1585** kullanıcı |
| — | local dev | `backend/.env` Cloud SQL IP (`34.140.20.220`) → VPS tunnel (`127.0.0.1:3308`); scriptler: `setup-local-vps-db.ps1`, `vps-db-tunnel.ps1`, VM `remote-mysql-proxy.sh` |
| — | docs | `docs/public/edura/vps-database.md`; diğer projeler için `docs-sync-guide.md` DB bölümü |

**Not:** Prod veritabanı 2026-06-25'ten beri VPS'te; bu adım local geliştirici ortamının aynı canonical DB'ye bağlanması içindir.

---

## 2026-06-30 — Docs birleştirme

| Saat (UTC) | Adım | Detay |
|------------|------|--------|
| 2026-06-30 | Edura `/demo` + `/presentation` redirect — main push; VM deploy bekliyor |

---

## Diğer projelere kopyalama

Bkz. [docs-sync-guide.md](./docs-sync-guide.md)

## 2026-07-16 — Kutuly (kutuly.com) hub kaydı + VPS yönü

| Saat (UTC) | Adım | Detay |
|------------|------|--------|
| ~19:30 | gcp-check | Hedef: hvworkcloud2 `apps-vm` RUNNING (`207.175.26.150`); `/opt/apps` içinde kutuly yok |
| ~19:30 | legacy | kutuli@gmail.com gcloud credential yok; free trial bitmiş — Cloud Run/SQL envanteri alınamadı |
| ~19:40 | docs-hub | `docs/public/kutuly/` + registry/config; GitHub `kutu-oyun/kutu-oyun-2-el` |
| — | sonraki | VM clone, compose/Caddy, MySQL `kutuly`, DNS cutover |

## 2026-07-16 — Kutuly VPS cutover (canlı)

| Saat (UTC) | Adım | Detay |
|------------|------|--------|
| ~21:45 | repo | Dockerfiles, `/api/health`, Next standalone; push `kutu-oyun/kutu-oyun-2-el` |
| ~21:50 | vm | `/opt/apps/kutuly` clone; MySQL DB/user; `docker-compose.kutuly.yml`; Caddy host |
| ~21:50 | data | `prisma db push` + seed (kategoriler, ürünler, bypass admin) |
| ~21:50 | gcs | `gs://hvworkcloud2-kutuly-uploads` |
| ~21:58 | verify | `https://kutuly.com/` **200**; `/api/health` **ok**; www 200 |
| — | dns | Namecheap A `@` → `207.175.26.150` (kullanıcı; cutover öncesi yapılmıştı) |
| — | open | Firebase/PayTR secrets henüz stack.env’de yok |

**Son güncelleme:** 2026-07-16
