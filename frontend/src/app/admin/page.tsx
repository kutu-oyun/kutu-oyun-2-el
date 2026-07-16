'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Package, ShoppingCart, TrendingUp, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import { api } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  activeProducts: number;
  monthlyOrders: number;
  totalSales: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'product' | 'order';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'pending' | 'warning';
}

// Mock data - gerçek API'den çekilecek
const mockStats: DashboardStats = {
  totalUsers: 35,
  activeProducts: 75,
  monthlyOrders: 20,
  totalSales: 45670,
};

const mockActivities: RecentActivity[] = [
  { id: '1', type: 'user', title: 'Yeni kullanıcı kaydı', description: 'user20@test.com', time: '2 dk önce', status: 'success' },
  { id: '2', type: 'product', title: 'Yeni ilan oluşturuldu', description: 'Catan - Türkçe', time: '15 dk önce', status: 'pending' },
  { id: '3', type: 'order', title: 'Sipariş tamamlandı', description: '#KO-ABC123', time: '1 saat önce', status: 'success' },
  { id: '4', type: 'order', title: 'Sipariş iptal edildi', description: '#KO-DEF456', time: '2 saat önce', status: 'warning' },
  { id: '5', type: 'product', title: 'Ürün satıldı', description: 'Azul', time: '3 saat önce', status: 'success' },
];

const stats = [
  { key: 'totalUsers', label: 'Toplam Kullanıcı', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10', link: '/admin/kullanicilar' },
  { key: 'activeProducts', label: 'Aktif İlan', icon: Package, color: 'text-green-500', bgColor: 'bg-green-500/10', link: '/admin/urunler' },
  { key: 'monthlyOrders', label: 'Bu Ay Sipariş', icon: ShoppingCart, color: 'text-purple-500', bgColor: 'bg-purple-500/10', link: '/admin/siparisler' },
  { key: 'totalSales', label: 'Toplam Satış', icon: TrendingUp, color: 'text-orange-500', bgColor: 'bg-orange-500/10', link: '/admin/siparisler', format: 'currency' },
];

const statusIcons = {
  success: CheckCircle,
  pending: Clock,
  warning: AlertCircle,
};

const statusColors = {
  success: 'text-green-500',
  pending: 'text-yellow-500',
  warning: 'text-red-500',
};

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(mockStats);
  const [activities, setActivities] = useState<RecentActivity[]>(mockActivities);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Load real data from API
    const loadData = async () => {
      setLoading(true);
      try {
        // const stats = await api.admin.getStats();
        // setDashboardStats(stats);
      } catch (error) {
        console.error('Dashboard data load error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatValue = (value: number, format?: string) => {
    if (format === 'currency') {
      return `${value.toLocaleString('tr-TR')} ₺`;
    }
    return value.toLocaleString('tr-TR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--muted)]">
          Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const value = dashboardStats[stat.key as keyof DashboardStats];
          return (
            <Link href={stat.link} key={stat.label}>
              <Card variant="bordered" className="hover:border-[var(--primary)] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold">{formatValue(value, stat.format)}</p>
                    <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/kullanicilar">
          <Card variant="bordered" className="hover:border-[var(--primary)] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Kullanıcı Yönetimi</p>
                <p className="text-sm text-[var(--muted)]">Rolleri düzenle, hesapları yönet</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/siparisler">
          <Card variant="bordered" className="hover:border-[var(--primary)] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Sipariş Yönetimi</p>
                <p className="text-sm text-[var(--muted)]">Siparişleri takip et, durumları güncelle</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/test/hesap">
          <Card variant="bordered" className="hover:border-amber-500 transition-colors cursor-pointer border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-amber-500">Test Hesapları</p>
                <p className="text-sm text-[var(--muted)]">Hızlı giriş ve test ortamı</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card variant="bordered">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Son Aktiviteler</h2>
          <Link href="/admin/audit-log" className="text-sm text-[var(--primary)] hover:underline">
            Tümünü Gör
          </Link>
        </div>
        <div className="space-y-1">
          {activities.map((activity) => {
            const StatusIcon = activity.status ? statusIcons[activity.status] : Clock;
            const statusColor = activity.status ? statusColors[activity.status] : 'text-gray-500';
            
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-[var(--muted)]">{activity.description}</p>
                  </div>
                </div>
                <span className="text-sm text-[var(--muted)]">{activity.time}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* System Info */}
      <Card variant="bordered">
        <h2 className="font-semibold mb-4">Sistem Bilgisi</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[var(--muted)]">Veritabanı</p>
            <p className="font-medium">MySQL</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Backend</p>
            <p className="font-medium">Node.js + Express</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Frontend</p>
            <p className="font-medium">Next.js 14</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Auth</p>
            <p className="font-medium">Firebase + JWT</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
