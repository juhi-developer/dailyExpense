import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getPool, isMysqlConnected } from '../config/db';
import { mockStorage, TransactionRecord } from '../services/mockStorage';

export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type, categoryId, startDate, endDate, search, limit = 100, offset = 0 } = req.query;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      let query = `
        SELECT 
          t.id, t.user_id, t.type, t.amount, t.date, t.note, t.payment_method, t.created_at,
          c.id AS category_id, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
      `;
      const params: any[] = [userId];

      if (type && (type === 'income' || type === 'expense')) {
        query += ' AND t.type = ?';
        params.push(type);
      }

      if (categoryId) {
        query += ' AND t.category_id = ?';
        params.push(categoryId);
      }

      if (startDate) {
        query += ' AND t.date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND t.date <= ?';
        params.push(endDate);
      }

      if (search) {
        query += ' AND (t.note LIKE ? OR c.name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const [rows]: any = await pool.query(query, params);
      const transactions = rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        type: r.type,
        amount: Number(r.amount),
        categoryId: r.category_id,
        categoryName: r.category_name,
        categoryIcon: r.category_icon,
        categoryColor: r.category_color,
        date: typeof r.date === 'string' ? r.date.split('T')[0] : r.date.toISOString().split('T')[0],
        note: r.note || '',
        paymentMethod: r.payment_method,
        createdAt: r.created_at,
      }));

      res.json({ success: true, transactions });
      return;
    }

    // Mock storage fallback
    let list = mockStorage.transactions.filter(t => t.user_id === userId);

    if (type && (type === 'income' || type === 'expense')) {
      list = list.filter(t => t.type === type);
    }

    if (categoryId) {
      list = list.filter(t => t.category_id === categoryId);
    }

    if (startDate) {
      list = list.filter(t => t.date >= String(startDate));
    }

    if (endDate) {
      list = list.filter(t => t.date <= String(endDate));
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(t => {
        const cat = mockStorage.categories.find(c => c.id === t.category_id);
        const catName = cat?.name.toLowerCase() || '';
        return (t.note && t.note.toLowerCase().includes(q)) || catName.includes(q);
      });
    }

    // Sort descending
    list.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const paginated = list.slice(Number(offset), Number(offset) + Number(limit));

    const transactions = paginated.map(t => {
      const cat = mockStorage.categories.find(c => c.id === t.category_id);
      return {
        id: t.id,
        userId: t.user_id,
        type: t.type,
        amount: t.amount,
        categoryId: t.category_id,
        categoryName: cat?.name || 'Unknown',
        categoryIcon: cat?.icon || 'help-outline',
        categoryColor: cat?.color || '#94A3B8',
        date: t.date,
        note: t.note || '',
        paymentMethod: t.payment_method,
        createdAt: t.created_at,
      };
    });

    res.json({ success: true, transactions });
  } catch (error: any) {
    console.error('getTransactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve transactions.' });
  }
};

