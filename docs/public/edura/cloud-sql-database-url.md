# Cloud SQL – DATABASE_URL Nasıl Bulunur?

> **Legacy (2026-06-29 öncesi):** Edura prod artık VPS MySQL kullanıyor. Güncel rehber: [vps-database.md](./vps-database.md). Bu dosya yalnızca eski Cloud Run kurulumları içindir.

Cloud Run’daki backend’in veritabanına bağlanması için `DATABASE_URL` ortam değişkenini doğru doldurmanız gerekir. Aşağıdaki adımlarla her parçayı bulabilirsiniz.

---

## Format (Unix socket – Cloud Run için önerilen)

```
mysql://KULLANICI_ADI:SIFRE@/VERITABANI_ADI?host=/cloudsql/PROJE_ID:BOLGE:INSTANCE_ADI
```

---

## 1. PROJE_ID (GCP proje kodu)

- **Google Cloud Console** → Sol üstte proje seçiciye tıklayın.
- Listede projenizin **Proje ID**’si yazar (örn. `edura-7a1e1`). **Proje adı** değil, **ID** kullanılır.
- Veya: **Cloud Run** → `edura-api` → URL’de `https://edura-api-xxxxx-**edura-7a1e1**.run.app` gibi kısım proje ID’sidir.

**Örnek:** `edura-7a1e1`

---

## 2. BOLGE (Region)

- **SQL** (sol menü) → **Instances**.
- Tabloda instance’ınızın **Location** sütununa bakın (örn. `europe-west1`).
- Cloud Run’ı hangi bölgede çalıştırıyorsanız, mümkünse Cloud SQL’i de aynı bölgede kullanın.

**Örnek:** `europe-west1`

---

## 3. INSTANCE_ADI (Cloud SQL instance adı)

- **SQL** → **Instances**.
- Listede instance’ınızın **Instance ID** sütunu (örn. `edura-db`).

**Örnek:** `edura-db`

---

## 4. VERITABANI_ADI (Database name)

- **SQL** → Instance’a tıklayın → **Databases** sekmesi.
- Burada oluşturduğunuz veritabanı adı listelenir (örn. `edura_prod` veya `edura_dev`).
- Yoksa **Create database** ile oluşturun; o ismi kullanın.

**Örnek:** `edura_prod`

---

## 5. KULLANICI_ADI ve SIFRE

- Aynı instance sayfasında **Users** sekmesine gidin.
- Burada tanımlı kullanıcılar görünür (örn. `edura_user`, `root`).
- **Şifreyi unuttuysanız:** Kullanıcı satırındaki **⋮** (üç nokta) → **Change password** ile yeni şifre belirleyin; bu şifreyi `DATABASE_URL` içinde `SIFRE` yerine yazın.
- Özel karakter (örn. `@`, `#`, `!`) kullanıyorsanız, şifreyi URL’de **URL-encode** etmeniz gerekebilir (örn. `@` → `%40`).

**Örnek kullanıcı:** `edura_user`  
**Örnek şifre:** Kendi belirlediğiniz şifre (URL’de özel karakter varsa encode edin).

---

## 6. Parçaları birleştirin

| Parça          | Nereden buldunuz   | Örnek değer    |
|----------------|--------------------|----------------|
| PROJE_ID       | Proje seçici / URL | `edura-7a1e1`  |
| BOLGE          | SQL → Instance → Location | `europe-west1` |
| INSTANCE_ADI   | SQL → Instance ID  | `edura-db`     |
| VERITABANI_ADI | SQL → Databases    | `edura_prod`   |
| KULLANICI_ADI  | SQL → Users        | `edura_user`   |
| SIFRE          | Sizin belirlediğiniz | `GizliSifre123` |

**Son URL örneği (şifre `MyPass123` ise):**
```
mysql://edura_user:MyPass123@/edura_prod?host=/cloudsql/edura-7a1e1:europe-west1:edura-db
```

**Şifrede özel karakter varsa (örn. `P@ss#1`):**  
`@` → `%40`, `#` → `%23`  
Örnek: `P%40ss%231`  
Tam URL:
```
mysql://edura_user:P%40ss%231@/edura_prod?host=/cloudsql/edura-7a1e1:europe-west1:edura-db
```

---

## 7. Cloud Run’a ekleme

1. **Cloud Run** → **edura-api** → **Edit & deploy new revision**.
2. **Variables and secrets** → **+ Add variable**.
3. **Name:** `DATABASE_URL`
4. **Value:** Yukarıda oluşturduğunuz tam satır (tek tırnak içine almayın, olduğu gibi yapıştırın).
5. **Deploy** ile kaydedin.

---

## 8. Cloud SQL bağlantısını açma (Unix socket için)

Unix socket (`/cloudsql/...`) kullanıyorsanız Cloud Run’ın instance’a “bağlı” olması gerekir:

1. **Cloud Run** → **edura-api** → **Edit & deploy new revision**.
2. **Connections** (veya **Container, Variables & Secrets...** altında) bölümüne inin.
3. **Cloud SQL connections** → **+ Add connection**.
4. Açılan listeden **aynı bölgedeki** Cloud SQL instance’ınızı seçin (örn. `edura-db`).
5. **Deploy** edin.

Bunu yapmazsanız `DATABASE_URL` doğru olsa bile bağlantı kurulamaz.

---

## Kısa kontrol listesi

- [ ] PROJE_ID, BOLGE, INSTANCE_ADI → SQL → Instances’tan
- [ ] VERITABANI_ADI → SQL → Instance → Databases
- [ ] KULLANICI_ADI ve SIFRE → SQL → Instance → Users (şifre bilmiyorsanız Change password)
- [ ] URL’i birleştirip Cloud Run’da `DATABASE_URL` olarak ekledim
- [ ] Cloud Run’da **Cloud SQL connection** olarak bu instance’ı ekledim

Bu adımlarla `DATABASE_URL`’i net şekilde bulup Cloud Run’a ekleyebilirsiniz.
