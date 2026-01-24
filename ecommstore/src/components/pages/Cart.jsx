"use client";
import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import useCartStore from "@/store/useCartStore";
import { baseUrl } from "@/lib/utils";

const Cart = () => {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const { getCartItems, getCartSummary, updateCartItem, removeCartItem } = useCartStore();
  const { totalQuantity, subtotal } = getCartSummary();
  const cartItems = getCartItems();

  const updateQuantity = (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1 || newQty > 99) return;
    updateCartItem(itemId, newQty);
  };

  const removeItem = (itemId) => {
    removeCartItem(itemId);
  };

  const mainImage =
    cartItems.images?.find((img) => img.isMain)?.url ||
    cartItems.images?.[0]?.url ||
    "/placeholder.png";

  // Calculate totals
  const discount = appliedPromo ? subtotal * 0.1 : 0; // 10% discount example
  const shipping = subtotal > 50000 ? 0 : 299; // Free shipping over Rs. 50,000
  const tax = (subtotal - discount) * 0.17; // 17% tax
  const total = subtotal - discount + shipping + tax;

  const applyPromoCode = () => {
    if (promoCode.trim().toUpperCase() === "SAVE10") {
      setAppliedPromo("SAVE10");
      alert("Promo code applied! 10% discount added.");
    } else {
      alert("Invalid promo code");
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        {/* Empty Cart */}
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
                Looks like you haven't added anything to your cart yet. Start
                shopping to find amazing deals!
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
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cart Items List */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-(--border-default) rounded-xl p-4 md:p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 bg-(--bg-surface) rounded-lg overflow-hidden">
                      <img
                        src={`${item.images ? `${baseUrl}${mainImage}` : "/placeholder.png"}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          {/* <span className="text-[10px] text-(--text-inverse) bg-(--bg-primary) border border-(--border-default) rounded-full px-3 py-1 inline-block mb-2">
                            {item.category}
                          </span> */}
                          <h3 className="font-semibold text-(--text-heading) text-lg mb-1">
                            {item.name}
                          </h3>
                          {/* <p className="text-xs text-(--text-secondary) capitalize">
                            Category: {item.category}
                          </p> */}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-(--text-secondary) hover:text-red-500 transition-colors p-2"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-(--text-secondary) font-medium">
                            Quantity:
                          </span>
                          <div className="flex items-center border border-(--border-default) rounded-full">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity, -1)
                              }
                              className="p-2 hover:bg-(--bg-surface) rounded-l-full transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 font-medium min-w-12 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity, 1)
                              }
                              className="p-2 hover:bg-(--bg-surface) rounded-r-full transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-sm text-(--text-secondary) mb-1">
                            Rs. {item.price} each
                          </div>
                          <div className="text-xl font-bold text-(--text-heading)">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code Section */}
              <div className="bg-[#FFF5F5] border border-(--border-default) rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={20} className="text-(--color-brand-primary)" />
                  <h3 className="font-semibold text-(--text-heading)">
                    Have a Promo Code?
                  </h3>
                </div>

                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-white border border-(--border-primary) rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-(--bg-primary) rounded-full flex items-center justify-center">
                        <Tag size={18} className="text-(--icon-inverse)" />
                      </div>
                      <div>
                        <p className="font-semibold text-(--text-heading)">
                          {appliedPromo}
                        </p>
                        <p className="text-sm text-(--color-brand-primary)">
                          10% discount applied
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-(--text-secondary) hover:text-red-500 transition-colors"
                      aria-label="Remove promo code"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-3 rounded-lg hover:bg-(--btn-bg-hover) transition-all font-medium whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <p className="text-xs text-(--text-secondary) mt-3">
                  Try code:{" "}
                  <span className="font-semibold text-(--color-brand-primary)">
                    SAVE10
                  </span>{" "}
                  for 10% off
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-(--border-default) rounded-xl p-6 sticky top-6">
                <h2 className="text-2xl font-bold mb-6 text-(--text-heading)">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-(--text-secondary)">
                    <span>Subtotal</span>
                    <span className="font-medium">Rs. {subtotal}</span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (10%)</span>
                      <span className="font-medium">
                        -Rs. {discount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-(--text-secondary)">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {shipping === 0
                        ? "Free"
                        : `Rs. ${shipping.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-(--text-secondary)">
                    <span>Tax (17%)</span>
                    <span className="font-medium">
                      Rs. {Math.round(tax).toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-(--border-default) pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-(--text-heading)">
                        Total
                      </span>
                      <span className="font-bold text-(--text-heading) text-xl">
                        Rs. {Math.round(total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={"/checkout"}
                  className="w-full bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-4 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-lg mb-4 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </Link>

                <Link
                  href={"/shop"}
                  className="w-full flex justify-center border-2 border-(--border-inverse) text-(--text-primary) px-6 py-3 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium"
                >
                  Continue Shopping
                </Link>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-(--border-default) space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-(--bg-surface) rounded-full flex items-center justify-center shrink-0">
                      <Truck
                        size={18}
                        className="text-(--color-brand-primary)"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-(--text-heading)">
                        Free Shipping
                      </p>
                      <p className="text-xs text-(--text-secondary)">
                        On orders over Rs. 50,000
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-(--bg-surface) rounded-full flex items-center justify-center shrink-0">
                      <Shield
                        size={18}
                        className="text-(--color-brand-primary)"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-(--text-heading)">
                        Secure Payment
                      </p>
                      <p className="text-xs text-(--text-secondary)">
                        100% secure transactions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-(--bg-surface) rounded-full flex items-center justify-center shrink-0">
                      <CreditCard
                        size={18}
                        className="text-(--color-brand-primary)"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-(--text-heading)">
                        Easy Returns
                      </p>
                      <p className="text-xs text-(--text-secondary)">
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
