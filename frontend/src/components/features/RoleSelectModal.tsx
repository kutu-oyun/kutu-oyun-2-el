'use client';

import { useState } from 'react';
import { X, Crown, ShoppingBag, Users, Check } from 'lucide-react';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: 'USER' | 'ADMIN' | 'SELLER';
  photoURL: string | null;
}

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  bypassToken: string;
  onSelectUser: (userId: string, selectedRole: string) => void;
}

const ROLES = [
  { value: 'ADMIN', label: 'Admin', icon: Crown, color: 'bg-amber-500', description: 'Tam yetki' },
  { value: 'SELLER', label: 'Satıcı', icon: ShoppingBag, color: 'bg-emerald-500', description: 'Satış yapabilir' },
  { value: 'USER', label: 'Kullanıcı', icon: Users, color: 'bg-blue-500', description: 'Normal üye' },
];

export default function RoleSelectModal({
  isOpen,
  onClose,
  users,
  bypassToken,
  onSelectUser,
}: RoleSelectModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleConfirm = async () => {
    if (!selectedUserId) return;
    
    setIsLoading(true);
    try {
      await onSelectUser(selectedUserId, selectedRole || selectedUser?.role || 'USER');
      onClose();
    } catch (error) {
      console.error('Error selecting user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">Kullanıcı ve Rol Seç</h2>
            <p className="text-sm text-slate-400 mt-1">Giriş yapmak istediğiniz kullanıcı ve rolü seçin</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Kullanıcı seçimi */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Kullanıcı Seç
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {users.map((user) => {
                const isSelected = selectedUserId === user.id;
                const roleConfig = ROLES.find(r => r.value === user.role);
                const Icon = roleConfig?.icon || Users;

                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSelectedRole(user.role);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                    }`}
                  >
                    <div className={`w-10 h-10 ${roleConfig?.color || 'bg-slate-600'} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{user.displayName || 'İsimsiz'}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rol seçimi */}
          {selectedUserId && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Rol Seç (opsiyonel)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.value;
                  const Icon = role.icon;

                  return (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                      }`}
                    >
                      <div className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-medium text-white">{role.label}</span>
                      <span className="text-xs text-slate-400">{role.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedUserId || isLoading}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              selectedUserId && !isLoading
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Giriş yapılıyor...
              </span>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
