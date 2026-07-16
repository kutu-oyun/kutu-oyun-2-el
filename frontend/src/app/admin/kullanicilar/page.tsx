'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Users,
  Shield,
  ShoppingBag,
  Crown,
  MoreVertical,
  Ban,
  CheckCircle,
  Edit,
  Trash2,
  Filter,
} from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: 'USER' | 'ADMIN' | 'SELLER';
  photoURL: string | null;
  phone: string | null;
  authProvider: string;
  isActive: boolean;
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Kullanıcıları yükle
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.bypass.getUsers({
        role: selectedRole === 'ALL' ? undefined : selectedRole,
        search: searchQuery || undefined,
        page: pagination.page,
        limit: 20,
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
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    // TODO: Implement role change API
    console.log('Role change:', userId, newRole);
    setShowRoleModal(false);
    loadUsers();
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    // TODO: Implement toggle active API
    console.log('Toggle active:', userId, isActive);
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        <div className="flex gap-2">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => (
            <div
              key={role}
              className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} text-white`}
            >
              {config.label}: {roleCounts[role] || 0}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <Card variant="bordered">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="İsim veya email ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="ALL">Tüm Roller</option>
            <option value="ADMIN">Admin</option>
            <option value="SELLER">Satıcı</option>
            <option value="USER">Kullanıcı</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card variant="bordered" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  İstatistikler
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--muted)]">
                    Kullanıcı bulunamadı
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role];
                  const RoleIcon = roleConfig.icon;

                  return (
                    <tr key={user.id} className="hover:bg-[var(--border)]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${roleConfig.color} rounded-full flex items-center justify-center`}>
                            <RoleIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{user.displayName || 'İsimsiz'}</p>
                            <p className="text-sm text-[var(--muted)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleConfig.color} text-white`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                          <span>{user._count.products} ürün</span>
                          <span>{user._count.orders} sipariş</span>
                          <span>{user._count.reviews} yorum</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive !== false
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {user.isActive !== false ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3" />
                              Pasif
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                            className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                            title="Rol Değiştir"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user.id, !(user.isActive !== false))}
                            className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                            title={user.isActive !== false ? 'Pasifleştir' : 'Aktifleştir'}
                          >
                            {user.isActive !== false ? (
                              <Ban className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--muted)]">
              Toplam {pagination.total} kullanıcı
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Önceki
              </Button>
              <span className="px-4 py-2 text-sm">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRoleModal(false)}
          />
          <Card variant="bordered" className="relative w-full max-w-md z-10">
            <h3 className="text-lg font-semibold mb-4">Rol Değiştir</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              {selectedUser.displayName || selectedUser.email} kullanıcısının rolünü değiştirin.
            </p>
            <div className="space-y-2">
              {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                const Icon = config.icon;
                const isSelected = selectedUser.role === role;
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(selectedUser.id, role)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--border)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">{config.label}</span>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-[var(--primary)] ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowRoleModal(false)}>
                İptal
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
