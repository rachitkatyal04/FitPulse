import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

import { Ionicons } from "@expo/vector-icons";

// Import types and services
import { WorkoutHistory } from "../types";
import { COLORS, ANIMATION_DURATION } from "../constants/workouts";
import { WorkoutStorageService } from "../storage/workoutStorage";
import { useTheme } from "../hooks/useTheme";

const { width } = Dimensions.get("window");

interface HistoryItemProps {
  workout: WorkoutHistory;
  index: number;
  onPress?: (workout: WorkoutHistory) => void;
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: string;
}

interface WeeklyCalendarProps {
  workouts: WorkoutHistory[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  workouts,
  selectedDate,
  onDateSelect,
}) => {
  const { colors } = useTheme();

  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(currentDate);
    }
    return weekDates;
  };

  const getWorkoutsForDate = (date: Date) => {
    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  const weekDates = getWeekDates(selectedDate);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    dayContainer: {
      alignItems: "center",
      flex: 1,
    },
    dayName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    dayButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    dayButtonSelected: {
      backgroundColor: colors.primary,
    },
    dayButtonToday: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    dayText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    dayTextSelected: {
      color: colors.background,
    },
    workoutIndicator: {
      position: "absolute",
      bottom: -6,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {selectedDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </Text>
      <View style={styles.weekRow}>
        {weekDates.map((date, index) => {
          const isSelected =
            date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          const hasWorkouts = getWorkoutsForDate(date).length > 0;

          return (
            <View key={index} style={styles.dayContainer}>
              <Text style={styles.dayName}>{dayNames[index]}</Text>
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonSelected,
                  isToday && !isSelected && styles.dayButtonToday,
                ]}
                onPress={() => onDateSelect(date)}
              >
                <Text
                  style={[styles.dayText, isSelected && styles.dayTextSelected]}
                >
                  {date.getDate()}
                </Text>
                {hasWorkouts && <View style={styles.workoutIndicator} />}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
}) => {
  const { colors } = useTheme();

  // Create gradient colors based on the main color
  const getGradientColors = (mainColor: string) => {
    const gradientMap: { [key: string]: [string, string, ...string[]] } = {
      [colors.primary]: [colors.primary, colors.secondary] as [
        string,
        string,
        ...string[]
      ],
      [colors.warning]: ["#FF6B35", "#F7931E"] as [string, string, ...string[]],
      [colors.success]: ["#4ECDC4", "#44A08D"] as [string, string, ...string[]],
    };
    return (
      gradientMap[mainColor] ||
      ([mainColor, mainColor + "80"] as [string, string, ...string[]])
    );
  };

  const styles = StyleSheet.create({
    card: {
      borderRadius: 20,
      marginHorizontal: 5,
      marginBottom: 16,
      flex: 1,
      aspectRatio: 0.85,
      elevation: 8,
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      overflow: "hidden",
    },
    gradient: {
      flex: 1,
      borderRadius: 20,
      padding: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    cardContent: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      width: "100%",
      height: "100%",
    },
    iconContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      borderRadius: 14,
      padding: 8,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      width: 36,
      height: 36,
    },
    contentContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingHorizontal: 4,
    },
    title: {
      fontSize: 9,
      color: "rgba(255, 255, 255, 0.85)",
      fontWeight: "600",
      marginBottom: 4,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      maxWidth: "90%",
    },
    value: {
      fontSize: 20,
      fontWeight: "900",
      color: "#FFFFFF",
      marginBottom: 2,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: "90%",
    },
    subtitle: {
      fontSize: 8,
      color: "rgba(255, 255, 255, 0.75)",
      fontWeight: "500",
      textAlign: "center",
      textTransform: "capitalize",
      maxWidth: "90%",
    },
  });

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={getGradientColors(color)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={16} color="#FFFFFF" />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const HistoryItem: React.FC<HistoryItemProps> = ({
  workout,
  index,
  onPress,
}) => {
  const { colors } = useTheme();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCompletionColor = (completed: number, total: number) => {
    const percentage = completed / total;
    if (percentage >= 1) return colors.success;
    if (percentage >= 0.7) return colors.warning;
    return colors.error;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    workoutInfo: {
      flex: 1,
    },
    workoutName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    workoutDate: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    workoutTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    statText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 6,
    },
    completionBadge: {
      backgroundColor: colors.success,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: "flex-start",
    },
    completionText: {
      fontSize: 12,
      color: colors.background,
      fontWeight: "500",
    },
    notes: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginTop: 8,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(workout)}
    >
      <View style={styles.header}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{workout.workoutName}</Text>
          <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
          <Text style={styles.workoutTime}>{formatTime(workout.date)}</Text>
        </View>
        <View
          style={[
            styles.completionBadge,
            {
              backgroundColor: getCompletionColor(
                workout.completedExercises,
                workout.totalExercises
              ),
            },
          ]}
        >
          <Text style={styles.completionText}>
            {workout.completedExercises}/{workout.totalExercises}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{workout.duration} min</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="fitness" size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>
            {workout.totalExercises} exercises
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={getCompletionColor(
              workout.completedExercises,
              workout.totalExercises
            )}
          />
          <Text style={styles.statText}>
            {Math.round(
              (workout.completedExercises / workout.totalExercises) * 100
            )}
            %
          </Text>
        </View>
      </View>

      {workout.notes && <Text style={styles.notes}>"{workout.notes}"</Text>}
    </TouchableOpacity>
  );
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<WorkoutHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    averageDuration: 0,
    streakDays: 0,
    mostFrequentWorkout: "",
  });

  const { isDark, colors } = useTheme();

  // Load history data when screen comes into focus (auto-sync after completing workouts)
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  useEffect(() => {
    filterHistory();
  }, [history, timeFilter, selectedDate]);

  const loadHistory = async () => {
    try {
      const workoutHistory = await WorkoutStorageService.getWorkoutHistory();
      const workoutStats = await WorkoutStorageService.getWorkoutStats();

      setHistory(workoutHistory);
      setStats(workoutStats);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const filterHistory = () => {
    let filtered = history;

    // First filter by time period
    if (timeFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = history.filter((workout) => workout.date >= weekAgo);
    } else if (timeFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = history.filter((workout) => workout.date >= monthAgo);
    }

    // Then filter by selected date if a specific date is selected
    if (selectedDate && timeFilter === "all") {
      const selectedDateString = selectedDate.toDateString();
      filtered = filtered.filter((workout) => {
        const workoutDate = new Date(workout.date);
        return workoutDate.toDateString() === selectedDateString;
      });
    }

    setFilteredHistory(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleWorkoutPress = (workout: WorkoutHistory) => {
    Alert.alert(
      workout.workoutName,
      `Completed on ${workout.date.toLocaleDateString()}\n\nDuration: ${
        workout.duration
      } minutes\nExercises: ${workout.completedExercises}/${
        workout.totalExercises
      }\n\n${workout.notes || "No notes"}`,
      [{ text: "OK" }]
    );
  };

  const clearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all workout history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await WorkoutStorageService.clearWorkoutHistory();
              await loadHistory();
            } catch (error) {
              console.error("Error clearing history:", error);
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
    },
    clearButton: {
      padding: 8,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      marginHorizontal: -5,
      alignItems: "center",
    },
    filterContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    filterTextActive: {
      color: colors.background,
    },
    content: {
      flex: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    listContent: {
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginHorizontal: 20,
      marginBottom: 16,
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <LinearGradient
        colors={
          [colors.primary + "15", colors.background] as [
            string,
            string,
            ...string[]
          ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Workout History</Text>
          {history.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
              <Ionicons
                name="trash-outline"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Total"
            value={stats.totalWorkouts.toString()}
            subtitle="Workouts"
            icon="fitness"
            color={colors.primary}
          />
          <StatsCard
            title="Streak"
            value={stats.streakDays.toString()}
            subtitle="Days"
            icon="flame"
            color={colors.warning}
          />
          <StatsCard
            title="Average"
            value={`${Math.round(stats.averageDuration)}m`}
            subtitle="Duration"
            icon="time"
            color={colors.success}
          />
        </View>
      </LinearGradient>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setTimeFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              timeFilter === "all" && styles.filterTextActive,
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === "week" && styles.filterButtonActive,
          ]}
          onPress={() => setTimeFilter("week")}
        >
          <Text
            style={[
              styles.filterText,
              timeFilter === "week" && styles.filterTextActive,
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === "month" && styles.filterButtonActive,
          ]}
          onPress={() => setTimeFilter("month")}
        >
          <Text
            style={[
              styles.filterText,
              timeFilter === "month" && styles.filterTextActive,
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Weekly Calendar */}
        {history.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <WeeklyCalendar
              workouts={history}
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                // When a specific date is selected, switch to "all" filter to show that date's workouts
                if (date.toDateString() !== new Date().toDateString()) {
                  setTimeFilter("all");
                }
              }}
            />
          </View>
        )}

        {/* Content */}
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {history.length === 0
                ? "No workouts yet"
                : selectedDate &&
                  timeFilter === "all" &&
                  selectedDate.toDateString() !== new Date().toDateString()
                ? "No exercise completed on this day"
                : "No workouts found"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {history.length === 0
                ? "Start your first workout to see your history here!"
                : selectedDate &&
                  timeFilter === "all" &&
                  selectedDate.toDateString() !== new Date().toDateString()
                ? `No workouts were completed on ${selectedDate.toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "long", day: "numeric" }
                  )}.`
                : "Try adjusting your filter or date selection."}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {timeFilter === "all" &&
              selectedDate &&
              selectedDate.toDateString() !== new Date().toDateString()
                ? `${selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}`
                : timeFilter === "all"
                ? "All Workouts"
                : timeFilter === "week"
                ? "This Week"
                : "This Month"}
              ({filteredHistory.length})
            </Text>
            <FlatList
              data={filteredHistory}
              renderItem={({ item, index }) => (
                <HistoryItem
                  workout={item}
                  index={index}
                  onPress={handleWorkoutPress}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
