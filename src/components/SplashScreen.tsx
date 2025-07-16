import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, StatusBar } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { colors } = useTheme();

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const pulseScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    const animateSequence = async () => {
      // Logo animation
      logoScale.value = withSpring(1, { damping: 8, stiffness: 100 });
      logoOpacity.value = withTiming(1, { duration: 800 });

      // Icon rotation
      iconRotation.value = withSequence(
        withDelay(500, withTiming(360, { duration: 1000 })),
        withTiming(0, { duration: 0 })
      );

      // Text animation
      textOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
      textTranslateY.value = withDelay(600, withSpring(0, { damping: 8 }));

      // Pulse animation
      pulseScale.value = withDelay(
        800,
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        )
      );

      // Progress bar animation
      progressWidth.value = withDelay(
        1000,
        withTiming(width * 0.8, { duration: 1500 })
      );

      // Finish animation
      setTimeout(() => {
        runOnJS(onFinish)();
      }, 3000);
    };

    animateSequence();
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={colors.gradient.primary as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Animated.View style={[styles.iconContainer, pulseAnimatedStyle]}>
              <Animated.View style={iconAnimatedStyle}>
                <Ionicons name="fitness" size={80} color="white" />
              </Animated.View>
            </Animated.View>
          </Animated.View>

          {/* Text Section */}
          <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
            <Text style={styles.title}>FitPulse</Text>
            <Text style={styles.subtitle}>
              Your Fitness Journey Starts Here
            </Text>
          </Animated.View>

          {/* Loading Section */}
          <Animated.View style={[styles.loadingContainer, textAnimatedStyle]}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, progressAnimatedStyle]}
              />
            </View>
            <Text style={styles.loadingText}>Loading...</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "white",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
  },
  progressBar: {
    width: width * 0.8,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 16,
    letterSpacing: 1,
  },
});
