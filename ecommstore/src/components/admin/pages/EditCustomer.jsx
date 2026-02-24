"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  LoaderIcon,
  Key,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const EditCustomer = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    role: "USER",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [originalData, setOriginalData] = useState({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [changePassword, setChangePassword] = useState(false);

  const { adminID, customerID: id } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${baseUrl}/users/${id}`, {
        withCredentials: true,
      });

      if (data.success) {
        const customer = {
          userName: data.data.userName || "",
          email: data.data.email || "",
          role: data.data.role || "USER",
        };
        setFormData(customer);
        setOriginalData(customer);
      }
    } catch (error) {
      console.error("Fetch customer error:", error);
      toast.error("Failed to fetch customer data");
      navigate.push(`/admin/${adminID}/customers`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.userName.trim()) {
      newErrors.userName = "Name is required";
    } else if (formData.userName.length < 2) {
      newErrors.userName = "Name must be at least 2 characters";
    } else if (formData.userName.length > 50) {
      newErrors.userName = "Name must not exceed 50 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (only if changing password)
    if (changePassword) {
      if (!passwordData.oldPassword) {
        newErrors.oldPassword = "Current password is required";
      }

      if (!passwordData.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (passwordData.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])/.test(passwordData.newPassword)) {
        newErrors.newPassword = "Password must contain at least one lowercase letter";
      } else if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
        newErrors.newPassword = "Password must contain at least one uppercase letter";
      } else if (!/(?=.*\d)/.test(passwordData.newPassword)) {
        newErrors.newPassword = "Password must contain at least one number";
      }

      if (!passwordData.confirmNewPassword) {
        newErrors.confirmNewPassword = "Please confirm your new password";
      } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        newErrors.confirmNewPassword = "Passwords do not match";
      }

      if (passwordData.oldPassword === passwordData.newPassword) {
        newErrors.newPassword = "New password must be different from current password";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
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
        name: formData.userName.trim(),
        email: formData.email.toLowerCase().trim(),
        role: formData.role,
      };

      // Add password fields if changing password
      if (changePassword) {
        payload.oldPassword = passwordData.oldPassword;
        payload.newPassword = passwordData.newPassword;
      }

      const { data } = await axios.put(
        `${baseUrl}/users/update/${id}`,
        payload,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setNotification({
          type: "success",
          message: "Customer updated successfully!",
        });
        toast.success("Customer updated successfully!");

        // Reset password fields
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setChangePassword(false);

        // Update original data
        setOriginalData({
          userName: formData.userName,
          email: formData.email,
          role: formData.role,
        });

        // Redirect after a short delay
        setTimeout(() => {
          navigate.push(`/admin/${adminID}/customers`);
        }, 1500);
      }
    } catch (error) {
      console.error("Update customer error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update customer";
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
    setFormData(originalData);
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setChangePassword(false);
    setErrors({});
    setNotification(null);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2)
      return { strength: 33, label: "Weak", color: "bg-red-500" };
    if (strength <= 3)
      return { strength: 66, label: "Medium", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  const hasChanges = () => {
    return (
      formData.userName !== originalData.userName ||
      formData.email !== originalData.email ||
      formData.role !== originalData.role ||
      (changePassword &&
        (passwordData.oldPassword ||
          passwordData.newPassword ||
          passwordData.confirmNewPassword))
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon size={48} className="animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-600">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <ToastContainer />

      <DashboardHeadingBox
        text="Edit Customer"
        subHeading={`Update customer information for ${formData.userName}`}
        button={
          <button
            onClick={() => navigate.push(`/admin/${adminID}/customers`)}
            className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Customers
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

          {/* Changes Indicator */}
          {hasChanges() && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-blue-600 shrink-0" size={20} />
              <p className="text-blue-800 font-medium">
                You have unsaved changes. Click "Update Customer" to save or "Reset" to discard.
              </p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Basic Information
                </h3>

                {/* Name Field */}
                <div className="mb-6">
                  <label
                    htmlFor="userName"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    <User size={18} className="text-black" />
                    Full Name
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                      errors.userName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.userName && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.userName}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    <Mail size={18} className="text-black" />
                    Email Address
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., john@example.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.email}
                    </p>
                  )}
                  {formData.email !== originalData.email && (
                    <p className="text-orange-600 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Changing email will require the user to verify the new email
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label
                    htmlFor="role"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    <Shield size={18} className="text-black" />
                    User Role
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 bg-white"
                  >
                    <option value="USER">User - Regular Customer</option>
                    <option value="ADMIN">Admin - Full Access</option>
                  </select>
                  {formData.role !== originalData.role && (
                    <p className="text-orange-600 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Role changes take effect immediately
                    </p>
                  )}
                </div>
              </div>

              {/* Password Change Section */}
              <div className="pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Change Password
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setChangePassword(!changePassword);
                      setPasswordData({
                        oldPassword: "",
                        newPassword: "",
                        confirmNewPassword: "",
                      });
                      setErrors({});
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {changePassword ? "Cancel" : "Change Password"}
                  </button>
                </div>

                {!changePassword && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                    <Key size={20} className="text-gray-400" />
                    <p className="text-gray-600 text-sm">
                      Click "Change Password" to update the customer's password.
                      This requires the current password for security.
                    </p>
                  </div>
                )}

                {changePassword && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Admin Password Change</p>
                        <p>
                          As an admin, you need the user's current password to change it.
                          If the user has forgotten their password, use the password reset feature instead.
                        </p>
                      </div>
                    </div>

                    {/* Current Password */}
                    <div>
                      <label
                        htmlFor="oldPassword"
                        className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                      >
                        <Lock size={18} className="text-black" />
                        Current Password
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showOldPassword ? "text" : "password"}
                          id="oldPassword"
                          name="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                            errors.oldPassword ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {showOldPassword ? (
                            <EyeOff size={18} className="text-gray-600" />
                          ) : (
                            <Eye size={18} className="text-gray-600" />
                          )}
                        </button>
                      </div>
                      {errors.oldPassword && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.oldPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                      >
                        <Lock size={18} className="text-black" />
                        New Password
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                            errors.newPassword ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} className="text-gray-600" />
                          ) : (
                            <Eye size={18} className="text-gray-600" />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.newPassword}
                        </p>
                      )}
                      {passwordData.newPassword && !errors.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">
                              Password Strength: {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label
                        htmlFor="confirmNewPassword"
                        className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                      >
                        <Lock size={18} className="text-black" />
                        Confirm New Password
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmNewPassword"
                          name="confirmNewPassword"
                          value={passwordData.confirmNewPassword}
                          onChange={handlePasswordChange}
                          placeholder="Re-enter new password"
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                            errors.confirmNewPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} className="text-gray-600" />
                          ) : (
                            <Eye size={18} className="text-gray-600" />
                          )}
                        </button>
                      </div>
                      {errors.confirmNewPassword && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.confirmNewPassword}
                        </p>
                      )}
                      {passwordData.newPassword &&
                        passwordData.confirmNewPassword &&
                        !errors.confirmNewPassword &&
                        passwordData.newPassword === passwordData.confirmNewPassword && (
                          <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                            <CheckCircle size={12} />
                            Passwords match
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges()}
                  className="flex-1 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Customer
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting || !hasChanges()}
                  className="flex-1 sm:flex-initial bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;