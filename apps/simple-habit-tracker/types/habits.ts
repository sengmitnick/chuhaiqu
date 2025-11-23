/**
 * Habit Type Definitions
 * Simple Habit Tracker
 * 
 * ⚠️ IMPORTANT: Use camelCase for all properties!
 * Backend returns snake_case, but services/api.ts converts to camelCase automatically.
 */

export interface Habit {
  id: number;
  name: string;                 // Habit name (e.g., "Morning Run")
  icon: string;                 // Emoji icon
  color: string;                // Color identifier (e.g., "primary", "secondary")
  description?: string;         // Optional description
  frequency: 'daily' | 'weekly' | 'custom';  // How often to track
  targetDays?: number;          // For weekly/custom frequency
  reminderTime?: string;        // Time for notification (HH:mm format)
  reminderEnabled: boolean;     // Whether reminder is active
  streakCount: number;          // Current consecutive days
  longestStreak: number;        // Best streak record
  completedDates: string[];     // Array of completion dates (YYYY-MM-DD)
  totalCompletions: number;     // Total number of completions
  createdAt: string;
  updatedAt: string;
}

export interface HabitCheckIn {
  id: number;
  habitId: number;
  completedAt: string;          // ISO 8601 datetime
  note?: string;                // Optional note for this check-in
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitInput {
  name: string;
  icon?: string;                // Default: "✅"
  color?: string;               // Default: "primary"
  description?: string;
  frequency?: 'daily' | 'weekly' | 'custom';
  targetDays?: number;
  reminderTime?: string;
  reminderEnabled?: boolean;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'custom';
  targetDays?: number;
  reminderTime?: string;
  reminderEnabled?: boolean;
}

export interface CheckInHabitInput {
  habitId: number;
  note?: string;
}

export type HabitResponse = Habit;
export type HabitsResponse = Habit[];
export type HabitCheckInsResponse = HabitCheckIn[];
