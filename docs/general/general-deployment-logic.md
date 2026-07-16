# Genel Deployment Mantığı (Branch → Trigger → Cloud Run)

Bu dokümanda **herhangi bir proje** için izole ortamlar, **branch → trigger → Cloud Run** ilişkisi ve **preview vs canlı (prod)** akışı özetlenir. Proje adı yerine **`{projectname}`** kullanın (örn. `edura`, `myapp`).

---

## 1. Ortamlar ve anlamları

| Ortam | Açıklama | Frontend servisi | Backend servisi |
|-------|----------|------------------|-----------------|
| **Local** | Geliştirici makinesi (`npm run dev` vb.) | — | — |
| **Preview (Stage)** | Feat branch’lerdeki değişiklikleri test etmek için; canlıdan **izole**. | `{projectname}-web-preview` | `{projectname}-api-preview` |
| **Prod (Canlı)** | Kullanıcıların kullandığı nihai ortam. | `{projectname}-web` | `{projectname}-api` |

- Preview ve prod **ayrı Cloud Run servisleri**; aynı `cloudbuild.yaml` dosyaları, farklı **trigger** ve **substitution** değişkenleriyle kullanılır.
- Backend’de `{projectname}-api` / `{projectname}-api-preview`, frontend’de `{projectname}-web` / `{projectname}-web-preview` isimleri Cloud Run’da servis adı olarak kullanılır.

---

## 2. Branch stratejisi

| Branch | Tetiklenen build’ler | Deploy edilen ortam |
|--------|----------------------|----------------------|
| `feat/*` (örn. `feat/local`, `feat/yeni-ozellik`) | Backend-preview, Frontend-preview | **Preview** (`{projectname}-api-preview`, `{projectname}-web-preview`) |
| `main` | Backend-deploy (prod), Frontend-deploy (prod) | **Prod** (`{projectname}-api`, `{projectname}-web`) |

- **feat branch’e push** → Sadece preview servisleri güncellenir; canlı (prod) **hiç etkilenmez**.
- **main’e push veya merge** → Sadece prod servisleri güncellenir.

Böylece **preview izole** kalır; canlıya geçiş yalnızca `main` üzerinden olur.

---

## 3. Cloud Build trigger’lar (4 adet)

Aynı repo, aynı `backend/cloudbuild.yaml` ve `frontend/cloudbuild.yaml`; fark, **hangi branch** ve **hangi substitution değişkenleri** ile çalıştığıdır.

### 3.1 Prod (canlı)

| Trigger (örnek isim) | Event | Config dosyası | Substitution variables |
|----------------------|--------|----------------|------------------------|
| **{projectname}-backend-deploy** | Push to `^main$` | `backend/cloudbuild.yaml` | `_SERVICE={projectname}-api`, `_REGION=europe-west1` (veya yaml default) |
| **{projectname}-frontend-deploy** | Push to `^main$` | `frontend/cloudbuild.yaml` | `_SERVICE={projectname}-web`, `_REGION=europe-west1`, `_NEXT_PUBLIC_API_URL` = prod API URL’i, `_NEXT_PUBLIC_SOCKET_URL` = prod backend URL’i |

### 3.2 Preview (stage)

| Trigger (örnek isim) | Event | Config dosyası | Substitution variables |
|----------------------|--------|----------------|------------------------|
| **{projectname}-backend-preview** | Push to `^feat/.*` | `backend/cloudbuild.yaml` | `_SERVICE={projectname}-api-preview`, `_REGION=europe-west1` |
| **{projectname}-frontend-preview** | Push to `^feat/.*` | `frontend/cloudbuild.yaml` | `_SERVICE={projectname}-web-preview`, `_REGION=europe-west1`, `_NEXT_PUBLIC_API_URL` = **preview** backend URL’i (`.../api`), `_NEXT_PUBLIC_SOCKET_URL` = **preview** backend URL’i (sonda `/api` yok) |

**Önemli:** Frontend build’i, çalışacağı backend’in URL’ini **build anında** alır. Bu yüzden:

- **Prod frontend** → prod backend URL’leri.
- **Preview frontend** → preview backend URL’leri (`{projectname}-api-preview` servisinin Cloud Run URL’i).

