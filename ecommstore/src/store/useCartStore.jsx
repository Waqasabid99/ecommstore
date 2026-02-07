import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/components/ui/axios";

const useCartStore = create(
  persist(
    (set, get) => ({
      // =====================
      // STATE
      // =====================
      cart: null, // Full cart object from backend
      items: [], // Cart items array
      summary: null, // Cart summary (itemCount, subtotal, etc.)
      issues: [], // Items with availability/price issues
      guestCart: [], // Guest user cart (local only)
      isLoading: false,
      error: null,

      // =====================
      // COMPUTED VALUES
      // =====================
      
      /**
       * Get cart items based on user authentication
       * @returns {Array} Cart items
       */
      getCartItems: () => {
        const state = get();
        const user = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
          : null;

        return user ? state.items : state.guestCart;
      },

      /**
       * Calculate cart summary (item count, quantity, subtotal)
       * @returns {Object} Summary object
       */
      getCartSummary: () => {
        const state = get();
        const items = get().getCartItems();
        const user = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
          : null;

        // Return cached summary for authenticated users
        if (user && state.summary) {
          return state.summary;
        }

        // Calculate for guest users
        let itemCount = 0;
        let totalQuantity = 0;
        let subtotal = 0;

        items.forEach((item) => {
          itemCount++;
          totalQuantity += item.quantity;
          subtotal += parseFloat(item.itemTotal || 0);
        });

        return {
          itemCount,
          totalQuantity,
          subtotal: subtotal.toFixed(2),
        };
      },

      /**
       * Check if cart has items with issues
       * @returns {boolean}
       */
      hasIssues: () => {
        const state = get();
        const items = get().getCartItems();
        return items.some(item => item.hasIssues);
      },

      // =====================
      // INITIALIZE CART
      // =====================
      
      /**
       * Initialize cart for authenticated users
       * Fetches cart from backend and syncs state
       */
      initializeCart: async () => {
        const user = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
          : null;

        if (!user) {
          set({ cart: null, items: [], summary: null });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get("/cart");
          
          set({
            cart: data.data.cart,
            items: data.data.items || [],
            summary: data.data.summary,
            issues: data.data.issues || [],
            isLoading: false,
          });
        } catch (err) {
          console.error("Initialize cart error:", err);
          set({
            error: err.response?.data?.error || "Failed to load cart",
            isLoading: false,
          });
        }
      },

      // =====================
      // ADD TO CART
      // =====================

      /**
       * Add item to cart (routes to authenticated or guest)
       * @param {Object} params - Product and variant details
       */
      addToCart: async ({ variantId, quantity = 1, product, variant }) => {
        const user = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
          : null;

        if (user) {
          return get().addToCartAuthenticated({ variantId, quantity });
        } else {
          return get().addToCartGuest({ variantId, quantity, product, variant });
        }
      },

      /**
       * Add item to cart for authenticated users
       */
      addToCartAuthenticated: async ({ variantId, quantity }) => {
        if (!variantId) {
          return { success: false, error: "Variant ID is required" };
        }

        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/cart/add-to-cart", {
            variantId,
            quantity,
          });

          // Refresh cart to get updated state
          await get().initializeCart();

          set({ isLoading: false });
          return { success: true, data: data.data };
        } catch (err) {
          const errorMsg = err.response?.data?.error || "Failed to add item to cart";
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Add item to guest cart (local storage)
       * Follows backend format structure
       */
      addToCartGuest: ({ variantId, quantity, product, variant }) => {
        const state = get();
        const guestCart = [...state.guestCart];

        // Find existing item by variantId
        const existingIndex = guestCart.findIndex(
          (item) => item.variantId === variantId
        );

        const availableStock = variant?.inventory?.quantity || 99;
        const price = parseFloat(variant?.price || 0);

        if (existingIndex > -1) {
          // Update existing item quantity
          const existingItem = guestCart[existingIndex];
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            availableStock,
            99
          );

          const itemTotal = (price * newQuantity).toFixed(2);

          guestCart[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
            itemTotal,
            updatedAt: new Date().toISOString(),
          };
        } else {
          // Add new item in backend format
          const finalQuantity = Math.min(quantity, availableStock, 99);
          const itemTotal = (price * finalQuantity).toFixed(2);
          
          const newItem = {
            id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            variantId,
            
            name: variant?.name || product?.name || "Unknown Product",
            description: variant?.description || product?.description || null,
            sku: variant?.sku || null,
            
            quantity: finalQuantity,
            price: price.toFixed(2),
            itemTotal,
            
            thumbnail: product?.thumbnail || null,
            images: product?.images?.map(img => img.url) || [],
            category: product?.category?.name || null,
            
            product: {
              id: product?.id || null,
              slug: product?.slug || null,
              category: product?.category || null,
            },
            
            availableStock,
            hasIssues: false,
            issues: [],
            
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          guestCart.push(newItem);
        }

        set({ guestCart });
        return { success: true };
      },

      // =====================
      // UPDATE CART ITEM
      // =====================

      /**
       * Update cart item quantity
       */
      updateCartItem: async (itemId, quantity) => {
        const user = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
          : null;

        if (user) {
          return get().updateCartItemAuthenticated(itemId, quantity);
        } else {
          return get().updateCartItemGuest(itemId, quantity);
        }
      },

      /**
       * Update cart item for authenticated users
       */
      updateCartItemAuthenticated: async (itemId, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          return { success: false, error: "Quantity must be between 1 and 99" };
        }

        set({ isLoading: true, error: null });
        try {
          const { data } = await api.patch(`/cart/update-item/${itemId}`, { quantity });

          // Refresh cart
          await get().initializeCart();

          set({ isLoading: false });
          return { success: true, data: data.data };
        } catch (err) {
          const errorMsg = err.response?.data?.error || "Failed to update item";
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Update guest cart item
       * Recalculates itemTotal based on new quantity
       */
      updateCartItemGuest: (itemId, newQuantity) => {
        const state = get();

        const guestCart = state.guestCart.map((item) => {
          if (item.id !== itemId) return item;

          const availableStock = item.availableStock || 99;
          const finalQuantity = Math.min(Math.max(1, newQuantity), availableStock, 99);
          const price = parseFloat(item.price || 0);
          const itemTotal = (price * finalQuantity).toFixed(2);

          return {
            ...item,
            quantity: finalQuantity,
            itemTotal,
            updatedAt: new Date().toISOString(),
          };
        });

        set({ guestCart });
        return { success: true };
      },

      // =====================
      // REMOVE CART ITEM
      // =====================

      /**
       * Remove item from cart
       */
      removeCartItem: async (itemId) => {
        const user = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
          : null;

        if (user) {
          return get().removeCartItemAuthenticated(itemId);
        } else {
          return get().removeCartItemGuest(itemId);
        }
      },

      /**
       * Remove cart item for authenticated users
       */
      removeCartItemAuthenticated: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/cart/remove-item/${itemId}`);

          // Refresh cart
          await get().initializeCart();

          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          const errorMsg = err.response?.data?.error || "Failed to remove item";
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Remove guest cart item
       */
      removeCartItemGuest: (itemId) => {
        const state = get();
        const guestCart = state.guestCart.filter((item) => item.id !== itemId);
        set({ guestCart });
        return { success: true };
      },

      // =====================
      // CLEAR CART
      // =====================

      /**
       * Clear all items from cart
       */
      clearCart: async () => {
        const user = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
          : null;

        if (user) {
          return get().clearCartAuthenticated();
        } else {
          return get().clearCartGuest();
        }
      },

      /**
       * Clear cart for authenticated users
       */
      clearCartAuthenticated: async () => {
        set({ isLoading: true, error: null });
        try {
          await api.delete("/cart/clear-cart");
          
          set({
            cart: null,
            items: [],
            summary: null,
            issues: [],
            isLoading: false,
          });
          
          return { success: true };
        } catch (err) {
          const errorMsg = err.response?.data?.error || "Failed to clear cart";
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Clear guest cart
       */
      clearCartGuest: () => {
        set({ guestCart: [] });
        return { success: true };
      },

      // =====================
      // MERGE GUEST CART
      // =====================

      /**
       * Merge guest cart into authenticated cart after login
       */
/**
 * Merge guest cart into authenticated cart after login
 * @param {Object} currentUser - Optional user object to avoid localStorage race condition
 */
mergeGuestCart: async (currentUser) => {
  const state = get();
  const guestCart = state.guestCart;

  if (!guestCart || guestCart.length === 0) {
    return { success: true, mergedCount: 0 };
  }

  // Use passed user or fallback to reading from storage
  const user = currentUser || (typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
    : null);

  if (!user) {
    console.warn("mergeGuestCart called without user context");
    return { success: false, error: "User not authenticated" };
  }

  set({ isLoading: true, error: null });
  try {
    // Transform guest cart to API format
    const items = guestCart
      .map((item) => ({
        variantId: item.variantId, // Changed from productVariantId to match your backend
        quantity: item.quantity,
      }))
      .filter((item) => item.variantId);

    if (items.length === 0) {
      set({ guestCart: [], isLoading: false });
      return { success: true, mergedCount: 0 };
    }

    const { data } = await api.post("/cart/merge", { items });

    // Clear guest cart and load authenticated cart
    set({ guestCart: [], isLoading: false });
    await get().initializeCart();

    return {
      success: true,
      mergedCount: data.data.mergedCount,
      skippedCount: data.data.skippedCount,
      merged: data.data.merged,
      skipped: data.data.skipped,
    };
  } catch (err) {
    console.error("Merge cart error:", err);
    const errorMsg = err.response?.data?.error || "Failed to merge cart";
    set({ error: errorMsg, isLoading: false });
    return { success: false, error: errorMsg };
  }
},

      // =====================
      // UTILITY FUNCTIONS
      // =====================

      /**
       * Reset cart state (called on logout)
       */
      resetCart: () => {
        set({
          cart: null,
          items: [],
          summary: null,
          issues: [],
          guestCart: [],
          isLoading: false,
          error: null,
        });
      },

      /**
       * Clear error message
       */
      clearError: () => set({ error: null }),

      /**
       * Get item by variant ID
       */
      getItemByVariantId: (variantId) => {
        const items = get().getCartItems();
        return items.find((item) => item.variantId === variantId);
      },

      /**
       * Check if variant exists in cart
       */
      isInCart: (variantId) => {
        return !!get().getItemByVariantId(variantId);
      },

      /**
       * Get quantity of specific variant in cart
       */
      getVariantQuantity: (variantId) => {
        const item = get().getItemByVariantId(variantId);
        return item?.quantity || 0;
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        guestCart: state.guestCart, // Only persist guest cart
      }),
    }
  )
);

export default useCartStore;