"use client";
import { useState } from "react";
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
  Sparkles,
  DollarSign,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const AddCoupon = () => {
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    expiresAt: "",
    usageLimit: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  const { adminID } = useParams();
  const navigate = useRouter();

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
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (expirationDate <= now) {
        newErrors.expiresAt = "Expiration date must be in the future";
      }
    }

    if (formData.usageLimit && (isNaN(formData.usageLimit) || formData.usageLimit < 1)) {
      newErrors.usageLimit = "Usage limit must be at least 1";
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

  const generateRandomCode = () => {
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData((prev) => ({
      ...prev,
      code: `SAVE${randomStr}`,
    }));
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
        expiresAt: formData.expiresAt,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        isActive: formData.isActive,
      };

      const { data } = await axios.post(`${baseUrl}/coupons`, payload, {
        withCredentials: true,
      });

      if (data.success) {
        setNotification({
          type: "success",
          message: "Coupon created successfully!",
        });
        toast.success("Coupon created successfully!");
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate.push(`/admin/${adminID}/coupons`);
        }, 1500);
      }
    } catch (error) {
      console.error("Create coupon error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create coupon";
      setNotification({
        type: "error",
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      code: "",
      discountType: "PERCENT",
      discountValue: "",
      expiresAt: "",
      usageLimit: "",
      isActive: true,
    });
    setErrors({});
    setNotification(null);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <ToastContainer />

      <DashboardHeadingBox
        text="Create New Coupon"
        subHeading="Add a new discount coupon for your store"
        button={
          <button
            onClick={() => navigate.push(`/admin/${adminID}/coupons`)}
            className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Coupons
          </button>
        }
      />

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
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SAVE20, WELCOME10"
                    className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 uppercase ${
                      errors.code ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Sparkles size={16} />
                    Generate
                  </button>
                </div>
                {errors.code && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.code}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Create a unique code for customers to apply at checkout. Will be
                  converted to uppercase.
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
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
                <p className="text-gray-500 text-xs mt-2">
                  Choose whether the discount is a percentage off or a fixed dollar amount.
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
                <p className="text-gray-500 text-xs mt-2">
                  {formData.discountType === "PERCENT"
                    ? "Enter a percentage between 1 and 100."
                    : "Enter a fixed dollar amount greater than 0."}
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
                  min={getTomorrowDate()}
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
                  min="1"
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
                  Maximum number of times this coupon can be used. Leave empty for
                  unlimited.
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
                  <label htmlFor="isActive" className="text-gray-700 cursor-pointer">
                    {formData.isActive ? (
                      <span className="text-green-700 font-medium">
                        Active - Coupon can be used immediately
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
                  disabled={isSubmitting}
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
                      Create Coupon
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
                        : `$${formData.discountValue}`}
                    </p>
                    <p className="text-sm opacity-90 mt-1">OFF</p>
                  </div>
                </div>
                {formData.expiresAt && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs opacity-75">
                      Valid until:{" "}
                      {new Date(formData.expiresAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {formData.usageLimit && (
                      <p className="text-xs opacity-75 mt-1">
                        Limited to {formData.usageLimit} uses
                      </p>
                    )}
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

export default AddCoupon;