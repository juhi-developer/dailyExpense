import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

interface QuickActionsProps {
  onOpenExport?: () => void;
}

export function QuickActions({ onOpenExport }: QuickActionsProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Add Income */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => router.push({ pathname: '/add-transaction', params: { type: 'income' } } as any)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#059669', '#10B981']}
          style={styles.gradientIconWrapper}
        >
          <Ionicons name="arrow-down" size={20} color="#FFFFFF" />
        </LinearGradient>
        <ThemedText style={styles.actionLabel}>+ Income</ThemedText>
      </TouchableOpacity>

      {/* Add Expense */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => router.push({ pathname: '/add-transaction', params: { type: 'expense' } } as any)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#E11D48', '#F43F5E']}
          style={styles.gradientIconWrapper}
        >
          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
        </LinearGradient>
        <ThemedText style={styles.actionLabel}>+ Expense</ThemedText>
      </TouchableOpacity>

      {/* Set Budget */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => router.push('/budget-modal' as any)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#7C3AED', '#A855F7']}
          style={styles.gradientIconWrapper}
        >
          <Ionicons name="pie-chart" size={19} color="#FFFFFF" />
        </LinearGradient>
        <ThemedText style={styles.actionLabel}>Budget</ThemedText>
      </TouchableOpacity>

      {/* Export Report */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => (onOpenExport ? onOpenExport() : router.push('/analytics' as any))}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#0891B2', '#06B6D4']}
          style={styles.gradientIconWrapper}
        >
          <Ionicons name="document-text" size={19} color="#FFFFFF" />
        </LinearGradient>
        <ThemedText style={styles.actionLabel}>Export</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  gradientIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
