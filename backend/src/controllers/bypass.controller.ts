import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'kutu-oyun-super-secret-jwt-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Bypass login - Admin/geliştirici girişi
export const bypassLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
      return;
    }

    // AdminBypass tablosunda kontrol
    const bypassAccount = await prisma.adminBypass.findUnique({
      where: { username },
    });

    if (!bypassAccount || !bypassAccount.isActive) {
      res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
      return;
    }

    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(password, bypassAccount.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
      return;
    }

    // Tüm kullanıcıları listele (modal için)
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        photoURL: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { displayName: 'asc' },
      ],
    });

    // Bypass token oluştur (kısa süreli - sadece kullanıcı seçimi için)
    const bypassToken = jwt.sign(
      { bypassId: bypassAccount.id, username: bypassAccount.username },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      bypassToken,
      users,
    });
  } catch (error) {
    console.error('Bypass login error:', error);
    res.status(500).json({ error: 'Giriş işlemi başarısız' });
  }
};

// Kullanıcı olarak giriş yap (bypass ile)
export const selectUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bypassToken, userId, selectedRole } = req.body;

    if (!bypassToken || !userId) {
      res.status(400).json({ error: 'Bypass token ve kullanıcı ID gerekli' });
      return;
    }

    // Bypass token'ı doğrula
    let decoded: any;
    try {
      decoded = jwt.verify(bypassToken, JWT_SECRET);
    } catch {
      res.status(401).json({ error: 'Geçersiz veya süresi dolmuş bypass token' });
      return;
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }

    // Seçilen rol (eğer admin ise istediği rolü seçebilir)
    const role: Role = selectedRole || user.role;

    // Test session oluştur
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const sessionToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role,
        isTestSession: true,
        bypassId: decoded.bypassId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Eski session'ları temizle
    await prisma.testSession.deleteMany({
      where: { userId: user.id },
    });

    // Yeni session kaydet
    await prisma.testSession.create({
      data: {
        token: sessionToken,
        userId: user.id,
        selectedRole: role,
        expiresAt,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'BYPASS_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({
          bypassUsername: decoded.username,
          selectedRole: role,
        }),
      },
    });

    res.json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role,
        isTestSession: true,
      },
    });
  } catch (error) {
    console.error('Select user error:', error);
    res.status(500).json({ error: 'Kullanıcı seçimi başarısız' });
  }
};

// Tüm kullanıcıları listele (test hesapları sayfası için)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { isActive: true };
    
    if (role && role !== 'ALL') {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { displayName: { contains: String(search) } },
        { email: { contains: String(search) } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          photoURL: true,
          phone: true,
          authProvider: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' },
          { displayName: 'asc' },
        ],
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    // Rol sayıları
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: true,
    });

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      roleCounts: roleCounts.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Kullanıcılar alınamadı' });
  }
};

// Hızlı giriş (tek tık ile - test hesapları sayfası için)
export const quickLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, selectedRole } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'Kullanıcı ID gerekli' });
      return;
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }

    const role: Role = selectedRole || user.role;

    // Test session oluştur
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const sessionToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role,
        isTestSession: true,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Eski session'ları temizle
    await prisma.testSession.deleteMany({
      where: { userId: user.id },
    });

    // Yeni session kaydet
    await prisma.testSession.create({
      data: {
        token: sessionToken,
        userId: user.id,
        selectedRole: role,
        expiresAt,
      },
    });

    res.json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role,
        isTestSession: true,
      },
    });
  } catch (error) {
    console.error('Quick login error:', error);
    res.status(500).json({ error: 'Hızlı giriş başarısız' });
  }
};

// Session'ı doğrula ve kullanıcı bilgilerini döndür
export const verifySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token bulunamadı' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Token'ı doğrula
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
      return;
    }

    // Test session'ı kontrol et
    const session = await prisma.testSession.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            photoURL: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      res.status(401).json({ error: 'Geçersiz session' });
      return;
    }

    res.json({
      success: true,
      user: {
        ...session.user,
        role: session.selectedRole, // Seçilen rol
        isTestSession: true,
      },
    });
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({ error: 'Session doğrulaması başarısız' });
  }
};

// Çıkış yap
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      
      // Session'ı sil
      await prisma.testSession.deleteMany({
        where: { token },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Çıkış işlemi başarısız' });
  }
};
