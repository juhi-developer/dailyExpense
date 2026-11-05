import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getPool, isMysqlConnected } from '../config/db';
import { mockStorage, BudgetRecord } from '../services/mockStorage';

export const getBudgets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { month } = req.query;
    const targetMonth = String(month || new Date().toISOString().substring(0, 7));

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const query = `
        SELECT 
          b.id, b.user_id, b.category_id, b.month, b.limit_amount,
          c.name AS category_name, c.icon AS category_icon, c.color AS category_color
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.user_id = ? AND b.month = ?
      `;
      const [rows]: any = await pool.query(query, [userId, targetMonth]);
      const budgets = rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        categoryId: r.category_id,
        categoryName: r.category_name || 'Overall Monthly Budget',
        categoryIcon: r.category_icon || 'wallet-outline',
        categoryColor: r.category_color || '#4F46E5',
        month: r.month,
        limitAmount: Number(r.limit_amount),
      }));

      res.json({ success: true, budgets });
      return;
    }

    const list = mockStorage.budgets.filter(b => b.user_id === userId && b.month === targetMonth);
    const budgets = list.map(b => {
      const cat = b.category_id ? mockStorage.categories.find(c => c.id === b.category_id) : null;
      return {
        id: b.id,
        userId: b.user_id,
        categoryId: b.category_id,
        categoryName: cat ? cat.name : 'Overall Monthly Budget',
        categoryIcon: cat ? cat.icon : 'wallet-outline',
        categoryColor: cat ? cat.color : '#4F46E5',
        month: b.month,
        limitAmount: b.limit_amount,
      };
    });

    res.json({ success: true, budgets });
  } catch (error: any) {
    console.error('getBudgets error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve budgets.' });
  }
};

export const setBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { categoryId, month, limitAmount } = req.body;

    if (!month || limitAmount === undefined) {
      res.status(400).json({ success: false, message: 'Month (YYYY-MM) and limitAmount are required.' });
      return;
    }

    const numLimit = Math.abs(Number(limitAmount));
    if (isNaN(numLimit) || numLimit <= 0) {
      res.status(400).json({ success: false, message: 'Limit amount must be greater than 0.' });
      return;
    }

    const catId = categoryId || null;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const budgetId = uuidv4();

      await pool.query(
        `INSERT INTO budgets (id, user_id, category_id, month, limit_amount)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount), updated_at = CURRENT_TIMESTAMP`,
        [budgetId, userId, catId, month, numLimit]
      );

      res.json({ success: true, message: 'Budget set successfully.' });
      return;
    }

    // Mock storage fallback
    const existingIndex = mockStorage.budgets.findIndex(
      b => b.user_id === userId && b.month === month && b.category_id === catId
    );

    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      mockStorage.budgets[existingIndex].limit_amount = numLimit;
      mockStorage.budgets[existingIndex].updated_at = now;
    } else {
      mockStorage.budgets.push({
        id: uuidv4(),
        user_id: userId,
        category_id: catId,
        month,
        limit_amount: numLimit,
        created_at: now,
        updated_at: now,
      });
    }

    res.json({ success: true, message: 'Budget set successfully.' });
  } catch (error: any) {
    console.error('setBudget error:', error);
    res.status(500).json({ success: false, message: 'Failed to save budget.' });
  }
};

export const deleteBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      await pool.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
      res.json({ success: true, message: 'Budget removed successfully.' });
      return;
    }

    const index = mockStorage.budgets.findIndex(b => b.id === id && b.user_id === userId);
    if (index >= 0) {
      mockStorage.budgets.splice(index, 1);
    }
    res.json({ success: true, message: 'Budget removed successfully.' });
  } catch (error: any) {
    console.error('deleteBudget error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete budget.' });
  }
};

export const getBudgetProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { month } = req.query;
    const targetMonth = String(month || new Date().toISOString().substring(0, 7));

    if (isMysqlConnected()) {
      const pool = getPool()!;
      // Get all budgets for user in this month
      const [budgets]: any = await pool.query(
        `SELECT b.id, b.category_id, b.limit_amount,
                c.name AS category_name, c.icon AS category_icon, c.color AS category_color
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.user_id = ? AND b.month = ?`,
        [userId, targetMonth]
      );

      // Get total expenses spent per category for this month
      const [spentByCategory]: any = await pool.query(
        `SELECT category_id, SUM(amount) AS total_spent
         FROM transactions
         WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(date, "%Y-%m") = ?
         GROUP BY category_id`,
        [userId, targetMonth]
      );

      // Total overall expenses for the month
      const [overallSpentRows]: any = await pool.query(
        `SELECT SUM(amount) AS total_spent
         FROM transactions
         WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(date, "%Y-%m") = ?`,
        [userId, targetMonth]
      );
      const totalMonthExpense = Number(overallSpentRows[0]?.total_spent || 0);

      const spentMap = new Map<string, number>();
      spentByCategory.forEach((row: any) => {
        spentMap.set(row.category_id, Number(row.total_spent));
      });

      const progress = budgets.map((b: any) => {
        const spent = b.category_id ? spentMap.get(b.category_id) || 0 : totalMonthExpense;
        const limit = Number(b.limit_amount);
        const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        return {
          id: b.id,
          categoryId: b.category_id,
          categoryName: b.category_name || 'Overall Monthly Budget',
          categoryIcon: b.category_icon || 'wallet-outline',
          categoryColor: b.category_color || '#4F46E5',
          limitAmount: limit,
          spentAmount: spent,
          remainingAmount: Math.max(0, limit - spent),
          percentage,
          isWarning: percentage >= 80 && percentage < 100,
          isOverBudget: percentage >= 100,
        };
      });

      res.json({ success: true, month: targetMonth, progress });
      return;
    }

    // Mock storage fallback
    const userBudgets = mockStorage.budgets.filter(b => b.user_id === userId && b.month === targetMonth);
    const monthExpenses = mockStorage.transactions.filter(
      t => t.user_id === userId && t.type === 'expense' && t.date.startsWith(targetMonth)
    );

    const totalMonthExpense = monthExpenses.reduce((acc, t) => acc + t.amount, 0);

    const progress = userBudgets.map(b => {
      let spent = 0;
      let name = 'Overall Monthly Budget';
      let icon = 'wallet-outline';
      let color = '#4F46E5';

      if (b.category_id) {
        const cat = mockStorage.categories.find(c => c.id === b.category_id);
        if (cat) {
          name = cat.name;
          icon = cat.icon;
          color = cat.color;
        }
        spent = monthExpenses.filter(t => t.category_id === b.category_id).reduce((acc, t) => acc + t.amount, 0);
      } else {
        spent = totalMonthExpense;
      }

      const limit = b.limit_amount;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

      return {
        id: b.id,
        categoryId: b.category_id,
        categoryName: name,
        categoryIcon: icon,
        categoryColor: color,
        limitAmount: limit,
        spentAmount: spent,
        remainingAmount: Math.max(0, limit - spent),
        percentage,
        isWarning: percentage >= 80 && percentage < 100,
        isOverBudget: percentage >= 100,
      };
    });

    res.json({ success: true, month: targetMonth, progress });
  } catch (error: any) {
    console.error('getBudgetProgress error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute budget progress.' });
  }
};

