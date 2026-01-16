import { Router } from 'express';
import { getSignedUrl } from '../controllers/upload.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signed-url', verifyToken, getSignedUrl);

export default router;
