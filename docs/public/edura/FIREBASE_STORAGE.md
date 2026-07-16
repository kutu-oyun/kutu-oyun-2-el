# Firebase Storage Entegrasyonu 📦

## Genel Bakış

Edura platformu, dosya yüklemeleri (profil fotoğrafları, grup fotoğrafları, belgeler) için **Cloud Storage** kullanır.

Öncelik sırası:

1. **Google Cloud Storage (GCS)** (varsa)
2. **Firebase Storage** (GCS yoksa)
3. (Geliştirme ortamında) **Local** (ikisi de yoksa)

## 🔧 Kurulum

### 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Yeni bir proje oluşturun
3. Storage servisini aktif edin
4. Storage kurallarını ayarlayın:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true; // Public okuma erişimi
      allow write: if request.auth != null; // Sadece kimlik doğrulamalı kullanıcılar yazabilir
    }
  }
}
```

### 2. Service Account Oluşturma

1. Firebase Console → Project Settings → Service Accounts
2. "Generate New Private Key" butonuna tıklayın
3. İndirilen JSON dosyasını `backend/firebase-service-account.json` olarak kaydedin

### 3. Environment Variables

`backend/.env` dosyasına Firebase bucket bilgisini ekleyin:

```env
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# (Opsiyonel) GCS kullanacaksanız
GCS_BUCKET=your-gcs-bucket-name
GCS_PROJECT_ID=your-gcp-project-id
```

## 📁 Dosya Yapısı

Firebase Storage'da dosyalar şu klasör yapısında saklanır:

```
storage/
├── profiles/          # Profil fotoğrafları
│   ├── uuid-1.jpg
│   ├── uuid-2.png
│   └── ...
├── logos/             # Kurs logoları
│   ├── uuid-1.png
│   └── ...
├── group-photos/      # Grup fotoğrafları
│   ├── uuid-1.jpg
│   └── ...
└── documents/         # Belgeler
    ├── odev/          # Ödev belgeleri
    │   ├── uuid-1.pdf
    │   └── ...
    ├── sinav/         # Sınav belgeleri
    ├── rapor/         # Rapor belgeleri
    └── diger/         # Diğer belgeler
```

## 🚀 Kullanım

### Backend API Endpoints

#### 1. Profil Fotoğrafı Yükleme

```http
POST /api/upload/profile/:userType/:userId
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- photo: File (image/jpeg, image/png, max 8MB)
```

**Desteklenen userType değerleri:**
- `admin`
- `mudur`
- `sekreter`
- `ogretmen`
- `ogrenci`
- `kurs`

**Örnek Response:**
```json
{
  "success": true,
  "message": "Fotoğraf başarıyla yüklendi",
  "data": {
    "url": "https://storage.googleapis.com/your-bucket/profiles/uuid.jpg"
  }
}
```

#### 2. Profil Fotoğrafı Silme

```http
DELETE /api/upload/profile/:userType/:userId
Authorization: Bearer {token}
```

#### 3. Profil Fotoğrafı Getirme

```http
GET /api/upload/profile/:userType/:userId
```

#### 4. Grup Fotoğrafı Yükleme

```http
POST /api/upload/group/:groupId
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- photo: File (image/jpeg, image/png, max 8MB)
```

#### 5. Belge Yükleme

```http
POST /api/upload/document
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- document: File (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, max 10MB)
- documentType: string (odev | sinav | rapor | diger)
- userId: string (optional)
- userType: string (optional)
```

**Örnek Response:**
```json
{
  "success": true,
  "message": "Belge başarıyla yüklendi",
  "data": {
    "url": "https://storage.googleapis.com/your-bucket/documents/odev/uuid.pdf",
    "originalName": "matematik-odevi.pdf",
    "size": 1024567,
    "mimeType": "application/pdf"
  }
}
```

## 🎨 Frontend Komponentleri

### 1. ProfilePhotoUpload

Profil fotoğrafı yükleme için kullanılır.

```tsx
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

<ProfilePhotoUpload
  userType="ogrenci"
  userId="123"
  currentPhotoUrl={user.photoUrl}
  onUploadSuccess={(url) => console.log('Yüklendi:', url)}
  onUploadError={(error) => console.error('Hata:', error)}
/>
```

### 2. GroupPhotoUpload

Grup fotoğrafı yükleme için kullanılır.

```tsx
import GroupPhotoUpload from '@/components/GroupPhotoUpload';

<GroupPhotoUpload
  groupId="group-123"
  currentPhotoUrl={group.photoUrl}
  size="lg"
  onUploadSuccess={(url) => console.log('Yüklendi:', url)}
  onUploadError={(error) => console.error('Hata:', error)}
/>
```

### 3. DocumentUpload

Belge yükleme için kullanılır.

```tsx
import DocumentUpload from '@/components/DocumentUpload';

<DocumentUpload
  documentType="odev"
  maxSize={10}
  buttonText="Ödev Dosyası Yükle"
  onUploadSuccess={(url, fileName) => {
    console.log('Yüklendi:', fileName, url);
  }}
  onUploadError={(error) => console.error('Hata:', error)}
/>
```

**Props:**
- `documentType`: 'odev' | 'sinav' | 'rapor' | 'diger' (varsayılan: 'diger')
- `maxSize`: number (MB, varsayılan: 10)
- `buttonText`: string (varsayılan: 'Belge Yükle')
- `acceptedFormats`: string[] (varsayılan: ['.pdf', '.doc', '.docx', ...])

## 🔒 Güvenlik

### Dosya Boyutu Limitleri

- **Resimler (Profil, Grup):** Maksimum 8MB
- **Belgeler (PDF, DOC, vb.):** Maksimum 10MB

### Dosya Türü Kontrolü

**Resimler için:**
- JPEG (.jpg, .jpeg)
- PNG (.png)

**Belgeler için:**
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Microsoft Excel (.xls, .xlsx)
- Microsoft PowerPoint (.ppt, .pptx)

### Authentication

Tüm yükleme işlemleri için JWT token gereklidir. Token `Authorization: Bearer {token}` header'ı ile gönderilmelidir.

## ⚡ Özellikler

### ✅ Profil Fotoğrafları
- Tüm kullanıcı tipleri için profil fotoğrafı yükleme/silme
- Otomatik eski fotoğraf silme
- Veritabanı ile senkronizasyon

### ✅ Grup Fotoğrafları
- Mesajlaşma grupları için fotoğraf yükleme
- Real-time preview
- Responsive tasarım

### ✅ Belge Yönetimi
- Çoklu dosya formatı desteği
- Kategorilere göre organize etme (ödev, sınav, rapor, vb.)
- Dosya meta bilgileri (boyut, tür, orijinal isim)

### ✅ Güvenlik
- JWT tabanlı kimlik doğrulama
- Dosya türü ve boyut validasyonu
- Firebase Security Rules

### ✅ Performans
- Memory storage (buffer-based upload)
- Otomatik dosya adı generasyonu (UUID)
- Public URL desteği

## 🔄 Dosya Yaşam Döngüsü

1. **Frontend:** Kullanıcı dosya seçer
2. **Validation:** Dosya türü ve boyutu kontrol edilir
3. **Upload:** Dosya Firebase Storage'a yüklenir
4. **Public URL:** Dosya public olarak erişilebilir hale gelir
5. **Database:** URL veritabanına kaydedilir
6. **Cleanup:** Eski dosya varsa silinir

## 🐛 Hata Yönetimi

Yaygın hatalar ve çözümleri:

### "Firebase Storage is not configured"
- `firebase-service-account.json` dosyasının backend klasöründe olduğundan emin olun
- `.env` dosyasında `FIREBASE_STORAGE_BUCKET` değişkenini kontrol edin

### "Dosya boyutu ... MB'dan büyük olamaz"
- Dosya boyutunu kontrol edin
- Gerekirse resim/belge sıkıştırma kullanın

### "Sadece ... dosyaları yüklenebilir"
- Dosya formatını kontrol edin
- Desteklenen formatlar listesine bakın

## 📊 İzleme ve Analiz

Firebase Console'da şu metrikleri izleyebilirsiniz:

- Toplam storage kullanımı
- İndirme sayısı
- Yükleme başarı oranı
- Maliyetler

## 💡 Best Practices

1. **Dosya Optimizasyonu:** Yüklemeden önce resimleri optimize edin
2. **Naming Convention:** UUID kullanarak dosya adı çakışmalarını önleyin
3. **Cleanup:** Kullanılmayan dosyaları düzenli olarak silin
4. **Monitoring:** Storage kullanımını düzenli olarak kontrol edin
5. **Backup:** Kritik dosyalar için yedekleme stratejisi oluşturun

## 🔗 Faydalı Linkler

- [Firebase Storage Dokümantasyonu](https://firebase.google.com/docs/storage)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Multer Documentation](https://github.com/expressjs/multer)

