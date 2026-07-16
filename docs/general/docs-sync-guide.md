# Docs senkronizasyon — diğer projelere kopyalama

**Canonical kaynak:** `Edura-Academy/edura` → `docs/`

Diğer projelerin kök `docs/` klasörlerine aşağıdaki yapıyı kopyala veya senkron et.

---

## Klasör yapısı (hedef)

```
docs/
  00-READ-FIRST.md
  projects-registry.md
  README.md
  general/          ← tüm repolarda aynı
  public/{proje}/   ← public repolarda commit
  private/          ← yalnızca private repolarda commit (public'te gitignore)
  stitch/           ← opsiyonel (hasanvural.com tasarım)
```

---

## Tüm repolarda ortak (`docs/general/`)

```
general/
  general-deployment-logic.md
  gce-vps-migration-log.md          ← tarih/saat günlük (ANA REFERANS)
  gce-vps-migration-runbook.md
  genel-hosting-mantigi-vps-hibrit-ve-secimler.md
  cutover-checklist.md
  cutover-user-steps.md
  namecheap-dns-cutover.md
  domain-mapping-cleanup-checklist.md
  vm-github-deploy-keys.md
  project-demo-page.md
  docs-sync-guide.md
  google-cloud-migration-plan.md    ← legacy referans
  google-cloud-migration-runbook.md
```

---

## Proje bazlı dosyalar

| Repo | Kopyalanacak klasör |
|------|---------------------|
| `Edura-Academy/edura` | `docs/public/edura/` + tüm `general/` |
| `Hasan-Vural/hasanvuralcom` | `docs/private/hasanvuralcom/` + tüm `general/` + `stitch/` |
| `Hasan-Vural/bhmcontrol` | `docs/private/bhmcontrol/` + tüm `general/` |
| `Hasan-Vural/godiva-elix` | `docs/private/godiva-elix/` + tüm `general/` |
| `kutu-oyun/kutu-oyun-2-el` | `docs/public/kutuly/` + tüm `general/` |

Private repolarda `docs/private/` **commit edilir**. Public repolarda `.gitignore`:

```
docs/private/
```

---

## Güncelleme kuralı

1. Değişiklik → proje `docs/` güncelle
2. Genel altyapı → `general/gce-vps-migration-log.md`'ye tarih/saat satırı
3. Oturum sonu → `scripts/docs-push.ps1` (merkezi `Hasan-Vural/website-logic`)
4. Yeni oturum → `scripts/docs-pull.ps1` (`bismillah docsa bak, güncel başla`)

---

## Veritabanı olan projeler — VPS geçişi

Cloud Run / Cloud SQL kullanan bir proje **VPS cutover** yaptıysa:

| Adım | Ne yapılır |
|------|------------|
| 1 | Prod dump Cloud SQL → VM MySQL import (runbook §3) |
| 2 | Prod `DATABASE_URL` → `mysql://...@mysql:3306/{db}` (`stack.env`) |
| 3 | Proje `docs/` altına `{proje}/vps-database.md` — tarih, DB adı, local tunnel |
| 4 | `gce-vps-migration-log.md` — tarih/saat satırı |
| 5 | Local `.env` — eski Cloud SQL IP/host **kaldır**; tunnel scriptleri (Edura örneği: `scripts/setup-local-vps-db.ps1`) |
| 6 | VM bir kez: `scripts/remote-mysql-proxy.sh` (MySQL docker ağı üzerinden tunnel) |

**Edura (2026-07-04):** Prod zaten VPS (`edura` DB, 2026-06-25 import). Local dev geçişi tamamlandı → [public/edura/vps-database.md](../public/edura/vps-database.md)

Diğer projeler (DB varsa): BHM `bakim_destek`, Godiva `Godiva`, hasanvuralcom `hasanvuralcom`, Kutuly `kutuly` (plan) — aynı VM MySQL container, proje bazlı DB adı.

**Son senkron:** 2026-07-16
