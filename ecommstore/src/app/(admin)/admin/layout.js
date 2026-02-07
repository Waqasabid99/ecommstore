import { getCurrentUser } from "@/actions/user.action";
import AdminNavbar from "@/components/layout/AdminNavbar";
import Sidebar from "@/components/layout/Sidebar";
import CheckAuth from "@/lib/AuthCheck";

export const metadata = {
  title: "Admin - EcomStore",
  description:
    "Access your EcomStore account by logging in or signing up. Enjoy a personalized shopping experience, track your orders, and manage your preferences with ease.",
};

export default async function AdminLayout({ children }) {

  return (
   <div className="min-h-screen bg-(--bg-page)">
    <CheckAuth>
    <AdminNavbar />
      <Sidebar />
      {/* Main Content Area */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </CheckAuth>
    </div>
  );
}
