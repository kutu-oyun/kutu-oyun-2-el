# Kutuly.com Deployment Rehberi

Bu rehber, projeyi **Google Cloud SQL (MySQL)**, **Google Cloud Run (backend)**, **Vercel (frontend)** ve **Google Cloud Storage** ile canlıya almak için adım adım yapılacakları anlatır. Domain: **kutuly.com**.

---

## 1. .env ve API Endpoint’leri Nasıl Kullanılır?

### Backend (.env)

- Backend’de `process.env.DEGISKEN_ADI` ile okunur.
- Örnek: `NEXT_PUBLIC_API_URL` frontend’de kullanılır; backend’de API adresi **FRONTEND_URL** ile CORS ve PayTR callback için kullanılır.
- **Cloud Run**’da: Servis → Edit & Deploy → Variables & Secrets sekmesinden tüm backend env değişkenlerini ekleyin (`.env` dosyası deploy’a dahil edilmez).

### Frontend (.env.local / Vercel Environment Variables)

- Next.js’te tarayıcıda kullanılacak her değişken **NEXT_PUBLIC_** ile başlamalı (örn. `NEXT_PUBLIC_API_URL`).
- Lokal: proje kökünde `.env.local` oluşturup değerleri yazın.
- Vercel: Project → Settings → Environment Variables’dan Production/Preview için ekleyin.
- **API endpoint örneği:**
  - Geliştirme: `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
  - Canlı: `NEXT_PUBLIC_API_URL=https://kutu-backend-xxxxx-ew.a.run.app/api` (Cloud Run URL’iniz + `/api`)

### Özet Tablo

| Nerede       | Değişken örneği      | Örnek değer                                      |
|-------------|----------------------|--------------------------------------------------|
| Backend     | FRONTEND_URL         | https://kutuly.com                              |
| Backend     | DATABASE_URL         | Cloud SQL bağlantı string’i (aşağıda)           |
| Backend     | GCS_BUCKET_NAME      | kutuly-uploads                                  |
| Frontend    | NEXT_PUBLIC_API_URL  | https://xxx.run.app/api                         |

---

## 2. Yapılacaklar Sırası (Genel Akış)

1. **Google Cloud projesi** oluştur / seç.
2. **Cloud SQL (MySQL)** instance + veritabanı oluştur, bağlantı bilgilerini al.
3. **Cloud Storage** bucket oluştur (resim/belge yükleri için).
4. **Backend’i Cloud Run’a** deploy et (Docker image, env’ler, Cloud SQL bağlantısı).
5. **Frontend’i Vercel’e** deploy et, `NEXT_PUBLIC_API_URL` ve domain’i ayarla.
6. **kutuly.com** domain’i Vercel’e bağla.
7. **Firebase / PayTR** ayarlarını canlı URL’lere göre güncelle.

### Branch ve izolasyon (yerel / Preview / canlı)

- **Yerel:** Push etmediğiniz sürece Cloud Run ve Vercel tetiklenmez.
- **GitHub `feat`:** Vercel Preview; isteğe bağlı Cloud Run Preview.
- **GitHub `main`:** kutuly.com (Production) + Cloud Run Production.

Detaylı branch stratejisi, Vercel Production Branch ayarı ve GitHub Actions için **BRANCHES.md** dosyasına bakın.

---

## 3. Google Cloud Projesi

