import { CurrencyConfig } from '@/types';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'prefix' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'prefix' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'prefix' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'prefix' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'prefix' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', position: 'prefix' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', position: 'prefix' },
];

export const DEFAULT_CURRENCY = CURRENCIES[0];

export function formatCurrency(amount: number, currency: CurrencyConfig = DEFAULT_CURRENCY): string {
  const formattedNumber = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = amount < 0 ? '-' : '';
  if (currency.position === 'prefix') {
    return `${sign}${currency.symbol}${formattedNumber}`;
  }
  return `${sign}${formattedNumber} ${currency.symbol}`;
}

