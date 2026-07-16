# Kutuly — VPS notları (hedef prod)

| Alan | Değer |
|------|--------|
| **Domain** | kutuly.com |
| **VM path** | `/opt/apps/kutuly` *(henüz oluşturulmadı)* |
| **GitHub** | `kutu-oyun/kutu-oyun-2-el` (public org) |
| **GCP hesap (hedef)** | hvworkcloud2@gmail.com |
| **GCP proje** | `project-3d78acd3-8c14-4744-a1a` (`hvworkcloud2-apps`) |
| **VM** | `apps-vm` · `europe-west1-b` · `e2-standard-4` |
| **Static IP** | `207.175.26.150` (ortak) |
| **Reverse proxy** | Caddy + Docker Compose (mevcut stack) |
| **DB (hedef)** | MySQL (Docker), database `kutuly` *(plan)* |
| **Eski GCP** | kutuli@gmail.com — **free trial bitti**; Cloud Run / Cloud SQL erişilemiyor |
| **Eski frontend** | Vercel (kutuly.com) |
| **Deploy modeli (hedef)** | SSH → `git pull` + `docker compose` build/up (Cloud Build yok) |

## Trafik (hedef)

```
Internet → DNS A → 207.175.26.150 → Caddy → kutuly-web / kutuly-api
```

## Mevcut durum (2026-07-16)

| Öğe | Durum |
|-----|--------|
| Hub docs kaydı | ✅ `public/kutuly/` |
| VM `/opt/apps/kutuly` | ❌ yok (edura, godiva, hasanvuralcom, bhmcontrol var) |
| Caddy host kutuly.com | ❌ henüz yok |
| MySQL DB `kutuly` | ❌ henüz yok |
| DNS → VPS IP | ❌ (muhtemelen hâlâ Vercel / eski) |
| Repo `docs/` sync | ✅ website-logic pull |

## Sonraki adımlar

1. VM’de `/opt/apps/kutuly` clone + deploy key
2. Docker Compose overlay (api/web) + Caddy site bloğu
3. MySQL `kutuly` DB + (mümkünse) eski Cloud SQL dump veya seed
4. GCS / Firebase / PayTR env’lerini `stack.env` / proje `.env` ile hizala
5. DNS cutover: kutuly.com → `207.175.26.150`
6. Eski Cloud Run / Vercel decommission (trial bittiği için kaynaklar zaten erişimsiz olabilir)

## Aksiyon günlüğü

| Tarih (UTC) | Özet |
|-------------|------|
| 2026-07-16 | website-logic hub entegrasyonu; GCP hedef (`hvworkcloud2`) ve legacy (`kutuli`) teyit; VPS’te kutuly henüz yok |

## İlgili belgeler

- Legacy Cloud Run: [`legacy-cloud-run.md`](./legacy-cloud-run.md)
- Proje günlüğü: [`project-log.md`](./project-log.md)
- Ortak migration log: [`../../general/gce-vps-migration-log.md`](../../general/gce-vps-migration-log.md)
- Runbook: [`../../general/gce-vps-migration-runbook.md`](../../general/gce-vps-migration-runbook.md)
