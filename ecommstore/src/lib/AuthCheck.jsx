"use client";
import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

export default function checkAuth({ children }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return children;
}
