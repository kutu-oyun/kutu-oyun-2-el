## Google Cloud Migration Runbook – foodistopia

Bu doküman, mevcut projeleri (`bhmcontrol`, `godiva-elix`, `edura-7a1e1`) yeni Google hesabı **`foodistopia@gmail.com`** altında **en küçük maliyetli** ve **operasyonel olarak temiz** bir mimariyle yeniden kurup, verileri taşıma ve kesintisiz geçiş yapma planını anlatır.

### 0. Son durum (31.03.2026)

#### 0.1 Tamamlananlar

- Yeni hedef projeler oluşturuldu:
  - `foodistopia-bhmcontrol`
  - `foodistopia-godiva`
  - `foodistopia-edura`
- BHM ve Godiva için veri taşıma tamamlandı:
  - Cloud SQL export/import tamam
  - Cloud Storage export/migration tamam
- Yeni Cloud Run prod servisleri ayakta ve ready:
  - BHM API: `https://bhm-api-hks3wdg4da-ew.a.run.app`
  - BHM WEB: `https://bhm-web-hks3wdg4da-ew.a.run.app`
  - Godiva API: `https://godiva-elix-api-u6xxqepa6q-ew.a.run.app`
  - Godiva WEB: `https://godiva-elix-web-u6xxqepa6q-ew.a.run.app`
- Eski projelerde maliyet kesme (safe-stop) uygulandı:
  - `bhmdb` ve `godivadb` için `activationPolicy=NEVER`, state `STOPPED`
  - `edura-7a1e1` billing kapalı (`billingEnabled=false`)
- Edura aktif kurulum adımları tamamlandı:
  - Billing link başarılı (`foodistopia-edura`)
  - API set enable tamam
  - `edura-admin-sa` oluşturuldu (`roles/editor`)
  - Private IP Cloud SQL instance oluşturuldu: `edura-sql` (`db-g1-small`, `10 GB`, public IP kapalı)
  - SQL import tamam: `edura-db-20260327-1713.sql.gz`
  - Storage migration tamam: `gs://foodistopia-edura-storage`
  - Cloud Run servisleri ayakta:
    - Edura API prod: `https://edura-api-vp7326vlma-ew.a.run.app`
    - Edura API preview: `https://edura-api-preview-vp7326vlma-ew.a.run.app`
- Full re-verify tamamlandı (BHM + Godiva + Edura):
  - 3 projede billing/API/IAM/SQL/secret/run standartları tekrar doğrulandı.
  - BHM/Godiva Cloud Build prod+preview triggerları aktif durumda teyit edildi.
- Godiva domain cutover tamamlandı:
  - `godivaelix.com` domaini `godiva-elix-web` servisine bağlandı.
  - Domain ownership doğrulaması Search Console TXT kaydı ile tamamlandı.
  - Eski `godiva-elix` proje namespace'inde kalan mapping kaydı silinerek çakışma çözüldü.
- Eski hesap temizliği (27.03.2026): Migration tamamlandıktan sonra eski projeler silindi / faturalandırma kesildi:
  - `hvworkcloud1@gmail.com`: Tüm projelerde billing unlink; `bhmcontrol`, `godiva-elix` ve diğer GCP projeleri silindi (hesapta proje yok).
  - `hasanvuralwork@gmail.com`: `edura-7a1e1`, `gen-lang-client-*` ve “My First Project” projeleri silindi. Kredi kartını tamamen GCP’den kaldırmak için Billing Console’da ödeme yöntemini silmek gerekir (CLI ile tam karşılığı yok).

#### 0.2 Bekleyenler

- Edura Cloud Build trigger kurulumu için GitHub OAuth credential yeniden authorize edilmeli.
- Branch bazlı triggerlar (`feat/*`, `main`) bu adım tamamlanınca finalize edilecek.
- Geçici fallback (çalışır): Edura deploy için manuel `gcloud builds submit` + `gcloud run deploy` akışı kullanılacak.

#### 0.3 Önemli teknik not

- BHM repository’sindeki `backend/cloudbuild.yaml` Cloud SQL instance adını sabit (`bhmdb`) kullandığı için,
  hedef projede de aynı adla instance oluşturuldu.
