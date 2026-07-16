# Namecheap DNS cutover — 207.175.26.150

Her domain için: **Domain List → MANAGE → Advanced DNS**

Önce **TTL = 5 min** (Automatic / 5 min). Eski kayıtların ekran görüntüsünü al.

## Tüm domainlerde aynı IP

**A Record @ → `207.175.26.150`**

---

## 1. godivaelix.com

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | `@` | `207.175.26.150` | 5 min |
| CNAME | `www` | `godivaelix.com.` | 5 min |

**Sil/değiştir:** Eski A/CNAME (Google Cloud Run, ghs.googlehosted.com vb.)

---

## 2. myedura.com

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | `@` | `207.175.26.150` | 5 min |
| CNAME | `www` | `myedura.com.` | 5 min |

**Sil:** Eski Google / Cloud Run kayıtları

---

## 3. hasanvural.com

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | `@` | `207.175.26.150` | 5 min |
| CNAME | `www` | `hasanvural.com.` | 5 min |
| A Record | `api` | `207.175.26.150` | 5 min |

---

## 4. bhmcontrol.com

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | `@` | `207.175.26.150` | 5 min |
| CNAME | `www` | `bhmcontrol.com.` | 5 min |

---

## DNS sonrası doğrulama (5–15 dk)

```powershell
curl.exe -sI https://godivaelix.com/
curl.exe -sI https://myedura.com/
curl.exe -sI https://hasanvural.com/
curl.exe -sI https://bhmcontrol.com/
```

Sonra foodistopia Cloud Run durdur:

```powershell
cd c:\All-around\hasanvuralcom\deploy\gce\scripts
.\decommission-foodistopia.ps1 -StopOnly -ConfirmCutover
```
