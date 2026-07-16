# Domain Mapping Temizlik Checklist

Bu checklist, **cutover tamamlandıktan sonra** eski GCP hesaplarındaki Cloud Run domain mapping kayıtlarını güvenli şekilde silmek içindir. Her adım **yeni VM 24 saat stabil** olduktan sonra ve **sen onayladıktan sonra** uygulanır.

## Önkoşullar

- [x] Yeni VM (hvworkcloud2) üzerinde ilgili domain Caddy routing OK (2026-06-25 smoke test, HTTP 308)
- [ ] DNS kayıtları Static IP'ye (`207.175.26.150`) yönlendirilmiş ve propagasyon tamam.
- [ ] Eski Cloud Run URL'leri not edildi (rollback için).

## Envanter komutları

Otomatik tarama:

```powershell
cd deploy\gce\scripts
.\inventory-domain-mappings.ps1
# Çıktı: deploy\gce\migration\domain-mapping-inventory-YYYYMMDD.txt
```

Manuel (hesap başına):
```powershell
gcloud config set account ACCOUNT@gmail.com
$token = gcloud auth print-access-token
$project = "PROJECT_ID"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "https://run.googleapis.com/v1/projects/$project/locations/europe-west1/domainmappings" -Headers $headers
```

## Bilinen mapping'ler (2026-06-25)

| Hesap | Proje | Domain | Servis | Durum |
|-------|-------|--------|--------|-------|
| foodistopia@gmail.com | foodistopia-godiva | godivaelix.com | godiva-elix-web | Aktif — silinecek |
| foodistopia@gmail.com | foodistopia-bhmcontrol | — | — | Mapping yok |
| foodistopia@gmail.com | foodistopia-edura | — | — | Mapping yok |
| hasanvuralwork@gmail.com | (tüm projeler) | myedura.com | — | **Mapping yok** (2026-06-25 envanter) |
| hvworkcloud1@gmail.com | — | — | — | Mart 2026 temizlendi |

## Silme adımları (onay sonrası)

### 1. foodistopia — godivaelix.com

```powershell
gcloud config set account foodistopia@gmail.com
# Console: Cloud Run → Domain mappings → godivaelix.com → Delete
# veya REST (beta gerekir):
# gcloud beta run domain-mappings delete --domain=godivaelix.com --region=europe-west1 --project=foodistopia-godiva
```

**Önkoşul:** https://godivaelix.com yeni VM'den 200.

### 2. hasanvuralwork — myedura.com (varsa)

```powershell
gcloud config set account hasanvuralwork@gmail.com
gcloud projects list
# edura-7a1e1 DELETE_REQUESTED ise geçici restore gerekebilir (runbook §0.3)
```

### 3. Diğer stale mapping'ler

Envanter çıktısına göre aynı akış.

## Lock / çakışma durumu

Eski proje silinmiş olsa bile mapping lock kalabilir:

1. Projeyi geçici restore et.
2. Domain mapping'i sil.
3. Projeyi tekrar delete et.

Detay: [google-cloud-migration-runbook.md](./google-cloud-migration-runbook.md) §0.3.

## Rollback (mapping silmeden önce)

Namecheap'te eski A/CNAME kayıtlarını not et. Sorun olursa DNS'i eski hedefe çevir.
