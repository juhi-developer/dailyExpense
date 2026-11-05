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
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="pie-chart-outline" size={44} color={theme.textTertiary} />
          <ThemedText style={{ color: theme.textSecondary, marginTop: 8, fontWeight: '500' }}>
            No expenses recorded for this period
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
      <View style={styles.titleRow}>
        <ThemedText style={styles.cardTitle}>Spending by Category</ThemedText>
        <ThemedText style={[styles.totalLabel, { color: theme.textSecondary }]}>
          {formatCurrency(totalExpense, currency)}
        </ThemedText>
      </View>

      {/* Segmented Distribution Bar */}
      <View style={[styles.distributionBar, { backgroundColor: theme.cardBorder }]}>
        {breakdown.map((item, index) => {
          const widthPct = Math.max(item.percentage, 2);
          return (
            <View
              key={`segment-${index}`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: item.categoryColor || '#8B5CF6',
                height: 14,
              }}
            />
          );
        })}
      </View>

      {/* Category Rows */}
      <View style={styles.listContainer}>
        {breakdown.map((item, index) => (
          <View key={`cat-${index}`} style={[styles.categoryRow, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.leftCol}>
              <View
                style={[
                  styles.iconBubble,
                  { backgroundColor: `${item.categoryColor || '#8B5CF6'}18` },
                ]}
              >
                <Ionicons
                  name={(item.categoryIcon as any) || 'wallet-outline'}
                  size={15}
                  color={item.categoryColor || theme.primary}
                />
              </View>
              <ThemedText style={styles.categoryName} numberOfLines={1}>
                {item.categoryName}
              </ThemedText>
            </View>

            <View style={styles.rightCol}>
              <View style={[styles.pctBadge, { backgroundColor: `${item.categoryColor || '#8B5CF6'}20` }]}>
                <ThemedText style={[styles.pctText, { color: item.categoryColor || theme.primary }]}>
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    marginVertical: Spacing.two,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.three,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  distributionBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  listContainer: {
    gap: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 0.5,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.two,
  },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
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

