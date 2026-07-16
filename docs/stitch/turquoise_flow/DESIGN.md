# Tasarım Sistemi: Premium Portfolio Framework

Bu doküman, kişisel portföy projeleri için geliştirilen, "kaliteli akış" (quality flowing) felsefesini temel alan özel bir tasarım dilini tanımlar. Standart bir grid yapısının ötesine geçerek, editoryal bir derinlik ve prestij hissi uyandırmayı hedefler.

---

## 1. Vizyon ve Kreatif Kuzey Yıldızı: "The Liquid Curator"

Bu tasarım sisteminin ana vizyonu **"The Liquid Curator"** (Akışkan Küratör) yaklaşımıdır. Geleneksel portföylerin kutu kutu duran statik yapısını reddeder; bunun yerine içeriklerin birbirine organik geçişlerle bağlandığı, premium bir dergi mizanpajını andıran bir deneyim sunar.

*   **Kasıtlı Asimetri:** Tasarım, dengeyi merkezden değil, ağırlık noktalarından kurar. Görseller ve metinler birbirinin üzerine hafifçe binerek derinlik hissi yaratır.
*   **Nefes Alan Alanlar:** Spacing (boşluk) bir lüks göstergesidir. Beyaz alanlar sadece boşluk değil, içeriği onurlandıran bir "sahne" görevindedir.

---

## 2. Renk Stratejisi

Sistem, `surface` ve `container` katmanları arasındaki ton farklarını kullanarak derinlik oluşturur. Sert çizgiler yerine renklerin ağırlığı konuşur.

### Temel Kurallar
*   **"Çizgisiz" Kuralı:** Bölümleri ayırmak için asla 1px solid border kullanmayın. Sınırlar sadece `surface-container-low` ile `background` arasındaki ton geçişleriyle belirlenmelidir.
*   **Cam ve Gradyan (Glassmorphism):** Floating (yüzen) elemanlarda `%60` opaklıkta yüzey renkleri ve `backdrop-blur (20px)` kullanılarak içerik ve arka planın bütünleşmesi sağlanır.
*   **İmza Gradyanı:** Ana aksiyonlarda (CTA) ve Hero alanlarında `#22C55E` → `#14B8A6` → `#3B82F6` geçişini kullanarak tasarıma "ruh" ve dinamizm katın.

| Token | Değer | Kullanım Amacı |
| :--- | :--- | :--- |
| `primary` | #006A69 | Ana marka rengi, vurgulanması gereken kritik alanlar. |
| `primary_container` | #0EA5A4 | Geniş alanlı vurgular, buton yüzeyleri. |
| `secondary` | #0051D5 | İkincil aksiyonlar ve profesyonellik vurgusu. |
| `tertiary` | #006E2F | Doğal aksanlar, başarı durumları ve organik dokunuşlar. |
| `surface` | #EFFCF8 | Ana çalışma alanı, "minty fresh" ferahlığı. |
| `on_surface` | #121E1C | Maksimum okunabilirlik için ana metin rengi. |

---

## 3. Tipografi ve Hiyerarşi

Tipografi bu sistemin omurgasıdır. **Plus Jakarta Sans** (Headlines) ve **Manrope** (Body) birlikteliği, modern ama otoriter bir duruş sergiler.

*   **Display ve Headline:** `plusJakartaSans` kullanılarak büyük ölçeklerde uygulanır. Harf arası boşlukları (letter-spacing) hafif daraltılarak (`-0.02em`) editoryal bir "sıkılık" elde edilir.
*   **Body:** `manrope` ile yüksek okunabilirlik hedeflenir. Satır yüksekliği (line-height) geniş tutularak (`1.6`) metnin akışı yumuşatılır.

| Stil | Font | Boyut | Ağırlık | Kullanım |
| :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Plus Jakarta Sans | 3.5rem | Bold | Hero başlıkları, etkileyici girişler. |
| `headline-md` | Plus Jakarta Sans | 1.75rem | Semibold | Bölüm başlıkları. |
| `title-md` | Manrope | 1.125rem | Medium | Kart başlıkları ve alt başlıklar. |
| `body-lg` | Manrope | 1.0rem | Regular | Ana metin blokları. |

