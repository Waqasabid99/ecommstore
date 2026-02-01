"use client";
import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/useCartStore";

const AdminNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openProfileDropDown, setOpenProfileDropDown] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { logout, checkAuth } = useAuthStore();
  const { isAuthenticated, user } = useAuth();

  const { getCartItems, getCartSummary } = useCartStore();
  const { itemCount, subtotal } = getCartSummary();

  const cartItems = getCartItems();
  const navigate = useRouter();
  const pathname = usePathname();
  const isUserPage = pathname.startsWith("/user/");
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    checkAuth();
  }, []);

  const handleProfileDropDown = () => {
    setOpenProfileDropDown(!openProfileDropDown);
  };

  const handleLogout = async () => {
    await logout();
    setOpenProfileDropDown(false);
    navigate.push("/");
  };

  return (
    <nav className="w-full bg-white border-b border-(--border-default) sticky top-0 left-0 z-50">
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
            {isUserPage && (
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Wishlist */}
                <button
                  className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                  aria-label="Wishlist"
                >
                  <Heart size={24} />
                </button>

                {/* Cart */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsCartOpen(!isCartOpen);
                      getCartItems();
                    }}
                    className="flex items-center border gap-2 sm:gap-3 md:border lg:border text-black px-3 sm:px-4 py-2 rounded-full hover:bg-(--btn-bg-hover) transition-all group"
                  >
                    <ShoppingCart
                      size={35}
                      className="bg-black p-2 text-white border rounded-full group-hover:scale-110 transition-transform"
                    />
                    <div className="md:group-hover:text-(--text-inverse) md:group-hover:border-(--border-default) lg:group-hover:text-(--text-inverse) hidden sm:group-hover:text-white sm:flex flex-col items-start">
                      <span className="text-xs opacity-80">Total</span>
                      <span className="text-sm font-semibold">
                        Rs. {subtotal ?? 0.0}
                      </span>
                    </div>
                  </button>

                  {/* Cart Dropdown */}
                  {isCartOpen && (
                    <>
                      <div
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => setIsCartOpen(false)}
                      ></div>
                      <div className="absolute -right-12 mt-2 w-72 lg:w-96 md:82 bg-white rounded-lg shadow-2xl border border-(--border-default) z-50 overflow-hidden">
                        <div className="bg-black text-white px-4 py-3">
                          <h3 className="font-semibold text-lg">
                            Shopping Cart
                          </h3>
                          <p className="text-sm opacity-80">
                            {cartItems ? itemCount : "0"} items
                          </p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {cartItems?.map((item) => (
                            <div
                              key={item.id}
                              className="px-4 py-3 border-b border-(--border-default) hover:bg-gray-50 transition-colors"
                            >
                              <Link
                                href={`/shop/products/${item?.product?.slug}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm text-(--text-primary)">
                                      {item.name}
                                    </h4>
                                    <p className="text-xs text-(--text-secondary) mt-1">
                                      Rs. {item?.price || "0.00"}
                                    </p>
                                  </div>
                                  <span className="text-sm font-semibold text-(--text-primary)">
                                    ×{item?.quantity || "0"}
                                  </span>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                        <div className="px-4 py-4 bg-gray-50 border-t border-(--border-default)">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-(--text-heading)">
                              Total:
                            </span>
                            <span className="text-xl font-bold text-(--color-brand-primary)">
                              Rs. {subtotal ?? 0.0}
                            </span>
                          </div>
                          <Link
                            href={"/cart"}
                            className="w-full flex justify-center bg-black text-white py-3 rounded-full font-semibold hover:bg-(--btn-bg-hover) transition-colors"
                          >
                            View Cart
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>

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
                              href={user?.role === "ADMIN" ? `/admin/${user?.id}` : `/user/${user?.id}`}
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
                              <span className="font-medium text-sm">
                                Logout
                              </span>
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
            )}
            {isAdminPage && (
              <>
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
                              href={user?.role === "ADMIN" ? `/admin/${user?.id}` : `/user/${user?.id}`}
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
                              <span className="font-medium text-sm">
                                Logout
                              </span>
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
