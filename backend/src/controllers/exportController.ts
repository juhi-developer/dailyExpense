import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getPool, isMysqlConnected } from '../config/db';
import { mockStorage } from '../services/mockStorage';

export const exportTransactionsCsv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, type } = req.query;

    let transactions: any[] = [];

    if (isMysqlConnected()) {
      const pool = getPool()!;
      let query = `
        SELECT 
          t.date, t.type, c.name as category, t.amount, t.payment_method, t.note
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
      `;
      const params: any[] = [userId];

      if (type && (type === 'income' || type === 'expense')) {
        query += ' AND t.type = ?';
        params.push(type);
      }
      if (startDate) {
        query += ' AND t.date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND t.date <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY t.date DESC';
      const [rows]: any = await pool.query(query, params);
      transactions = rows.map((r: any) => ({
        date: typeof r.date === 'string' ? r.date.split('T')[0] : r.date.toISOString().split('T')[0],
        type: r.type,
        category: r.category,
        amount: Number(r.amount),
        paymentMethod: r.payment_method,
        note: r.note || '',
      }));
    } else {
      let list = mockStorage.transactions.filter(t => t.user_id === userId);
      if (type && (type === 'income' || type === 'expense')) {
        list = list.filter(t => t.type === type);
      }
      if (startDate) {
        list = list.filter(t => t.date >= String(startDate));
      }
      if (endDate) {
        list = list.filter(t => t.date <= String(endDate));
      }
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      transactions = list.map(t => {
        const cat = mockStorage.categories.find(c => c.id === t.category_id);
        return {
          date: t.date,
          type: t.type,
          category: cat?.name || 'General',
          amount: t.amount,
          paymentMethod: t.payment_method,
          note: t.note || '',
        };
      });
    }

    // Convert to CSV
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Note'];
    const rows = transactions.map(t => [
      t.date,
      t.type.toUpperCase(),
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.paymentMethod.toUpperCase(),
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('exportTransactionsCsv error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate CSV export.' });
  }
};

