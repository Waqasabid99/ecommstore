"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
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
import { Navlinks, renderCategories } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import useAuthStore from "@/store/authStore";
import { getCategories } from "@/lib/api/category";
import useCartStore from "@/store/useCartStore";
import Fuse from "fuse.js";
import { getProducts } from "@/lib/api/product";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openProfileDropDown, setOpenProfileDropDown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { logout, isLoading } = useAuthStore();
  const { isAuthenticated, user } = useAuth();

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  const { getCartItems, getCartSummary } = useCartStore();
  const { itemCount, subtotal } = getCartSummary();

  const cartItems = getCartItems();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize Fuse instance
  const fuse = useMemo(() => {
    if (!products.length) return null;
    
    const options = {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'description', weight: 0.3 },
        { name: 'category.name', weight: 0.5 },
        { name: 'tag', weight: 0.4 },
        { name: 'brand', weight: 0.3 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    };
    
    return new Fuse(products, options);
  }, [products]);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Perform search
  useEffect(() => {
    if (!fuse || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let results;
    
    if (selectedCategory) {
      // Filter products by category first, then search
      const categoryProducts = products.filter(
        product => product.category?.id === selectedCategory || 
                  product.category?.slug === selectedCategory
      );
      
      const categoryFuse = new Fuse(categoryProducts, {
        keys: [
          { name: 'name', weight: 0.7 },
          { name: 'description', weight: 0.3 },
          { name: 'tag', weight: 0.4 },
          { name: 'brand', weight: 0.3 }
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2
      });
      
      results = categoryFuse.search(searchQuery).slice(0, 8);
    } else {
      // Search all products
      results = fuse.search(searchQuery).slice(0, 8);
    }
    
    setSearchResults(results);
  }, [searchQuery, selectedCategory, fuse, products]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    if (!isSearchFocused || !searchRef.current) return;
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

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
    try {
      await logout();
      router.push("/");
      router.refresh();
      setOpenProfileDropDown(false);
    } catch (error) {
      setOpenProfileDropDown(false);
      console.error("Logout error:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const queryParams = new URLSearchParams();
      queryParams.set("q", searchQuery);
      if (selectedCategory) queryParams.set("category", selectedCategory);
      
      router.push(`/shop?${queryParams.toString()}`);
      setIsSearchFocused(false);
    }
  };

  const handleResultClick = () => {
    // Clear search and close dropdown after navigation
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  return (
    <nav className="w-full bg-white border-b border-(--border-default) mb-5 sticky top-0 left-0 z-50">
      {/* Top Bar */}
      <div className="bg-(--color-brand-primary) text-white">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-xs sm:text-sm">
            <div className="hidden lg:flex items-center gap-2">
              <span>👋</span>
              <span className="font-medium">
                Welcome to Worldwide Electronics Store
              </span>
            </div>

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
            <div 
              className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8 relative"
              ref={searchRef}
            >
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="absolute left-0 top-0 h-full px-4 pr-8 bg-black text-white rounded-l-full text-sm font-medium border-none outline-none appearance-none cursor-pointer hover:bg-gray-900 transition-colors z-10"
                >
                  <option value="">All Categories</option>
                  {renderCategories(categories)}
                </select>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full pl-44 pr-12 py-3 rounded-full bg-(--bg-surface) border border-(--border-default) focus:outline-none focus:border-(--border-primary) transition-colors text-sm"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-(--color-brand-primary) text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  <Search size={18} />
                </button>
              </form>

              {/* Search Results Dropdown */}
              {isSearchFocused && (searchQuery.trim() || searchResults.length > 0) && (
                <div className="absolute top-1/2 left-0 right-0 mt-6 bg-white rounded-lg shadow-2xl border border-(--border-default) z-50 overflow-hidden max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-(--border-default)">
                        <span className="text-xs text-(--text-secondary)">
                          {selectedCategory ? "Results from selected category" : "Results from all categories"}
                        </span>
                        <X size={16} onClick={handleResultClick} />
                      </div>
                      {searchResults.map(({ item, score }) => (
                        <Link
                          key={item.id}
                          href={`/shop/products/${item.slug}`}
                         onClick={handleResultClick}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-(--border-default) last:border-0 transition-colors no-underline text-current"
                        >
                          {item.thumbnail && (
                            <img 
                              src={item.thumbnail} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-(--text-primary) truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-(--text-secondary)">
                              {item.category?.name || "Uncategorized"}
                            </p>
                            {item.variants && item.variants[0]?.price && (
                              <p className="text-sm font-semibold text-(--color-brand-primary)">
                                Rs. {item.variants[0].price}
                              </p>
                            )}
                          </div>
                          <Search size={16} className="text-(--text-secondary) opacity-50" />
                        </Link>
                      ))}
                      <button 
                        onClick={handleSearchSubmit}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-center text-sm font-medium text-(--color-brand-primary) transition-colors border-t border-(--border-default)"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </>
                  ) : searchQuery.trim() && searchQuery.length >= 2 ? (
                    <div className="px-4 py-8 text-center text-(--text-secondary)">
                      <Search size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No products found</p>
                      <p className="text-xs mt-1">Try adjusting your search or category filter</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart size={24} />
              </button>

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

                {isCartOpen && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 z-40"
                      onClick={() => setIsCartOpen(false)}
                    ></div>
                    <div className="absolute -right-12 mt-2 w-72 lg:w-96 md:82 bg-white rounded-lg shadow-2xl border border-(--border-default) z-50 overflow-hidden">
                      <div className="bg-black text-white px-4 py-3">
                        <h3 className="font-semibold text-lg">Shopping Cart</h3>
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

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={handleProfileDropDown}
                    className="bg-black rounded-full px-3 py-1 text-white font-semibold text-xl border border-transparent hover:text-black hover:bg-white hover:border hover:border-(--border-default) transition-all"
                  >
                    {user?.userName.charAt(0).toUpperCase()}
                  </button>

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
                            href={
                              user?.role === "ADMIN"
                                ? `/admin/${user?.id}`
                                : `/user/${user?.id}`
                            }
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
                            <span className="font-medium text-sm">{isLoading ? "Logging out..." : "Logout"}</span>
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
          <div className="md:hidden pb-4" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-4 pr-12 py-2.5 rounded-full bg-(--bg-surface) border border-(--border-default) focus:outline-none focus:border-(--border-primary) transition-colors text-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-(--color-brand-primary) text-white p-2 rounded-full"
              >
                <Search size={16} />
              </button>
            </form>
            
            {/* Mobile Search Results */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute left-4 right-4 mt-2 bg-white rounded-lg shadow-2xl border border-(--border-default) z-50 max-h-64 overflow-y-auto">
                {searchResults.map(({ item }) => (
                  <Link
                    key={item.id}
                    href={`/shop/products/${item.slug}`}
                    onClick={handleResultClick}
                    className="block px-4 py-3 hover:bg-gray-50 border-b border-(--border-default) last:border-0 no-underline text-current"
                  >
                    <h4 className="font-medium text-sm text-(--text-primary)">{item.name}</h4>
                    <p className="text-xs text-(--text-secondary)">{item.category?.name}</p>
                  </Link>
                ))}
              </div>
            )}
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