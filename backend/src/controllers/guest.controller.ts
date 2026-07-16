import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { nanoid } from 'nanoid';

// Misafir checkout
export const guestCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      phone,
      contactName,
      city,
      district,
      neighborhood,
      address,
      zipCode,
      items, // [{ productId, quantity }]
      note,
    } = req.body;

    // Validasyon
    if (!email || !phone || !contactName || !city || !district || !address || !items?.length) {
      res.status(400).json({ error: 'Tüm zorunlu alanları doldurun' });
      return;
    }

    // Ürünleri ve fiyatları al
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE',
      },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({ error: 'Bazı ürünler bulunamadı veya artık mevcut değil' });
      return;
    }

    // Toplam tutarı hesapla
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error('Product not found');
      
      const price = Number(product.price);
      totalAmount += price * item.quantity;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
      };
    });

    // Sipariş numarası oluştur
    const orderNumber = `G-${nanoid(10).toUpperCase()}`;

    // Misafir siparişi oluştur
    const guestOrder = await prisma.guestOrder.create({
      data: {
        orderNumber,
        email,
        phone,
        contactName,
        city,
        district,
        neighborhood,
        address,
        zipCode,
        totalAmount,
        note,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: { take: 1, select: { url: true } },
              },
            },
          },
        },
      },
    });

    // Ürünleri satıldı olarak işaretle
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { status: 'SOLD' },
    });

    res.status(201).json({
      success: true,
      order: guestOrder,
      message: 'Siparişiniz başarıyla oluşturuldu',
    });
  } catch (error) {
    console.error('Guest checkout error:', error);
    res.status(500).json({ error: 'Sipariş oluşturulamadı' });
  }
};

// Sipariş takip (orderNumber ile)
export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      res.status(400).json({ error: 'Sipariş numarası gerekli' });
      return;
    }

    const order = await prisma.guestOrder.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: { take: 1, select: { url: true } },
                seller: {
                  select: {
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Sipariş bilgileri alınamadı' });
  }
};

// Email ile siparişleri listele
export const getOrdersByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query;

    if (!email) {
      res.status(400).json({ error: 'Email gerekli' });
      return;
    }

    const orders = await prisma.guestOrder.findMany({
      where: { email: String(email) },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: { take: 1, select: { url: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders by email error:', error);
    res.status(500).json({ error: 'Siparişler alınamadı' });
  }
};
