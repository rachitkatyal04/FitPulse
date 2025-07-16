# FitPulse - React Native Fitness App

A modern, feature-rich fitness tracking app built with React Native and Expo. Track your workouts, set timers, and stay motivated with voice prompts and beautiful animations.

## Features

- 🔐 **Firebase Authentication** - Secure login/signup with email and password
- 🏋️ **Workout Tracking** - Pre-built workouts with exercise timers and voice cues
- 🎤 **Text-to-Speech** - Voice prompts for exercise transitions and countdowns
- 📱 **Modern UI** - Beautiful animations and transitions using Moti
- 🌙 **Dark Mode** - Automatic system theme support
- 📊 **Workout History** - Track your progress with detailed statistics
- 💾 **Secure Storage** - User preferences and credentials stored securely
- 🔥 **Animated Progress** - Visual progress indicators and workout completion

## Tech Stack

- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **Firebase** for authentication
- **React Navigation** for routing
- **Moti** for animations
- **MMKV** for fast local storage
- **Expo Speech** for text-to-speech
- **Expo SecureStore** for secure credential storage

## Quick Start

### Prerequisites

- Node.js (v18 or later)
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS testing) or Android emulator
- Expo Go app on your phone (for testing)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd FitPulse
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up Firebase**:

   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication with Email/Password
   - Copy your Firebase config
   - Update `src/services/firebase.ts` with your config:

   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id",
   };
   ```

4. **Start the development server**:

   ```bash
   npx expo start
   ```

5. **Run on your device**:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `i` for iOS simulator / `a` for Android emulator

## Project Structure

```
FitPulse/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── ThemeProvider.tsx
│   ├── constants/         # App constants and sample data
│   │   └── workouts.ts
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/          # Screen components
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── WorkoutDetailScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── services/         # External services
│   │   ├── firebase.ts
│   │   └── authService.ts
│   ├── storage/          # Local storage services
│   │   └── workoutStorage.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
│       └── ttsService.ts
├── assets/              # Static assets
├── App.tsx             # Main app component
├── app.json           # Expo configuration
└── package.json      # Dependencies
```

## Key Features Breakdown

### Authentication

- Firebase Authentication with email/password
- Secure credential storage using Expo SecureStore
- Automatic login state management

### Workout System

- **3 Pre-built workouts**: Push Day, Pull Day, and HIIT Cardio
- **Exercise timer**: Automatic transitions between exercises and rest periods
- **Voice prompts**: TTS announcements for exercise changes and countdowns
- **Progress tracking**: Visual progress bars and completion indicators

### Data Storage

- **MMKV**: Fast, secure local storage for workout history
- **User preferences**: Theme, voice, and notification settings
- **Workout statistics**: Total workouts, streaks, and performance metrics

### UI/UX

- **Animations**: Smooth transitions using Moti and React Native Reanimated
- **Dark mode**: System-based theme switching
- **Modern design**: Clean, minimalist interface with smooth interactions
- **Responsive**: Works on various screen sizes

## Available Workouts

1. **Push Day** (45 min)

   - Bench Press, Shoulder Press, Tricep Dips, Push-ups, Lateral Raises

2. **Pull Day** (40 min)

   - Pull-ups, Bent-over Rows, Bicep Curls, Face Pulls, Hammer Curls

3. **HIIT Cardio** (25 min)
   - Jumping Jacks, Burpees, Mountain Climbers, High Knees, Squat Jumps

## Configuration

### Voice Settings

- Enable/disable voice prompts in user preferences
- Automatic voice selection based on system language
- Customizable speech rate and pitch

### Theme Settings

- Light, Dark, or System automatic theme
- Consistent color scheme across all components
- Smooth theme transitions

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

### Environment Variables

Create a `.env` file in the root directory:

```
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@fitpulse.com or create an issue in the repository.

---

**Made with ❤️ and React Native**