---

## 4. Katmanlama ve Derinlik (Elevation)

Geleneksel gölgeler yerine **Tonal Katmanlama** kullanılır. Tasarım, üst üste binmiş ince kağıtlar veya buzlu cam levhalar gibi hissettirmelidir.

*   **Layering Principle:** Bir kartın havada durduğunu hissettirmek için `surface-container-lowest` bir kartı `surface-container-low` bir zemin üzerine yerleştirin.
*   **Ambiyans Gölgeleri:** Floating elementlerde gölgeler `on-surface` renginin `%4` opaklığı ile devasa blur değerleri (40px+) verilerek uygulanır. Bu, nesnenin doğal bir ışık altında süzülmesini sağlar.
*   **Ghost Border:** Eğer bir sınır zorunluysa, `outline-variant` token'ını `%15` opaklıkta kullanın. Asla tam opak sınır kullanmayın.

---

## 5. Bileşen Standartları

### Butonlar (Düğmeler)
*   **Primary:** Gradyan dolgulu, yumuşak köşeli (`lg: 1rem`). Hover durumunda hafif bir parlamayla beraber scale (1.02) efekti.
*   **Secondary:** `surface_container_highest` üzerinde ghost border ile.
*   **Tertiary:** Sadece text ve ikon, üzerine gelindiğinde `primary_container` renginde çok ince bir alt çizgi animasyonu.

### Kartlar & Listeler
*   **Kural:** Kartları birbirinden ayırmak için çizgi kullanmayın. 
*   **Ayrıştırma:** `spacing.8` (2.75rem) değerindeki dikey boşlukları veya arka plandaki hafif ton değişimlerini kullanın. 
*   **Yüzey:** Proje kartlarında `surface_container_low` kullanarak arka plandan zarifçe ayrışmasını sağlayın.

### Çipler (Chips)
*   Yetenekleri veya kategorileri belirtirken `primary_fixed` arka planı üzerine `on_primary_fixed_variant` metin rengiyle, tamamen yuvarlatılmış (`full`) şekilde tasarlanmalıdır.

---

## 6. Yapılması Gerekenler ve Kaçınılması Gerekenler (Do's & Don'ts)

### Yapın (Do)
*   **Negatif Alanı Kullanın:** İçeriğin nefes almasına izin verin. Geniş padding değerlerinden korkmayın.
*   **Mikro-Etkileşimler:** Butonların ve kartların geçişlerine `cubic-bezier(0.4, 0, 0.2, 1)` eğrisi ile yumuşak akışkanlık katın.
*   **Görsel Derinlik:** Büyük tipografiyi, görsellerin arkasına veya üzerine hafifçe taşacak şekilde yerleştirerek asimetriyi tetikleyin.

### Kaçının (Don't)
*   **Siyah Gölge Kullanmayın:** Gölgeler her zaman markanın koyu tonlarıyla (on-surface) renkli olmalıdır, asla saf siyah (#000) olmamalıdır.
*   **Sert Köşelerden Kaçının:** En az `sm: 0.25rem` radius kullanarak dijital keskinliği yumuşatın.
*   **Kalabalıklaştırmayın:** Bir ekranda birden fazla baskın gradyan alanı kullanmayın; gradyanı sadece "yıldız" elemanlar için saklayın.

---

## 7. Uygulama Notu (Junior Tasarımcılar İçin)

Bu tasarım sistemiyle çalışırken kendinize şunu sorun: *"Bu eleman sayfada yapıştırılmış gibi mi duruyor, yoksa yüzeyin doğal bir parçası mı?"* Cevabınız yapıştırılmış gibiyse, `surface-container` hiyerarşinizi ve boşluk değerlerinizi tekrar gözden geçirin. Akışın kesilmemesi için keskin geçişlerden kaçının.