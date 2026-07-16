# Branch Stratejisi ve Deployment İzolasyonu

Bu doküman, **yerel geliştirme** ile **GitHub üzerinden tetiklenen deploy**’ların nasıl ayrıldığını ve hangi branch’in nereye gideceğini açıklar.

---

## Özet

| Ortam | Branch (GitHub) | Frontend | Backend (Cloud Run) | Tetikleyen |
|--------|------------------|----------|----------------------|------------|
| **Yerel** | `main` / `feat` (push yok) | localhost:3000 | localhost:4000 | Siz çalıştırırsınız; **hiçbir şey otomatik tetiklenmez** |
| **Preview** | `feat` (push/merge) | Vercel Preview URL | Cloud Run Preview servisi | GitHub’a push → Vercel Preview + (isteğe bağlı) Backend Preview |
| **Canlı (Production)** | `main` (push/merge) | **kutuly.com** | Cloud Run Production servisi | GitHub’a push → kutuly.com + Backend Production |

**Önemli:** Bulut deploy’ları **sadece GitHub’a push/merge** ile tetiklenir. Bilgisayarınızda yaptığınız değişiklikler, push etmediğiniz sürece Cloud Run veya Vercel’i **hiç tetiklemez**.

---

## 1. Yerel Geliştirme (İzolasyon)

- `main` ve `feat` branch’lerinde normal geliştirmenizi yapın.
- `npm run dev` (frontend) ve backend’i local’de çalıştırın; `.env` / `.env.local` ile `localhost` kullanın.
- **Push etmediğiniz sürece** Vercel veya Cloud Run için hiçbir build/deploy tetiklenmez.
- İsterseniz sadece hazır olduğunuzda push edersiniz: `feat` → Preview, `main` → Production.

---

## 2. GitHub Branch’leri ve Ne Tetiklenir?

### `feat` branch’e push

- **Vercel:** `feat` için **Preview** deployment oluşur (örn. `kutu-xxx-feat-username.vercel.app`).
- **Cloud Run:** İsteğe bağlı **Preview** backend (ayrı servis, ayrı URL).  
  Bu repo’da `feat` için backend deploy’u **kapalı** tutulabilir; sadece frontend Preview yeterli olabilir.

### `main` branch’e push (veya merge)

- **Vercel:** **Production** deployment → **kutuly.com** güncellenir.
- **Cloud Run:** **Production** backend servisi güncellenir (GitHub Actions ile).

---

## 3. Vercel Ayarları (Yapmanız Gerekenler)

1. **Vercel Dashboard** → Projeniz → **Settings** → **Git**.
2. **Production Branch:** `main` seçin.  
   Böylece sadece `main`’e yapılan push/merge kutuly.com’u günceller.
3. Diğer branch’ler (örn. `feat`) otomatik olarak **Preview** deployment alır; Production branch dışındaki her branch Preview sayılır.
4. **Environment Variables:**
   - **Production:** `NEXT_PUBLIC_API_URL` = Production Cloud Run URL (örn. `https://kutu-backend-xxx.run.app/api`).
   - **Preview:** `NEXT_PUBLIC_API_URL` = İsterseniz Preview backend URL; yoksa Production backend’i kullanabilirsiniz.

Bu ayarlarla **yerel push’lar dışında** ekstra tetikleme olmaz; tetikleme tamamen GitHub’daki branch’e push/merge’e bağlıdır.

---

## 4. GitHub Actions (Backend Deploy)

- **`main`’e push:** Backend Docker image build edilir, Artifact Registry’e push edilir, **Production** Cloud Run servisine deploy edilir.
- **`feat`’e push:** Varsayılan olarak **çalışmıyor** (Preview backend istemiyorsanız). İsterseniz açılabilir; o zaman ayrı bir Cloud Run “preview” servisine deploy edilir.

Workflow dosyaları: `.github/workflows/deploy-backend-production.yml` (ve isteğe bağlı `deploy-backend-preview.yml`).

### Gerekli GitHub Secrets (Settings → Secrets and variables → Actions)

| Secret | Açıklama |
|--------|----------|
| `GCP_PROJECT_ID` | Google Cloud proje ID’niz (örn. `my-project-123`) |
| `GCP_REGION` | Cloud Run bölgesi (örn. `europe-west1`) |
| `GCP_SA_KEY` | Service Account JSON anahtarının **tüm içeriği**. Bu hesaba Artifact Registry yazma ve Cloud Run deploy yetkisi verin. |
| `ARTIFACT_REGISTRY_REPO` | Artifact Registry repo adı (örn. `kutu-repo`). Önce GCP’de bu repo’yu oluşturmanız gerekir. |
| `DATABASE_URL` | Cloud SQL bağlantı string’i (migration için gerekli). Format: `mysql://KULLANICI:SIFRE@/VERITABANI?host=/cloudsql/PROJE_ID:REGION:INSTANCE_ADI` |

**Preview backend kullanmayacaksanız:** `.github/workflows/deploy-backend-preview.yml` dosyasını silebilirsiniz; sadece Vercel Preview yeterli olur.

---

## 5. Vercel – Root Directory (Monorepo)

Repo kökünde hem `backend` hem `frontend` olduğu için:

1. Vercel → Projeniz → **Settings** → **General**.
2. **Root Directory:** `frontend` yapın (veya **Edit** → `frontend` yazıp kaydedin).
3. Böylece build ve deploy sadece `frontend` klasörüne göre çalışır.

---

## 6. Kısa Kontrol Listesi

- [ ] Vercel’de Production Branch = `main` yapıldı.
- [ ] Yerelde sadece istediğiniz zaman push ediyorsunuz; push etmeden geliştirme yapıyorsunuz.
- [ ] `feat` = Preview (Vercel Preview URL), `main` = kutuly.com + Production backend.
- [ ] GitHub Actions için `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SA_KEY`, `ARTIFACT_REGISTRY_REPO` secret olarak eklendi.

Bu yapı ile **yerel geliştirme** ile **Preview** ve **kutuly.com canlı** ortamları net şekilde izole edilmiş olur.
