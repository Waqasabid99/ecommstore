import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/components/ui/axios";
import useCartStore from "./useCartStore";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      address: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // REGISTER
      register: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/register", formData);
          set({ user: data.user, address: data.address, isLoading: false });
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

          if (!data.success) {
            throw new Error(data.message || "Login failed");
          }
          console.log(data);
          set({
            user: data.user,
            address: data.address,
            isAuthenticated: true,
            isLoading: false,
          });

          const cartStore = useCartStore.getState();
          await cartStore.mergeGuestCart();
          await cartStore.initializeCart();

          return { success: true };
        } catch (err) {
          set({
            error: err.response?.data?.message || err.message,
            isLoading: false,
            isAuthenticated: false,
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
          useCartStore.getState().resetCart();
        }
      },

      // FORCE LOGOUT (used by interceptor)
      forceLogout: () => {
        set({
          user: null,
          address: [],
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // VERIFY AUTH (ON APP LOAD)
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/auth/verify");
          set({ user: data.user, isLoading: false, isAuthenticated: true });
          return true;
        } catch (err) {
          // Only logout if refresh ALSO failed
          if (err.response?.status === 401) {
            set({ isLoading: false });
          }
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        address: state.address,
      }),
    }
  )
);

export default useAuthStore;