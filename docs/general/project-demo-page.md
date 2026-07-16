# Proje demo sayfası (`/demo`)

Her projede ziyaretçilerin **uygulamanın ne yaptığını** kısa sürede anlaması için tek bir sayfa: proje videosu, kısa açıklama, teknoloji ve linkler.

Bu dosya **tüm projelere aynen kopyalanır**. Proje özel bilgileri en alttaki şablona yazılır.

---

## Rota adı: `/demo` (önerilen)

| Rota | Ne zaman |
|------|----------|
| **`/demo`** | **Önerilen.** Ürün tanıtımı / ekran kaydı sayfası. Kısa, net, endüstride yaygın. |
| `/showcase` | Portfolyo veya vitrin hissi istiyorsan alternatif. |
| `/preview` | **Kaçın.** Bu repolarda `preview` zaten **deploy ortamı** anlamına geliyor (`*-preview` Cloud Run servisleri, `docker-compose.preview.yml`, `feat/*` branch preview). Karışıklık yaratır. |

Örnek URL: `https://myedura.com/demo`, `https://bhmcontrol.com/demo`

---

## Sayfanın amacı

Ziyaretçi (işveren, müşteri, kullanıcı) şunları **30–90 saniyede** anlamalı:

1. Bu proje **kime / hangi probleme** hizmet ediyor?
2. **Nasıl görünüyor / nasıl çalışıyor?** (video)
3. **Hangi teknolojiler** kullanıldı?
4. Canlı site veya kaynak kod **nerede?**

Bu sayfa **canlı uygulamanın yerine geçmez**; tanıtım ve ön bilgi verir. Giriş gerektiren uygulamalarda özellikle faydalıdır.

---

## İçerik şablonu (her projede doldur)

Sayfada sırasıyla şunlar olsun:

### 1. Başlık alanı
- Proje adı
- Tek cümle değer önerisi (TR; isteğe bağlı EN)
- İsteğe bağlı: durum rozeti (`Beta`, `Canlı`, `Kişisel proje`)

### 2. Video (ana içerik)
- **16:9** embed veya `<video>`; mobilde tam genişlik
- Süre hedefi: **1–4 dakika** (uzunsa bölümlere ayır veya açıklamada zaman damgası ver)
- Ses + kısa anlatım veya altyazı

### 3. Kısa metin (3–5 madde)
- **Problem:** Kimin hangi ihtiyacı?
- **Çözüm:** Uygulama ne yapıyor?
- **Öne çıkan özellikler:** 2–4 madde
- **Rolün:** Sen ne yaptın? (full-stack, sadece frontend, vb.)

### 4. Teknoloji
- Chip / tag listesi: `React`, `Node.js`, `MySQL`, …

### 5. Linkler
- Canlı site (varsa)
- GitHub / repo (public ise)
- İletişim veya portfolyo (`hasanvural.com`)

### 6. İsteğe bağlı
- Ekran görüntüsü galerisi (video öncesi/sonrası)
- Video altında **bölüm zaman damgaları** (0:00 Giriş, 0:45 Dashboard, …)
- TR + EN metin (projede i18n varsa)

---

## Video nerede barınır?

| Yöntem | Artı | Eksi | Ne zaman |
|--------|------|------|----------|
| **YouTube (Unlisted)** | Kolay embed, bant genişliği sende değil | YouTube markası | **Varsayılan öneri** |
| **Vimeo** | Temiz oynatıcı | Ücretsiz kotası sınırlı | Profesyonel vitrin |
| **`public/` içinde MP4** | Tam kontrol, offline demo | Repo/bucket boyutu, CDN | Kısa (<30 MB) klip |
| **GCS + signed URL** | Büyük dosya, private bucket | Kurulum biraz daha fazla | Hassas / büyük demo |

YouTube embed örneği (video ID’yi değiştir):

```html
<div class="aspect-video w-full overflow-hidden rounded-2xl">
  <iframe
    class="h-full w-full"
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="Proje demo videosu"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  />
</div>
```

Self-hosted MP4 (Vite/React `public/demo/demo.mp4`):

```html
<video class="aspect-video w-full rounded-2xl" controls playsInline preload="metadata" poster="/demo/poster.jpg">
  <source src="/demo/demo.mp4" type="video/mp4" />
</video>
```

---

