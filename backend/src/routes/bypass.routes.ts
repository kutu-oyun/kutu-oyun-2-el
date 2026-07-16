import { Router } from 'express';
import {
  bypassLogin,
  selectUser,
  getAllUsers,
  quickLogin,
  verifySession,
  logout,
} from '../controllers/bypass.controller.js';

const router = Router();

// Admin bypass login
router.post('/login', bypassLogin);

// Kullanıcı seçimi (bypass ile)
router.post('/select-user', selectUser);

// Tüm kullanıcıları listele (test hesapları sayfası)
router.get('/users', getAllUsers);

// Hızlı giriş (tek tık)
router.post('/quick-login', quickLogin);

// Session doğrulama
router.get('/verify', verifySession);

// Çıkış
router.post('/logout', logout);

export default router;
