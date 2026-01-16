import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: req.user!.uid },
          { sellerId: req.user!.uid },
        ],
      },
      include: {
        buyer: { select: { id: true, displayName: true, photoURL: true } },
        seller: { select: { id: true, displayName: true, photoURL: true } },
        product: {
          select: { id: true, title: true, images: { take: 1 } },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: req.user!.uid },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

export const getConversationMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    if (conversation.buyerId !== req.user!.uid && conversation.sellerId !== req.user!.uid) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: { select: { id: true, displayName: true, photoURL: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: req.user!.uid },
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, message } = req.body;

    // Get product info
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Can't message yourself
    if (product.sellerId === req.user!.uid) {
      res.status(400).json({ error: 'Cannot message yourself' });
      return;
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        productId,
        buyerId: req.user!.uid,
        sellerId: product.sellerId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          productId,
          buyerId: req.user!.uid,
          sellerId: product.sellerId,
        },
      });
    }

    // Create initial message if provided
    if (message) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: req.user!.uid,
          content: message,
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    const fullConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        buyer: { select: { id: true, displayName: true, photoURL: true } },
        seller: { select: { id: true, displayName: true, photoURL: true } },
        product: { select: { id: true, title: true, images: { take: 1 } } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    res.status(201).json(fullConversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId, content } = req.body;

    // Check if user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    if (conversation.buyerId !== req.user!.uid && conversation.sellerId !== req.user!.uid) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: req.user!.uid,
        content,
      },
      include: {
        sender: { select: { id: true, displayName: true, photoURL: true } },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    // Check if user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    if (conversation.buyerId !== req.user!.uid && conversation.sellerId !== req.user!.uid) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: req.user!.uid },
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};
