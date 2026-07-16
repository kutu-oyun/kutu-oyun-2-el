# Ortak docs mimarisi

## Karar: proje içi `docs/` + merkezi hub repo

```
Hasan-Vural/website-logic (private)     ← canonical, tek git kaynağı
         ↑ docs-push.ps1 (oturum sonu)
         ↓ docs-pull.ps1 (bismillah / oturum başı)
    ┌────┴────┬──────────┬──────────┐
  Edura/     hasanvuralcom/  bhmcontrol/  godiva-elix/
  docs/         docs/           docs/          docs/
  (proje git)   (proje git)     (proje git)    (proje git)

~/.website-logic-cache/                  ← hub klonu (ayrı git, proje dışında)
```

**İç içe git yok.** Hub cache proje klasörünün dışında; script dosya kopyalar.

---

## Neden proje kökünde "Bismillah"?

| Yöntem | Değerlendirme |
|--------|---------------|
| **Proje kökünde bismillah → `docs/` güncelle** | ✅ Önerilen. Workspace = proje. Agent `./docs/` bilir. Farklı disk yolları sorun değil. |
| Tek local klasör (tüm docs bir yerde) | ❌ Projeler farklı path'lerde; agent karışır. |
| Workspace'te proje + website-logic yan yana | ⚠️ İki root; agent hangi docs? Ek karmaşıklık, gerek yok. |

**Sonuç:** Her projede `docs/` klasörü olsun. Oturum başında pull, bitişinde push.

---

## Akış

### Oturum başı (Bismillah)

```
Kullanıcı: "bismillah" / "belgelere bak"
    → scripts/docs-pull.ps1
    → hub cache git pull
    → docs/ klasörüne kopyala
    → agent 00-READ-FIRST.md okur
```

### Oturum sonu

```
Kullanıcı: "projeyi bitir" / "canlıya al" / "docs push"
    → docs değişikliklerini kaydet (log, vps-notes)
    → scripts/docs-push.ps1 -Message "..."
    → hub cache'e kopyala + git push
```

### Edura (public repo) özel

- Pull: tüm docs local'e gelir (agent private notları da okuyabilir)
- Push hub: general + public/edura
- Push Edura GitHub: yalnızca `general/` + `public/` (`private/` gitignore)

---

## Kurulum (ilk kez)

1. GitHub'da `Hasan-Vural/website-logic` (private) — oluşturuldu
2. Edura `docs/` ağacını ilk commit olarak push et
3. Her proje repo'suna kopyala: `scripts/docs-*.ps1`, `docs/docs-hub.config.json`, `docs/00-READ-FIRST.md`
4. Edura'da `.gitignore`: `docs/private/`

Config: [`../docs-hub.config.json`](../docs-hub.config.json)

---

## Özet

| Soru | Cevap |
|------|--------|
| Canonical repo | `Hasan-Vural/website-logic` |
| Hub cache | `%USERPROFILE%\.website-logic-cache` |
| Oturum başı | `bismillah docsa bak, güncel başla` → `docs-pull.ps1` |
| Oturum sonu | `elhamdulillah` → `docs-push.ps1` |
