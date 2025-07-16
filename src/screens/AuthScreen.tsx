import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  SafeAreaView, // <-- Add this import
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  withSequence,
} from "react-native-reanimated";

import { Ionicons } from "@expo/vector-icons";
import { AuthService } from "../services/authService";
import { useTheme } from "../hooks/useTheme";
import { COLORS } from "../constants/workouts";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedCard } from "../components/AnimatedCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

const { width, height } = Dimensions.get("window");

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isDark, colors } = useTheme();

  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const switchOpacity = useSharedValue(0);

  useEffect(() => {
    // Initial animations
    logoScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 800 });

    formTranslateY.value = withDelay(200, withSpring(0, { damping: 8 }));
    formOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    switchOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
  }, []);

  // Animation for mode switching
  useEffect(() => {
    formTranslateY.value = withSequence(
      withTiming(10, { duration: 150 }),
      withSpring(0, { damping: 8 })
    );
  }, [isSignUp]);

  const handleAuthentication = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);

    // Button animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 150 }),
      withSpring(1, { damping: 8 })
    );

    try {
      if (isSignUp) {
        await AuthService.signUp(email, password);
        Alert.alert("Success", "Account created successfully!");
      } else {
        const result = await AuthService.signIn(email, password);
        if (result.error) {
          let message = result.error;
          if (
            message.toLowerCase().includes("invalid") ||
            message.toLowerCase().includes("wrong") ||
            message.toLowerCase().includes("not found")
          ) {
            message = "Incorrect email or password. Please try again.";
          }
          Alert.alert("Error", message);
          return;
        }
      }
    } catch (error: any) {
      let message = error?.message || "An error occurred. Please try again.";
      if (
        message.toLowerCase().includes("invalid") ||
        message.toLowerCase().includes("wrong") ||
        message.toLowerCase().includes("not found")
      ) {
        message = "Incorrect email or password. Please try again.";
      }
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const switchAnimatedStyle = useAnimatedStyle(() => ({
    opacity: switchOpacity.value,
  }));

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
      padding: 20,
    },
    header: {
      alignItems: "center",
      marginBottom: 40,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    logoIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    logo: {
      fontSize: 32,
      fontWeight: "800",
      color: "white",
      marginBottom: 8,
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.9)",
      textAlign: "center",
      lineHeight: 24,
    },
    formCard: {
      backgroundColor: colors.surface, // Use theme surface color
      borderRadius: 20,
      padding: 30,
      marginBottom: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text, // Use theme text color
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface, // Use theme surface color
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 50,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text, // Use theme text color
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: "transparent",
    },
    eyeIcon: {
      marginLeft: 10,
      padding: 5,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginTop: 8,
    },
    forgotPasswordText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "500",
    },
    buttonContainer: {
      marginTop: 20,
    },
    button: {
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 16,
      minHeight: 50,
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 12,
      padding: 16,
    },
    switchText: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.9)",
    },
    switchButton: {
      fontSize: 16,
      color: "white",
      fontWeight: "700",
      marginLeft: 5,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <GradientBackground variant="primary" style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            {/* Header Animation */}
            <Animated.View style={[styles.header, logoAnimatedStyle]}>
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                  <Ionicons name="fitness" size={40} color="white" />
                </View>
                <Text style={styles.logo}>FitPulse</Text>
                <Text style={styles.subtitle}>
                  {isSignUp
                    ? "Join thousands of fitness enthusiasts"
                    : "Welcome back, champion!"}
                </Text>
              </View>
            </Animated.View>

            {/* Form Animation */}
            <AnimatedCard
              delay={300}
              style={styles.formCard}
              variant="elevated"
            >
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Input */}
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input (Sign Up only) */}
              {isSignUp && (
                <Animated.View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor={colors.textSecondary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* Forgot Password Link (Sign In only) */}
              {!isSignUp && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              )}

              {/* Button Animation */}
              <Animated.View
                style={[styles.buttonContainer, buttonAnimatedStyle]}
              >
                <TouchableOpacity
                  onPress={handleAuthentication}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      colors.gradient.primary as [string, string, ...string[]]
                    }
                    style={styles.button}
                  >
                    {isLoading ? (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <LoadingSpinner size={20} variant="white" />
                        <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                          Processing...
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.buttonText}>
                        {isSignUp ? "Create Account" : "Sign In"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </AnimatedCard>

            {/* Toggle Auth Mode - moved inside ScrollView */}
            <Animated.View
              style={[styles.switchContainer, switchAnimatedStyle]}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleAuthMode}>
                <Text style={styles.switchButton}>
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </GradientBackground>
    </SafeAreaView>
  );
};

export default AuthScreen;
