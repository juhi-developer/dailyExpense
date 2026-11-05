import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { BudgetProgress } from '@/types';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/constants/currencies';
import { BorderRadius, Spacing } from '@/constants/theme';

interface BudgetProgressCardProps {
  progress: BudgetProgress;
  onPress?: () => void;
}

export function BudgetProgressCard({ progress, onPress }: BudgetProgressCardProps) {
  const theme = useTheme();
  const { currency } = useExpense();

  // Progress Bar color logic
  let progressColor: string = theme.success;
  let statusBadgeText = 'On Track';
  let badgeBg: string = theme.successLight;
  let badgeColor: string = theme.success;

  if (progress.isOverBudget) {
    progressColor = theme.danger;
    statusBadgeText = 'Exceeded';
    badgeBg = theme.dangerLight;
    badgeColor = theme.danger;
  } else if (progress.isWarning) {
    progressColor = theme.warning;
    statusBadgeText = 'Near Limit';
    badgeBg = theme.warningLight;
    badgeColor = theme.warning;
  }

  const cappedPercentage = Math.min(progress.percentage, 100);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: progress.isOverBudget ? `${theme.danger}40` : theme.cardBorder,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={styles.catInfo}>
          <View style={[styles.iconWrapper, { backgroundColor: `${progress.categoryColor}20` }]}>
            <Ionicons
              name={(progress.categoryIcon as any) || 'wallet-outline'}
              size={18}
              color={progress.categoryColor || theme.primary}
            />
          </View>
          <View>
            <ThemedText style={styles.categoryName}>{progress.categoryName}</ThemedText>
            <ThemedText style={[styles.limitSubtext, { color: theme.textSecondary }]}>
              Budget: {formatCurrency(progress.limitAmount, currency)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <ThemedText style={[styles.badgeText, { color: badgeColor }]}>{statusBadgeText}</ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarBg, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${cappedPercentage}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <ThemedText style={[styles.spentText, { color: theme.textSecondary }]}>
          Spent:{' '}
          <ThemedText style={[styles.spentAmount, { color: theme.text }]}>
            {formatCurrency(progress.spentAmount, currency)}
          </ThemedText>{' '}
          ({progress.percentage}%)
        </ThemedText>

        <ThemedText
          style={[
            styles.remainingText,
            {
              color: progress.isOverBudget ? theme.danger : theme.success,
            },
          ]}
        >
          {progress.isOverBudget
            ? `+${formatCurrency(progress.spentAmount - progress.limitAmount, currency)} over`
            : `${formatCurrency(progress.remainingAmount, currency)} left`}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  limitSubtext: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: Spacing.two,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spentText: {
    fontSize: 12,
  },
  spentAmount: {
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
