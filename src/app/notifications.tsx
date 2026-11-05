import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';

export default function NotificationsScreen() {
  const theme = useTheme();
  const { notifications, markNotificationRead } = useExpense();

  const handleMarkAllRead = async () => {
    await markNotificationRead();
  };

  const handleItemPress = async (id: string) => {
    await markNotificationRead(id);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.actionHeader}>
          <ThemedText style={[styles.countText, { color: theme.textSecondary }]}>
            {notifications.length} Notification{notifications.length === 1 ? '' : 's'}
          </ThemedText>

          {notifications.some(n => !n.read) && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <ThemedText style={[styles.markAllText, { color: theme.primary }]}>
                Mark all as read
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyView}>
              <Ionicons name="notifications-off-outline" size={48} color={theme.textTertiary} />
              <ThemedText style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                No notifications yet
              </ThemedText>
              <ThemedText style={[styles.emptyDesc, { color: theme.textTertiary }]}>
                Expense reminders and budget alerts will appear here.
              </ThemedText>
            </View>
          ) : (
            notifications.map(item => {
              let iconName = 'notifications-outline';
              let iconColor = theme.primary;
              let iconBg = theme.primaryLight;

              if (item.type === 'budget_exceeded') {
                iconName = 'alert-circle';
                iconColor = theme.danger;
                iconBg = theme.dangerLight;
              } else if (item.type === 'budget_warning') {
                iconName = 'warning';
                iconColor = theme.warning;
                iconBg = theme.warningLight;
              } else if (item.type === 'reminder') {
                iconName = 'alarm';
                iconColor = theme.success;
                iconBg = theme.successLight;
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.card,
                      borderColor: item.read ? theme.cardBorder : theme.primary,
                      borderLeftWidth: item.read ? 1 : 4,
                    },
                  ]}
                  onPress={() => handleItemPress(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                    <Ionicons name={iconName as any} size={20} color={iconColor} />
                  </View>

                  <View style={styles.details}>
                    <View style={styles.titleRow}>
                      <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                      {!item.read && (
                        <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                      )}
                    </View>
                    <ThemedText style={[styles.itemMessage, { color: theme.textSecondary }]}>
                      {item.message}
                    </ThemedText>
                    <ThemedText style={[styles.itemTime, { color: theme.textTertiary }]}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
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
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.seven,
    gap: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  details: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  itemTime: {
    fontSize: 11,
    marginTop: 6,
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.seven,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  emptyDesc: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
