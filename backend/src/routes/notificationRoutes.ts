import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  getNotificationSettings,
  updateNotificationSettings,
} from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.post('/mark-read', markAsRead);
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);

export default router;

