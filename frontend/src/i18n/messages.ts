import type { Locale } from './locales';

export type MessageKey =
  | 'nav.searchPlaceholder'
  | 'nav.location'
  | 'nav.myAccount'
  | 'nav.user'
  | 'nav.myListings'
  | 'nav.myOrders'
  | 'nav.myFavorites'
  | 'nav.myMessages'
  | 'nav.settings'
  | 'nav.logout'
  | 'nav.login'
  | 'nav.sell'
  | 'nav.sellFree'
  | 'nav.allCategories'
  | 'nav.categories'
  | 'cat.strategy'
  | 'cat.family'
  | 'cat.party'
  | 'cat.card'
  | 'cat.kids'
  | 'cat.cooperative'
  | 'footer.tagline'
  | 'footer.categories'
  | 'footer.cat.strategy'
  | 'footer.cat.family'
  | 'footer.cat.party'
  | 'footer.cat.card'
  | 'footer.cat.kids'
  | 'footer.cat.all'
  | 'footer.help'
  | 'footer.howItWorks'
  | 'footer.safeShopping'
  | 'footer.faq'
  | 'footer.returns'
  | 'footer.contact'
  | 'footer.contactTitle'
  | 'footer.securePayment'
  | 'footer.rights'
  | 'footer.privacy'
  | 'footer.terms'
  | 'prefs.appearance'
  | 'prefs.theme'
  | 'prefs.themeLight'
  | 'prefs.themeDark'
  | 'prefs.themeSystem'
  | 'prefs.language'
  | 'prefs.languageHint'
  | 'theme.toggle'
  | 'theme.light'
  | 'theme.dark'
  | 'lang.select';

type Messages = Record<MessageKey, string>;

const tr: Messages = {
  'nav.searchPlaceholder': 'Kutu oyunu ara...',
  'nav.location': 'İstanbul, Türkiye',
  'nav.myAccount': 'Hesabım',
  'nav.user': 'Kullanıcı',
  'nav.myListings': 'İlanlarım',
  'nav.myOrders': 'Siparişlerim',
  'nav.myFavorites': 'Favorilerim',
  'nav.myMessages': 'Mesajlarım',
  'nav.settings': 'Ayarlar',
  'nav.logout': 'Çıkış Yap',
  'nav.login': 'Giriş Yap',
  'nav.sell': 'Sat',
  'nav.sellFree': 'Ücretsiz İlan Ver',
  'nav.allCategories': 'Tüm Kategoriler',
  'nav.categories': 'Kategoriler',
  'cat.strategy': 'Strateji',
  'cat.family': 'Aile',
  'cat.party': 'Parti',
  'cat.card': 'Kart',
  'cat.kids': 'Çocuk',
  'cat.cooperative': 'Kooperatif',
  'footer.tagline':
    "Türkiye'nin en büyük 2. el kutu oyun pazaryeri. Güvenli alışveriş, uygun fiyatlar, geniş oyun seçeneği.",
  'footer.categories': 'Kategoriler',
  'footer.cat.strategy': 'Strateji Oyunları',
  'footer.cat.family': 'Aile Oyunları',
  'footer.cat.party': 'Parti Oyunları',
  'footer.cat.card': 'Kart Oyunları',
  'footer.cat.kids': 'Çocuk Oyunları',
  'footer.cat.all': 'Tüm Kategoriler',
  'footer.help': 'Yardım',
  'footer.howItWorks': 'Nasıl Çalışır?',
  'footer.safeShopping': 'Güvenli Alışveriş',
  'footer.faq': 'Sık Sorulan Sorular',
  'footer.returns': 'İade Politikası',
  'footer.contact': 'İletişim',
  'footer.contactTitle': 'İletişim',
  'footer.securePayment': 'Güvenli Ödeme',
  'footer.rights': '© 2024 KutuOyun. Tüm hakları saklıdır.',
  'footer.privacy': 'Gizlilik Politikası',
  'footer.terms': 'Kullanım Koşulları',
  'prefs.appearance': 'Görünüm',
  'prefs.theme': 'Tema',
  'prefs.themeLight': 'Aydınlık',
  'prefs.themeDark': 'Karanlık',
  'prefs.themeSystem': 'Sistem',
  'prefs.language': 'Dil',
  'prefs.languageHint': 'Arayüz dilini seçin',
  'theme.toggle': 'Temayı değiştir',
  'theme.light': 'Aydınlık tema',
  'theme.dark': 'Karanlık tema',
  'lang.select': 'Dil seç',
};

const en: Messages = {
  'nav.searchPlaceholder': 'Search board games...',
  'nav.location': 'Istanbul, Turkey',
  'nav.myAccount': 'My account',
  'nav.user': 'User',
  'nav.myListings': 'My listings',
  'nav.myOrders': 'My orders',
  'nav.myFavorites': 'My favorites',
  'nav.myMessages': 'My messages',
  'nav.settings': 'Settings',
  'nav.logout': 'Log out',
  'nav.login': 'Sign in',
  'nav.sell': 'Sell',
  'nav.sellFree': 'Post a free listing',
  'nav.allCategories': 'All categories',
  'nav.categories': 'Categories',
  'cat.strategy': 'Strategy',
  'cat.family': 'Family',
  'cat.party': 'Party',
  'cat.card': 'Card',
  'cat.kids': 'Kids',
  'cat.cooperative': 'Cooperative',
  'footer.tagline':
    "Turkey's largest second-hand board game marketplace. Safe shopping, fair prices, wide selection.",
  'footer.categories': 'Categories',
  'footer.cat.strategy': 'Strategy games',
  'footer.cat.family': 'Family games',
  'footer.cat.party': 'Party games',
  'footer.cat.card': 'Card games',
  'footer.cat.kids': 'Kids games',
  'footer.cat.all': 'All categories',
  'footer.help': 'Help',
  'footer.howItWorks': 'How it works',
  'footer.safeShopping': 'Safe shopping',
  'footer.faq': 'FAQ',
  'footer.returns': 'Return policy',
  'footer.contact': 'Contact',
  'footer.contactTitle': 'Contact',
  'footer.securePayment': 'Secure payment',
  'footer.rights': '© 2024 KutuOyun. All rights reserved.',
  'footer.privacy': 'Privacy policy',
  'footer.terms': 'Terms of use',
  'prefs.appearance': 'Appearance',
  'prefs.theme': 'Theme',
  'prefs.themeLight': 'Light',
  'prefs.themeDark': 'Dark',
  'prefs.themeSystem': 'System',
  'prefs.language': 'Language',
  'prefs.languageHint': 'Choose the interface language',
  'theme.toggle': 'Toggle theme',
  'theme.light': 'Light theme',
  'theme.dark': 'Dark theme',
  'lang.select': 'Select language',
};

const de: Messages = {
  'nav.searchPlaceholder': 'Brettspiele suchen...',
  'nav.location': 'Istanbul, Türkei',
  'nav.myAccount': 'Mein Konto',
  'nav.user': 'Benutzer',
  'nav.myListings': 'Meine Anzeigen',
  'nav.myOrders': 'Meine Bestellungen',
  'nav.myFavorites': 'Meine Favoriten',
  'nav.myMessages': 'Meine Nachrichten',
  'nav.settings': 'Einstellungen',
  'nav.logout': 'Abmelden',
  'nav.login': 'Anmelden',
  'nav.sell': 'Verkaufen',
  'nav.sellFree': 'Kostenlos inserieren',
  'nav.allCategories': 'Alle Kategorien',
  'nav.categories': 'Kategorien',
  'cat.strategy': 'Strategie',
  'cat.family': 'Familie',
  'cat.party': 'Party',
  'cat.card': 'Karten',
  'cat.kids': 'Kinder',
  'cat.cooperative': 'Kooperativ',
  'footer.tagline':
    'Der größte Second-Hand-Brettspielmarkt der Türkei. Sicherer Einkauf, faire Preise, große Auswahl.',
  'footer.categories': 'Kategorien',
  'footer.cat.strategy': 'Strategiespiele',
  'footer.cat.family': 'Familienspiele',
  'footer.cat.party': 'Partyspiele',
  'footer.cat.card': 'Kartenspiele',
  'footer.cat.kids': 'Kinderspiele',
  'footer.cat.all': 'Alle Kategorien',
  'footer.help': 'Hilfe',
  'footer.howItWorks': 'So funktioniert es',
  'footer.safeShopping': 'Sicherer Einkauf',
  'footer.faq': 'FAQ',
  'footer.returns': 'Rückgaberecht',
  'footer.contact': 'Kontakt',
  'footer.contactTitle': 'Kontakt',
  'footer.securePayment': 'Sichere Zahlung',
  'footer.rights': '© 2024 KutuOyun. Alle Rechte vorbehalten.',
  'footer.privacy': 'Datenschutz',
  'footer.terms': 'Nutzungsbedingungen',
  'prefs.appearance': 'Darstellung',
  'prefs.theme': 'Thema',
  'prefs.themeLight': 'Hell',
  'prefs.themeDark': 'Dunkel',
  'prefs.themeSystem': 'System',
  'prefs.language': 'Sprache',
  'prefs.languageHint': 'Schnittstellensprache wählen',
  'theme.toggle': 'Thema wechseln',
  'theme.light': 'Helles Thema',
  'theme.dark': 'Dunkles Thema',
  'lang.select': 'Sprache wählen',
};

const fr: Messages = {
  'nav.searchPlaceholder': 'Rechercher des jeux de société...',
  'nav.location': 'Istanbul, Turquie',
  'nav.myAccount': 'Mon compte',
  'nav.user': 'Utilisateur',
  'nav.myListings': 'Mes annonces',
  'nav.myOrders': 'Mes commandes',
  'nav.myFavorites': 'Mes favoris',
  'nav.myMessages': 'Mes messages',
  'nav.settings': 'Paramètres',
  'nav.logout': 'Se déconnecter',
  'nav.login': 'Se connecter',
  'nav.sell': 'Vendre',
  'nav.sellFree': 'Publier gratuitement',
  'nav.allCategories': 'Toutes les catégories',
  'nav.categories': 'Catégories',
  'cat.strategy': 'Stratégie',
  'cat.family': 'Famille',
  'cat.party': 'Fête',
  'cat.card': 'Cartes',
  'cat.kids': 'Enfants',
  'cat.cooperative': 'Coopératif',
  'footer.tagline':
    'Le plus grand marché de jeux de société d’occasion en Turquie. Achat sécurisé, prix justes, large choix.',
  'footer.categories': 'Catégories',
  'footer.cat.strategy': 'Jeux de stratégie',
  'footer.cat.family': 'Jeux de famille',
  'footer.cat.party': 'Jeux de fête',
  'footer.cat.card': 'Jeux de cartes',
  'footer.cat.kids': 'Jeux pour enfants',
  'footer.cat.all': 'Toutes les catégories',
  'footer.help': 'Aide',
  'footer.howItWorks': 'Comment ça marche',
  'footer.safeShopping': 'Achat sécurisé',
  'footer.faq': 'FAQ',
  'footer.returns': 'Politique de retour',
  'footer.contact': 'Contact',
  'footer.contactTitle': 'Contact',
  'footer.securePayment': 'Paiement sécurisé',
  'footer.rights': '© 2024 KutuOyun. Tous droits réservés.',
  'footer.privacy': 'Politique de confidentialité',
  'footer.terms': "Conditions d'utilisation",
  'prefs.appearance': 'Apparence',
  'prefs.theme': 'Thème',
  'prefs.themeLight': 'Clair',
  'prefs.themeDark': 'Sombre',
  'prefs.themeSystem': 'Système',
  'prefs.language': 'Langue',
  'prefs.languageHint': "Choisissez la langue de l'interface",
  'theme.toggle': 'Changer de thème',
  'theme.light': 'Thème clair',
  'theme.dark': 'Thème sombre',
  'lang.select': 'Choisir la langue',
};

const es: Messages = {
  'nav.searchPlaceholder': 'Buscar juegos de mesa...',
  'nav.location': 'Estambul, Turquía',
  'nav.myAccount': 'Mi cuenta',
  'nav.user': 'Usuario',
  'nav.myListings': 'Mis anuncios',
  'nav.myOrders': 'Mis pedidos',
  'nav.myFavorites': 'Mis favoritos',
  'nav.myMessages': 'Mis mensajes',
  'nav.settings': 'Ajustes',
  'nav.logout': 'Cerrar sesión',
  'nav.login': 'Iniciar sesión',
  'nav.sell': 'Vender',
  'nav.sellFree': 'Publicar gratis',
  'nav.allCategories': 'Todas las categorías',
  'nav.categories': 'Categorías',
  'cat.strategy': 'Estrategia',
  'cat.family': 'Familia',
  'cat.party': 'Fiesta',
  'cat.card': 'Cartas',
  'cat.kids': 'Niños',
  'cat.cooperative': 'Cooperativo',
  'footer.tagline':
    'El mayor mercado de juegos de mesa de segunda mano de Turquía. Compra segura, precios justos, gran selección.',
  'footer.categories': 'Categorías',
  'footer.cat.strategy': 'Juegos de estrategia',
  'footer.cat.family': 'Juegos familiares',
  'footer.cat.party': 'Juegos de fiesta',
  'footer.cat.card': 'Juegos de cartas',
  'footer.cat.kids': 'Juegos infantiles',
  'footer.cat.all': 'Todas las categorías',
  'footer.help': 'Ayuda',
  'footer.howItWorks': 'Cómo funciona',
  'footer.safeShopping': 'Compra segura',
  'footer.faq': 'Preguntas frecuentes',
  'footer.returns': 'Política de devoluciones',
  'footer.contact': 'Contacto',
  'footer.contactTitle': 'Contacto',
  'footer.securePayment': 'Pago seguro',
  'footer.rights': '© 2024 KutuOyun. Todos los derechos reservados.',
  'footer.privacy': 'Política de privacidad',
  'footer.terms': 'Términos de uso',
  'prefs.appearance': 'Apariencia',
  'prefs.theme': 'Tema',
  'prefs.themeLight': 'Claro',
  'prefs.themeDark': 'Oscuro',
  'prefs.themeSystem': 'Sistema',
  'prefs.language': 'Idioma',
  'prefs.languageHint': 'Elige el idioma de la interfaz',
  'theme.toggle': 'Cambiar tema',
  'theme.light': 'Tema claro',
  'theme.dark': 'Tema oscuro',
  'lang.select': 'Seleccionar idioma',
};

const ar: Messages = {
  'nav.searchPlaceholder': 'ابحث عن ألعاب الطاولة...',
  'nav.location': 'إسطنبول، تركيا',
  'nav.myAccount': 'حسابي',
  'nav.user': 'مستخدم',
  'nav.myListings': 'إعلاناتي',
  'nav.myOrders': 'طلباتي',
  'nav.myFavorites': 'المفضلة',
  'nav.myMessages': 'رسائلي',
  'nav.settings': 'الإعدادات',
  'nav.logout': 'تسجيل الخروج',
  'nav.login': 'تسجيل الدخول',
  'nav.sell': 'بيع',
  'nav.sellFree': 'انشر إعلاناً مجاناً',
  'nav.allCategories': 'كل الفئات',
  'nav.categories': 'الفئات',
  'cat.strategy': 'استراتيجية',
  'cat.family': 'عائلي',
  'cat.party': 'حفلات',
  'cat.card': 'ورق',
  'cat.kids': 'أطفال',
  'cat.cooperative': 'تعاوني',
  'footer.tagline':
    'أكبر سوق لألعاب الطاولة المستعملة في تركيا. تسوق آمن وأسعار مناسبة وتشكيلة واسعة.',
  'footer.categories': 'الفئات',
  'footer.cat.strategy': 'ألعاب استراتيجية',
  'footer.cat.family': 'ألعاب عائلية',
  'footer.cat.party': 'ألعاب حفلات',
  'footer.cat.card': 'ألعاب ورق',
  'footer.cat.kids': 'ألعاب أطفال',
  'footer.cat.all': 'كل الفئات',
  'footer.help': 'مساعدة',
  'footer.howItWorks': 'كيف يعمل؟',
  'footer.safeShopping': 'تسوق آمن',
  'footer.faq': 'الأسئلة الشائعة',
  'footer.returns': 'سياسة الإرجاع',
  'footer.contact': 'تواصل',
  'footer.contactTitle': 'تواصل',
  'footer.securePayment': 'دفع آمن',
  'footer.rights': '© 2024 KutuOyun. جميع الحقوق محفوظة.',
  'footer.privacy': 'سياسة الخصوصية',
  'footer.terms': 'شروط الاستخدام',
  'prefs.appearance': 'المظهر',
  'prefs.theme': 'السمة',
  'prefs.themeLight': 'فاتح',
  'prefs.themeDark': 'داكن',
  'prefs.themeSystem': 'النظام',
  'prefs.language': 'اللغة',
  'prefs.languageHint': 'اختر لغة الواجهة',
  'theme.toggle': 'تبديل السمة',
  'theme.light': 'السمة الفاتحة',
  'theme.dark': 'السمة الداكنة',
  'lang.select': 'اختر اللغة',
};

export const messages: Record<Locale, Messages> = {
  tr,
  en,
  de,
  fr,
  es,
  ar,
};
