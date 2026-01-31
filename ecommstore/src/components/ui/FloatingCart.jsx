"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import useCartStore from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "./Loader";
import Image from "next/image";

const FloatingCart = () => {
  const { getCartItems, getCartSummary, updateCartItem, removeCartItem } =
    useCartStore();
  const { totalQuantity, subtotal } = getCartSummary();
  const cartItems = getCartItems();
  const [isLoading, setIsLoading] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

const updateQuantity = async (itemId, currentQty, delta) => {
  const newQty = currentQty + delta;
  if (newQty < 1 || newQty > 99) return;

  setIsLoading(itemId);

  try {
    await updateCartItem(itemId, newQty);
  } finally {
    setIsLoading(null);
  }
};

  const removeItem = (itemId) => {
    removeCartItem(itemId);
  };

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3 rounded-full shadow-lg transition-all duration-300"
        style={{
          backgroundColor: "var(--cart-bg)",
          color: "var(--cart-text)",
        }}
        whileHover={{
          scale: 1.05,
          backgroundColor: "var(--cart-bg-hover)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {totalQuantity > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: "var(--color-brand-primary)",
                color: "var(--color-white)",
              }}
            >
              {totalQuantity}
            </motion.span>
          )}
        </div>
        <span className="font-semibold hidden sm:inline">Cart</span>
      </motion.button>

      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Cart Slide Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-50 shadow-2xl flex flex-col w-full md:w-125 lg:w-112.5"
            style={{
              backgroundColor: "var(--bg-page)",
            }}
          >
            {/* Header */}
            <div
              className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: "var(--border-default)" }}
            >
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-heading)" }}
                >
                  Shopping Cart
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full transition-colors hover:bg-gray-100"
                style={{ color: "var(--icon-default)" }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <ShoppingCart
                    size={64}
                    className="mb-4"
                    style={{ color: "var(--icon-muted)" }}
                  />
                  <p
                    className="text-lg font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Your cart is empty
                  </p>
                </div>
              ) : (
                cartItems?.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 p-4 rounded-lg border"
                    style={{
                      borderColor: "var(--border-default)",
                      backgroundColor: "var(--color-white)",
                    }}
                  >
                    <Image
                      src={`${item?.thumbnail}` || "/placeholder.png"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <Link href={`/shop/products/${item?.product?.slug}`}>
                        <h3
                          className="font-semibold mb-1"
                          style={{ color: "var(--text-heading)" }}
                        >
                          {item.name}
                        </h3>
                      </Link>
                      <p
                        className="text-lg font-bold mb-2"
                        style={{ color: "var(--color-brand-primary)" }}
                      >
                        ${item?.price}
                      </p>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center gap-2 border rounded-lg"
                          style={{ borderColor: "var(--border-default)" }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity, -1)
                            }
                            className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 flex font-medium">
                            {isLoading === item.id ? (
                              <Loader text="" size="md" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity, 1)
                            }
                            className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(cartItems?.[0].id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div
                className="p-6 border-t space-y-4"
                style={{
                  borderColor: "var(--border-default)",
                  backgroundColor: "var(--bg-surface)",
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Subtotal
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-heading)" }}
                  >
                    ${subtotal}
                  </span>
                </div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Shipping and taxes calculated at checkout
                </p>
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: "var(--btn-bg-primary)",
                    color: "var(--btn-text-primary)",
                  }}
                >
                  Checkout
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 rounded-lg font-medium border transition-colors hover:bg-gray-100"
                  style={{
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCart;
