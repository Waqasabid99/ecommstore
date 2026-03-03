import useAuthStore from "@/store/authStore"
import { useRouter } from "next/navigation";

const AdminProtector = ({children}) => {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    // If not authenticated or not an admin, redirect to home page
    if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/');
        return null;
    }
  return (
    <>{children}</>
  )
}

export default AdminProtector