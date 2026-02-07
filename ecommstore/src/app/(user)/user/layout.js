import AdminNavbar from "@/components/layout/AdminNavbar";
import UserSidebar from "@/components/layout/UserSidebar";
import FloatingCart from "@/components/ui/FloatingCart";
import { Skeleton } from "@/components/ui/SidebarSkeleton";
import CheckAuth from "@/lib/AuthCheck";
import CartInitializer from "@/lib/CartInitializer";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard - EcomStore",
  description:
    "Access your account. Enjoy a personalized shopping experience, track your orders, and manage your preferences with ease.",
};

export default async function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-(--bg-page)">
      <CheckAuth>
        <CartInitializer>
          <AdminNavbar />
          <Suspense fallback={<Skeleton />}>
            <UserSidebar />
          </Suspense>
          {/* Main Content Area */}
          <main className="lg:ml-72 min-h-screen">
            <div className="p-6 lg:p-8">
              {children}
              <FloatingCart />
            </div>
          </main>
        </CartInitializer>
      </CheckAuth>
    </div>
  );
}
