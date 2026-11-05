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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { TransactionType, PaymentMethod } from '@/types';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';

export default function AddTransactionScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const { categories, currency, addTransaction } = useExpense();

  const initialType: TransactionType = (params.type as TransactionType) || 'expense';
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);
  const effectiveCategory = selectedCategory || (filteredCategories.length > 0 ? filteredCategories[0].id : '');

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (!effectiveCategory) {
      Alert.alert('Select Category', 'Please choose a category for this transaction.');
      return;
    }

    const cat = categories.find(c => c.id === effectiveCategory);
    if (!cat) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        type,
        amount: numAmount,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        date,
        note: note.trim(),
        paymentMethod,
      });

      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
    { key: 'card', label: 'Card', icon: 'card-outline' },
    { key: 'upi', label: 'UPI / Wallet', icon: 'phone-portrait-outline' },
    { key: 'cash', label: 'Cash', icon: 'cash-outline' },
    { key: 'bank', label: 'Bank Transfer', icon: 'business-outline' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Add Transaction</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Dual Type Toggle (Income / Expense) */}
          <View style={[styles.typeToggle, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'expense' && { backgroundColor: theme.dangerLight },
              ]}
              onPress={() => {
                setType('expense');
                setSelectedCategory('');
              }}
            >
              <Ionicons
                name="arrow-up-circle"
                size={18}
                color={type === 'expense' ? theme.danger : theme.textSecondary}
              />
              <ThemedText
                style={[
                  styles.typeBtnText,
                  { color: type === 'expense' ? theme.danger : theme.textSecondary },
                  type === 'expense' && { fontWeight: '700' },
                ]}
              >
                Expense
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'income' && { backgroundColor: theme.successLight },
              ]}
              onPress={() => {
                setType('income');
                setSelectedCategory('');
              }}
            >
              <Ionicons
                name="arrow-down-circle"
                size={18}
                color={type === 'income' ? theme.success : theme.textSecondary}
              />
              <ThemedText
                style={[
                  styles.typeBtnText,
                  { color: type === 'income' ? theme.success : theme.textSecondary },
                  type === 'income' && { fontWeight: '700' },
                ]}
              >
                Income
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={[styles.amountCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <ThemedText style={[styles.amountLabel, { color: theme.textSecondary }]}>Amount</ThemedText>
            <View style={styles.amountInputRow}>
              <ThemedText
                style={[
                  styles.currencySymbol,
                  { color: type === 'income' ? theme.success : theme.danger },
                ]}
              >
                {currency.symbol}
              </ThemedText>
              <TextInput
                style={[
                  styles.amountInput,
                  { color: type === 'income' ? theme.success : theme.danger },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
          </View>

          {/* Category Selector Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionLabel}>Select Category</ThemedText>
              <TouchableOpacity onPress={() => router.push('/categories' as any)}>
                <ThemedText style={[styles.manageLink, { color: theme.primary }]}>+ New</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.categoryGrid}>
              {filteredCategories.map(cat => {
                const isSelected = effectiveCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryTile,
                      {
                        backgroundColor: isSelected ? `${cat.color}25` : theme.card,
                        borderColor: isSelected ? cat.color : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}20` }]}>
                      <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <ThemedText
                      style={[
                        styles.catTileName,
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

          {/* Payment Method Selector */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Payment Method</ThemedText>
            <View style={styles.methodRow}>
              {paymentMethods.map(m => {
                const isSelected = paymentMethod === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[
                      styles.methodBtn,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : theme.card,
                        borderColor: isSelected ? theme.primary : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setPaymentMethod(m.key)}
                  >
                    <Ionicons
                      name={m.icon as any}
                      size={16}
                      color={isSelected ? theme.primary : theme.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.methodLabel,
                        { color: isSelected ? theme.primary : theme.textSecondary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {m.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date & Note Inputs */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Date (YYYY-MM-DD)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textTertiary}
            />

            <ThemedText style={[styles.sectionLabel, { marginTop: Spacing.two }]}>
              Note / Description
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                  height: 70,
                  textAlignVertical: 'top',
                },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="What was this for? (e.g., Grocery shopping, Client payment)"
              placeholderTextColor={theme.textTertiary}
              multiline
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: type === 'income' ? theme.success : theme.primary },
            ]}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.submitBtnText}>
              {isSubmitting ? 'Saving...' : `Save ${type === 'income' ? 'Income' : 'Expense'}`}
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
  typeToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginVertical: Spacing.two,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '500',
    marginBottom: 4,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '800',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 44,
    fontWeight: '800',
    minWidth: 120,
    textAlign: 'center',
  },
  section: {
    marginTop: Spacing.three,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94A3B8',
  },
  manageLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  categoryTile: {
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catTileName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  methodBtn: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  methodLabel: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    fontSize: 14,
    marginTop: 6,
  },
  submitBtn: {
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
