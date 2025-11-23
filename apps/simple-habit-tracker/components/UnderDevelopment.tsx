import { Text, View, ScrollView, Pressable, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useRef, useEffect } from 'react';
import { reloadApp } from '@/utils/reload';

/**
 * Under Development Page
 * 
 * This page is shown when a feature or page is under development.
 * Similar to backend's shared/missing_template_fallback.html.erb
 * 
 * Usage:
 * - Fallback page when routes are not yet implemented
 * - Placeholder during early development stages
 */
export default function UnderDevelopment() {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create slow spinning animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
    // rotateAnim is stable (created with useRef), no need to add to deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRefresh = () => {
    reloadApp();
  };

  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center p-8 pt-20 pb-20">
        {/* Animated Icon */}
        <View className="mb-8 w-24 h-24 bg-primary-light rounded-full items-center justify-center">
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Text className="text-5xl">⚗️</Text>
          </Animated.View>
        </View>

        {/* Title */}
        <Text className="text-4xl font-bold text-text-primary text-center mb-4">
          Page Under Development
        </Text>
        
        <Text className="text-lg text-text-secondary text-center mb-8 px-4">
          This page is currently being developed. Please check back later!
        </Text>

        {/* Action Buttons */}
        <View className="w-full max-w-md gap-4 mb-8">
          {/* Back to Home Button */}
          <Pressable
            onPress={() => router.push('/')}
            className="bg-primary py-3 px-6 rounded-lg active:opacity-80"
          >
            <Text className="text-white text-center font-semibold text-base">
              Back to Home
            </Text>
          </Pressable>

          {/* Refresh Button */}
          <Pressable
            onPress={handleRefresh}
            className="border border-border py-3 px-6 rounded-lg active:opacity-80 flex-row items-center justify-center gap-2"
          >
            <Text className="text-2xl">🔄</Text>
            <Text className="text-text-primary text-center font-medium text-base">
              Refresh Page
            </Text>
          </Pressable>
        </View>

        {/* Development Info */}
        <View className="w-full max-w-md bg-surface-elevated p-4 rounded-lg border border-border">
          <Text className="text-text-secondary text-sm text-center mb-2">
            Development Info
          </Text>
          <Text className="text-text-muted text-xs text-center">
            Generated view template
          </Text>
          <Text className="text-text-muted text-xs text-center">
            Time: {new Date().toLocaleString()}
          </Text>
        </View>

        {/* Helpful Tips */}
        <View className="mt-8 w-full max-w-md bg-info-bg border border-info rounded-lg p-4">
          <Text className="text-text-primary text-sm text-center mb-2 font-semibold">
            💡 Development Mode
          </Text>
          <Text className="text-text-secondary text-xs text-center">
            This fallback page appears when the requested route is not yet implemented.
            Implement the actual page in the app/ directory to replace this placeholder.
          </Text>
        </View>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

