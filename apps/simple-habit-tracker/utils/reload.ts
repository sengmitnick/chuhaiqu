/**
 * App Reload Utility
 *
 * Provides cross-platform app reload functionality for development.
 *
 * Usage:
 * import { reloadApp } from '@/utils/reload';
 *
 * <Pressable onPress={reloadApp}>
 *   <Text>Reload</Text>
 * </Pressable>
 */

import { Platform } from 'react-native';

/**
 * Reload the application
 * - Web: Uses window.location.reload()
 * - Native (dev mode): Uses React Native DevSettings.reload()
 */
export function reloadApp(): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    return;
  }

  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DevSettings } = require('react-native');
    DevSettings.reload();
  }
}

