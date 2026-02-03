"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Search,
  Plus,
  Trash2,
  User,
  Package,
  MapPin,
  CreditCard,
  ShoppingCart,
  X,
  LoaderIcon,
  AlertCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const CreateOrder = () => {
  const { adminID } = useParams();
  const navigate = useRouter();

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [notes, setNotes] = useState("");

  // Search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Loading states
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Fetch customers
  useEffect(() => {
    if (customerSearch.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchCustomers();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setCustomers([]);
    }
  }, [customerSearch]);

  // Fetch products
  useEffect(() => {
    if (productSearch.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchProducts();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setProducts([]);
    }
  }, [productSearch]);

  const fetchCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const { data } = await axios.get(`${baseUrl}/users`, {
        params: { search: customerSearch, limit: 10 },
        withCredentials: true,
      });

      if (data.success) {
        setCustomers(data.data);
        setShowCustomerDropdown(true);
      }
    } catch (error) {
      console.error("Fetch customers error:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const { data } = await axios.get(`${baseUrl}/products`, {
        params: { page: 1, limit: 10, isActive: true },
        withCredentials: true,
      });

      if (data.success) {
        setProducts(data.data);
        setShowProductDropdown(true);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.userName || customer.email);
    setShowCustomerDropdown(false);
    
    // Pre-fill shipping address if customer has saved addresses
    if (customer.address && customer.address.length > 0) {
      const defaultAddress = customer.address[0];
      setShippingAddress({
        fullName: defaultAddress.fullName || customer.userName,
        street: defaultAddress.street || "",
        city: defaultAddress.city || "",
        state: defaultAddress.state || "",
        zipCode: defaultAddress.zipCode || "",
        country: defaultAddress.country || "",
        phone: defaultAddress.phone || "",
      });
    } else {
      setShippingAddress({
        ...shippingAddress,
        fullName: customer.userName || "",
      });
    }

    setErrors({ ...errors, customer: null });
  };

  const handleAddProduct = (product) => {
    // Check if product has variants
    if (!product.variants || product.variants.length === 0) {
      toast.error("Product has no available variants");
      return;
    }

    const firstVariant = product.variants[0];

    // Check if already added
    const existingItem = orderItems.find(
      (item) => item.variantId === firstVariant.id
    );

    if (existingItem) {
      // Increase quantity
      setOrderItems(
        orderItems.map((item) =>
          item.variantId === firstVariant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          variantId: firstVariant.id,
          productId: product.id,
          productName: product.name,
          sku: firstVariant.sku,
          price: firstVariant.price,
          quantity: 1,
          availableQty: firstVariant.availableQty,
          thumbnail: product.thumbnail,
        },
      ]);
    }

    setProductSearch("");
    setShowProductDropdown(false);
    setErrors({ ...errors, items: null });
  };

  const handleUpdateQuantity = (variantId, newQuantity) => {
    const item = orderItems.find((i) => i.variantId === variantId);

    if (newQuantity > item.availableQty) {
      toast.error(`Only ${item.availableQty} units available in stock`);
      return;
    }

    if (newQuantity < 1) {
      handleRemoveItem(variantId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (variantId) => {
    setOrderItems(orderItems.filter((item) => item.variantId !== variantId));
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCustomer) {
      newErrors.customer = "Please select a customer";
    }

    if (orderItems.length === 0) {
      newErrors.items = "Please add at least one product";
    }

    const requiredAddressFields = [
      "fullName",
      "street",
      "city",
      "zipCode",
      "phone",
    ];
    requiredAddressFields.forEach((field) => {
      if (!shippingAddress[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        userId: selectedCustomer.id,
        items: orderItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        notes: notes.trim() || null,
        totalAmount: calculateTotal(),
      };

      const { data } = await axios.post(
        `${baseUrl}/orders/create`,
        orderData,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Order created successfully");
        setTimeout(() => {
          navigate.push(`/admin/${adminID}/orders`);
        }, 1500);
      }
    } catch (error) {
      console.error("Create order error:", error);
      toast.error(
        error.response?.data?.error || "Failed to create order"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Create Order"
        subHeading="Create a new order for a customer"
        button={
          <button
            onClick={() => navigate.push(`/admin/${adminID}/orders`)}
            className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} />
            <h2 className="text-xl font-semibold">Customer Information</h2>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Customer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  if (!e.target.value) {
                    setSelectedCustomer(null);
                  }
                }}
                onFocus={() => customerSearch.length >= 2 && setShowCustomerDropdown(true)}
                className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:border-black ${
                  errors.customer ? "border-red-500" : "border-gray-300"
                }`}
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              {isLoadingCustomers && (
                <LoaderIcon
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400"
                />
              )}
            </div>

            {/* Customer Dropdown */}
            {showCustomerDropdown && customers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{customer.userName}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                    {selectedCustomer?.id === customer.id && (
                      <Check size={18} className="text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {errors.customer && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.customer}
              </p>
            )}
          </div>

          {/* Selected Customer Card */}
          {selectedCustomer && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-green-800">
                    {selectedCustomer.userName}
                  </div>
                  <div className="text-sm text-green-600">
                    {selectedCustomer.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearch("");
                  }}
                  className="p-2 hover:bg-green-100 rounded transition-colors"
                >
                  <X size={18} className="text-green-800" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Selection */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} />
            <h2 className="text-xl font-semibold">Order Items</h2>
          </div>

          <div className="relative mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Products <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                onFocus={() => productSearch.length >= 2 && setShowProductDropdown(true)}
                className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:border-black ${
                  errors.items ? "border-red-500" : "border-gray-300"
                }`}
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              {isLoadingProducts && (
                <LoaderIcon
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400"
                />
              )}
            </div>

            {/* Product Dropdown */}
            {showProductDropdown && products.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleAddProduct(product)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {product.thumbnail && (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.variants?.length > 0 && (
                            <span>
                              ${product.variants[0].price} • Stock:{" "}
                              {product.variants[0].availableQty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.items && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.items}
              </p>
            )}
          </div>

          {/* Order Items List */}
          {orderItems.length > 0 ? (
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{item.productName}</div>
                    <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                    <div className="text-sm font-medium text-gray-700">
                      ${item.price} each
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.availableQty}
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(
                          item.variantId,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <div className="font-semibold min-w-20 text-right">
                    ${(item.price * item.quantity)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.variantId)}
                    className="p-2 hover:bg-red-50 rounded text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {/* Order Total */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Order Total</div>
                  <div className="text-2xl font-bold">
                    ${calculateTotal()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
              <p>No items added yet</p>
            </div>
          )}
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} />
            <h2 className="text-xl font-semibold">Shipping Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingAddress.fullName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    fullName: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-black ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    phone: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-black ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingAddress.street}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    street: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-black ${
                  errors.street ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-500">{errors.street}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-black ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={shippingAddress.state}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    state: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingAddress.zipCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    zipCode: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-black ${
                  errors.zipCode ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={shippingAddress.country}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    country: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Payment & Notes */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={20} />
            <h2 className="text-xl font-semibold">Payment & Additional Info</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                <option value="STRIPE">Credit/Debit Card</option>
                <option value="PAYPAL">PayPal</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add any special instructions or notes for this order..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate.push(`/admin/${adminID}/orders`)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoaderIcon size={18} className="animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <Check size={18} />
                Create Order
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateOrder;