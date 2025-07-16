import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../hooks/useTheme";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "white";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color,
  style,
  variant = "primary",
}) => {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1
    );

    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const getColors = () => {
    switch (variant) {
      case "primary":
        return colors.gradient.primary;
      case "secondary":
        return colors.gradient.secondary;
      case "white":
        return ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 1)"];
      default:
        return colors.gradient.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
    },
    spinner: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 3,
      borderColor: "transparent",
      borderTopColor: color || colors.primary,
    },
    gradientSpinner: {
      width: size,
      height: size,
      borderRadius: size / 2,
      padding: 3,
    },
    innerSpinner: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: size / 2,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={getColors() as [string, string, ...string[]]}
          style={styles.gradientSpinner}
        >
          <View style={styles.innerSpinner} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

// Pulse loading dots
export const PulseLoader: React.FC<{ size?: number; color?: string }> = ({
  size = 8,
  color,
}) => {
  const { colors } = useTheme();
  const dot1 = useSharedValue(0.5);
  const dot2 = useSharedValue(0.5);
  const dot3 = useSharedValue(0.5);

  useEffect(() => {
    const duration = 600;
    const delay = 200;

    dot1.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    dot2.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    dot3.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Stagger the animations
    setTimeout(() => {
      dot2.value = withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, delay);

    setTimeout(() => {
      dot3.value = withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, delay * 2);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: dot1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: dot2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: dot3.value }],
  }));

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color || colors.primary,
    marginHorizontal: 2,
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Animated.View style={[dotStyle, dot1Style]} />
      <Animated.View style={[dotStyle, dot2Style]} />
      <Animated.View style={[dotStyle, dot3Style]} />
    </View>
  );
};

// Skeleton loader
export const SkeletonLoader: React.FC<{
  width: number;
  height: number;
  style?: ViewStyle;
}> = ({ width, height, style }) => {
  const { colors } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmer.value, [0, 1], [-width, width]),
      },
    ],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: colors.border,
          borderRadius: 8,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            width: "100%",
            height: "100%",
            backgroundColor: colors.background,
            opacity: 0.6,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
};
