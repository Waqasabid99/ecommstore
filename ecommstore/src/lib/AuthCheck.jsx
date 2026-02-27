"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import Loading from "@/app/loading";

export default function CheckAuth({ children }) {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Only redirect once the auth check has finished (isLoading === false)
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // While the auth check is in progress, show a fullscreen spinner
  if (isLoading) {
    return (
      <Loading />
    );
  }

  return children;
}
