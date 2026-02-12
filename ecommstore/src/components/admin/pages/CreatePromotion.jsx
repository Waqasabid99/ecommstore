"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Tag,
  Percent,
  Calendar,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package,
  Layers,
  ShoppingCart,
  Search,
  X,
  Plus,
  Info,
  Clock,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const CreatePromotion = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "",
    startsAt: "",
    endsAt: "",
    appliesTo: "PRODUCT",
    isStackable: false,
    isActive: true,
    productIds: [],
    variantIds: [],
    categoryIds: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  // Data for selection
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Search and selection states
  const [searchQuery, setSearchQuery] = useState("");
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const { adminID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${baseUrl}/products?limit=1000`, { withCredentials: true }),
        axios.get(`${baseUrl}/categories`, { withCredentials: true }),
      ]);

      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
        
        // Extract all variants from products
        const allVariants = productsRes.data.data.flatMap((product) =>
          product.variants.map((variant) => ({
            ...variant,
            productName: product.name,
          }))
        );
        setVariants(allVariants);
      }

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Promotion name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Promotion name must be at least 3 characters";
    }

    if (!formData.discountValue) {
      newErrors.discountValue = "Discount value is required";
    } else if (isNaN(formData.discountValue) || formData.discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    } else if (
      formData.discountType === "PERCENT" &&
      (formData.discountValue < 1 || formData.discountValue > 100)
    ) {
      newErrors.discountValue = "Discount percentage must be between 1 and 100";
    }

    if (!formData.startsAt) {
      newErrors.startsAt = "Start date is required";
    }

    if (!formData.endsAt) {
      newErrors.endsAt = "End date is required";
    }

    if (formData.startsAt && formData.endsAt) {
      const startDate = new Date(formData.startsAt);
      const endDate = new Date(formData.endsAt);

      if (endDate <= startDate) {
        newErrors.endsAt = "End date must be after start date";
      }
    }

    // Validate that appropriate items are selected
    if (formData.appliesTo === "PRODUCT" && formData.productIds.length === 0) {
      newErrors.productIds = "Please select at least one product";
    }

    if (formData.appliesTo === "VARIANT" && formData.variantIds.length === 0) {
      newErrors.variantIds = "Please select at least one variant";
    }

    if (formData.appliesTo === "CATEGORY" && formData.categoryIds.length === 0) {
      newErrors.categoryIds = "Please select at least one category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAppliesToChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      appliesTo: value,
      productIds: [],
      variantIds: [],
      categoryIds: [],
    }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        type: "error",
        message: "Please fix the errors before submitting",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        startsAt: formData.startsAt,
        endsAt: formData.endsAt,
        appliesTo: formData.appliesTo,
        isStackable: formData.isStackable,
        isActive: formData.isActive,
        ...(formData.appliesTo === "PRODUCT" && {
          productIds: formData.productIds,
        }),
        ...(formData.appliesTo === "VARIANT" && {
          variantIds: formData.variantIds,
        }),
        ...(formData.appliesTo === "CATEGORY" && {
          categoryIds: formData.categoryIds,
        }),
      };

      const { data } = await axios.post(`${baseUrl}/promotions`, payload, {
        withCredentials: true,
      });

      if (data.success) {
        setNotification({
          type: "success",
          message: "Promotion created successfully!",
        });
        toast.success("Promotion created successfully!");

        setTimeout(() => {
          navigate.push(`/admin/${adminID}/promotions`);
        }, 1500);
      }
    } catch (error) {
      console.error("Create promotion error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create promotion";
      setNotification({
        type: "error",
        message: errorMessage,
      });
      toast.error(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      discountType: "PERCENT",
      discountValue: "",
      startsAt: "",
      endsAt: "",
      appliesTo: "PRODUCT",
      isStackable: false,
      isActive: true,
      productIds: [],
      variantIds: [],
      categoryIds: [],
    });
    setErrors({});
    setNotification(null);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };
  
  const AllCategories = categories.map((category) => category)
  const ChildCategories = categories.map((c) => c.children.map((child) => child))
  const filteredCategories = [...AllCategories, ...ChildCategories].flat()

  // Selection Modal Component
  const SelectionModal = () => {
    const [localSearch, setLocalSearch] = useState("");

    const getAvailableItems = () => {
      switch (formData.appliesTo) {
        case "PRODUCT":
          return products.filter((p) =>
            p.name.toLowerCase().includes(localSearch.toLowerCase())
          );
        case "VARIANT":
          return variants.filter(
            (v) =>
              v.sku.toLowerCase().includes(localSearch.toLowerCase()) ||
              v.productName.toLowerCase().includes(localSearch.toLowerCase())
          );
        case "CATEGORY":
          return filteredCategories.filter((c) =>
            c.name.toLowerCase().includes(localSearch.toLowerCase())
          );
        default:
          return [];
      }
    };

    const getSelectedIds = () => {
      switch (formData.appliesTo) {
        case "PRODUCT":
          return formData.productIds;
        case "VARIANT":
          return formData.variantIds;
        case "CATEGORY":
          return formData.categoryIds;
        default:
          return [];
      }
    };

    const toggleSelection = (id) => {
      const key = `${formData.appliesTo.toLowerCase()}Ids`;
      const currentIds = getSelectedIds();

      if (currentIds.includes(id)) {
        setFormData((prev) => ({
          ...prev,
          [key]: currentIds.filter((itemId) => itemId !== id),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [key]: [...currentIds, id],
        }));
      }
    };

    const availableItems = getAvailableItems();
    const selectedIds = getSelectedIds();

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Select {formData.appliesTo === "CATEGORY" ? "Categories" : formData.appliesTo === "PRODUCT" ? "Products" : "Variants"}
              </h2>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={`Search ${formData.appliesTo.toLowerCase()}s...`}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {availableItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No items found
                </div>
              ) : (
                availableItems.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedIds.includes(item.id)
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <div className="flex-1">
                      {formData.appliesTo === "PRODUCT" && (
                        <div className="flex items-center gap-3">
                          {item.thumbnail && (
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded border border-gray-200"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.variants.length} variant{item.variants.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      )}
                      {formData.appliesTo === "VARIANT" && (
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.productName}
                          </div>
                          <div className="text-sm text-gray-600">
                            SKU: {item.sku} • ${Number(item.price).toFixed(2)}
                          </div>
                        </div>
                      )}
                      {formData.appliesTo === "CATEGORY" && (
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getSelectedItemsDisplay = () => {
    let items = [];
    let key = "";

    switch (formData.appliesTo) {
      case "PRODUCT":
        items = products.filter((p) => formData.productIds.includes(p.id));
        key = "productIds";
        break;
      case "VARIANT":
        items = variants.filter((v) => formData.variantIds.includes(v.id));
        key = "variantIds";
        break;
      case "CATEGORY":
        items = categories.filter((c) => formData.categoryIds.includes(c.id));
        key = "categoryIds";
        break;
    }

    const removeItem = (id) => {
      setFormData((prev) => ({
        ...prev,
        [key]: prev[key].filter((itemId) => itemId !== id),
      }));
    };

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          No {formData.appliesTo.toLowerCase()}s selected
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
          >
            {formData.appliesTo === "PRODUCT" && item.thumbnail && (
              <img
                src={item.thumbnail}
                alt={item.name}
                className="w-10 h-10 object-cover rounded border border-gray-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">
                {formData.appliesTo === "VARIANT" ? item.productName : item.name}
              </div>
              {formData.appliesTo === "VARIANT" && (
                <div className="text-xs text-gray-500">SKU: {item.sku}</div>
              )}
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <ToastContainer />

      <DashboardHeadingBox
        text="Create New Promotion"
        subHeading="Set up a new discount promotion for your store"
        button={
          <button
            onClick={() => navigate.push(`/admin/${adminID}/promotions`)}
            className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Promotions
          </button>
        }
      />

      <div className="mb-6">
        <div className="max-w-5xl mx-auto">
          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 border rounded-xl p-4 flex items-start gap-3 ${
                notification.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="text-green-600 shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 shrink-0" size={20} />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    notification.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
                  Basic Information
                </h3>

                {/* Promotion Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    <Tag size={18} className="text-black" />
                    Promotion Name
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer Sale, Black Friday Deal"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.name}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Give your promotion a clear, descriptive name.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    <Info size={18} className="text-black" />
                    Description
                    <span className="text-gray-500 text-xs font-normal">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add details about this promotion..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 resize-none"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Optional description for internal reference.
                  </p>
                </div>
              </div>

              {/* Discount Configuration Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
                  Discount Configuration
                </h3>

                {/* Discount Type */}
                <div>
                  <label
                    htmlFor="discountType"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    <Percent size={18} className="text-black" />
                    Discount Type
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 bg-white"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label
                    htmlFor="discountValue"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    {formData.discountType === "PERCENT" ? (
                      <Percent size={18} className="text-black" />
                    ) : (
                      <DollarSign size={18} className="text-black" />
                    )}
                    Discount Value
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="discountValue"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={
                        formData.discountType === "PERCENT"
                          ? "e.g., 10, 25, 50"
                          : "e.g., 5, 10, 25"
                      }
                      min={formData.discountType === "PERCENT" ? "1" : "0.01"}
                      max={formData.discountType === "PERCENT" ? "100" : undefined}
                      step={formData.discountType === "PERCENT" ? "1" : "0.01"}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                        errors.discountValue ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      {formData.discountType === "PERCENT" ? "%" : "$"}
                    </span>
                  </div>
                  {errors.discountValue && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.discountValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Schedule Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
                  Schedule
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label
                      htmlFor="startsAt"
                      className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                    >
                      <Calendar size={18} className="text-black" />
                      Start Date & Time
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="startsAt"
                      name="startsAt"
                      value={formData.startsAt}
                      onChange={handleInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 bg-white ${
                        errors.startsAt ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.startsAt && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.startsAt}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label
                      htmlFor="endsAt"
                      className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                    >
                      <Clock size={18} className="text-black" />
                      End Date & Time
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="endsAt"
                      name="endsAt"
                      value={formData.endsAt}
                      onChange={handleInputChange}
                      min={formData.startsAt || new Date().toISOString().slice(0, 16)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 bg-white ${
                        errors.endsAt ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.endsAt && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.endsAt}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Scope Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
                  Application Scope
                </h3>

                {/* Applies To */}
                <div>
                  <label className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                    <Layers size={18} className="text-black" />
                    Applies To
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: "PRODUCT", label: "Products", icon: Package },
                      { value: "VARIANT", label: "Variants", icon: Layers },
                      { value: "CATEGORY", label: "Categories", icon: Tag },
                      { value: "CART", label: "Entire Cart", icon: ShoppingCart },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleAppliesToChange(value)}
                        className={`p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 ${
                          formData.appliesTo === value
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon size={24} className={formData.appliesTo === value ? "text-black" : "text-gray-400"} />
                        <span className={`font-medium text-sm ${formData.appliesTo === value ? "text-black" : "text-gray-600"}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    {formData.appliesTo === "CART"
                      ? "This promotion will apply to the entire cart total."
                      : `Select which ${formData.appliesTo.toLowerCase()}s this promotion applies to.`}
                  </p>
                </div>

                {/* Item Selection */}
                {formData.appliesTo !== "CART" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-gray-800 font-semibold">
                        Selected {formData.appliesTo === "CATEGORY" ? "Categories" : formData.appliesTo === "PRODUCT" ? "Products" : "Variants"}
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSelectionModal(true)}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Plus size={16} />
                        Add {formData.appliesTo === "CATEGORY" ? "Categories" : formData.appliesTo === "PRODUCT" ? "Products" : "Variants"}
                      </button>
                    </div>

                    {getSelectedItemsDisplay()}

                    {(errors.productIds || errors.variantIds || errors.categoryIds) && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.productIds || errors.variantIds || errors.categoryIds}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Settings Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
                  Settings
                </h3>

                {/* Stackable Toggle */}
                <div>
                  <label className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                    <Layers size={18} className="text-black" />
                    Stackable with Other Promotions
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isStackable"
                      name="isStackable"
                      checked={formData.isStackable}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <label htmlFor="isStackable" className="text-gray-700 cursor-pointer">
                      {formData.isStackable ? (
                        <span className="text-green-700 font-medium">
                          Can be combined with other promotions
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium">
                          Cannot be combined with other promotions
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                {/* Active Status Toggle */}
                <div>
                  <label className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                    {formData.isActive ? (
                      <ToggleRight size={18} className="text-green-600" />
                    ) : (
                      <ToggleLeft size={18} className="text-gray-400" />
                    )}
                    Promotion Status
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <label htmlFor="isActive" className="text-gray-700 cursor-pointer">
                      {formData.isActive ? (
                        <span className="text-green-700 font-medium">
                          Active - Promotion is enabled
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium">
                          Inactive - Promotion is disabled
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || loadingData}
                  className="flex-1 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Create Promotion
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          {formData.name && formData.discountValue && (
            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Preview
              </h3>
              <div className="bg-linear-to-r from-black to-gray-800 text-white rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {formData.appliesTo === "PRODUCT" && <Package size={20} />}
                      {formData.appliesTo === "VARIANT" && <Layers size={20} />}
                      {formData.appliesTo === "CATEGORY" && <Tag size={20} />}
                      {formData.appliesTo === "CART" && <ShoppingCart size={20} />}
                      <span className="text-sm opacity-90 uppercase tracking-wide">
                        {formData.appliesTo} PROMOTION
                      </span>
                    </div>
                    <p className="text-2xl font-bold mb-1">{formData.name}</p>
                    {formData.description && (
                      <p className="text-sm opacity-90">{formData.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold">
                      {formData.discountType === "PERCENT"
                        ? `${formData.discountValue}%`
                        : `$${formData.discountValue}`}
                    </p>
                    <p className="text-sm opacity-90 mt-1">OFF</p>
                  </div>
                </div>
                {(formData.startsAt || formData.endsAt) && (
                  <div className="mt-4 pt-4 border-t border-white/20 text-sm">
                    {formData.startsAt && (
                      <p className="opacity-75">
                        Starts: {new Date(formData.startsAt).toLocaleString()}
                      </p>
                    )}
                    {formData.endsAt && (
                      <p className="opacity-75 mt-1">
                        Ends: {new Date(formData.endsAt).toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {formData.isStackable && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          Stackable
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${formData.isActive ? "bg-green-500/30" : "bg-gray-500/30"}`}>
                        {formData.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Modal */}
      {showSelectionModal && <SelectionModal />}
    </div>
  );
};

export default CreatePromotion;