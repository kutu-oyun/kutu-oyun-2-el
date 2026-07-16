import { PrismaClient, Condition, Language, ProductStatus, OrderStatus, Role, AuthProvider } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Admin Bypass hesapları
const adminBypassAccounts = [
  { username: 'süleyman', password: 'çiğdem123' },
  { username: 'hasan', password: 'çiğdem123' },
];

// Categories
const categories = [
  { name: 'Strateji Oyunları', slug: 'strateji', icon: 'chess' },
  { name: 'Aile Oyunları', slug: 'aile', icon: 'users' },
  { name: 'Parti Oyunları', slug: 'parti', icon: 'party-popper' },
  { name: 'Kart Oyunları', slug: 'kart', icon: 'cards' },
  { name: 'Çocuk Oyunları', slug: 'cocuk', icon: 'baby' },
  { name: 'Kooperatif Oyunları', slug: 'kooperatif', icon: 'handshake' },
  { name: 'Savaş Oyunları', slug: 'savas', icon: 'swords' },
  { name: 'Ekonomi Oyunları', slug: 'ekonomi', icon: 'coins' },
  { name: 'Bulmaca Oyunları', slug: 'bulmaca', icon: 'puzzle' },
  { name: 'Roll & Write', slug: 'roll-write', icon: 'dice-5' },
  { name: 'Deck Building', slug: 'deck-building', icon: 'layers' },
  { name: 'Worker Placement', slug: 'worker-placement', icon: 'users-cog' },
];

// Mock Users - Admin hesapları
const adminUsers = [
  { id: 'admin-suleyman', email: 'suleyman@kutuoyun.com', displayName: 'Süleyman Admin', phone: '05301111111', role: Role.ADMIN, authProvider: AuthProvider.BYPASS },
  { id: 'admin-hasan', email: 'hasan@kutuoyun.com', displayName: 'Hasan Admin', phone: '05302222222', role: Role.ADMIN, authProvider: AuthProvider.BYPASS },
  { id: 'admin-3', email: 'admin3@kutuoyun.com', displayName: 'Admin Kullanıcı 3', phone: '05303333333', role: Role.ADMIN, authProvider: AuthProvider.LOCAL },
  { id: 'admin-4', email: 'admin4@kutuoyun.com', displayName: 'Admin Kullanıcı 4', phone: '05304444444', role: Role.ADMIN, authProvider: AuthProvider.LOCAL },
  { id: 'admin-5', email: 'admin5@kutuoyun.com', displayName: 'Admin Kullanıcı 5', phone: '05305555555', role: Role.ADMIN, authProvider: AuthProvider.LOCAL },
];

