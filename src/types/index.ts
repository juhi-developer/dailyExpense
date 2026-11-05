export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'card' | 'bank' | 'upi' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  themePreference: 'light' | 'dark' | 'system';
  createdAt?: string;
}

export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: TransactionType;
  icon: string; // Ionicons / MaterialCommunityIcons icon name
  color: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string; // ISO string or YYYY-MM-DD
  note?: string;
  paymentMethod: PaymentMethod;
  createdAt?: string;
}

export interface Budget {
  id: string;
  userId?: string;
  categoryId: string | null; // null represents overall monthly budget
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  month: string; // YYYY-MM
  limitAmount: number;
  spentAmount?: number;
}

export interface BudgetProgress {
  id: string;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  isWarning: boolean; // >= 80%
  isOverBudget: boolean; // >= 100%
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  percentage: number;
  count: number;
}

export interface ReportData {
  period: ReportPeriod;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  transactionsCount: number;
  breakdown: CategoryBreakdown[];
  timeSeries: {
    label: string;
    income: number;
    expense: number;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'budget_warning' | 'budget_exceeded' | 'system';
  timestamp: string;
  read: boolean;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
}

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  reminderTime: string; // "20:00"
  budgetAlertsEnabled: boolean;
  threshold80Percent: boolean;
  threshold100Percent: boolean;
}

