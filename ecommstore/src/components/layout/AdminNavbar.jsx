"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Navlinks } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import useAuthStore from "@/store/authStore";
import { getCategories } from "@/lib/api/category";
import useCartStore from "@/store/useCartStore";

const AdminNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openProfileDropDown, setOpenProfileDropDown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { logout, checkAuth } = useAuthStore();
  const { isAuthenticated, user, } = useAuth();

  const navigate = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    checkAuth();
  }, []);

  const promoMessages = [
    "For A Limited Time Only! Shop Now",
    "Free Shipping on Orders Over Rs. 5000",
    "Get 20% Off on Your First Order",
  ];

  const handleProfileDropDown = () => {
    setOpenProfileDropDown(!openProfileDropDown);
  };

  const handleLogout = async () => {
    await logout();
    setOpenProfileDropDown(false);
      navigate.push("/");
  };

  return (
    <nav className="w-full bg-white border-b border-(--border-default) mb-5 sticky top-0 left-0 z-50">
      {/* Main Navbar */}
      <div className="bg-white border-b border-(--border-default)">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-(--text-heading)">
                  EcomStore.
                </span>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Profile */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={handleProfileDropDown}
                    className="bg-black rounded-full px-3 py-1 text-white font-semibold text-xl border border-transparent hover:text-black hover:bg-white hover:border hover:border-(--border-default) transition-all"
                  >
                    {user?.userName.charAt(0).toUpperCase()}
                  </button>

                  {/* Profile Dropdown */}
                  {openProfileDropDown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenProfileDropDown(false)}
                      ></div>
                      <div className="absolute right-0 mt-3.5 w-48 bg-white rounded-lg shadow-xl border border-(--border-default) z-50 overflow-hidden">
                        <div className="bg-black text-white px-4 py-3">
                          <p className="font-semibold text-sm truncate">
                            {user?.userName}
                          </p>
                          <p className="text-xs opacity-80 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-(--text-primary) hover:bg-gray-50 transition-colors"
                            onClick={() => setOpenProfileDropDown(false)}
                          >
                            <LayoutDashboard size={18} />
                            <span className="font-medium text-sm">
                              Dashboard
                            </span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={18} />
                            <span className="font-medium text-sm">Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="User account"
                >
                  <User size={24} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      {/* <div className="hidden lg:block bg-white border-(--border-default)">
        <div className="max-w-360 mx-auto px-8">
          <div className="flex items-center gap-8 h-14">
            {Navlinks.map((link) => {
              const isActive = pathname === link.path;

              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`block py-2 font-medium transition-colors
              ${
                isActive
                  ? "text-(--text-active) border-b-2 border-(--text-active)"
                  : "text-(--text-primary) hover:text-(--text-hover)"
              }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div> */}
    </nav>
  );
};

export default AdminNavbar;
