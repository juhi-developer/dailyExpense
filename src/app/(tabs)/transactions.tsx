import { ThemedText } from '@/components/themed-text';
import { TransactionItem } from '@/components/TransactionItem';
import { formatCurrency } from '@/constants/currencies';
import { BorderRadius, MaxContentWidth, Spacing } from '@/constants/theme';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { TransactionType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TransactionsScreen() {
  const theme = useTheme();
  const { transactions, categories, currency } = useExpense();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_high'>('date_desc');

  const toggleSort = () => {
    if (sortBy === 'date_desc') setSortBy('date_asc');
    else if (sortBy === 'date_asc') setSortBy('amount_high');
    else setSortBy('date_desc');
  };

  const sortLabel = sortBy === 'date_desc' ? 'Newest' : sortBy === 'date_asc' ? 'Oldest' : 'Highest';

  // Filter & sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) return false;

        // Category filter
        if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNote = t.note?.toLowerCase().includes(q);
          const matchCat = t.categoryName.toLowerCase().includes(q);
          const matchAmount = t.amount.toString().includes(q);
          if (!matchNote && !matchCat && !matchAmount) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount_high') return b.amount - a.amount;
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [transactions, selectedType, selectedCategory, searchQuery, sortBy]);

  // Compute totals for current filtered view
  const { filteredIncome, filteredExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });
    return { filteredIncome: inc, filteredExpense: exp };
  }, [filteredTransactions]);

  const activeCategories = useMemo(() => {
    if (selectedType === 'all') return categories;
    return categories.filter(c => c.type === selectedType);
  }, [categories, selectedType]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Transactions</ThemedText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.backgroundElement }]}
              onPress={toggleSort}
            >
              <Ionicons name="swap-vertical" size={16} color={theme.text} />
              <ThemedText style={[styles.addBtnText, { color: theme.text }]}>{sortLabel}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/add-transaction' as any)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <ThemedText style={styles.addBtnText}>Add</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Ionicons name="search" size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search notes, category, amount..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Type Filter Tabs */}
        <View style={[styles.typeTabs, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {(['all', 'income', 'expense'] as const).map(type => {
            const isSelected = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeTab,
                  isSelected && {
                    backgroundColor:
                      type === 'income'
                        ? theme.successLight
                        : type === 'expense'
                          ? theme.dangerLight
                          : theme.primaryLight,
                  },
                ]}
                onPress={() => {
                  setSelectedType(type);
                  setSelectedCategory('all');
                }}
              >
                <ThemedText
                  style={[
                    styles.typeTabText,
                    {
                      color: isSelected
                        ? type === 'income'
                          ? theme.success
                          : type === 'expense'
                            ? theme.danger
                            : theme.primary
                        : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Filter Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.catChip,
              {
                backgroundColor: selectedCategory === 'all' ? theme.primary : theme.card,
                borderColor: selectedCategory === 'all' ? theme.primary : theme.cardBorder,
              },
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <ThemedText
              style={[
                styles.catChipText,
                { color: selectedCategory === 'all' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              All Categories
            </ThemedText>
          </TouchableOpacity>

          {activeCategories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isSelected ? cat.color : theme.card,
                    borderColor: isSelected ? cat.color : theme.cardBorder,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : cat.color}
                  style={{ marginRight: 4 }}
                />
                <ThemedText
                  style={[
                    styles.catChipText,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {cat.name}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filter Summary Banner */}
        <View style={[styles.summaryBanner, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText style={[styles.summaryCount, { color: theme.textSecondary }]}>
            Showing {filteredTransactions.length} records
          </ThemedText>
          <View style={styles.summaryTotals}>
            <ThemedText style={[styles.summaryIncome, { color: theme.success }]}>
              +{formatCurrency(filteredIncome, currency)}
            </ThemedText>
            <ThemedText style={[styles.summaryExpense, { color: theme.danger }]}>
              -{formatCurrency(filteredExpense, currency)}
            </ThemedText>
          </View>
        </View>

        {/* Transactions List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyView}>
              <Ionicons name="search-outline" size={48} color={theme.textTertiary} />
              <ThemedText style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                No matching transactions
              </ThemedText>
              <ThemedText style={[styles.emptyDesc, { color: theme.textTertiary }]}>
                Try adjusting your filters or search keywords.
              </ThemedText>
            </View>
          ) : (
            filteredTransactions.map(tx => (
              <TransactionItem key={tx.id} transaction={tx} showActions />
            ))
          )}
        </ScrollView>
      </View>
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
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginBottom: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: Spacing.two,
  },
  typeTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.two,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  typeTabText: {
    fontSize: 13,
  },
  categoryScroll: {
    maxHeight: 40,
    marginBottom: Spacing.two,
  },
  categoryScrollContent: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.two,
  },
  summaryCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryTotals: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryIncome: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryExpense: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.seven,
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  emptyDesc: {
    fontSize: 13,
    marginTop: 4,
  },
});
