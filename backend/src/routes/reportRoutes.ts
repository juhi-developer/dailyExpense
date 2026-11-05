import { Router } from 'express';
import { getAnalytics } from '../controllers/reportController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/analytics', getAnalytics);

export default router;