export const createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type, amount, categoryId, date, note, paymentMethod = 'cash' } = req.body;

    if (!type || amount === undefined || !categoryId || !date) {
      res.status(400).json({ success: false, message: 'Type, amount, categoryId, and date are required.' });
      return;
    }

    const numAmount = Math.abs(Number(amount));
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
      return;
    }

    const txId = uuidv4();
    const formattedDate = typeof date === 'string' ? date.split('T')[0] : new Date().toISOString().split('T')[0];

    if (isMysqlConnected()) {
      const pool = getPool()!;
      await pool.query(
        'INSERT INTO transactions (id, user_id, category_id, type, amount, date, note, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [txId, userId, categoryId, type, numAmount, formattedDate, note || null, paymentMethod]
      );

      const [catRows]: any = await pool.query('SELECT name, icon, color FROM categories WHERE id = ?', [categoryId]);
      const cat = catRows[0] || { name: 'General', icon: 'wallet-outline', color: '#6366F1' };

      res.status(201).json({
        success: true,
        message: 'Transaction recorded successfully.',
        transaction: {
          id: txId,
          userId,
          type,
          amount: numAmount,
          categoryId,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          categoryColor: cat.color,
          date: formattedDate,
          note: note || '',
          paymentMethod,
        },
      });
      return;
    }

    // Mock storage fallback
    const now = new Date().toISOString();
    const newTx: TransactionRecord = {
      id: txId,
      user_id: userId,
      category_id: categoryId,
      type,
      amount: numAmount,
      date: formattedDate,
      note: note || '',
      payment_method: paymentMethod,
      created_at: now,
      updated_at: now,
    };

    mockStorage.transactions.push(newTx);
    const cat = mockStorage.categories.find(c => c.id === categoryId);

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      transaction: {
        id: txId,
        userId,
        type,
        amount: numAmount,
        categoryId,
        categoryName: cat?.name || 'General',
        categoryIcon: cat?.icon || 'wallet-outline',
        categoryColor: cat?.color || '#6366F1',
        date: formattedDate,
        note: note || '',
        paymentMethod,
      },
    });
  } catch (error: any) {
    console.error('createTransaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to record transaction.' });
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { type, amount, categoryId, date, note, paymentMethod } = req.body;

    const formattedDate = date ? (typeof date === 'string' ? date.split('T')[0] : date) : undefined;
    const numAmount = amount !== undefined ? Math.abs(Number(amount)) : undefined;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const [existing]: any = await pool.query('SELECT user_id FROM transactions WHERE id = ?', [id]);
      if (existing.length === 0 || existing[0].user_id !== userId) {
        res.status(404).json({ success: false, message: 'Transaction not found.' });
        return;
      }

      await pool.query(
        `UPDATE transactions SET 
          type = COALESCE(?, type),
          amount = COALESCE(?, amount),
          category_id = COALESCE(?, category_id),
          date = COALESCE(?, date),
          note = COALESCE(?, note),
          payment_method = COALESCE(?, payment_method)
        WHERE id = ? AND user_id = ?`,
        [type, numAmount, categoryId, formattedDate, note, paymentMethod, id, userId]
      );

      res.json({ success: true, message: 'Transaction updated successfully.' });
      return;
    }

    const tx = mockStorage.transactions.find(t => t.id === id && t.user_id === userId);
    if (!tx) {
      res.status(404).json({ success: false, message: 'Transaction not found.' });
      return;
    }

    if (type) tx.type = type;
    if (numAmount !== undefined) tx.amount = numAmount;
    if (categoryId) tx.category_id = categoryId;
    if (formattedDate) tx.date = formattedDate;
    if (note !== undefined) tx.note = note;
    if (paymentMethod) tx.payment_method = paymentMethod;
    tx.updated_at = new Date().toISOString();

    res.json({ success: true, message: 'Transaction updated successfully.' });
  } catch (error: any) {
    console.error('updateTransaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to update transaction.' });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const [result]: any = await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
      if (result.affectedRows === 0) {
        res.status(404).json({ success: false, message: 'Transaction not found.' });
        return;
      }
      res.json({ success: true, message: 'Transaction deleted successfully.' });
      return;
    }

    const index = mockStorage.transactions.findIndex(t => t.id === id && t.user_id === userId);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Transaction not found.' });
      return;
    }

    mockStorage.transactions.splice(index, 1);
    res.json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (error: any) {
    console.error('deleteTransaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete transaction.' });
  }
};

export const getSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { month } = req.query; // YYYY-MM

    if (isMysqlConnected()) {
      const pool = getPool()!;
      let query = 'SELECT type, SUM(amount) AS total FROM transactions WHERE user_id = ?';
      const params: any[] = [userId];

      if (month) {
        query += ' AND DATE_FORMAT(date, "%Y-%m") = ?';
        params.push(month);
      }
      query += ' GROUP BY type';

      const [rows]: any = await pool.query(query, params);
      let totalIncome = 0;
      let totalExpense = 0;

      rows.forEach((r: any) => {
        if (r.type === 'income') totalIncome = Number(r.total);
        if (r.type === 'expense') totalExpense = Number(r.total);
      });

      const balance = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

      res.json({
        success: true,
        summary: {
          totalIncome,
          totalExpense,
          balance,
          savingsRate: Math.max(0, Math.round(savingsRate * 10) / 10),
        },
      });
      return;
    }

    let list = mockStorage.transactions.filter(t => t.user_id === userId);
    if (month) {
      list = list.filter(t => t.date.startsWith(String(month)));
    }

    let totalIncome = 0;
    let totalExpense = 0;

    list.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate: Math.max(0, Math.round(savingsRate * 10) / 10),
      },
    });
  } catch (error: any) {
    console.error('getSummary error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve summary.' });
  }
};

