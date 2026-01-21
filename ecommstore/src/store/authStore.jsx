import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/components/ui/axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      // REGISTER
      register: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/register", formData);
          set({ user: data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          set({
            error: err.response?.data?.message || "Registration failed",
            isLoading: false,
          });
          return { success: false };
        }
      },

      // LOGIN
      login: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/login", formData);
          set({ user: data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          set({
            error: err.response?.data?.message || "Login failed",
            isLoading: false,
          });
          return { success: false };
        }
      },

      // LOGOUT
      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post("/auth/logout");
        } finally {
          get().forceLogout();
        }
      },

      // FORCE LOGOUT (used by interceptor)
      forceLogout: () => {
        set({
          user: null,
          isLoading: false,
          error: null,
        });
      },

      // VERIFY AUTH (ON APP LOAD)
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/auth/verify");
          set({ user: data.user, isLoading: false });
          return true;
        } catch {
          set({ user: null, isLoading: false });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;