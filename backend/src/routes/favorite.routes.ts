import { Router } from 'express';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
} from '../controllers/favorite.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getFavorites);
router.get('/check/:productId', checkFavorite);
router.post('/:productId', addToFavorites);
router.delete('/:productId', removeFromFavorites);

export default router;