1. [Google Cloud Console](https://console.cloud.google.com/) → Proje seç veya yeni proje oluştur.
2. Faturalandırmanın açık olduğundan emin ol.
3. Gerekli API’leri aç:
   - Cloud SQL Admin API  
   - Cloud Run Admin API  
   - Cloud Storage API  
   - (Container Registry veya Artifact Registry kullanacaksan) ilgili API’ler  

---

## 4. Google Cloud SQL – MySQL

### 4.1 Instance oluşturma

1. Console → **SQL** → **Create Instance** → **Choose MySQL**.
2. Örnek ayarlar:
   - **Instance ID:** `kutu-mysql`
   - **Şifre:** güçlü bir root şifresi belirle (kaydet).
   - **Bölge:** Backend’i nereye deploy edeceksen (örn. `europe-west1`) aynı bölgeyi seç.
   - **Makine tipi:** Başlangıç için küçük (örn. db-f1-micro veya db-g1-small).
3. **Create** ile oluştur.

### 4.2 Veritabanı ve kullanıcı

1. Instance’a tıkla → **Databases** → **Create database** → örn. `kutu_db`.
2. **Users** → **Add user** → örn. `kutu_user`, şifre belirle (kaydet).

### 4.3 Bağlantı bilgisi (DATABASE_URL)

- **Cloud Run’dan** (önerilen): Unix socket kullanılır.  
  Format:  
  `mysql://KULLANICI:SIFRE@/VERITABANI?host=/cloudsql/PROJE_ID:REGION:INSTANCE_ADI`  
  Örnek:  
  `mysql://kutu_user:SIFRENIZ@/kutu_db?host=/cloudsql/my-project:europe-west1:kutu-mysql`

- **Yerel geliştirme** (Cloud SQL Proxy ile):  
  Proxy’yi çalıştırdıktan sonra:  
  `mysql://kutu_user:SIFRENIZ@127.0.0.1:3306/kutu_db`

Bu değeri backend’in **DATABASE_URL** ortam değişkeni olarak kullanacaksın (Cloud Run’da Variables’a ekle).

### 4.4 Prisma migration (ilk kurulum)

- Migration’ları **yerelde** veya **CI/CD** içinde Cloud SQL’e bağlanıp çalıştır:
  - `DATABASE_URL` canlı Cloud SQL’i gösterecek şekilde ayarla (proxy veya yetkili IP ile).
  - `npx prisma migrate deploy`
- İstersen Cloud Run’da container başlarken migration çalıştıran bir entrypoint script de kullanılabilir; rehberde ayrıntıya girmiyoruz.

---

## 5. Google Cloud Storage (Resim / Belgeler)

1. Console → **Cloud Storage** → **Buckets** → **Create**.
2. **Name:** örn. `kutuly-uploads` (global olarak benzersiz olmalı).
3. **Location:** Backend’e yakın bir bölge (örn. europe-west1).
4. **Access control:** Uniform (önerilir).
5. Oluştur.

Backend’de zaten `GCS_BUCKET_NAME` ve `GCS_PROJECT_ID` kullanılıyor; Cloud Run’da bu iki env’i ayarla. Service account’un bu bucket’a yazma/okuma yetkisi olmalı (Cloud Run varsayılan SA’sına Storage Object Admin rolü verebilirsin).

---

## 6. Backend – Google Cloud Run’a Deploy

### 6.1 Image oluşturma ve push

- **Artifact Registry** (veya Container Registry) kullan:
  1. Repo oluştur (örn. `kutu-repo`, region: europe-west1).
  2. Proje kökünde değil **backend** klasöründe:

```bash
cd backend
docker build -t europe-west1-docker.pkg.dev/PROJE_ID/kutu-repo/kutu-backend:latest .
docker push europe-west1-docker.pkg.dev/PROJE_ID/kutu-repo/kutu-backend:latest
```

(Önce `gcloud auth configure-docker europe-west1-docker.pkg.dev` gerekebilir.)

### 6.2 Cloud Run servisi oluşturma

**Cloud Run → Services sayfası boşsa** iki yol var:

- **Yol A (önerilen):** Önce GCP projesi, Cloud SQL, Storage, Artifact Registry ve GitHub Secrets hazır olsun. `main`'e push edince GitHub Actions `kutu-backend` servisini oluşturur; bu sayfada servis görünür. Sonra servise tıklayıp **Edit & Deploy New Revision** → **Variables & Secrets** ve **Connections (Cloud SQL)** ekleyip kaydedin.
- **Yol B:** Bu sayfada **"+ Deploy container"** ile servisi siz oluşturun: image (Artifact Registry’den veya önce `docker build/push` ile), bölge, Cloud SQL bağlantısı ve env’leri tek seferde ayarlayın. Sonraki deploy’lar GitHub Actions ile aynı servisi günceller.

Aşağıdaki adımlar **Create Service / Deploy container** ile ilk kez oluştururken veya **Edit & Deploy** ile revizyon eklerken geçerlidir:

1. **Cloud Run** → **Create Service** (veya **Deploy container**).
2. **Image:** yukarıdaki image URL’i.
3. **Region:** Cloud SQL ile aynı bölge.
4. **Authentication:** “Require authentication” istemiyorsan (frontend’in doğrudan istek atması için) “Allow unauthenticated invocations” seç.
5. **Connections:** **Cloud SQL** sekmesinden ilgili MySQL instance’ı ekle (bu, Unix socket ile bağlantıyı mümkün kılar).
6. **Variables & Secrets:** Aşağıdaki env’leri ekle (Secret’lar için değeri sonradan ekleyebilirsin):

| Name             | Value / Secret     |
|------------------|--------------------|
| NODE_ENV         | production         |
| PORT             | 4000               |
| FRONTEND_URL     | https://kutuly.com |
| DATABASE_URL     | (Cloud SQL socket URL) |
| JWT_SECRET       | (güçlü rastgele string) |
| JWT_EXPIRES_IN   | 24h                |
| GCS_PROJECT_ID   | proje-id           |
| GCS_BUCKET_NAME  | kutuly-uploads     |
| FIREBASE_PROJECT_ID | ...             |
| FIREBASE_CLIENT_EMAIL | ...            |
| FIREBASE_PRIVATE_KEY | (Secret olarak ekle) |
| PAYTR_MERCHANT_ID / KEY / SALT | (istersen Secret) |

7. **Deploy** ile servisi oluştur.
8. Servis URL’i örn: `https://kutu-backend-xxxxx-ew.a.run.app`. Bunu frontend’te **NEXT_PUBLIC_API_URL** için kullan: `https://kutu-backend-xxxxx-ew.a.run.app/api`.

---

## 7. Frontend – Vercel’e Deploy

1. [Vercel](https://vercel.com) → Projeyi import et (Git repo: frontend root’u veya monorepo’da root’u seçip root directory’i `frontend` yap).
2. **Build settings:** Framework: Next.js, build command ve output Vercel’in otomatik bulduğu gibi bırakılabilir.
3. **Environment Variables** ekle:
   - `NEXT_PUBLIC_API_URL` = `https://kutu-backend-xxxxx-ew.a.run.app/api`
   - Tüm `NEXT_PUBLIC_FIREBASE_*` değişkenleri (Firebase Console’dan al).
4. Deploy’u çalıştır; varsayılan `*.vercel.app` domain’i çalışır.

---

## 8. Domain kutuly.com’u Vercel’e Bağlama

1. Vercel projesi → **Settings** → **Domains**.
2. **Add** → `kutuly.com` ve (isteğe bağlı) `www.kutuly.com` ekle.
3. Vercel, domain sağlayıcınızda yapmanız gereken DNS kayıtlarını gösterir (A / CNAME). Bu kayıtları domain satın aldığınız yerde (GoDaddy, Namecheap, vb.) ekleyin.
4. SSL otomatik gelir (Let’s Encrypt).

Domain aktif olduktan sonra frontend’i `https://kutuly.com` üzerinden kullanacaksınız. Backend’deki **FRONTEND_URL**’i de `https://kutuly.com` yapmayı unutma (Cloud Run env’lerini güncelle).

---

## 9. Özet Kontrol Listesi

- [ ] GCP projesi ve API’ler açık  
- [ ] Cloud SQL MySQL instance + DB + kullanıcı oluşturuldu  
- [ ] DATABASE_URL (socket format) backend env’e yazıldı  
- [ ] Cloud Storage bucket (kutuly-uploads) oluşturuldu  
- [ ] GCS_BUCKET_NAME, GCS_PROJECT_ID backend’e eklendi  
- [ ] Backend Docker image build + push  
- [ ] Cloud Run servisi: image, Cloud SQL bağlantısı, tüm env’ler  
- [ ] Backend URL alındı → NEXT_PUBLIC_API_URL = `.../api`  
- [ ] Frontend Vercel’e deploy, env’ler (NEXT_PUBLIC_*)  
- [ ] kutuly.com domain Vercel’e eklenip DNS yapıldı  
- [ ] FRONTEND_URL = https://kutuly.com (Cloud Run’da)  
- [ ] Firebase’de authorized domains’e kutuly.com eklendi  
- [ ] PayTR merchant_ok_url / merchant_fail_url canlı domain’e göre (backend şu an `/siparis/{orderId}` kullanıyor; frontend sayfanız `/odeme/[orderId]` ise backend’de `merchant_ok_url`/`merchant_fail_url`’i `/odeme/` olacak şekilde güncellemeniz veya frontend’te `/siparis/[orderId]` route’u eklemeniz gerekir)

Bu adımları tamamladığında backend Cloud Run’da, frontend Vercel’de (kutuly.com), veritabanı Cloud SQL’de ve dosyalar Cloud Storage’da olacaktır.
