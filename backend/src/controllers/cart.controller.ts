import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.uid },
      include: {
        product: {
          include: {
            images: { take: 1 },
            seller: { select: { id: true, displayName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    res.json({ items: cartItems, total });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true, sellerId: true },
    });

    if (!product || product.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Product not available' });
      return;
    }

    // Can't add own product to cart
    if (product.sellerId === req.user!.uid) {
      res.status(400).json({ error: 'Cannot add your own product to cart' });
      return;
    }

    // Check if already in cart
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId: req.user!.uid, productId },
      },
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: {
          product: { include: { images: { take: 1 } } },
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user!.uid,
          productId,
          quantity,
        },
        include: {
          product: { include: { images: { take: 1 } } },
        },
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const existing = await prisma.cartItem.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== req.user!.uid) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      res.json({ message: 'Item removed from cart' });
      return;
    }

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: { include: { images: { take: 1 } } },
      },
    });

    res.json(cartItem);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.cartItem.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== req.user!.uid) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user!.uid },
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
