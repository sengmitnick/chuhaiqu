import { Alert as RNAlert, Platform } from 'react-native';

/**
 * Cross-platform Alert utility
 *
 * Usage: Import from utils/alert instead of react-native
 * ```
 * import { Alert } from '@/utils/alert';
 *
 * Alert.alert('Title', 'Message');
 * Alert.alert('Title', 'Message', [
 *   { text: 'Cancel', style: 'cancel' },
 *   { text: 'OK', onPress: () => console.log('OK') }
 * ]);
 * ```
 *
 * On mobile: Uses React Native Alert API (native dialogs)
 * On web: Uses window.alert and window.confirm
 */

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export const Alert = {
  /**
   * Show an alert dialog
   *
   * @param title - Alert title
   * @param message - Alert message (optional)
   * @param buttons - Array of buttons (optional, max 3 buttons recommended)
   */
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[]
  ): void {
    if (Platform.OS === 'web') {
      // Web implementation using browser dialogs
      const fullMessage = message ? `${title}\n\n${message}` : title;

      if (!buttons || buttons.length === 0) {
        // Simple alert with OK button
        window.alert(fullMessage);
      } else if (buttons.length === 1) {
        // Single button alert
        window.alert(fullMessage);
        buttons[0].onPress?.();
      } else {
        // Multiple buttons - use confirm for 2 buttons
        const confirmed = window.confirm(fullMessage);

        // Find cancel and action buttons
        const cancelButton = buttons.find(btn => btn.style === 'cancel');
        const actionButton = buttons.find(btn => btn.style !== 'cancel') || buttons[0];

        if (confirmed) {
          actionButton?.onPress?.();
        } else {
          cancelButton?.onPress?.();
        }
      }
    } else {
      // Mobile implementation using React Native Alert
      RNAlert.alert(title, message, buttons);
    }
  }
};