- Godiva repository’sindeki cloudbuild dosyaları repo kökünde değil:
  - `web/full-website/backend/cloudbuild.yaml`
  - `web/full-website/frontend/cloudbuild.yaml`
  Trigger path’leri buna göre ayarlandı.
- Edura tarafında geçici olarak build/deploy, export edilen kaynak arşivinden `gcloud builds submit` ile tamamlandı.
- Cloud Build GitHub connection denemesinde `401 Bad credentials` alındığı için trigger’lar pending bırakıldı.
- `gcloud builds triggers create manual` denemeleri `INVALID_ARGUMENT` ile reddedildi; bu nedenle trigger fallback’i CLI komut seti olarak tutuldu (repo-trigger yerine manuel build/deploy).
- Domain operasyon dersi (Godiva):
  - Proje silme `DELETE_REQUESTED` durumunda olsa bile eski domain mapping lock bırakabilir.
  - Böyle durumda proje geçici restore edilip mapping silinmeli, ardından proje tekrar delete edilmelidir.

### 1. Genel hedefler

- **Hedef hesap**: `foodistopia@gmail.com`
- **Eski projeler**:
  - BHM Control → proje id: `bhmcontrol` (eski hesap: `hvworkcloud1@gmail.com`)
  - Godiva → proje id: `godiva-elix` (eski hesap: `hvworkcloud1@gmail.com`)
  - Myedura → proje id: `edura-7a1e1` (eski hesap: `hasanvuralwork@gmail.com`)
- **Hedef strateji**: Eski projeleri taşımak yerine:
  - `foodistopia` altında yeni GCP projeleri açmak,
  - Cloud SQL / Cloud Storage verilerini export–import ile taşımak,
  - Cloud Run + Cloud Build + Secret Manager + IAM tasarımını sıfırdan, temiz şekilde kurmak.

### 2. Yeni proje yapısı ve isimlendirme

Foodistopia hesabı altında her uygulama için ayrı bir GCP projesi:

- `foodistopia-bhmcontrol`
- `foodistopia-godiva`
- `foodistopia-edura`

Her projede ortak standartlar:

- **Bölge**: `europe-west1`
- **Açılacak API’ler**:
  - Cloud Run Admin / Cloud Run
  - Cloud Build
  - Artifact Registry
  - Cloud SQL Admin
  - Secret Manager
  - IAM / Service Usage
  - Cloud Logging & Monitoring

### 3. IAM ve Service Account tasarımı

#### 3.1 Proje bazlı admin Service Account

Her proje için 1 adet “admin” Service Account oluşturulur; tüm Cloud Run/Build/SQL/Storage/Secrets işlemleri bu SA üzerinden yapılır:

- `bhmcontrol-admin-sa@foodistopia-bhmcontrol.iam.gserviceaccount.com`
- `godiva-admin-sa@foodistopia-godiva.iam.gserviceaccount.com`
- `edura-admin-sa@foodistopia-edura.iam.gserviceaccount.com`

Bu SA’lara, projede “kılçıksız” çalışmak için geniş yetkiler verilir (gerektiğinde daraltılabilir):

- `roles/editor`
- + Ek roller (gerektiğinde, örnek):
  - `roles/run.admin`
  - `roles/cloudbuild.builds.editor`
  - `roles/artifactregistry.admin`
  - `roles/secretmanager.admin`
  - `roles/cloudsql.admin`
  - `roles/storage.admin`

Cloud Run servisleri ve Cloud Build deploy adımları, bu SA’lar ile çalışacak şekilde yapılandırılır. Böylece:

- Default service account karmaşası olmadan,
- Tüm servisler proje bazlı tek bir SA’ya bağlı olur.

#### 3.2 İnsan kullanıcı (senin hesabın)

- `foodistopia@gmail.com` hesabına:
  - İlgili projelerde **Owner** veya en az `roles/editor` + gerekiyorsa ek roller verilir.
- Local geliştirme sırasında **Cloud SQL Auth Proxy** ile DB’ye bağlanmak için:
  - `roles/cloudsql.client`
  - Gerekirse `roles/secretmanager.secretAccessor`

