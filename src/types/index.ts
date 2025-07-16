export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number; // in seconds, for time-based exercises
  restTime: number; // in seconds
  description?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  estimatedDuration: number; // in minutes
  category: "strength" | "cardio" | "flexibility" | "mixed";
  difficulty: "beginner" | "intermediate" | "advanced";
  imageUrl?: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutName: string;
  startTime: Date;
  endTime?: Date;
  completedExercises: number;
  totalExercises: number;
  isCompleted: boolean;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  workoutName: string;
  date: Date;
  duration: number; // in minutes
  completedExercises: number;
  totalExercises: number;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  voiceEnabled: boolean;
  reminderEnabled: boolean;
  reminderTime?: string;
}

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  Home: undefined;
  WorkoutDetail: { workout: Workout };
  History: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};
