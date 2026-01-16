import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';
import { nanoid } from 'nanoid';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6).toUpperCase();
  return `KO-${timestamp}-${random}`;
}

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const where: any = { buyerId: req.user!.uid };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                seller: { select: { id: true, displayName: true } },
              },
            },
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                seller: { select: { id: true, displayName: true, phone: true } },
              },
            },
          },
        },
        address: true,
        buyer: { select: { id: true, displayName: true, email: true } },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Check if user is buyer or seller of any item
    const isBuyer = order.buyerId === req.user!.uid;
    const isSeller = order.items.some(item => item.product.seller.id === req.user!.uid);

    if (!isBuyer && !isSeller && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { addressId, items } = req.body;

    // Validate address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.uid },
    });

    if (!address) {
      res.status(400).json({ error: 'Invalid address' });
      return;
    }

    // Get cart items or use provided items
    let orderItems = items;
    if (!orderItems) {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: req.user!.uid },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        res.status(400).json({ error: 'Cart is empty' });
        return;
      }

      orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));
    }

    // Calculate total
    const totalAmount = orderItems.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerId: req.user!.uid,
        addressId,
        totalAmount,
        items: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
          },
        },
        address: true,
      },
    });

    // Clear cart if using cart items
    if (!items) {
      await prisma.cartItem.deleteMany({
        where: { userId: req.user!.uid },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { sellerId: true } } },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Check authorization
    const isSeller = order.items.some(item => item.product.sellerId === req.user!.uid);
    if (!isSeller && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Update product status if order is delivered
    if (status === 'DELIVERED') {
      await prisma.product.updateMany({
        where: {
          id: { in: order.items.map(item => item.productId) },
        },
        data: { status: 'SOLD' },
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getSales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    // Get orders where user is seller of at least one item
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { sellerId: req.user!.uid },
          },
        },
        ...(status ? { status: status as any } : {}),
      },
      include: {
        items: {
          where: {
            product: { sellerId: req.user!.uid },
          },
          include: {
            product: { include: { images: { take: 1 } } },
          },
        },
        buyer: { select: { id: true, displayName: true, email: true } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to get sales' });
  }
};
