import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.uid },
      include: {
        product: {
          include: {
            images: { take: 1 },
            category: true,
            seller: { select: { id: true, displayName: true } },
            _count: { select: { favorites: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(favorites.map(f => f.product));
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
};

export const addToFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId: req.user!.uid, productId },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Already in favorites' });
      return;
    }

    await prisma.favorite.create({
      data: {
        userId: req.user!.uid,
        productId,
      },
    });

    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
};

export const removeFromFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    await prisma.favorite.delete({
      where: {
        userId_productId: { userId: req.user!.uid, productId },
      },
    });

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId: req.user!.uid, productId },
      },
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
};
