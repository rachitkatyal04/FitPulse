import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { Appearance } from "react-native";
import { WorkoutStorageService } from "../storage/workoutStorage";
import { COLORS } from "../constants/workouts";
import { UserPreferences } from "../types";

const defaultPreferences: UserPreferences = {
  theme: "system",
  soundEnabled: true,
  voiceEnabled: true,
  reminderEnabled: false,
};

interface ThemeContextType {
  preferences: UserPreferences;
  isDark: boolean;
  colors: typeof COLORS.light;
  updatePreferences: (prefs: UserPreferences) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [systemTheme, setSystemTheme] = useState(Appearance.getColorScheme());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load preferences on mount
    const loadPreferences = async () => {
      try {
        const savedPreferences =
          await WorkoutStorageService.getUserPreferencesAsync();
        setPreferences(savedPreferences);
      } catch (error) {
        console.error("Error loading preferences:", error);
        setPreferences(defaultPreferences);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const isDark =
    preferences.theme === "dark" ||
    (preferences.theme === "system" && systemTheme === "dark");

  const colors = isDark ? COLORS.dark : COLORS.light;

  const updatePreferences = async (newPreferences: UserPreferences) => {
    try {
      setPreferences(newPreferences);
      await WorkoutStorageService.saveUserPreferences(newPreferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ preferences, isDark, colors, updatePreferences, isLoading }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
