import { Router } from 'express';
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  createConversation,
  markAsRead,
} from '../controllers/message.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getConversationMessages);
router.post('/conversations', createConversation);
router.post('/', sendMessage);
router.put('/read/:conversationId', markAsRead);

export default router;
