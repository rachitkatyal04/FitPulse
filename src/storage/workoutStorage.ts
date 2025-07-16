import AsyncStorage from "@react-native-async-storage/async-storage";
import { WorkoutHistory, WorkoutSession, UserPreferences } from "../types";
import { firestore } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { AuthService } from "../services/authService";

// Storage keys
const STORAGE_KEYS = {
  WORKOUT_HISTORY: "workout_history",
  USER_PREFERENCES: "user_preferences",
  CURRENT_SESSION: "current_session",
};

export class WorkoutStorageService {
  // Workout History Management
  static async saveWorkoutHistory(history: WorkoutHistory): Promise<void> {
    try {
      const existingHistory = await this.getWorkoutHistory();
      const updatedHistory = [...existingHistory, history];
      await AsyncStorage.setItem(
        STORAGE_KEYS.WORKOUT_HISTORY,
        JSON.stringify(updatedHistory)
      );
      // Also save to Firestore if user is logged in
      const user = AuthService.getCurrentUser();
      if (user) {
        await addDoc(collection(firestore, "workout_history"), {
          ...history,
          userId: user.uid,
          date:
            history.date instanceof Date
              ? history.date.toISOString()
              : history.date,
        });
      }
    } catch (error) {
      console.error("Error saving workout history:", error);
    }
  }

  static async getWorkoutHistory(): Promise<WorkoutHistory[]> {
    try {
      // If user is logged in, fetch from Firestore
      const user = AuthService.getCurrentUser();
      if (user) {
        const q = query(
          collection(firestore, "workout_history"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const history: WorkoutHistory[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Ensure all WorkoutHistory fields are present
          history.push({
            id: data.id || doc.id,
            workoutId: data.workoutId || "",
            workoutName: data.workoutName || "",
            date: new Date(data.date),
            duration: data.duration || 0,
            completedExercises: data.completedExercises || 0,
            totalExercises: data.totalExercises || 0,
            notes: data.notes || "",
          });
        });
        // Optionally, update local cache
        await AsyncStorage.setItem(
          STORAGE_KEYS.WORKOUT_HISTORY,
          JSON.stringify(history)
        );
        return history;
      }
      const historyString = await AsyncStorage.getItem(
        STORAGE_KEYS.WORKOUT_HISTORY
      );
      if (historyString) {
        const history = JSON.parse(historyString);
        // Convert date strings back to Date objects
        return history.map((item: any) => ({
          ...item,
          date: new Date(item.date),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getting workout history:", error);
      return [];
    }
  }

  static async clearWorkoutHistory(): Promise<void> {
    try {
      // If user is logged in, delete from Firestore
      const user = AuthService.getCurrentUser();
      if (user) {
        const q = query(
          collection(firestore, "workout_history"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const batchDeletes: Promise<void>[] = [];
        querySnapshot.forEach((docSnap) => {
          batchDeletes.push(
            deleteDoc(doc(firestore, "workout_history", docSnap.id))
          );
        });
        await Promise.all(batchDeletes);
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.WORKOUT_HISTORY);
    } catch (error) {
      console.error("Error clearing workout history:", error);
    }
  }

  static async getRecentWorkouts(
    limit: number = 10
  ): Promise<WorkoutHistory[]> {
    const history = await this.getWorkoutHistory();
    return history
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  static async getWorkoutsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutHistory[]> {
    const history = await this.getWorkoutHistory();
    return history.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  }

  // Current Session Management
  static async saveCurrentSession(session: WorkoutSession): Promise<void> {
    try {
      const sessionData = {
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_SESSION,
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.error("Error saving current session:", error);
    }
  }

  static async getCurrentSession(): Promise<WorkoutSession | null> {
    try {
      const sessionString = await AsyncStorage.getItem(
        STORAGE_KEYS.CURRENT_SESSION
      );
      if (sessionString) {
        const session = JSON.parse(sessionString);
        return {
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting current session:", error);
      return null;
    }
  }

  static async clearCurrentSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    } catch (error) {
      console.error("Error clearing current session:", error);
    }
  }

  // User Preferences Management
  static async saveUserPreferences(
    preferences: UserPreferences
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
  }

  static getUserPreferences(): UserPreferences {
    try {
      // This method needs to be synchronous for the current usage
      // We'll use a cached version or default preferences
      return {
        theme: "system",
        soundEnabled: true,
        voiceEnabled: true,
        reminderEnabled: false,
      };
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return {
        theme: "system",
        soundEnabled: true,
        voiceEnabled: true,
        reminderEnabled: false,
      };
    }
  }

  static async getUserPreferencesAsync(): Promise<UserPreferences> {
    try {
      const preferencesString = await AsyncStorage.getItem(
        STORAGE_KEYS.USER_PREFERENCES
      );
      if (preferencesString) {
        return JSON.parse(preferencesString);
      }
      // Return default preferences
      return {
        theme: "system",
        soundEnabled: true,
        voiceEnabled: true,
        reminderEnabled: false,
      };
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return {
        theme: "system",
        soundEnabled: true,
        voiceEnabled: true,
        reminderEnabled: false,
      };
    }
  }

  // Statistics and Analytics
  static async getWorkoutStats(): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    averageDuration: number;
    mostFrequentWorkout: string;
    streakDays: number;
  }> {
    const history = await this.getWorkoutHistory();

    if (history.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        mostFrequentWorkout: "",
        streakDays: 0,
      };
    }

    const totalWorkouts = history.length;
    const totalDuration = history.reduce(
      (sum, workout) => sum + workout.duration,
      0
    );
    const averageDuration = totalDuration / totalWorkouts;

    // Find most frequent workout
    const workoutCounts = history.reduce((counts, workout) => {
      counts[workout.workoutName] = (counts[workout.workoutName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostFrequentWorkout =
      Object.entries(workoutCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "";

    // Calculate streak days
    const streakDays = this.calculateStreakDays(history);

    return {
      totalWorkouts,
      totalDuration,
      averageDuration,
      mostFrequentWorkout,
      streakDays,
    };
  }

  private static calculateStreakDays(history: WorkoutHistory[]): number {
    if (history.length === 0) return 0;

    const sortedHistory = history.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < sortedHistory.length; i++) {
      const workoutDate = new Date(sortedHistory[i].date);
      workoutDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      if (workoutDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (workoutDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }
}
