# Daily Expense Tracker 💰📊

A modern, full-stack personal finance application built with **React Native, Expo (SDK 58), TypeScript, Node.js, Express, and MySQL**.

Designed with mobile-first UI patterns, smooth animations, dark mode, high performance charts, offline-first sync resilience, and multi-currency support.

---

## 🌟 Main Features Breakdown

| # | Feature | Details & Implementation |
|---|---|---|
| 1 | **Login / Signup** | User authentication with JWT & bcrypt on Express backend, AsyncStorage token persistence, password show/hide, form validation, and 1-click demo login (`demo@example.com` / `password123`). |
| 2 | **Dashboard** | Balance card with net savings badge, income vs expense pills, quick action buttons, monthly budget status indicator, and recent transactions ledger. |
| 3 | **Add Income** | Record income streams (Salary, Business, Freelance, Investment, Gift, etc.), keypad amount entry, date picker, payment methods (Cash, Card, UPI, Bank), and notes. |
| 4 | **Add Expense** | Track expenses across categories (Food, Shopping, Travel, Rent, Utilities, etc.) with custom icon, date, notes, and payment mode selector. |
| 5 | **Categories** | Income & expense category manager. Preloaded default categories + create custom categories with custom icons and color palette pickers. |
| 6 | **Budget Management** | Set monthly overall budget and category-wise budgets. Real-time visual progress bars with warning states (Normal < 80%, Warning ≥ 80%, Exceeded ≥ 100%). |
| 7 | **Reports** | Daily, weekly, monthly, and yearly reports with net cash flow calculations, savings rates, and highest expense category highlights. |
| 8 | **Charts** | Interactive dual comparative Bar Chart (Income vs Expense) and segmented Donut/Category breakdown distribution chart with percentage badges. |
| 9 | **Transaction History** | Live search by note/category/amount, filters by type (All/Income/Expense) and category, multi-order sorting (Newest, Oldest, Highest amount), edit and delete actions. |
| 10 | **Notifications** | Scheduled daily expense reminders (`expo-notifications`) and real-time budget threshold alerts (80% warning and 100% exceeded triggers). |
| 11 | **Export** | Generate and download styled financial statement **PDF** reports (`expo-print` + `expo-sharing`) and tabular **CSV / Excel** spreadsheets (`expo-file-system/legacy`). |
| 12 | **Settings** | User profile manager, Dark Mode / Light Mode toggle, multi-currency switcher (USD $, INR ₹, EUR €, GBP £, JPY ¥, etc.), JSON data backup & restore, and custom API server URL config. |

---

## 🏗️ Architecture & Technology Stack

### Mobile App (Frontend)
- **Framework**: React Native with **Expo Router (File-based navigation)**
- **Language**: TypeScript (strict mode)
- **State & Storage**: React Context (`AuthContext`, `ExpenseContext`) + `@react-native-async-storage/async-storage`
- **Native Modules**:
  - `expo-print` & `expo-sharing` (PDF statement export & file sharing)
  - `expo-file-system/legacy` (CSV/Excel spreadsheet export & JSON backups)
  - `expo-notifications` (Scheduled reminders & budget overrun alerts)
  - `@expo/vector-icons` (Ionicons)
- **Offline-First Resilience**: If the MySQL/Express backend is not running, the app automatically switches to local memory/AsyncStorage with pre-seeded data so you can test seamlessly anytime.

### Backend Server (`backend/`)
- **Runtime**: Node.js + Express
- **Language**: TypeScript (`tsx` for dev, `tsc` for production)
- **Database**: MySQL (`mysql2/promise` with connection pooling)
- **Auth**: JWT (`jsonwebtoken`) + Password hashing (`bcryptjs`)
- **Schema & Auto-Migration**: `backend/src/schema/schema.sql` (Creates DB, users, categories, transactions, budgets, notifications, and settings tables with indexes).
- **Graceful Fallback**: If MySQL credentials are not configured yet, the backend automatically logs setup tips and runs in memory-backed mode to prevent crashes.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Install Dependencies
```bash
# Install frontend packages
npm install

# Install backend packages
cd backend
npm install
cd ..
```

### 3. Setup MySQL & Start the Backend
1. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Configure your MySQL credentials in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=daily_expense_tracker
   JWT_SECRET=super_secret_daily_expense_jwt_key_2026
   ```
3. Start the backend:
   ```bash
   npm run server
   ```
   *Health check endpoint:* [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Start the Expo Mobile App
In another terminal, start Expo:
```bash
npx expo start
```
- Press **w** to open in web browser.
- Press **a** to open on Android emulator.
- Press **i** to open on iOS simulator.
- Scan the QR code using the **Expo Go** app on your physical iOS or Android phone.

---

## 🧪 Linting & Quality Assurance

Both frontend and backend are fully typed and verified:
```bash
# Typecheck React Native / Expo app
npm run typecheck

# Lint Expo project
npm run lint

# Typecheck Backend
cd backend && npx tsc --noEmit
```
