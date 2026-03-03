"use client";
import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

export default function CheckAuth({ children }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // Run auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return children;
}
