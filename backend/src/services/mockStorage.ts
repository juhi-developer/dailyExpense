import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  currency: string;
  theme_preference: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  user_id: string | null;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  is_custom: boolean;
  created_at: string;
}

export interface TransactionRecord {
  id: string;
  user_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  note: string;
  payment_method: 'cash' | 'card' | 'bank' | 'upi' | 'other';
  created_at: string;
  updated_at: string;
}

export interface BudgetRecord {
  id: string;
  user_id: string;
  category_id: string | null;
  month: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationSettingsRecord {
  user_id: string;
  daily_reminder_enabled: boolean;
  reminder_time: string;
  budget_alerts_enabled: boolean;
  threshold_80: boolean;
  threshold_100: boolean;
  updated_at: string;
}

// In-Memory Storage Initializer with Seed Data
class MockStorage {
  users: UserRecord[] = [];
  categories: CategoryRecord[] = [];
  transactions: TransactionRecord[] = [];
  budgets: BudgetRecord[] = [];
  notifications: NotificationRecord[] = [];
  notificationSettings: Map<string, NotificationSettingsRecord> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Seed default categories
    const defaultCategories: Omit<CategoryRecord, 'created_at'>[] = [
      { id: 'inc-salary', user_id: null, name: 'Salary', type: 'income', icon: 'cash-outline', color: '#10B981', is_custom: false },
      { id: 'inc-business', user_id: null, name: 'Business', type: 'income', icon: 'briefcase-outline', color: '#3B82F6', is_custom: false },
      { id: 'inc-freelance', user_id: null, name: 'Freelance', type: 'income', icon: 'laptop-outline', color: '#8B5CF6', is_custom: false },
      { id: 'inc-investment', user_id: null, name: 'Investment', type: 'income', icon: 'trending-up-outline', color: '#06B6D4', is_custom: false },
      { id: 'inc-gift', user_id: null, name: 'Gift / Bonus', type: 'income', icon: 'gift-outline', color: '#F59E0B', is_custom: false },
      { id: 'inc-other', user_id: null, name: 'Other Income', type: 'income', icon: 'wallet-outline', color: '#6366F1', is_custom: false },
      { id: 'exp-food', user_id: null, name: 'Food & Dining', type: 'expense', icon: 'restaurant-outline', color: '#EF4444', is_custom: false },
      { id: 'exp-shopping', user_id: null, name: 'Shopping', type: 'expense', icon: 'cart-outline', color: '#EC4899', is_custom: false },
      { id: 'exp-travel', user_id: null, name: 'Travel & Transport', type: 'expense', icon: 'car-outline', color: '#3B82F6', is_custom: false },
      { id: 'exp-rent', user_id: null, name: 'Rent & Housing', type: 'expense', icon: 'home-outline', color: '#F59E0B', is_custom: false },
      { id: 'exp-bills', user_id: null, name: 'Bills & Utilities', type: 'expense', icon: 'flash-outline', color: '#8B5CF6', is_custom: false },
      { id: 'exp-entertainment', user_id: null, name: 'Entertainment', type: 'expense', icon: 'film-outline', color: '#A855F7', is_custom: false },
      { id: 'exp-health', user_id: null, name: 'Health & Medical', type: 'expense', icon: 'medkit-outline', color: '#10B981', is_custom: false },
      { id: 'exp-education', user_id: null, name: 'Education', type: 'expense', icon: 'school-outline', color: '#0284C7', is_custom: false },
      { id: 'exp-other', user_id: null, name: 'Other Expense', type: 'expense', icon: 'ellipsis-horizontal-circle-outline', color: '#64748B', is_custom: false },
    ];

    const now = new Date().toISOString();
    this.categories = defaultCategories.map(c => ({ ...c, created_at: now }));

    // Seed Demo User
    const demoUserId = 'demo-user-1';
    const demoPasswordHash = bcrypt.hashSync('password123', 8);

