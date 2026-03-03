'use client';
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

const UserProtector = ({children}) => {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    // If not authenticated, redirect to home page
    if (!isAuthenticated) {
        router.push('/');
        return null;
    }
  return (
    <>{children}</>
  )
}

export default UserProtector