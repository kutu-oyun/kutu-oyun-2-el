import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';

export const syncUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { uid, email } = req.user!;
    const { displayName, photoURL, phone } = req.body;

    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        email,
        displayName,
        photoURL,
        phone,
        updatedAt: new Date(),
      },
      create: {
        id: uid,
        email,
        displayName,
        photoURL,
        phone,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.uid },
      include: {
        addresses: true,
        _count: {
          select: {
            products: true,
            orders: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { displayName, phone, photoURL } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.uid },
      data: {
        displayName,
        phone,
        photoURL,
        updatedAt: new Date(),
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
