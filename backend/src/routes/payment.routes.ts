import { Router } from 'express';
import { createPayment, paymentCallback, getPaymentStatus } from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// PayTR ödeme başlatma
router.post('/create', verifyToken, createPayment);

// PayTR callback (public - PayTR'dan gelir)
router.post('/callback', paymentCallback);

// Ödeme durumu sorgula
router.get('/status/:orderId', verifyToken, getPaymentStatus);

export default router;
