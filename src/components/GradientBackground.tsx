import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../hooks/useTheme";

interface GradientBackgroundProps {
  children: ReactNode;
  colors?: string[];
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "purple"
    | "blue"
    | "pink"
    | "orange"
    | "teal";
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  variant = "primary",
}) => {
  const { colors: themeColors } = useTheme();

  const gradientColors = colors || themeColors.gradient[variant];

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      start={start}
      end={end}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