Bu sayede:

- Servislerin runtime yetkisi SA’larda,
- Geliştirici erişimi senin kişisel hesabında izole olur.

### 4. Cloud SQL tasarımı (minimal, güvenli)

Her proje için 1 Cloud SQL instance (örneğin MySQL):

- Instance isimleri:
  - `bhmcontrol-sql`
  - `godiva-sql`
  - `edura-sql`
- Bölge: `europe-west1`
- **Public IP: KAPALI**
- Private IP + Cloud Run connector ile erişim (Uygulama tarafı).

Kaynak boyutu (maliyet odaklı, senin “en küçük” notlarınla uyumlu hedef):

- vCPU/RAM: GCP’nin sunduğu **en küçük production uygun kombinasyon** (ör: 1 vCPU, ~2–4 GB RAM aralığı; seçilen engine/seri’e göre netleşir).
- Disk: **10 GB** ile başla, otomatik büyümeyi ihtiyaca göre aç/kapat.
- Yüksek erişilebilirlik (HA): Başlangıçta **kapalı** (maliyet için).

Local geliştirme için:

- **Cloud SQL Auth Proxy** kullanılır.
- Public IP kapalı olduğu için:
  - “Authorized networks / local IP whitelist” **kullanılmayacak**,
  - Bağlantı sadece:
    - Cloud Run (runtime SA),
    - Senin local proxy + IAM yetkilerin üzerinden olur.

### 5. Cloud Storage tasarımı

Her proje için en az bir bucket:

- `bhmcontrol-bucket`
- `godiva-bucket`
- `edura-bucket`

Temel ilkeler:

- Class: `Standard` veya kullanımına göre daha ucuz sınıf (sık erişim yoksa).
- Public access:
  - Varsayılan: **kapalı** (sadece uygulama üzerinden erişim).
  - Public asset gerekiyorsa, sadece ilgili bucket/objeler kontrollü şekilde açılır.
- Lifecycle:
  - Eski log/asset dosyalarını otomatik silmek için ileride lifecycle kuralı eklenebilir (maliyet düşürmek için).

### 6. Cloud Run tasarımı

Her proje için backend ve frontend servisleri; ayrıca preview ortamı:

- Backend (API):
  - Prod: `{project}-api` (örn. `bhmcontrol-api`)
  - Preview: `{project}-api-preview`
- Frontend (Web):
  - Prod: `{project}-web`
  - Preview: `{project}-web-preview`

Kaynak ayarları (maliyet odaklı minimal):

- CPU/RAM: Uygulamanın çalışma sınırına göre en küçük kombinasyon (ör. `0.25–0.5 vCPU / 0.5–1–2 GB RAM` aralığı).
- Min instances: **0** (trafik yokken maliyet olmasın).
- Max instances: Başlangıçta düşük (ör. 5–10); ihtiyaca göre arttırılır.
- Concurrency: Uygulamanın state/performans ihtiyacına göre (örn. 10–80 arası).
- Cloud SQL bağlantısı:
  - Cloud Run → Cloud SQL connector (private IP, public IP kapalı).

Env/secret yönetimi:

- Gizli bilgiler **Secret Manager**’da:
  - Örn. `{project}-prod-DATABASE_URL`, `{project}-prod-JWT_SECRET`
- Cloud Run → Variables & secrets:
  - `DATABASE_URL` env’i Secret Manager’dan okunur.
- Cloud Build sadece gizli olmayan env’leri set eder:
  - Örn. `NODE_ENV`, `FRONTEND_URL`, vb.

### 7. Cloud Build ve deployment akışı

Branch ve trigger modeli, mevcut `general-deployment-logic-Hasan.md` ile aynıdır:

- Branch stratejisi:
  - `feat/*` → Preview ortam
  - `main` → Prod ortam
