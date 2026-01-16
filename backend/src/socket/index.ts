import { Server, Socket } from 'socket.io';
import { auth } from '../config/firebase.js';
import prisma from '../config/prisma.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const initializeSocket = (io: Server): void => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decodedToken = await auth.verifyIdToken(token);
      socket.userId = decodedToken.uid;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join conversation room
    socket.on('join:conversation', async (conversationId: string) => {
      try {
        // Verify user is part of conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { buyerId: true, sellerId: true },
        });

        if (
          conversation &&
          (conversation.buyerId === socket.userId || conversation.sellerId === socket.userId)
        ) {
          socket.join(`conversation:${conversationId}`);
          console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        }
      } catch (error) {
        console.error('Join conversation error:', error);
      }
    });

    // Leave conversation room
    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send message
    socket.on('message:send', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { buyerId: true, sellerId: true },
        });

        if (
          !conversation ||
          (conversation.buyerId !== socket.userId && conversation.sellerId !== socket.userId)
        ) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: socket.userId!,
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

        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit('message:new', message);

        // Notify the other user
        const recipientId =
          conversation.buyerId === socket.userId ? conversation.sellerId : conversation.buyerId;
        io.to(`user:${recipientId}`).emit('notification:message', {
          conversationId,
          message,
        });
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId: socket.userId,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId: socket.userId,
      });
    });

    // Mark messages as read
    socket.on('messages:read', async (conversationId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: socket.userId },
            isRead: false,
          },
          data: { isRead: true },
        });

        socket.to(`conversation:${conversationId}`).emit('messages:read', {
          conversationId,
          readBy: socket.userId,
        });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
