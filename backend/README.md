# Daily Expense Tracker – Backend Server

A robust, enterprise-grade RESTful API built with **Node.js, Express, TypeScript, and MySQL**.

## Features Covered
- **User Authentication (JWT + Bcrypt)**: Registration, login, profile management.
- **Income & Expense Tracking**: CRUD operations, categorized transactions, payment methods.
- **Category Management**: Built-in default categories and user-defined custom categories with custom icons and color hex codes.
- **Monthly & Category Budgeting**: Set budget limits, calculate real-time spent vs. remaining percentages, alert flags (80% warning, 100% exceeded).
- **Analytics & Financial Reports**: Daily, weekly, monthly, and yearly reports, category distribution breakdowns, and cash-flow time-series.
- **Notifications & Alerts**: Expense reminders and budget threshold alert management.
- **Data Export & Backups**: CSV report downloads, JSON backup export, and full database restore.

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your MySQL database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=daily_expense_tracker
JWT_SECRET=your_jwt_secret_key
```

### 3. Setup MySQL Database
If you have MySQL running:
```bash
mysql -u root -p < src/schema/schema.sql
```
*Note: The server also auto-creates the database and tables on startup if they do not exist. If MySQL is not running on your machine yet, the backend automatically runs in memory-backed mode so you can build and test immediately!*

### 4. Start the Server
```bash
# In development mode (auto-reload)
npm run dev

# Or build & start production
npm run build
npm start
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create account (`{ name, email, password, currency }`)
- `POST /api/auth/login` - Login (`{ email, password }`)
- `GET /api/auth/me` - Current user profile
- `PUT /api/auth/profile` - Update profile (`{ name, currency, themePreference }`)

### Categories
- `GET /api/categories` - List categories (query: `type=income|expense`)
- `POST /api/categories` - Create custom category (`{ name, type, icon, color }`)
- `PUT /api/categories/:id` - Edit category
- `DELETE /api/categories/:id` - Delete custom category

### Transactions
- `GET /api/transactions` - Filtered transactions (`type`, `categoryId`, `startDate`, `endDate`, `search`, `limit`, `offset`)
- `GET /api/transactions/summary` - Total income, total expense, balance, savings rate
- `POST /api/transactions` - Create transaction (`{ type, amount, categoryId, date, note, paymentMethod }`)
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - List budgets for month (`?month=YYYY-MM`)
- `GET /api/budgets/progress` - Budget progress, remaining amount, over-budget indicators
- `POST /api/budgets` - Set/update budget (`{ categoryId, month, limitAmount }`)
- `DELETE /api/budgets/:id` - Delete budget

### Reports & Analytics
- `GET /api/reports/analytics` - Period report (`?period=daily|weekly|monthly|yearly&year=YYYY&month=MM`)

### Notifications
- `GET /api/notifications` - List user notifications
- `POST /api/notifications/mark-read` - Mark notification(s) as read
- `GET /api/notifications/settings` - Notification preferences
- `PUT /api/notifications/settings` - Update daily reminder & alert preferences

### Export & Backup
- `GET /api/export/csv` - Download transactions CSV
- `GET /api/backup/export` - Export full JSON backup
- `POST /api/backup/restore` - Restore data from JSON backup

