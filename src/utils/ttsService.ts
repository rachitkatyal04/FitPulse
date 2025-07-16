import * as Speech from "expo-speech";
import { WorkoutStorageService } from "../storage/workoutStorage";

export class TTSService {
  private static isInitialized = false;
  private static voices: Speech.Voice[] = [];

  static async initialize() {
    if (this.isInitialized) return;

    try {
      this.voices = await Speech.getAvailableVoicesAsync();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize TTS:", error);
    }
  }

  static async speak(text: string, options: Speech.SpeechOptions = {}) {
    const preferences = await WorkoutStorageService.getUserPreferencesAsync();

    if (!preferences.voiceEnabled) {
      return;
    }

    try {
      await this.initialize();

      const defaultOptions: Speech.SpeechOptions = {
        language: "en-US",
        pitch: 1.0,
        rate: 1.0,
        voice: this.getPreferredVoice(),
        ...options,
      };

      await Speech.speak(text, defaultOptions);
    } catch (error) {
      console.error("TTS Error:", error);
    }
  }

  static async stop() {
    try {
      await Speech.stop();
    } catch (error) {
      console.error("Error stopping TTS:", error);
    }
  }

  static getPreferredVoice(): string | undefined {
    if (!this.voices.length) return undefined;

    // Try to find a clear, English voice
    const preferredVoices = [
      "com.apple.voice.compact.en-US.Samantha",
      "com.apple.voice.compact.en-US.Alex",
      "com.apple.ttsbundle.Samantha-compact",
      "com.apple.ttsbundle.Alex-compact",
    ];

    for (const voiceId of preferredVoices) {
      const voice = this.voices.find((v) => v.identifier === voiceId);
      if (voice) return voice.identifier;
    }

    // Fallback to first English voice
    const englishVoice = this.voices.find((v) => v.language.startsWith("en"));
    return englishVoice?.identifier;
  }

  static async speakWorkoutStart(workoutName: string) {
    await this.speak(`Starting ${workoutName} workout. Get ready!`, {
      rate: 0.9,
      pitch: 1.1,
    });
  }

  static async speakExerciseStart(exerciseName: string) {
    await this.speak(`Starting ${exerciseName}`, {
      rate: 1.0,
    });
  }

  static async speakRestStart(seconds: number) {
    await this.speak(`Rest time: ${seconds} seconds`, {
      rate: 1.0,
    });
  }

  static async speakNextExercise(exerciseName: string) {
    await this.speak(`Next: ${exerciseName}`, {
      rate: 1.0,
    });
  }

  static async speakCountdown(seconds: number) {
    if (seconds <= 10 && seconds > 0) {
      await this.speak(seconds.toString(), {
        rate: 1.2,
        pitch: 1.2,
      });
    }
  }

  static async speakWorkoutComplete() {
    await this.speak("Workout completed! Great job!", {
      rate: 0.9,
      pitch: 1.1,
    });
  }

  static async speakEncouragement() {
    const encouragements = [
      "You're doing great!",
      "Keep it up!",
      "Stay strong!",
      "You've got this!",
      "Push through!",
      "Almost there!",
      "Great form!",
      "Stay focused!",
    ];

    const randomEncouragement =
      encouragements[Math.floor(Math.random() * encouragements.length)];
    await this.speak(randomEncouragement, {
      rate: 1.0,
      pitch: 1.1,
    });
  }

  static async speakSetComplete(currentSet: number, totalSets: number) {
    if (currentSet < totalSets) {
      await this.speak(
        `Set ${currentSet} complete. Moving to set ${currentSet + 1}`,
        {
          rate: 1.0,
        }
      );
    } else {
      await this.speak("All sets completed! Moving to next exercise.", {
        rate: 1.0,
      });
    }
  }

  static async speakTimeWarning(seconds: number) {
    if (seconds === 30) {
      await this.speak("30 seconds remaining", { rate: 1.0 });
    } else if (seconds === 10) {
      await this.speak("10 seconds left", { rate: 1.1 });
    } else if (seconds === 5) {
      await this.speak("5 seconds", { rate: 1.2 });
    }
  }
}
