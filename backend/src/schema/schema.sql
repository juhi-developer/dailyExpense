-- Daily Expense Tracker Database Schema for MySQL

CREATE DATABASE IF NOT EXISTS daily_expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE daily_expense_tracker;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  theme_preference ENUM('light', 'dark', 'system') DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Categories Table (system defaults have user_id = NULL)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  icon VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_user (user_id),
  INDEX idx_categories_type (type),
  CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  payment_method ENUM('cash', 'card', 'bank', 'upi', 'other') DEFAULT 'cash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_transactions_user_date (user_id, date),
  INDEX idx_transactions_user_type (user_id, type),
  INDEX idx_transactions_category (category_id),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Budgets Table (category_id NULL means overall monthly budget)
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NULL,
  month VARCHAR(7) NOT NULL, -- e.g. '2026-11'
  limit_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_category_month (user_id, category_id, month),
  INDEX idx_budgets_user_month (user_id, month),
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_budgets_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_read (user_id, is_read),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id VARCHAR(36) PRIMARY KEY,
  daily_reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_time VARCHAR(10) DEFAULT '20:00',
  budget_alerts_enabled BOOLEAN DEFAULT TRUE,
  threshold_80 BOOLEAN DEFAULT TRUE,
  threshold_100 BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed Default Categories (System Wide)
INSERT IGNORE INTO categories (id, user_id, name, type, icon, color, is_custom) VALUES
  ('inc-salary', NULL, 'Salary', 'income', 'cash-outline', '#10B981', FALSE),
  ('inc-business', NULL, 'Business', 'income', 'briefcase-outline', '#3B82F6', FALSE),
  ('inc-freelance', NULL, 'Freelance', 'income', 'laptop-outline', '#8B5CF6', FALSE),
  ('inc-investment', NULL, 'Investment', 'income', 'trending-up-outline', '#06B6D4', FALSE),
  ('inc-gift', NULL, 'Gift / Bonus', 'income', 'gift-outline', '#F59E0B', FALSE),
  ('inc-other', NULL, 'Other Income', 'income', 'wallet-outline', '#6366F1', FALSE),
  ('exp-food', NULL, 'Food & Dining', 'expense', 'restaurant-outline', '#EF4444', FALSE),
  ('exp-shopping', NULL, 'Shopping', 'expense', 'cart-outline', '#EC4899', FALSE),
  ('exp-travel', NULL, 'Travel & Transport', 'expense', 'car-outline', '#3B82F6', FALSE),
  ('exp-rent', NULL, 'Rent & Housing', 'expense', 'home-outline', '#F59E0B', FALSE),
  ('exp-bills', NULL, 'Bills & Utilities', 'expense', 'flash-outline', '#8B5CF6', FALSE),
  ('exp-entertainment', NULL, 'Entertainment', 'expense', 'film-outline', '#A855F7', FALSE),
  ('exp-health', NULL, 'Health & Medical', 'expense', 'medkit-outline', '#10B981', FALSE),
  ('exp-education', NULL, 'Education', 'expense', 'school-outline', '#0284C7', FALSE),
  ('exp-other', NULL, 'Other Expense', 'expense', 'ellipsis-horizontal-circle-outline', '#64748B', FALSE);

