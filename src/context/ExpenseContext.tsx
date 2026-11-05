import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Transaction,
  Category,
  Budget,
  BudgetProgress,
  CurrencyConfig,
  NotificationItem,
  NotificationSettings,
} from '@/types';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/constants/currencies';
import { apiService } from '@/services/api';
import {
  scheduleDailyExpenseReminder,
  checkAndTriggerBudgetAlert,
  requestNotificationPermissions,
} from '@/services/notificationService';

import { useTheme } from '@/context/ThemeContext';

interface ExpenseSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}

interface ExpenseContextType {
  currency: CurrencyConfig;
  setCurrency: (c: CurrencyConfig) => Promise<void>;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => Promise<void>;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  budgetProgress: BudgetProgress[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  summary: ExpenseSummary;
  isLoading: boolean;
  isBackendOnline: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<Transaction>;
  editTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (cat: Omit<Category, 'id'>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  saveBudget: (budget: { categoryId: string | null; month: string; limitAmount: number }) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  markNotificationRead: (id?: string) => Promise<void>;
  notificationSettings: NotificationSettings;
  saveNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { themeMode, setThemeMode } = useTheme();
  const [currency, setCurrencyState] = useState<CurrencyConfig>(DEFAULT_CURRENCY);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    dailyReminderEnabled: true,
    reminderTime: '20:00',
    budgetAlertsEnabled: true,
    threshold80Percent: true,
    threshold100Percent: true,
  });
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savingsRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      const isOnline = await apiService.checkHealth();
      setIsBackendOnline(isOnline);

      const [txList, catList, budgetList, progressList, notifs, notifSettings, sum] = await Promise.all([
        apiService.getTransactions(),
        apiService.getCategories(),
        apiService.getBudgets(),
        apiService.getBudgetProgress(),
        apiService.getNotifications(),
        apiService.getNotificationSettings(),
        apiService.getSummary(),
      ]);

      setTransactions(txList);
      setCategories(catList);
      setBudgets(budgetList);
      setBudgetProgress(progressList);
      setNotifications(notifs);
      setNotificationSettings(notifSettings);
      setSummary(sum);

      // Check budget progress and trigger alerts if enabled
      if (notifSettings.budgetAlertsEnabled) {
        for (const p of progressList) {
          if (p.isOverBudget || p.isWarning) {
            checkAndTriggerBudgetAlert(p);
          }
        }
      }
    } catch (e) {
      console.warn('Error refreshing expense data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const savedCurrency = await AsyncStorage.getItem('@daily_expense_currency');
        if (savedCurrency) {
          const matched = CURRENCIES.find(c => c.code === savedCurrency);
          if (matched) setCurrencyState(matched);
        }

        await requestNotificationPermissions();
        await refreshData();
      } catch (e) {
        console.warn('Preferences load error:', e);
      }
    }
    loadPreferences();
  }, [refreshData]);

  const setCurrency = async (newCurrency: CurrencyConfig) => {
    setCurrencyState(newCurrency);
    await AsyncStorage.setItem('@daily_expense_currency', newCurrency.code);
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const created = await apiService.createTransaction(tx);
    await refreshData();
    return created;
  };

  const editTransaction = async (id: string, updates: Partial<Transaction>) => {
    await apiService.updateTransaction(id, updates);
    await refreshData();
  };

  const deleteTransaction = async (id: string) => {
    await apiService.deleteTransaction(id);
    await refreshData();
  };

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const created = await apiService.createCategory(cat);
    await refreshData();
    return created;
  };

  const deleteCategory = async (id: string) => {
    await apiService.deleteCategory(id);
    await refreshData();
  };

  const saveBudget = async (b: { categoryId: string | null; month: string; limitAmount: number }) => {
    await apiService.setBudget(b);
    await refreshData();
  };

  const deleteBudget = async (id: string) => {
    await apiService.deleteBudget(id);
    await refreshData();
  };

  const markNotificationRead = async (id?: string) => {
    await apiService.markNotificationRead(id);
    const updated = await apiService.getNotifications();
    setNotifications(updated);
  };

  const saveNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    await apiService.updateNotificationSettings(settings);
    const updated = await apiService.getNotificationSettings();
    setNotificationSettings(updated);
    await scheduleDailyExpenseReminder(updated);
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <ExpenseContext.Provider
      value={{
        currency,
        setCurrency,
        themeMode,
        setThemeMode,
        transactions,
        categories,
        budgets,
        budgetProgress,
        notifications,
        unreadNotificationCount,
        summary,
        isLoading,
        isBackendOnline,
        refreshData,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addCategory,
        deleteCategory,
        saveBudget,
        deleteBudget,
        markNotificationRead,
        notificationSettings,
        saveNotificationSettings,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
}