Preview backend’in URL’i ilk deploy’dan sonra belli olur; trigger’da bu URL’i yazıp frontend-preview’ı yeniden build etmek gerekir.

---

## 4. Config dosyası konumları (trigger’da)

- **Backend:** `backend/cloudbuild.yaml` (veya repo root’a göre `/backend/cloudbuild.yaml`).
- **Frontend:** `frontend/cloudbuild.yaml` (veya `/frontend/cloudbuild.yaml`).

Trigger’da “Cloud Build configuration file” olarak bu path’ler seçilir; **Configuration type:** “Cloud Build configuration file (YAML or JSON)”.

---

## 5. Özet akış

1. **Local:** `feat/xxx` branch’inde geliştir.
2. **Push to feat:** `git push origin feat/xxx` → Backend-preview + Frontend-preview trigger’ları çalışır → `{projectname}-api-preview` ve `{projectname}-web-preview` güncellenir. **Canlı (main) etkilenmez.**
3. **Preview URL’leri:** Cloud Run’dan `{projectname}-web-preview` ve `{projectname}-api-preview` URL’lerini açarak test et.
4. **Canlıya geçiş:** PR’ı merge et → `main` güncellenir → Prod trigger’ları çalışır → `{projectname}-api` ve `{projectname}-web` güncellenir.

---

## 6. İlk kurulum sırası (preview için)

1. **Backend-preview trigger’ını** oluştur (branch `^feat/.*`, config `backend/cloudbuild.yaml`, `_SERVICE={projectname}-api-preview`, `_REGION=europe-west1`).
2. **Feat branch’e push et** veya trigger’ı manuel çalıştır → `{projectname}-api-preview` deploy olur.
3. Cloud Run’dan **{projectname}-api-preview** URL’ini kopyala.
4. **Frontend-preview trigger’ını** oluştur; Advanced → Substitution variables’a `_SERVICE={projectname}-web-preview`, `_REGION=europe-west1` ve **`_NEXT_PUBLIC_API_URL`** / **`_NEXT_PUBLIC_SOCKET_URL`** = az önce kopyaladığın preview backend URL’i (biri `/api` ile, biri sadece base URL).
5. Frontend-preview’ı çalıştır (push veya manuel) → `{projectname}-web-preview` doğru API’ye bağlanır.

---

## 7. Kısa referans

| Ne zaman | Hangi trigger’lar | Nereye deploy |
|----------|-------------------|---------------|
| `feat/*` push | backend-preview, frontend-preview | {projectname}-api-preview, {projectname}-web-preview (izole preview) |
| `main` push/merge | backend-deploy (prod), frontend-deploy (prod) | {projectname}-api, {projectname}-web (canlı) |

- **Preview = izole test ortamı;** canlıyı etkilemez.
- **Canlı = sadece main** üzerinden güncellenir.

Projeye özel env değişkenleri ve adım adım deploy için ana **DEPLOYMENT.md** (ve varsa pipeline dokümanı) kullanılabilir.

---

## 8. Environment ve secret yönetimi (önerilen pattern)

**Genel kural:** Gizli olanlar (DB URL, API key, JWT secret) **koda ve cloudbuild.yaml’a yazılmaz**, ortamdan/Secret Manager’dan okunur.

### 8.1 Local (geliştirici makinesi)

- Backend: `{projectname}/backend/.env` (gitignore’da)
  - `DATABASE_URL=...`
  - `JWT_SECRET=...`
- Frontend: `{projectname}/frontend/.env.local`
  - `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

Bu dosyalar **Git’e eklenmez**, sadece local içindir.

### 8.2 Prod (Cloud Run + Secret Manager)

1. **Secret oluştur (Secret Manager)**
   - Örn. `{projectname}-prod-DATABASE_URL`, `{projectname}-prod-JWT_SECRET`.
   - Değeri burada sakla (örnek DB URL: `mysql://user:pass@host:3306/db`).

2. **Cloud Run servisine bağla**
   - Cloud Run → `{projectname}-api` → *Edit & deploy new revision*.
   - **Variables & secrets** → **Add variable**:
     - Name: `DATABASE_URL`
     - Source: **Secret** → `{projectname}-prod-DATABASE_URL` → *latest*.
   - Benzer şekilde diğer secret’lar (`JWT_SECRET` vb.).

