import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getPool, isMysqlConnected } from '../config/db';
import { mockStorage, UserRecord } from '../services/mockStorage';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_daily_expense_jwt_key_2026_change_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '30d';

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, currency = 'USD' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
      if (existing.length > 0) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (id, name, email, password_hash, currency, theme_preference) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name.trim(), normalizedEmail, passwordHash, currency, 'system']
      );

      // Create default notification settings
      await pool.query(
        'INSERT INTO notification_settings (user_id, daily_reminder_enabled, reminder_time, budget_alerts_enabled, threshold_80, threshold_100) VALUES (?, TRUE, "20:00", TRUE, TRUE, TRUE)',
        [userId]
      );

      const token = jwt.sign({ id: userId, email: normalizedEmail, name: name.trim() }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES as any,
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: userId,
          name: name.trim(),
          email: normalizedEmail,
          currency,
          themePreference: 'system',
        },
      });
      return;
    }

    // Mock storage fallback
    const existing = mockStorage.users.find(u => u.email === normalizedEmail);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const userId = uuidv4();
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: UserRecord = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      currency,
      theme_preference: 'system',
      created_at: now,
      updated_at: now,
    };

    mockStorage.users.push(newUser);
    mockStorage.notificationSettings.set(userId, {
      user_id: userId,
      daily_reminder_enabled: true,
      reminder_time: '20:00',
      budget_alerts_enabled: true,
      threshold_80: true,
      threshold_100: true,
      updated_at: now,
    });

    const token = jwt.sign({ id: userId, email: normalizedEmail, name: name.trim() }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES as any,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        currency,
        themePreference: 'system',
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const [rows]: any = await pool.query(
        'SELECT id, name, email, password_hash, currency, theme_preference FROM users WHERE email = ?',
        [normalizedEmail]
      );

      if (rows.length === 0) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES as any,
      });

      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency || 'USD',
          themePreference: user.theme_preference || 'system',
        },
      });
      return;
    }

    // Mock storage fallback
    const user = mockStorage.users.find(u => u.email === normalizedEmail);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES as any,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        themePreference: user.theme_preference,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const [rows]: any = await pool.query(
        'SELECT id, name, email, currency, theme_preference, created_at FROM users WHERE id = ?',
        [userId]
      );
      if (rows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }
      const user = rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          themePreference: user.theme_preference,
          createdAt: user.created_at,
        },
      });
      return;
    }

    const user = mockStorage.users.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        themePreference: user.theme_preference,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, currency, themePreference } = req.body;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      await pool.query(
        'UPDATE users SET name = COALESCE(?, name), currency = COALESCE(?, currency), theme_preference = COALESCE(?, theme_preference) WHERE id = ?',
        [name, currency, themePreference, userId]
      );

      const [rows]: any = await pool.query('SELECT id, name, email, currency, theme_preference FROM users WHERE id = ?', [userId]);
      const user = rows[0];
      res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          themePreference: user.theme_preference,
        },
      });
      return;
    }

    const user = mockStorage.users.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name.trim();
    if (currency) user.currency = currency;
    if (themePreference) user.theme_preference = themePreference;
    user.updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        themePreference: user.theme_preference,
      },
    });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

