import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      minPrice,
      maxPrice,
      condition,
      language,
      minPlayers,
      maxPlayers,
      location,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
    };

    if (category) {
      where.category = { slug: category as string };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (condition) {
      where.condition = condition as any;
    }

    if (language) {
      where.language = language as any;
    }

    if (minPlayers) {
      where.minPlayers = { lte: parseInt(minPlayers as string) };
    }

    if (maxPlayers) {
      where.maxPlayers = { gte: parseInt(maxPlayers as string) };
    }

    if (location) {
      where.location = { contains: location as string };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder as 'asc' | 'desc';
    } else {
      orderBy.createdAt = sortOrder as 'asc' | 'desc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          images: { take: 1 },
          category: true,
          seller: {
            select: { id: true, displayName: true, photoURL: true },
          },
          _count: { select: { favorites: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        seller: {
          select: {
            id: true,
            displayName: true,
            photoURL: true,
            createdAt: true,
            _count: { select: { products: true } },
          },
        },
        reviews: {
          include: {
            user: { select: { id: true, displayName: true, photoURL: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { favorites: true, reviews: true } },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if user has favorited
    let isFavorited = false;
    if (req.user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_productId: { userId: req.user.uid, productId: id },
        },
      });
      isFavorited = !!favorite;
    }

    res.json({ ...product, isFavorited });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      price,
      condition,
      language,
      minPlayers,
      maxPlayers,
      minAge,
      playTime,
      location,
      categoryId,
      images,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        condition,
        language,
        minPlayers,
        maxPlayers,
        minAge,
        playTime,
        location,
        sellerId: req.user!.uid,
        categoryId,
        images: {
          create: images?.map((url: string, index: number) => ({
            url,
            order: index,
          })) || [],
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (existing.sellerId !== req.user!.uid && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const {
      title,
      description,
      price,
      condition,
      language,
      minPlayers,
      maxPlayers,
      minAge,
      playTime,
      location,
      categoryId,
      status,
      images,
    } = req.body;

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price,
        condition,
        language,
        minPlayers,
        maxPlayers,
        minAge,
        playTime,
        location,
        categoryId,
        status,
      },
      include: {
        images: true,
        category: true,
      },
    });

    // Update images if provided
    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((url: string, index: number) => ({
          productId: id,
          url,
          order: index,
        })),
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (existing.sellerId !== req.user!.uid && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const getUserProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const where: Prisma.ProductWhereInput = { sellerId: userId };
    if (status) {
      where.status = status as any;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { take: 1 },
        category: true,
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({ error: 'Failed to get user products' });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: { take: 1 },
        category: true,
        seller: { select: { id: true, displayName: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { favorites: { _count: 'desc' } },
      take: 12,
    });

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to get featured products' });
  }
};
