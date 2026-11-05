import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';

export default function BudgetModalScreen() {
  const theme = useTheme();
  const { categories, currency, saveBudget } = useExpense();

  const currentMonth = new Date().toISOString().substring(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null); // null = overall
  const [limitAmount, setLimitAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSave = async () => {
    const numLimit = parseFloat(limitAmount);
    if (isNaN(numLimit) || numLimit <= 0) {
      Alert.alert('Invalid Limit', 'Please enter a valid budget limit greater than 0.');
      return;
    }

    if (!month.match(/^\d{4}-\d{2}$/)) {
      Alert.alert('Invalid Month', 'Month must follow YYYY-MM format (e.g. 2026-11).');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveBudget({
        categoryId: selectedTarget,
        month,
        limitAmount: numLimit,
      });

      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Set Budget</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Amount Card */}
          <View style={[styles.amountCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <ThemedText style={[styles.amountLabel, { color: theme.textSecondary }]}>
              Monthly Limit Amount
            </ThemedText>
            <View style={styles.amountInputRow}>
              <ThemedText style={[styles.currencySymbol, { color: theme.primary }]}>
                {currency.symbol}
              </ThemedText>
              <TextInput
                style={[styles.amountInput, { color: theme.primary }]}
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                value={limitAmount}
                onChangeText={setLimitAmount}
                autoFocus
              />
            </View>
          </View>

          {/* Month Input */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Month (YYYY-MM)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
              value={month}
              onChangeText={setMonth}
              placeholder="YYYY-MM"
              placeholderTextColor={theme.textTertiary}
            />
          </View>

          {/* Budget Target (Overall vs Category) */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Apply Budget To</ThemedText>

            {/* Overall Option */}
            <TouchableOpacity
              style={[
                styles.targetOption,
                {
                  backgroundColor: selectedTarget === null ? theme.primaryLight : theme.card,
                  borderColor: selectedTarget === null ? theme.primary : theme.cardBorder,
                },
              ]}
              onPress={() => setSelectedTarget(null)}
            >
              <View style={[styles.targetIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="wallet-outline" size={20} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.targetTitle}>Overall Monthly Budget</ThemedText>
                <ThemedText style={[styles.targetDesc, { color: theme.textSecondary }]}>
                  Cap across all spending categories combined
                </ThemedText>
              </View>
              {selectedTarget === null && (
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              )}
            </TouchableOpacity>

            <ThemedText style={[styles.sectionLabel, { marginTop: Spacing.three }]}>
              Or Choose Category
            </ThemedText>

            <View style={styles.categoryGrid}>
              {expenseCategories.map(cat => {
                const isSelected = selectedTarget === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catCard,
                      {
                        backgroundColor: isSelected ? `${cat.color}25` : theme.card,
                        borderColor: isSelected ? cat.color : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedTarget(cat.id)}
                  >
                    <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}20` }]}>
                      <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                    </View>
                    <ThemedText
                      style={[
                        styles.catName,
                        isSelected && { fontWeight: '700', color: cat.color },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.submitBtnText}>
              {isSubmitting ? 'Saving...' : 'Set Budget Limit'}
            </ThemedText>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  amountCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginVertical: Spacing.two,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 34,
    fontWeight: '800',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 42,
    fontWeight: '800',
    minWidth: 120,
    textAlign: 'center',
  },
  section: {
    marginTop: Spacing.three,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94A3B8',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    fontSize: 14,
  },
  targetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.three,
  },
  targetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  targetDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  catCard: {
    width: '31%',
    flexGrow: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  catIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.five,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

