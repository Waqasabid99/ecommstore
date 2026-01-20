import { products } from '@/constants/utils'

const Cart = () => {
    const cart = products
    return (
        <div className="absolute right-30 top-30 w-72 sm:w-80 bg-(--bg-page) rounded-lg shadow-lg border border-(--border-default) overflow-hidden z-50 transition-colors duration-300">
            {/* Header */}
            <div className="p-3 border-b border-(--border-default)">
                <h3 className="font-medium text-(--text-heading)">
                    Cart ({cart.length})
                </h3>
            </div>

            {/* Cart Items */}
            <div className="max-h-64 overflow-y-auto overflow-x-hidden">
                {cart.length > 0 ? (
                    cart.map((item) => (
                        <div
                            key={item._id}
                            className="flex items-center px-1 py-2 border-b border-(--border-default)"
                        >
                            <img
                                src={`${item.thumbnail}`}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1 px-3">
                                <p className="text-sm text-(--text-heading) truncate">
                                    {item.name.substring(0, 25).concat('...')}
                                </p>
                            </div>
                            <div className="text-sm text-(--text-secondary) mr-2">
                                {item.quantity}
                            </div>
                            <button onClick={() => removeFromCart(item._id)} className="text-(--text-secondary) hover:text-red-500 transition-colors duration-200">
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
                <button
                    className="w-full bg-(--btn-bg-primary) text-(--btn-text-primary) py-2 rounded text-sm hover:bg-(--btn-bg-hover-secondary) transition-colors duration-300"
                >
                    Checkout
                </button>
            </div>

        </div>
    )
}

export default Cart;