3. **Cloud Build tarafında sadece gizli olmayan config’ler**
   - `backend/cloudbuild.yaml` içindeki `--set-env-vars`:
     - Örn. `NODE_ENV=production,FRONTEND_URL=https://...`
   - **DATABASE_URL gibi secret’lar burada olmaz**, sadece Cloud Run + Secret Manager üzerinden gelir.

4. **Frontend için**
   - Gizli olmayan env’ler (`_NEXT_PUBLIC_API_URL`, `_NEXT_PUBLIC_SOCKET_URL`) → Cloud Build substitutions ile verilir.
   - Gizli şeyler mümkün olduğunca backend’e taşınır; gerekirse onlar da Secret Manager’dan okunur.

Bu pattern hem `{projectname}` gibi tek proje için hem de birden fazla proje için (her proje kendi Secret Manager secret’larını kullanarak) uygulanabilir.

---

## 9. Kafanda şöyle tut (kısa ok şeması)

**Backend akışı**

- Kod → Backend Docker imajı → `gcr.io/PROJE_ID/{projectname}-api:TAG` → Cloud Run (`{projectname}-api`) → Secret Manager’dan `DATABASE_URL` → `/api/...` endpoint’leri

**Frontend akışı**

- Kod → Frontend Docker imajı (build arg ile doğru API URL gömülü) → `gcr.io/PROJE_ID/{projectname}-web:TAG` → Cloud Run (`{projectname}-web`) → Kullanıcı tarayıcısı → `{projectname}-api`’ye istek


---

## 10. Olası Hatalar ve Çözümleri (Cloud SQL + Prisma Migration)

Cloud SQL ve Prisma migration sırasında karşılaşılabilecek hatalar için **scripts/TROUBLESHOOTING-CLOUD-SQL.md** dosyasına bakın. Özet:

- **P1000** Authentication failed → DATABASE_URL formatı (user:password@host), sslaccept, yeni kullanıcı
- **P1010** Denied access on mysql → migrate resolve veya manuel SQL
- **P1003** Database does not exist → bakim_destek oluştur
- **Proxy:** Port in use, dosya kilitli → farklı port veya klasör

---

## 11. Tekrarlanmaması için genel dersler (anonim, proje bağımsız)

Bu bölüm, farklı projelerde aynı tür problemler tekrar etmesin diye operasyonel kontrol noktalarını özetler.

### 11.1 DB bağlantısında tek gerçek kaynak

- Uygulama runtime'ı için DB bağlantı değeri tek kaynaktan gelmeli: **Secret Manager**.
- Local `.env` dosyası sadece geliştirici testleri içindir; prod ile otomatik senkron değildir.
- Secret güncellendikten sonra Cloud Run'da **yeni revision** üretilmeden değişiklik etkili olmaz.

### 11.2 "Health 200 ama iş endpoint'i 5xx" semptomu

- `health` endpoint'inin 200 dönmesi, uygulamanın ayağa kalktığını gösterir; DB'nin çalıştığını garanti etmez.
- Daima en az bir DB kullanan endpoint ile doğrulama yapılmalı (`/products`, `/users`, vb.).
- Son 15-30 dakika Cloud Run logları mutlaka okunmalı (özellikle Prisma initialization/auth hataları).

### 11.3 Cloud SQL erişiminde iki ayrı yetki katmanı

- **Ağ/bağlantı katmanı:** Cloud Run servisinde Cloud SQL instance binding doğru olmalı.
- **IAM katmanı:** Runtime service account'ta en az `roles/cloudsql.client` olmalı.
- Bu iki katmandan biri eksikse uygulama DB'ye bağlanamaz.

### 11.4 Kullanıcı/parola ve host eşleşmesi

- Cloud SQL'de kullanıcı şifresi güncellendiğinde, Secret'taki URL de aynı anda güncellenmeli.
- Özel karakterli parolalarda URL encode veya sade parola tercih edilmeli.
- MySQL tarafında kullanıcı host kapsamı (`%` gibi) yanlışsa auth hatası alınabilir.

### 11.5 Migration pipeline güvenliği

- Migration adımı, deploy'u tamamen kilitleyebilecek kritik adım olduğu için:
  - ayrı loglanmalı,
  - idempotent çalışmalı,
  - geçici bypass yapıldıysa sonradan geri alınmalı.
