// Cart.tsx - Enhanced with professional coupon management
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  Shield,
  CreditCard,
  X,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Clock,
  Percent,
  Copy,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import useCartStore from "@/store/useCartStore";
import Loader from "../ui/Loader";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Optional but recommendeds

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
        type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
      }`}
    >
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={14} />
      </button>
    </motion.div>
  );
};

// Suggested coupons component
const SuggestedCoupons = ({ 
  onSelect, 
  subtotal 
}) => {
  // In real app, fetch from API based on cart contents
  const suggestions = [
    { code: "SAVE10", discount: "10% off", minOrder: 0, description: "On your first order" },
    { code: "FLASH20", discount: "20% off", minOrder: 50000, description: "Flash sale - Limited time" },
  ].filter(c => c.minOrder <= subtotal);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-gray-500 font-medium">Available coupons:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((coupon) => (
          <button
            key={coupon.code}
            onClick={() => onSelect(coupon.code)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dashed border-gray-300 rounded-lg text-xs hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Tag size={12} className="text-gray-400 group-hover:text-blue-500" />
            <span className="font-semibold text-gray-700">{coupon.code}</span>
            <span className="text-gray-500">• {coupon.discount}</span>
            <Copy size={10} className="text-gray-300 group-hover:text-blue-400" />
          </button>
        ))}
      </div>
    </div>
  );
};

const Cart = () => {
  const {
    getCartItems,
    getCartSummary,
    updateCartItem,
    removeCartItem,
    applyCoupon,
    removeCoupon,
    undoRemoveCoupon,
    validateCoupon,
    isLoading,
    couponLoading,
    summary,
    couponError,
    clearCouponError,
    recentlyRemovedCoupon,
  } = useCartStore();

  const cartItems = getCartItems();
  const cartSummary = getCartSummary();

  // Refs for focus management
  const promoInputRef = useRef(null);
  const applyButtonRef = useRef(null);

  // Local state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [loadingItem, setLoadingItem] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [toast, setToast] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Derived state
  const appliedCoupon = summary?.coupon ?? null;
  const discountAmount = summary?.discountAmount ?? "0.00";
  const discountPct = summary?.discountPct ?? 0;
  const subtotal = summary?.subtotal ?? cartSummary.subtotal ?? "0.00";
  const total = summary?.total ?? cartSummary.subtotal ?? "0.00";
  const taxAmount = summary?.taxAmount ?? "0.00";
  const taxRate = summary?.taxRate ?? 0;
  const shippingAmount = summary?.shippingAmount ?? "0.00";
  const totalQuantity = summary?.totalQuantity ?? cartSummary.totalQuantity ?? 0;
  const promotionSavings = summary?.promotionSavings ?? "0.00";
  const originalTotal = (summary)?.originalTotal;

  // Clear errors when coupon changes
  useEffect(() => {
    if (appliedCoupon) {
      setPromoError("");
      setShowUndo(false);
    }
  }, [appliedCoupon]);

  // Show undo when coupon is removed
  useEffect(() => {
    if (recentlyRemovedCoupon && !appliedCoupon) {
      setShowUndo(true);
      const timer = setTimeout(() => setShowUndo(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [recentlyRemovedCoupon, appliedCoupon]);

  const updateQuantity = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1 || newQty > 99) return;
    
    setLoadingItem(itemId);
    try {
      const result = await updateCartItem(itemId, newQty);
      if (!result.success) {
        setToast({ message: result.error || "Failed to update quantity", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Network error. Please try again.", type: "error" });
    } finally {
      setLoadingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      setToast({ message: "Item removed from cart", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to remove item", type: "error" });
    }
  };

  // Debounced validation
  const validatePromoCode = useCallback(async (code) => {
    if (!code.trim() || code.length < 3) return;
    
    setIsValidating(true);
    const result = await validateCoupon(code);
    setIsValidating(false);
    
    if (!result.valid && result.error) {
      setPromoError(result.error);
    } else {
      setPromoError("");
    }
  }, [validateCoupon]);

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a coupon code");
      promoInputRef.current?.focus();
      return;
    }

    setPromoError("");
    setPromoLoading(true);

    const result = await applyCoupon(promoCode);

    setPromoLoading(false);

    if (result.success) {
      setPromoCode("");
      setToast({ 
        message: `Coupon applied! You saved Rs. ${parseFloat(result.data?.discountAmount || discountAmount).toLocaleString()}`, 
        type: "success" 
      });
      // Return focus to input for potential next coupon (stacking if supported)
      promoInputRef.current?.focus();
    } else {
      setPromoError(result.error || "Invalid coupon code");
      promoInputRef.current?.select();
    }
  };

  const handleRemoveCoupon = async () => {
    const removedCoupon = appliedCoupon;
    const savedAmount = discountAmount;
    
    const result = await removeCoupon();
    
    if (result.success) {
      setToast({ 
        message: `Removed ${removedCoupon?.code}. You can reapply it within 5 seconds.`, 
        type: "success" 
      });
      // Focus input for easy re-entry
      promoInputRef.current?.focus();
    } else {
      setToast({ message: result.error || "Failed to remove coupon", type: "error" });
    }
  };

  const handleUndoRemove = async () => {
    const result = await undoRemoveCoupon();
    if (result.success) {
      setShowUndo(false);
      setToast({ message: "Coupon restored!", type: "success" });
    } else {
      setToast({ message: "Could not restore coupon", type: "error" });
    }
  };

  const handlePromoKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyCoupon();
    }
    if (e.key === "Escape") {
      setPromoCode("");
      setPromoError("");
    }
  };

  const handleSuggestedCoupon = (code) => {
    setPromoCode(code);
    setPromoError("");
    // Auto-apply after short delay for better UX
    setTimeout(() => applyButtonRef.current?.click(), 100);
  };

  if (cartItems?.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <section className="mx-4 my-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-12 md:p-20 text-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-6"
              >
                <ShoppingBag size={48} className="text-gray-400" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Your Cart is Empty
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Looks like you haven&apos;t added anything to your cart yet.
                Start shopping to find amazing deals!
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                Continue Shopping
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 mx-4 rounded-xl px-6 py-12 md:py-16 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="inline-block text-blue-600 text-sm border-2 border-blue-200 rounded-full px-4 py-1.5 font-medium mb-3">
                SHOPPING CART
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Your Cart ({totalQuantity} {totalQuantity === 1 ? "Item" : "Items"})
              </h1>
            </div>
            <Link
              href="/shop"
              className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-2 sm:mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Cart Items Column */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Cart Items List */}
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Product Image */}
                      <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg overflow-hidden">
                        <Image
                          src={item?.thumbnail || "/placeholder.png"}
                          width={128}
                          height={128}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] sm:text-[10px] text-white bg-gray-800 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 inline-block mb-1 sm:mb-2">
                              {item.category || item.category?.name}
                            </span>
                            <Link href={`/shop/products/${item.product?.slug}`}>
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                            <p className="text-gray-500 text-[10px] sm:text-xs hidden sm:block">
                              Brand: <span className="font-medium text-gray-700">{item.product?.brand || "Not Specified"}</span>
                              {" "}| SKU: <span className="font-medium text-gray-700">{item?.sku}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 sm:p-2 shrink-0 rounded-full hover:bg-red-50"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Quantity + Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-3 sm:mt-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">Qty:</span>
                            <div className="flex items-center border border-gray-200 rounded-full bg-white">
                              <button
                                onClick={() => updateQuantity(item?.id, item?.quantity, -1)}
                                disabled={loadingItem === item.id || item.quantity <= 1}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-l-full transition-colors disabled:opacity-50"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-2 sm:px-3 flex font-medium text-sm sm:text-base min-w-8 sm:min-w-10 justify-center">
                                {loadingItem === item.id ? <Loader text="" size="sm" /> : item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item?.id, item?.quantity, 1)}
                                disabled={loadingItem === item.id || item.quantity >= 99}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-r-full transition-colors disabled:opacity-50"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Price Display */}
                          <div className="text-left sm:text-right">
                            {item.originalPrice && parseFloat(item.originalPrice) > parseFloat(item.price) ? (
                              <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1 flex sm:justify-end items-center gap-1.5">
                                <span className="line-through">Rs. {parseFloat(item.originalPrice).toLocaleString()}</span>
                                <span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                                  Rs. {parseFloat(item.price).toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                                Rs. {parseFloat(item.price).toLocaleString()} each
                              </div>
                            )}
                            <div className="text-lg sm:text-xl font-bold text-gray-900">
                              Rs. {parseFloat(item.itemTotal).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Enhanced Promo Code Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Tag size={18} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {appliedCoupon ? "Coupon Applied" : "Have a Promo Code?"}
                  </h3>
                </div>

                <AnimatePresence mode="wait">
                  {appliedCoupon ? (
                    <motion.div
                      key="applied"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border-2 border-green-200 rounded-lg p-4 sm:p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle2 size={20} className="text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-base sm:text-lg">
                                {appliedCoupon.code}
                              </p>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Active
                              </span>
                            </div>
                            <p className="text-sm text-green-700 font-medium mt-0.5">
                              {appliedCoupon.discountType === "PERCENT"
                                ? `${appliedCoupon.discountValue}% discount applied`
                                : `Rs. ${appliedCoupon.discountValue} off applied`}
                              {" "}(−Rs. {parseFloat(discountAmount).toLocaleString()})
                            </p>
                            {appliedCoupon.expiresAt && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock size={12} />
                                Expires {new Date(appliedCoupon.expiresAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={handleRemoveCoupon}
                            disabled={couponLoading}
                            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                            aria-label="Remove coupon"
                          >
                            {couponLoading ? (
                              <Loader text="" size="sm" />
                            ) : (
                              <>
                                <X size={16} />
                                <span className="hidden sm:inline">Remove</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Undo option */}
                      <AnimatePresence>
                        {showUndo && recentlyRemovedCoupon?.code === appliedCoupon.code && (
                          <motion.button
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            onClick={handleUndoRemove}
                            className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 py-2 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <RotateCcw size={14} />
                            Undo removal of {recentlyRemovedCoupon.code}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1 relative">
                          <input
                            ref={promoInputRef}
                            type="text"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase());
                              if (promoError) setPromoError("");
                              if (couponError) clearCouponError();
                            }}
                            onKeyDown={handlePromoKeyDown}
                            placeholder="Enter promo code (e.g., SAVE10)"
                            className={`w-full px-4 py-3 text-sm sm:text-base border-2 rounded-lg focus:outline-none transition-all ${
                              promoError
                                ? "border-red-300 focus:border-red-500 bg-red-50"
                                : isValidating
                                ? "border-blue-300 bg-blue-50"
                                : "border-gray-200 focus:border-blue-500 bg-white"
                            }`}
                            aria-invalid={!!promoError}
                            aria-describedby={promoError ? "promo-error" : undefined}
                          />
                          {isValidating && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader text="" size="sm" />
                            </div>
                          )}
                        </div>
                        <button
                          ref={applyButtonRef}
                          onClick={handleApplyCoupon}
                          disabled={promoLoading || !promoCode.trim() || isValidating}
                          className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all font-medium whitespace-nowrap text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
                        >
                          {promoLoading ? (
                            <>
                              <Loader text="" size="sm" />
                              <span>Applying...</span>
                            </>
                          ) : (
                            <>
                              <span>Apply</span>
                              <ChevronRight size={16} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Error Message */}
                      <AnimatePresence>
                        {(promoError || couponError) && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            id="promo-error"
                            className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
                            role="alert"
                          >
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{promoError || couponError}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Suggested Coupons */}
                      {!promoCode && (
                        <SuggestedCoupons 
                          onSelect={handleSuggestedCoupon} 
                          subtotal={parseFloat(subtotal)} 
                        />
                      )}

                      {/* Recently removed coupon quick reapply */}
                      {recentlyRemovedCoupon && !showUndo && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => handleSuggestedCoupon(recentlyRemovedCoupon.code)}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
                        >
                          <RotateCcw size={14} />
                          Reapply {recentlyRemovedCoupon.code}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:sticky lg:top-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
                  Order Summary
                </h2>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {/* Subtotal */}
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span className="font-medium">Rs. {parseFloat(subtotal).toLocaleString()}</span>
                  </div>

                  {/* Promotion Savings */}
                  {parseFloat(promotionSavings) > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between text-green-600 text-sm sm:text-base"
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles size={14} />
                        Promotion savings
                      </span>
                      <span className="font-medium">−Rs. {parseFloat(promotionSavings).toLocaleString()}</span>
                    </motion.div>
                  )}

                  {/* Coupon Discount */}
                  {appliedCoupon && parseFloat(discountAmount) > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between text-green-600 text-sm sm:text-base"
                    >
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        Coupon ({appliedCoupon.code})
                        {discountPct > 0 && <span className="text-xs bg-green-100 px-1.5 py-0.5 rounded">{discountPct}%</span>}
                      </span>
                      <span className="font-medium">−Rs. {parseFloat(discountAmount).toLocaleString()}</span>
                    </motion.div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {!shippingAmount || parseFloat(shippingAmount) === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `Rs. ${parseFloat(shippingAmount).toLocaleString()}`
                      )}
                    </span>
                  </div>

                  {/* Tax */}
                  {parseFloat(taxAmount) > 0 && (
                    <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                      <span>Tax{taxRate ? ` (${taxRate}%)` : ""}</span>
                      <span className="font-medium">Rs. {parseFloat(taxAmount).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t-2 border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 text-base sm:text-lg">Total</span>
                      <div className="text-right">
                        {originalTotal && parseFloat(originalTotal) > parseFloat(total) && (
                          <div className="text-xs text-gray-400 line-through mb-0.5">
                            Rs. {parseFloat(originalTotal).toLocaleString()}
                          </div>
                        )}
                        <span className="font-bold text-gray-900 text-xl sm:text-2xl">
                          Rs. {parseFloat(total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {parseFloat(discountAmount) > 0 && (
                      <p className="text-xs text-green-600 text-right mt-1">
                        You save Rs. {parseFloat(discountAmount).toLocaleString()}!
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full bg-gray-900 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full hover:bg-gray-800 transition-all font-medium text-base sm:text-lg mb-3 sm:mb-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/shop"
                  className="w-full flex justify-center border-2 border-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm sm:text-base"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  {[
                    { icon: Truck, title: "Free Shipping", desc: "On orders over Rs. 50,000" },
                    { icon: Shield, title: "Secure Payment", desc: "100% secure transactions" },
                    { icon: CreditCard, title: "Easy Returns", desc: "30-day return policy" },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                        <feature.icon size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{feature.title}</p>
                        <p className="text-xs text-gray-500">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cart;