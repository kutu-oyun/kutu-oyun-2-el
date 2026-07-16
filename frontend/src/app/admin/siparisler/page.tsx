'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  createdAt: string;
  buyer: {
    displayName: string | null;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      title: string;
    };
  }[];
}

const STATUS_CONFIG = {
  PENDING: { label: 'Beklemede', icon: Clock, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  PAID: { label: 'Ödendi', icon: CheckCircle, color: 'bg-blue-500', textColor: 'text-blue-500' },
  SHIPPED: { label: 'Kargoda', icon: Truck, color: 'bg-purple-500', textColor: 'text-purple-500' },
  DELIVERED: { label: 'Teslim Edildi', icon: CheckCircle, color: 'bg-green-500', textColor: 'text-green-500' },
  CANCELLED: { label: 'İptal', icon: XCircle, color: 'bg-red-500', textColor: 'text-red-500' },
  REFUNDED: { label: 'İade', icon: RefreshCw, color: 'bg-orange-500', textColor: 'text-orange-500' },
};

// Mock data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'KO-ABC123',
    status: 'DELIVERED',
    totalAmount: 450,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    buyer: { displayName: 'Ahmet Yılmaz', email: 'ahmet@test.com' },
    items: [{ id: '1', quantity: 1, price: 450, product: { title: 'Catan - Türkçe' } }],
  },
  {
    id: '2',
    orderNumber: 'KO-DEF456',
    status: 'SHIPPED',
    totalAmount: 680,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    buyer: { displayName: 'Mehmet Kaya', email: 'mehmet@test.com' },
    items: [{ id: '2', quantity: 1, price: 680, product: { title: 'Ticket to Ride Europe' } }],
  },
  {
    id: '3',
    orderNumber: 'KO-GHI789',
    status: 'PAID',
    totalAmount: 320,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    buyer: { displayName: 'Zeynep Demir', email: 'zeynep@test.com' },
    items: [{ id: '3', quantity: 1, price: 320, product: { title: 'Azul' } }],
  },
  {
    id: '4',
    orderNumber: 'KO-JKL012',
    status: 'PENDING',
    totalAmount: 180,
    createdAt: new Date().toISOString(),
    buyer: { displayName: 'Ayşe Çelik', email: 'ayse@test.com' },
    items: [{ id: '4', quantity: 1, price: 180, product: { title: 'Codenames - Türkçe' } }],
  },
  {
    id: '5',
    orderNumber: 'KO-MNO345',
    status: 'CANCELLED',
    totalAmount: 500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    buyer: { displayName: 'Can Özkan', email: 'can@test.com' },
    items: [{ id: '5', quantity: 1, price: 500, product: { title: 'Clank!' } }],
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // TODO: Implement status change API
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
    ));
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sipariş Yönetimi</h1>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <div
              key={status}
              className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} text-white`}
            >
              {config.label}: {statusCounts[status] || 0}
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
                placeholder="Sipariş no veya müşteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="ALL">Tüm Durumlar</option>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>{config.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card variant="bordered" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Sipariş
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Ürünler
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Tutar
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--muted)]">
                    Sipariş bulunamadı
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={order.id} className="hover:bg-[var(--border)]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-[var(--muted)]">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.buyer.displayName || 'İsimsiz'}</p>
                          <p className="text-sm text-[var(--muted)]">{order.buyer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {order.items.map((item, idx) => (
                            <p key={item.id}>
                              {item.product.title} x{item.quantity}
                              {idx < order.items.length - 1 && ', '}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{order.totalAmount.toLocaleString('tr-TR')} ₺</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} text-white`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detay
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          <Card variant="bordered" className="relative w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Sipariş Detayı</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--muted)]">Sipariş No</p>
                  <p className="font-mono font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Tarih</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Müşteri</p>
                <p className="font-medium">{selectedOrder.buyer.displayName || 'İsimsiz'}</p>
                <p className="text-sm">{selectedOrder.buyer.email}</p>
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-2">Ürünler</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2 bg-[var(--border)] rounded-lg">
                      <span>{item.product.title} x{item.quantity}</span>
                      <span className="font-medium">{item.price.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
                <span className="font-medium">Toplam</span>
                <span className="text-xl font-bold">{selectedOrder.totalAmount.toLocaleString('tr-TR')} ₺</span>
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-2">Durumu Değiştir</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedOrder.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedOrder.id, status)}
                        disabled={isSelected}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10 opacity-50 cursor-not-allowed'
                            : 'border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${config.textColor}`} />
                        <span className="text-sm">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                Kapat
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
