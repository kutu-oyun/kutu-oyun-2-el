import { Router } from 'express';
import {
  getProductReviews,
  getSellerReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';
import { verifyToken, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/product/:productId', optionalAuth, getProductReviews);
router.get('/seller/:sellerId', optionalAuth, getSellerReviews);

router.post('/', verifyToken, createReview);
router.put('/:id', verifyToken, updateReview);
router.delete('/:id', verifyToken, deleteReview);

export default router;