- "Deploy çalışsın, migration sonra" yaklaşımı geçici olabilir; kalıcı hale getirilmemeli.

### 11.6 Local geliştirme için önerilen model

- Uygulama localde çalışırken Cloud SQL'e bağlanacaksa:
  - proxy açık,
  - `.env` TCP (`127.0.0.1:3306`) kullanmalı.
- SQL GUI araçları (HeidiSQL, DBeaver) ayrı kanaldan public IP ile bağlanabilir; uygulama bağlantısı ile karıştırılmamalı.

### 11.7 Operasyon öncesi kısa checklist

1. Secret değeri boş değil, BOM/newline yok.
2. Cloud Run revision gerçekten latest secret ile deploy edildi.
3. Cloud SQL binding doğru instance'a işaret ediyor.
4. Runtime service account Cloud SQL Client yetkisine sahip.
5. `health` + DB endpoint birlikte 200.
6. Loglarda auth/connection/init hatası yok.

---

## 12. GCE VPS deployment modeli (hvworkcloud2) — güncel prod

**Durum (2026-06):** BHM, Godiva, Edura ve hasanvural.com prod ortamları **tek Compute Engine VM** üzerinde Docker Compose ile çalışır. Aşağıdaki Bölüm 1–11 **Cloud Run / Cloud Build legacy referans** olarak korunur; yeni projeler ve prod cutover bu modele göre yapılır.

**Hesap:** `hvworkcloud2@gmail.com`  
**Runbook:** [gce-vps-migration-runbook.md](./gce-vps-migration-runbook.md)  
**Deploy dosyaları:** `deploy/gce/`

### 12.1 Ortamlar

| Ortam | Açıklama | Nasıl |
|-------|----------|--------|
| **Local** | Geliştirici makinesi | `npm run dev` |
| **Preview** | Feat branch test | `docker compose --profile preview up` (opsiyonel subdomain) |
| **Prod** | Canlı | `docker compose up -d` on VM |

Cloud Build trigger **yok**. Deploy: SSH → `scripts/deploy-all.sh` veya GitHub Actions → VM.

### 12.2 Branch → deploy (VPS)

| Branch | Aksiyon |
|--------|---------|
| `feat/*` | VM'de preview profile build + restart preview container'lar |
| `main` | VM'de prod build + rolling restart |

Branch mantığı Bölüm 2 ile **aynı fikir**; farklı araç (Cloud Run yerine Docker Compose).

### 12.3 Secret yönetimi

- Prod secret'lar: `/opt/apps/secrets/*.env` (`chmod 600`, gitignore).
- Cloud Secret Manager **kullanılmaz** (maliyet/karmaşıklık).
- Local: mevcut `.env` / `.env.local` pattern (Bölüm 8.1).

### 12.4 Trafik akışı

```
Internet → DNS (A → Static IP) → Caddy (443) → container (api/web)
                                      ↓
                                 MySQL (Docker, 4 DB)
```

Godiva mood foto: GCS bucket on hvworkcloud2 (`GCS_BUCKET` env + VM service account).

### 12.5 Cloud Run vs GCE VPS

| | Cloud Run (legacy) | GCE VPS (current) |
|--|-------------------|-------------------|
| Deploy | Cloud Build trigger | SSH + docker compose |
| DB | Cloud SQL (managed) | MySQL container |
| Secret | Secret Manager | `.env` on VM |
| Scale | Otomatik | Sabit VM (e2-standard-4) |
| Maliyet | Yüksek (3× SQL) | Düşük, trial-friendly |
| Cold start | Var (min=0) | Yok |

### 12.6 Operasyon checklist (prod)

1. `docker compose ps` — tüm servisler up.
2. Caddy log — SSL / 5xx yok.
3. Her app: health + 1 DB endpoint.
4. `scripts/backup-databases.sh` cron çalışıyor.
5. GCP snapshot schedule aktif.

### 12.7 Cutover / rollback

- DNS cutover: [cutover-checklist.md](./cutover-checklist.md)
- Eski domain mapping silme: [domain-mapping-cleanup-checklist.md](./domain-mapping-cleanup-checklist.md)
