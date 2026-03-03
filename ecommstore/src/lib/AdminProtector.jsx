import useAuthStore from "@/store/authStore"
import { useRouter } from "next/router";

const AdminProtector = ({children}) => {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    // If not authenticated or not an admin, render nothing (or you could redirect)
    if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/login'); // Redirect to login if not admin
        return null;
    }
  return (
    <>{children}</>
  )
}

export default AdminProtector