## Uygulama — Vite + React + TanStack Router

hasanvuralcom, BHM, Godiva vb. SPA projeleri için.

### Dosyalar

```
client/src/routes/demo.tsx          ← sayfa
client/public/demo/                 ← poster.jpg, demo.mp4 (self-hosted ise)
```

### Route dosyası (minimal örnek)

`client/src/routes/demo.tsx`:

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { useI18n } from '@/lib/i18n'
import { useSeo } from '@/lib/seo'

// Proje özel — kopyalarken güncelle
const DEMO = {
  projectName: 'Edura',
  taglineTr: 'Öğretmenler ve öğrenciler için modern eğitim platformu.',
  taglineEn: 'A modern learning platform for teachers and students.',
  youtubeId: 'VIDEO_ID', // veya null → self-hosted video kullan
  videoSrc: null as string | null, // örn. '/demo/demo.mp4'
  poster: '/demo/poster.jpg',
  featuresTr: ['Canlı ders odaları', 'Ödev takibi', 'Rol tabanlı erişim'],
  featuresEn: ['Live classrooms', 'Assignment tracking', 'Role-based access'],
  techStack: ['React', 'Node.js', 'MySQL', 'Socket.io'],
  liveUrl: 'https://myedura.com',
  repoUrl: null as string | null,
}

export const Route = createFileRoute('/demo' as any)({
  component: DemoPage,
})

function DemoPage() {
  const { locale, t } = useI18n()
  const tagline = locale === 'en' ? DEMO.taglineEn : DEMO.taglineTr
  const features = locale === 'en' ? DEMO.featuresEn : DEMO.featuresTr
  useSeo(
    `${DEMO.projectName} Demo | Hasan Vural`,
    tagline,
  )

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/" className="mb-6 inline-flex text-sm font-medium text-primary hover:underline">
        ← {t('Ana sayfa', 'Home')}
      </Link>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{t('Demo', 'Demo')}</p>
        <h1 className="mt-2 font-headline text-3xl font-bold md:text-4xl">{DEMO.projectName}</h1>
        <p className="mt-3 text-lg text-on-surface-variant">{tagline}</p>
      </header>

      <div className="mb-10 aspect-video overflow-hidden rounded-2xl border border-slate-200/80 bg-black">
        {DEMO.youtubeId ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${DEMO.youtubeId}`}
            title={`${DEMO.projectName} demo`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : DEMO.videoSrc ? (
          <video className="h-full w-full" controls playsInline preload="metadata" poster={DEMO.poster}>
            <source src={DEMO.videoSrc} type="video/mp4" />
          </video>
        ) : (
          <p className="flex h-full items-center justify-center text-white/70">
            {t('Video yakında eklenecek.', 'Video coming soon.')}
          </p>
        )}
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">{t('Öne çıkanlar', 'Highlights')}</h2>
        <ul className="list-inside list-disc space-y-1 text-on-surface-variant">
          {features.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {DEMO.techStack.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{t('Teknolojiler', 'Tech stack')}</h2>
          <div className="flex flex-wrap gap-2">
            {DEMO.techStack.map((tech) => (
              <span key={tech} className="rounded-lg bg-surface-container-low px-3 py-1 text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {DEMO.liveUrl ? (
          <a href={DEMO.liveUrl} className="btn-primary" target="_blank" rel="noreferrer">
            {t('Canlı site', 'Live site')}
          </a>
        ) : null}
        {DEMO.repoUrl ? (
          <a href={DEMO.repoUrl} className="btn-secondary" target="_blank" rel="noreferrer">
            {t('Kaynak kod', 'Source code')}
          </a>
        ) : null}
      </div>
    </article>
  )
}
```

### SPA routing

`client/nginx.conf` zaten `try_files $uri /index.html` kullanıyorsa ek ayar gerekmez. `/demo` doğrudan çalışır.

### Navigasyon

Ana menüye **zorunlu değil**. Önerilen yerler:

- Footer’da küçük “Demo” linki
- Ana sayfa hero’da ikincil CTA: “Demoyu izle”
- Portfolyo (`hasanvural.com`) proje kartında “Demo” butonu → `https://{domain}/demo`

---

## Uygulama — Next.js (App Router)

Edura gibi `app/` yapılı projeler için.

```
app/demo/page.tsx
public/demo/poster.jpg
public/demo/demo.mp4   (isteğe bağlı)
```

`app/demo/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

const DEMO = {
  projectName: 'Edura',
  description: 'Öğretmenler ve öğrenciler için modern eğitim platformu.',
  youtubeId: 'VIDEO_ID',
  techStack: ['Next.js', 'Node.js', 'MySQL'],
  liveUrl: 'https://myedura.com',
}

export const metadata: Metadata = {
  title: `${DEMO.projectName} Demo`,
  description: DEMO.description,
  openGraph: {
    title: `${DEMO.projectName} Demo`,
    description: DEMO.description,
    images: ['/demo/poster.jpg'],
  },
}

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-primary hover:underline">← Ana sayfa</Link>
      <h1 className="mt-6 text-4xl font-bold">{DEMO.projectName}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{DEMO.description}</p>
      <div className="mt-8 aspect-video overflow-hidden rounded-2xl">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${DEMO.youtubeId}`}
          title={`${DEMO.projectName} demo`}
          allowFullScreen
        />
      </div>
    </main>
  )
}
```

---

## SEO ve paylaşım

- `document.title` / `metadata.title`: `{ProjeAdı} Demo | Hasan Vural` veya sadece `{ProjeAdı} Demo`
- `description`: tagline ile aynı cümle
- Open Graph görseli: video poster karesi (`1200×630` önerilir)
- Sayfa **indexlenebilir** olsun (`noindex` kullanma); portfolyo ve LinkedIn paylaşımları için faydalı

---

## Video çekim checklist (kısa)

- [ ] 1920×1080 veya 1280×720, 30 fps yeterli
- [ ] İlk 5 saniyede proje adı + ne işe yaradığı (metin overlay veya sözlü)
- [ ] Gerçek arayüz; lorem ipsum veya boş ekran yok
- [ ] Kritik akış: giriş → ana ekran → 1–2 özellik
- [ ] Mümkünse demo hesabı veya seed verisi hazır
- [ ] Export: MP4 (H.264); YouTube’a yükle → Unlisted → embed ID kopyala
- [ ] Poster karesi export et (`poster.jpg`)

---

## Projeye ekleme checklist

Her yeni projede sırayla:

- [ ] Rota: `/demo` (veya bilinçli olarak `/showcase`)
- [ ] `demo.tsx` / `app/demo/page.tsx` oluştur; `DEMO` sabitlerini doldur
- [ ] Video yükle (YouTube veya `public/demo/`)
- [ ] Poster + OG görseli
- [ ] Canlı site / repo linklerini doğrula
- [ ] Footer veya ana sayfadan link (isteğe bağlı)
- [ ] `hasanvural.com` portfolyo proje kaydına demo URL ekle: `https://{domain}/demo`
- [ ] Mobil ve masaüstünde embed test et
- [ ] Production deploy sonrası smoke: `curl -I https://{domain}/demo` → 200

