# DNS Cutover Checklist — Tek Gün (4 Site)

**Bakım penceresi:** ~30–60 dk  
**Hedef IP:** `207.175.26.150` (`apps-static-ip`, hvworkcloud2)

## Cutover öncesi (T-1)

- [x] VM'de tüm container'lar `healthy` / `running` (2026-06-25 bootstrap)
- [x] `curl -H "Host: ..."` ile smoke test — HTTP 308 (Caddy HTTPS redirect)
- [ ] Namecheap TTL → **5 min**
- [ ] Eski DNS kayıtları ekran görüntüsü / not (rollback)
- [ ] foodistopia Cloud Run URL'leri not edildi

## Domain → hedef

| Domain | Kayıt tipi | Hedef |
|--------|------------|--------|
| godivaelix.com | A (@) | Static IP |
| www.godivaelix.com | CNAME veya A | Static IP / @ |
| myedura.com | A (@) | Static IP |
| www.myedura.com | CNAME | @ |
| hasanvural.com | A (@) | Static IP |
| www.hasanvural.com | CNAME | @ |
| api.hasanvural.com | A veya CNAME | Static IP |

BHM: özel domain yoksa cutover dışı; `.run.app` kullanıcıları bilgilendir.

## Cutover (T0)

1. [ ] DNS kayıtlarını güncelle
2. [ ] 5–15 dk bekle (propagasyon)
3. [ ] `https://godivaelix.com` — ana sayfa + API
4. [ ] `https://myedura.com/demo` — ürün tanıtımı (eski `/presentation` → redirect)
5. [ ] `https://hasanvural.com` — ana sayfa + API health
6. [ ] Caddy log: SSL sertifikaları OK
7. [ ] `decommission-foodistopia.ps1 -StopOnly -ConfirmCutover` (DNS VM'e gittikten sonra)

Helper: `deploy/gce/scripts/run-cutover.ps1`

## Rollback

1. Namecheap'te eski A/CNAME kayıtlarını geri yükle
2. foodistopia Cloud Run servislerini tekrar scale up (gerekirse)

## Cutover sonrası (T+1)

- [ ] 24 saat log taraması
- [ ] Domain mapping temizliği planla ([domain-mapping-cleanup-checklist.md](./domain-mapping-cleanup-checklist.md))
