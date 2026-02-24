"use client";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import useCartStore from "@/store/useCartStore";
import Loader from "../ui/Loader";
import Image from "next/image";

const Cart = () => {
  const {
    getCartItems,
    getCartSummary,
    updateCartItem,
    removeCartItem,
    applyCoupon,
    removeCoupon,
    isLoading,
    summary,
  } = useCartStore();

  const cartItems = getCartItems();
  const cartSummary = getCartSummary();

  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [loadingItem, setLoadingItem] = useState(null);

  // Derive coupon state from the live cart summary
  const appliedCoupon = summary?.coupon ?? null;
  const discountAmount = summary?.discountAmount ?? "0.00";
  const discountPct = summary?.discountPct ?? 0;
  const subtotal = summary?.subtotal ?? cartSummary.subtotal;
  const total = summary?.total ?? cartSummary.subtotal;
  const taxAmount = summary?.taxAmount ?? "0.00";
  const taxRate = summary?.taxRate ?? 0;
  const shippingAmount = summary?.shippingAmount ?? "0.00";
  const totalQuantity = summary?.totalQuantity ?? cartSummary.totalQuantity;
  const promotionSavings = summary?.promotionSavings ?? "0.00";

  const updateQuantity = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1 || newQty > 99) return;
    setLoadingItem(itemId);
    try {
      await updateCartItem(itemId, newQty);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingItem(null);
    }
  };

  const removeItem = (itemId) => {
    removeCartItem(itemId);
  };

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a coupon code.");
      return;
    }

    setPromoError("");
    setPromoLoading(true);

    const result = await applyCoupon(promoCode);

    setPromoLoading(false);

    if (result.success) {
      setPromoCode("");
    } else {
      setPromoError(result.error || "Invalid coupon code.");
    }
  };

  const handleRemoveCoupon = async () => {
    setPromoError("");
    await removeCoupon();
  };

  const handlePromoKeyDown = (e) => {
    if (e.key === "Enter") handleApplyCoupon();
  };

  if (cartItems?.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <section className="mx-4 my-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-(--border-default) rounded-xl p-12 md:p-20 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-(--bg-surface) rounded-full mb-6">
                <ShoppingBag size={48} className="text-grey-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-(--text-heading)">
                Your Cart is Empty
              </h2>
              <p className="text-(--text-secondary) mb-8 max-w-md mx-auto">
                Looks like you haven&apos;t added anything to your cart yet.
                Start shopping to find amazing deals!
              </p>
              <Link
                href={"/shop"}
                className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header Section */}
      <section className="bg-linear-to-br from-blue-50 to-purple-50 mx-4 rounded-xl px-6 py-12 md:py-16 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="inline-block text-(--color-brand-primary) text-sm border-2 border-(--border-primary) rounded-full px-4 py-1.5 font-medium mb-3">
                SHOPPING CART
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-(--text-heading)">
                Your Cart ({totalQuantity}{" "}
                {totalQuantity === 1 ? "Item" : "Items"})
              </h1>
            </div>
            <Link
              href={"/shop"}
              className="text-(--text-secondary) hover:text-(--text-hover) font-medium flex items-center gap-2"
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
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-(--border-default) rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Product Image */}
                    <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-(--bg-surface) rounded-lg overflow-hidden">
                      <Image
                        src={`${item?.thumbnail}` || "/placeholder.png"}
                        width={100}
                        height={100}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] sm:text-[10px] text-(--text-inverse) bg-(--bg-primary) border border-(--border-default) rounded-full px-2 sm:px-3 py-0.5 sm:py-1 inline-block mb-1 sm:mb-2">
                            {item.category || item.category?.name}
                          </span>
                          <Link href={`/shop/products/${item.product.slug}`}>
                            <h3 className="font-semibold text-(--text-heading) text-sm sm:text-base md:text-lg mb-1 line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-(--text-secondary) text-[10px] sm:text-xs hidden sm:block">
                            Brand:{" "}
                            <span className="font-normal text-(--text-primary)">
                              {item.product?.brand || "Not Specified"}
                            </span>{" "}
                            | SKU:{" "}
                            <span className="font-normal text-(--text-primary)">
                              {item?.sku}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-(--text-secondary) hover:text-red-500 transition-colors p-1 sm:p-2 shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} className="sm:w-4.5 sm:h-4.5" />
                        </button>
                      </div>

                      {/* Quantity + Price */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm text-(--text-secondary) font-medium">
                            Qty:
                          </span>
                          <div className="flex items-center border border-(--border-default) rounded-full">
                            <button
                              onClick={() =>
                                updateQuantity(item?.id, item?.quantity, -1)
                              }
                              className="p-1.5 sm:p-2 hover:bg-(--bg-surface) rounded-l-full transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <span className="px-2 sm:px-3 flex font-medium text-sm sm:text-base min-w-8 sm:min-w-10 justify-center">
                              {loadingItem === item.id ? (
                                <Loader text="" size="md" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              disabled={item?.quantity === 99 || isLoading}
                              onClick={() =>
                                updateQuantity(item?.id, item?.quantity, 1)
                              }
                              className={
                                isLoading
                                  ? "cursor-grab p-1.5 sm:p-2 hover:bg-(--bg-surface) rounded-r-full transition-colors"
                                  : "p-1.5 sm:p-2 hover:bg-(--bg-surface) rounded-r-full transition-colors"
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price — show strikethrough if promotion active */}
                        <div className="text-left sm:text-right">
                          {item.originalPrice &&
                          parseFloat(item.originalPrice) >
                            parseFloat(item.price) ? (
                            <div className="text-xs sm:text-sm text-(--text-secondary) mb-0.5 sm:mb-1 flex sm:justify-end items-center gap-1.5">
                              <span className="line-through text-(--text-secondary)">
                                Rs. {parseFloat(item.originalPrice).toLocaleString()}
                              </span>
                              <span className="text-green-600 font-medium">
                                Rs. {parseFloat(item.price).toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs sm:text-sm text-(--text-secondary) mb-0.5 sm:mb-1">
                              Rs. {parseFloat(item.price).toLocaleString()} each
                            </div>
                          )}
                          <div className="text-lg sm:text-xl font-bold text-(--text-heading)">
                            Rs. {parseFloat(item.itemTotal).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code Section */}
              <div className="bg-[#FFF5F5] border border-(--border-default) rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Tag
                    size={18}
                    className="text-(--color-brand-primary) sm:w-5 sm:h-5"
                  />
                  <h3 className="font-semibold text-(--text-heading) text-sm sm:text-base">
                    Have a Promo Code?
                  </h3>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-white border border-(--border-primary) rounded-lg p-3 sm:p-4 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--bg-primary) rounded-full flex items-center justify-center shrink-0">
                        <Tag
                          size={16}
                          className="text-(--icon-inverse) sm:w-4.5 sm:h-4.5"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-(--text-heading) text-sm sm:text-base truncate">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">
                          {appliedCoupon.discountType === "PERCENT"
                            ? `${appliedCoupon.discountValue}% discount applied`
                            : `Rs. ${appliedCoupon.discountValue} off applied`}
                          {" "}(−Rs. {parseFloat(discountAmount).toLocaleString()})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      disabled={isLoading}
                      className="text-(--text-secondary) hover:text-red-500 transition-colors shrink-0 p-1 disabled:opacity-50"
                      aria-label="Remove promo code"
                    >
                      {isLoading ? (
                        <Loader text="" size="sm" />
                      ) : (
                        <X size={18} className="sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          if (promoError) setPromoError("");
                        }}
                        onKeyDown={handlePromoKeyDown}
                        placeholder="Enter promo code"
                        className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none transition-colors ${
                          promoError
                            ? "border-red-400 focus:border-red-500"
                            : "border-(--border-default) focus:border-(--color-brand-primary)"
                        }`}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={promoLoading || !promoCode.trim()}
                        className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-(--btn-bg-hover) transition-all font-medium whitespace-nowrap text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed min-w-22.5"
                      >
                        {promoLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader text="" size="sm" />
                            Applying...
                          </span>
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>

                    {/* Inline error message */}
                    {promoError && (
                      <div className="flex items-center gap-1.5 text-red-500 text-xs sm:text-sm">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{promoError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-(--border-default) rounded-xl p-4 sm:p-6 lg:sticky lg:top-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-(--text-heading)">
                  Order Summary
                </h2>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-(--text-secondary) text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      Rs. {parseFloat(subtotal).toLocaleString()}
                    </span>
                  </div>

                  {/* Promotion savings (item-level) */}
                  {parseFloat(promotionSavings) > 0 && (
                    <div className="flex justify-between text-green-600 text-sm sm:text-base">
                      <span>Promotion savings</span>
                      <span className="font-medium">
                        −Rs. {parseFloat(promotionSavings).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Coupon discount */}
                  {appliedCoupon && parseFloat(discountAmount) > 0 && (
                    <div className="flex justify-between text-green-600 text-sm sm:text-base">
                      <span>
                        Coupon ({appliedCoupon.code}
                        {discountPct ? ` · ${discountPct}%` : ""})
                      </span>
                      <span className="font-medium">
                        −Rs. {parseFloat(discountAmount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-(--text-secondary) text-sm sm:text-base">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {!shippingAmount || parseFloat(shippingAmount) === 0
                        ? "Free"
                        : `Rs. ${parseFloat(shippingAmount).toLocaleString()}`}
                    </span>
                  </div>

                  {parseFloat(taxAmount) > 0 && (
                    <div className="flex justify-between text-(--text-secondary) text-sm sm:text-base">
                      <span>Tax{taxRate ? ` (${taxRate}%)` : ""}</span>
                      <span className="font-medium">
                        Rs. {parseFloat(taxAmount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-(--border-default) pt-3 sm:pt-4">
                    <div className="flex justify-between text-base sm:text-lg">
                      <span className="font-semibold text-(--text-heading)">
                        Total
                      </span>
                      <span className="font-bold text-(--text-heading) text-lg sm:text-xl">
                        Rs. {parseFloat(total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={"/checkout"}
                  className="w-full bg-(--btn-bg-primary) text-(--btn-text-primary) px-4 sm:px-6 py-3 sm:py-4 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-base sm:text-lg mb-3 sm:mb-4 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </Link>

                <Link
                  href={"/shop"}
                  className="w-full flex justify-center border-2 border-(--border-inverse) text-(--text-primary) px-4 sm:px-6 py-2.5 sm:py-3 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium text-sm sm:text-base"
                >
                  Continue Shopping
                </Link>

                {/* Features */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-(--border-default) space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--bg-surface) rounded-full flex items-center justify-center shrink-0">
                      <Truck
                        size={16}
                        className="text-(--color-brand-primary) sm:w-4.5 sm:h-4.5"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm text-(--text-heading)">
                        Free Shipping
                      </p>
                      <p className="text-[10px] sm:text-xs text-(--text-secondary)">
                        On orders over Rs. 50,000
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--bg-surface) rounded-full flex items-center justify-center shrink-0">
                      <Shield
                        size={16}
                        className="text-(--color-brand-primary) sm:w-4.5 sm:h-4.5"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm text-(--text-heading)">
                        Secure Payment
                      </p>
                      <p className="text-[10px] sm:text-xs text-(--text-secondary)">
                        100% secure transactions
              </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--bg-surface) rounded-full flex items-center justify-center shrink-0">
                      <CreditCard
                        size={16}
                        className="text-(--color-brand-primary) sm:w-4.5 sm:h-4.5"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm text-(--text-heading)">
                        Easy Returns
                      </p>
                      <p className="text-[10px] sm:text-xs text-(--text-secondary)">
                        30-day return policy
                      </p>
                    </div>
                  </div>
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