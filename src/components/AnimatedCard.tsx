import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../hooks/useTheme";

interface AnimatedCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  delay?: number;
  disabled?: boolean;
  variant?: "elevated" | "outlined" | "gradient";
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  delay = 0,
  disabled = false,
  variant = "elevated",
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withSpring(0, { damping: 8, stiffness: 100 });
    }, delay);
  }, [delay]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getCardStyle = () => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: colors.surface,
          borderRadius: 16,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        };
      case "outlined":
        return {
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case "gradient":
        return {
          borderRadius: 16,
          overflow: "hidden" as const,
        };
      default:
        return {};
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={1}
      >
        <Animated.View
          style={[styles.card, getCardStyle(), animatedStyle, style]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[styles.card, getCardStyle(), animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 8,
  },
});
