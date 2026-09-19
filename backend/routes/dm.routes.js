import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listConversations,
  openConversation,
  getConversation,
  sendMessage,
  markRead,
} from '../controllers/dmController.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', listConversations);
router.post('/conversations', openConversation);
router.get('/conversations/:id', getConversation);
router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/read', markRead);

export default router;
