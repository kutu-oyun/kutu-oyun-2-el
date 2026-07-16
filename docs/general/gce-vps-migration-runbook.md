# GCE VPS Migration Runbook — foodistopia → hvworkcloud2

**Hedef hesap:** `hvworkcloud2@gmail.com`  
**Billing:** `018A85-34FE2D-90E419` (Free Trial)  
**Kaynak:** `foodistopia@gmail.com` (`foodistopia-bhmcontrol`, `foodistopia-godiva`, `foodistopia-edura`)

Bu runbook, tüm prod uygulamaları **tek Compute Engine VM + Docker Compose** üzerinde toplar.

## Son durum

| Alan | Değer |
|------|--------|
| GCP proje | `project-3d78acd3-8c14-4744-a1a` (display: hvworkcloud2-apps) |
| VM | `apps-vm` — `e2-standard-4`, `europe-west1-b` |
| Deploy kökü | `/opt/apps` |
| Compose | `/opt/apps/hasanvuralcom/deploy/gce/docker-compose.yml` |

---

## 1. GCP foundation (hvworkcloud2)

```powershell
gcloud config configurations activate hvworkcloud2
gcloud config set project project-3d78acd3-8c14-4744-a1a

# API'ler
gcloud services enable compute.googleapis.com storage.googleapis.com iam.googleapis.com --project=PROJECT_ID

# Static IP
gcloud compute addresses create apps-static-ip --region=europe-west1

# Firewall
gcloud compute firewall-rules create allow-http-https --allow=tcp:80,tcp:443 --target-tags=apps-vm --project=PROJECT_ID
gcloud compute firewall-rules create allow-ssh-admin --allow=tcp:22 --target-tags=apps-vm --source-ranges=YOUR_IP/32 --project=PROJECT_ID

# VM
gcloud compute instances create apps-vm `
  --zone=europe-west1-b `
  --machine-type=e2-standard-4 `
  --boot-disk-size=80GB `
  --boot-disk-type=pd-balanced `
  --image-family=ubuntu-2404-lts-amd64 `
  --image-project=ubuntu-os-cloud `
  --tags=apps-vm `
  --address=apps-static-ip

# Backup bucket
gcloud storage buckets create gs://hvworkcloud2-backups-PROJECT_NUMBER --location=europe-west1

# Godiva mood photos bucket
gcloud storage buckets create gs://hvworkcloud2-godiva-storage --location=europe-west1
```

PowerShell script: [deploy/gce/scripts/provision-gcp.ps1](../../../deploy/gce/scripts/provision-gcp.ps1)

---

## 2. VM bootstrap

```bash
# SSH
gcloud compute ssh apps-vm --zone=europe-west1-b --project=PROJECT_ID

# Repo klonla (veya scp ile kopyala)
sudo mkdir -p /opt/apps && sudo chown $USER:$USER /opt/apps
git clone https://github.com/Hasan-Vural/hasanvuralcom.git /opt/apps/hasanvuralcom
# BHM, Godiva, Edura repolarını da /opt/apps altına klonla

cd /opt/apps/hasanvuralcom/deploy/gce
chmod +x setup-vm.sh scripts/*.sh
./setup-vm.sh

# Secrets (chmod 600)
sudo mkdir -p /opt/apps/secrets
cp env/.env.example /opt/apps/secrets/stack.env
# Düzenle: DATABASE_URL'ler, JWT, GCS bucket

docker compose build
docker compose up -d
```

---

## 3. Veri export (foodistopia)

PowerShell (foodistopia hesabı):

```powershell
gcloud config set account foodistopia@gmail.com
.\deploy\gce\scripts\export-foodistopia.ps1 -BackupBucket gs://hvworkcloud2-backups-...
```

Export edilen dump'lar VM'de import edilir:

```bash
./scripts/import-databases.sh /path/to/dumps
```

---

## 4. Cutover günü

1. TTL'leri 5 dk'ya indir (Namecheap).
2. VM'de final smoke test (`curl -H "Host: godivaelix.com" http://localhost/health`).
3. DNS A kayıtları → Static IP.
4. Caddy SSL otomatik (Let's Encrypt).
5. 4 site health + DB endpoint kontrolü.
6. foodistopia Cloud Run trafiğini kes ([decommission-foodistopia.ps1](../../../deploy/gce/scripts/decommission-foodistopia.ps1) — `--stop-only`).

Rollback: DNS'i eski kayıtlara çevir.

Detay: [cutover-checklist.md](./cutover-checklist.md)

---

## 5. Domain mapping temizliği

Cutover +1–3 gün, birlikte: [domain-mapping-cleanup-checklist.md](./domain-mapping-cleanup-checklist.md)

---

## 6. foodistopia decommission (+7 gün)

```powershell
.\deploy\gce\scripts\decommission-foodistopia.ps1 -DeleteResources
```

---

## Risk özeti

| Risk | Önlem |
|------|--------|
| Tek VM SPOF | Günlük snapshot + DB dump → GCS |
| Trial bitişi | Budget alert; Eylül 2026 öncesi plan |
| Godiva GCS | hvworkcloud2 bucket + SA key on VM |
| Edura SSR | Node container, nginx-only değil |

---

## İlgili dokümanlar

- [general-deployment-logic-Hasan.md](./general-deployment-logic-Hasan.md) — Bölüm 12 (VPS modeli)
- [genel-hosting-mantigi-vps-hibrit-ve-secimler.md](./genel-hosting-mantigi-vps-hibrit-ve-secimler.md)
