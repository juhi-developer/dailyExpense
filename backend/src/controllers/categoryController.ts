import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getPool, isMysqlConnected } from '../config/db';
import { mockStorage, CategoryRecord } from '../services/mockStorage';

export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      let query = 'SELECT id, user_id, name, type, icon, color, is_custom FROM categories WHERE user_id IS NULL OR user_id = ?';
      const params: any[] = [userId];

      if (type && (type === 'income' || type === 'expense')) {
        query += ' AND type = ?';
        params.push(type);
      }
      query += ' ORDER BY is_custom ASC, name ASC';

      const [rows]: any = await pool.query(query, params);
      const categories = rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        type: r.type,
        icon: r.icon,
        color: r.color,
        isCustom: Boolean(r.is_custom),
      }));

      res.json({ success: true, categories });
      return;
    }

    // Mock storage fallback
    let list = mockStorage.categories.filter(c => c.user_id === null || c.user_id === userId);
    if (type && (type === 'income' || type === 'expense')) {
      list = list.filter(c => c.type === type);
    }
    const categories = list.map(r => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      type: r.type,
      icon: r.icon,
      color: r.color,
      isCustom: r.is_custom,
    }));

    res.json({ success: true, categories });
  } catch (error: any) {
    console.error('getCategories error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, type, icon, color } = req.body;

    if (!name || !type || !icon || !color) {
      res.status(400).json({ success: false, message: 'Name, type (income/expense), icon, and color are required.' });
      return;
    }

    if (type !== 'income' && type !== 'expense') {
      res.status(400).json({ success: false, message: 'Type must be either "income" or "expense".' });
      return;
    }

    const categoryId = uuidv4();

    if (isMysqlConnected()) {
      const pool = getPool()!;
      await pool.query(
        'INSERT INTO categories (id, user_id, name, type, icon, color, is_custom) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
        [categoryId, userId, name.trim(), type, icon, color]
      );

      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        category: {
          id: categoryId,
          userId,
          name: name.trim(),
          type,
          icon,
          color,
          isCustom: true,
        },
      });
      return;
    }

    // Mock storage fallback
    const newCategory: CategoryRecord = {
      id: categoryId,
      user_id: userId,
      name: name.trim(),
      type,
      icon,
      color,
      is_custom: true,
      created_at: new Date().toISOString(),
    };
    mockStorage.categories.push(newCategory);

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: {
        id: categoryId,
        userId,
        name: name.trim(),
        type,
        icon,
        color,
        isCustom: true,
      },
    });
  } catch (error: any) {
    console.error('createCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const [existing]: any = await pool.query('SELECT user_id, is_custom FROM categories WHERE id = ?', [id]);
      if (existing.length === 0) {
        res.status(404).json({ success: false, message: 'Category not found.' });
        return;
      }
      if (existing[0].user_id !== userId) {
        res.status(403).json({ success: false, message: 'Cannot edit system default categories.' });
        return;
      }

      await pool.query(
        'UPDATE categories SET name = COALESCE(?, name), icon = COALESCE(?, icon), color = COALESCE(?, color) WHERE id = ?',
        [name, icon, color, id]
      );

      res.json({ success: true, message: 'Category updated successfully.' });
      return;
    }

    const cat = mockStorage.categories.find(c => c.id === id);
    if (!cat) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    if (cat.user_id !== userId) {
      res.status(403).json({ success: false, message: 'Cannot edit system default categories.' });
      return;
    }

    if (name) cat.name = name.trim();
    if (icon) cat.icon = icon;
    if (color) cat.color = color;

    res.json({ success: true, message: 'Category updated successfully.' });
  } catch (error: any) {
    console.error('updateCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isMysqlConnected()) {
      const pool = getPool()!;
      const [existing]: any = await pool.query('SELECT user_id FROM categories WHERE id = ?', [id]);
      if (existing.length === 0) {
        res.status(404).json({ success: false, message: 'Category not found.' });
        return;
      }
      if (existing[0].user_id !== userId) {
        res.status(403).json({ success: false, message: 'Cannot delete system default categories.' });
        return;
      }

      await pool.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
      res.json({ success: true, message: 'Category deleted successfully.' });
      return;
    }

    const index = mockStorage.categories.findIndex(c => c.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    if (mockStorage.categories[index].user_id !== userId) {
      res.status(403).json({ success: false, message: 'Cannot delete system default categories.' });
      return;
    }

    mockStorage.categories.splice(index, 1);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error: any) {
    console.error('deleteCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};

