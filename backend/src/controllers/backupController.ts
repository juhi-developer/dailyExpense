import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getPool, isMysqlConnected } from '../config/db';
import { mockStorage } from '../services/mockStorage';

export const exportBackup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (isMysqlConnected()) {
      const pool = getPool()!;

      const [userRows]: any = await pool.query('SELECT name, email, currency, theme_preference FROM users WHERE id = ?', [userId]);
      const [customCategories]: any = await pool.query('SELECT id, name, type, icon, color FROM categories WHERE user_id = ?', [userId]);
      const [transactions]: any = await pool.query('SELECT id, category_id, type, amount, date, note, payment_method FROM transactions WHERE user_id = ?', [userId]);
      const [budgets]: any = await pool.query('SELECT id, category_id, month, limit_amount FROM budgets WHERE user_id = ?', [userId]);
      const [settings]: any = await pool.query('SELECT daily_reminder_enabled, reminder_time, budget_alerts_enabled, threshold_80, threshold_100 FROM notification_settings WHERE user_id = ?', [userId]);

      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user: userRows[0] || null,
        customCategories,
        transactions,
        budgets,
        notificationSettings: settings[0] || null,
      };

      res.json({ success: true, backup: backupData });
      return;
    }

    const user = mockStorage.users.find(u => u.id === userId);
    const customCategories = mockStorage.categories.filter(c => c.user_id === userId);
    const transactions = mockStorage.transactions.filter(t => t.user_id === userId);
    const budgets = mockStorage.budgets.filter(b => b.user_id === userId);
    const settings = mockStorage.notificationSettings.get(userId);

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: user ? { name: user.name, email: user.email, currency: user.currency, theme_preference: user.theme_preference } : null,
      customCategories,
      transactions,
      budgets,
      notificationSettings: settings || null,
    };

    res.json({ success: true, backup: backupData });
  } catch (error: any) {
    console.error('exportBackup error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate backup.' });
  }
};

export const restoreBackup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { backup } = req.body;

    if (!backup || !backup.version) {
      res.status(400).json({ success: false, message: 'Invalid backup file format.' });
      return;
    }

    const { customCategories = [], transactions = [], budgets = [] } = backup;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // 1. Insert custom categories if any
        for (const cat of customCategories) {
          await connection.query(
            `INSERT INTO categories (id, user_id, name, type, icon, color, is_custom)
             VALUES (?, ?, ?, ?, ?, ?, TRUE)
             ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon), color = VALUES(color)`,
            [cat.id || uuidv4(), userId, cat.name, cat.type, cat.icon, cat.color]
          );
        }

        // 2. Insert transactions
        for (const tx of transactions) {
          const txId = tx.id || uuidv4();
          await connection.query(
            `INSERT INTO transactions (id, user_id, category_id, type, amount, date, note, payment_method)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE amount = VALUES(amount), note = VALUES(note), payment_method = VALUES(payment_method)`,
            [txId, userId, tx.category_id, tx.type, tx.amount, tx.date, tx.note || null, tx.payment_method || 'cash']
          );
        }

        // 3. Insert budgets
        for (const b of budgets) {
          await connection.query(
            `INSERT INTO budgets (id, user_id, category_id, month, limit_amount)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount)`,
            [b.id || uuidv4(), userId, b.category_id || null, b.month, b.limit_amount]
          );
        }

        await connection.commit();
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }

      res.json({ success: true, message: 'Backup data restored successfully.' });
      return;
    }

    // Mock storage restore
    for (const cat of customCategories) {
      const existing = mockStorage.categories.find(c => c.id === cat.id && c.user_id === userId);
      if (!existing) {
        mockStorage.categories.push({
          id: cat.id || uuidv4(),
          user_id: userId,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          is_custom: true,
          created_at: new Date().toISOString(),
        });
      }
    }

    for (const tx of transactions) {
      const existing = mockStorage.transactions.find(t => t.id === tx.id && t.user_id === userId);
      if (!existing) {
        mockStorage.transactions.push({
          id: tx.id || uuidv4(),
          user_id: userId,
          category_id: tx.category_id,
          type: tx.type,
          amount: Number(tx.amount),
          date: tx.date,
          note: tx.note || '',
          payment_method: tx.payment_method || 'cash',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    for (const b of budgets) {
      const existing = mockStorage.budgets.find(item => item.user_id === userId && item.month === b.month && item.category_id === (b.category_id || null));
      if (!existing) {
        mockStorage.budgets.push({
          id: b.id || uuidv4(),
          user_id: userId,
          category_id: b.category_id || null,
          month: b.month,
          limit_amount: Number(b.limit_amount),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    res.json({ success: true, message: 'Backup data restored successfully.' });
  } catch (error: any) {
    console.error('restoreBackup error:', error);
    res.status(500).json({ success: false, message: 'Failed to restore backup data.' });
  }
};

