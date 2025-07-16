# FitPulse

FitPulse is a modern fitness tracking app built with React Native(Expo) and TypeScript. It helps users track their workouts, view history, and get workout details, with a clean UI and voice feedback features.

---

## 📸 Glimpse of FitPulse

Here’s a sneak peek into what Focusly looks like in action:

<img src="https://github.com/user-attachments/assets/3f0fe5a1-56b8-4ab5-8d82-9f2a3f597463" alt="FitPulse App Screenshot 1" width="200" height="400" />

<img src="https://github.com/user-attachments/assets/5eee1e90-b9aa-4e8d-82e8-061d68e2172c" alt="FitPulse App Screenshot 2" width="200" height="400" />

<img src="https://github.com/user-attachments/assets/1ff4c0e5-f7e4-4113-b2b5-cd67643755d4" alt="FitPulse App Screenshot 3" width="200" height="400" />

<img src="https://github.com/user-attachments/assets/ebc0cf71-452d-426b-952c-28b3fa3252e3" alt="FitPulse App Screenshot 3" width="200" height="400" />


---

## 📁 File Structure

```
FitPulse/
├── app.config.js
├── app.json
├── App.tsx
├── assets/
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── index.js
├── package-lock.json
├── package.json
├── README.md
├── src/
│   ├── components/
│   │   ├── AnimatedCard.tsx
│   │   ├── CustomTabBar.tsx
│   │   ├── GradientBackground.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── SplashScreen.tsx
│   ├── constants/
│   │   └── workouts.ts
│   ├── hooks/
│   │   └── useTheme.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── WorkoutDetailScreen.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   ├── firebase.ts
│   ├── storage/
│   │   └── workoutStorage.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── ttsService.ts
├── tsconfig.json
```

---

## 🚀 How to Clone and Start

1. **Clone the repository:**

   ```sh
   git clone https://github.com/rachitkatyal04/FitPulse.git
   cd FitPulse
   ```

2. **Install dependencies:**

   ```sh
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   - Create a `.env` file in the root directory if needed (not tracked by git).

4. **Start the app:**
   ```sh
   npx expo start
   ```
   - Use Expo Go or an emulator to run the app on your device.

---

## APK Link

- Link: https://expo.dev/accounts/rachitkatyal/projects/FitPulse/builds/2686a322-17fa-44f5-8d55-ec3c8f085e9f

## 🛠️ Tech Stack

- **React Native** (with Expo)
- **TypeScript**
- **Firebase** (for authentication and data storage)
- **React Navigation**
- **Custom Hooks and Components**
- **Text-to-Speech (TTS)** for voice feedback

---

## ⚙️ Setup

- Make sure you have [Node.js](https://nodejs.org/) and [Expo CLI](https://docs.expo.dev/get-started/installation/) installed.
- Install dependencies as shown above.
- Configure Firebase credentials in `src/services/firebase.ts` and set any required environment variables in `.env`.
- Run the app using Expo.

---

## 📝 What I'd Do Next

- **Improve Voice Features:** Enhance the TTS (Text-to-Speech) experience, add voice commands, and support more languages.
- **Add User Profiles:** Allow users to customize their profiles and track progress.
- **Workout Plans:** Introduce personalized workout plans and recommendations.
- **Social Features:** Enable sharing workouts and progress with friends.
- **Analytics:** Add charts and insights for user activity.
- **Testing:** Add unit and integration tests for better reliability.

---

## ⏱️ Time Spent & Challenges

- **Total Time Spent:** ~4-6 hours
- **Challenges:**
  - **Voice Feature:** Integrating and fine-tuning the TTS service for smooth, cross-platform voice feedback was tricky, especially handling different device capabilities and permissions.
  - **Navigation:** Ensuring seamless navigation between screens and maintaining state.
  - **Firebase Integration:** Setting up authentication and data storage securely.
  - **UI/UX:** Designing a clean, responsive interface that works well on both iOS and Android.

---
