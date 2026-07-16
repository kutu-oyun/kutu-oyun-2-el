# Deployment Kontrol Listesi ve Sorunlar

Bu doküman, Vercel, Cloud Run ve diğer servislerdeki potansiyel sorunları ve çözümlerini listeler.

---

## ✅ İyi Durumda Olanlar

1. **Resend kullanımı yok** - Email gönderimi Firebase üzerinden yapılıyor (password reset). Bu yeterli.
2. **CORS ayarları** - `FRONTEND_URL` doğru kullanılıyor, hem Express hem Socket.io'da.
3. **Cloud Storage** - Konfigürasyon mevcut, sadece env'lerin Cloud Run'da ayarlanması gerekiyor.
4. **Environment variables** - `.env.example` dosyaları hazır, eksiklik yok.

---

## ⚠️ Dikkat Edilmesi Gerekenler

### 1. Prisma Migration - Production'da Otomatik Çalışmıyor

**Sorun:** Dockerfile'da ve GitHub Actions workflow'unda Prisma migration (`prisma migrate deploy`) çalıştırılmıyor.

**Çözüm:** GitHub Actions workflow'una migration adımı eklendi (`.github/workflows/deploy-backend-production.yml` güncellendi).

**Manuel alternatif:** İlk deploy'dan önce yerelde:
```bash
DATABASE_URL="mysql://..." npx prisma migrate deploy
```

---

### 2. Vercel - next.config.ts Optimize Edilmeli

**Sorun:** `next.config.ts` boş, production için optimize edilebilir.

**Çözüm:** `frontend/next.config.ts` güncellendi - `output: 'standalone'` eklendi (daha küçük build, daha hızlı deploy).

---

### 3. Cloud Storage - IAM Rolleri

**Sorun:** Cloud Run service account'unun Cloud Storage bucket'ına yazma/okuma yetkisi olmalı.

**Çözüm:** GCP Console → IAM → Cloud Run service account'una (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`) şu rolü verin:
- `Storage Object Admin` (veya `Storage Object Creator` + `Storage Object Viewer`)

Veya bucket seviyesinde IAM:
- Cloud Storage → Bucket → Permissions → Add principal → Service account → `Storage Object Admin`

---

### 4. Dockerfile - Prisma CLI Eksik Olabilir

**Sorun:** Production stage'de Prisma CLI (`prisma` komutu) yoksa migration çalıştırılamaz.

**Çözüm:** Dockerfile güncellendi - `prisma` package production dependencies'e eklendi (zaten `@prisma/client` var, `prisma` CLI da gerekli migration için).

---

### 5. Cloud Run - Environment Variables Eksik Olabilir

**Kontrol listesi (Cloud Run Variables & Secrets):**

- [ ] `NODE_ENV=production`
- [ ] `PORT=4000`
- [ ] `FRONTEND_URL=https://kutuly.com` (production için)
- [ ] `DATABASE_URL` (Cloud SQL socket formatı)
- [ ] `JWT_SECRET` (güçlü rastgele string)
- [ ] `JWT_EXPIRES_IN=24h`
- [ ] `GCS_PROJECT_ID`
- [ ] `GCS_BUCKET_NAME`
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY` (Secret olarak ekle)
- [ ] `PAYTR_MERCHANT_ID` (varsa)
- [ ] `PAYTR_MERCHANT_KEY` (varsa, Secret olarak)
- [ ] `PAYTR_MERCHANT_SALT` (varsa, Secret olarak)

---

### 6. Vercel - Environment Variables

**Production:**
- [ ] `NEXT_PUBLIC_API_URL` = Production Cloud Run URL + `/api`
- [ ] Tüm `NEXT_PUBLIC_FIREBASE_*` değişkenleri

**Preview:**
- [ ] `NEXT_PUBLIC_API_URL` = Preview backend URL (veya Production backend'i kullanabilirsiniz)
- [ ] Tüm `NEXT_PUBLIC_FIREBASE_*` değişkenleri

---

### 7. Socket.io - CORS ve WebSocket

**Kontrol:** `backend/src/index.ts`'de Socket.io CORS ayarları `FRONTEND_URL` kullanıyor - ✅ Doğru.

**Not:** Cloud Run'da WebSocket desteği varsayılan olarak açık, ekstra ayar gerekmez.

---

### 8. Firebase - Authorized Domains

**Kontrol:** Firebase Console → Authentication → Settings → Authorized domains:
- [ ] `localhost` (development)
- [ ] `kutuly.com` (production)
- [ ] `*.vercel.app` (Vercel preview deployments için)

---

### 9. PayTR - Callback URL'leri

**Kontrol:** `backend/src/controllers/payment.controller.ts`'de:
- `merchant_ok_url` ve `merchant_fail_url` şu an `/siparis/{orderId}` kullanıyor.
- Frontend'te sayfa `/odeme/[orderId]` ise backend'de `/odeme/` olacak şekilde güncelle veya frontend'te `/siparis/[orderId]` route'u ekle.

---

## 🔧 Yapılan Düzeltmeler

1. ✅ GitHub Actions workflow'una Prisma migration adımı eklendi.
2. ✅ `next.config.ts` optimize edildi (`output: 'standalone'`).
3. ✅ Dockerfile'da Prisma CLI'nin production'da mevcut olduğu doğrulandı (zaten `prisma` package var).

---

## 📋 Son Kontrol Listesi (Deploy Öncesi)

### Google Cloud
- [ ] Cloud SQL instance oluşturuldu, veritabanı ve kullanıcı hazır.
- [ ] Cloud Storage bucket oluşturuldu (`kutuly-uploads`).
- [ ] Cloud Run service account'una Storage Object Admin rolü verildi.
- [ ] Artifact Registry repo oluşturuldu.
- [ ] GitHub Secrets eklendi (`GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SA_KEY`, `ARTIFACT_REGISTRY_REPO`).

### Vercel
- [ ] Production Branch = `main` ayarlandı.
- [ ] Root Directory = `frontend` ayarlandı.
- [ ] Environment Variables (Production ve Preview) eklendi.
- [ ] Domain `kutuly.com` bağlandı.

### Firebase
- [ ] Authorized domains'e `kutuly.com` ve `*.vercel.app` eklendi.

### İlk Deploy
- [ ] Prisma migration çalıştırıldı (`npx prisma migrate deploy`).
- [ ] Cloud Run servisi deploy edildi (GitHub Actions ile veya manuel).
- [ ] Vercel'de ilk deploy başarılı.
- [ ] `kutuly.com` çalışıyor ve backend'e bağlanıyor.

---

Bu kontrolleri tamamladıktan sonra proje production'da sorunsuz çalışmalı.
