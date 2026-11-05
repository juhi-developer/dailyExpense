import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import {
  CATEGORY_COLOR_PALETTE,
  AVAILABLE_CATEGORY_ICONS,
} from '@/constants/categories';
import { TransactionType } from '@/types';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';

export default function CategoriesScreen() {
  const theme = useTheme();
  const { categories, addCategory, deleteCategory } = useExpense();

  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [modalVisible, setModalVisible] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<TransactionType>('expense');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLOR_PALETTE[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_CATEGORY_ICONS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const displayedCategories = categories.filter(c => c.type === activeTab);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Category Name Required', 'Please enter a name for the new category.');
      return;
    }

    setIsCreating(true);
    try {
      await addCategory({
        name: newCatName.trim(),
        type: newCatType,
        color: selectedColor,
        icon: selectedIcon,
      });

      setModalVisible(false);
      setNewCatName('');
      Alert.alert('Success', `"${newCatName}" category added.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string, name: string, isCustom?: boolean) => {
    if (!isCustom) {
      Alert.alert('System Category', 'Default categories cannot be deleted.');
      return;
    }

    Alert.alert('Delete Category', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCategory(id);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Type Filter Tabs */}
        <View style={[styles.typeTabs, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <TouchableOpacity
            style={[
              styles.typeTab,
              activeTab === 'expense' && { backgroundColor: theme.dangerLight },
            ]}
            onPress={() => setActiveTab('expense')}
          >
            <ThemedText
              style={[
                styles.typeTabText,
                { color: activeTab === 'expense' ? theme.danger : theme.textSecondary },
                activeTab === 'expense' && { fontWeight: '700' },
              ]}
            >
              Expense Categories
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeTab,
              activeTab === 'income' && { backgroundColor: theme.successLight },
            ]}
            onPress={() => setActiveTab('income')}
          >
            <ThemedText
              style={[
                styles.typeTabText,
                { color: activeTab === 'income' ? theme.success : theme.textSecondary },
                activeTab === 'income' && { fontWeight: '700' },
              ]}
            >
              Income Categories
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Add Category Button */}
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => {
            setNewCatType(activeTab);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addBtnText}>Create New Category</ThemedText>
        </TouchableOpacity>

        {/* Categories List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {displayedCategories.map(cat => (
            <View
              key={cat.id}
              style={[styles.categoryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            >
              <View style={[styles.catIconBox, { backgroundColor: `${cat.color}20` }]}>
                <Ionicons name={cat.icon as any} size={22} color={cat.color} />
              </View>

              <View style={styles.catDetails}>
                <ThemedText style={styles.catName}>{cat.name}</ThemedText>
                <ThemedText style={[styles.catBadge, { color: theme.textSecondary }]}>
                  {cat.isCustom ? 'Custom Category' : 'Default Category'}
                </ThemedText>
              </View>

              {cat.isCustom ? (
                <TouchableOpacity
                  onPress={() => handleDelete(cat.id, cat.name, cat.isCustom)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.danger} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="lock-closed-outline" size={16} color={theme.textTertiary} />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Add Category Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>New Category</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Switcher */}
              <View style={[styles.typeTabs, { backgroundColor: theme.backgroundElement, marginBottom: Spacing.two }]}>
                <TouchableOpacity
                  style={[
                    styles.typeTab,
                    newCatType === 'expense' && { backgroundColor: theme.dangerLight },
                  ]}
                  onPress={() => setNewCatType('expense')}
                >
                  <ThemedText style={{ color: newCatType === 'expense' ? theme.danger : theme.textSecondary }}>
                    Expense
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeTab,
                    newCatType === 'income' && { backgroundColor: theme.successLight },
                  ]}
                  onPress={() => setNewCatType('income')}
                >
                  <ThemedText style={{ color: newCatType === 'income' ? theme.success : theme.textSecondary }}>
                    Income
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Name */}
              <ThemedText style={styles.fieldLabel}>Category Name</ThemedText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.inputBorder }]}
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="e.g. Gym & Fitness, Crypto, Pets"
                placeholderTextColor={theme.textTertiary}
              />

              {/* Color Palette */}
              <ThemedText style={[styles.fieldLabel, { marginTop: Spacing.two }]}>Choose Color</ThemedText>
              <View style={styles.colorPalette}>
                {CATEGORY_COLOR_PALETTE.map(col => (
                  <TouchableOpacity
                    key={col}
                    style={[
                      styles.colorDot,
                      { backgroundColor: col },
                      selectedColor === col && styles.selectedColorDot,
                    ]}
                    onPress={() => setSelectedColor(col)}
                  />
                ))}
              </View>

              {/* Icon Selector */}
              <ThemedText style={[styles.fieldLabel, { marginTop: Spacing.two }]}>Choose Icon</ThemedText>
              <View style={styles.iconGrid}>
                {AVAILABLE_CATEGORY_ICONS.map(ic => {
                  const isSelected = selectedIcon === ic;
                  return (
                    <TouchableOpacity
                      key={ic}
                      style={[
                        styles.iconChoice,
                        {
                          backgroundColor: isSelected ? selectedColor : theme.backgroundElement,
                        },
                      ]}
                      onPress={() => setSelectedIcon(ic)}
                    >
                      <Ionicons
                        name={ic as any}
                        size={20}
                        color={isSelected ? '#FFFFFF' : theme.text}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: theme.primary }]}
                onPress={handleCreateCategory}
                disabled={isCreating}
              >
                <ThemedText style={styles.createBtnText}>
                  {isCreating ? 'Creating...' : 'Create Category'}
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.two,
  },
  typeTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.three,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  typeTabText: {
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    gap: 6,
    marginBottom: Spacing.three,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.seven,
    gap: Spacing.two,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  catIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  catDetails: {
    flex: 1,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
  },
  catBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalBox: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94A3B8',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    fontSize: 14,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: Spacing.one,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColorDot: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: Spacing.one,
  },
  iconChoice: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtn: {
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
