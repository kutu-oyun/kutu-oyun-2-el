'use client';

import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';

const stats = [
  { label: 'Toplam Kullanıcı', value: '1,234', icon: Users, color: 'text-blue-500' },
  { label: 'Aktif İlan', value: '567', icon: Package, color: 'text-green-500' },
  { label: 'Bu Ay Sipariş', value: '89', icon: ShoppingCart, color: 'text-purple-500' },
  { label: 'Toplam Satış', value: '45,670 ₺', icon: TrendingUp, color: 'text-orange-500' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="bordered">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-[var(--border)] flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card variant="bordered">
        <h2 className="font-semibold mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <div>
              <p className="font-medium">Yeni kullanıcı kaydı</p>
              <p className="text-sm text-[var(--muted)]">user@email.com</p>
            </div>
            <span className="text-sm text-[var(--muted)]">2 dk önce</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <div>
              <p className="font-medium">Yeni ilan oluşturuldu</p>
              <p className="text-sm text-[var(--muted)]">Catan - Türkçe</p>
            </div>
            <span className="text-sm text-[var(--muted)]">15 dk önce</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <div>
              <p className="font-medium">Sipariş tamamlandı</p>
              <p className="text-sm text-[var(--muted)]">#KO-ABC123</p>
            </div>
            <span className="text-sm text-[var(--muted)]">1 saat önce</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
