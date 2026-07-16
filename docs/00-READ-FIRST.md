# Docs — önce bunu oku

Bu dosya **tüm agent ve geliştirici oturumlarında ilk okunacak** giriş noktasıdır.

---

## Oturum başlangıcı

**Tetikleyici:** `bismillah docsa bak, güncel başla`

### Edura / kurulumu yapılmış proje

`.\scripts\docs-pull.ps1` → `./docs/` oku.

### Yeni proje (script / kural yok)

Script veya kural kopyalamana gerek yok. Agent global pull çalıştırır; **otomatik kurar:**

- `docs/` — belgeler
- `scripts/docs-*.ps1` — sync scriptleri
- `.cursor/rules/docs-workflow.mdc` — agent kuralı (`docs/cursor-rules/` kaynağından)

```powershell
& "$env:USERPROFILE\.website-logic-cache\scripts\docs-pull-global.ps1"
```

**Sen sadece söyle:** `bismillah docsa bak, güncel başla` veya `website-logic clone edip incele`

## Oturum bitişi / canlıya alma

**Tetikleyici:** `elhamdulillah`

Agent docs güncellediyse:

1. Migration log / proje notlarını kaydet
2. `.\scripts\docs-push.ps1 -Message "kısa özet"` çalıştır

---

## İki git var mı? Sıkıntı olur mu?

**Hayır — iç içe git yok.**

| Konum | Git? | Ne? |
|-------|------|-----|
| `Edura/` (proje kökü) | ✅ `.git` | Uygulama kodu |
| `Edura/docs/` | ❌ git yok | Sadece dosyalar (kopya) |
| `~/.website-logic-cache/` | ✅ ayrı `.git` | Hub klonu, proje **dışında** |

`docs/` klasörü Edura git'inin **içinde normal klasör** gibi davranır (kod gibi commit edilebilir — public repoda `private/` gitignore hariç). Ayrı bir docs git repo'su **proje içinde açılmaz**. Hub cache tamamen farklı dizinde.

---

## Okuma sırası

| Sıra | Dosya |
|------|-------|
| 0 | `docs-pull.ps1` (bismillah) |
| 1 | Bu dosya |
| 2 | `projects-registry.md` |
| 3 | `general/general-deployment-logic.md` |
| 4 | Aktif proje klasörü |
| 5 | `general/gce-vps-migration-log.md` |

## Proje → dosya yolu

| Proje | GitHub | Görünürlük | Dokümantasyon yolu |
|-------|--------|------------|-------------------|
| Edura | `Edura-Academy/edura` | public (org) | [`public/edura/`](./public/edura/) |
| hasanvural.com | `Hasan-Vural/hasanvuralcom` | private | [`private/hasanvuralcom/`](./private/hasanvuralcom/) |
| BHM Control | `Hasan-Vural/bhmcontrol` | private | [`private/bhmcontrol/`](./private/bhmcontrol/) |
| Godiva Elix | `Hasan-Vural/godiva-elix` | private | [`private/godiva-elix/`](./private/godiva-elix/) |
| Kutuly | `kutu-oyun/kutu-oyun-2-el` | public (org) | [`public/kutuly/`](./public/kutuly/) |

## Agent kuralları

1. **bismillah docsa bak, güncel başla** → pull first, sonra oku
2. **elhamdulillah** → log kaydet + push hub'a
3. Proje özel geliştirmede `docs/general/` değiştirme
4. Edura'da yalnızca `docs/public/edura/` güncelle; Kutuly'de yalnızca `docs/public/kutuly/`
5. `docs/private/` public GitHub'a gitmez (gitignore)

## Canonical kaynak

**Merkezi repo:** `Hasan-Vural/website-logic` (private)  
**Cache:** `%USERPROFILE%\.website-logic-cache`  
**Proje kopyası:** `./docs/` (pull ile güncellenir)

Mimari: [`general/docs-architecture.md`](./general/docs-architecture.md)

Son güncelleme: **2026-07-17**
