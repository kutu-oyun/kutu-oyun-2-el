import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kutu-oyun-super-secret-jwt-key-2024';

// Firebase Admin SDK'yı lazy import et (opsiyonel)
let firebaseAuth: any = null;
const getFirebaseAuth = async () => {
  if (firebaseAuth === null) {
    try {
      const { auth } = await import('../config/firebase.js');
      firebaseAuth = auth;
    } catch {
      firebaseAuth = undefined;
    }
  }
  return firebaseAuth;
};

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role?: string;
    isTestSession?: boolean;
  };
}

// Token tipini belirle
const getTokenType = (token: string): 'jwt' | 'firebase' => {
  try {
    // JWT token'ları decode edilebilir
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded === 'object' && ('userId' in decoded || 'isTestSession' in decoded)) {
      return 'jwt';
    }
  } catch {
    // Ignore
  }
  return 'firebase';
};

// JWT token doğrulama
const verifyJwtToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Test session kontrolü
    if (decoded.isTestSession) {
      const session = await prisma.testSession.findFirst({
        where: {
          token,
          expiresAt: { gt: new Date() },
        },
      });
      
      if (!session) {
        return null;
      }
      
      return {
        uid: decoded.userId,
        email: decoded.email,
        role: decoded.role || session.selectedRole,
        isTestSession: true,
      };
    }
    
    return {
      uid: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isTestSession: false,
    };
  } catch {
    return null;
  }
};

// Firebase token doğrulama
const verifyFirebaseToken = async (token: string) => {
  try {
    const auth = await getFirebaseAuth();
    if (!auth) return null;
    
    const decodedToken = await auth.verifyIdToken(token);
    
    // Veritabanından kullanıcı bilgilerini al
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: decodedToken.uid },
          { email: decodedToken.email },
        ],
      },
      select: { id: true, email: true, role: true },
    });
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: user?.role,
      isTestSession: false,
    };
  } catch {
    return null;
  }
};

// Ana auth middleware
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const tokenType = getTokenType(token);
    
    let userData = null;
    
    if (tokenType === 'jwt') {
      userData = await verifyJwtToken(token);
    } else {
      userData = await verifyFirebaseToken(token);
    }
    
    if (!userData) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    req.user = userData;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Opsiyonel auth (giriş yapmamış kullanıcılar da geçebilir)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const tokenType = getTokenType(token);
      
      let userData = null;
      
      if (tokenType === 'jwt') {
        userData = await verifyJwtToken(token);
      } else {
        userData = await verifyFirebaseToken(token);
      }
      
      if (userData) {
        req.user = userData;
      }
    }
    
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};

// Admin kontrolü
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
};

// Seller veya Admin kontrolü
export const requireSellerOrAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SELLER') {
    res.status(403).json({ error: 'Forbidden: Seller or Admin access required' });
    return;
  }
  next();
};
