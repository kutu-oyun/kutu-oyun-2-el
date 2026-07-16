# Cutover — senin yapman gerekenler

**Hazırlık tamamlandıktan sonra** (VM smoke test OK). Otomatik adımlar agent tarafından yapıldı; aşağıdakiler **sadece senin** erişiminle yapılır.

---

## 1. Namecheap DNS (cutover günü)

**Hedef IP:** `207.175.26.150`

Cutover **öncesi:** TTL → **5 dakika**. Eski kayıtların ekran görüntüsünü al.

| Host | Tip | Değer |
|------|-----|--------|
| godivaelix.com @ | A | 207.175.26.150 |
| www.godivaelix.com | CNAME veya A | @ / 207.175.26.150 |
| myedura.com @ | A | 207.175.26.150 |
| www.myedura.com | CNAME | @ |
| hasanvural.com @ | A | 207.175.26.150 |
| www.hasanvural.com | CNAME | @ |
| api.hasanvural.com | A | 207.175.26.150 |

**Sonra 5–15 dk bekle**, ardından tarayıcıda:
- https://godivaelix.com
- https://myedura.com
- https://hasanvural.com

---

## 2. foodistopia Cloud Run durdur (DNS gittikten sonra)

PowerShell, foodistopia hesabına geçer:

```powershell
cd c:\All-around\hasanvuralcom\deploy\gce\scripts
.\decommission-foodistopia.ps1 -StopOnly -ConfirmCutover
```

---

## 3. Domain mapping sil (cutover +24–72 saat, siteler stabil)

Önce envanter:

```powershell
.\inventory-domain-mappings.ps1
```

**Sil (onaylı):** foodistopia-godiva → `godivaelix.com` mapping  
Detay: `docs/website-logic/domain-mapping-cleanup-checklist.md`

---

## 4. foodistopia tamamen kapat (+7 gün)

```powershell
.\decommission-foodistopia.ps1 -DeleteResources -ConfirmCutover
```

Sonra projeleri Console’dan sil: foodistopia-bhmcontrol, foodistopia-godiva, foodistopia-edura.

---

## 5. VM’de private repo erişimi (bir kez, isteğe bağlı)

`Hasan-Vural/hasanvuralcom` private. VM’de `git pull` için:

1. VM’de SSH key oluştur: `ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""`
2. Public key’i GitHub → hasanvuralcom → Settings → Deploy keys → Read-only ekle
3. VM’de `~/.ssh/config` ile `github.com` için bu key’i kullan

Edura için aynı mantık: `Edura-Academy/edura` org repo’suna deploy key (org admin onayı gerekebilir).

---

## Rollback

Namecheap’te eski A/CNAME kayıtlarını geri yükle. Gerekirse foodistopia Cloud Run’u tekrar scale up.

---

## Hızlı doğrulama (cutover öncesi, senin PC’nden)

```powershell
curl.exe -sI -H "Host: godivaelix.com" http://207.175.26.150/
curl.exe -sI -H "Host: hasanvural.com" http://207.175.26.150/
curl.exe -sI -H "Host: myedura.com" http://207.175.26.150/
```

HTTP **200** veya **308** = routing OK.
