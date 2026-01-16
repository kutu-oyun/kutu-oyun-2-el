'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Product } from '@/types';
import { conditionLabels } from '@/types';

const statusLabels = {
  ACTIVE: { label: 'Aktif', variant: 'success' as const },
  SOLD: { label: 'Satıldı', variant: 'secondary' as const },
  INACTIVE: { label: 'Pasif', variant: 'default' as const },
  PENDING: { label: 'Beklemede', variant: 'warning' as const },
};

export default function MyListingsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await api.products.userProducts(user.id) as Product[];
        setProducts(data);
      } catch (error) {
        console.error('Fetch products error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const filteredProducts = filter
    ? products.filter((p) => p.status === filter)
    : products;

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;

    try {
      await api.products.delete(productId);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.products.update(product.id, { status: newStatus });
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, status: newStatus as any } : p
        )
      );
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">İlanlarım</h1>
        <Link href="/ilan-olustur">
          <Button>
            <Plus className="w-4 h-4" />
            Yeni İlan
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === '' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('')}
        >
          Tümü ({products.length})
        </Button>
        <Button
          variant={filter === 'ACTIVE' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('ACTIVE')}
        >
          Aktif ({products.filter((p) => p.status === 'ACTIVE').length})
        </Button>
        <Button
          variant={filter === 'SOLD' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('SOLD')}
        >
          Satıldı ({products.filter((p) => p.status === 'SOLD').length})
        </Button>
        <Button
          variant={filter === 'INACTIVE' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('INACTIVE')}
        >
          Pasif ({products.filter((p) => p.status === 'INACTIVE').length})
        </Button>
      </div>

      {/* Products List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} variant="bordered" className="animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-[var(--border)] rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-[var(--border)] rounded w-3/4" />
                  <div className="h-4 bg-[var(--border)] rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <p className="text-lg font-medium mb-2">Henüz ilanınız yok</p>
          <p className="text-[var(--muted)] mb-4">
            İlk ilanınızı oluşturarak satışa başlayın!
          </p>
          <Link href="/ilan-olustur">
            <Button>
              <Plus className="w-4 h-4" />
              İlan Oluştur
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} variant="bordered">
              <div className="flex gap-4">
                {/* Image */}
                <Link href={`/urun/${product.id}`} className="shrink-0">
                  <img
                    src={product.images?.[0]?.url || '/placeholder-game.png'}
                    alt={product.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/urun/${product.id}`}>
                        <h3 className="font-semibold hover:text-[var(--primary)] transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-[var(--muted)]">
                        {conditionLabels[product.condition]} • {product.category?.name}
                      </p>
                    </div>
                    <Badge variant={statusLabels[product.status].variant}>
                      {statusLabels[product.status].label}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-[var(--primary)] mt-2">
                    {Number(product.price).toLocaleString('tr-TR')} ₺
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Link href={`/ilan-duzenle/${product.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                        Düzenle
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(product)}
                    >
                      {product.status === 'ACTIVE' ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Pasife Al
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Aktifleştir
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-[var(--error)] hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