---

## Proje özel notlar (kopyalarken doldur)

Aşağıyı her repo’da güncelle:

```markdown
### {Proje adı}
- Domain: https://...
- Demo URL: https://.../demo
- Video: YouTube Unlisted — VIDEO_ID: ...
- Repo yolu: client/src/routes/demo.tsx (veya app/demo/page.tsx)
- Nav: footer link / hero CTA / yok
- Not: ...
```

### Örnek — Edura
- Domain: https://myedura.com
- Demo URL: https://myedura.com/demo
- Stack: Next.js + Node API
- Video: (henüz yok — placeholder metin göster)

### Örnek — BHM Control
- Domain: https://bhmcontrol.com
- Demo URL: https://bhmcontrol.com/demo

### Örnek — Godiva Elix
- Domain: https://godivaelix.com
- Demo URL: https://godivaelix.com/demo

### Örnek — hasanvuralcom
- Domain: https://hasanvural.com
- Portfolyo projeleri için ayrı `/demo` gerekmez; proje detay sayfasına video alanı eklenebilir (ileride)

---

## İlişkili dokümanlar

- Portfolyo proje kartı tasarımı (video alanı): `docs/website-logic/google-stitch-prompt.md`
- Docs’u diğer projelere kopyalama: `docs/website-logic/DOCS-SYNC-TO-OTHER-PROJECTS.md`

**Son güncelleme:** 2026-06-30
