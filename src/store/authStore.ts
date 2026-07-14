import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";

export type UserRole =
  | "super_admin"
  | "admin"
  | "teacher"
  | "student"
  | "parent"
  | "accountant"
  | "manager"
  | "principal";

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
}

const AUTH_USER_KEY = "auth_user";
const AUTH_TOKEN_KEY = "auth_token";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const [userJson, token] = await Promise.all([
        AsyncStorage.getItem(AUTH_USER_KEY),
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
      ]);

      if (userJson && token) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, access_token } = response.data;

      await Promise.all([
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
        AsyncStorage.setItem(AUTH_TOKEN_KEY, access_token),
      ]);

      set({
        user,
        token: access_token,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_USER_KEY),
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      ]);
    } catch {
      // ignore storage errors on logout
    }
    set({ user: null, token: null, isLoading: false });
  },

  updateRole: async (role: UserRole) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, role };
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser)).catch((err) =>
        console.error("Failed to save updated role to storage:", err)
      );
      return { user: updatedUser };
    });
  },
}));
