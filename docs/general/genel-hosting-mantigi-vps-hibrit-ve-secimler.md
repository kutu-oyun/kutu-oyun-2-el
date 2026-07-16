# Genel hosting mantığı — VPS, Docker, hibrit ve platform seçimleri

Bu doküman, Google Cloud dışında veya onunla birlikte düşünülebilen **sürdürülebilir hosting** yaklaşımını tek yerde toplar: **tek VPS’te çok site**, **secret ve yedekleme**, **hibrit (CDN/Pages + API sunucusu)**, **sağlayıcı seçimi** ve **Next.js / edge platformları** (ör. Cloudflare Pages, Vercel) ile ilgili karar çerçevesi.

Bu metin **karar ve mimari referansıdır**; belirli bir repoya kilitli komutlar içermez. İleride uygulama adımları ayrı runbook’lara bölünebilir.

---

## 1. Amaç ve kapsam

**Amaç:**

- Projeleri **öngörülebilir maliyet** ve **aşırı platform göçü olmadan** barındırmak.
- “Sürekli trial / 90 gün / 609 gün” avcılığına düşmeden, **net bir maliyet ve operasyon modeli** tanımlamak.
- İhtiyaç halinde **hibrit** kullanmak: statik veya edge-friendly frontend bir yerde, API ve veritabanı başka yerde.

**Kapsam dışı (bu dosyada detaylandırılmaz):**

- Mevcut **Google Cloud migration** adımları → `google-cloud-migration-runbook.md` ve `google-cloud-migration-plan.md`.
- Branch → Cloud Build → Cloud Run akışı → `general-deployment-logic-Hasan.md`.

---

## 2. Gerçekçi çerçeve: “Tamamen ücretsiz + sınırsız + prod kalitesi”

| Beklenti | Değerlendirme |
|----------|----------------|
| Sonsuza kadar %100 ücretsiz, kotasız üretim (SQL + API + sürekli çalışma) | Pratikte **yok**; ücretsiz katmanlar kota, uyku modu veya politika değişimine açıktır. |
| Tek seferlik kurulum, yıllarca hiç dokunmama | Nadiren mümkün; **yedekleme, güvenlik yaması, sürüm yükseltme** gerekir. |
| Düşük sabit maliyet + kontrol sende | **VPS + Docker** veya benzeri **self-managed** model ile en yakın deneyim. |

Sonuç: Hedef, “sıfır maliyet” yerine **düşük ve tahmin edilebilir maliyet** + **az sayıda taşınacak parça** olmalıdır.

---

## 3. Tek VPS’te birden fazla site mi, site başına ayrı VPS mi?

### 3.1 Önerilen başlangıç (çoğu solo / küçük trafik senaryosu)

**Tek VPS üzerinde birden fazla site (uygulama), domain ile ayrım.**

- **Reverse proxy** (ör. Traefik, Caddy, nginx): `site1.com`, `site2.com`, `api.site1.com` → farklı container veya servisler.
- **Docker Compose** veya benzeri: Her proje için ayrı servis seti; kaynak limitleri ile birbirini boğmayı azaltma imkânı.

**Avantajlar:** Düşük maliyet, tek SSH, tek yedek stratejisi, operasyon basit.

**Riskler:** Aynı makinede **blast radius** (bir uygulama veya güvenlik olayı diğerlerini etkileyebilir); bir site kaynak tüketirse diğerleri yavaşlayabilir.

### 3.2 Site başına ayrı VPS ne zaman mantıklı?

- Farklı müşteriler veya **veri izolasyonu** (regülasyon, sözleşme).
- Trafiği veya risk profili **çok farklı** uygulamalar (biri diğerini sürekli etkiliyorsa).
- Bir uygulama için **farklı OS / runtime** zorunluluğu.

### 3.3 Özet karar

| Durum | Öneri |
|-------|--------|
| Birkaç kişisel / küçük ticari proje, benzer stack | **Tek VPS**, çok site; büyüyen siteyi **sonradan** ayır. |
| İzolasyon veya ölçek nedeniyle ayrım şart | **Site başına VPS** (veya ayrı VM). |

---

## 4. VPS + Docker: veritabanı dışı “secret”lar ve yedekleme

### 4.1 Secret’ların yönetimi

Veritabanı bağlantı dizesi dışında da **JWT, API anahtarları, SMTP, üçüncü parti token** vb. gizli kalır. Google Secret Manager’a denk düşen pratik seçenekler:

| Yaklaşım | Ne zaman uygun? |
|----------|------------------|
| Sunucuda **`.env`** (repoya girmez), Docker `env_file` / `environment` | Solo, tek veya az VPS; en sık kullanılan, basit model. |
| **Docker secrets** veya dosyayı **salt okunur mount** | Biraz daha sıkı ayrım istenince. |
| **SOPS** vb. ile şifreli env (anahtar ayrı tutulur) | Repo’da tutulacak yapılandırma için. |
| **Doppler, Infisical** vb. (çoğunda küçük ücretsiz plan) | Çok makine veya ekip senkronu. |

**İlkeler:** Secret asla repoya commit edilmez; CI/CD’de **ortam secret**’ları ile enjekte edilir; sunucuda dosya izinleri kısıtlı tutulur (`chmod 600` benzeri).

### 4.2 Yedekleme

- **Veritabanı:** Düzenli mantıksal yedek (`pg_dump` / engine’e uygun araç). Yedek **aynı sunucuda tek kopya** olarak bırakılmamalı.
- **Hedef:** S3 uyumlu ucuz nesne depolama veya ikinci bölge; mümkünse **şifreli** arşiv.
- **Sıklık ve saklama:** Örn. günlük artımlar + haftalık tam; 7/30 gün retention gibi net kural.

