import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';
import Iyzipay from 'iyzipay';

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || '',
  secretKey: process.env.IYZICO_SECRET_KEY || '',
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
});

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, card, buyer, shippingAddress, billingAddress } = req.body;

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

    // Prepare basket items
    const basketItems = order.items.map((item, index) => ({
      id: item.id,
      name: item.product.title.substring(0, 50),
      category1: item.product.category.name,
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
      price: Number(item.price).toFixed(2),
    }));

    // Create payment request
    const paymentRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: order.orderNumber,
      price: Number(order.totalAmount).toFixed(2),
      paidPrice: Number(order.totalAmount).toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      installment: '1',
      basketId: order.id,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: {
        cardHolderName: card.holderName,
        cardNumber: card.number.replace(/\s/g, ''),
        expireMonth: card.expireMonth,
        expireYear: card.expireYear,
        cvc: card.cvc,
        registerCard: '0',
      },
      buyer: {
        id: req.user!.uid,
        name: buyer.name,
        surname: buyer.surname,
        gsmNumber: buyer.phone,
        email: buyer.email,
        identityNumber: buyer.identityNumber || '11111111111',
        registrationAddress: shippingAddress.address,
        ip: req.ip || '127.0.0.1',
        city: shippingAddress.city,
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: shippingAddress.contactName,
        city: shippingAddress.city,
        country: 'Turkey',
        address: shippingAddress.address,
      },
      billingAddress: {
        contactName: billingAddress?.contactName || shippingAddress.contactName,
        city: billingAddress?.city || shippingAddress.city,
        country: 'Turkey',
        address: billingAddress?.address || shippingAddress.address,
      },
      basketItems,
    };

    iyzipay.payment.create(paymentRequest, async (err: any, result: any) => {
      if (err) {
        console.error('iyzico error:', err);
        res.status(500).json({ error: 'Payment failed' });
        return;
      }

      if (result.status === 'success') {
        // Update order
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paymentId: result.paymentId,
            paymentStatus: result.status,
          },
        });

        res.json({
          success: true,
          paymentId: result.paymentId,
          message: 'Payment successful',
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.errorMessage || 'Payment failed',
          errorCode: result.errorCode,
        });
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

export const paymentCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    // Verify payment with iyzico
    const retrieveRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: token,
      token,
    };

    iyzipay.checkoutForm.retrieve(retrieveRequest, async (err: any, result: any) => {
      if (err) {
        console.error('iyzico callback error:', err);
        res.status(500).json({ error: 'Callback failed' });
        return;
      }

      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        // Find and update order
        const order = await prisma.order.findFirst({
          where: { orderNumber: result.basketId },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              paymentId: result.paymentId,
              paymentStatus: result.paymentStatus,
            },
          });
        }

        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: result.errorMessage });
      }
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
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
