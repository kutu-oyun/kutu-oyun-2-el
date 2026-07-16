# Proje kaydı — docs eşlemesi

Her projenin GitHub görünürlüğü, VM yolu ve dokümantasyon klasörü.

| Proje | GitHub repo | Görünürlük | Domain | VM path | Docs yolu |
|-------|-------------|------------|--------|---------|-----------|
| Edura | `Edura-Academy/edura` | **public** (org) | myedura.com | `/opt/apps/edura` | `docs/public/edura/` |
| hasanvural.com | `Hasan-Vural/hasanvuralcom` | **private** | hasanvural.com | `/opt/apps/hasanvuralcom` | `docs/private/hasanvuralcom/` |
| BHM Control | `Hasan-Vural/bhmcontrol` | **private** | bhmcontrol.com | `/opt/apps/bhmcontrol` | `docs/private/bhmcontrol/` |
| Godiva Elix | `Hasan-Vural/godiva-elix` | **private** | godivaelix.com | `/opt/apps/godiva-elix` | `docs/private/godiva-elix/` |
| Kutuly | `kutu-oyun/kutu-oyun-2-el` | **public** (org) | kutuly.com | `/opt/apps/kutuly` *(plan)* | `docs/public/kutuly/` |

## Ortak altyapı

| Öğe | Değer |
|-----|-------|
| VM | `apps-vm` (GCE) |
| Static IP | `207.175.26.150` |
| Hedef GCP hesap | hvworkcloud2@gmail.com |
| Eski hesap (decommission) | foodistopia@gmail.com |
| Eski hesap (Kutuly legacy) | kutuli@gmail.com (free trial bitti) |
| Reverse proxy | Caddy + Docker Compose |

## Public vs private kuralı

- **`docs/general/`** — Tüm repolarda aynı; public repolarda commit edilir.
- **`docs/public/{proje}/`** — Public repolarda commit edilir.
- **`docs/private/`** — Yalnızca private repolarda commit edilir; public repolarda `.gitignore` ile hariç tutulur.

## Deploy key referansı

Bkz. [`general/vm-github-deploy-keys.md`](./general/vm-github-deploy-keys.md)
