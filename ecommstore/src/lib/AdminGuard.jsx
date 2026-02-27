"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

export default function AdminGuard({ children }) {
    const { checkAuth, isAuthenticated, isLoading, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace("/");
            return;
        }

        if (user?.role?.toUpperCase() !== "ADMIN") {
            // Logged in but not an admin — send to their user dashboard
            router.replace(user?.id ? `/user/${user.id}` : "/");
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Show spinner while checking auth
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Verifying your session...</p>
                </div>
            </div>
        );
    }

    // Render nothing while redirect is in progress
    if (!isAuthenticated || user?.role?.toUpperCase() !== "ADMIN") {
        return null;
    }

    return children;
}
