## Google Cloud Migration Plan – Özet Konfigürasyonlar

Bu dosya, migration runbook’tan bağımsız olarak, projeler için hedeflenen **kaynak boyutlarını** ve konfigürasyon aralıklarını kısa ve tekrarlanabilir bir referans olarak tutar. Detaylı adımlar ve mimari için `docs/website-logic/google-cloud-migration-runbook.md` dosyasına bakılmalıdır.

### Güncel durum (31.03.2026)

- **Tamamlandı**: BHM + Godiva foodistopia prod ortamları ayakta.
- **Tamamlandı**: BHM + Godiva SQL import ve storage migration.
- **Tamamlandı**: Eski BHM/Godiva Cloud SQL maliyeti kesildi (`NEVER/STOPPED`).
- **Tamamlandı**: Eski Edura billing kapatıldı.
- **Tamamlandı (27.03.2026)**: Eski hesaplarda maliyet yüzeyi kapatıldı:
  - `hvworkcloud1@gmail.com`: Tüm GCP projelerinde billing unlink; `bhmcontrol`, `godiva-elix` ve diğer projeler silindi (hesapta proje kalmadı).
  - `hasanvuralwork@gmail.com`: `edura-7a1e1`, `gen-lang-client-*` ve “My First Project” projeleri silindi (silme işlemi tamamlanınca listeden düşer).
- **Güncellendi (31.03.2026)**: `foodistopia-edura` billing başarıyla bağlandı (quota, ekstra faturalı proje temizlenerek açıldı).
- **Tamamlandı (31.03.2026)**: Edura için API enable + IAM admin SA + private Cloud SQL (`edura-sql`) + SQL import + storage copy.
- **Tamamlandı (31.03.2026)**: Edura Cloud Run servisleri ayakta:
  - API (prod): `https://edura-api-vp7326vlma-ew.a.run.app`
  - API (preview): `https://edura-api-preview-vp7326vlma-ew.a.run.app`
- **Tamamlandı (31.03.2026)**: BHM + Godiva + Edura için full re-verify yapıldı:
  - Billing: 3 proje bağlı/aktif (`foodistopia-*`), eski iki hesapta aktif proje kalmadı.
  - API/IAM/SQL: 3 projede minimum/private standardı uyumlu (`db-g1-small`, `10 GB`, public IP kapalı).
  - Secret/Run: kritik secret’lar ve Cloud Run servisleri doğrulandı.
- **Tamamlandı (31.03.2026)**: BHM/Godiva Cloud Build trigger setleri (prod + preview) aktif ve doğrulandı.
- **Tamamlandı (31.03.2026)**: Godiva custom domain canlıya alındı:
  - `godivaelix.com` -> `foodistopia-godiva` / `godiva-elix-web`
  - DNS + Search Console domain doğrulaması tamamlandı.
- **Bekliyor (31.03.2026)**: Edura Cloud Build trigger’ları için GitHub bağlantı yetkisi (OAuth credential) yeniden doğrulanmalı.

### Godiva domain mapping notu (31.03.2026)

- İlk denemede domain mapping çakışması alındı (`already mapped to another service`).
- Kök neden: eski `godiva-elix` projesinde (restore sonrası) kalan `godivaelix.com` mapping kaydı.
- Çözüm:
  1. Eski proje restore edildi.
  2. Eski proje namespace altındaki domain mapping silindi.
  3. Eski proje tekrar delete edildi.
  4. Yeni projede (`foodistopia-godiva`) mapping başarılı şekilde oluşturuldu.

### Edura blocker notu (31.03.2026 - güncel)

- Billing quota blokajı **aşıldı**:
  - `project-6d0961bc-4ae8-4e9e-bc9` projesinde açık billing unlink + proje silme sonrası
  - `foodistopia-edura` billing link başarılı oldu.
- Kalan tek blocker:
  - Cloud Build GitHub connection oluştururken OAuth credential `401 Bad credentials` hatası alındı.
  - Bu nedenle Edura’da branch bazlı (`feat/*`, `main`) repo trigger kurulumu tamamlanamadı.
  - Fallback: deploy akışı manuel build ile çalışır durumda:
    - `gcloud builds submit c:\\All-around\\hasanvuralcom\\tmp-edura-src\\source2.tgz --project=foodistopia-edura --tag=gcr.io/foodistopia-edura/edura-api:<tag>`
    - Sonrasında `gcloud run deploy edura-api` / `edura-api-preview` komutlarıyla rollout yapılır.

#### Cloud Build bağlantısı açılınca tek seferlik hızlı checklist

