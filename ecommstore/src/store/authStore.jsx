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
          
          // Set auth state first
          set({ 
            user: data.user, 
            address: data.address, 
            isAuthenticated: true,
            isLoading: false 
          });

          // Get fresh cart store instance and merge with explicit user context
          const cartStore = useCartStore.getState();
          
          // Small delay to ensure persist middleware writes to storage
          // OR better: manually trigger the merge with user context
          await new Promise(resolve => setTimeout(resolve, 50));
          
          await cartStore.mergeGuestCart(data.user);
          await cartStore.initializeCart();

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

          // Set auth state first
          set({
            user: data.user,
            address: data.address,
            isAuthenticated: true,
            isLoading: false,
          });

          // Get fresh cart store instance
          const cartStore = useCartStore.getState();
          
          // Small delay to ensure persist middleware writes to storage
          await new Promise(resolve => setTimeout(resolve, 50));
          
          await cartStore.mergeGuestCart(data.user);
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
          const { data } = await api.post("/auth/logout");
          if (!data.success) {
            throw new Error(data.message || "Logout failed");
          }
          set({
            isLoading: false,
          })
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
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;