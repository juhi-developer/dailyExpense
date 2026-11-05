import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getPool, isMysqlConnected } from '../config/db';
import { mockStorage, NotificationRecord } from '../services/mockStorage';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const [rows]: any = await pool.query(
        'SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [userId]
      );
      const notifications = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        message: r.message,
        type: r.type,
        read: Boolean(r.is_read),
        timestamp: r.created_at,
      }));
      res.json({ success: true, notifications });
      return;
    }

    const list = mockStorage.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);

    const notifications = list.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.is_read,
      timestamp: n.created_at,
    }));

    res.json({ success: true, notifications });
  } catch (error: any) {
    console.error('getNotifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.body; // if null, mark all as read

    if (isMysqlConnected()) {
      const pool = getPool()!;
      if (id) {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
      } else {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
      }
      res.json({ success: true, message: 'Notifications marked as read.' });
      return;
    }

    mockStorage.notifications.forEach(n => {
      if (n.user_id === userId && (!id || n.id === id)) {
        n.is_read = true;
      }
    });

    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error: any) {
    console.error('markAsRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification status.' });
  }
};

export const getNotificationSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const [rows]: any = await pool.query(
        'SELECT daily_reminder_enabled, reminder_time, budget_alerts_enabled, threshold_80, threshold_100 FROM notification_settings WHERE user_id = ?',
        [userId]
      );
      if (rows.length === 0) {
        res.json({
          success: true,
          settings: {
            dailyReminderEnabled: true,
            reminderTime: '20:00',
            budgetAlertsEnabled: true,
            threshold80Percent: true,
            threshold100Percent: true,
          },
        });
        return;
      }
      const s = rows[0];
      res.json({
        success: true,
        settings: {
          dailyReminderEnabled: Boolean(s.daily_reminder_enabled),
          reminderTime: s.reminder_time,
          budgetAlertsEnabled: Boolean(s.budget_alerts_enabled),
          threshold80Percent: Boolean(s.threshold_80),
          threshold100Percent: Boolean(s.threshold_100),
        },
      });
      return;
    }

    const s = mockStorage.notificationSettings.get(userId);
    res.json({
      success: true,
      settings: s
        ? {
            dailyReminderEnabled: s.daily_reminder_enabled,
            reminderTime: s.reminder_time,
            budgetAlertsEnabled: s.budget_alerts_enabled,
            threshold80Percent: s.threshold_80,
            threshold100Percent: s.threshold_100,
          }
        : {
            dailyReminderEnabled: true,
            reminderTime: '20:00',
            budgetAlertsEnabled: true,
            threshold80Percent: true,
            threshold100Percent: true,
          },
    });
  } catch (error: any) {
    console.error('getNotificationSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notification settings.' });
  }
};

export const updateNotificationSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { dailyReminderEnabled, reminderTime, budgetAlertsEnabled, threshold80Percent, threshold100Percent } = req.body;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO notification_settings (user_id, daily_reminder_enabled, reminder_time, budget_alerts_enabled, threshold_80, threshold_100)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           daily_reminder_enabled = COALESCE(?, daily_reminder_enabled),
           reminder_time = COALESCE(?, reminder_time),
           budget_alerts_enabled = COALESCE(?, budget_alerts_enabled),
           threshold_80 = COALESCE(?, threshold_80),
           threshold_100 = COALESCE(?, threshold_100),
           updated_at = CURRENT_TIMESTAMP`,
        [
          userId,
          dailyReminderEnabled ?? true,
          reminderTime ?? '20:00',
          budgetAlertsEnabled ?? true,
          threshold80Percent ?? true,
          threshold100Percent ?? true,
          dailyReminderEnabled,
          reminderTime,
          budgetAlertsEnabled,
          threshold80Percent,
          threshold100Percent,
        ]
      );
      res.json({ success: true, message: 'Notification settings updated successfully.' });
      return;
    }

    const prev = mockStorage.notificationSettings.get(userId) || {
      user_id: userId,
      daily_reminder_enabled: true,
      reminder_time: '20:00',
      budget_alerts_enabled: true,
      threshold_80: true,
      threshold_100: true,
      updated_at: new Date().toISOString(),
    };

    if (dailyReminderEnabled !== undefined) prev.daily_reminder_enabled = dailyReminderEnabled;
    if (reminderTime !== undefined) prev.reminder_time = reminderTime;
    if (budgetAlertsEnabled !== undefined) prev.budget_alerts_enabled = budgetAlertsEnabled;
    if (threshold80Percent !== undefined) prev.threshold_80 = threshold80Percent;
    if (threshold100Percent !== undefined) prev.threshold_100 = threshold100Percent;
    prev.updated_at = new Date().toISOString();

    mockStorage.notificationSettings.set(userId, prev);
    res.json({ success: true, message: 'Notification settings updated successfully.' });
  } catch (error: any) {
    console.error('updateNotificationSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification settings.' });
  }
};

