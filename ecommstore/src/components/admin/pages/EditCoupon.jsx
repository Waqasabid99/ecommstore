"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Tag,
  Percent,
  Calendar,
  Hash,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  BarChart3,
  Trash2,
  DollarSign,
  ShoppingCart,
  LoaderIcon,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const EditCoupon = () => {
  const [formData, setFormData] = useState({
    id: "",
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    minCartTotal: "",
    expiresAt: "",
    usageLimit: "",
    isActive: true,
    usedCount: 0,
    createdAt: "",
  });
  const [originalData, setOriginalData] = useState(null);
  const [couponStats, setCouponStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  const { adminID, couponID } = useParams();
  const navigate = useRouter();

  const fetchCoupon = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${baseUrl}/coupons/${couponID}`, {
        withCredentials: true,
      });

      if (data.success) {
        const coupon = data.data;
        // Format date for input field (YYYY-MM-DD)
        const formattedDate = new Date(coupon.expiresAt)
          .toISOString()
          .split("T")[0];

        const formattedData = {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType || "PERCENT",
          discountValue: coupon.discountValue,
          minCartTotal: coupon.minCartTotal || "",
          expiresAt: formattedDate,
          usageLimit: coupon.usageLimit || "",
          isActive: coupon.isActive,
          usedCount: coupon.usedCount,
          createdAt: coupon.createdAt,
        };

        setFormData(formattedData);
        setOriginalData(formattedData);

        // Fetch stats
        fetchCouponStats();
      }
    } catch (error) {
      console.error("Error fetching coupon:", error);
      toast.error("Failed to fetch coupon details");
      navigate.push(`/admin/${adminID}/coupons`);
    } finally {
      setIsLoading(false);
    }
  }, [couponID, adminID, navigate]);

  const fetchCouponStats = async () => {
    try {
      const { data } = await axios.get(
        `${baseUrl}/coupons/${couponID}/stats`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setCouponStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (couponID) {
      fetchCoupon();
    }
  }, [couponID, fetchCoupon]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    } else if (formData.code.length < 3) {
      newErrors.code = "Coupon code must be at least 3 characters";
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

    if (!formData.expiresAt) {
      newErrors.expiresAt = "Expiration date is required";
    } else {
      const expirationDate = new Date(formData.expiresAt);
      if (isNaN(expirationDate.getTime())) {
        newErrors.expiresAt = "Invalid date format";
      }
    }

    if (
      formData.usageLimit &&
      (isNaN(formData.usageLimit) || formData.usageLimit < formData.usedCount)
    ) {
      newErrors.usageLimit = `Usage limit cannot be less than current usage count (${formData.usedCount})`;
    }

    if (
      formData.minCartTotal &&
      (isNaN(formData.minCartTotal) || formData.minCartTotal < 0)
    ) {
      newErrors.minCartTotal = "Minimum cart total must be 0 or greater";
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

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        type: "error",
        message: "Please fix the errors before submitting",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minCartTotal: formData.minCartTotal ? Number(formData.minCartTotal) : null,
        expiresAt: formData.expiresAt,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        isActive: formData.isActive,
      };

      const { data } = await axios.put(
        `${baseUrl}/coupons/${couponID}`,
        payload,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setNotification({
          type: "success",
          message: "Coupon updated successfully!",
        });
        toast.success("Coupon updated successfully!");
        setOriginalData(formData);
        fetchCoupon(); // Refresh data
      }
    } catch (error) {
      console.error("Update coupon error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to update coupon";
      setNotification({
        type: "error",
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { data } = await axios.delete(`${baseUrl}/coupons/${couponID}`, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Coupon deactivated successfully");
        setTimeout(() => {
          navigate.push(`/admin/${adminID}/coupons`);
        }, 1500);
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
      toast.error(error.response?.data?.error || "Failed to delete coupon");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    setNotification(null);
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.code !== originalData.code ||
      formData.discountType !== originalData.discountType ||
      formData.discountValue !== originalData.discountValue ||
      formData.minCartTotal !== originalData.minCartTotal ||
      formData.expiresAt !== originalData.expiresAt ||
      formData.usageLimit !== originalData.usageLimit ||
      formData.isActive !== originalData.isActive
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const DeleteModal = () => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded-xl px-12 py-10 flex flex-col gap-3 items-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Deactivate Coupon
          </h1>
          <p className="text-gray-600 text-center">
            Are you sure you want to deactivate <strong>{formData.code}</strong>?
            This action will prevent customers from using this coupon.
          </p>
          <div className="flex items-center gap-3 mt-4 w-full">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="flex-1 bg-white text-gray-800 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white rounded-lg font-semibold px-4 py-3 hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <LoaderIcon size={16} className="animate-spin" />
                  Deactivating...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Deactivate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading coupon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <ToastContainer />

      <DashboardHeadingBox
        text="Edit Coupon"
        subHeading={`Editing ${formData.code}`}
        button={
          <>
            <button
              onClick={() => navigate.push(`/admin/${adminID}/coupons`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Coupons
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-white text-red-600 rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-red-500 hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Deactivate
            </button>
          </>
        }
      />

      {showDeleteConfirm && <DeleteModal />}

      <div className="mb-6">
        <div className="max-w-4xl mx-auto">
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

          {/* Stats Cards */}
          {couponStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total Uses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {couponStats.totalUses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Hash size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Remaining Uses
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {couponStats.remainingUses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Usage Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {couponStats.usageRate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      couponStats.isExpired
                        ? "bg-red-100"
                        : couponStats.isActive
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Clock
                      size={24}
                      className={
                        couponStats.isExpired
                          ? "text-red-600"
                          : couponStats.isActive
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <p className="text-sm font-bold text-gray-900">
                      {couponStats.isExpired
                        ? "Expired"
                        : couponStats.isActive
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coupon ID Display */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Coupon ID</p>
                <p className="text-sm font-mono font-medium text-gray-900">
                  {formData.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created At</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(formData.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Coupon Code Field */}
              <div>
                <label
                  htmlFor="code"
                  className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                >
                  <Tag size={18} className="text-black" />
                  Coupon Code
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SAVE20, WELCOME10"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 uppercase ${
                    errors.code ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.code && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.code}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Update the coupon code. Changes will reflect immediately.
                </p>
              </div>

              {/* Discount Type Field */}
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
                  <option value="PERCENT">Percentage Discount</option>
                  <option value="FIXED">Fixed Amount Discount</option>
                </select>
                <p className="text-gray-500 text-xs mt-2">
                  Choose whether the discount is a percentage of the cart total or a fixed dollar amount.
                </p>
              </div>

              {/* Discount Value Field */}
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
                        : "e.g., 5, 10, 20"
                    }
                    min="1"
                    max={formData.discountType === "PERCENT" ? "100" : undefined}
                    step={formData.discountType === "FIXED" ? "0.01" : "1"}
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
                <p className="text-gray-500 text-xs mt-2">
                  {formData.discountType === "PERCENT"
                    ? "Enter a percentage between 1 and 100."
                    : "Enter a dollar amount greater than 0."}
                </p>
              </div>

              {/* Minimum Cart Total Field */}
              <div>
                <label
                  htmlFor="minCartTotal"
                  className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                >
                  <ShoppingCart size={18} className="text-black" />
                  Minimum Cart Total
                  <span className="text-gray-500 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="minCartTotal"
                    name="minCartTotal"
                    value={formData.minCartTotal}
                    onChange={handleInputChange}
                    placeholder="e.g., 50, 100"
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                      errors.minCartTotal ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.minCartTotal && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.minCartTotal}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Set a minimum cart total required to use this coupon. Leave empty for no minimum.
                </p>
              </div>

              {/* Expiration Date Field */}
              <div>
                <label
                  htmlFor="expiresAt"
                  className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                >
                  <Calendar size={18} className="text-black" />
                  Expiration Date
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="expiresAt"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 bg-white ${
                    errors.expiresAt ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.expiresAt && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.expiresAt}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  The coupon will expire at the end of this date.
                </p>
              </div>

              {/* Usage Limit Field */}
              <div>
                <label
                  htmlFor="usageLimit"
                  className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                >
                  <Hash size={18} className="text-black" />
                  Usage Limit
                  <span className="text-gray-500 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <input
                  type="number"
                  id="usageLimit"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="Leave empty for unlimited uses"
                  min={formData.usedCount}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                    errors.usageLimit ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.usageLimit && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.usageLimit}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Maximum number of times this coupon can be used. Current usage:{" "}
                  {formData.usedCount}
                </p>
              </div>

              {/* Active Status Toggle */}
              <div>
                <label className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                  {formData.isActive ? (
                    <ToggleRight size={18} className="text-green-600" />
                  ) : (
                    <ToggleLeft size={18} className="text-gray-400" />
                  )}
                  Coupon Status
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
                  <label
                    htmlFor="isActive"
                    className="text-gray-700 cursor-pointer"
                  >
                    {formData.isActive ? (
                      <span className="text-green-700 font-medium">
                        Active - Coupon can be used
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium">
                        Inactive - Coupon cannot be used
                      </span>
                    )}
                  </label>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Toggle this to activate or deactivate the coupon.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges()}
                  className="flex-1 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting || !hasChanges()}
                  className="flex-1 sm:flex-initial bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          {formData.code && formData.discountValue && (
            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Preview
              </h3>
              <div className="bg-linear-to-r from-black to-gray-800 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">COUPON CODE</p>
                    <p className="text-3xl font-bold font-mono tracking-wider">
                      {formData.code.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold">
                      {formData.discountType === "PERCENT"
                        ? `${formData.discountValue}%`
                        : formatCurrency(formData.discountValue)}
                    </p>
                    <p className="text-sm opacity-90 mt-1">OFF</p>
                  </div>
                </div>
                {(formData.expiresAt || formData.minCartTotal) && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    {formData.expiresAt && (
                      <p className="text-xs opacity-75 mb-2">
                        Valid until:{" "}
                        {new Date(formData.expiresAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {formData.minCartTotal && (
                        <p className="text-xs opacity-75">
                          Min. cart total: {formatCurrency(formData.minCartTotal)}
                        </p>
                      )}
                      {formData.usageLimit && (
                        <p className="text-xs opacity-75">
                          {formData.usedCount} / {formData.usageLimit} uses
                        </p>
                      )}
                      {!formData.isActive && (
                        <span className="text-xs bg-red-500 px-2 py-1 rounded">
                          INACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCoupon;