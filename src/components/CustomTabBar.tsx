import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  runOnUI,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

const { width } = Dimensions.get("window");

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: CustomTabBarProps) {
  if (!state?.routes || state.routes.length === 0) {
    return null;
  }
  const { isDark, colors } = useTheme();
  const indicatorPosition = useSharedValue(0);
  const tabWidth = width / state.routes.length;

  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 15,
      stiffness: 120,
    });
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
    },
    tabBar: {
      flexDirection: "row",
      paddingBottom: 8,
      paddingTop: 12,
      height: 70,
      position: "relative",
    },
    indicator: {
      position: "absolute",
      top: 0,
      left: 0,
      width: tabWidth,
      height: 3,
      borderRadius: 2,
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    activeIconContainer: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: "600",
      textAlign: "center",
    },
  });

  const TabItem = ({
    route,
    index,
    isFocused,
  }: {
    route: any;
    index: number;
    isFocused: boolean;
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
      scale.value = withSpring(isFocused ? 1.1 : 1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(isFocused ? 1 : 0.6, {
        duration: 200,
      });
    }, [isFocused]);

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    const getIconName = (): keyof typeof Ionicons.glyphMap => {
      if (route.name === "Home") {
        return isFocused ? "home" : "home-outline";
      } else if (route.name === "History") {
        return isFocused ? "calendar" : "calendar-outline";
      } else {
        return isFocused ? "settings" : "settings-outline";
      }
    };

    const getLabel = () => {
      const { options } = descriptors[route.key];
      return options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const iconContainerStyle = useAnimatedStyle(() => {
      return {
        backgroundColor: "transparent",
        borderRadius: 12,
        padding: 4,
      };
    });

    return (
      <AnimatedTouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={
          descriptors[route.key].options.tabBarAccessibilityLabel
        }
        testID={descriptors[route.key].options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.tabItem, animatedStyle]}
      >
        <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
          <Ionicons
            name={getIconName()}
            size={24}
            color={isFocused ? colors.primary : colors.textSecondary}
          />
        </Animated.View>
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? colors.primary : colors.textSecondary },
          ]}
        >
          {getLabel()}
        </Text>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        {/* Animated Indicator */}
        <Animated.View style={[styles.indicator, indicatorStyle]}>
          <LinearGradient
            colors={colors.gradient.primary as [string, string, ...string[]]}
            style={{ flex: 1, borderRadius: 2 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>

        {/* Tab Items */}
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
}
