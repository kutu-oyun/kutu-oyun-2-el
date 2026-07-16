import { Request, Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';

// PayTR Configuration
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || '';
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || '';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || '';
const PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token';

const hasPaytrConfig = PAYTR_MERCHANT_ID && PAYTR_MERCHANT_KEY && PAYTR_MERCHANT_SALT;

// Generate PayTR token hash
function generatePaytrHash(params: Record<string, string>): string {
  const hashStr = `${params.merchant_id}${params.user_ip}${params.merchant_oid}${params.email}${params.payment_amount}${params.user_basket}${params.no_installment}${params.max_installment}${params.currency}${params.test_mode}${PAYTR_MERCHANT_SALT}`;
  return crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashStr).digest('base64');
}

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!hasPaytrConfig) {
    // Development mode - simulate payment
    console.warn('⚠️ PayTR not configured - simulating payment');
    const { orderId } = req.body;
    
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentId: `DEV-${Date.now()}`,
          paymentStatus: 'SUCCESS',
        },
      });
      
      res.json({
        success: true,
        message: 'Payment simulated (dev mode)',
        paymentId: `DEV-${Date.now()}`,
      });
    } catch (error) {
      res.status(500).json({ error: 'Payment simulation failed' });
    }
    return;
  }

  try {
    const { orderId, buyer } = req.body;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
        buyer: true,
        address: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.buyerId !== req.user!.uid) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    if (order.status !== 'PENDING') {
      res.status(400).json({ error: 'Order already processed' });
      return;
    }

    // Prepare basket items for PayTR
    const basketItems = order.items.map((item) => [
      item.product.title.substring(0, 50),
      (Number(item.price) * 100).toFixed(0), // PayTR uses kuruş
      item.quantity,
    ]);

    const userBasket = Buffer.from(JSON.stringify(basketItems)).toString('base64');
    const paymentAmount = (Number(order.totalAmount) * 100).toFixed(0);

    const params: Record<string, string> = {
      merchant_id: PAYTR_MERCHANT_ID,
      user_ip: req.ip || '127.0.0.1',
      merchant_oid: order.orderNumber,
      email: buyer.email || order.buyer.email,
      payment_amount: paymentAmount,
      user_basket: userBasket,
      no_installment: '0',
      max_installment: '12',
      currency: 'TL',
      test_mode: process.env.NODE_ENV === 'production' ? '0' : '1',
      user_name: buyer.name || order.buyer.displayName || 'Müşteri',
      user_address: order.address.address,
      user_phone: buyer.phone || order.address.phone,
      merchant_ok_url: `${process.env.FRONTEND_URL}/siparis/${orderId}?status=success`,
      merchant_fail_url: `${process.env.FRONTEND_URL}/siparis/${orderId}?status=fail`,
      timeout_limit: '30',
      debug_on: process.env.NODE_ENV === 'production' ? '0' : '1',
      lang: 'tr',
    };

    params.paytr_token = generatePaytrHash(params);

    // Request token from PayTR
    const response = await fetch(PAYTR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });

    const result = await response.json();

    if (result.status === 'success') {
      res.json({
        success: true,
        token: result.token,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${result.token}`,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.reason || 'Payment initialization failed',
      });
    }
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

export const paymentCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      merchant_oid,
      status,
      total_amount,
      hash,
      failed_reason_code,
      failed_reason_msg,
      test_mode,
      payment_type,
    } = req.body;

    // Verify hash
    const hashStr = `${merchant_oid}${PAYTR_MERCHANT_SALT}${status}${total_amount}`;
    const expectedHash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashStr).digest('base64');

    if (hash !== expectedHash) {
      res.status(400).send('PAYTR notification error: Invalid hash');
      return;
    }

    // Find order by orderNumber
    const order = await prisma.order.findFirst({
      where: { orderNumber: merchant_oid },
    });

    if (!order) {
      res.status(404).send('PAYTR notification error: Order not found');
      return;
    }

    if (status === 'success') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentId: merchant_oid,
          paymentStatus: 'SUCCESS',
        },
      });

      // Update product status to SOLD
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        select: { productId: true },
      });

      await prisma.product.updateMany({
        where: {
          id: { in: orderItems.map((item) => item.productId) },
        },
        data: { status: 'SOLD' },
      });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
        },
      });
    }

    // PayTR expects "OK" response
    res.send('OK');
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).send('PAYTR notification error');
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        paymentId: true,
        paymentStatus: true,
        buyerId: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.buyerId !== req.user!.uid && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    res.json({
      orderId: order.id,
      status: order.status,
      paymentId: order.paymentId,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};
