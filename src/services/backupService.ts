import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { apiService } from './api';

export async function downloadJsonBackup(): Promise<void> {
  const backup = await apiService.exportBackup();
  const jsonStr = JSON.stringify(backup, null, 2);
  const fileName = `daily_expense_backup_${new Date().toISOString().split('T')[0]}.json`;

  if (Platform.OS === 'web') {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, jsonStr, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      UTI: 'public.json',
      mimeType: 'application/json',
      dialogTitle: 'Download JSON Data Backup',
    });
  }
}

export async function restoreFromJson(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.version) {
      throw new Error('Invalid backup file structure.');
    }
    await apiService.restoreBackup(parsed);
    return true;
  } catch (e) {
    console.error('Failed to restore backup:', e);
    throw e;
  }
}
