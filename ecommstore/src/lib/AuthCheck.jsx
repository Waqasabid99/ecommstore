"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

export default function CheckAuth({ children }) {
  const router = useRouter();

  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth); // optional but recommended

  // Run auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated === false) {
      router.replace("/");
    }
  }, [isAuthenticated, isCheckingAuth, router]);

  // Prevent page flash while checking auth
  if (isCheckingAuth) return null;

  return children;
}
