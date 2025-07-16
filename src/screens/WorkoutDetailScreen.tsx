import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Vibration,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Speech from "expo-speech";

// Import types and services
import {
  RootStackParamList,
  Workout,
  Exercise,
  WorkoutHistory,
  WorkoutSession,
} from "../types";
import { COLORS, ANIMATION_DURATION, APP_CONFIG } from "../constants/workouts";
import { WorkoutStorageService } from "../storage/workoutStorage";
import { useTheme } from "../hooks/useTheme";

const { width } = Dimensions.get("window");

type WorkoutDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "WorkoutDetail"
>;
type WorkoutDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "WorkoutDetail"
>;

type WorkoutState = "ready" | "active" | "resting" | "paused" | "completed";

export default function WorkoutDetailScreen() {
  const navigation = useNavigation<WorkoutDetailScreenNavigationProp>();
  const route = useRoute<WorkoutDetailScreenRouteProp>();
  const { workout } = route.params;

  // Main state variables
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [workoutState, setWorkoutState] = useState<WorkoutState>("ready");
  const [timeLeft, setTimeLeft] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<boolean[]>(
    new Array(workout.exercises.length).fill(false)
  );
  const [lastVoiceTime, setLastVoiceTime] = useState<number>(-1);

  const { isDark, colors, preferences } = useTheme();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeRef = useRef<NodeJS.Timeout | null>(null);

  // Current exercise reference
  const currentExercise = workout.exercises[currentExerciseIndex];

  // Timer effect
  useEffect(() => {
    if (workoutState === "active" || workoutState === "resting") {
      if (timeLeft > 0) {
        intervalRef.current = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime <= 1) {
              handleTimerEnd();
              return 0;
            }

            const newTime = prevTime - 1;

            // Voice countdown for last 10 seconds - speak the time that will be shown
            if (
              newTime <= 10 &&
              newTime > 0 &&
              preferences.voiceEnabled &&
              newTime !== lastVoiceTime
            ) {
              Speech.speak(newTime.toString(), { rate: 1.2 });
              setLastVoiceTime(newTime);
            }

            return newTime;
          });
        }, 1000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [workoutState, timeLeft, lastVoiceTime, preferences.voiceEnabled]);

  // Elapsed time tracker
  useEffect(() => {
    if (workoutState === "active" || workoutState === "resting") {
      elapsedTimeRef.current = setInterval(() => {
        setTotalElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (elapsedTimeRef.current) {
        clearInterval(elapsedTimeRef.current);
      }
    }

    return () => {
      if (elapsedTimeRef.current) {
        clearInterval(elapsedTimeRef.current);
      }
    };
  }, [workoutState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (elapsedTimeRef.current) clearInterval(elapsedTimeRef.current);
    };
  }, []);

  const handleTimerEnd = () => {
    Vibration.vibrate(500);

    if (workoutState === "resting") {
      // Rest period ended, move to next set or exercise
      if (currentSet >= currentExercise.sets) {
        // All sets completed for this exercise, move to next
        moveToNextExercise();
      } else {
        const nextSet = currentSet + 1;
        setCurrentSet(nextSet);
        startExercise(nextSet);
      }
    } else if (workoutState === "active") {
      // Exercise period ended, start rest or move to next
      if (currentSet >= currentExercise.sets) {
        // All sets completed for this exercise
        const newCompleted = [...completedExercises];
        newCompleted[currentExerciseIndex] = true;
        setCompletedExercises(newCompleted);

        if (currentExerciseIndex >= workout.exercises.length - 1) {
          // All exercises completed - pass the updated completion array
          completeWorkout(newCompleted);
        } else {
          startRest();
        }
      } else {
        // More sets to go
        startRest();
      }
    }
  };

  const startWorkout = () => {
    if (!workoutStartTime) {
      setWorkoutStartTime(new Date());
    }
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    startExercise();
  };

  const startExercise = (setNumber?: number) => {
    const exercise = workout.exercises[currentExerciseIndex];
    const duration = exercise.duration || 30; // Default 30 seconds for strength exercises
    const currentSetNumber = setNumber || currentSet;

    // Reset voice tracking for new exercise
    setLastVoiceTime(-1);

    setTimeLeft(duration);
    setWorkoutState("active");

    if (preferences.voiceEnabled) {
      // Stop any current speech before starting new one
      Speech.stop();
      setTimeout(() => {
        Speech.speak(`${exercise.name}, set ${currentSetNumber}`, {
          rate: 1.0,
        });
      }, 100);
    }
  };

  const startRest = () => {
    const restTime = currentExercise.restTime || 60;

    // Reset voice tracking for rest period
    setLastVoiceTime(-1);

    setTimeLeft(restTime);
    setWorkoutState("resting");

    if (preferences.voiceEnabled) {
      // Stop any current speech before starting new one
      Speech.stop();
      setTimeout(() => {
        Speech.speak(`Rest for ${restTime} seconds`, { rate: 1.0 });
      }, 100);
    }
  };

  const markExerciseComplete = () => {
    const newCompleted = [...completedExercises];
    newCompleted[currentExerciseIndex] = true;
    setCompletedExercises(newCompleted);
  };

  const moveToNextExercise = () => {
    // Exercise should already be marked as complete when this is called
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setWorkoutState("ready");
    }
    // Do not call completeWorkout here; let handleTimerEnd handle it
  };

  const completeWorkout = async (finalCompletedExercises?: boolean[]) => {
    setWorkoutState("completed");

    if (preferences.voiceEnabled) {
      Speech.speak("Workout completed! Great job!", { rate: 1.0 });
    }

    // Use the passed array or current state
    const completedArray = finalCompletedExercises || completedExercises;
    const completedCount = completedArray.filter(Boolean).length;

    // Save workout to history
    const workoutHistory: WorkoutHistory = {
      id: Date.now().toString(),
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date(),
      duration: Math.floor(totalElapsedTime / 60), // Convert to minutes
      completedExercises: completedCount,
      totalExercises: workout.exercises.length,
      notes: `Completed ${completedCount}/${workout.exercises.length} exercises`,
    };

    try {
      await WorkoutStorageService.saveWorkoutHistory(workoutHistory);

      Alert.alert(
        "Workout Complete!",
        `Great job! You completed ${completedCount} out of ${
          workout.exercises.length
        } exercises in ${Math.floor(totalElapsedTime / 60)} minutes.`,
        [
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Error saving workout history:", error);
      Alert.alert(
        "Workout Complete!",
        "Great job! Your workout has been completed.",
        [{ text: "Done", onPress: () => navigation.goBack() }]
      );
    }
  };

  const pauseWorkout = () => {
    if (workoutState === "active" || workoutState === "resting") {
      // Stop any current speech when pausing
      if (preferences.voiceEnabled) {
        Speech.stop();
      }
      setWorkoutState("paused");
    }
  };

  const resumeWorkout = () => {
    if (workoutState === "paused") {
      // Resume with the same state we were in before pausing
      setWorkoutState("active");
    }
  };

  const skipExercise = () => {
    // Stop any current speech
    if (preferences.voiceEnabled) {
      Speech.stop();
    }

    // Reset voice tracking
    setLastVoiceTime(-1);

    if (currentExerciseIndex < workout.exercises.length - 1) {
      // If we're in rest state, the current exercise was already completed
      // If we're in active state, we're skipping an incomplete exercise
      // In both cases, we move to the next exercise
      const nextIndex = currentExerciseIndex + 1;
      const nextExercise = workout.exercises[nextIndex];
      const duration = nextExercise.duration || 30;

      // Update state first
      setCurrentExerciseIndex(nextIndex);
      setCurrentSet(1);
      setTimeLeft(duration);
      setWorkoutState("active");

      // Then announce the exercise with a small delay to ensure state is updated
      if (preferences.voiceEnabled) {
        setTimeout(() => {
          Speech.speak(`${nextExercise.name}, set 1`, { rate: 1.0 });
        }, 100);
      }
    } else {
      // This was the last exercise, complete the workout
      completeWorkout(completedExercises);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = (): number => {
    return currentExerciseIndex / workout.exercises.length;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    backButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    workoutTitleContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    workoutTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    // Exercise Preview Section (shown before workout starts)
    previewSection: {
      marginBottom: 30,
    },
    previewTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    workoutOverview: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    overviewRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    overviewLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    overviewValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    exercisesList: {
      marginBottom: 10,
    },
    exercisePreviewItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    exercisePreviewNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    exercisePreviewNumberText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.background,
    },
    exercisePreviewContent: {
      flex: 1,
    },
    exercisePreviewName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    exercisePreviewDetails: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    exercisePreviewDuration: {
      fontSize: 12,
      color: colors.primary,
      marginTop: 2,
    },
    // Active workout section (shown during workout)
    progressContainer: {
      marginBottom: 30,
    },
    progressText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 10,
      textAlign: "center",
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.surface,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    timerContainer: {
      alignItems: "center",
      marginBottom: 30,
    },
    timerCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 4,
      borderColor:
        workoutState === "active"
          ? colors.primary
          : workoutState === "resting"
          ? colors.warning
          : workoutState === "paused"
          ? colors.textSecondary
          : colors.border,
    },
    timerText: {
      fontSize: 36,
      fontWeight: "bold",
      color: colors.text,
    },
    timerLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    exerciseCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    exerciseName: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    exerciseNumber: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    exerciseInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    exerciseDetail: {
      fontSize: 16,
      color: colors.textSecondary,
      marginRight: 20,
    },
    exerciseDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    controls: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 15,
      marginBottom: 15,
    },
    controlButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      minWidth: 100,
      alignItems: "center",
    },
    controlButtonSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    controlButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
    controlButtonTextSecondary: {
      color: colors.text,
    },
    stats: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  const getTotalWorkoutTime = () => {
    return workout.exercises.reduce((total, exercise) => {
      const exerciseTime = (exercise.duration || 30) * exercise.sets;
      const restTime = exercise.restTime * (exercise.sets - 1);
      return total + exerciseTime + restTime;
    }, 0);
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{workout.name}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {workoutState === "ready" ? (
          // Exercise Preview Section (Before Workout Starts)
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Workout Overview</Text>

            {/* Workout Stats */}
            <View style={styles.workoutOverview}>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>Total Exercises</Text>
                <Text style={styles.overviewValue}>
                  {workout.exercises.length}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>Estimated Duration</Text>
                <Text style={styles.overviewValue}>
                  {Math.floor(getTotalWorkoutTime() / 60)} minutes
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>Difficulty</Text>
                <Text
                  style={[
                    styles.overviewValue,
                    {
                      color:
                        workout.difficulty === "beginner"
                          ? colors.success
                          : workout.difficulty === "intermediate"
                          ? colors.warning
                          : colors.error,
                    },
                  ]}
                >
                  {workout.difficulty.charAt(0).toUpperCase() +
                    workout.difficulty.slice(1)}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>Category</Text>
                <Text style={styles.overviewValue}>
                  {workout.category.charAt(0).toUpperCase() +
                    workout.category.slice(1)}
                </Text>
              </View>
            </View>

            {/* Exercise List */}
            <View style={styles.exercisesList}>
              {workout.exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exercisePreviewItem}>
                  <View style={styles.exercisePreviewNumber}>
                    <Text style={styles.exercisePreviewNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.exercisePreviewContent}>
                    <Text style={styles.exercisePreviewName}>
                      {exercise.name}
                    </Text>
                    <Text style={styles.exercisePreviewDetails}>
                      {exercise.sets} sets ×{" "}
                      {typeof exercise.reps === "number" ? exercise.reps : "—"}{" "}
                      reps • {exercise.restTime}s rest
                    </Text>
                    {exercise.duration && (
                      <Text style={styles.exercisePreviewDuration}>
                        {exercise.duration} seconds per set
                      </Text>
                    )}
                    {exercise.description && (
                      <Text
                        style={[
                          styles.exercisePreviewDetails,
                          { marginTop: 4, fontStyle: "italic" },
                        ]}
                      >
                        {exercise.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Start Button */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={startWorkout}
              >
                <Text style={styles.controlButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Active Workout Section (During Workout)
          <>
            {/* Progress */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Exercise {currentExerciseIndex + 1} of{" "}
                {workout.exercises.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getProgress() * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
              <Text style={styles.timerLabel}>
                {workoutState === "active"
                  ? `Set ${currentSet} of ${currentExercise.sets}`
                  : workoutState === "resting"
                  ? "Rest time"
                  : workoutState === "paused"
                  ? "Paused"
                  : "Completed!"}
              </Text>
            </View>

            {/* Current Exercise */}
            <View style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{currentExercise.name}</Text>
                <Text style={styles.exerciseNumber}>
                  {currentExerciseIndex + 1}/{workout.exercises.length}
                </Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseDetail}>
                  {currentExercise.sets} sets ×{" "}
                  {typeof currentExercise.reps === "number"
                    ? currentExercise.reps
                    : "—"}{" "}
                  reps
                </Text>
                <Text style={styles.exerciseDetail}>
                  {currentExercise.restTime}s rest
                </Text>
              </View>
              {currentExercise.description && (
                <Text style={styles.exerciseDescription}>
                  {currentExercise.description}
                </Text>
              )}
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              {(workoutState === "active" || workoutState === "resting") && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      styles.controlButtonSecondary,
                    ]}
                    onPress={pauseWorkout}
                  >
                    <Text
                      style={[
                        styles.controlButtonText,
                        styles.controlButtonTextSecondary,
                      ]}
                    >
                      Pause
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      styles.controlButtonSecondary,
                    ]}
                    onPress={skipExercise}
                  >
                    <Text
                      style={[
                        styles.controlButtonText,
                        styles.controlButtonTextSecondary,
                      ]}
                    >
                      Skip
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {workoutState === "paused" && (
                <>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={resumeWorkout}
                  >
                    <Text style={styles.controlButtonText}>Resume</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      styles.controlButtonSecondary,
                    ]}
                    onPress={skipExercise}
                  >
                    <Text
                      style={[
                        styles.controlButtonText,
                        styles.controlButtonTextSecondary,
                      ]}
                    >
                      Skip
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Stats */}
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatTime(totalElapsedTime)}
                </Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {completedExercises.filter(Boolean).length}/
                  {workout.exercises.length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {currentSet}/{currentExercise.sets}
                </Text>
                <Text style={styles.statLabel}>Current Set</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
