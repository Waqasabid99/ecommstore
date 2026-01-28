"use client";
import { useState, useEffect, use } from "react";
import {
  CreditCard,
  Truck,
  User,
  Mail,
  Lock,
  CheckCircle,
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
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
  const { getCartItems, getCartSummary, initializeCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const { login, register, error: storeError, clearError } = useAuthStore();

  const { subtotal } = getCartSummary();
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

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    isDefault: sameAsShipping,
  });

  const [LoginformData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setShippingAddress({
      fullName: shippingInfo.fullName,
      phone: shippingInfo.phone,
      line1: shippingInfo.line1,
      line2: shippingInfo.line2,
      country: shippingInfo.country,
      state: shippingInfo.state,
      city: shippingInfo.city,
      postalCode: shippingInfo.postalCode,
      isDefault: sameAsShipping,
    });
  }, [shippingInfo]);
    console.log(shippingAddress);

  useEffect(() => {
    setLoginFormData({
      email: shippingInfo.email,
      password: shippingInfo.password,
    });
  }, [shippingInfo.email, shippingInfo.password]);

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

  // Auto-fill user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setShippingInfo((prev) => ({
        ...prev,
        firstName: user.username?.split(" ")[0] || "",
        lastName: user.username?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
      }));
    }
  }, [isAuthenticated, user]);

  // Clear auth errors when component unmounts or when switching between login/register
  useEffect(() => {
    return () => {
      clearError();
      setAuthError("");
    };
  }, [hasAccount]);

  // Calculate totals
  const shipping = 299;
  const tax = subtotal * 0.17;
  const total = parseInt(subtotal) + shipping + tax;

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
        // Login
        result = await login(LoginformData);
      } else {
        // Register
        result = await register({
          name: shippingInfo.firstName,
          email: shippingInfo.email,
          password: shippingInfo.password,
        });
      }

      if (result?.success) {
        setAuthError("");
        // Form will auto-fill with user data via useEffect
      } else {
        setAuthError(
          storeError ||
            `${hasAccount ? "Login" : "Registration"} failed. ${result.error.message} `,
        );
      }
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
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
      if (sameAsShipping) {
        const { data } = await axios.post(
          `${baseUrl}/address/create`,
          shippingAddress,
          { withCredentials: true },
        );
          if (data.success) {
            setIsLoading(false);
            setShippingAddressId(data.data.id);
            setAuthError("");
            setStep(2);
            window.scrollTo(0, 0);
          } else {
            setIsLoading(false);
            setAuthError(data.error.message);
          }
      } else {
        const { data } = await axios.post(
          `${baseUrl}/address/create`,
          billingInfo,
          { withCredentials: true },
        );
        if (data.success) {
          setIsLoading(false);
          setShippingAddressId(data.data.id);
          setBillingAddressId(data.data.id);
          setAuthError("");
          setStep(2);
          window.scrollTo(0, 0);
        } else {
          setIsLoading(false);
          setAuthError(data.error.message);
        }
      }
    } catch (error) {
      setIsLoading(false);
      setAuthError(error.message);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${baseUrl}/checkout`, { shippingAddressId, sameAsShipping }, { withCredentials: true});
      console.log(data);
      if (data.success) {
        setIsLoading(false);
        setOrderId(data.data.orderId);
        setStep(3);
        window.scrollTo(0, 0);
        initializeCart();
      } else {
        setIsLoading(false);
        setAuthError(data.error.message);
      }
    } catch (error) {
      setIsLoading(false);
      setAuthError(error.message);
      console.log(error);
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
                  ORD-{ orderId.substr(0, 8).toUpperCase() }
                </span>
              </p>

              <div className="bg-(--bg-surface) rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
                <h3 className="font-semibold mb-4 text-(--text-heading)">
                  Order Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">
                      Total Amount:
                    </span>
                    <span className="font-semibold">
                      Rs. {Math.round(total).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">
                      Payment Method:
                    </span>
                    <span className="font-semibold">
                      {paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Card Payment"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">
                      Delivery to:
                    </span>
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
                    3-5 business days
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium">
                  Track Order
                </button>
                <button className="border-2 border-(--border-inverse) text-(--text-primary) px-8 py-3 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium">
                  Continue Shopping
                </button>
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
            href={"/cart"}
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
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 1
                    ? "bg-(--bg-primary) text-(--text-inverse)"
                    : "bg-white text-(--text-secondary) border border-(--border-default)"
                }`}
              >
                1
              </div>
              <span
                className={`hidden sm:inline font-medium ${step >= 1 ? "text-(--text-heading)" : "text-(--text-secondary)"}`}
              >
                Shipping
              </span>
            </div>

            <div className="w-12 h-0.5 bg-(--border-default)"></div>

            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 2
                    ? "bg-(--bg-primary) text-(--text-inverse)"
                    : "bg-white text-(--text-secondary) border border-(--border-default)"
                }`}
              >
                2
              </div>
              <span
                className={`hidden sm:inline font-medium ${step >= 2 ? "text-(--text-heading)" : "text-(--text-secondary)"}`}
              >
                Payment
              </span>
            </div>

            <div className="w-12 h-0.5 bg-(--border-default)"></div>

            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 3
                    ? "bg-(--bg-primary) text-(--text-inverse)"
                    : "bg-white text-(--text-secondary) border border-(--border-default)"
                }`}
              >
                3
              </div>
              <span
                className={`hidden sm:inline font-medium ${step >= 3 ? "text-(--text-heading)" : "text-(--text-secondary)"}`}
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
                      <p className="text-sm text-red-800">
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
                        Welcome back, {user?.username || user?.email}! Your
                        account details have been loaded.
                      </p>
                    </div>
                  )}

                  <form
                    onSubmit={
                      isAuthenticated ? handleContinueToPayment : handleAuth
                    }
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
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                              aria-label={
                                showPassword ? "Hide Password" : "Show Password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
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

                    {/* Toggle between login/register - Only show if not authenticated */}
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

                    {/* Login/Register Button - Only show if not authenticated */}
                    {!isAuthenticated && (
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-(--bg-primary) text-(--text-inverse) px-6 py-3 rounded-lg hover:bg-(--btn-bg-hover) transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>
                              {hasAccount
                                ? "Logging in..."
                                : "Creating account..."}
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
                        <h3 className="text-lg font-semibold mb-4 text-(--text-heading)">
                          Shipping Details
                        </h3>
                        {/* Phone */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Full Name*
                            </label>
                            <div className="relative">
                              <input
                                name="fullName"
                                value={shippingInfo.fullName}
                                onChange={handleShippingChange}
                                required
                                className="w-full px-3 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors resize-none"
                                placeholder="Jon Doe"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Phone Number *
                            </label>
                            <div className="relative">
                              <PhoneInput
                                containerStyle={{ width: "100%" }}
                                inputStyle={{ width: "100%" }}
                                country={"us"}
                                name="phone"
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
                        </div>

                        {/* Address */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Address line 1*
                            </label>
                            <div className="relative">
                              <input
                                name="line1"
                                value={shippingInfo.line1}
                                onChange={handleShippingChange}
                                required
                                className="w-full px-3 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors resize-none"
                                placeholder="House/Flat No., Street Name, Area"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Address line 2
                            </label>
                            <div className="relative">
                              <input
                                name="line2"
                                value={shippingInfo.line2}
                                onChange={handleShippingChange}
                                className="w-full px-3 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors resize-none"
                                placeholder="House/Flat No., Street Name, Area"
                              />
                            </div>
                          </div>
                        </div>

                        {/* City & State */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Country *
                            </label>
                            <div className="relative">
                              <Select
                                name="country"
                                isClearable={true}
                                isSearchable={true}
                                options={countryOptions}
                                onChange={(option) => {
                                  setShippingInfo((prev) => ({
                                    ...prev,
                                    country: option?.value || "",
                                  }));
                                  setStateOptions(
                                    State.getStatesOfCountry(
                                      option?.value || "",
                                    ),
                                  );
                                  setCityOptions(
                                    City.getCitiesOfCountry(
                                      option?.value || "",
                                    ),
                                  );
                                }}
                                required
                                className="basic-single"
                                classNamePrefix="select"
                                placeholder="Select Country"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              State / Province *
                            </label>
                            <div className="relative">
                              <Select
                                name="state"
                                isClearable={true}
                                isSearchable={true}
                                options={states}
                                onChange={(option) =>
                                  setShippingInfo((prev) => ({
                                    ...prev,
                                    state: option?.value,
                                  }))
                                }
                                required
                                className="basic-single"
                                placeholder="Select State"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              City *
                            </label>
                            <div className="relative">
                              <Select
                                name="city"
                                isClearable={true}
                                isSearchable={true}
                                options={cities}
                                onChange={(option) =>
                                  setShippingInfo((prev) => ({
                                    ...prev,
                                    city: option?.value,
                                  }))
                                }
                                required
                                className="basic-single"
                                placeholder="Select City"
                              />
                            </div>
                          </div>

                          {/* Postal Code */}
                          <div>
                            <label className="block text-sm font-medium text-(--text-heading) mb-2">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              name="postalCode"
                              value={shippingInfo.postalCode}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="54000"
                            />
                          </div>
                        </div>
                        {!sameAsShipping && (
                          <>
                            <h3 className="text-lg font-semibold mb-4 text-(--text-heading)">
                              Billing Details
                            </h3>
                            {/* Phone */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Full Name*
                                </label>
                                <div className="relative">
                                  <input
                                    name="fullName"
                                    value={billingInfo.fullName}
                                    onChange={handleBillingChange}
                                    required
                                    className="w-full px-3 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors resize-none"
                                    placeholder="Jon Doe"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Phone Number *
                                </label>
                                <div className="relative">
                                  <PhoneInput
                                    containerStyle={{ width: "100%" }}
                                    inputStyle={{ width: "100%" }}
                                    country={"us"}
                                    name="phone"
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
                            </div>

                            {/* Address */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Address line 1*
                                </label>
                                <div className="relative">
                                  <input
                                    name="line1"
                                    value={billingInfo.line1}
                                    onChange={handleBillingChange}
                                    required
                                    className="w-full px-3 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors resize-none"
                                    placeholder="House/Flat No., Street Name, Area"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Address line 2
                                </label>
                                <div className="relative">
                                  <input
                                    name="line2"
                                    value={billingInfo.line2}
                                    onChange={handleBillingChange}
                                    className="w-full px-3 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors resize-none"
                                    placeholder="House/Flat No., Street Name, Area"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* City & State */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Country *
                                </label>
                                <div className="relative">
                                  <Select
                                    name="country"
                                    isClearable={true}
                                    isSearchable={true}
                                    options={countryOptions}
                                    onChange={(option) => {
                                      setBillingInfo((prev) => ({
                                        ...prev,
                                        country: option?.value || "",
                                      }));
                                      setStateOptions(
                                        State.getStatesOfCountry(
                                          option?.value || "",
                                        ),
                                      );
                                      setCityOptions(
                                        City.getCitiesOfCountry(
                                          option?.value || "",
                                        ),
                                      );
                                    }}
                                    required
                                    className="basic-single"
                                    classNamePrefix="select"
                                    placeholder="Select Country"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  State / Province *
                                </label>
                                <div className="relative">
                                  <Select
                                    name="state"
                                    isClearable={true}
                                    isSearchable={true}
                                    options={states}
                                    onChange={(option) =>
                                      setBillingInfo((prev) => ({
                                        ...prev,
                                        state: option?.value,
                                      }))
                                    }
                                    required
                                    className="basic-single"
                                    placeholder="Select State"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  City *
                                </label>
                                <div className="relative">
                                  <Select
                                    name="city"
                                    isClearable={true}
                                    isSearchable={true}
                                    options={cities}
                                    onChange={(option) =>
                                      setBillingInfo((prev) => ({
                                        ...prev,
                                        city: option?.value,
                                      }))
                                    }
                                    required
                                    className="basic-single"
                                    placeholder="Select City"
                                  />
                                </div>
                              </div>

                              {/* Postal Code */}
                              <div>
                                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                                  Postal Code
                                </label>
                                <input
                                  type="text"
                                  name="postalCode"
                                  value={billingInfo.postalCode}
                                  onChange={handleBillingChange}
                                  className="w-full px-4 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                                  placeholder="54000"
                                />
                              </div>
                            </div>
                          </>
                        )}
                        <div className="space-x-2">
                          <input
                            type="checkbox"
                            name="sameAsShipping"
                            id="sameAsShipping"
                            checked={sameAsShipping}
                            onChange={(e) => {
                              setSameAsShipping(e.target.checked);
                            }
                            }
                          />
                          <label htmlFor="sameAsShipping">
                            Billing Address is same as Shipping?
                          </label>
                        </div>
                        {/* Continue Button */}
                        <button
                          type="submit"
                          className="w-full mt-6 bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-4 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-lg"
                        >
                          {isLoading ? (
                            <Loader size="sm" text="" />
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
                        Payment Method
                      </h2>
                      <p className="text-sm text-(--text-secondary)">
                        Choose how you want to pay
                      </p>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-4 mb-6">
                    {/* Cash on Delivery */}
                    <label
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "cod"
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
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "card"
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
                          <div className="relative">
                            <Lock
                              size={18}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"
                            />
                            <input
                              type="text"
                              name="cvv"
                              value={billingInfo.cvv}
                              onChange={handleBillingChange}
                              required
                              maxLength={4}
                              className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 border-2 border-(--border-inverse) text-(--text-primary) px-6 py-4 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-4 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-lg"
                    >
                      {isLoading ? <Loader size="sm" text="" /> : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            {orderItems?.length === 0 ? null : (
            <div className="lg:col-span-1">
              <div className="bg-white border border-(--border-default) rounded-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold mb-4 text-(--text-heading)">
                  Order Summary
                </h3>

                {/* Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-(--border-default)">
                  {orderItems?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-(--bg-surface) rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={`${item.thumbnail}` || "/placeholder.png"}
                          width={100}
                          height={100}
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
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-(--text-secondary)">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-(--text-secondary)">
                    <span>Shipping</span>
                    <span className="font-medium">
                      Rs. {shipping.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-(--text-secondary)">
                    <span>Tax (17%)</span>
                    <span className="font-medium">
                      Rs. {Math.round(tax).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-(--border-default) pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-(--text-heading)">
                        Total
                      </span>
                      <span className="font-bold text-(--text-heading) text-xl">
                        Rs. {Math.round(total).toLocaleString()}
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
