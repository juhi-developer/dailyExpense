import { Router } from 'express';
import { getBudgets, setBudget, deleteBudget, getBudgetProgress } from '../controllers/budgetController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getBudgets);
router.get('/progress', getBudgetProgress);
router.post('/', setBudget);
router.delete('/:id', deleteBudget);

export default router;