Bu model, yönetilen bulutun “otomatik backup”ına denk gelir; sorumluluk ve kontrol **sende** olur.

---

## 5. Hibrit mimari: statik/edge frontend + API ve DB sunucuda

### 5.1 Fikir

- **Frontend:** Statik export veya edge/CDN dostu build → **Cloudflare Pages** veya **Netlify** gibi platformlardan biri (tercihen **tek ekosistem** seçmek, panel ve limit karmaşasını azaltır).
- **Backend + ilişkisel DB:** **VPS + Docker** (veya managed DB; maliyet ve kilitlenme artar).

API genelde `api.alanadin.com` gibi bir alt alan adı ile VPS’teki reverse proxy’ye yönlendirilir; frontend build sırasında public API tabanı bu adrese işaret eder.

### 5.2 “Her ücretsiz servisten bir parça” toplamak

Mümkündür ancak parça sayısı arttıkça **arıza yüzeyi**, **limit politikaları** ve **geçiş maliyeti** artar. Sürdürülebilirlik için genelde:

- **Bir CDN/Pages sağlayıcısı** (Cloudflare *veya* Netlify) + **bir backend barındırma modeli** (VPS) yeterlidir.

---

## 6. Sağlayıcı ve kredi: örnekler

### 6.1 VPS sağlayıcıları (genel çerçeve)

- **Hetzner** vb.: Fiyat/performans sık tercih edilir; Avrupa bölgeleri.
- **DigitalOcean, Linode (Akamai)** vb.: Arayüz ve dokümantasyon güçlü; fiyat genelde biraz daha yüksek olabilir.
- **OVH, Scaleway** vb.: Alternatifler.
- **Contabo** vb.: Ucuz; beklenti yönetimi (destek, tutarlılık) kullanıcıya bağlıdır.

Seçim: **Bölge** (kullanıcılar nerede), **SLA ihtiyacı**, **fiyat**, **snapshot/backup** alışkanlığı.

### 6.2 DigitalOcean (veya benzeri) promosyon kredisi

- Kredi **sonlu** süre veya **sonlu tutar** ile gelir; **biter**; kalıcı bütçe planı yapılmalıdır.
- Tüketim hızı: Büyük droplet, managed DB, load balancer, yüksek trafik → kredi hızlı erir; küçük VM + kontrollü servis → daha yavaş erir.
- **Mantıklı kullanım:** Öğrenme, staging, üretim denemesi; kredi bitince **aynı Docker tanımı** ile daha ucuz VPS’e geçiş mümkün olsun diye **platforma aşırı kilitlenmemek**.

---

## 7. Next.js ve edge platformları: Cloudflare Pages vs Vercel (Edura benzeri senaryolar)

### 7.1 Cloudflare Pages ile sürtünme

Next.js’in **dinamik SSR**, belirli **Node API**’leri, **ISR**, **middleware** gibi özellikleri, edge/Pages ortamında **kısıtlı veya farklı** davranabilir. Bu, “build alıyor ama prod’da kırılıyor” tipi sorunlara yol açabilir.

### 7.2 Vercel

Next.js ekosistemi ile **yüksek uyum** beklenir; birçok ekip için **en az sürtünmeli** barındırma seçeneğidir. Karşılığında **fiyatlandırma** ve **platforma bağlılık** vardır.

### 7.3 Üçüncü yol: tam Node ortamı

Next’i **VPS üzerinde Node sunucusu** olarak çalıştırmak (Docker ile): Cloudflare/Vercel edge kısıtlarından kaçınır; CDN, SSL, deploy süreci kullanıcı sorumluluğunda olur.

**Özet:** Pages’te zorlanıp Vercel’e geçmek **teknik olarak sık görülen ve makul bir yoldur**. Uzun vadede maliyet veya bağımlılık sorun olursa, mimari **standart Node + container** olacak şekilde tasarlanırsa taşınabilirlik artar.

---

## 8. Google Cloud ve billing — karar (2026-06)

**Prod kararı netleşti:** BHM, Godiva, Edura ve hasanvural.com **hvworkcloud2@gmail.com** hesabında **tek GCE VM + Docker Compose** üzerinde çalışır.

- **Güncel runbook:** [gce-vps-migration-runbook.md](./gce-vps-migration-runbook.md)
- **Deploy modeli:** [general-deployment-logic-Hasan.md](./general-deployment-logic-Hasan.md) Bölüm 12
- **Legacy:** [google-cloud-migration-runbook.md](./google-cloud-migration-runbook.md)

Trial bitişi (≈ Eylül 2026) öncesi budget alert + Hetzner taşıma planı değerlendirilir.

---

## 9. Bu dokümanın özeti (tek bakışta)

| Konu | Özet öneri |
|------|------------|
| Çok site | Başlangıçta **tek VPS**, domain/container ayrımı; gerektiğinde bir siteyi ayır. |
| Secret | Sunucuda kontrollü `.env` + Docker; ileride Doppler/Infisical opsiyonel. |
| Yedek | DB düzenli dışarı; aynı diskte tek kopya yetmez. |
| Hibrit | Tek Pages/Netlify ekosistemi + API/DB VPS; parça sayısını sınırlı tut. |
| DO kredi | Kullanışlı ama **biter**; çıkış planı ve düşük kilitlenme. |
| Next + Pages sorunları | **Vercel** sık mantıklı çıkar; alternatif **VPS’te tam Node**. |
| GCP billing | **hvworkcloud2 GCE VPS** — [gce-vps-migration-runbook.md](./gce-vps-migration-runbook.md) |

---

*Son güncelleme: Bu dosya “şimdilik böyle kalalım” notuyla oluşturulmuştur; kararlar netleştikçe tek satırlık güncellemeler veya bağlantılar eklenebilir.*
