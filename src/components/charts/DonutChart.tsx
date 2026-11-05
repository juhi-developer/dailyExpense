import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../themed-text';
import { CategoryBreakdown } from '@/types';
import { useTheme } from '@/hooks/use-theme';
import { useExpense } from '@/context/ExpenseContext';
import { formatCurrency } from '@/constants/currencies';
import { BorderRadius, Spacing } from '@/constants/theme';

interface DonutChartProps {
  breakdown: CategoryBreakdown[];
  totalExpense: number;
}

export function DonutChart({ breakdown, totalExpense }: DonutChartProps) {
  const theme = useTheme();
  const { currency } = useExpense();

  if (!breakdown || breakdown.length === 0 || totalExpense === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="pie-chart-outline" size={40} color={theme.textTertiary} />
          <ThemedText style={{ color: theme.textSecondary, marginTop: 8 }}>
            No expenses recorded for this period
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <ThemedText style={styles.cardTitle}>Spending by Category</ThemedText>

      {/* Segmented Distribution Bar */}
      <View style={styles.distributionBar}>
        {breakdown.map((item, index) => {
          const widthPct = Math.max(item.percentage, 2);
          return (
            <View
              key={`segment-${index}`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: item.categoryColor || '#4F46E5',
                height: 12,
              }}
            />
          );
        })}
      </View>

      {/* Category Rows */}
      <View style={styles.listContainer}>
        {breakdown.map((item, index) => (
          <View key={`cat-${index}`} style={styles.categoryRow}>
            <View style={styles.leftCol}>
              <View style={[styles.colorDot, { backgroundColor: item.categoryColor }]} />
              <Ionicons
                name={(item.categoryIcon as any) || 'wallet-outline'}
                size={16}
                color={item.categoryColor}
                style={{ marginRight: 6 }}
              />
              <ThemedText style={styles.categoryName} numberOfLines={1}>
                {item.categoryName}
              </ThemedText>
            </View>

            <View style={styles.rightCol}>
              <View style={[styles.pctBadge, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={[styles.pctText, { color: theme.textSecondary }]}>
                  {item.percentage}%
                </ThemedText>
              </View>
              <ThemedText style={styles.categoryAmount}>
                {formatCurrency(item.total, currency)}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    marginVertical: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  listContainer: {
    gap: Spacing.two,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.two,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pctBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

