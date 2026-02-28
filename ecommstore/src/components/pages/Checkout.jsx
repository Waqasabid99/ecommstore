"use client";
import { useState, useEffect } from "react";
import {
  CreditCard,
  Truck,
  User,
  Mail,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import Image from "next/image";
import Link from "next/link";
import useCartStore from "@/store/useCartStore";
import useAuthStore from "@/store/authStore";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { baseUrl } from "@/lib/utils";
import Loader from "../ui/Loader";

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [hasAccount, setHasAccount] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [shippingAddressId, setShippingAddressId] = useState(null);
  const [billingAddressId, setBillingAddressId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("STANDARD");
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const { getCartItems, getCartSummary, initializeCart, items, guestCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const { login, register, error: storeError, clearError } = useAuthStore();

  const { subtotal, discountAmount, promotionSavings, taxAmount, total } = getCartSummary();
  const orderItems = getCartItems();

  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  const states = stateOptions.map((state) => ({
    value: state.isoCode,
    label: state.name,
  }));

  const cities = cityOptions.map((city) => ({
    value: city.name,
    label: city.name,
  }));

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    country: "",
    state: "",
    postalCode: "",
  });

  const [billingInfo, setBillingInfo] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [LoginformData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    console.log("Cart Debug:", {
      isAuthenticated,
      serverItems: items,
      guestCart: guestCart,
      getCartItemsResult: getCartItems(),
    });
  }, [isAuthenticated, items, guestCart]);

  // Auto-fill user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setShippingInfo((prev) => ({
        ...prev,
        firstName: user.username?.split(" ")[0] || "",
        lastName: user.username?.split(" ").slice(1).join(" ") || "",
        fullName: user.username || "",
        email: user.email || "",
      }));

    // Also refresh cart to ensure we have latest server state
    const { initializeCart } = useCartStore.getState();
    initializeCart();
    }
  }, [isAuthenticated, user]);

  // Clear auth errors
  useEffect(() => {
    return () => {
      clearError();
      setAuthError("");
    };
  }, [hasAccount, clearError]);

  // Update login form data
  useEffect(() => {
    setLoginFormData({
      email: shippingInfo.email,
      password: shippingInfo.password,
    });
  }, [shippingInfo.email, shippingInfo.password]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    clearError();

    try {
      let result;

      if (hasAccount) {
        result = await login(LoginformData);
      } else {
        result = await register({
          name: shippingInfo.firstName + " " + shippingInfo.lastName,
          email: shippingInfo.email,
          password: shippingInfo.password,
        });
      }

      if (result?.success) {
        setAuthError("");
        const { mergeGuestCart, guestCart } = useCartStore.getState();
        if (guestCart && guestCart.length > 0) {
          await mergeGuestCart();
        }
      } else {
        setAuthError(
          storeError ||
          result?.error?.message ||
          `${hasAccount ? "Login" : "Registration"} failed.`
        );
      }
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch available shipping methods when address is complete
  const fetchShippingMethods = async (addressId) => {
    if (!addressId) return;

    setLoadingShipping(true);
    try {
      const { data } = await axios.post(
        `${baseUrl}/checkout/shipping-methods`,
        { shippingAddressId: addressId },
        { withCredentials: true }
      );

      if (data.success) {
        setShippingMethods(data.data);
        // Set default shipping method if available
        if (data.data.length > 0) {
          setSelectedShippingMethod(data.data[0].method);
        }
      }
    } catch (error) {
      console.error("Error fetching shipping methods:", error);
      setAuthError(error.response?.data?.error || "Failed to load shipping methods");
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleContinueToPayment = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!isAuthenticated) {
      setAuthError("Please login or create an account to continue");
      return;
    }

    if (
      !shippingInfo.fullName ||
      !shippingInfo.phone ||
      !shippingInfo.line1 ||
      !shippingInfo.city ||
      !shippingInfo.country ||
      !shippingInfo.state
    ) {
      setAuthError("Please fill in all required shipping details");
      return;
    }

    if (!sameAsShipping) {
      if (
        !billingInfo.fullName ||
        !billingInfo.line1 ||
        !billingInfo.city ||
        !billingInfo.phone ||
        !billingInfo.country ||
        !billingInfo.state
      ) {
        setAuthError("Please fill in all required billing details");
        return;
      }
    }

    try {
      setIsLoading(true);

      // Create shipping address
      const shippingAddressData = {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        line1: shippingInfo.line1,
        line2: shippingInfo.line2 || null,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: shippingInfo.country,
        postalCode: shippingInfo.postalCode || null,
        isDefault: sameAsShipping,
      };

      const { data: shippingData } = await axios.post(
        `${baseUrl}/address/create`,
        shippingAddressData,
        { withCredentials: true }
      );

      if (!shippingData.success) {
        setAuthError(shippingData.error || "Failed to save shipping address");
        setIsLoading(false);
        return;
      }

      setShippingAddressId(shippingData.data.id);

      // Fetch available shipping methods
      await fetchShippingMethods(shippingData.data.id);

      // Create billing address if different
      if (!sameAsShipping) {
        const billingAddressData = {
          fullName: billingInfo.fullName,
          phone: billingInfo.phone,
          line1: billingInfo.line1,
          line2: billingInfo.line2 || null,
          city: billingInfo.city,
          state: billingInfo.state,
          country: billingInfo.country,
          postalCode: billingInfo.postalCode || null,
          isDefault: false,
        };

        const { data: billingData } = await axios.post(
          `${baseUrl}/address/create`,
          billingAddressData,
          { withCredentials: true }
        );

        if (!billingData.success) {
          setAuthError(billingData.error || "Failed to save billing address");
          setIsLoading(false);
          return;
        }

        setBillingAddressId(billingData.data.id);
      }

      setAuthError("");
      setStep(2);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Address creation error:", error);
      setAuthError(error.response?.data?.error || "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      const checkoutData = {
        shippingAddressId,
        billingAddressId: sameAsShipping ? null : billingAddressId,
        useSameAddress: sameAsShipping,
        shippingMethod: selectedShippingMethod,
      };

      const { data } = await axios.post(
        `${baseUrl}/checkout`,
        checkoutData,
        { withCredentials: true }
      );

      if (data.success) {
        setOrderId(data.data.orderId);
        setOrderDetails(data.data);
        setStep(3);
        window.scrollTo(0, 0);
        // Clear cart after successful order
        await initializeCart();
      } else {
        setAuthError(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorData = error.response?.data;

      // Handle inventory errors specially
      if (errorData?.details && Array.isArray(errorData.details)) {
        const inventoryMessages = errorData.details.map(issue =>
          `${issue.name || 'Item'}: ${issue.issue}`
        ).join('\n');
        setAuthError(`Inventory issues:\n${inventoryMessages}`);
      } else {
        setAuthError(errorData?.error || "Failed to place order. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmation Screen
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <section className="mx-4 my-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-(--border-default) rounded-xl p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle size={48} className="text-green-600" />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-(--text-heading)">
                Order Placed Successfully!
              </h1>

              <p className="text-(--text-secondary) text-lg mb-2">
                Thank you for your purchase!
              </p>

              <p className="text-(--text-secondary) mb-8">
                Order #
                <span className="font-semibold text-(--text-heading)">
                  {orderId?.substr(0, 8).toUpperCase()}
                </span>
              </p>

              <div className="bg-(--bg-surface) rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
                <h3 className="font-semibold mb-4 text-(--text-heading)">
                  Order Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">Subtotal:</span>
                    <span className="font-semibold">
                      Rs. {parseFloat(orderDetails?.subtotal || 0).toLocaleString()}
                    </span>
                  </div>
                  {orderDetails?.promotionSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promotion Savings:</span>
                      <span className="font-semibold">
                        -Rs. {parseFloat(orderDetails.promotionSavings).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {orderDetails?.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount:</span>
                      <span className="font-semibold">
                        -Rs. {parseFloat(orderDetails.discountAmount).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">Shipping:</span>
                    <span className="font-semibold">
                      Rs. {parseFloat(orderDetails?.shippingAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">Tax:</span>
                    <span className="font-semibold">
                      Rs. {parseFloat(orderDetails?.taxAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>Rs. {parseFloat(orderDetails?.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <span className="text-(--text-secondary)">Payment Method:</span>
                    <span className="font-semibold">
                      {paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">Delivery to:</span>
                    <span className="font-semibold">{shippingInfo.city}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-(--text-secondary)">
                  A confirmation email has been sent to{" "}
                  <span className="font-semibold text-(--text-heading)">
                    {shippingInfo.email}
                  </span>
                </p>
                <p className="text-sm text-(--text-secondary)">
                  Estimated delivery:{" "}
                  <span className="font-semibold text-(--text-heading)">
                    {selectedShippingMethod === "EXPRESS" ? "1-2" : "3-5"} business days
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link
                  href={`/user/${user.id}/orders/${orderId}`}
                  className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-center"
                >
                  View Order
                </Link>
                <Link
                  href="/shop"
                  className="border-2 border-(--border-inverse) text-(--text-primary) px-8 py-3 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <section className="bg-linear-to-br from-blue-50 to-purple-50 mx-4 rounded-xl px-6 py-12 md:py-16 mb-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/cart"
            className="text-(--text-secondary) hover:text-(--text-hover) font-medium flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={18} />
            <span>Back to Cart</span>
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="inline-block text-(--color-brand-primary) text-sm border-2 border-(--border-primary) rounded-full px-4 py-1.5 font-medium mb-3">
                SECURE CHECKOUT
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-(--text-heading)">
                Complete Your Order
              </h1>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1
                    ? "bg-(--bg-primary) text-(--text-inverse)"
                    : "bg-white text-(--text-secondary) border border-(--border-default)"
                  }`}
              >
                1
              </div>
              <span
                className={`hidden sm:inline font-medium ${step >= 1 ? "text-(--text-heading)" : "text-(--text-secondary)"
                  }`}
              >
                Shipping
              </span>
            </div>

            <div className="w-12 h-0.5 bg-(--border-default)"></div>

            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2
                    ? "bg-(--bg-primary) text-(--text-inverse)"
                    : "bg-white text-(--text-secondary) border border-(--border-default)"
                  }`}
              >
                2
              </div>
              <span
                className={`hidden sm:inline font-medium ${step >= 2 ? "text-(--text-heading)" : "text-(--text-secondary)"
                  }`}
              >
                Payment
              </span>
            </div>

            <div className="w-12 h-0.5 bg-(--border-default)"></div>

            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 3
                    ? "bg-(--bg-primary) text-(--text-inverse)"
                    : "bg-white text-(--text-secondary) border border-(--border-default)"
                  }`}
              >
                3
              </div>
              <span
                className={`hidden sm:inline font-medium ${step >= 3 ? "text-(--text-heading)" : "text-(--text-secondary)"
                  }`}
              >
                Confirm
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              {step === 1 && (
                <div className="bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-(--bg-primary) rounded-full flex items-center justify-center">
                      <Truck size={24} className="text-(--icon-inverse)" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-(--text-heading)">
                        Shipping Information
                      </h2>
                      <p className="text-sm text-(--text-secondary)">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>

                  {/* Auth Error Display */}
                  {(authError || storeError) && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle
                        size={20}
                        className="text-red-600 mt-0.5 shrink-0"
                      />
                      <p className="text-sm text-red-800 whitespace-pre-line">
                        {authError || storeError}
                      </p>
                    </div>
                  )}

                  {/* Show success message when authenticated */}
                  {isAuthenticated && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle
                        size={20}
                        className="text-green-600 mt-0.5 shrink-0"
                      />
                      <p className="text-sm text-green-800">
                        Welcome back, {user?.username || user?.email}!
                      </p>
                    </div>
                  )}

                  <form
                    onSubmit={isAuthenticated ? handleContinueToPayment : handleAuth}
                    className="space-y-4"
                  >
                    {/* Name Fields - Only show if not logged in and not in login mode */}
                    {!isAuthenticated && !hasAccount && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-(--text-heading) mb-2">
                            First Name *
                          </label>
                          <div className="relative">
                            <User
                              size={18}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"
                            />
                            <input
                              type="text"
                              name="firstName"
                              value={shippingInfo.firstName}
                              onChange={handleShippingChange}
                              required
                              className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="John"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-(--text-heading) mb-2">
                            Last Name *
                          </label>
                          <div className="relative">
                            <User
                              size={18}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"
                            />
                            <input
                              type="text"
                              name="lastName"
                              value={shippingInfo.lastName}
                              onChange={handleShippingChange}
                              required
                              className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email and Password - Show if not authenticated */}
                    {!isAuthenticated && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-(--text-heading) mb-2">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail
                              size={18}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"
                            />
                            <input
                              type="email"
                              name="email"
                              value={shippingInfo.email}
                              onChange={handleShippingChange}
                              required
                              className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-(--text-heading) mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <Key
                              size={18}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"
                            />
                            {showPassword ? (
                              <EyeOff
                                onClick={() => setShowPassword(false)}
                                size={18}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-(--text-secondary)"
                              />
                            ) : (
                              <Eye
                                onClick={() => setShowPassword(true)}
                                size={18}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-(--text-secondary)"
                              />
                            )}
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              aria-label="password"
                              value={shippingInfo.password}
                              onChange={handleShippingChange}
                              required
                              className="w-full pl-10 pr-10 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Toggle between login/register */}
                    {!isAuthenticated && (
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setHasAccount((prev) => !prev);
                            setAuthError("");
                            clearError();
                          }}
                          className="text-(--text-hover) font-semibold hover:text-(--text-primary) transition-colors text-sm"
                        >
                          {hasAccount
                            ? "Don't have an account? Register"
                            : "Already have an account? Login"}
                        </button>
                      </div>
                    )}

                    {/* Login/Register Button */}
                    {!isAuthenticated && (
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-(--bg-primary) text-(--text-inverse) px-6 py-3 rounded-lg hover:bg-(--btn-bg-hover) transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>
                              {hasAccount ? "Logging in..." : "Creating account..."}
                            </span>
                          </>
                        ) : (
                          <span>
                            {hasAccount ? "Login" : "Create Account & Continue"}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Shipping Details - Show after authentication */}
                    {isAuthenticated && (
                      <>
                        <h3 className="text-lg font-semibold mb-4 text-(--text-heading) pt-4 border-t">
                          Shipping Details
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Full Name *
                            </label>
                            <input
                              name="fullName"
                              value={shippingInfo.fullName}
                              onChange={handleShippingChange}
                              required
                              className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="John Doe"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Phone Number *
                            </label>
                            <PhoneInput
                              containerStyle={{ width: "100%" }}
                              inputStyle={{
                                width: "100%",
                                height: "48px",
                                fontSize: "16px",
                              }}
                              country="us"
                              value={shippingInfo.phone}
                              onChange={(phone) =>
                                handleShippingChange({
                                  target: { name: "phone", value: phone },
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Address Line 1 *
                            </label>
                            <input
                              name="line1"
                              value={shippingInfo.line1}
                              onChange={handleShippingChange}
                              required
                              className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="123 Main Street"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Address Line 2
                            </label>
                            <input
                              name="line2"
                              value={shippingInfo.line2}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="Apartment, suite, etc."
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Country *
                            </label>
                            <Select
                              isClearable
                              isSearchable
                              options={countryOptions}
                              value={countryOptions.find(
                                (opt) => opt.value === shippingInfo.country
                              )}
                              onChange={(option) => {
                                setShippingInfo((prev) => ({
                                  ...prev,
                                  country: option?.value || "",
                                  state: "",
                                  city: "",
                                }));
                                setStateOptions(
                                  State.getStatesOfCountry(option?.value || "")
                                );
                                setCityOptions([]);
                              }}
                              placeholder="Select Country"
                              className="react-select-container"
                              classNamePrefix="react-select"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              State / Province *
                            </label>
                            <Select
                              isClearable
                              isSearchable
                              options={states}
                              value={states.find(
                                (opt) => opt.value === shippingInfo.state
                              )}
                              onChange={(option) => {
                                setShippingInfo((prev) => ({
                                  ...prev,
                                  state: option?.value || "",
                                  city: "",
                                }));
                                if (option?.value) {
                                  setCityOptions(
                                    City.getCitiesOfState(
                                      shippingInfo.country,
                                      option.value
                                    )
                                  );
                                }
                              }}
                              placeholder="Select State"
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isDisabled={!shippingInfo.country}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              City *
                            </label>
                            <Select
                              isClearable
                              isSearchable
                              options={cities}
                              value={cities.find(
                                (opt) => opt.value === shippingInfo.city
                              )}
                              onChange={(option) =>
                                setShippingInfo((prev) => ({
                                  ...prev,
                                  city: option?.value || "",
                                }))
                              }
                              placeholder="Select City"
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isDisabled={!shippingInfo.state}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              name="postalCode"
                              value={shippingInfo.postalCode}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="12345"
                            />
                          </div>
                        </div>

                        {/* Billing Address Toggle */}
                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id="sameAsShipping"
                            checked={sameAsShipping}
                            onChange={(e) => setSameAsShipping(e.target.checked)}
                            className="w-4 h-4 text-(--color-brand-primary) border-gray-300 rounded focus:ring-(--color-brand-primary)"
                          />
                          <label
                            htmlFor="sameAsShipping"
                            className="text-sm font-medium text-(--text-heading) cursor-pointer"
                          >
                            Billing address is same as shipping
                          </label>
                        </div>

                        {/* Billing Details - Show if different from shipping */}
                        {!sameAsShipping && (
                          <>
                            <h3 className="text-lg font-semibold mb-4 text-(--text-heading) pt-4 border-t">
                              Billing Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Full Name *
                                </label>
                                <input
                                  name="fullName"
                                  value={billingInfo.fullName}
                                  onChange={handleBillingChange}
                                  required
                                  className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                                  placeholder="John Doe"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Phone Number *
                                </label>
                                <PhoneInput
                                  containerStyle={{ width: "100%" }}
                                  inputStyle={{
                                    width: "100%",
                                    height: "48px",
                                    fontSize: "16px",
                                  }}
                                  country="us"
                                  value={billingInfo.phone}
                                  onChange={(phone) =>
                                    handleBillingChange({
                                      target: { name: "phone", value: phone },
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Address Line 1 *
                                </label>
                                <input
                                  name="line1"
                                  value={billingInfo.line1}
                                  onChange={handleBillingChange}
                                  required
                                  className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                                  placeholder="123 Main Street"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Address Line 2
                                </label>
                                <input
                                  name="line2"
                                  value={billingInfo.line2}
                                  onChange={handleBillingChange}
                                  className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                                  placeholder="Apartment, suite, etc."
                                />
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Country *
                                </label>
                                <Select
                                  isClearable
                                  isSearchable
                                  options={countryOptions}
                                  value={countryOptions.find(
                                    (opt) => opt.value === billingInfo.country
                                  )}
                                  onChange={(option) => {
                                    setBillingInfo((prev) => ({
                                      ...prev,
                                      country: option?.value || "",
                                      state: "",
                                      city: "",
                                    }));
                                  }}
                                  placeholder="Select Country"
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  State / Province *
                                </label>
                                <Select
                                  isClearable
                                  isSearchable
                                  options={State.getStatesOfCountry(
                                    billingInfo.country
                                  ).map((s) => ({
                                    value: s.isoCode,
                                    label: s.name,
                                  }))}
                                  value={
                                    billingInfo.state
                                      ? {
                                        value: billingInfo.state,
                                        label:
                                          State.getStateByCodeAndCountry(
                                            billingInfo.state,
                                            billingInfo.country
                                          )?.name || billingInfo.state,
                                      }
                                      : null
                                  }
                                  onChange={(option) =>
                                    setBillingInfo((prev) => ({
                                      ...prev,
                                      state: option?.value || "",
                                      city: "",
                                    }))
                                  }
                                  placeholder="Select State"
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                  isDisabled={!billingInfo.country}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  City *
                                </label>
                                <Select
                                  isClearable
                                  isSearchable
                                  options={City.getCitiesOfState(
                                    billingInfo.country,
                                    billingInfo.state
                                  ).map((c) => ({
                                    value: c.name,
                                    label: c.name,
                                  }))}
                                  value={
                                    billingInfo.city
                                      ? {
                                        value: billingInfo.city,
                                        label: billingInfo.city,
                                      }
                                      : null
                                  }
                                  onChange={(option) =>
                                    setBillingInfo((prev) => ({
                                      ...prev,
                                      city: option?.value || "",
                                    }))
                                  }
                                  placeholder="Select City"
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                  isDisabled={!billingInfo.state}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Postal Code
                                </label>
                                <input
                                  type="text"
                                  name="postalCode"
                                  value={billingInfo.postalCode}
                                  onChange={handleBillingChange}
                                  className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                                  placeholder="12345"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Continue Button */}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full mt-6 bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-4 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            "Continue to Payment"
                          )}
                        </button>
                      </>
                    )}
                  </form>
                </div>
              )}

              {/* Payment Information */}
              {step === 2 && (
                <div className="bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-(--bg-primary) rounded-full flex items-center justify-center">
                      <CreditCard size={24} className="text-(--icon-inverse)" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-(--text-heading)">
                        Payment & Shipping Method
                      </h2>
                      <p className="text-sm text-(--text-secondary)">
                        Choose your payment and shipping options
                      </p>
                    </div>
                  </div>

                  {/* Error Display */}
                  {authError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle
                        size={20}
                        className="text-red-600 mt-0.5 shrink-0"
                      />
                      <p className="text-sm text-red-800 whitespace-pre-line">
                        {authError}
                      </p>
                    </div>
                  )}

                  {/* Shipping Method Selection */}
                  {loadingShipping ? (
                    <div className="mb-6 flex items-center justify-center py-8">
                      <Loader2 size={32} className="animate-spin text-(--color-brand-primary)" />
                      <span className="ml-3 text-(--text-secondary)">
                        Loading shipping methods...
                      </span>
                    </div>
                  ) : shippingMethods.length > 0 ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4 text-(--text-heading)">
                        Shipping Method
                      </h3>
                      <div className="space-y-3">
                        {shippingMethods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedShippingMethod === method.method
                                ? "border-(--color-brand-primary) bg-blue-50"
                                : "border-(--border-default) hover:border-(--color-brand-primary)"
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              <input
                                type="radio"
                                name="shippingMethod"
                                value={method.method}
                                checked={selectedShippingMethod === method.method}
                                onChange={(e) =>
                                  setSelectedShippingMethod(e.target.value)
                                }
                                className="w-5 h-5 text-(--color-brand-primary)"
                              />
                              <div>
                                <p className="font-semibold text-(--text-heading)">
                                  {method.method === "STANDARD"
                                    ? "Standard Shipping"
                                    : "Express Shipping"}
                                </p>
                                <p className="text-sm text-(--text-secondary)">
                                  {method.method === "STANDARD"
                                    ? "3-5 business days"
                                    : "1-2 business days"}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-(--text-heading)">
                              Rs. {parseFloat(method.price).toLocaleString()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Payment Method Selection */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-(--text-heading)">
                      Payment Method
                    </h3>

                    {/* Cash on Delivery */}
                    <label
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "cod"
                          ? "border-(--color-brand-primary) bg-blue-50"
                          : "border-(--border-default) hover:border-(--color-brand-primary)"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-(--color-brand-primary)"
                        />
                        <div>
                          <p className="font-semibold text-(--text-heading)">
                            Cash on Delivery
                          </p>
                          <p className="text-sm text-(--text-secondary)">
                            Pay when you receive your order
                          </p>
                        </div>
                      </div>
                      <Truck
                        size={24}
                        className="text-(--color-brand-primary)"
                      />
                    </label>

                    {/* Credit/Debit Card */}
                    <label
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "card"
                          ? "border-(--color-brand-primary) bg-blue-50"
                          : "border-(--border-default) hover:border-(--color-brand-primary)"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-(--color-brand-primary)"
                        />
                        <div>
                          <p className="font-semibold text-(--text-heading)">
                            Credit / Debit Card
                          </p>
                          <p className="text-sm text-(--text-secondary)">
                            Visa, Mastercard, or other cards
                          </p>
                        </div>
                      </div>
                      <CreditCard
                        size={24}
                        className="text-(--color-brand-primary)"
                      />
                    </label>
                  </div>

                  {/* Card Details (if card payment selected) */}
                  {paymentMethod === "card" && (
                    <div className="border-t border-(--border-default) pt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-(--text-heading)">
                        Card Details
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          Card Number *
                        </label>
                        <div className="relative">
                          <CreditCard
                            size={18}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"
                          />
                          <input
                            type="text"
                            name="cardNumber"
                            value={billingInfo.cardNumber}
                            onChange={handleBillingChange}
                            required
                            maxLength={19}
                            className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={billingInfo.cardName}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-(--text-heading) mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={billingInfo.expiryDate}
                            onChange={handleBillingChange}
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-(--text-heading) mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={billingInfo.cvv}
                            onChange={handleBillingChange}
                            required
                            maxLength={4}
                            className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                      className="flex-1 border-2 border-(--border-inverse) text-(--text-primary) px-6 py-4 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isLoading || shippingMethods.length === 0}
                      className="flex-1 bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-4 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            {orderItems?.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white border border-(--border-default) rounded-xl p-6 sticky top-6">
                  <h3 className="text-xl font-bold mb-4 text-(--text-heading)">
                    Order Summary
                  </h3>

                  {/* Items */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-(--border-default) max-h-96 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-(--bg-surface) rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={item.thumbnail || "/placeholder.png"}
                            width={64}
                            height={64}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-(--text-heading) line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-xs text-(--text-secondary) mt-1">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-(--text-heading) mt-1">
                            Rs. {parseFloat(item.itemTotal || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-(--text-secondary)">Subtotal</span>
                      <span className="font-medium">
                        Rs. {parseFloat(subtotal || 0).toLocaleString()}
                      </span>
                    </div>

                    {promotionSavings > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promotion Savings</span>
                        <span className="font-medium">
                          -Rs. {parseFloat(promotionSavings).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount</span>
                        <span className="font-medium">
                          -Rs. {parseFloat(discountAmount).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {step === 2 && shippingMethods.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-secondary)">Shipping</span>
                        <span className="font-medium">
                          Rs.{" "}
                          {parseFloat(
                            shippingMethods.find(
                              (m) => m.method === selectedShippingMethod
                            )?.price || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-secondary)">Tax</span>
                        <span className="font-medium">
                          Rs. {parseFloat(taxAmount).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-(--border-default) pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-(--text-heading)">
                          Total
                        </span>
                        <span className="font-bold text-(--text-heading) text-xl">
                          Rs. {parseFloat(total || subtotal || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Checkout;