import { Router } from 'express';
import {
  guestCheckout,
  trackOrder,
  getOrdersByEmail,
} from '../controllers/guest.controller.js';

const router = Router();

// Misafir checkout
router.post('/checkout', guestCheckout);

// Sipariş takip
router.get('/order/:orderNumber', trackOrder);

// Email ile siparişleri listele
router.get('/orders', getOrdersByEmail);

export default router;
