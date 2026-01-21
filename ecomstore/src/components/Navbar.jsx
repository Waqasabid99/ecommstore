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
import { Navlinks } from "@/constants/utils";
import useAuth from "@/hooks/useAuth";
import useAuthStore from "@/store/authStore";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openProfileDropDown, setOpenProfileDropDown] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { logout, checkAuth } = useAuthStore();
  const { isAuthenticated, user, } = useAuth();
  console.log(isAuthenticated)
  const navigate = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    checkAuth();
  }, [])
  // Sample cart items
  const cartItems = [
    { id: 1, title: "Wireless Headphones", quantity: 2, price: 2999 },
    { id: 2, title: "Smart Watch Series 5", quantity: 1, price: 15999 },
    { id: 3, title: "USB-C Cable Pack", quantity: 3, price: 599 },
  ];

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const promoMessages = [
    "For A Limited Time Only! Shop Now",
    "Free Shipping on Orders Over Rs. 5000",
    "Get 20% Off on Your First Order",
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promoMessages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + promoMessages.length) % promoMessages.length,
    );
  };

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
      {/* Top Bar */}
      <div className="bg-(--color-brand-primary) text-white">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-xs sm:text-sm">
            {/* Welcome Message */}
            <div className="hidden lg:flex items-center gap-2">
              <span>👋</span>
              <span className="font-medium">
                Welcome to Worldwide Electronics Store
              </span>
            </div>

            {/* Promo Carousel - Center */}
            <div className="flex-1 lg:flex-initial flex items-center justify-center gap-2 sm:gap-4">
              <button
                onClick={prevSlide}
                className="hover:opacity-80 transition-opacity p-1"
                aria-label="Previous promo"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-center min-w-50 sm:min-w-62.5">
                <span className="font-medium">
                  {promoMessages[currentSlide]}
                </span>
              </div>
              <button
                onClick={nextSlide}
                className="hover:opacity-80 transition-opacity p-1"
                aria-label="Next promo"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Contact Info */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="tel:000-123-456789"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Phone size={14} />
                <span>000-123-456789</span>
              </Link>
              <Link
                href="mailto:store@example.com"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Mail size={14} />
                <span>store@example.com</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

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

            {/* Search Bar - Desktop & Tablet */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative w-full">
                <select className="absolute left-0 top-0 h-full px-4 pr-8 bg-black text-white rounded-l-full text-sm font-medium border-none outline-none appearance-none cursor-pointer">
                  <option>All Categories</option>
                  <option>Electronics</option>
                  <option>Computers</option>
                  <option>Mobile Phones</option>
                  <option>Accessories</option>
                </select>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-44 pr-12 py-3 rounded-full bg-(--bg-surface) border border-(--border-default) focus:outline-none focus:border-(--border-primary) transition-colors text-sm"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-(--color-brand-primary) text-white p-2 rounded-full hover:opacity-90 transition-opacity">
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
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
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="flex items-center gap-2 sm:gap-3 md:border lg:border text-black px-3 sm:px-4 py-2 rounded-full hover:bg-(--btn-bg-hover) transition-all group"
                >
                  <ShoppingCart
                    size={35}
                    className="bg-black p-2 text-white border rounded-full group-hover:scale-110 transition-transform"
                  />
                  <div className="md:group-hover:text-(--text-inverse) lg:group-hover:text-(--text-inverse) hidden sm:flex flex-col items-start">
                    <span className="text-xs opacity-80">Total</span>
                    <span className="text-sm font-semibold">
                      Rs. {totalPrice.toLocaleString()}
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
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-(--border-default) z-50 overflow-hidden">
                      <div className="bg-black text-white px-4 py-3">
                        <h3 className="font-semibold text-lg">Shopping Cart</h3>
                        <p className="text-sm opacity-80">
                          {cartItems.length} items
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="px-4 py-3 border-b border-(--border-default) hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-(--text-primary)">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-(--text-secondary) mt-1">
                                  Rs. {item.price.toLocaleString()}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-(--text-primary)">
                                ×{item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-4 bg-gray-50 border-t border-(--border-default)">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-(--text-heading)">
                            Total:
                          </span>
                          <span className="text-xl font-bold text-(--color-brand-primary)">
                            Rs. {totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <button className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-(--btn-bg-hover) transition-colors">
                          View Cart
                        </button>
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

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-4 pr-12 py-2.5 rounded-full bg-(--bg-surface) border border-(--border-default) focus:outline-none focus:border-(--border-primary) transition-colors text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-(--color-brand-primary) text-white p-2 rounded-full">
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-(--border-default)">
          <div className="px-4 py-4 space-y-3">
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
            <div className="pt-3 border-t border-(--border-default)] space-y-2">
              <Link
                href="tel:000-123-456789"
                className="flex items-center gap-2 py-2 text-(--text-secondary) hover:text-(--text-hover) transition-colors"
              >
                <Phone size={16} />
                <span className="text-sm">000-123-456789</span>
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-2 py-2 text-(--text-secondary) hover:text-(--text-hover) transition-colors sm:hidden"
              >
                <Heart size={16} />
                <span className="text-sm">Wishlist</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation Links */}
      <div className="hidden lg:block bg-white border-(--border-default)">
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
      </div>
    </nav>
  );
};

export default Navbar;
