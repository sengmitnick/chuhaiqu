import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useHabitsStore } from '@/stores/habitsStore';
import { CreateHabitInput } from '@/types/habits';
import { Alert } from '@/utils/alert';

/**
 * Create New Habit Screen
 */
export default function NewHabitScreen() {
  const router = useRouter();
  const addItem = useHabitsStore(s => s.addItem);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateHabitInput>({
    name: '',
    icon: '✅',
    color: 'primary',
    description: '',
    frequency: 'daily',
    reminderEnabled: false,
  });

  // Available icons
  const iconOptions = ['✅', '🏃', '📖', '🧘', '💧', '🥗', '💪', '🎯', '✍️', '🎨', '🎵', '🌱'];
  
  // Available colors
  const colorOptions = [
    { value: 'primary', label: 'Indigo', bgClass: 'bg-primary' },
    { value: 'secondary', label: 'Teal', bgClass: 'bg-secondary' },
    { value: 'accent', label: 'Gold', bgClass: 'bg-accent' },
    { value: 'success', label: 'Green', bgClass: 'bg-success' },
    { value: 'info', label: 'Blue', bgClass: 'bg-info' },
    { value: 'warning', label: 'Orange', bgClass: 'bg-warning' },
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setLoading(true);
    
    try {
      await addItem(formData);
      Alert.alert('Success', 'Habit created successfully! 🎉');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-dark-background">
      {/* Header */}
      <View className="pt-16 pb-6 px-6 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-h2 text-text-primary dark:text-dark-text-primary font-bold">
            Create New Habit
          </Text>
          <Text className="text-body text-text-secondary dark:text-dark-text-secondary mt-1">
            Start building a better you ✨
          </Text>
        </View>
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-elevated dark:bg-dark-surface active:opacity-70"
        >
          <Text className="text-h4 text-text-secondary dark:text-dark-text-secondary">×</Text>
        </Pressable>
      </View>

      <View className="px-6">
        {/* Habit Name */}
        <View className="mb-6">
          <Text className="text-body-small text-text-secondary dark:text-dark-text-secondary font-semibold mb-2">
            Habit Name *
          </Text>
          <TextInput
            className="bg-surface-elevated dark:bg-dark-surface rounded-xl px-4 py-3.5 text-body text-text-primary dark:text-dark-text-primary border-2 border-border dark:border-dark-border"
            placeholder="e.g., Morning Run, Read 30 Minutes"
            placeholderTextColor="hsl(220, 10%, 65%)"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        {/* Icon Selection */}
        <View className="mb-6">
          <Text className="text-body-small text-text-secondary dark:text-dark-text-secondary font-semibold mb-3">
            Choose Icon
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {iconOptions.map((icon) => (
              <Pressable
                key={icon}
                onPress={() => setFormData({ ...formData, icon })}
                className={`w-14 h-14 rounded-xl items-center justify-center border-2 ${
                  formData.icon === icon
                    ? 'bg-primary border-primary'
                    : 'bg-surface-elevated dark:bg-dark-surface border-border dark:border-dark-border'
                } active:opacity-70`}
              >
                <Text className="text-2xl">{icon}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View className="mb-6">
          <Text className="text-body-small text-text-secondary dark:text-dark-text-secondary font-semibold mb-3">
            Choose Color
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {colorOptions.map((color) => (
              <Pressable
                key={color.value}
                onPress={() => setFormData({ ...formData, color: color.value })}
                className={`flex-row items-center px-4 py-3 rounded-xl border-2 ${
                  formData.color === color.value
                    ? 'border-text-primary dark:border-dark-text-primary'
                    : 'border-border dark:border-dark-border'
                } active:opacity-70`}
              >
                <View className={`w-6 h-6 rounded-full ${color.bgClass} mr-2`} />
                <Text className="text-body text-text-primary dark:text-dark-text-primary">
                  {color.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-body-small text-text-secondary dark:text-dark-text-secondary font-semibold mb-2">
            Description (Optional)
          </Text>
          <TextInput
            className="bg-surface-elevated dark:bg-dark-surface rounded-xl px-4 py-3.5 text-body text-text-primary dark:text-dark-text-primary border-2 border-border dark:border-dark-border"
            placeholder="Why is this habit important to you?"
            placeholderTextColor="hsl(220, 10%, 65%)"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Frequency */}
        <View className="mb-8">
          <Text className="text-body-small text-text-secondary dark:text-dark-text-secondary font-semibold mb-3">
            Frequency
          </Text>
          <View className="flex-row gap-3">
            {(['daily', 'weekly', 'custom'] as const).map((freq) => (
              <Pressable
                key={freq}
                onPress={() => setFormData({ ...formData, frequency: freq })}
                className={`flex-1 py-3 rounded-xl border-2 ${
                  formData.frequency === freq
                    ? 'bg-primary border-primary'
                    : 'bg-surface-elevated dark:bg-dark-surface border-border dark:border-dark-border'
                } active:opacity-70`}
              >
                <Text className={`text-body text-center font-semibold ${
                  formData.frequency === freq
                    ? 'text-text-inverse'
                    : 'text-text-primary dark:text-dark-text-primary'
                }`}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-8">
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="bg-primary py-4 rounded-xl items-center shadow-soft active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-body text-text-inverse font-semibold">
                Create Habit
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={loading}
            className="border-2 border-border dark:border-dark-border py-4 rounded-xl items-center active:opacity-80"
          >
            <Text className="text-body text-text-primary dark:text-dark-text-primary font-semibold">
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Footer Padding */}
      <View className="h-12" />
    </ScrollView>
  );
}
