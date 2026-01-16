'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Order } from '@/types';
import { orderStatusLabels } from '@/types';

const statusIcons = {
  PENDING: Package,
  PAID: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  REFUNDED: XCircle,
};

const statusVariants: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  PAID: 'primary',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUNDED: 'error',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await api.orders.list() as Order[];
        setOrders(data);
      } catch (error) {
        console.error('Fetch orders error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Siparişlerim</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} variant="bordered" className="animate-pulse">
              <div className="h-6 bg-[var(--border)] rounded w-1/3 mb-4" />
              <div className="h-20 bg-[var(--border)] rounded" />
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
          <p className="text-lg font-medium mb-2">Henüz siparişiniz yok</p>
          <p className="text-[var(--muted)] mb-4">
            Beğendiğiniz ürünleri sepete ekleyip sipariş verebilirsiniz.
          </p>
          <Link href="/urunler">
            <Button>Ürünleri Keşfet</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            return (
              <Card key={order.id} variant="bordered">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">#{order.orderNumber}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge variant={statusVariants[order.status]}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {orderStatusLabels[order.status]}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.product.images?.[0]?.url || '/placeholder-game.png'}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.title}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {item.quantity} adet × {Number(item.price).toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="font-bold">
                    Toplam: {Number(order.totalAmount).toLocaleString('tr-TR')} ₺
                  </p>
                  <Link href={`/siparis/${order.id}`}>
                    <Button variant="outline" size="sm">
                      Detaylar
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
