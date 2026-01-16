'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Order } from '@/types';
import { orderStatusLabels } from '@/types';

const statusVariants: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  PAID: 'primary',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUNDED: 'error',
};

export default function SalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await api.orders.sales() as Order[];
        setSales(data);
      } catch (error) {
        console.error('Fetch sales error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, [user]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.orders.updateStatus(orderId, status);
      setSales(sales.map(s => s.id === orderId ? { ...s, status: status as any } : s));
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Satışlarım</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} variant="bordered" className="animate-pulse">
              <div className="h-6 bg-[var(--border)] rounded w-1/3 mb-4" />
              <div className="h-20 bg-[var(--border)] rounded" />
            </Card>
          ))}
        </div>
      ) : sales.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
          <p className="text-lg font-medium mb-2">Henüz satışınız yok</p>
          <p className="text-[var(--muted)] mb-4">
            İlanlarınız satıldığında burada görünecektir.
          </p>
          <Link href="/ilan-olustur">
            <Button>İlan Oluştur</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <Card key={sale.id} variant="bordered">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold">#{sale.orderNumber}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {new Date(sale.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <Badge variant={statusVariants[sale.status]}>
                  {orderStatusLabels[sale.status]}
                </Badge>
              </div>

              {/* Buyer Info */}
              <div className="p-3 bg-[var(--background)] rounded-lg mb-4">
                <p className="text-sm text-[var(--muted)]">Alıcı</p>
                <p className="font-medium">{sale.buyer?.displayName || 'Bilinmiyor'}</p>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {sale.items?.map((item) => (
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
                  Toplam: {Number(sale.totalAmount).toLocaleString('tr-TR')} ₺
                </p>
                
                {/* Status Actions */}
                <div className="flex gap-2">
                  {sale.status === 'PAID' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(sale.id, 'SHIPPED')}
                    >
                      <Truck className="w-4 h-4" />
                      Kargoya Ver
                    </Button>
                  )}
                  {sale.status === 'SHIPPED' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(sale.id, 'DELIVERED')}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Teslim Edildi
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
