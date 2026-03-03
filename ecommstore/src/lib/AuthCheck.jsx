"use client";
import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function CheckAuth({ children }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    router.push("/");
  }

  // Run auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return children;
}
