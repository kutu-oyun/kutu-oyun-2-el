import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getFeaturedProducts,
} from '../controllers/product.controller.js';
import { verifyToken, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', optionalAuth, getProductById);
router.get('/user/:userId', getUserProducts);

// Protected routes
router.post('/', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

export default router;