// Mock Users - Satıcı hesapları
const sellerUsers = [
  { id: 'seller-1', email: 'ahmet.satici@test.com', displayName: 'Ahmet Satıcı', phone: '05321111111', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
  { id: 'seller-2', email: 'mehmet.satici@test.com', displayName: 'Mehmet Satıcı', phone: '05322222222', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
  { id: 'seller-3', email: 'ayse.satici@test.com', displayName: 'Ayşe Satıcı', phone: '05323333333', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
  { id: 'seller-4', email: 'fatma.satici@test.com', displayName: 'Fatma Satıcı', phone: '05324444444', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
  { id: 'seller-5', email: 'ali.satici@test.com', displayName: 'Ali Satıcı', phone: '05325555555', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
  { id: 'seller-6', email: 'veli.satici@test.com', displayName: 'Veli Satıcı', phone: '05326666666', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
  { id: 'seller-7', email: 'zeynep.satici@test.com', displayName: 'Zeynep Satıcı', phone: '05327777777', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
  { id: 'seller-8', email: 'can.satici@test.com', displayName: 'Can Satıcı', phone: '05328888888', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
  { id: 'seller-9', email: 'elif.satici@test.com', displayName: 'Elif Satıcı', phone: '05329999999', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
  { id: 'seller-10', email: 'burak.satici@test.com', displayName: 'Burak Satıcı', phone: '05320000000', role: Role.SELLER, authProvider: AuthProvider.LOCAL },
];

// Mock Users - Normal kullanıcı hesapları
const normalUsers = [
  { id: 'user-1', email: 'user1@test.com', displayName: 'Kullanıcı 1', phone: '05331111111', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-2', email: 'user2@test.com', displayName: 'Kullanıcı 2', phone: '05332222222', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-3', email: 'user3@test.com', displayName: 'Kullanıcı 3', phone: '05333333333', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-4', email: 'user4@test.com', displayName: 'Kullanıcı 4', phone: '05334444444', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-5', email: 'user5@test.com', displayName: 'Kullanıcı 5', phone: '05335555555', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-6', email: 'user6@test.com', displayName: 'Kullanıcı 6', phone: '05336666666', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-7', email: 'user7@test.com', displayName: 'Kullanıcı 7', phone: '05337777777', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-8', email: 'user8@test.com', displayName: 'Kullanıcı 8', phone: '05338888888', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-9', email: 'user9@test.com', displayName: 'Kullanıcı 9', phone: '05339999999', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-10', email: 'user10@test.com', displayName: 'Kullanıcı 10', phone: '05330000000', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-11', email: 'user11@test.com', displayName: 'Kullanıcı 11', phone: '05341111111', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-12', email: 'user12@test.com', displayName: 'Kullanıcı 12', phone: '05342222222', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-13', email: 'user13@test.com', displayName: 'Kullanıcı 13', phone: '05343333333', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-14', email: 'user14@test.com', displayName: 'Kullanıcı 14', phone: '05344444444', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-15', email: 'user15@test.com', displayName: 'Kullanıcı 15', phone: '05345555555', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-16', email: 'user16@test.com', displayName: 'Kullanıcı 16', phone: '05346666666', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-17', email: 'user17@test.com', displayName: 'Kullanıcı 17', phone: '05347777777', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-18', email: 'user18@test.com', displayName: 'Kullanıcı 18', phone: '05348888888', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-19', email: 'user19@test.com', displayName: 'Kullanıcı 19', phone: '05349999999', role: Role.USER, authProvider: AuthProvider.LOCAL },
  { id: 'user-20', email: 'user20@test.com', displayName: 'Kullanıcı 20', phone: '05340000000', role: Role.USER, authProvider: AuthProvider.LOCAL },
];

const allUsers = [...adminUsers, ...sellerUsers, ...normalUsers];

// Mock Products
const products = [
  // Strateji Oyunları
  { title: 'Catan - Türkçe', description: 'Catan, dünya çapında en çok satılan masa oyunlarından biridir. Kutu ve içerik çok temiz, sadece 2-3 kez oynandı. İstanbul Kadıköy\'den elden teslim veya kargo ile gönderim yapabilirim.', price: 450, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 3, maxPlayers: 4, minAge: 10, playTime: 90, location: 'İstanbul, Kadıköy', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800', 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Ticket to Ride Europe', description: 'Avrupa haritası üzerinde demiryolu yapma oyunu. İngilizce versiyonu, kutusunda hiç açılmamış gibi duruyor. Tüm parçalar eksiksiz.', price: 680, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 5, minAge: 8, playTime: 60, location: 'Ankara, Çankaya', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Wingspan - Kuş Cenneti', description: 'Kuş temalı strateji oyunu. Motor building mekanikleri içeriyor. Yeni açılmış, sadece bir kere oynandı.', price: 750, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 5, minAge: 10, playTime: 70, location: 'İstanbul, Beşiktaş', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800'] },
  { title: 'Terraforming Mars', description: 'Mars\'ı yaşanılabilir hale getirme temalı ağır strateji oyunu. Türkçe kurallar mevcut. Tüm kartlar sleeve\'li.', price: 850, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 5, minAge: 12, playTime: 120, location: 'İzmir, Karşıyaka', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: '7 Wonders Duel', description: '2 kişilik harika strateji oyunu. Çok temiz durumda, tüm kartlar sleeve\'li.', price: 380, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 2, maxPlayers: 2, minAge: 10, playTime: 30, location: 'Bursa, Nilüfer', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Scythe', description: 'Alternatif 1920\'ler Avrupa\'sında geçen strateji oyunu. Collector\'s Edition, minyatürler boyalı.', price: 1200, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 5, minAge: 14, playTime: 115, location: 'İstanbul, Şişli', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Everdell - Türkçe', description: 'Orman temalı worker placement ve tableau building oyunu. Türkçe baskı, hiç oynanmadı.', price: 650, condition: Condition.LIKE_NEW, language: Language.TURKISH, minPlayers: 1, maxPlayers: 4, minAge: 10, playTime: 80, location: 'Antalya, Muratpaşa', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Root', description: 'Asimetrik savaş oyunu. Her fraksiyon farklı oynanıyor. Riverfolk genişlemesi ile birlikte.', price: 900, condition: Condition.GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 4, minAge: 10, playTime: 90, location: 'Eskişehir, Tepebaşı', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: 'Twilight Imperium 4th Edition', description: 'Galaktik strateji oyunlarının kralı. Kutu çok iyi durumda, tüm parçalar tam.', price: 2500, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 3, maxPlayers: 6, minAge: 14, playTime: 480, location: 'İstanbul, Üsküdar', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Dune Imperium', description: 'Dune evreninde geçen deck building ve worker placement oyunu.', price: 800, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 13, playTime: 120, location: 'Ankara, Keçiören', categorySlug: 'strateji', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  
  // Aile Oyunları
  { title: 'Azul', description: 'Çini döşeme temalı soyut strateji oyunu. Görsel olarak çok şık. Dil bağımsız.', price: 320, condition: Condition.GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 4, minAge: 8, playTime: 45, location: 'İzmir, Karşıyaka', categorySlug: 'aile', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: 'Splendor', description: 'Mücevher ticareti temalı motor building oyunu. Çok temiz durumda.', price: 280, condition: Condition.VERY_GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 4, minAge: 10, playTime: 30, location: 'Ankara, Keçiören', categorySlug: 'aile', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Patchwork', description: '2 kişilik yorgan dikme temalı oyun. Çok eğlenceli ve hızlı.', price: 180, condition: Condition.VERY_GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 2, minAge: 8, playTime: 30, location: 'İstanbul, Üsküdar', categorySlug: 'aile', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Kingdomino', description: 'Domino benzeri krallık kurma oyunu. Spiel des Jahres kazananı.', price: 220, condition: Condition.LIKE_NEW, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 4, minAge: 8, playTime: 20, location: 'Kocaeli, İzmit', categorySlug: 'aile', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Sagrada', description: 'Vitray yapımı temalı zar yerleştirme oyunu. Görseller muhteşem.', price: 350, condition: Condition.VERY_GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 1, maxPlayers: 4, minAge: 10, playTime: 45, location: 'Bursa, Osmangazi', categorySlug: 'aile', images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800'] },
  { title: 'Carcassonne - Türkçe', description: 'Klasik tile-laying oyunu. Türkçe baskı, 2 genişleme ile birlikte.', price: 400, condition: Condition.GOOD, language: Language.TURKISH, minPlayers: 2, maxPlayers: 5, minAge: 7, playTime: 45, location: 'Samsun, İlkadım', categorySlug: 'aile', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Ticket to Ride', description: 'Klasik demiryolu oyunu. ABD haritası. Çok temiz durumda.', price: 550, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 5, minAge: 8, playTime: 60, location: 'İstanbul, Kadıköy', categorySlug: 'aile', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Cascadia', description: 'Doğa temalı tile-laying oyunu. 2022 Spiel des Jahres kazananı.', price: 420, condition: Condition.LIKE_NEW, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 1, maxPlayers: 4, minAge: 10, playTime: 45, location: 'Ankara, Çankaya', categorySlug: 'aile', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  
  // Parti Oyunları
  { title: 'Codenames - Türkçe', description: 'Kelime tahmin etme parti oyunu. Türkçe baskı, çok eğlenceli.', price: 180, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 4, maxPlayers: 8, minAge: 10, playTime: 20, location: 'Bursa, Nilüfer', categorySlug: 'parti', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Dixit', description: 'Hayal gücü gerektiren kart oyunu. Kartlar çok güzel illüstrasyonlu.', price: 290, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 3, maxPlayers: 6, minAge: 8, playTime: 30, location: 'Antalya, Muratpaşa', categorySlug: 'parti', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Telestrations', description: 'Telefon oyununun çizimli versiyonu. Çok güldürücü.', price: 250, condition: Condition.GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 4, maxPlayers: 8, minAge: 12, playTime: 30, location: 'İstanbul, Beyoğlu', categorySlug: 'parti', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: 'Wavelength', description: 'Tahmin oyunu, çok eğlenceli parti oyunu. İngilizce ama oynanabilir.', price: 320, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 12, minAge: 10, playTime: 45, location: 'Ankara, Çankaya', categorySlug: 'parti', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Just One', description: 'Kelime tahmin kooperatif parti oyunu. Spiel des Jahres kazananı.', price: 200, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 3, maxPlayers: 7, minAge: 8, playTime: 20, location: 'İzmir, Bornova', categorySlug: 'parti', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Secret Hitler', description: 'Gizli kimlik sosyal çıkarım oyunu. İngilizce baskı.', price: 350, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 5, maxPlayers: 10, minAge: 13, playTime: 45, location: 'İstanbul, Kadıköy', categorySlug: 'parti', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'The Resistance', description: 'Klasik gizli kimlik oyunu. 5-10 kişi için ideal.', price: 150, condition: Condition.GOOD, language: Language.ENGLISH, minPlayers: 5, maxPlayers: 10, minAge: 13, playTime: 30, location: 'Ankara, Mamak', categorySlug: 'parti', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  
  // Kart Oyunları
  { title: 'Dominion - Türkçe', description: 'Deck building türünün babası. Türkçe baskı, İhtiras genişlemesi ile.', price: 450, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 2, maxPlayers: 4, minAge: 13, playTime: 30, location: 'İstanbul, Maltepe', categorySlug: 'kart', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Star Realms', description: 'Hızlı deck building uzay savaş oyunu. Tüm genişlemeler mevcut.', price: 150, condition: Condition.GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 2, minAge: 12, playTime: 20, location: 'Ankara, Yenimahalle', categorySlug: 'kart', images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800'] },
  { title: 'Exploding Kittens', description: 'Patlayan kediler! Eğlenceli ve hızlı kart oyunu.', price: 120, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 5, minAge: 7, playTime: 15, location: 'İstanbul, Bakırköy', categorySlug: 'kart', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Unstable Unicorns', description: 'Unicorn toplama ve sabotaj oyunu. Çok eğlenceli.', price: 180, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 8, minAge: 14, playTime: 45, location: 'Bursa, Osmangazi', categorySlug: 'kart', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: 'Sushi Go Party!', description: 'Set collection kart oyunu. Çok sevimli görseller.', price: 200, condition: Condition.VERY_GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 8, minAge: 8, playTime: 20, location: 'İzmir, Konak', categorySlug: 'kart', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Arkham Horror LCG', description: 'Lovecraft temalı kart oyunu. Temel kutu + 2 genişleme.', price: 650, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 2, minAge: 14, playTime: 120, location: 'İstanbul, Şişli', categorySlug: 'kart', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Marvel Champions LCG', description: 'Marvel süper kahramanları LCG. Çok fazla içerik mevcut.', price: 900, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 14, playTime: 90, location: 'Ankara, Çankaya', categorySlug: 'kart', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  
  // Çocuk Oyunları
  { title: 'Dobble', description: 'Hızlı refleks oyunu. Çocuklar bayılıyor. Türkçe kutu.', price: 100, condition: Condition.GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 8, minAge: 6, playTime: 15, location: 'Antalya, Kepez', categorySlug: 'cocuk', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Halli Galli', description: 'Meyve sayma ve zil çalma refleks oyunu. Klasik.', price: 150, condition: Condition.VERY_GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 6, minAge: 6, playTime: 15, location: 'İstanbul, Ataşehir', categorySlug: 'cocuk', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Jungle Speed', description: 'Hızlı el ve göz koordinasyonu gerektiren oyun.', price: 120, condition: Condition.GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 10, minAge: 7, playTime: 15, location: 'Kocaeli, Gebze', categorySlug: 'cocuk', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: 'Zingo', description: 'Çocuklar için bingo benzeri kelime oyunu.', price: 90, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 2, maxPlayers: 8, minAge: 4, playTime: 10, location: 'Ankara, Etimesgut', categorySlug: 'cocuk', images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800'] },
  { title: 'Çılgın Kalem', description: 'Çizim ve tahmin oyunu çocuklar için. Türkçe.', price: 80, condition: Condition.LIKE_NEW, language: Language.TURKISH, minPlayers: 3, maxPlayers: 6, minAge: 8, playTime: 20, location: 'Mersin, Yenişehir', categorySlug: 'cocuk', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Rhino Hero', description: 'Denge ve kart yığma oyunu. Çocuklar için harika.', price: 130, condition: Condition.VERY_GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 5, minAge: 5, playTime: 15, location: 'İstanbul, Maltepe', categorySlug: 'cocuk', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Icecool', description: 'Penguen fırlatma beceri oyunu. Çok eğlenceli.', price: 200, condition: Condition.LIKE_NEW, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 2, maxPlayers: 4, minAge: 6, playTime: 30, location: 'Bursa, Nilüfer', categorySlug: 'cocuk', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  
  // Kooperatif Oyunları
  { title: 'Pandemic', description: 'Dünyayı hastalıklardan kurtarma kooperatif oyunu. Klasik.', price: 400, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 2, maxPlayers: 4, minAge: 8, playTime: 45, location: 'İstanbul, Sarıyer', categorySlug: 'kooperatif', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Spirit Island', description: 'Kolonicilere karşı savaşan ruhlar. Ağır kooperatif.', price: 950, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 13, playTime: 120, location: 'Ankara, Çankaya', categorySlug: 'kooperatif', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Gloomhaven: Jaws of the Lion', description: 'Gloomhaven\'ın giriş versiyonu. Harika dungeon crawler.', price: 700, condition: Condition.GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 12, playTime: 120, location: 'İzmir, Buca', categorySlug: 'kooperatif', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: 'The Crew', description: 'Trick-taking kooperatif kart oyunu. Çok yaratıcı.', price: 150, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 2, maxPlayers: 5, minAge: 10, playTime: 20, location: 'Kayseri, Melikgazi', categorySlug: 'kooperatif', images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800'] },
  { title: 'Forbidden Island', description: 'Batan adadan kaçış kooperatif oyunu. Aile dostu.', price: 180, condition: Condition.GOOD, language: Language.TURKISH, minPlayers: 2, maxPlayers: 4, minAge: 10, playTime: 30, location: 'Eskişehir, Odunpazarı', categorySlug: 'kooperatif', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Arkham Horror 3rd Edition', description: 'Lovecraft temalı kooperatif macera oyunu.', price: 850, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 6, minAge: 14, playTime: 180, location: 'İstanbul, Kadıköy', categorySlug: 'kooperatif', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Robinson Crusoe', description: 'Ada hayatta kalma kooperatif oyunu. Çok zor!', price: 750, condition: Condition.GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 14, playTime: 120, location: 'Ankara, Keçiören', categorySlug: 'kooperatif', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  
  // Ekonomi Oyunları
  { title: 'Brass: Birmingham', description: 'Endüstri devrimi İngiltere\'sinde ekonomi yönetimi. Ağır euro.', price: 1100, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 4, minAge: 14, playTime: 120, location: 'İstanbul, Kadıköy', categorySlug: 'ekonomi', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Power Grid', description: 'Enerji şebekesi kurma ekonomi oyunu. Klasik.', price: 500, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 6, minAge: 12, playTime: 120, location: 'Ankara, Mamak', categorySlug: 'ekonomi', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Acquire', description: '60\'lardan kalma klasik otel zinciri yatırım oyunu.', price: 350, condition: Condition.GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 6, minAge: 12, playTime: 90, location: 'İzmir, Alsancak', categorySlug: 'ekonomi', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: 'Food Chain Magnate', description: 'Ağır ekonomi ve rekabet oyunu. Fast food zinciri yönetimi.', price: 1500, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 5, minAge: 14, playTime: 240, location: 'İstanbul, Beşiktaş', categorySlug: 'ekonomi', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Stockpile', description: 'Borsa temalı strateji oyunu. Bluff ve tahmin içerir.', price: 400, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 5, minAge: 13, playTime: 60, location: 'Ankara, Çankaya', categorySlug: 'ekonomi', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  
  // Bulmaca Oyunları
  { title: 'Exit: Ölü Adam Malikanesi', description: 'Kaçış odası kutu oyunu. Tek kullanımlık.', price: 80, condition: Condition.LIKE_NEW, language: Language.TURKISH, minPlayers: 1, maxPlayers: 4, minAge: 12, playTime: 90, location: 'Bursa, Nilüfer', categorySlug: 'bulmaca', images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800'] },
  { title: 'Unlock! Arsene Lupin', description: 'Dijital destekli kaçış odası oyunu.', price: 100, condition: Condition.LIKE_NEW, language: Language.TURKISH, minPlayers: 1, maxPlayers: 6, minAge: 10, playTime: 60, location: 'Antalya, Konyaaltı', categorySlug: 'bulmaca', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Sherlock Holmes Danışman Dedektif', description: 'Dedektiflik ve gizem çözme oyunu.', price: 400, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 1, maxPlayers: 8, minAge: 10, playTime: 90, location: 'İstanbul, Beykoz', categorySlug: 'bulmaca', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Mysterium', description: 'Kooperatif bulmaca ve çıkarım oyunu. Dixit benzeri kartlarla.', price: 450, condition: Condition.VERY_GOOD, language: Language.TURKISH, minPlayers: 2, maxPlayers: 7, minAge: 10, playTime: 60, location: 'Ankara, Yenimahalle', categorySlug: 'bulmaca', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Chronicles of Crime', description: 'VR destekli dedektiflik oyunu. Uygulama ile oynanır.', price: 350, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 14, playTime: 90, location: 'İzmir, Bornova', categorySlug: 'bulmaca', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  
  // Worker Placement
  { title: 'Agricola', description: 'Çiftçilik temalı ağır worker placement. Klasik.', price: 600, condition: Condition.GOOD, language: Language.TURKISH, minPlayers: 1, maxPlayers: 4, minAge: 12, playTime: 150, location: 'Konya, Selçuklu', categorySlug: 'worker-placement', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Viticulture - Türkçe', description: 'Şarap üretimi temalı worker placement. Çok tematik.', price: 700, condition: Condition.LIKE_NEW, language: Language.TURKISH, minPlayers: 1, maxPlayers: 6, minAge: 13, playTime: 90, location: 'İstanbul, Çekmeköy', categorySlug: 'worker-placement', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: 'Lords of Waterdeep', description: 'D&D temalı worker placement. Gateway oyunu.', price: 450, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 5, minAge: 12, playTime: 120, location: 'Ankara, Bahçelievler', categorySlug: 'worker-placement', images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800'] },
  { title: 'Caverna', description: 'Mağara cüceleri temalı Agricola\'nın gelişmişi.', price: 900, condition: Condition.GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 7, minAge: 12, playTime: 210, location: 'İzmir, Bornova', categorySlug: 'worker-placement', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'A Feast for Odin', description: 'Viking temalı ağır puzzle-y worker placement.', price: 1100, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 12, playTime: 120, location: 'İstanbul, Sarıyer', categorySlug: 'worker-placement', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Anachrony', description: 'Zaman yolculuğu temalı sci-fi worker placement.', price: 950, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 15, playTime: 120, location: 'Ankara, Çankaya', categorySlug: 'worker-placement', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  
  // Deck Building
  { title: 'Clank!', description: 'Dungeon crawler deck building oyunu. Çok eğlenceli.', price: 500, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 4, minAge: 12, playTime: 60, location: 'Trabzon, Ortahisar', categorySlug: 'deck-building', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Aeon\'s End', description: 'Kooperatif deck building boss savaşı oyunu.', price: 550, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 14, playTime: 60, location: 'Gaziantep, Şehitkamil', categorySlug: 'deck-building', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Legendary: Marvel', description: 'Marvel süper kahramanları deck building oyunu.', price: 650, condition: Condition.GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 5, minAge: 14, playTime: 45, location: 'Adana, Seyhan', categorySlug: 'deck-building', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
  { title: 'Thunderstone Quest', description: 'Dungeon temalı deck building. Çok içerik var.', price: 700, condition: Condition.VERY_GOOD, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 4, minAge: 14, playTime: 90, location: 'İstanbul, Beylikdüzü', categorySlug: 'deck-building', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Quest for El Dorado', description: 'Yarış temalı deck building oyunu. Aile dostu.', price: 380, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 2, maxPlayers: 4, minAge: 10, playTime: 60, location: 'Ankara, Keçiören', categorySlug: 'deck-building', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  
  // Roll & Write
  { title: 'Ganz Schön Clever', description: 'Zar atma ve puan yazma oyunu. Bağımlılık yapıyor.', price: 120, condition: Condition.VERY_GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 1, maxPlayers: 4, minAge: 8, playTime: 30, location: 'Malatya, Battalgazi', categorySlug: 'roll-write', images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800'] },
  { title: 'Welcome To...', description: 'Amerikan mahallesi kurma flip and write oyunu.', price: 180, condition: Condition.LIKE_NEW, language: Language.TURKISH, minPlayers: 1, maxPlayers: 100, minAge: 10, playTime: 25, location: 'Denizli, Pamukkale', categorySlug: 'roll-write', images: ['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'] },
  { title: 'Railroad Ink', description: 'Demiryolu ve karayolu çizim zar oyunu.', price: 150, condition: Condition.VERY_GOOD, language: Language.LANGUAGE_INDEPENDENT, minPlayers: 1, maxPlayers: 6, minAge: 8, playTime: 30, location: 'Sakarya, Adapazarı', categorySlug: 'roll-write', images: ['https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800'] },
  { title: 'Cartographers', description: 'Harita çizme flip and write oyunu. Çok keyifli.', price: 200, condition: Condition.LIKE_NEW, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 100, minAge: 10, playTime: 45, location: 'İstanbul, Ümraniye', categorySlug: 'roll-write', images: ['https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800'] },
  { title: 'Fleet: The Dice Game', description: 'Balıkçılık temalı roll and write oyunu.', price: 100, condition: Condition.GOOD, language: Language.ENGLISH, minPlayers: 1, maxPlayers: 4, minAge: 8, playTime: 30, location: 'Ankara, Mamak', categorySlug: 'roll-write', images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800'] },
];

// Addresses
const addresses = [
  { title: 'Ev', contactName: 'Ahmet Yılmaz', phone: '05321234567', city: 'İstanbul', district: 'Kadıköy', neighborhood: 'Caferağa', address: 'Moda Caddesi No:45 D:3', zipCode: '34710', isDefault: true },
  { title: 'İş', contactName: 'Ahmet Yılmaz', phone: '05321234567', city: 'İstanbul', district: 'Şişli', neighborhood: 'Mecidiyeköy', address: 'Büyükdere Caddesi No:100 K:5', zipCode: '34394', isDefault: false },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Admin Bypass hesapları oluştur
  console.log('🔐 Creating admin bypass accounts...');
  for (const account of adminBypassAccounts) {
    const hashedPassword = await bcrypt.hash(account.password, 10);
    await prisma.adminBypass.upsert({
      where: { username: account.username },
      update: { password: hashedPassword },
      create: {
        username: account.username,
        password: hashedPassword,
      },
    });
  }
  console.log(`✅ ${adminBypassAccounts.length} admin bypass accounts created`);

  // Create categories
  console.log('📁 Creating categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ ${categories.length} categories created`);

  // Create users
  console.log('👤 Creating users...');
  const defaultPasswordHash = await bcrypt.hash('çiğdem123', 10);
  
  for (const user of allUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        ...user,
        passwordHash: defaultPasswordHash,
      },
    });
  }
  console.log(`✅ ${allUsers.length} users created`);

  // Create addresses for first seller
  console.log('📍 Creating addresses...');
  for (const address of addresses) {
    await prisma.address.create({
      data: {
        ...address,
        userId: 'seller-1',
      },
    });
  }
  console.log(`✅ ${addresses.length} addresses created`);

  // Create products
  console.log('📦 Creating products...');
  const categoryMap = new Map<string, string>();
  const allCategories = await prisma.category.findMany();
  allCategories.forEach(c => categoryMap.set(c.slug, c.id));

  let productIndex = 0;
  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) continue;

    // Satıcıları döngüsel olarak ata
    const sellerId = sellerUsers[productIndex % sellerUsers.length].id;
    
    await prisma.product.create({
      data: {
        title: product.title,
        description: product.description,
        price: product.price,
        condition: product.condition,
        language: product.language,
        minPlayers: product.minPlayers,
        maxPlayers: product.maxPlayers,
        minAge: product.minAge,
        playTime: product.playTime,
        location: product.location,
        status: ProductStatus.ACTIVE,
        viewCount: Math.floor(Math.random() * 500) + 10,
        sellerId,
        categoryId,
        images: {
          create: product.images.map((url, index) => ({
            url,
            order: index,
          })),
        },
      },
    });
    productIndex++;
  }
  console.log(`✅ ${products.length} products created`);

  // Create some favorites
  console.log('❤️ Creating favorites...');
  const allProducts = await prisma.product.findMany({ take: 30 });
  for (let i = 0; i < 100; i++) {
    const userId = normalUsers[i % normalUsers.length].id;
    const productId = allProducts[i % allProducts.length].id;
    
    try {
      await prisma.favorite.create({
        data: { userId, productId },
      });
    } catch {
      // Ignore duplicate favorites
    }
  }
  console.log('✅ Favorites created');

  // Create some reviews
  console.log('⭐ Creating reviews...');
  const reviewComments = [
    'Çok hızlı kargo, oyun tam açıklandığı gibi. Teşekkürler!',
    'Satıcı çok ilgili, ürün temiz ve eksiksiz.',
    'Fiyatına göre çok iyi durumda, memnun kaldım.',
    'Biraz geç geldi ama ürün güzel durumda.',
    'Harika bir alışveriş deneyimiydi, tekrar alırım.',
    'Oyun çok güzel, kutusu biraz yıpranmış ama sorun değil.',
    'Hızlı teslimat, güvenilir satıcı.',
    'Beklediğimden daha iyi çıktı, çok mutluyum.',
    'Kesinlikle tavsiye ederim, 5 yıldız hak ediyor!',
    'İletişimi çok iyi, sorularıma hemen cevap verdi.',
  ];
  
  for (let i = 0; i < 60; i++) {
    const userId = normalUsers[(i + 3) % normalUsers.length].id;
    const productId = allProducts[i % allProducts.length].id;
    
    try {
      await prisma.review.create({
        data: {
          userId,
          productId,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          comment: reviewComments[i % reviewComments.length],
        },
      });
    } catch {
      // Ignore errors
    }
  }
  console.log('✅ Reviews created');

  // Create some orders
  console.log('🛒 Creating orders...');
  const orderStatuses = [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PAID, OrderStatus.PENDING];
  
  for (let i = 0; i < 20; i++) {
    const buyerId = normalUsers[i % normalUsers.length].id;
    const product = allProducts[(i + 5) % allProducts.length];
    
    // Get or create address
    let address = await prisma.address.findFirst({ where: { userId: buyerId } });
    if (!address) {
      address = await prisma.address.create({
        data: {
          title: 'Ev',
          contactName: normalUsers[i % normalUsers.length].displayName || 'Müşteri',
          phone: normalUsers[i % normalUsers.length].phone || '05001234567',
          city: 'İstanbul',
          district: 'Kadıköy',
          address: 'Test Adres No:' + i,
          userId: buyerId,
          isDefault: true,
        },
      });
    }

    await prisma.order.create({
      data: {
        orderNumber: `KO-${Date.now().toString(36).toUpperCase()}-${i}`,
        status: orderStatuses[i % orderStatuses.length],
        totalAmount: product.price,
        buyerId,
        addressId: address.id,
        paymentId: i < 10 ? `PAY-${Date.now()}-${i}` : null,
        paymentStatus: i < 10 ? 'SUCCESS' : null,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        },
      },
    });
  }
  console.log('✅ Orders created');

  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - ${adminBypassAccounts.length} admin bypass accounts (süleyman, hasan)`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${allUsers.length} users (${adminUsers.length} admin, ${sellerUsers.length} seller, ${normalUsers.length} user)`);
  console.log(`   - ${products.length} products`);
  console.log(`   - Multiple favorites, reviews, and orders`);
  console.log('');
  console.log('🔑 Admin bypass credentials:');
  console.log('   - Username: süleyman, Password: çiğdem123');
  console.log('   - Username: hasan, Password: çiğdem123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
