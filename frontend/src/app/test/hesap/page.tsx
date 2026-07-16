'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Shield,
  ShoppingBag,
  Crown,
  LogIn,
  Check,
  Moon,
  Sun,
  Lock,
  Package,
  Star,
  Filter,
} from 'lucide-react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: 'USER' | 'ADMIN' | 'SELLER';
  photoURL: string | null;
  phone: string | null;
  authProvider: string;
  createdAt: string;
  _count: {
    products: number;
    orders: number;
    reviews: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  roleCounts: Record<string, number>;
}

const ROLE_CONFIG = {
  ADMIN: { icon: Crown, color: 'bg-amber-500', label: 'Admin', textColor: 'text-amber-500' },
  SELLER: { icon: ShoppingBag, color: 'bg-emerald-500', label: 'Satıcı', textColor: 'text-emerald-500' },
  USER: { icon: Users, color: 'bg-blue-500', label: 'Kullanıcı', textColor: 'text-blue-500' },
};

const DEFAULT_PASSWORD = 'çiğdem123';

export default function TestHesapPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [bypassCredentials, setBypassCredentials] = useState({ username: '', password: '' });
  const [bypassError, setBypassError] = useState('');

  // Aktif session'ı kontrol et
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('testSessionToken');
      if (token) {
        try {
          const response = await api.bypass.verify() as any;
          if (response.success && response.user) {
            setActiveUserId(response.user.id);
          }
        } catch {
          localStorage.removeItem('testSessionToken');
        }
      }
    };
    checkSession();
  }, []);

  // Kullanıcıları yükle
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.bypass.getUsers({
        role: selectedRole === 'ALL' ? undefined : selectedRole,
        search: searchQuery || undefined,
        page: pagination.page,
        limit: 50,
      }) as UsersResponse;

      setUsers(response.users);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
      setRoleCounts(response.roleCounts);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, searchQuery, pagination.page]);

  useEffect(() => {
    if (!isLocked) {
      loadUsers();
    }
  }, [loadUsers, isLocked]);

  // Hızlı giriş
  const handleQuickLogin = async (user: User) => {
    try {
      setLoggingIn(user.id);
      const response = await api.bypass.quickLogin(user.id) as any;
      
      if (response.success && response.token) {
        localStorage.setItem('testSessionToken', response.token);
        localStorage.setItem('testUser', JSON.stringify(response.user));
        setActiveUserId(user.id);
        
        // Sayfayı yenile veya anasayfaya yönlendir
        router.push('/');
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
    } finally {
      setLoggingIn(null);
    }
  };

  // Bypass login (kilit açma)
  const handleBypassLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBypassError('');
    
    try {
      const response = await api.bypass.login(
        bypassCredentials.username,
        bypassCredentials.password
      ) as any;
      
      if (response.success) {
        setIsLocked(false);
        setBypassCredentials({ username: '', password: '' });
      }
    } catch (error: any) {
      setBypassError(error.message || 'Giriş başarısız');
    }
  };

  // Çıkış
  const handleLogout = async () => {
    try {
      await api.bypass.logout();
    } catch {
      // Ignore
    }
    localStorage.removeItem('testSessionToken');
    localStorage.removeItem('testUser');
    setActiveUserId(null);
  };

  // Aktif kullanıcı bilgisi
  const activeUser = users.find(u => u.id === activeUserId);

  // Kilit ekranı
  if (isLocked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Test Hesapları
            </h1>
            <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Bu sayfaya erişmek için yetkilendirme gerekiyor
            </p>
          </div>

          <form onSubmit={handleBypassLogin} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={bypassCredentials.username}
                onChange={(e) => setBypassCredentials(prev => ({ ...prev, username: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                placeholder="Kullanıcı adı"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Şifre
              </label>
              <input
                type="password"
                value={bypassCredentials.password}
                onChange={(e) => setBypassCredentials(prev => ({ ...prev, password: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                placeholder="Şifre"
              />
            </div>

            {bypassError && (
              <p className="text-red-500 text-sm text-center">{bypassError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              Kilidi Aç
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 ${isDark ? 'bg-slate-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Test Hesapları</h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Varsayılan şifre: <span className="font-mono bg-slate-700/50 px-2 py-0.5 rounded">{DEFAULT_PASSWORD}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Aktif Hesap */}
              {activeUser && (
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'} border border-emerald-500/30`}>
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Aktif Hesap:</span>
                  <span className="font-medium text-emerald-500">{activeUser.displayName || activeUser.email}</span>
                  <button
                    onClick={() => router.push('/')}
                    className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Panele Git →
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Çıkış
                  </button>
                </div>
              )}

              {/* Tema değiştirici */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Kilit */}
              <button
                onClick={() => setIsLocked(true)}
                className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                <Lock className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => {
            const count = roleCounts[role] || 0;
            const Icon = config.icon;
            return (
              <div
                key={role}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}
              >
                <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            );
          })}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
            <span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Toplam:</span>
            <span className="font-semibold">{pagination.total}</span>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-gray-200'} mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-amber-500" />
            <span className="font-medium">Filtreler</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="İsim veya email ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-amber-500`}
              />
            </div>

            {/* Rol filtresi */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className={`px-4 py-3 rounded-xl border ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
            >
              <option value="ALL">Tüm Roller</option>
              <option value="ADMIN">Admin</option>
              <option value="SELLER">Satıcı</option>
              <option value="USER">Kullanıcı</option>
            </select>
          </div>
        </div>

        {/* Kullanıcı sayısı */}
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {pagination.total} hesap gösteriliyor
        </p>

        {/* Tablo */}
        <div className={`rounded-2xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <table className="w-full">
            <thead className={isDark ? 'bg-slate-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Kullanıcı
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Email
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Rol
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  İstatistikler
                </th>
                <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Aksiyon
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700 bg-slate-800/50' : 'divide-gray-200 bg-white'}`}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-6 py-12 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Kullanıcı bulunamadı
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role];
                  const RoleIcon = roleConfig.icon;
                  const isActive = activeUserId === user.id;
                  const isLogging = loggingIn === user.id;

                  return (
                    <tr key={user.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${roleConfig.color} rounded-xl flex items-center justify-center`}>
                            <RoleIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{user.displayName || 'İsimsiz'}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                              {user.authProvider}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${roleConfig.color} text-white`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1" title="Ürünler">
                            <Package className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                            <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{user._count.products}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Siparişler">
                            <ShoppingBag className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                            <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{user._count.orders}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Yorumlar">
                            <Star className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                            <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{user._count.reviews}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isActive ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium">
                            <Check className="w-4 h-4" />
                            Aktif
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickLogin(user)}
                            disabled={isLogging}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                              isLogging
                                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25'
                            }`}
                          >
                            {isLogging ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <LogIn className="w-4 h-4" />
                            )}
                            Giriş Yap
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
