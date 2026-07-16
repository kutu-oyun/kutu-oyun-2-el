'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/atoms/auth';
import api from '@/lib/api';
import { Button, Card } from '@/components/ui';

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAtomValue(userAtom);
  
  const orderId = params.orderId as string;
  const status = searchParams.get('status');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<{
    token?: string;
    iframeUrl?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/giris');
      return;
    }

    if (status === 'success') {
      setLoading(false);
      return;
    }

    if (status === 'fail') {
      setError('Ödeme işlemi başarısız oldu.');
      setLoading(false);
      return;
    }

    // Ödeme tokenı al
    const initiatePayment = async () => {
      try {
        const { data } = await api.post('/payment/create', {
          orderId,
          buyer: {
            name: user.displayName,
            email: user.email,
            phone: user.phone,
          },
        });
        
        if (data.success) {
          setPaymentData(data);
        } else {
          setError(data.error || 'Ödeme başlatılamadı.');
        }
      } catch (err: unknown) {
        console.error('Payment error:', err);
        setError('Ödeme sistemi ile bağlantı kurulamadı.');
      } finally {
        setLoading(false);
      }
    };

    initiatePayment();
  }, [orderId, user, router, status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Ödeme sayfası yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <Card className="max-w-md w-full text-center p-8 bg-zinc-900 border-zinc-800">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Ödeme Başarılı!</h1>
          <p className="text-zinc-400 mb-6">
            Siparişiniz başarıyla oluşturuldu. Satıcı en kısa sürede kargolayacak.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/panel/siparislerim')}
              className="flex-1"
            >
              Siparişlerim
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Ana Sayfa
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <Card className="max-w-md w-full text-center p-8 bg-zinc-900 border-zinc-800">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Ödeme Başarısız</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Tekrar Dene
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/sepet')}
              className="flex-1"
            >
              Sepete Dön
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Güvenli Ödeme
        </h1>
        
        {paymentData?.iframeUrl ? (
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <iframe
              src={paymentData.iframeUrl}
              className="w-full h-[600px] rounded-lg"
              frameBorder="0"
              title="PayTR Ödeme"
            />
          </div>
        ) : (
          <Card className="p-8 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-zinc-400 mb-4">
              Test modunda çalışıyorsunuz. Gerçek ödeme için PayTR yapılandırması gerekli.
            </p>
            <Button
              onClick={async () => {
                try {
                  // Development mode - simulate successful payment
                  router.push(`/odeme/${orderId}?status=success`);
                } catch (err) {
                  setError('Bir hata oluştu.');
                }
              }}
            >
              Test Ödemesi Tamamla
            </Button>
          </Card>
        )}
        
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL Güvenlik
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            PCI DSS Uyumlu
          </div>
        </div>
      </div>
    </div>
  );
}
