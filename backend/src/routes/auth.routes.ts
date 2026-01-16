import { Router } from 'express';
import { syncUser, getCurrentUser, updateProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Sync Firebase user to MySQL
router.post('/sync', verifyToken, syncUser);

// Get current user info
router.get('/me', verifyToken, getCurrentUser);

// Update profile
router.put('/profile', verifyToken, updateProfile);

export default router;
