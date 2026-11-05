import { Router } from 'express';
import { exportBackup, restoreBackup } from '../controllers/backupController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/export', exportBackup);
router.post('/restore', restoreBackup);

export default router;

