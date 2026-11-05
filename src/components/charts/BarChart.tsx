import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

interface BarDataPoint {
  label: string;
  income: number;
  expense: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <ThemedText style={{ color: theme.textSecondary }}>No data available for this period</ThemedText>
      </View>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(
    ...data.flatMap(d => [d.income, d.expense]),
    100
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
          <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>Income</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.danger }]} />
          <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>Expense</ThemedText>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.chartContainer, { height }]}>
          {data.map((item, index) => {
            const incomeHeight = Math.max(4, (item.income / maxValue) * (height - 50));
            const expenseHeight = Math.max(4, (item.expense / maxValue) * (height - 50));

            return (
              <View key={`bar-${index}`} style={styles.groupContainer}>
                {/* Dual Bars Container */}
                <View style={styles.barsArea}>
                  {/* Income Bar */}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: incomeHeight,
                        backgroundColor: theme.success,
                      },
                    ]}
                  />

                  {/* Expense Bar */}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: expenseHeight,
                        backgroundColor: theme.danger,
                      },
                    ]}
                  />
                </View>

                {/* X-axis Label */}
                <ThemedText style={[styles.barLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.label}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Baseline Divider */}
      <View style={[styles.baseLine, { backgroundColor: theme.cardBorder }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    marginVertical: Spacing.two,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.one,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.three,
    paddingTop: 10,
  },
  groupContainer: {
    alignItems: 'center',
    width: 44,
  },
  barsArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: '100%',
    paddingBottom: 22,
  },
  bar: {
    width: 14,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    position: 'absolute',
    bottom: 0,
    textAlign: 'center',
  },
  baseLine: {
    height: 1,
    marginTop: -22,
    width: '100%',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