1. Edura projesinde GitHub bağlantısını yeniden authorize et (correct installation).
2. Repository resource’u bağla.
3. Trigger’ları oluştur:
   - `edura-backend-deploy` (`^main$`)
   - `edura-backend-preview` (`^feat/.*`)
4. Trigger substitutions:
   - `_SERVICE=edura-api` / `_SERVICE=edura-api-preview`
   - `_REGION=europe-west1`

---

### Proje 1: Cloud SQL Instance

**Genel hedef:** Maliyet düşük, ama prod için yeterli performans sağlayan en küçük konfigürasyon.

- **Konfigürasyonlar (hedef aralık):**
  - **RAM**: 2 GB (minimum hedef)  
    - GCP tarafında gerçek seçenekler, seçilen seri ve vCPU sayısına göre 2–4 GB bandında olacaktır.
  - **Depolama**: 10 GB (başlangıç)  
    - Gerekirse otomatik büyümeyle 20 GB, 50 GB ve üstüne çıkarılabilir.
  - **Public IP**: Kapalı
  - **Erişim**:
    - Cloud Run → Cloud SQL connector (private IP)
    - Local geliştirme → Cloud SQL Auth Proxy (sadece senin IAM hesabın)

---

### Proje 2: Cloud Run Servisleri

**Genel hedef:** Her projede backend/frontend için prod + preview servisleri, en küçük kaynaklarla.

- **Konfigürasyonlar (hedef aralık):**
  - **RAM**: 0.5–2 GB (uygulama ihtiyacına göre, başlangıçta düşük)
  - **CPU**: 0.25–1 vCPU (minimum yeterli değer)
  - **Min instances**: 0 (trafik yokken maliyet olmasın)
  - **Max instances**: 5–10 (yük durumuna göre ölçeklenebilir)
  - **Concurrency**: 10–80 (uygulamanın state/performans ihtiyacına göre)

Not: Cloud Run’da “kalıcı disk boyutu” yok; sadece geçici `/tmp` alanı var. Depolama için Cloud SQL veya Cloud Storage kullanılmalı.

---

### Proje 3: Cloud Build (CI/CD)

**Genel hedef:** Build süreleri makul, maliyet düşük; prod/preview için 4 trigger yapısı.

- **Konfigürasyonlar (hedef aralık):**
  - **Makine tipi**: En küçük uygun build machine (örn. `e2-medium` benzeri) – proje ihtiyacına göre.
  - **Depolama**: Cloud Build kendi geçici disklerini yönetir; ekstra disk seçimi yoktur.
  - **Trigger yapısı**:
    - `feat/*` → preview backend/frontend
    - `main` → prod backend/frontend
  - **Substitution değişkenleri**:
    - `_SERVICE`, `_REGION`, `_NEXT_PUBLIC_API_URL`, `_NEXT_PUBLIC_SOCKET_URL` vb.

---

### Proje 4: Cloud Storage

**Genel hedef:** Sadece ihtiyaç kadar depolama, mümkün olduğunca düşük maliyet.

- **Konfigürasyonlar (hedef aralık):**
  - **RAM**: Yok (Cloud Storage için geçerli değil)
  - **Depolama**:
    - Başlangıç hedefleri: 10 GB, 20 GB, 50 GB aralığı
    - Gerçek kullanım arttıkça otomatik ölçeklenir; bu değerler sadece maliyet planlaması için referans.
  - **Storage Class**:
    - Sık erişilen dosyalar için `Standard`
    - Arşiv/seyrek erişim için ileride daha ucuz sınıflar (Nearline, Coldline) değerlendirilebilir.
  - **Public Access**:
    - Varsayılan: Kapalı
    - Sadece gerekirse, belirli bucket/objeler kontrollü şekilde public yapılır.

---

### Migrations Bilgisi – Seviye Aralıkları

Her proje için en küçük konfigürasyon **aralığı** (hedef “başlangıç” ve büyüme opsiyonları):

- **RAM (uygulama/DB için)**:
  - 2 GB → başlangıç
  - 4 GB → orta seviye
  - 8 GB → yoğun trafik / ağır query’ler

- **Depolama (SQL/Storage için)**:
  - 10 GB → başlangıç
  - 20 GB → orta seviye
  - 50 GB → daha büyük veri setleri

Bu dosya, ileride yeni projeler eklerken veya mevcut projeleri ölçeklerken “hangi seviyeden başlamalıyız, nereye kadar çıkabiliriz?” sorusuna hızlı yanıt vermek için referans olarak kullanılabilir. Detaylı operasyon adımları ve IAM/Run/SQL tasarımı için `google-cloud-migration-runbook.md` dokümanına bakılmalıdır.

