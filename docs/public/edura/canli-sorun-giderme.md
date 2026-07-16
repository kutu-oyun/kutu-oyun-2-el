# Edura — Canlı sorun giderme (güncel)

**Güncel model (2026-06-29):** VPS + Docker Compose + Caddy (`myedura.com` → `207.175.26.150`)

Eski Cloud Run modeli için bkz. [Legacy Cloud Run](#legacy-cloud-run) bölümü.

---

## 1) Site açılmıyor / SSL hatası

**Kontrol:**
- DNS: `dig myedura.com @8.8.8.8` → `207.175.26.150` olmalı
- VM: `docker ps` → `edura-api`, `edura-web`, `caddy` çalışıyor mu
- Caddy log: `docker logs caddy --tail 50`

---

## 2) API 500 / veritabanı bağlantısı

**Kontrol:**
- `docker logs edura-api --tail 100`
- MySQL container ayakta mı: `docker ps | grep mysql`
- `.env` / compose içinde `DATABASE_URL` doğru mu (VM MySQL host)
- Local dev: bkz. [vps-database.md](./vps-database.md) — **Cloud SQL IP kullanmayın**

---

## 3) Test hesapları / şifre uyumsuzluğu

| Son çalışan script | Giriş şifresi |
|--------------------|---------------|
| `seed.ts` veya `update-all-passwords.ts` | `edura123` |
| `update-passwords-correct.ts` | Admin: `Edura2026.!` — diğer roller: `Edura2025.!` |

**Endpoint:** `GET /api/test/hesaplar` — 500 alıyorsan backend loglarına bak.

---

## 4) Frontend yanlış API'ye gidiyor

**Kontrol:**
- Build-time env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`
- Tarayıcı Network sekmesinde istek URL'si `myedura.com/api/...` veya doğru backend mi

---

## 5) Kısa checklist (VPS)

- [ ] DNS → `207.175.26.150`
- [ ] Container'lar up (`edura-api`, `edura-web`, `caddy`)
- [ ] MySQL erişilebilir
- [ ] Caddy HTTPS 200

---

## Legacy Cloud Run

> **Not:** 2026-06-29 öncesi prod Cloud Run (`edura-api`, `edura-web`) üzerindeydi. Aşağıdaki adımlar yalnızca eski ortam için geçerlidir.

- Preview: `feat/*` → `edura-api-preview`, `edura-web-preview`
- Prod: `main` → `edura-api`, `edura-web`
- Trigger branch regex: preview `^feat/.*`, prod `^main$`
- `DATABASE_URL`: bkz. [vps-database.md](./vps-database.md) (güncel). Legacy: [cloud-sql-database-url.md](./cloud-sql-database-url.md)

Detaylı standart: [`../../general/general-deployment-logic.md`](../../general/general-deployment-logic.md)
