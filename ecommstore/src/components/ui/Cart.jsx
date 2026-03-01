import { baseUrl } from "@/lib/utils";
import useCartStore from "@/store/useCartStore";
import useAuthStore from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";

const Cart = () => {
  const { user } = useAuthStore();
  const { getCartItems, getCartSummary, updateCartItem, removeCartItem } = useCartStore();
  const { itemCount, totalQuantity, subtotal } = getCartSummary(user);
  const cartItems = getCartItems(user);
  console.log(cartItems)
  const updateQuantity = (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1 || newQty > 99) return;
    updateCartItem(itemId, newQty);
  };


  const removeItem = (itemId) => {
    removeCartItem(itemId);
  };

  return (
    <div className="absolute right-30 top-30 w-72 sm:w-80 bg-(--bg-page) rounded-lg shadow-lg border border-(--border-default) overflow-hidden z-50 transition-colors duration-300">
      {/* Header */}
      <div className="p-3 border-b border-(--border-default)">
        <h3 className="font-medium text-(--text-heading)">
          Cart ({itemCount})
        </h3>
      </div>

      {/* Cart Items */}
      <div className="max-h-64 overflow-y-auto overflow-x-hidden">
        {itemCount?.length > 0 ? (
          cartItems?.map(({ product: item }) => (
            <div
              key={item.id}
              className="flex items-center px-1 py-2 border-b border-(--border-default)"
            >
              <Image
                src={`${item.thumbnail}` || '/placeholder.png'}
                width={40}
                height={40}
                alt={item.name}
                className="w-10 h-10 object-cover rounded"
              />
              <div className="flex-1 px-3">
                <p className="text-sm text-(--text-heading) truncate">
                  {item.name.substring(0, 25).concat("...")}
                </p>
              </div>
              <div className="text-sm text-(--text-secondary) mr-2">
                {cartItems?.map(({ quantity }) => quantity) || 0}
              </div>
              <button
                onClick={() => removeFromCart(cartItems?.[0].id)}
                className="text-(--text-secondary) hover:text-red-500 transition-colors duration-200"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-(--text-secondary) text-sm">
            Cart is empty
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-(--border-default)">
        <Link href={"/checkout"} className="w-full bg-(--btn-bg-primary) text-(--btn-text-primary) py-2 rounded text-sm hover:bg-(--btn-bg-hover-secondary) transition-colors duration-300">
          Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;
