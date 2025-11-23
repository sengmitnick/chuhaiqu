/**
 * Storage Service
 * Handles secure storage with Web platform compatibility
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

class StorageService {
  async set(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  }

  async remove(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
}

export const storage = new StorageService();

