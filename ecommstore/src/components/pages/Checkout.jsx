"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  MapPin,
  Plus,
  Edit2,
  ChevronRight,
  Shield,
  Clock,
  Package,
  Home,
  Briefcase,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/authStore";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { baseUrl } from "@/lib/utils";
import { formatPrice } from "@/lib/formatters";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for cleaner tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Custom Select Styles
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "48px",
    borderColor: state.isFocused ? "var(--color-brand-primary)" : "var(--border-default)",
    boxShadow: state.isFocused ? "0 0 0 1px var(--color-brand-primary)" : "none",
    "&:hover": {
      borderColor: "var(--color-brand-primary)",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--color-brand-primary)"
      : state.isFocused
      ? "var(--bg-surface)"
      : "white",
    color: state.isSelected ? "white" : "var(--text-heading)",
  }),
};

// Address Card Component
const AddressCard = ({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  type = "shipping",
}) => (
  <div
    onClick={onSelect}
    className={cn(
      "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
      selected
        ? "border-[var(--color-brand-primary)] bg-blue-50/50 shadow-md"
        : "border-[var(--border-default)] hover:border-[var(--color-brand-primary)] hover:shadow-sm"
    )}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            selected ? "bg-[var(--color-brand-primary)] text-white" : "bg-gray-100 text-gray-600"
          )}
        >
          {type === "shipping" ? <Home size={20} /> : <Briefcase size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[var(--text-heading)] truncate">
              {address.fullName}
            </h4>
            {address.isDefault && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-1">{address.phone}</p>
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
            {address.line1}
            {address.line2 && `, ${address.line2}`}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {address.city}, {address.state}, {address.postalCode}
          </p>
          <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">
            {Country.getCountryByCode(address.country)?.name || address.country}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 text-gray-400 hover:text-[var(--color-brand-primary)] hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit address"
        >
          <Edit2 size={16} />
        </button>
        {!address.isDefault && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete address"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
    
    {selected && (
      <div className="absolute top-4 right-4 w-6 h-6 bg-[var(--color-brand-primary)] text-white rounded-full flex items-center justify-center">
        <CheckCircle size={16} />
      </div>
    )}
  </div>
);

// New Address Form Component
const AddressForm = ({
  data,
  onChange,
  errors,
  prefix = "shipping",
  countries,
  states,
  cities,
  onCountryChange,
  onStateChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors",
              errors.fullName
                ? "border-red-500 focus:border-red-500"
                : "border-[var(--border-default)] focus:border-[var(--color-brand-primary)]"
            )}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
            Phone Number *
          </label>
          <PhoneInput
            containerStyle={{ width: "100%" }}
            inputStyle={{
              width: "100%",
              height: "48px",
              fontSize: "16px",
              borderRadius: "0.5rem",
              borderColor: errors.phone ? "#ef4444" : "var(--border-default)",
            }}
            buttonStyle={{
              borderRadius: "0.5rem 0 0 0.5rem",
              borderColor: errors.phone ? "#ef4444" : "var(--border-default)",
            }}
            country={data.country?.toLowerCase() || "us"}
            value={data.phone}
            onChange={(phone) => onChange("phone", phone)}
            disabled={disabled}
            inputProps={{
              required: true,
            }}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={data.line1}
            onChange={(e) => onChange("line1", e.target.value)}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors",
              errors.line1
                ? "border-red-500 focus:border-red-500"
                : "border-[var(--border-default)] focus:border-[var(--color-brand-primary)]"
            )}
            placeholder="123 Main Street"
          />
          {errors.line1 && (
            <p className="mt-1 text-sm text-red-600">{errors.line1}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
            Address Line 2
            <span className="text-[var(--text-secondary)] font-normal ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.line2}
            onChange={(e) => onChange("line2", e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors"
            placeholder="Apartment, suite, building, floor, etc."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
            Country *
          </label>
          <Select
            isClearable
            isSearchable
            options={countries}
            value={countries.find((opt) => opt.value === data.country)}
            onChange={(option) => onCountryChange(option?.value || "")}
            isDisabled={disabled}
            placeholder="Select Country"
            styles={selectStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
            State / Province *
          </label>
          <Select
            isClearable
            isSearchable
            options={states}
            value={states.find((opt) => opt.value === data.state)}
            onChange={(option) => onStateChange(option?.value || "")}
            isDisabled={disabled || !data.country}
            placeholder={data.country ? "Select State" : "Select Country First"}
            styles={selectStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
            City *
          </label>
          <Select
            isClearable
            isSearchable
            options={cities}
            value={cities.find((opt) => opt.value === data.city)}
            onChange={(option) => onChange("city", option?.value || "")}
            isDisabled={disabled || !data.state}
            placeholder={data.state ? "Select City" : "Select State First"}
            styles={selectStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
            Postal Code
            <span className="text-[var(--text-secondary)] font-normal ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.postalCode}
            onChange={(e) => onChange("postalCode", e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors"
            placeholder="12345"
          />
        </div>
      </div>
    </div>
  );
};

// Main Checkout Component
const Checkout = () => {
  // State Management
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [hasAccount, setHasAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Address Management
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [showNewShippingForm, setShowNewShippingForm] = useState(false);
  const [showNewBillingForm, setShowNewBillingForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  
  // Shipping
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [loadingShipping, setLoadingShipping] = useState(false);
  
  // Form Errors
  const [formErrors, setFormErrors] = useState({});
  const [authError, setAuthError] = useState("");
  
  // Location Data
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [billingStateOptions, setBillingStateOptions] = useState([]);
  const [billingCityOptions, setBillingCityOptions] = useState([]);

  // Stores
  const { getCartItems, getCartSummary, initializeCart, items, guestCart, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const { login, register, error: storeError, clearError } = useAuthStore();

  // Derived Data
  const orderItems = useMemo(() => getCartItems(), [getCartItems, items, guestCart]);
  const { subtotal, discountAmount, promotionSavings, taxAmount, total, shippingAmount } = getCartSummary();

  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((country) => ({
        value: country.isoCode,
        label: country.name,
      })),
    []
  );

  // Form Data
  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping: {
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
    },
    billing: {
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      country: "",
      state: "",
      postalCode: "",
    },
  });

  // Fetch Saved Addresses
  const fetchSavedAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setAddressesLoading(true);
    try {
      const { data } = await axios.get(`${baseUrl}/address`, {
        withCredentials: true,
      });
      
      if (data.success) {
        setSavedAddresses(data.data || []);
        // Auto-select default address if exists
        const defaultAddress = data.data?.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedShippingAddress(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setAddressesLoading(false);
    }
  }, [isAuthenticated]);

  // Initial Load
  useEffect(() => {
    fetchSavedAddresses();
  }, [fetchSavedAddresses]);

  // Auto-fill user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          fullName: user.username || prev.shipping.fullName,
          email: user.email || prev.shipping.email,
        },
      }));
      initializeCart();
    }
  }, [isAuthenticated, user, initializeCart]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      clearError();
      setAuthError("");
    };
  }, [clearError]);

  // Validation
  const validateShippingForm = () => {
    const errors = {};
    const { shipping } = formData;

    if (!shipping.fullName.trim()) errors["shipping.fullName"] = "Full name is required";
    if (!shipping.phone || shipping.phone.length < 10) errors["shipping.phone"] = "Valid phone number is required";
    if (!shipping.line1.trim()) errors["shipping.line1"] = "Address is required";
    if (!shipping.country) errors["shipping.country"] = "Country is required";
    if (!shipping.state) errors["shipping.state"] = "State is required";
    if (!shipping.city) errors["shipping.city"] = "City is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBillingForm = () => {
    if (sameAsShipping) return true;
    
    const errors = {};
    const { billing } = formData;

    if (!billing.fullName.trim()) errors["billing.fullName"] = "Full name is required";
    if (!billing.phone || billing.phone.length < 10) errors["billing.phone"] = "Valid phone number is required";
    if (!billing.line1.trim()) errors["billing.line1"] = "Address is required";
    if (!billing.country) errors["billing.country"] = "Country is required";
    if (!billing.state) errors["billing.state"] = "State is required";
    if (!billing.city) errors["billing.city"] = "City is required";

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleShippingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value },
    }));
    // Clear error when user types
    if (formErrors[`shipping.${field}`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`shipping.${field}`];
        return newErrors;
      });
    }
  };

  const handleBillingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      billing: { ...prev.billing, [field]: value },
    }));
    if (formErrors[`billing.${field}`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`billing.${field}`];
        return newErrors;
      });
    }
  };

  const handleCountryChange = (type, value) => {
    if (type === "shipping") {
      setFormData((prev) => ({
        ...prev,
        shipping: { ...prev.shipping, country: value, state: "", city: "" },
      }));
      setStateOptions(State.getStatesOfCountry(value));
      setCityOptions([]);
    } else {
      setFormData((prev) => ({
        ...prev,
        billing: { ...prev.billing, country: value, state: "", city: "" },
      }));
      setBillingStateOptions(State.getStatesOfCountry(value));
      setBillingCityOptions([]);
    }
  };

  const handleStateChange = (type, value) => {
    if (type === "shipping") {
      setFormData((prev) => ({
        ...prev,
        shipping: { ...prev.shipping, state: value, city: "" },
      }));
      setCityOptions(City.getCitiesOfState(formData.shipping.country, value));
    } else {
      setFormData((prev) => ({
        ...prev,
        billing: { ...prev.billing, state: value, city: "" },
      }));
      setBillingCityOptions(City.getCitiesOfState(formData.billing.country, value));
    }
  };

  // Auth Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    clearError();

    if (!formData.shipping.email || !formData.shipping.password) {
      setAuthError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const result = hasAccount
        ? await login({ email: formData.shipping.email, password: formData.shipping.password })
        : await register({
            name: formData.shipping.fullName || formData.shipping.email.split("@")[0],
            email: formData.shipping.email,
            password: formData.shipping.password,
          });

      if (result?.success) {
        // Merge guest cart if exists
        const { mergeGuestCart, guestCart } = useCartStore.getState();
        if (guestCart?.length > 0) {
          await mergeGuestCart();
        }
        // Refresh addresses after login
        await fetchSavedAddresses();
      } else {
        setAuthError(storeError || result?.error?.message || "Authentication failed");
      }
    } catch (error) {
      setAuthError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Shipping Methods
  const fetchShippingMethods = async (addressId) => {
    setLoadingShipping(true);
    try {
      const { data } = await axios.post(
        `${baseUrl}/checkout/shipping-methods`,
        { shippingAddressId: addressId },
        { withCredentials: true }
      );

      if (data.success) {
        setShippingMethods(data.data);
        // Select first available or STANDARD
        const standard = data.data.find((m) => m.method === "STANDARD");
        setSelectedShippingMethod(standard?.method || data.data[0]?.method);
      }
    } catch (error) {
      console.error("Error fetching shipping methods:", error);
      setAuthError(error.response?.data?.error || "Failed to load shipping methods");
    } finally {
      setLoadingShipping(false);
    }
  };

  // Address CRUD Operations
  const handleSaveAddress = async (type, isEdit = false) => {
    const isShipping = type === "shipping";
    const data = isShipping ? formData.shipping : formData.billing;
    
    const payload = {
      fullName: data.fullName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode || null,
      isDefault: savedAddresses.length === 0, // First address is default
    };

    try {
      setIsLoading(true);
      const endpoint = isEdit && editingAddress
        ? `${baseUrl}/address/${editingAddress.id}`
        : `${baseUrl}/address/create`;
      
      const method = isEdit ? "put" : "post";
      
      const { data: response } = await axios[method](endpoint, payload, {
        withCredentials: true,
      });

      if (response.success) {
        await fetchSavedAddresses();
        setShowNewShippingForm(false);
        setShowNewBillingForm(false);
        setEditingAddress(null);
        
        if (isShipping) {
          setSelectedShippingAddress(response.data.id);
          return response.data.id;
        } else {
          setSelectedBillingAddress(response.data.id);
          return response.data.id;
        }
      }
    } catch (error) {
      setAuthError(error.response?.data?.error || `Failed to save ${type} address`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await axios.delete(`${baseUrl}/address/${addressId}`, {
        withCredentials: true,
      });
      await fetchSavedAddresses();
      
      // Reset selection if deleted address was selected
      if (selectedShippingAddress === addressId) setSelectedShippingAddress(null);
      if (selectedBillingAddress === addressId) setSelectedBillingAddress(null);
    } catch (error) {
      console.error("Error deleting address:", error);
      setAuthError("Failed to delete address");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    if (address.country) {
      const states = State.getStatesOfCountry(address.country);
      setStateOptions(states);
      if (address.state) {
        setCityOptions(City.getCitiesOfState(address.country, address.state));
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode || "",
      },
    }));
    setShowNewShippingForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Continue to Payment
  const handleContinueToPayment = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!isAuthenticated) {
      setAuthError("Please login or create an account to continue");
      return;
    }

    let shippingAddressId = selectedShippingAddress;
    let billingAddressId = selectedBillingAddress;

    // Validate and save new shipping address if form is shown
    if (showNewShippingForm || !shippingAddressId) {
      if (!validateShippingForm()) return;
      shippingAddressId = await handleSaveAddress("shipping", !!editingAddress);
      if (!shippingAddressId) return;
    }

    // Validate and save billing if different
    if (!sameAsShipping && (showNewBillingForm || !billingAddressId)) {
      if (!validateBillingForm()) return;
      billingAddressId = await handleSaveAddress("billing");
      if (!billingAddressId) return;
    }

    // Fetch shipping methods
    await fetchShippingMethods(shippingAddressId);
    
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Place Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      const checkoutData = {
        shippingAddressId: selectedShippingAddress,
        billingAddressId: sameAsShipping ? null : selectedBillingAddress,
        useSameAddress: sameAsShipping,
        shippingMethod: selectedShippingMethod,
        paymentMethod,
      };

      const { data } = await axios.post(`${baseUrl}/checkout`, checkoutData, {
        withCredentials: true,
      });

      if (data.success) {
        setOrderId(data.data.orderId);
        setOrderDetails(data.data);
        setStep(3);
        clearCart();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setAuthError(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorData = error.response?.data;

      if (errorData?.details && Array.isArray(errorData.details)) {
        const inventoryMessages = errorData.details
          .map((issue) => `${issue.name || "Item"}: ${issue.issue}`)
          .join("\n");
        setAuthError(`Inventory issues:\n${inventoryMessages}`);
      } else {
        setAuthError(errorData?.error || "Failed to place order. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill billing from shipping when checkbox toggled
  useEffect(() => {
    if (sameAsShipping) {
      setSelectedBillingAddress(selectedShippingAddress);
    }
  }, [sameAsShipping, selectedShippingAddress]);

  // Calculate totals with shipping
  const finalTotal = useMemo(() => {
    const shippingCost = shippingMethods.find((m) => m.method === selectedShippingMethod)?.price || 0;
    return parseFloat(total || "0") + parseFloat(shippingCost);
  }, [total, shippingMethods, selectedShippingMethod]);

  // Render Steps
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border border-[var(--border-default)] rounded-2xl p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[var(--color-brand-primary)] rounded-full flex items-center justify-center">
          <Truck size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-heading)]">
            Shipping Information
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {isAuthenticated
              ? "Select a saved address or add a new one"
              : "Sign in to use saved addresses"}
          </p>
        </div>
      </div>

      {/* Auth Section for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-[var(--border-default)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-heading)]">
            {hasAccount ? "Welcome Back" : "Create Account"}
          </h3>
          
          {authError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800 whitespace-pre-line">{authError}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.shipping.email}
                    onChange={(e) => handleShippingChange("email", e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.shipping.password}
                    onChange={(e) => handleShippingChange("password", e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {!hasAccount && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.shipping.fullName}
                    onChange={(e) => handleShippingChange("fullName", e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setHasAccount(!hasAccount);
                  setAuthError("");
                  clearError();
                }}
                className="text-[var(--color-brand-primary)] font-medium hover:underline text-sm"
              >
                {hasAccount ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[var(--color-brand-primary)] text-white px-8 py-3 rounded-full hover:opacity-90 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : null}
                {hasAccount ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Authenticated User - Address Selection */}
      {isAuthenticated && (
        <form onSubmit={handleContinueToPayment} className="space-y-6">
          {/* Saved Addresses */}
          {addressesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[var(--color-brand-primary)]" />
            </div>
          ) : savedAddresses.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                  Saved Addresses
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewShippingForm(!showNewShippingForm);
                    setEditingAddress(null);
                    if (!showNewShippingForm) {
                      setFormData((prev) => ({
                        ...prev,
                        shipping: {
                          fullName: user?.username || "",
                          email: user?.email || "",
                          password: "",
                          phone: "",
                          line1: "",
                          line2: "",
                          city: "",
                          country: "",
                          state: "",
                          postalCode: "",
                        },
                      }));
                      setStateOptions([]);
                      setCityOptions([]);
                    }
                  }}
                  className="text-sm text-[var(--color-brand-primary)] font-medium hover:underline flex items-center gap-1"
                >
                  <Plus size={16} />
                  {showNewShippingForm ? "Cancel" : "Add New Address"}
                </button>
              </div>

              {!showNewShippingForm && (
                <div className="grid gap-3">
                  {savedAddresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      selected={selectedShippingAddress === address.id}
                      onSelect={() => setSelectedShippingAddress(address.id)}
                      onEdit={() => handleEditAddress(address)}
                      onDelete={() => handleDeleteAddress(address.id)}
                      type="shipping"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-[var(--border-default)]">
              <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[var(--text-secondary)] mb-4">No saved addresses found</p>
              <button
                type="button"
                onClick={() => setShowNewShippingForm(true)}
                className="text-[var(--color-brand-primary)] font-medium hover:underline"
              >
                Add your first address
              </button>
            </div>
          )}

          {/* New Address Form */}
          <AnimatePresence>
            {(showNewShippingForm || savedAddresses.length === 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-gray-50 rounded-xl border border-[var(--border-default)] space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                    {editingAddress ? "Edit Address" : "New Shipping Address"}
                  </h3>
                  
                  <AddressForm
                    data={formData.shipping}
                    onChange={(field, value) => handleShippingChange(field, value)}
                    errors={formErrors}
                    prefix="shipping"
                    countries={countryOptions}
                    states={stateOptions.map((s) => ({ value: s.isoCode, label: s.name }))}
                    cities={cityOptions.map((c) => ({ value: c.name, label: c.name }))}
                    onCountryChange={(value) => handleCountryChange("shipping", value)}
                    onStateChange={(value) => handleStateChange("shipping", value)}
                  />

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewShippingForm(false);
                        setEditingAddress(null);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel and use saved address
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Billing Address Section */}
          <div className="border-t border-[var(--border-default)] pt-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="sameAsShipping"
                checked={sameAsShipping}
                onChange={(e) => setSameAsShipping(e.target.checked)}
                className="w-5 h-5 text-[var(--color-brand-primary)] border-gray-300 rounded focus:ring-[var(--color-brand-primary)]"
              />
              <label
                htmlFor="sameAsShipping"
                className="text-sm font-medium text-[var(--text-heading)] cursor-pointer select-none"
              >
                Billing address is same as shipping
              </label>
            </div>

            <AnimatePresence>
              {!sameAsShipping && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                    Billing Address
                  </h3>
                  
                  {/* Billing Address Selection */}
                  {savedAddresses.length > 0 && !showNewBillingForm && (
                    <div className="grid gap-3 mb-4">
                      {savedAddresses.map((address) => (
                        <AddressCard
                          key={address.id}
                          address={address}
                          selected={selectedBillingAddress === address.id}
                          onSelect={() => setSelectedBillingAddress(address.id)}
                          onEdit={() => {
                            setEditingAddress(address);
                            setShowNewBillingForm(true);
                          }}
                          onDelete={() => handleDeleteAddress(address.id)}
                          type="billing"
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowNewBillingForm(true)}
                        className="p-4 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--color-brand-primary)] font-medium hover:border-[var(--color-brand-primary)] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Use Different Address
                      </button>
                    </div>
                  )}

                  {(showNewBillingForm || savedAddresses.length === 0) && (
                    <div className="p-6 bg-gray-50 rounded-xl border border-[var(--border-default)]">
                      <AddressForm
                        data={formData.billing}
                        onChange={(field, value) => handleBillingChange(field, value)}
                        errors={formErrors}
                        prefix="billing"
                        countries={countryOptions}
                        states={billingStateOptions.map((s) => ({ value: s.isoCode, label: s.name }))}
                        cities={billingCityOptions.map((c) => ({ value: c.name, label: c.name }))}
                        onCountryChange={(value) => handleCountryChange("billing", value)}
                        onStateChange={(value) => handleStateChange("billing", value)}
                      />
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewBillingForm(false)}
                          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel and select saved address
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Display */}
          {authError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800 whitespace-pre-line">{authError}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            <Link
              href="/cart"
              className="flex-1 border-2 border-[var(--border-inverse)] text-[var(--text-primary)] px-6 py-4 rounded-full hover:bg-[var(--bg-inverse)] hover:text-[var(--text-inverse)] transition-all font-medium text-center flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Cart
            </Link>
            <button
              type="submit"
              disabled={isLoading || (!selectedShippingAddress && !showNewShippingForm)}
              className="flex-[2] bg-[var(--btn-bg-primary)] text-[var(--btn-text-primary)] px-6 py-4 rounded-full hover:bg-[var(--btn-bg-hover)] transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue to Payment</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border border-[var(--border-default)] rounded-2xl p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[var(--color-brand-primary)] rounded-full flex items-center justify-center">
          <CreditCard size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-heading)]">
            Payment & Shipping
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Choose your preferred payment method
          </p>
        </div>
      </div>

      {authError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800 whitespace-pre-line">{authError}</p>
        </div>
      )}

      {/* Shipping Method Selection */}
      {loadingShipping ? (
        <div className="flex items-center justify-center py-12 mb-6">
          <Loader2 size={32} className="animate-spin text-[var(--color-brand-primary)]" />
          <span className="ml-3 text-[var(--text-secondary)]">Loading shipping options...</span>
        </div>
      ) : shippingMethods.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-heading)] flex items-center gap-2">
            <Truck size={20} />
            Shipping Method
          </h3>
          <div className="space-y-3">
            {shippingMethods.map((method) => (
              <label
                key={method.id}
                className={cn(
                  "flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all",
                  selectedShippingMethod === method.method
                    ? "border-[var(--color-brand-primary)] bg-blue-50"
                    : "border-[var(--border-default)] hover:border-[var(--color-brand-primary)]"
                )}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={method.method}
                    checked={selectedShippingMethod === method.method}
                    onChange={(e) => setSelectedShippingMethod(e.target.value)}
                    className="w-5 h-5 text-[var(--color-brand-primary)]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--text-heading)]">
                        {method.method === "STANDARD" && "Standard Shipping"}
                        {method.method === "EXPRESS" && "Express Shipping"}
                        {method.method === "OVERNIGHT" && "Overnight Shipping"}
                      </p>
                      {method.method === "STANDARD" && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                      <Clock size={14} />
                      {method.method === "STANDARD" && "5-7 business days"}
                      {method.method === "EXPRESS" && "2-3 business days"}
                      {method.method === "OVERNIGHT" && "Next business day"}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-lg text-[var(--text-heading)]">
                  {formatPrice(method.price, method.currency)}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-800">
            No shipping methods available for this address. Please go back and check your address.
          </p>
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-[var(--text-heading)] flex items-center gap-2">
          <Shield size={20} />
          Payment Method
        </h3>

        <label
          className={cn(
            "flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all",
            paymentMethod === "cod"
              ? "border-[var(--color-brand-primary)] bg-blue-50"
              : "border-[var(--border-default)] hover:border-[var(--color-brand-primary)]"
          )}
        >
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 text-[var(--color-brand-primary)]"
            />
            <div>
              <p className="font-semibold text-[var(--text-heading)]">Cash on Delivery</p>
              <p className="text-sm text-[var(--text-secondary)]">Pay when you receive your order</p>
            </div>
          </div>
          <Package size={24} className="text-[var(--color-brand-primary)]" />
        </label>

        <label
          className={cn(
            "flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all",
            paymentMethod === "card"
              ? "border-[var(--color-brand-primary)] bg-blue-50"
              : "border-[var(--border-default)] hover:border-[var(--color-brand-primary)]"
          )}
        >
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === "card"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 text-[var(--color-brand-primary)]"
            />
            <div>
              <p className="font-semibold text-[var(--text-heading)]">Credit / Debit Card</p>
              <p className="text-sm text-[var(--text-secondary)]">Visa, Mastercard, Amex</p>
            </div>
          </div>
          <CreditCard size={24} className="text-[var(--color-brand-primary)]" />
        </label>
      </div>

      {/* Card Form */}
      <AnimatePresence>
        {paymentMethod === "card" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[var(--border-default)] pt-6 mb-8"
          >
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">Secure SSL Encryption</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
                  Card Number *
                </label>
                <div className="relative">
                  <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-3 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  placeholder="JOHN DOE"
                  className="w-full px-4 py-3 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    placeholder="MM / YY"
                    maxLength={7}
                    className="w-full px-4 py-3 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-heading)] mb-2">
                    CVV *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-3 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors font-mono"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 group relative">
                      <AlertCircle size={18} className="text-gray-400" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        3 digits on back of card (4 for Amex)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => setStep(1)}
          disabled={isLoading}
          className="flex-1 border-2 border-[var(--border-inverse)] text-[var(--text-primary)] px-6 py-4 rounded-full hover:bg-[var(--bg-inverse)] hover:text-[var(--text-inverse)] transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading || shippingMethods.length === 0 || !selectedShippingMethod}
          className="flex-[2] bg-[var(--btn-bg-primary)] text-[var(--btn-text-primary)] px-6 py-4 rounded-full hover:bg-[var(--btn-bg-hover)] transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Place Order</span>
              <CheckCircle size={20} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white border border-[var(--border-default)] rounded-2xl p-8 md:p-12 text-center shadow-lg">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
          <CheckCircle size={56} className="text-green-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-heading)]">
          Order Confirmed!
        </h1>
        
        <p className="text-[var(--text-secondary)] text-lg mb-2">
          Thank you for your purchase
        </p>
        
        <p className="text-[var(--text-secondary)] mb-8">
          Order #
          <span className="font-semibold text-[var(--text-heading)]">
            {orderId?.slice(0, 8).toUpperCase()}
          </span>
        </p>

        <div className="bg-[var(--bg-surface)] rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold mb-4 text-[var(--text-heading)] flex items-center gap-2">
            <Package size={20} />
            Order Summary
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span className="font-semibold">{formatPrice(orderDetails?.subtotal)}</span>
            </div>
            
            {orderDetails?.promotionSavings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promotions</span>
                <span className="font-semibold">-{formatPrice(orderDetails.promotionSavings)}</span>
              </div>
            )}
            
            {orderDetails?.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span className="font-semibold">-{formatPrice(orderDetails.discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Shipping</span>
              <span className="font-semibold">{formatPrice(orderDetails?.shippingAmount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Tax</span>
              <span className="font-semibold">{formatPrice(orderDetails?.taxAmount)}</span>
            </div>
            
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(orderDetails?.total)}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Payment Method</span>
              <span className="font-semibold">
                {paymentMethod === "cod" ? "Cash on Delivery" : "Credit Card"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Shipping Method</span>
              <span className="font-semibold">
                {selectedShippingMethod === "EXPRESS" ? "Express (1-2 days)" : "Standard (3-5 days)"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <p className="text-sm text-(--text-secondary)">
            Confirmation sent to <span className="font-semibold text-(--text-heading)">{user?.email}</span>
          </p>
          <p className="text-sm text-(--text-secondary)">
            Estimated delivery: <span className="font-semibold text-(--text-heading)">
              {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/user/${user?.id}/orders/${orderId}`}
            className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-center"
          >
            Track Order
          </Link>
          <Link
            href="/shop"
            className="border-2 border-(--border-inverse) text-(--text-primary) px-8 py-3 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </motion.div>
  );

  // Main Render
  if (orderItems?.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-(--text-heading) mb-2">Your cart is empty</h2>
          <p className="text-(--text-secondary)] mb-6">Add some items to proceed to checkout</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-(--btn-bg-primary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <section className="bg-linear-to-br from-blue-50 to-purple-50 mx-4 rounded-2xl px-6 py-12 md:py-16 mb-6">
        <div className="max-w-7xl mx-auto">
          {step !== 3 && (
            <Link
              href={step === 1 ? "/cart" : "#"}
              onClick={step === 2 ? () => setStep(1) : undefined}
              className="text-(--text-secondary) hover:text-(--text-hover) font-medium flex items-center gap-2 mb-4 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>{step === 1 ? "Back to Cart" : "Back to Shipping"}</span>
            </Link>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="inline-block text-(--color-brand-primary) text-sm border-2 border-(--border-primary) rounded-full px-4 py-1.5 font-medium mb-3">
                SECURE CHECKOUT
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-(--text-heading)">
                {step === 3 ? "Order Confirmed" : "Complete Your Order"}
              </h1>
            </div>
          </div>

          {/* Progress Steps */}
          {step !== 3 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {[1, 2, 3].map((s, idx) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                      step >= s
                        ? "bg-(--color-brand-primary) text-white"
                        : "bg-white text-(--text-secondary) border border-(--border-default)"
                    )}
                  >
                    {step > s ? <CheckCircle size={20} /> : s}
                  </div>
                  <span
                    className={cn(
                      "hidden sm:inline font-medium",
                      step >= s ? "text-(--text-heading)" : "text-(--text-secondary)"
                    )}
                  >
                    {s === 1 ? "Shipping" : s === 2 ? "Payment" : "Confirm"}
                  </span>
                  {idx < 2 && <div className="w-12 h-0.5 bg-(--border-default) mx-2" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-4 mb-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </AnimatePresence>
            </div>

            {/* Right Column - Order Summary */}
            {step !== 3 && (
              <div className="lg:col-span-1">
                <div className="bg-white border border-(--border-default) rounded-2xl p-6 sticky top-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-(--text-heading) flex items-center gap-2">
                    <Package size={20} />
                    Order Summary
                  </h3>

                  {/* Items */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-(--border-default) max-h-80 overflow-y-auto custom-scrollbar">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-(--bg-surface) rounded-lg overflow-hidden shrink-0 border border-(--border-default)">
                          <Image
                            src={item.thumbnail || "/placeholder.png"}
                            width={64}
                            height={64}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-(--text-heading) line-clamp-2 leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-xs text-(--text-secondary) mt-1">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-(--text-heading) mt-1">
                            {formatPrice(item.itemTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-(--text-secondary)">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>

                    {promotionSavings > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promotions</span>
                        <span className="font-medium">-{formatPrice(promotionSavings)}</span>
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    {step === 2 && selectedShippingMethod && (
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-secondary)">Shipping</span>
                        <span className="font-medium">
                          {formatPrice(
                            shippingMethods.find((m) => m.method === selectedShippingMethod)?.price || 0
                          )}
                        </span>
                      </div>
                    )}

                    {taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-secondary)">Tax</span>
                        <span className="font-medium">{formatPrice(taxAmount)}</span>
                      </div>
                    )}

                    <div className="border-t border-(--border-default) pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-(--text-heading)">Total</span>
                        <span className="font-bold text-(--text-heading) text-xl">
                          {formatPrice(step === 2 ? finalTotal : total)}
                        </span>
                      </div>
                      {step === 1 && (
                        <p className="text-xs text-(--text-secondary) mt-1 text-right">
                          Shipping & taxes calculated at next step
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-6 pt-6 border-t border-(--border-default) flex items-center justify-center gap-2 text-sm text-(--text-secondary)">
                    <Shield size={16} className="text-green-600" />
                    <span>Secure SSL Checkout</span>
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