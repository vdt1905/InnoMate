import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getNotifications, markAllRead } from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.post('/read', markAllRead);

export default router;
