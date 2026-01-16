import { Router } from 'express';
import {
  createPayment,
  paymentCallback,
  getPaymentStatus,
} from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', verifyToken, createPayment);
router.post('/callback', paymentCallback); // iyzico webhook - no auth
router.get('/status/:orderId', verifyToken, getPaymentStatus);

export default router;
