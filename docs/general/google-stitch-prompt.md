# Google Stitch Tasarım Promptu - Kisisel Web Sitesi

Asagidaki talebe gore modern, premium gorunumlu, net ve okunabilir bir **kisisel portfolyo web sitesi** tasarla. Tasarim hem masaustu hem mobilde kusursuz calissin.

## Marka ve Genel Tarz
- Hedef: Kaliteli, guven veren, sade ama etkileyici bir personal brand deneyimi
- Stil: Minimal + premium, "quality flowing" hissi, temiz bosluk kullanimi, guclu hiyerarsi
- Ton: Profesyonel, sicak, teknik olarak guvenilir
- Dil: Turkce arayuz (gerekirse EN opsiyonu)
- Animasyon: Akici, dikkat dagitmayan micro-interactions (hover, card transition, section reveal)

## Renk ve Tipografi Sistemi
- Renk paleti:
  - Ana renk: #0EA5A4 (ferah turkuaz-yesil)
  - Ikincil vurgu: #2563EB (canli mavi)
  - Destek vurgu: #22C55E (dogal yesil)
  - Acik arkaplan: #F0FDF9 (mintimsi ferah ton)
  - Yuzey/kart tonu: #ECFEFF (soft aqua)
  - Metin ana: #0F172A
  - Metin ikincil: #334155
  - Vurgu gradient onerisi: #22C55E -> #14B8A6 -> #3B82F6
- Kontrast WCAG uyumlu olsun, okunabilirlik oncelikli olsun
- Tipografi: Basliklarda guclu ve modern sans-serif, govdede yuksek okunabilirlik
- 8px tabanli spacing sistemi kullan

## Sayfa Yapisi ve Bolumler
1. Hero
   - Isim, unvan, kisa deger onerisi
   - "Projelerimi Gor" ve "Iletisime Gec" CTA
   - Hafif hareketli arkaplan veya gradient glow
2. Hakkimda
   - Kisa tanitim, neye odaklandigim, hangi problemlere hizmet ettigim
3. Projeler (en kritik bolum)
   - Projeler sirasiyla gezilebilsin:
     - Sol/Sag navigation oklari VEYA yatay slider VEYA timeline tabanli gecis
   - Proje kartinda su alanlar mutlaka olsun:
     - Proje adi
     - Kisa aciklama (neye hizmet ediyor)
     - Kullanilan teknolojiler (tag/chip)
     - Proje adresi (live link)
     - Kaynak kod linki (varsa)
     - Video/demo (embed veya acilir modal)
     - Gorsel/kapak
   - Projeler arasi geciste yumusak animasyonlar:
     - Fade + slide kombinasyonu
     - Kart odaklandiginda hafif scale/shine efekti
4. Egitim
   - Okul/egitim programlari kronolojik sirada
   - Hangi bilgi alanlarina katkisi oldugu
5. Sertifikalar
   - Sertifika adi, kurum, tarih
   - Istersen dogrulama linki
6. Okudugum Kitaplar
   - Kitap adi, yazar, kategori
   - "Bu kitaptan kazandigim beceriler" notu
7. Yetenekler
   - Teknik yetenekler (frontend, backend, veritabani, devops vb.)
   - Soft skills (problem solving, iletisim, ownership vb.)
   - Yetenek seviyelerini sade progress/bar yerine premium chip matrisiyle goster
8. Iletisim
   - E-posta, LinkedIn, GitHub, diger sosyal adresler
   - Kisa mesaj formu (istege bagli)

## Etkilesim ve UX Kurallari
- Sticky ama sade bir navbar
- Section bazli scroll spy
- "Back to top" butonu
- Klavye ile gezilebilirlik (accessibility)
- Hover/Focus durumlari belirgin olsun
- Yuklenme hissi icin skeleton veya soft reveal kullan
- Mobilde proje gecisleri swipe ile desteklensin

## Teknik Beklentiler (tasarima yon veren)
- Component tabanli dusun (Hero, ProjectCarousel, Timeline, CertificateGrid, BookShelf vb.)
- Kart sistemleri yeniden kullanilabilir olsun
- Tema yaklasimi: tek tema kullanilabilir; dark/light zorunlu degil
- Performans dostu, gereksiz agir efektlerden kacinin

## Cikti Formati
Asagidakileri birlikte uret:
1. Sayfanin tam wireframe akisi
2. Yuksek seviye UI stil rehberi (renk, tipografi, spacing, button/card stilleri)
3. Projeler bolumu icin en az 2 alternatif layout:
   - A: Oklarla gezen carousel
   - B: Timeline + detay panel
4. Mobil versiyonlarin duzen mantigi
5. Mikro animasyon prensipleri (sure, easing, gecis mantigi)

Sonuc: Ziyaretciye "bu kisi hem estetik hem teknik olarak cok guclu" hissi veren, net, akici ve premium bir portfolyo deneyimi.