    this.users.push({
      id: demoUserId,
      name: 'Alex Johnson',
      email: 'demo@example.com',
      password_hash: demoPasswordHash,
      currency: 'USD',
      theme_preference: 'system',
      created_at: now,
      updated_at: now,
    });

    this.notificationSettings.set(demoUserId, {
      user_id: demoUserId,
      daily_reminder_enabled: true,
      reminder_time: '20:00',
      budget_alerts_enabled: true,
      threshold_80: true,
      threshold_100: true,
      updated_at: now,
    });

    const currentYearMonth = now.substring(0, 7);

    // Seed Budgets for demo user
    this.budgets.push(
      {
        id: uuidv4(),
        user_id: demoUserId,
        category_id: null, // Overall budget
        month: currentYearMonth,
        limit_amount: 3500,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        user_id: demoUserId,
        category_id: 'exp-food',
        month: currentYearMonth,
        limit_amount: 600,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        user_id: demoUserId,
        category_id: 'exp-shopping',
        month: currentYearMonth,
        limit_amount: 400,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        user_id: demoUserId,
        category_id: 'exp-bills',
        month: currentYearMonth,
        limit_amount: 300,
        created_at: now,
        updated_at: now,
      }
    );

    // Seed Transactions for demo user
    const sampleDates = [
      new Date(Date.now() - 0 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    ];

    const sampleTransactions: Omit<TransactionRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
      { category_id: 'inc-salary', type: 'income', amount: 4500, date: sampleDates[6], note: 'Monthly Salary Tech Corp', payment_method: 'bank' },
      { category_id: 'inc-freelance', type: 'income', amount: 850, date: sampleDates[3], note: 'UI/UX Design Contract', payment_method: 'bank' },
      { category_id: 'exp-rent', type: 'expense', amount: 1200, date: sampleDates[6], note: 'Monthly Apartment Rent', payment_method: 'bank' },
      { category_id: 'exp-food', type: 'expense', amount: 68.5, date: sampleDates[0], note: 'Weekly Grocery Shopping', payment_method: 'card' },
      { category_id: 'exp-food', type: 'expense', amount: 24.0, date: sampleDates[1], note: 'Dinner with Colleagues', payment_method: 'upi' },
      { category_id: 'exp-travel', type: 'expense', amount: 45.0, date: sampleDates[1], note: 'Metro & Uber commute', payment_method: 'card' },
      { category_id: 'exp-bills', type: 'expense', amount: 95.0, date: sampleDates[2], note: 'High-speed Internet & Electricity', payment_method: 'bank' },
      { category_id: 'exp-shopping', type: 'expense', amount: 129.99, date: sampleDates[3], note: 'Wireless Noise-Canceling Earbuds', payment_method: 'card' },
      { category_id: 'exp-entertainment', type: 'expense', amount: 18.0, date: sampleDates[4], note: 'Streaming Subscriptions', payment_method: 'card' },
      { category_id: 'exp-health', type: 'expense', amount: 50.0, date: sampleDates[5], note: 'Gym Monthly Membership', payment_method: 'upi' },
    ];

    sampleTransactions.forEach(t => {
      this.transactions.push({
        id: uuidv4(),
        user_id: demoUserId,
        ...t,
        created_at: now,
        updated_at: now,
      });
    });

    // Seed Sample Notifications
    this.notifications.push(
      {
        id: uuidv4(),
        user_id: demoUserId,
        title: 'Welcome to Daily Expense Tracker!',
        message: 'Start tracking your daily income, expenses, and monthly budgets effortlessly.',
        type: 'system',
        is_read: false,
        created_at: now,
      },
      {
        id: uuidv4(),
        user_id: demoUserId,
        title: 'Budget Alert (Shopping)',
        message: 'You have used 32% of your monthly Shopping budget.',
        type: 'budget_warning',
        is_read: false,
        created_at: now,
      }
    );
  }
}

export const mockStorage = new MockStorage();