- Her proje için 4 Cloud Build trigger:
  - Prod:
    - `{project}-backend-deploy` (branch: `^main$`, config: `backend/cloudbuild.yaml`)
    - `{project}-frontend-deploy` (branch: `^main$`, config: `frontend/cloudbuild.yaml`)
  - Preview:
    - `{project}-backend-preview` (branch: `^feat/.*`, config: `backend/cloudbuild.yaml`)
    - `{project}-frontend-preview` (branch: `^feat/.*`, config: `frontend/cloudbuild.yaml`)

Substitutions örneği:

- Backend:
  - `_SERVICE={project}-api` veya `{project}-api-preview`
  - `_REGION=europe-west1`
- Frontend:
  - `_SERVICE={project}-web` veya `{project}-web-preview`
  - `_REGION=europe-west1`
  - `_NEXT_PUBLIC_API_URL` (backend URL + `/api`)
  - `_NEXT_PUBLIC_SOCKET_URL` (backend base URL)

### 8. Veri migration adımları

#### 8.1 Cloud SQL

Her proje için:

1. Eski projede Cloud SQL backup/export al:
   - Database bazlı SQL dump veya export (ör: Cloud Storage’a).
2. Yeni projede Cloud SQL instance ve database oluştur.
3. Export’u yeni instance’a import et.
4. Kullanıcı/şifreleri yeni instance’ta oluştur, `DATABASE_URL`’i buna göre üret.
5. `DATABASE_URL` ve diğer secret’ları Secret Manager’a yaz:
   - `{project}-prod-DATABASE_URL`, `{project}-prod-JWT_SECRET`, vb.
6. Cloud Run servislerinde yeni secret’ları env’e bağla, yeni revision deploy et.

#### 8.2 Cloud Storage

1. Eski bucket → yeni bucket’a dosyaları kopyala (CLI veya transfer aracı ile).
2. Gerekirse public erişim ayarlarını birebir taşı ama mümkünse sadeleştir.
3. Uygulama kodunda bucket isimleri/URL’leri gerekiyorsa yeni isimlere göre güncelle.

### 9. Cutover (trafik geçişi) ve doğrulama

1. Preview ortamlarını (`{project}-api-preview`, `{project}-web-preview`) ayağa kaldır, temel fonksiyonları test et.
2. `main` deploy ile prod servisleri (`{project}-api`, `{project}-web`) ayağa kaldır.
3. Cloud Run URL’leri üzerinden fonksiyonel test:
   - Health endpoint,
   - En az 1–2 DB kullanan endpoint (ör. `/products`, `/users`).
4. Domain/DNS kullanılıyorsa:
   - Yeni Cloud Run servislerine custom domain bağla,
   - DNS kaydını yeni projedeki servislere yönlendir.
5. Log ve metric kontrolü:
   - Cloud Run logları (5xx, DB bağlantı hataları),
   - Cloud SQL connection hataları,
   - Yanıt süreleri.

### 10. Eski projelerin kapatılması

1. Eski projelerde Cloud Run servislerinin min instances değerini 0’a çek (maliyet düşürmek için).
2. Cloud SQL ve büyük depolama kullanan diğer servisleri durdur veya read-only moda al.
3. Belirlediğin bekleme süresi (örneğin 1–3 ay) boyunca sadece log/monitor amaçlı açık tut.
4. Sonrasında:
   - Eski Cloud SQL instance’larını sil,
   - Artık kullanılmayan bucket’ları temizle,
   - Son aşamada projeleri tamamen delete edebilirsin.

### 11. Local geliştirme ve Cloud SQL erişimi

- Public IP **kapalı** kalır.
- Local geliştirme için:
  - Cloud SQL Auth Proxy kullanılır.
  - Proxy sadece senin IAM hesabınla çalışır:
    - `foodistopia@gmail.com` → `roles/cloudsql.client` (ve gerekiyorsa `secretAccessor`).
- Başka geliştiricilerin DB’ye erişmesi:
  - Ek geliştirici gerekirse, kişiye özel IAM + proxy kombinasyonu ile eklenir.

Bu runbook, ileride migration veya yeni proje eklerken tekrar kullanılabilir bir şablon olarak tasarlanmıştır. Her yeni proje için aynı modeli (yeni proje id, yeni admin SA, aynı trigger/Run/SQL/Storage pattern’i) uygulayabilirsin.

