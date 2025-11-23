import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHabitsStore } from '@/stores/habitsStore';
import { Habit } from '@/types/habits';
import { Alert } from '@/utils/alert';

/**
 * Habit Detail Screen
 * Shows habit statistics, history, and actions
 */
export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { items: habits, loading, fetchAll, removeItem } = useHabitsStore();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (habits.length === 0) {
      loadHabits();
    } else {
      const found = habits.find(h => h.id === Number(id));
      setHabit(found || null);
    }
  }, [id, habits]);

  const loadHabits = async () => {
    try {
      await fetchAll();
    } catch (err) {
      console.error('Failed to load habits:', err);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!habit) return;
            
            setDeleting(true);
            try {
              await removeItem(habit.id);
              Alert.alert('Deleted', 'Habit deleted successfully');
              router.back();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete habit');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !habit) {
    return (
      <View className="flex-1 bg-surface dark:bg-dark-background items-center justify-center">
        <ActivityIndicator size="large" color="hsl(231, 91%, 67%)" />
        <Text className="text-body text-text-secondary dark:text-dark-text-secondary mt-4">
          Loading habit...
        </Text>
      </View>
    );
  }

  if (!habit) {
    return (
      <View className="flex-1 bg-surface dark:bg-dark-background items-center justify-center px-6">
        <Text className="text-6xl mb-4">🤔</Text>
        <Text className="text-h3 text-text-primary dark:text-dark-text-primary font-semibold mb-2 text-center">
          Habit Not Found
        </Text>
        <Text className="text-body text-text-secondary dark:text-dark-text-secondary text-center mb-6">
          This habit may have been deleted or doesn't exist.
        </Text>
        <Pressable 
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-body text-text-inverse font-semibold">
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  // Calculate stats
  const completionRate = habit.totalCompletions > 0
    ? Math.round((habit.streakCount / habit.totalCompletions) * 100)
    : 0;

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-dark-background">
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-start justify-between mb-4">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-elevated dark:bg-dark-surface active:opacity-70"
          >
            <Text className="text-h4 text-text-secondary dark:text-dark-text-secondary">←</Text>
          </Pressable>
        </View>

        {/* Habit Icon & Name */}
        <View className="items-center mb-6">
          <View
            className={`w-20 h-20 ${
              habit.color === 'secondary' ? 'bg-secondary' :
              habit.color === 'accent' ? 'bg-accent' :
              habit.color === 'success' ? 'bg-success' :
              habit.color === 'info' ? 'bg-info' :
              'bg-primary'
            } rounded-2xl items-center justify-center mb-4 shadow-medium`}
          >
            <Text className="text-5xl">{habit.icon || '✅'}</Text>
          </View>
          <Text className="text-h2 text-text-primary dark:text-dark-text-primary font-bold text-center mb-2">
            {habit.name}
          </Text>
          {habit.description ? (
            <Text className="text-body text-text-secondary dark:text-dark-text-secondary text-center">
              {habit.description}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Stats Grid */}
      <View className="px-6 mb-6">
        <View className="bg-surface-elevated dark:bg-dark-surface rounded-2xl p-4 border-2 border-border dark:border-dark-border">
          <View className="flex-row">
            <View className="flex-1 items-center py-3 border-r border-border dark:border-dark-border">
              <Text className="text-h1 text-primary font-bold">
                {habit.streakCount || 0}
              </Text>
              <Text className="text-caption text-text-muted dark:text-dark-text-muted mt-1">
                Current Streak
              </Text>
            </View>
            <View className="flex-1 items-center py-3 border-r border-border dark:border-dark-border">
              <Text className="text-h1 text-secondary font-bold">
                {habit.longestStreak || 0}
              </Text>
              <Text className="text-caption text-text-muted dark:text-dark-text-muted mt-1">
                Best Streak
              </Text>
            </View>
            <View className="flex-1 items-center py-3">
              <Text className="text-h1 text-accent font-bold">
                {habit.totalCompletions || 0}
              </Text>
              <Text className="text-caption text-text-muted dark:text-dark-text-muted mt-1">
                Total Days
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Last 7 Days */}
      <View className="px-6 mb-6">
        <Text className="text-body-small text-text-secondary dark:text-dark-text-secondary font-semibold mb-3">
          Last 7 Days
        </Text>
        <View className="flex-row justify-between">
          {last7Days.map((date) => {
            const isCompleted = habit.completedDates?.includes(date);
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dateObj.getDate();
            
            return (
              <View key={date} className="items-center">
                <View
                  className={`w-12 h-12 rounded-xl items-center justify-center mb-2 ${
                    isCompleted
                      ? 'bg-success'
                      : 'bg-surface-elevated dark:bg-dark-surface border-2 border-border dark:border-dark-border'
                  }`}
                >
                  {isCompleted ? (
                    <Text className="text-2xl">✓</Text>
                  ) : (
                    <Text className="text-body text-text-muted dark:text-dark-text-muted">
                      {dayNum}
                    </Text>
                  )}
                </View>
                <Text className="text-caption text-text-muted dark:text-dark-text-muted">
                  {dayName}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Frequency Info */}
      <View className="px-6 mb-6">
        <View className="bg-info-bg dark:bg-info/20 rounded-xl p-4">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">📅</Text>
            <View className="flex-1">
              <Text className="text-body-small text-info font-semibold mb-1">
                Frequency
              </Text>
              <Text className="text-body text-text-primary dark:text-dark-text-primary">
                {habit.frequency ? habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1) : 'Daily'}
                {habit.targetDays ? ` - ${habit.targetDays} days per week` : ''}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="px-6 mb-8">
        <Text className="text-body-small text-text-secondary dark:text-dark-text-secondary font-semibold mb-3">
          Actions
        </Text>
        <View className="gap-3">
          <Pressable
            onPress={handleDelete}
            disabled={deleting}
            className="bg-danger py-4 rounded-xl items-center shadow-soft active:opacity-80"
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-body text-text-inverse font-semibold">
                Delete Habit
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Motivational Message */}
      {(habit.streakCount || 0) >= 7 ? (
        <View className="mx-6 mb-8 bg-success-bg dark:bg-success/20 rounded-2xl p-6">
          <Text className="text-4xl mb-2">🎉</Text>
          <Text className="text-body-large text-success font-semibold mb-2">
            Amazing Progress!
          </Text>
          <Text className="text-body text-text-primary dark:text-dark-text-primary">
            You've maintained a {habit.streakCount}-day streak! Keep up the fantastic work.
          </Text>
        </View>
      ) : null}

      {/* Footer Padding */}
      <View className="h-12" />
    </ScrollView>
  );
}
