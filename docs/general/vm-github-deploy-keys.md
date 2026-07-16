# VM GitHub deploy keys — apps-vm

**Makine:** `apps-vm` (207.175.26.150)  
**Hesap:** `hvworkcloud2@gmail.com`  
**Key tipi:** ed25519, **read-only**, passphrase yok (deploy otomasyonu)

Her repo için **ayrı** deploy key — biri sızdığında diğer repolar etkilenmez.

---

## Repo tablosu

| Proje | GitHub repo | VM path | SSH Host alias | Key dosyası |
|-------|-------------|---------|----------------|-------------|
| hasanvural.com | `Hasan-Vural/hasanvuralcom` | `/opt/apps/hasanvuralcom` | `github-hasanvuralcom` | `~/.ssh/deploy_hasanvuralcom` |
| BHM | `Hasan-Vural/bhmcontrol` | `/opt/apps/bhmcontrol` | `github-bhmcontrol` | `~/.ssh/deploy_bhmcontrol` |
| Godiva | `Hasan-Vural/godiva-elix` | `/opt/apps/godiva-elix` | `github-godiva-elix` | `~/.ssh/deploy_godiva-elix` |
| Edura | `Edura-Academy/edura` | `/opt/apps/edura` | `github-edura` | `~/.ssh/deploy_edura` |

**Git remote örneği:** `git@github-hasanvuralcom:Hasan-Vural/hasanvuralcom.git`

---

## Kurulum (ilk kez)

### 1. VM’de key üret

```bash
gcloud compute ssh apps-vm
cd /opt/apps/hasanvuralcom/deploy/gce/scripts
chmod +x setup-vm-deploy-keys.sh setup-vm-git-remotes.sh
bash setup-vm-deploy-keys.sh
```

Script her repo için **public key** (.pub) yazdırır.

### 2. GitHub’a ekle (sen — tarayıcı)

Her repo → **Settings → Deploy keys → Add deploy key**

| Repo | Title | Write access |
|------|-------|--------------|
| Hasan-Vural/hasanvuralcom | `apps-vm` | ❌ Kapalı |
| Hasan-Vural/bhmcontrol | `apps-vm` | ❌ |
| Hasan-Vural/godiva-elix | `apps-vm` | ❌ |
| Edura-Academy/edura | `apps-vm` | ❌ (org admin gerekebilir) |

### 3. VM’de clone / pull

```bash
bash setup-vm-git-remotes.sh
```

Mevcut tarball klasörleri yedeklenir (`*.pre-git.TIMESTAMP`), ardından `git clone`.

---

## Günlük deploy (hasanvural.com örneği)

**PC:**
```powershell
git push origin main
```

**VM:**
```bash
cd /opt/apps/hasanvuralcom/deploy/gce
sudo ./scripts/deploy-hasanvuralcom.sh
```

Script içinde `git pull` çalışır.

---

## Test

```bash
ssh -T github-hasanvuralcom
# Hi Hasan-Vural/hasanvuralcom! You've successfully authenticated...
```

```bash
git -C /opt/apps/hasanvuralcom pull --ff-only
```

---

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| `Permission denied (publickey)` | Deploy key GitHub’a ekli mi? Doğru repo mu? |
| Edura org reddediyor | Edura-Academy org settings → Deploy keys |
| `not a git repository` | `setup-vm-git-remotes.sh` tekrar çalıştır |
| Eski tarball yedek | `/opt/apps/*.pre-git.*` — gerekirse dosya karşılaştır |

---

## Güvenlik

- **Read-only** — VM repoya push edemez  
- **PAT VM’de tutulmaz** — dar kapsam  
- Key rotation: yeni key üret → GitHub güncelle → eski key sil  

**Kurulum tarihi:** 2026-06-29
