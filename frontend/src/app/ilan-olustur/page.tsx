'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Plus, ArrowRight } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Category } from '@/types';
import { conditionLabels, languageLabels } from '@/types';

const mockCategories: Category[] = [
  { id: '1', name: 'Strateji Oyunları', slug: 'strateji' },
  { id: '2', name: 'Aile Oyunları', slug: 'aile' },
  { id: '3', name: 'Parti Oyunları', slug: 'parti' },
  { id: '4', name: 'Kart Oyunları', slug: 'kart' },
  { id: '5', name: 'Çocuk Oyunları', slug: 'cocuk' },
  { id: '6', name: 'Kooperatif Oyunları', slug: 'kooperatif' },
];

export default function CreateListingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useRequireAuth();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    condition: '',
    language: '',
    minPlayers: '',
    maxPlayers: '',
    minAge: '',
    playTime: '',
    location: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.list() as Category[];
        setCategories(data);
      } catch (error) {
        console.log('Using mock categories');
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For demo, we'll use placeholder images
    // In production, you'd upload to Cloud Storage here
    const newImages = Array.from(files).map((file, i) => 
      `https://images.unsplash.com/photo-${1632501641765 + i}-e568d28b0015?w=800`
    );
    setImages([...images, ...newImages].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (images.length === 0) {
      setError('En az bir fotoğraf yükleyin');
      return;
    }

    if (!formData.categoryId) {
      setError('Kategori seçin');
      return;
    }

    if (!formData.condition) {
      setError('Ürün durumu seçin');
      return;
    }

    if (!formData.language) {
      setError('Oyun dili seçin');
      return;
    }

    setIsLoading(true);
    try {
      const product = await api.products.create({
        ...formData,
        price: parseFloat(formData.price),
        minPlayers: formData.minPlayers ? parseInt(formData.minPlayers) : undefined,
        maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : undefined,
        minAge: formData.minAge ? parseInt(formData.minAge) : undefined,
        playTime: formData.playTime ? parseInt(formData.playTime) : undefined,
        images,
      });
      
      router.push(`/urun/${(product as any).id}`);
    } catch (err: any) {
      setError(err.message || 'İlan oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Yeni İlan Oluştur</h1>

      {error && (
        <div className="mb-6 p-4 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <Card variant="bordered">
          <h2 className="font-semibold mb-4">Fotoğraflar</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            En az 1, en fazla 5 fotoğraf yükleyebilirsiniz. İlk fotoğraf kapak fotoğrafı olacaktır.
          </p>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image}
                  alt={`Ürün ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--error)] text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                    Kapak
                  </span>
                )}
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-[var(--border)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-colors">
                <Upload className="w-8 h-8 text-[var(--muted)]" />
                <span className="text-xs text-[var(--muted)] mt-2">Ekle</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </Card>

        {/* Basic Info */}
        <Card variant="bordered">
          <h2 className="font-semibold mb-4">Temel Bilgiler</h2>
          <div className="space-y-4">
            <Input
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Örn: Catan - Türkçe, Az Kullanılmış"
              required
            />
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ürünün durumunu, eksik parçaları, kargo bilgilerini yazın..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Fiyat (₺)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                min="0"
                required
              />
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Kategori</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  required
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Product Details */}
        <Card variant="bordered">
          <h2 className="font-semibold mb-4">Ürün Detayları</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Durum</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                required
              >
                <option value="">Durum Seçin</option>
                {Object.entries(conditionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Dil</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                required
              >
                <option value="">Dil Seçin</option>
                {Object.entries(languageLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Min Oyuncu Sayısı"
              type="number"
              value={formData.minPlayers}
              onChange={(e) => setFormData({ ...formData, minPlayers: e.target.value })}
              placeholder="2"
              min="1"
            />

            <Input
              label="Maks Oyuncu Sayısı"
              type="number"
              value={formData.maxPlayers}
              onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
              placeholder="4"
              min="1"
            />

            <Input
              label="Min Yaş"
              type="number"
              value={formData.minAge}
              onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
              placeholder="10"
              min="1"
            />

            <Input
              label="Oyun Süresi (dakika)"
              type="number"
              value={formData.playTime}
              onChange={(e) => setFormData({ ...formData, playTime: e.target.value })}
              placeholder="60"
              min="1"
            />
          </div>
        </Card>

        {/* Location */}
        <Card variant="bordered">
          <h2 className="font-semibold mb-4">Konum</h2>
          <Input
            label="Konum"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Örn: İstanbul, Kadıköy"
          />
        </Card>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          İlanı Yayınla
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
