'use client';

import useCartStore from "@/store/useCartStore";
import { useEffect } from "react";

const CartInitializer = ({children}) => {
    const initializeCart = useCartStore((state) => state.initializeCart);

    useEffect(() => {
        initializeCart();
    }, [initializeCart]);

  return (
    <div>{children}</div>
  )
}

export default CartInitializer