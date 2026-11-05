import { Category } from '@/types';

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  {
    id: 'inc-salary',
    name: 'Salary',
    type: 'income',
    icon: 'cash-outline',
    color: '#10B981',
  },
  {
    id: 'inc-business',
    name: 'Business',
    type: 'income',
    icon: 'briefcase-outline',
    color: '#3B82F6',
  },
  {
    id: 'inc-freelance',
    name: 'Freelance',
    type: 'income',
    icon: 'laptop-outline',
    color: '#8B5CF6',
  },
  {
    id: 'inc-investment',
    name: 'Investment',
    type: 'income',
    icon: 'trending-up-outline',
    color: '#06B6D4',
  },
  {
    id: 'inc-gift',
    name: 'Gift / Bonus',
    type: 'income',
    icon: 'gift-outline',
    color: '#F59E0B',
  },
  {
    id: 'inc-other',
    name: 'Other Income',
    type: 'income',
    icon: 'wallet-outline',
    color: '#6366F1',
  },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'exp-food',
    name: 'Food & Dining',
    type: 'expense',
    icon: 'restaurant-outline',
    color: '#EF4444',
  },
  {
    id: 'exp-shopping',
    name: 'Shopping',
    type: 'expense',
    icon: 'cart-outline',
    color: '#EC4899',
  },
  {
    id: 'exp-travel',
    name: 'Travel & Transport',
    type: 'expense',
    icon: 'car-outline',
    color: '#3B82F6',
  },
  {
    id: 'exp-rent',
    name: 'Rent & Housing',
    type: 'expense',
    icon: 'home-outline',
    color: '#F59E0B',
  },
  {
    id: 'exp-bills',
    name: 'Bills & Utilities',
    type: 'expense',
    icon: 'flash-outline',
    color: '#8B5CF6',
  },
  {
    id: 'exp-entertainment',
    name: 'Entertainment',
    type: 'expense',
    icon: 'film-outline',
    color: '#A855F7',
  },
  {
    id: 'exp-health',
    name: 'Health & Medical',
    type: 'expense',
    icon: 'medkit-outline',
    color: '#10B981',
  },
  {
    id: 'exp-education',
    name: 'Education',
    type: 'expense',
    icon: 'school-outline',
    color: '#0284C7',
  },
  {
    id: 'exp-other',
    name: 'Other Expense',
    type: 'expense',
    icon: 'ellipsis-horizontal-circle-outline',
    color: '#64748B',
  },
];

export const AVAILABLE_CATEGORY_ICONS = [
  'restaurant-outline',
  'cart-outline',
  'car-outline',
  'home-outline',
  'flash-outline',
  'film-outline',
  'medkit-outline',
  'school-outline',
  'airplane-outline',
  'gift-outline',
  'fitness-outline',
  'book-outline',
  'cafe-outline',
  'game-controller-outline',
  'paw-outline',
  'shirt-outline',
  'cash-outline',
  'wallet-outline',
  'trending-up-outline',
  'briefcase-outline',
  'laptop-outline',
  'musical-notes-outline',
];

export const CATEGORY_COLOR_PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
  '#14B8A6', // Teal
  '#84CC16', // Lime
];

