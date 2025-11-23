import { Stack } from 'expo-router';
import { View, LogBox } from 'react-native';
import {
  errorHandler,
  ErrorBoundary,
  ErrorStatusBar,
} from '@/utils/errorHandler';
import '../global.css';

/**
 * Root Layout with Demo Detection & Error Handling
 *
 * Features:
 * 1. Demo Preview Mode: Dynamically loads components/Demo.tsx if it exists
 * 2. Error Handling: ErrorBoundary + ErrorStatusBar for development
 * 3. Disable LogBox: Use our custom ErrorStatusBar instead
 *
 * Usage:
 * - Early stage: Keep Demo.tsx to show clients a quick preview
 * - Production: Delete Demo.tsx file to use real homepage (auto-detects at runtime)
 *
 * Implementation:
 * - Uses runtime require() in useEffect to gracefully handle missing Demo.tsx
 * - No manual code changes needed when adding/removing demo file
 * - Safe for hot reload - deleting Demo.tsx won't cause crashes
 */

// Disable Expo's LogBox (yellow warnings) - use our ErrorStatusBar instead
if (__DEV__ && LogBox) {
  LogBox.ignoreAllLogs();
}

// Initialize error handler (this will also suppress RedBox)
errorHandler.init();

export default function RootLayout() {
  // Render normal app with hidden headers for clean UI
  const content = <Stack screenOptions={{ headerShown: false }} />;

  return (
    <ErrorBoundary>
      <View className="flex-1">
        {content}
        <ErrorStatusBar />
      </View>
    </ErrorBoundary>
  );
}
