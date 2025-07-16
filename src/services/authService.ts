import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  AuthError,
} from "firebase/auth";
import { auth } from "./firebase";
import * as SecureStore from "expo-secure-store";

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Store credentials securely
      await SecureStore.setItemAsync("userEmail", email);
      await SecureStore.setItemAsync(
        "userToken",
        await userCredential.user.getIdToken()
      );

      return { user: userCredential.user, error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { user: null, error: authError.message };
    }
  }

  // Create new user account
  static async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Store credentials securely
      await SecureStore.setItemAsync("userEmail", email);
      await SecureStore.setItemAsync(
        "userToken",
        await userCredential.user.getIdToken()
      );

      return { user: userCredential.user, error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { user: null, error: authError.message };
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);

      // Clear stored credentials
      await SecureStore.deleteItemAsync("userEmail");
      await SecureStore.deleteItemAsync("userToken");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  // Get stored credentials
  static async getStoredCredentials(): Promise<{
    email: string | null;
    token: string | null;
  }> {
    try {
      const email = await SecureStore.getItemAsync("userEmail");
      const token = await SecureStore.getItemAsync("userToken");
      return { email, token };
    } catch (error) {
      console.error("Error getting stored credentials:", error);
      return { email: null, token: null };
    }
  }
}
