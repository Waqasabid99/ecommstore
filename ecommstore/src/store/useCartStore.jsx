import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/components/ui/axios";

const useCartStore = create(
  persist(
    (set, get) => ({
      // STATE
      cart: null, // Full cart object for authenticated users
      guestCart: [], // Array of items for guest users
      isLoading: false,
      error: null,

      // COMPUTED VALUES
      getCartItems: () => {
        const state = get();
        const user = typeof window !== "undefined" 
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user 
          : null;
        
        if (user) {
          return state.cart?.items || [];
        }
        return state.guestCart || [];
      },

      getCartSummary: () => {
        const items = get().getCartItems();
        const user = typeof window !== "undefined" 
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user 
          : null;

        let itemCount = 0;
        let totalQuantity = 0;
        let subtotal = 0;

        if (user) {
          // Authenticated user - calculate from cart items
          items.forEach((item) => {
            itemCount++;
            totalQuantity += item.quantity;
            const price = item.productVariant?.price || item.price || 0;
            subtotal += price * item.quantity;
          });
        } else {
          // Guest user
          items.forEach((item) => {
            itemCount++;
            totalQuantity += item.quantity;
            const price = item.variant 
              ? item.variant.price 
              : item.product?.price || 0;
            subtotal += price * item.quantity;
          });
        }

        return {
          itemCount,
          totalQuantity,
          subtotal: subtotal.toFixed(2),
        };
      },

      // INITIALIZE CART (called on app load if user is authenticated)
      initializeCart: async () => {
        const user = typeof window !== "undefined" 
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user 
          : null;

        if (!user) {
          // For guest, just ensure guestCart is initialized
          set({ cart: null });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get("/cart");
          set({ 
            cart: data.data, 
            isLoading: false,
            guestCart: [] // Clear guest cart when authenticated
          });
        } catch (err) {
          console.error("Initialize cart error:", err);
          set({ 
            error: err.response?.data?.error || "Failed to load cart",
            isLoading: false 
          });
        }
      },

      // ADD TO CART
      addToCart: async ({ productId, variantId, quantity = 1, product, variant }) => {
        const user = typeof window !== "undefined" 
          ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user 
          : null;

        if (user) {
          // AUTHENTICATED USER - Call API
          return get().addToCartAuthenticated({ productId, variantId, quantity });
        } else {
          // GUEST USER - Update local storage
          return get().addToCartGuest({ productId, variantId, quantity, product, variant });
        }
      },

      // ADD TO CART - AUTHENTICATED
      addToCartAuthenticated: async ({ productId, variantId, quantity }) => {
        set({ isLoading: true, error: null });
        try {
          const payload = variantId 
            ? { variantId, quantity }
            : { productId, quantity };

          const { data } = await api.post("/cart/add-to-cart", payload);
          
          // Refresh cart to get updated items
          await get().initializeCart();
          
          set({ isLoading: false });
          return { success: true, data: data.data };
        } catch (err) {
          const errorMsg = err.response?.data?.error || "Failed to add item to cart";
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      // ADD TO CART - GUEST
      addToCartGuest: ({ productId, variantId, quantity, product, variant }) => {
        const state = get();
        const guestCart = [...state.guestCart];

        // Find existing item
        const existingIndex = guestCart.findIndex(item => {
          if (variantId) {
            return item.variantId === variantId;
          }
          return item.productId === productId && !item.variantId;
        });

        if (existingIndex > -1) {
          // Update quantity
          const existingItem = guestCart[existingIndex];
          const availableStock = variant?.inventory?.quantity || product?.inventory?.quantity || 99;
          const newQuantity = Math.min(existingItem.quantity + quantity, availableStock, 99);
          
          guestCart[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };
        } else {
          // Add new item
          const newItem = {
            id: `guest-${Date.now()}-${Math.random()}`, // Temporary ID
            productId: productId || null,
            variantId: variantId || null,
            quantity,
            product: product || null,
            variant: variant || null,
            addedAt: new Date().toISOString(),
          };
          guestCart.push(newItem);
        }

        set({ guestCart });
        return { success: true };
      },

      // UPDATE CART ITEM
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

      // UPDATE CART ITEM - AUTHENTICATED
      updateCartItemAuthenticated: async (itemId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.patch(`/cart/update-item/${itemId}`, { quantity });
          
          // Refresh cart
          // await get().initializeCart();
          
          set({ isLoading: false });
          return { success: true, data: data.data };
        } catch (err) {
          const errorMsg = err.response?.data?.error || "Failed to update item";
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      // UPDATE CART ITEM - GUEST
      updateCartItemGuest: (itemId, newQuantity) => {
        const state = get();

        const guestCart = state.guestCart.map(item => {
          if (item.id !== itemId) return item;

          const availableStock =
            item.variant?.inventory?.quantity ??
            item.product?.inventory?.quantity ??
            99;

          return {
            ...item,
            quantity: Math.min(Math.max(1, newQuantity), availableStock, 99),
          };
        });

        set({ guestCart });
        return { success: true };
      },


      // REMOVE CART ITEM
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

      // REMOVE CART ITEM - AUTHENTICATED
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

      // REMOVE CART ITEM - GUEST
      removeCartItemGuest: (itemId) => {
        const state = get();
        const guestCart = state.guestCart.filter(item => item.id !== itemId);
        set({ guestCart });
        return { success: true };
      },

      // CLEAR CART
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

      // CLEAR CART - AUTHENTICATED
      clearCartAuthenticated: async () => {
        set({ isLoading: true, error: null });
        try {
          await api.delete("/cart/clear-cart");
          set({ cart: null, isLoading: false });
          return { success: true };
        } catch (err) {
          const errorMsg = err.response?.data?.error || "Failed to clear cart";
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      // CLEAR CART - GUEST
      clearCartGuest: () => {
        set({ guestCart: [] });
        return { success: true };
      },

      // MERGE GUEST CART (called after login)
      mergeGuestCart: async () => {
        const state = get();
        const guestCart = state.guestCart;

        if (!guestCart || guestCart.length === 0) {
          return { success: true, mergedCount: 0 };
        }

        set({ isLoading: true, error: null });
        try {
          // Transform guest cart to API format
          const items = guestCart.map(item => ({
            variantId: item.variantId || null,
            productId: item.productId || null,
            quantity: item.quantity,
          })).filter(item => item.variantId || item.productId);

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
            skippedCount: data.data.skippedCount 
          };
        } catch (err) {
          console.error("Merge cart error:", err);
          const errorMsg = err.response?.data?.error || "Failed to merge cart";
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      // RESET CART (called on logout)
      resetCart: () => {
        set({ 
          cart: null, 
          guestCart: [], 
          isLoading: false, 
          error: null 
        });
      },

      // CLEAR ERROR
      clearError: () => set({ error: null }),
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