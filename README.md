# KutuOyun - 2. El Kutu Oyun Pazaryeri

Türkiye'nin en büyük 2. el kutu oyun pazaryeri. Güvenli alışveriş, uygun fiyatlar, geniş oyun seçeneği.

## 🎯 Proje Hakkında

KutuOyun, kullanıcıların ikinci el kutu oyunlarını alıp satabilecekleri modern bir marketplace platformudur. Trendyol, Hepsiburada ve Letgo gibi platformlardan ilham alınarak tasarlanmıştır.

## 🛠 Teknoloji Stack

### Frontend
- **Next.js 14** - App Router
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **Jotai** - State management
- **TanStack Query** - Data fetching
- **Socket.io-client** - WebSocket
- **Firebase SDK** - Authentication

### Backend
- **Node.js + Express** - API server
- **TypeScript** - Tip güvenliği
- **Prisma ORM** - Database
- **Socket.io** - WebSocket
- **Firebase Admin SDK** - Token verification

### Database & Services
- **Cloud SQL (MySQL)** - Database
- **Firebase Auth** - Authentication
- **Cloud Storage** - File storage
- **iyzico** - Payment gateway

### Deployment
- **Vercel** - Frontend
- **Google Cloud Run** - Backend
- **Google Cloud SQL** - Database

## 📁 Proje Yapısı

```
kutu-oyun-2-el/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router sayfaları
│   │   ├── components/      # UI bileşenleri
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── atoms/           # Jotai atoms
│   │   └── types/           # TypeScript tipleri
│   └── public/
│
├── backend/                  # Express backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, validation
│   │   ├── services/        # Business logic
│   │   ├── socket/          # WebSocket handlers
│   │   └── config/          # Config files
│   └── prisma/              # Database schema
│
└── README.md
```

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- MySQL 8+
- Firebase projesi
- Google Cloud hesabı

### Kurulum

1. **Repoyu klonla**
```bash
git clone git@github.com:kutu-oyun/kutu-oyun-2-el.git
cd kutu-oyun-2-el
```

2. **Backend kurulumu**
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenle
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

3. **Frontend kurulumu**
```bash
cd frontend
npm install
# .env.local dosyası oluştur
npm run dev
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL="mysql://user:pass@localhost:3306/kutu_oyun"
PORT=4000
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY=xxx
GCS_BUCKET_NAME=xxx
IYZICO_API_KEY=xxx
IYZICO_SECRET_KEY=xxx
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
```

## 📱 Özellikler

### Kullanıcılar
- ✅ Kayıt / Giriş / Çıkış (Firebase Auth)
- ✅ Profil yönetimi
- ✅ Adres yönetimi

### Ürünler
- ✅ Ürün listeleme ve filtreleme
- ✅ Ürün detay sayfası
- ✅ Kategori bazlı arama
- ✅ Konum bazlı filtreleme

### Satış
- ✅ İlan oluşturma
- ✅ İlan düzenleme/silme
- ✅ Resim yükleme (Cloud Storage)

### Alışveriş
- ✅ Sepet sistemi
- ✅ Sipariş oluşturma
- ✅ Ödeme (iyzico)
- ✅ Sipariş takibi

### İletişim
- ✅ Mesajlaşma (WebSocket)
- ✅ Bildirimler

### Admin
- ✅ Dashboard
- ✅ Kullanıcı yönetimi
- ✅ Ürün yönetimi
- ✅ Kategori yönetimi

## 📊 API Endpoints

```
/api/auth          - Authentication
/api/products      - Ürün CRUD
/api/categories    - Kategoriler
/api/cart          - Sepet işlemleri
/api/orders        - Sipariş yönetimi
/api/favorites     - Favoriler
/api/reviews       - Değerlendirmeler
/api/messages      - Mesajlaşma
/api/upload        - Dosya yükleme
/api/payment       - Ödeme işlemleri
```

## 🎨 Kutu Oyun Kategorileri

- Strateji Oyunları
- Aile Oyunları
- Parti Oyunları
- Kart Oyunları
- Çocuk Oyunları
- Kooperatif Oyunları
- Savaş Oyunları
- Ekonomi Oyunları
- Bulmaca Oyunları
- Roll & Write
- Deck Building
- Worker Placement

## 📄 Lisans

MIT License

## 👥 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın
