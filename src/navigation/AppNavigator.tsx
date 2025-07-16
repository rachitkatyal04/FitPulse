import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

// Import screens
import AuthScreen from "../screens/AuthScreen";
import HomeScreen from "../screens/HomeScreen";
import WorkoutDetailScreen from "../screens/WorkoutDetailScreen";
import HistoryScreen from "../screens/HistoryScreen";

// Import custom components
import { CustomTabBar } from "../components/CustomTabBar";

// Import types
import { RootStackParamList, MainTabParamList } from "../types";

// Import services
import { auth } from "../services/firebase";
import { useTheme } from "../hooks/useTheme";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator using custom tab bar that properly syncs with theme
function MainTabNavigator() {
  const { isDark } = useTheme(); // Ensure theme is consumed here

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <CustomTabBar {...props} key={isDark ? "dark" : "light"} />
      )} // Pass key to force re-mount on theme change
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Workouts",
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "History",
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark, colors, preferences, isLoading: themeLoading } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading || themeLoading) {
    return null;
  }

  // Create navigation theme using the same pattern as HomeScreen
  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
    fonts: {
      regular: {
        fontFamily: "System",
        fontWeight: "400" as const,
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500" as const,
      },
      bold: {
        fontFamily: "System",
        fontWeight: "700" as const,
      },
      heavy: {
        fontFamily: "System",
        fontWeight: "900" as const,
      },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
          },
          headerTintColor: colors.text,
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WorkoutDetail"
              component={WorkoutDetailScreen}
              options={{
                title: "Workout Detail",
                headerBackTitle: "",
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
