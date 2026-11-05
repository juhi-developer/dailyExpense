import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getPool, isMysqlConnected } from '../config/db';
import { mockStorage } from '../services/mockStorage';

export const getAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { period = 'monthly', year, month } = req.query;

    const currentYear = year ? String(year) : new Date().getFullYear().toString();
    const currentMonth = month ? String(month).padStart(2, '0') : (new Date().getMonth() + 1).toString().padStart(2, '0');

    if (isMysqlConnected()) {
      const pool = getPool()!;
      let dateFilter = '';
      const params: any[] = [userId];

      if (period === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        dateFilter = ' AND t.date = ?';
        params.push(today);
      } else if (period === 'weekly') {
        dateFilter = ' AND t.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      } else if (period === 'yearly') {
        dateFilter = ' AND YEAR(t.date) = ?';
        params.push(currentYear);
      } else {
        // default monthly
        dateFilter = ' AND DATE_FORMAT(t.date, "%Y-%m") = ?';
        params.push(`${currentYear}-${currentMonth}`);
      }

      // Summary
      const summaryQuery = `
        SELECT 
          t.type, 
          COALESCE(SUM(t.amount), 0) AS total,
          COUNT(t.id) as count
        FROM transactions t
        WHERE t.user_id = ? ${dateFilter}
        GROUP BY t.type
      `;
      const [sumRows]: any = await pool.query(summaryQuery, params);

      let totalIncome = 0;
      let totalExpense = 0;
      let transactionsCount = 0;

      sumRows.forEach((r: any) => {
        if (r.type === 'income') totalIncome = Number(r.total);
        if (r.type === 'expense') totalExpense = Number(r.total);
        transactionsCount += Number(r.count);
      });

      // Category breakdown (for expenses)
      const catQuery = `
        SELECT 
          c.id AS category_id, c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
          SUM(t.amount) AS total, COUNT(t.id) AS count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? AND t.type = 'expense' ${dateFilter}
        GROUP BY c.id, c.name, c.color, c.icon
        ORDER BY total DESC
      `;
      const [catRows]: any = await pool.query(catQuery, params);

      const breakdown = catRows.map((r: any) => ({
        categoryId: r.category_id,
        categoryName: r.category_name,
        categoryColor: r.category_color,
        categoryIcon: r.category_icon,
        total: Number(r.total),
        count: Number(r.count),
        percentage: totalExpense > 0 ? Math.round((Number(r.total) / totalExpense) * 100) : 0,
      }));

      // Time series data
      let timeSeriesQuery = '';
      let timeParams: any[] = [userId];

      if (period === 'yearly') {
        timeSeriesQuery = `
          SELECT 
            DATE_FORMAT(date, "%b") AS label,
            MONTH(date) as sort_key,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
          FROM transactions
          WHERE user_id = ? AND YEAR(date) = ?
          GROUP BY label, sort_key
          ORDER BY sort_key ASC
        `;
        timeParams.push(currentYear);
      } else if (period === 'weekly') {
        timeSeriesQuery = `
          SELECT 
            DATE_FORMAT(date, "%a") AS label,
            date AS sort_key,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
          FROM transactions
          WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          GROUP BY label, sort_key
          ORDER BY sort_key ASC
        `;
      } else {
        // Monthly breakdown by 5-day intervals or weeks
        timeSeriesQuery = `
          SELECT 
            CONCAT('Wk ', FLOOR((DAY(date) - 1) / 7) + 1) AS label,
            FLOOR((DAY(date) - 1) / 7) AS sort_key,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
          FROM transactions
          WHERE user_id = ? AND DATE_FORMAT(date, "%Y-%m") = ?
          GROUP BY label, sort_key
          ORDER BY sort_key ASC
        `;
        timeParams.push(`${currentYear}-${currentMonth}`);
      }

      const [tsRows]: any = await pool.query(timeSeriesQuery, timeParams);
      const timeSeries = tsRows.map((r: any) => ({
        label: r.label,
        income: Number(r.income),
        expense: Number(r.expense),
      }));

      const balance = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

      res.json({
        success: true,
        data: {
          period,
          totalIncome,
          totalExpense,
          balance,
          savingsRate,
          transactionsCount,
          breakdown,
          timeSeries,
        },
      });
      return;
    }

    // Mock storage fallback
    const targetMonthPrefix = `${currentYear}-${currentMonth}`;
    let txs = mockStorage.transactions.filter(t => t.user_id === userId);

    if (period === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      txs = txs.filter(t => t.date === today);
    } else if (period === 'weekly') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      txs = txs.filter(t => t.date >= sevenDaysAgo);
    } else if (period === 'yearly') {
      txs = txs.filter(t => t.date.startsWith(currentYear));
    } else {
      txs = txs.filter(t => t.date.startsWith(targetMonthPrefix));
    }

    let totalIncome = 0;
    let totalExpense = 0;

    txs.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;
    });

    // Breakdown
    const catMap = new Map<string, { total: number; count: number }>();
    txs
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const prev = catMap.get(t.category_id) || { total: 0, count: 0 };
        catMap.set(t.category_id, { total: prev.total + t.amount, count: prev.count + 1 });
      });

    const breakdown = Array.from(catMap.entries()).map(([catId, val]) => {
      const cat = mockStorage.categories.find(c => c.id === catId);
      return {
        categoryId: catId,
        categoryName: cat?.name || 'Other',
        categoryColor: cat?.color || '#64748B',
        categoryIcon: cat?.icon || 'wallet-outline',
        total: val.total,
        count: val.count,
        percentage: totalExpense > 0 ? Math.round((val.total / totalExpense) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total);

    // Mock Time series
    let timeSeries = [];
    if (period === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      timeSeries = days.map((day, idx) => ({
        label: day,
        income: idx === 1 ? 850 : idx === 4 ? 4500 : 0,
        expense: (idx + 1) * 28 + (idx % 2 === 0 ? 40 : 15),
      }));
    } else if (period === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      timeSeries = months.map((m, idx) => ({
        label: m,
        income: 4200 + (idx % 3) * 600,
        expense: 1800 + (idx % 4) * 350,
      }));
    } else {
      timeSeries = [
        { label: 'Wk 1', income: 4500, expense: 1250 },
        { label: 'Wk 2', income: 850, expense: 420 },
        { label: 'Wk 3', income: 0, expense: 340 },
        { label: 'Wk 4', income: 200, expense: 280 },
      ];
    }

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    res.json({
      success: true,
      data: {
        period,
        totalIncome,
        totalExpense,
        balance,
        savingsRate,
        transactionsCount: txs.length,
        breakdown,
        timeSeries,
      },
    });
  } catch (error: any) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate analytics report.' });
  }
};

