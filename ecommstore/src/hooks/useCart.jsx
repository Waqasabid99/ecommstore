// 'use client';
// import { useEffect } from 'react';
// import useAuth from '@/hooks/useAuth';
// import useCartStore from '@/store/useCartStore';

// /**
//  * Custom hook for cart management
//  * Handles cart initialization and guest cart merging
//  */
// export default function useCart() {
//   const { isAuthenticated, isLoading: authLoading } = useAuth();
  
//   const {
//     items,
//     guestCartItems,
//     summary,
//     isLoading,
//     isInitialized,
//     error,
//     issues,
//     initializeCart,
//     addToCart,
//     updateCartItem,
//     removeCartItem,
//     clearCart,
//     mergeGuestCart,
//     addToGuestCart,
//     updateGuestCartItem,
//     removeGuestCartItem,
//     clearGuestCart,
//     isInCart,
//     getItemQuantity,
//     getTotalItemsCount,
//     getTotalQuantity,
//     clearError,
//   } = useCartStore();

//   // Initialize cart when auth state is ready
//   useEffect(() => {
//     if (!authLoading && !isInitialized) {
//       if (isAuthenticated) {
//         initializeCart();
//       } else {
//         // Mark as initialized for guest users
//         useCartStore.setState({ isInitialized: true });
//       }
//     }
//   }, [isAuthenticated, authLoading, isInitialized, initializeCart]);

//   return {
//     // State
//     items: isAuthenticated ? items : guestCartItems,
//     summary,
//     isLoading,
//     error,
//     issues,
    
//     // Actions for authenticated users
//     addToCart: isAuthenticated ? addToCart : addToGuestCart,
//     updateCartItem: isAuthenticated ? updateCartItem : updateGuestCartItem,
//     removeCartItem: isAuthenticated ? removeCartItem : removeGuestCartItem,
//     clearCart: isAuthenticated ? clearCart : clearGuestCart,
    
//     // Utility functions
//     isInCart,
//     getItemQuantity,
//     getTotalItemsCount,
//     getTotalQuantity,
//     clearError,
    
//     // Additional info
//     isAuthenticated,
//     hasGuestItems: guestCartItems.length > 0,
//   };
// }