import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { BudgetProgressCard } from '@/components/BudgetProgressCard';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';

export default function BudgetsScreen() {
  const theme = useTheme();
  const { budgetProgress, deleteBudget } = useExpense();

  // Current Month State
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const overallBudget = budgetProgress.find(b => b.categoryId === null);
  const categoryBudgets = budgetProgress.filter(b => b.categoryId !== null);

  const overBudgetCount = budgetProgress.filter(b => b.isOverBudget).length;
  const warningCount = budgetProgress.filter(b => b.isWarning).length;

  const handleCardPress = (id: string, name: string) => {
    Alert.alert('Manage Budget', `What would you like to do with the ${name} budget?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Edit Limit',
        onPress: () => {
          router.push('/budget-modal' as any);
        },
      },
      {
        text: 'Delete Budget',
        style: 'destructive',
        onPress: async () => {
          await deleteBudget(id);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.title}>Budget Management</ThemedText>
              <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
                Track spending against your monthly targets
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.setBudgetBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/budget-modal' as any)}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <ThemedText style={styles.setBudgetBtnText}>Set Budget</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Month Switcher Bar */}
          <View style={[styles.monthBar, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <TouchableOpacity onPress={handlePrevMonth} hitSlop={10} style={styles.monthArrow}>
              <Ionicons name="chevron-back" size={20} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.monthCenter}>
              <Ionicons name="calendar-outline" size={16} color={theme.primary} />
              <ThemedText style={styles.monthText}>{monthLabel}</ThemedText>
            </View>
            <TouchableOpacity onPress={handleNextMonth} hitSlop={10} style={styles.monthArrow}>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Alert Warnings Banner if any */}
          {overBudgetCount > 0 && (
            <View style={[styles.alertBanner, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
              <Ionicons name="alert-circle" size={20} color={theme.danger} />
              <ThemedText style={[styles.alertText, { color: theme.danger }]}>
                {overBudgetCount} budget{overBudgetCount > 1 ? 's have' : ' has'} exceeded the limit!
              </ThemedText>
            </View>
          )}

          {warningCount > 0 && overBudgetCount === 0 && (
            <View style={[styles.alertBanner, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
              <Ionicons name="warning-outline" size={20} color={theme.warning} />
              <ThemedText style={[styles.alertText, { color: theme.warning }]}>
                {warningCount} budget{warningCount > 1 ? 's are' : ' is'} near the 80% threshold.
              </ThemedText>
            </View>
          )}

          {/* Overall Monthly Budget Hero Card */}
          {overallBudget ? (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Overall Monthly Limit</ThemedText>
              <BudgetProgressCard
                progress={overallBudget}
                onPress={() => handleCardPress(overallBudget.id, 'Overall Monthly')}
              />
            </View>
          ) : (
            <View style={[styles.emptyBudgetCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="wallet-outline" size={36} color={theme.primary} />
              <ThemedText style={styles.emptyTitle}>No Overall Budget Set</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Set a total monthly spending budget to keep all your expenses on track.
              </ThemedText>
              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: theme.primary }]}
                onPress={() => router.push('/budget-modal' as any)}
              >
                <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>
                  + Set Overall Budget
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Category Budgets Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                Category Budgets ({categoryBudgets.length})
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/categories' as any)}>
                <ThemedText style={[styles.manageCatText, { color: theme.primary }]}>
                  Categories
                </ThemedText>
              </TouchableOpacity>
            </View>

            {categoryBudgets.length === 0 ? (
              <View
                style={[
                  styles.emptyCategoryCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <Ionicons name="pie-chart-outline" size={40} color={theme.textTertiary} />
                <ThemedText style={[styles.emptyCategoryTitle, { color: theme.textSecondary }]}>
                  No category budgets yet
                </ThemedText>
                <ThemedText style={[styles.emptyCategoryDesc, { color: theme.textTertiary }]}>
                  Assign individual limits for Food, Shopping, Bills, etc. to prevent overspending.
                </ThemedText>
                <TouchableOpacity
                  style={[styles.addCatBudgetBtn, { backgroundColor: theme.primary }]}
                  onPress={() => router.push('/budget-modal' as any)}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.addCatBudgetBtnText}>Add Category Budget</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              categoryBudgets.map(b => (
                <BudgetProgressCard
                  key={b.id}
                  progress={b}
                  onPress={() => handleCardPress(b.id, b.categoryName)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.seven,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  setBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  setBudgetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  monthBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  monthArrow: {
    padding: 4,
  },
  monthCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '700',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  sectionContainer: {
    marginBottom: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  manageCatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyBudgetCard: {
    padding: Spacing.five,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  outlineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  emptyCategoryCard: {
    padding: Spacing.five,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  emptyCategoryDesc: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  addCatBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addCatBudgetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
