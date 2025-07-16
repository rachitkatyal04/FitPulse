import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/hooks/useTheme";
import { SplashScreen } from "./src/components/SplashScreen";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const splashOpacity = useSharedValue(1);
  const appOpacity = useSharedValue(0);
  const appScale = useSharedValue(0.95);

  const handleSplashFinish = () => {
    // Animate splash screen out
    splashOpacity.value = withTiming(0, { duration: 800 });

    // Animate main app in
    appOpacity.value = withTiming(1, { duration: 800 });
    appScale.value = withSpring(1, { damping: 8, stiffness: 100 });

    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const splashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
    transform: [{ scale: splashOpacity.value }],
  }));

  const appAnimatedStyle = useAnimatedStyle(() => ({
    opacity: appOpacity.value,
    transform: [{ scale: appScale.value }],
  }));

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={styles.container}>
        {/* Main App */}
        <Animated.View style={[styles.appContainer, appAnimatedStyle]}>
          <AppNavigator />
        </Animated.View>

        {/* Splash Screen Overlay */}
        {isLoading && (
          <Animated.View style={[styles.splashContainer, splashAnimatedStyle]}>
            <SplashScreen onFinish={handleSplashFinish} />
          </Animated.View>
        )}
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
  },
  splashContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
