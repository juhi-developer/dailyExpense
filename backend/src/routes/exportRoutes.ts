import { Router } from 'express';
import { exportTransactionsCsv } from '../controllers/exportController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/csv', exportTransactionsCsv);

export default router;

