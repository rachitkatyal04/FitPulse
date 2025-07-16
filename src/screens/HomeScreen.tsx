import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

// Import types and services
import { RootStackParamList, Workout } from "../types";
import {
  SAMPLE_WORKOUTS,
  COLORS,
  ANIMATION_DURATION,
} from "../constants/workouts";
import { WorkoutStorageService } from "../storage/workoutStorage";
import { AuthService } from "../services/authService";
import { useTheme } from "../hooks/useTheme";

const { width } = Dimensions.get("window");

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface WorkoutCardProps {
  workout: Workout;
  index: number;
  onPress: (workout: Workout) => void;
  isDark: boolean;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  index,
  onPress,
  isDark,
}) => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  const [isPressed, setIsPressed] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return colors.success;
      case "intermediate":
        return colors.warning;
      case "advanced":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength":
        return "barbell-outline";
      case "cardio":
        return "heart-outline";
      case "flexibility":
        return "body-outline";
      case "mixed":
        return "fitness-outline";
      default:
        return "fitness-outline";
    }
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 20,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardPressed: {
      transform: [{ scale: 0.98 }],
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
    },
    categoryIcon: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 8,
      marginLeft: 12,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    infoText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    exerciseCount: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(workout)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {workout.name}
        </Text>
        <View style={styles.categoryIcon}>
          <Ionicons
            name={getCategoryIcon(workout.category) as any}
            size={20}
            color="white"
          />
        </View>
      </View>

      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
        {workout.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.cardInfo}>
          <View style={styles.infoItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {workout.estimatedDuration} min
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="list-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {workout.exercises.length} exercises
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.difficultyBadge,
            { borderColor: getDifficultyColor(workout.difficulty) },
          ]}
        >
          <Text
            style={[
              styles.difficultyText,
              { color: getDifficultyColor(workout.difficulty) },
            ]}
          >
            {workout.difficulty}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [workouts] = useState<Workout[]>(SAMPLE_WORKOUTS);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    streakDays: 0,
    recentWorkouts: [] as any[],
  });

  const { isDark, colors, preferences, updatePreferences } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    const workoutStats = await WorkoutStorageService.getWorkoutStats();
    const recentWorkouts = await WorkoutStorageService.getRecentWorkouts(3);
    setStats({
      totalWorkouts: workoutStats.totalWorkouts,
      streakDays: workoutStats.streakDays,
      recentWorkouts,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    loadStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleWorkoutPress = (workout: Workout) => {
    navigation.navigate("WorkoutDetail", { workout });
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await AuthService.signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          });
        },
      },
    ]);
  };

  const toggleTheme = async () => {
    const newTheme =
      preferences.theme === "light"
        ? "dark"
        : preferences.theme === "dark"
        ? "system"
        : "light";

    await updatePreferences({
      ...preferences,
      theme: newTheme,
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    greeting: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
    },
    greetingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    themeToggleButton: {
      padding: 8,
      marginRight: 8,
    },
    signOutButton: {
      padding: 8,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 12,
    },
    recentWorkoutItem: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginBottom: 8,
      padding: 16,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    recentWorkoutInfo: {
      flex: 1,
    },
    recentWorkoutName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    recentWorkoutDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    recentWorkoutStats: {
      alignItems: "flex-end",
    },
    recentWorkoutDuration: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.primary,
    },
    recentWorkoutCompletion: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Ready to Train?</Text>
            <Text style={styles.greetingSubtitle}>
              Let's crush your fitness goals!
            </Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.themeToggleButton}
              onPress={toggleTheme}
            >
              <Ionicons
                name={
                  preferences.theme === "light"
                    ? "sunny-outline"
                    : preferences.theme === "dark"
                    ? "moon-outline"
                    : "contrast-outline"
                }
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.recentWorkouts.length}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Recent Workouts */}
        {stats.recentWorkouts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            {stats.recentWorkouts.map((workout, index) => (
              <View key={workout.id} style={styles.recentWorkoutItem}>
                <View style={styles.recentWorkoutInfo}>
                  <Text style={styles.recentWorkoutName}>
                    {workout.workoutName}
                  </Text>
                  <Text style={styles.recentWorkoutDate}>
                    {new Date(workout.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.recentWorkoutStats}>
                  <Text style={styles.recentWorkoutDuration}>
                    {workout.duration} min
                  </Text>
                  <Text style={styles.recentWorkoutCompletion}>
                    {workout.completedExercises}/{workout.totalExercises}{" "}
                    exercises
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Available Workouts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Workouts</Text>
          <Text style={styles.sectionSubtitle}>{workouts.length} workouts</Text>
        </View>

        {workouts.map((workout, index) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            index={index}
            onPress={handleWorkoutPress}
            isDark={isDark}
          />
        ))}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
