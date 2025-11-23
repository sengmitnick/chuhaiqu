import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useHabitsStore } from '@/stores/habitsStore';
import { Habit } from '@/types/habits';
import { Alert } from '@/utils/alert';
import { FadeInView, SlideUpView } from '@/components/AnimatedView';

/**
 * Main Habits List Screen
 * Displays all habits with check-in functionality and streak tracking
 */
export default function HomeScreen() {
  const router = useRouter();
  const { items: habits, loading, error, fetchAll, checkIn } = useHabitsStore();
  const [checkingIn, setCheckingIn] = useState<Record<number, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      await fetchAll();
    } catch (err) {
      console.error('Failed to load habits:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  };

  const handleCheckIn = async (habit: Habit) => {
    // Check if already completed today
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates?.includes(today);

    if (isCompletedToday) {
      Alert.alert('Already Completed', 'You have already completed this habit today! 🎉');
      return;
    }

    setCheckingIn({ ...checkingIn, [habit.id]: true });
    
    try {
      await checkIn(habit.id);
      // Show success feedback
      Alert.alert('Great Job!', `${habit.name} completed! 🎉`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to check in habit');
    } finally {
      setCheckingIn({ ...checkingIn, [habit.id]: false });
    }
  };

  const handleAddHabit = () => {
    router.push('/habit/new');
  };

  const handleHabitPress = (habitId: number) => {
    router.push(`/habit/${habitId}`);
  };

  // Calculate stats
  const activeHabits = habits.length;
  const totalStreak = habits.reduce((sum, h) => sum + (h.streakCount || 0), 0);
  const completedToday = habits.filter(h => {
    const today = new Date().toISOString().split('T')[0];
    return h.completedDates?.includes(today);
  }).length;

  if (loading && habits.length === 0) {
    return (
      <View className="flex-1 bg-surface dark:bg-dark-background items-center justify-center">
        <ActivityIndicator size="large" color="hsl(231, 91%, 67%)" />
        <Text className="text-body text-text-secondary dark:text-dark-text-secondary mt-4">
          Loading habits...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-surface dark:bg-dark-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <Text className="text-h1 text-text-primary dark:text-dark-text-primary font-bold mb-2">
          Simple Habits
        </Text>
        <Text className="text-body text-text-secondary dark:text-dark-text-secondary">
          Build better habits, one day at a time ✨
        </Text>
      </View>

      {/* Stats Cards */}
      {habits.length > 0 ? (
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-primary rounded-2xl p-4 shadow-soft">
              <Text className="text-h2 text-text-inverse font-bold mb-1">
                {activeHabits}
              </Text>
              <Text className="text-body-small text-text-inverse opacity-90">
                Active Habits
              </Text>
            </View>
            <View className="flex-1 bg-secondary rounded-2xl p-4 shadow-soft">
              <Text className="text-h2 text-text-inverse font-bold mb-1">
                {totalStreak}
              </Text>
              <Text className="text-body-small text-text-inverse opacity-90">
                Total Streak
              </Text>
            </View>
            <View className="flex-1 bg-accent rounded-2xl p-4 shadow-soft">
              <Text className="text-h2 text-text-inverse font-bold mb-1">
                {completedToday}
              </Text>
              <Text className="text-body-small text-text-inverse opacity-90">
                Today
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Today's Habits Section */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-h3 text-text-primary dark:text-dark-text-primary font-semibold">
            {habits.length > 0 ? "Today's Habits" : 'Start Your Journey'}
          </Text>
          <Pressable 
            onPress={handleAddHabit}
            className="bg-primary px-4 py-2 rounded-xl active:opacity-80 shadow-soft"
          >
            <Text className="text-body-small text-text-inverse font-semibold">
              + Add Habit
            </Text>
          </Pressable>
        </View>

        {/* Empty State */}
        {habits.length === 0 ? (
          <View className="bg-surface-elevated dark:bg-dark-surface rounded-2xl p-8 items-center border-2 border-border dark:border-dark-border">
            <Text className="text-6xl mb-4">🌱</Text>
            <Text className="text-h4 text-text-primary dark:text-dark-text-primary font-semibold mb-2 text-center">
              No Habits Yet
            </Text>
            <Text className="text-body text-text-secondary dark:text-dark-text-secondary text-center mb-6">
              Start building better habits today. Create your first habit to begin tracking your progress!
            </Text>
            <Pressable 
              onPress={handleAddHabit}
              className="bg-primary px-6 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-body text-text-inverse font-semibold">
                Create Your First Habit
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Habit Cards */}
        <View className="gap-3">
          {habits.map(habit => {
            const today = new Date().toISOString().split('T')[0];
            const isChecked = habit.completedDates?.includes(today);
            const isCheckingInThis = checkingIn[habit.id];
            
            return (
              <Pressable
                key={habit.id}
                onPress={() => handleHabitPress(habit.id)}
                className={`bg-surface-elevated dark:bg-dark-surface rounded-2xl p-5 border-2 ${
                  isChecked
                    ? 'border-success'
                    : 'border-border dark:border-dark-border'
                } shadow-soft active:opacity-90`}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    {/* Icon Circle */}
                    <View
                      className={`w-12 h-12 ${
                        habit.color === 'secondary' ? 'bg-secondary' :
                        habit.color === 'accent' ? 'bg-accent' :
                        habit.color === 'success' ? 'bg-success' :
                        habit.color === 'info' ? 'bg-info' :
                        'bg-primary'
                      } rounded-xl items-center justify-center mr-4`}
                    >
                      <Text className="text-2xl">{habit.icon || '✅'}</Text>
                    </View>
                    
                    {/* Habit Info */}
                    <View className="flex-1">
                      <Text
                        className={`text-body-large font-semibold ${
                          isChecked
                            ? 'text-text-muted dark:text-dark-text-muted line-through'
                            : 'text-text-primary dark:text-dark-text-primary'
                        }`}
                      >
                        {habit.name}
                      </Text>
                      {(habit.streakCount || 0) > 0 ? (
                        <View className="flex-row items-center mt-1">
                          <Text className="text-caption text-text-muted dark:text-dark-text-muted">
                            🔥 {habit.streakCount} day streak
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Check Button */}
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCheckIn(habit);
                    }}
                    disabled={isChecked || isCheckingInThis}
                    className={`w-10 h-10 rounded-full border-2 items-center justify-center ${
                      isChecked
                        ? 'bg-success border-success'
                        : 'border-border dark:border-dark-border active:bg-surface-hover dark:active:bg-dark-elevated'
                    }`}
                  >
                    {isCheckingInThis ? (
                      <ActivityIndicator size="small" color="hsl(231, 91%, 67%)" />
                    ) : isChecked ? (
                      <Text className="text-text-inverse font-bold text-lg">✓</Text>
                    ) : null}
                  </Pressable>
                </View>

                {/* Success Message */}
                {isChecked ? (
                  <View className="bg-success-bg dark:bg-success/20 rounded-lg p-2 mt-2">
                    <Text className="text-caption text-success dark:text-success-light text-center font-semibold">
                      ✨ Great job! Keep it up!
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Error Message */}
      {error ? (
        <View className="mx-6 mb-6 bg-danger-bg dark:bg-danger/20 rounded-xl p-4">
          <Text className="text-body text-danger dark:text-danger-light">
            {error}
          </Text>
        </View>
      ) : null}

      {/* Motivational Quote */}
      {habits.length > 0 ? (
        <View className="mx-6 mt-6 mb-8 bg-primary rounded-2xl p-6 shadow-medium">
          <Text className="text-body-large text-text-inverse font-semibold mb-2">
            💡 Keep Going!
          </Text>
          <Text className="text-body text-text-inverse opacity-90">
            "Success is the sum of small efforts repeated day in and day out."
          </Text>
        </View>
      ) : null}

      {/* Footer Padding */}
      <View className="h-12" />
    </ScrollView>
  );
}
