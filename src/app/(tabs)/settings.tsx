import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ExportModal } from '@/components/ExportModal';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { CURRENCIES } from '@/constants/currencies';
import { downloadJsonBackup, restoreFromJson } from '@/services/backupService';
import { apiService } from '@/services/api';
import { confirmAction, showAlert } from '@/utils/dialog';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';
import { CurrencyConfig } from '@/types';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, logout, updateUser } = useAuth();
  const {
    currency,
    setCurrency,
    notificationSettings,
    saveNotificationSettings,
    isBackendOnline,
    refreshData,
  } = useExpense();

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');

  // Server URL State
  const [serverUrl, setServerUrl] = useState(apiService.getApiUrl());
  const [testingConnection, setTestingConnection] = useState(false);

  // Restore JSON state
  const [restoreJsonInput, setRestoreJsonInput] = useState('');

  const toggleDarkMode = (val: boolean) => {
    theme.setThemeMode(val ? 'dark' : 'light');
  };

  const handleCurrencySelect = async (c: CurrencyConfig) => {
    await setCurrency(c);
    setCurrencyModalVisible(false);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showAlert('Error', 'Name cannot be empty.');
      return;
    }
    await updateUser({ name: editName.trim() });
    setProfileModalVisible(false);
    showAlert('Success', 'Profile updated successfully.');
  };

  const handleTestAndSaveServer = async () => {
    setTestingConnection(true);
    try {
      await apiService.setApiUrl(serverUrl);
      const isOnline = await apiService.checkHealth();
      await refreshData();

      if (isOnline) {
        showAlert('Success', 'Connected successfully to backend server!');
        setServerModalVisible(false);
      } else {
        showAlert(
          'Notice',
          'Server not reachable at this URL. The app will continue operating seamlessly in local offline storage mode.'
        );
        setServerModalVisible(false);
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const handleBackupDownload = async () => {
    try {
      await downloadJsonBackup();
    } catch (e: any) {
      showAlert('Backup Error', e.message || 'Failed to download backup.');
    }
  };

  const handleRestoreSubmit = async () => {
    try {
      if (!restoreJsonInput.trim()) {
        showAlert('Error', 'Please paste valid backup JSON data.');
        return;
      }
      await restoreFromJson(restoreJsonInput);
      await refreshData();
      setRestoreModalVisible(false);
      setRestoreJsonInput('');
      showAlert('Success', 'Backup data restored successfully!');
    } catch {
      showAlert('Restore Error', 'Invalid backup format or corrupted JSON.');
    }
  };

  const handleLogout = () => {
    confirmAction({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      confirmText: 'Sign Out',
      onConfirm: async () => {
        await logout();
        router.push('/auth' as any);
      },
    });
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
            <ThemedText style={styles.title}>Settings</ThemedText>
          </View>

          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.avatar, { backgroundColor: user ? theme.primaryLight : theme.backgroundElement }]}>
              <ThemedText style={[styles.avatarText, { color: user ? theme.primary : theme.textSecondary }]}>
                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
              </ThemedText>
            </View>

            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>
                {user ? user.name : 'Guest User'}
              </ThemedText>
              <ThemedText style={[styles.profileEmail, { color: theme.textSecondary }]}>
                {user ? user.email : 'Not signed in'}
              </ThemedText>
            </View>

            {user ? (
              <TouchableOpacity
                style={[styles.editProfileBtn, { backgroundColor: theme.backgroundElement }]}
                onPress={() => {
                  setEditName(user.name);
                  setProfileModalVisible(true);
                }}
              >
                <Ionicons name="pencil" size={16} color={theme.text} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.signInPill, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/auth' as any)}
              >
                <ThemedText style={styles.signInPillText}>Sign In</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Section: General Settings */}
          <ThemedText style={styles.sectionHeading}>General</ThemedText>
          <View style={[styles.settingGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {/* Dark Mode Switch */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF' }]}>
                  <Ionicons name={theme.isDark ? 'moon' : 'sunny-outline'} size={18} color={theme.primary} />
                </View>
                <View>
                  <ThemedText style={styles.settingTitle}>Dark Mode</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    {theme.isDark ? 'Dark theme active' : 'Light theme active'}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={theme.isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#CBD5E1', true: theme.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Currency Selector */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setCurrencyModalVisible(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.successLight }]}>
                  <Ionicons name="cash-outline" size={18} color={theme.success} />
                </View>
                <ThemedText style={styles.settingTitle}>Currency</ThemedText>
              </View>
              <View style={styles.settingRight}>
                <ThemedText style={[styles.settingValue, { color: theme.primary }]}>
                  {currency.symbol} ({currency.code})
                </ThemedText>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Category Manager */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/categories' as any)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.warningLight }]}>
                  <Ionicons name="pricetags-outline" size={18} color={theme.warning} />
                </View>
                <ThemedText style={styles.settingTitle}>Manage Categories</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Section: Notifications & Reminders */}
          <ThemedText style={styles.sectionHeading}>Notifications & Alerts</ThemedText>
          <View style={[styles.settingGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {/* Daily Expense Reminder */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.successLight }]}>
                  <Ionicons name="alarm-outline" size={18} color={theme.success} />
                </View>
                <View>
                  <ThemedText style={styles.settingTitle}>Daily Expense Reminder</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    Scheduled for {notificationSettings.reminderTime}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={notificationSettings.dailyReminderEnabled}
                onValueChange={val => saveNotificationSettings({ dailyReminderEnabled: val })}
                trackColor={{ false: '#CBD5E1', true: theme.success }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Budget Alerts (>80% / 100%) */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.dangerLight }]}>
                  <Ionicons name="warning-outline" size={18} color={theme.danger} />
                </View>
                <View>
                  <ThemedText style={styles.settingTitle}>Budget Overrun Alerts</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    Notify when spending crosses 80% or 100%
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={notificationSettings.budgetAlertsEnabled}
                onValueChange={val => saveNotificationSettings({ budgetAlertsEnabled: val })}
                trackColor={{ false: '#CBD5E1', true: theme.danger }}
              />
            </View>
          </View>

          {/* Section: Data Export & Backup */}
          <ThemedText style={styles.sectionHeading}>Data Export & Backup</ThemedText>
          <View style={[styles.settingGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {/* Export Reports */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setExportModalVisible(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="document-text-outline" size={18} color={theme.primary} />
                </View>
                <ThemedText style={styles.settingTitle}>Export PDF / CSV Statement</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Download JSON Backup */}
            <TouchableOpacity style={styles.settingRow} onPress={handleBackupDownload}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="cloud-download-outline" size={18} color="#7C3AED" />
                </View>
                <ThemedText style={styles.settingTitle}>Download JSON Backup</ThemedText>
              </View>
              <Ionicons name="download-outline" size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Restore Data */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setRestoreModalVisible(true)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.warningLight }]}>
                  <Ionicons name="cloud-upload-outline" size={18} color={theme.warning} />
                </View>
                <ThemedText style={styles.settingTitle}>Restore from Backup</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Section: Backend & Server Config */}
          <ThemedText style={styles.sectionHeading}>Backend Connection (Node + MySQL)</ThemedText>
          <View style={[styles.settingGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <TouchableOpacity style={styles.settingRow} onPress={() => setServerModalVisible(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: isBackendOnline ? theme.successLight : theme.warningLight }]}>
                  <Ionicons
                    name="server-outline"
                    size={18}
                    color={isBackendOnline ? theme.success : theme.warning}
                  />
                </View>
                <View>
                  <ThemedText style={styles.settingTitle}>Express API Server</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    Status: {isBackendOnline ? 'Connected (MySQL)' : 'Offline (Local Fallback)'}
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Account / Logout Button */}
          {user ? (
            <TouchableOpacity
              style={[
                styles.logoutBtn,
                { borderColor: `${theme.danger}40`, backgroundColor: theme.dangerLight },
              ]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color={theme.danger} />
              <ThemedText style={[styles.logoutText, { color: theme.danger }]}>
                Sign Out ({user.name})
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.logoutBtn,
                { borderColor: theme.primary, backgroundColor: theme.primaryLight },
              ]}
              onPress={() => router.push('/auth' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="log-in-outline" size={18} color={theme.primary} />
              <ThemedText style={[styles.logoutText, { color: theme.primary }]}>
                Sign In to Account
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={currencyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Currency</ThemedText>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {CURRENCIES.map(c => {
                const isSelected = currency.code === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.currencyRow,
                      isSelected && { backgroundColor: theme.primaryLight },
                    ]}
                    onPress={() => handleCurrencySelect(c)}
                  >
                    <ThemedText style={styles.currencySymbol}>{c.symbol}</ThemedText>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <ThemedText style={styles.currencyName}>{c.name}</ThemedText>
                      <ThemedText style={[styles.currencyCode, { color: theme.textSecondary }]}>
                        {c.code}
                      </ThemedText>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal visible={profileModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <ThemedText style={styles.modalTitle}>Edit Profile Name</ThemedText>
            <TextInput
              style={[styles.textInput, { color: theme.text, borderColor: theme.inputBorder }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your Name"
              placeholderTextColor={theme.textTertiary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { borderColor: theme.cardBorder }]}
                onPress={() => setProfileModalVisible(false)}
              >
                <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: theme.primary }]}
                onPress={handleSaveProfile}
              >
                <ThemedText style={{ color: '#FFFFFF', fontWeight: '700' }}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Server URL Config Modal */}
      <Modal visible={serverModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <ThemedText style={styles.modalTitle}>Backend API Endpoint</ThemedText>
            <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary, marginBottom: 12 }]}>
              Enter your Express server URL. On a physical mobile device, replace &quot;localhost&quot; with your computer&apos;s LAN IP (e.g. http://192.168.1.50:5000/api).
            </ThemedText>
            <TextInput
              style={[styles.textInput, { color: theme.text, borderColor: theme.inputBorder }]}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://localhost:5000/api"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { borderColor: theme.cardBorder }]}
                onPress={() => setServerModalVisible(false)}
              >
                <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: theme.primary }]}
                onPress={handleTestAndSaveServer}
                disabled={testingConnection}
              >
                <ThemedText style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  {testingConnection ? 'Testing...' : 'Test & Save'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Restore JSON Modal */}
      <Modal visible={restoreModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <ThemedText style={styles.modalTitle}>Restore Backup JSON</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { color: theme.text, borderColor: theme.inputBorder, height: 120, textAlignVertical: 'top' },
              ]}
              value={restoreJsonInput}
              onChangeText={setRestoreJsonInput}
              placeholder='Paste {"version": "1.0", "transactions": [...]} here...'
              placeholderTextColor={theme.textTertiary}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { borderColor: theme.cardBorder }]}
                onPress={() => setRestoreModalVisible(false)}
              >
                <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: theme.primary }]}
                onPress={handleRestoreSubmit}
              >
                <ThemedText style={{ color: '#FFFFFF', fontWeight: '700' }}>Restore</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Export Reports Modal */}
      <ExportModal visible={exportModalVisible} onClose={() => setExportModalVisible(false)} />
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
    marginVertical: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  editProfileBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
  },
  signInPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  signInPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94A3B8',
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
    marginLeft: 4,
  },
  settingGroup: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.two,
    marginTop: Spacing.three,
    marginBottom: Spacing.five,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
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
    maxWidth: 420,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    width: 32,
    textAlign: 'center',
  },
  currencyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyCode: {
    fontSize: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    fontSize: 14,
    marginVertical: Spacing.two,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalConfirm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
});
