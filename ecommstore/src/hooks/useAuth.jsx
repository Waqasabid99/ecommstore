import useAuthStore from "@/store/authStore";

export default function useAuth() {
  const user = useAuthStore(state => state.user);
  const isLoading = useAuthStore(state => state.isLoading);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}