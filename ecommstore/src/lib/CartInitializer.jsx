'use client';

import useCartStore from "@/store/useCartStore";
import useAuthStore from "@/store/authStore";
import { useEffect } from "react";

const CartInitializer = ({ children }) => {
  const initializeCart = useCartStore((state) => state.initializeCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Pass the user directly from authStore — this avoids the race condition
    // where localStorage hasn't been written yet by Zustand persist when
    // initializeCart tries to read it. authStore is already rehydrated by
    // the time this effect fires, so `user` here is always accurate.
    initializeCart(isAuthenticated ? user : null);
  }, [isAuthenticated, user, initializeCart]);

  return <>{children}</>;
};

export default CartInitializer;