import { formatCurrency } from '@/constants/currencies';
import { CurrencyConfig, Transaction } from '@/types';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export async function exportToPdf({
  transactions,
  totalIncome,
  totalExpense,
  balance,
  currency,
  userName = 'Valued User',
  periodTitle = 'Monthly Financial Report',
}: {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currency: CurrencyConfig;
  userName?: string;
  periodTitle?: string;
}): Promise<void> {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const transactionRows = transactions
    .map(
      t => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 10px 8px; font-size: 13px; color: #475569;">${t.date}</td>
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #1E293B;">${t.categoryName}</td>
      <td style="padding: 10px 8px; font-size: 12px; color: #64748B;">${t.note || '-'}</td>
      <td style="padding: 10px 8px; font-size: 12px; text-transform: uppercase; color: #64748B;">${t.paymentMethod}</td>
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 700; text-align: right; color: ${t.type === 'income' ? '#10B981' : '#EF4444'
        };">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, currency)}
      </td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${periodTitle}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0F172A;
            margin: 0;
            padding: 32px;
            background: #FFFFFF;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #4F46E5;
          }
          .report-info {
            text-align: right;
            font-size: 12px;
            color: #64748B;
          }
          .cards {
            display: flex;
            gap: 16px;
            margin-bottom: 28px;
          }
          .card {
            flex: 1;
            padding: 16px;
            border-radius: 12px;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
          }
          .card-title {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 600;
            color: #64748B;
            margin-bottom: 6px;
          }
          .card-val {
            font-size: 20px;
            font-weight: 700;
          }
          .income { color: #10B981; }
          .expense { color: #EF4444; }
          .balance { color: #4F46E5; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }
          th {
            background: #F1F5F9;
            text-align: left;
            padding: 10px 8px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #475569;
          }
          .footer {
            margin-top: 32px;
            text-align: center;
            font-size: 11px;
            color: #94A3B8;
            border-top: 1px solid #E2E8F0;
            padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Daily Expense Tracker</div>
            <div style="font-size: 14px; color: #475569; margin-top: 4px;">Statement for ${userName}</div>
          </div>
          <div class="report-info">
            <div><strong>${periodTitle}</strong></div>
            <div>Generated: ${dateStr}</div>
          </div>
        </div>

        <div class="cards">
          <div class="card">
            <div class="card-title">Total Balance</div>
            <div class="card-val balance">${formatCurrency(balance, currency)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Income</div>
            <div class="card-val income">+${formatCurrency(totalIncome, currency)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Expenses</div>
            <div class="card-val expense">-${formatCurrency(totalExpense, currency)}</div>
          </div>
        </div>

        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Transaction Details (${transactions.length})</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Date</th>
              <th style="width: 25%;">Category</th>
              <th style="width: 30%;">Note</th>
              <th style="width: 15%;">Method</th>
              <th style="width: 15%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows || '<tr><td colspan="5" style="text-align: center; padding: 24px; color: #94A3B8;">No transactions found</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by Daily Expense Tracker • Secure Personal Finance System
        </div>
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: 'Download Financial Statement PDF',
    });
  }
}

export async function exportToCsv({
  transactions,
}: {
  transactions: Transaction[];
}): Promise<void> {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Note'];
  const rows = transactions.map(t => [
    t.date,
    t.type.toUpperCase(),
    `"${(t.categoryName || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    (t.paymentMethod || 'cash').toUpperCase(),
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const fileName = `daily_expense_${new Date().toISOString().split('T')[0]}.csv`;

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      UTI: 'public.comma-separated-values-text',
      mimeType: 'text/csv',
      dialogTitle: 'Download Transactions Spreadsheet (CSV / Excel)',
    });
  }
}
