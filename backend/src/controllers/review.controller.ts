import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { id: true, displayName: true, photoURL: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    res.json({
      reviews,
      averageRating: avgRating._avg.rating || 0,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

export const getSellerReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sellerId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        product: { sellerId },
      },
      include: {
        user: { select: { id: true, displayName: true, photoURL: true } },
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { product: { sellerId } },
      _avg: { rating: true },
    });

    const totalReviews = await prisma.review.count({
      where: { product: { sellerId } },
    });

    res.json({
      reviews,
      averageRating: avgRating._avg.rating || 0,
      totalReviews,
    });
  } catch (error) {
    console.error('Get seller reviews error:', error);
    res.status(500).json({ error: 'Failed to get seller reviews' });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Can't review own product
    if (product.sellerId === req.user!.uid) {
      res.status(400).json({ error: 'Cannot review your own product' });
      return;
    }

    // Check if already reviewed
    const existing = await prisma.review.findFirst({
      where: {
        userId: req.user!.uid,
        productId,
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Already reviewed this product' });
      return;
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          buyerId: req.user!.uid,
          status: 'DELIVERED',
        },
      },
    });

    if (!hasPurchased) {
      res.status(400).json({ error: 'You can only review products you have purchased' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.uid,
        productId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, displayName: true, photoURL: true } },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const existing = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== req.user!.uid) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    const review = await prisma.review.update({
      where: { id },
      data: { rating, comment },
      include: {
        user: { select: { id: true, displayName: true, photoURL: true } },
      },
    });

    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (existing.userId !== req.user!.uid && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
