"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  User,
  Mail,
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Palette,
  Globe,
  RefreshCw,
  LogOut,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import useAuthStore from "@/store/authStore";
import axios from "axios";

const Settings = () => {
  const { user, setUser, logout } = useAuthStore();
  const { adminID } = useParams();
  const navigate = useRouter();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI State
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Preferences State
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    theme: "light",
    language: "en",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.userName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Validation Functions
  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (profileData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(profileData.email)) {
      newErrors.email = "Invalid email format";
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      setNotification({
        type: "error",
        message: "Please fix the errors before submitting",
      });
      return;
    }

    setIsProfileLoading(true);
    setNotification(null);

    try {
      const { data } = await axios.patch(
        `${baseUrl}/users/update/${adminID}`,
        {
          name: profileData.name.trim(),
          email: profileData.email.trim(),
        },
        { withCredentials: true }
      );

      if (data.success) {
        setUser(data.data);
        setNotification({
          type: "success",
          message: "Profile updated successfully!",
        });
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      setNotification({
        type: "error",
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      setNotification({
        type: "error",
        message: "Please fix the errors before submitting",
      });
      return;
    }

    setIsPasswordLoading(true);
    setNotification(null);

    try {
      const { data } = await axios.patch(
        `${baseUrl}/users/update/${adminID}`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );

      if (data.success) {
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setNotification({
          type: "success",
          message: "Password changed successfully!",
        });
        toast.success("Password changed successfully!");
      }
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to change password";
      setNotification({
        type: "error",
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate.push("/login");
  };

  // Handle Input Changes
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    toast.success("Preference updated!");
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "password", label: "Password", icon: <Lock size={18} /> },
    { id: "preferences", label: "Preferences", icon: <Palette size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <ToastContainer />

      <DashboardHeadingBox
        text="Settings"
        subHeading="Manage your account settings and preferences"
        button={
          <button
            onClick={handleLogout}
            className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-red-500 hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        }
      />

      <div className="mb-6">
        <div className="max-w-6xl mx-auto">
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

          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-black text-white border-b-2 border-black"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Profile Information
                </h2>
                <p className="text-gray-600">
                  Update your account profile information
                </p>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    <User size={18} className="text-black" />
                    Name
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileInputChange}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                      profileErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {profileErrors.name && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {profileErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    <Mail size={18} className="text-black" />
                    Email
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileInputChange}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 ${
                      profileErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {profileErrors.email && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {profileErrors.email}
                    </p>
                  )}
                </div>

                {/* Role Display (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                    <Shield size={18} className="text-black" />
                    Role
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                    {user?.role || "N/A"}
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    Your role is managed by system administrators
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isProfileLoading}
                    className="flex-1 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProfileLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Change Password
                </h2>
                <p className="text-gray-600">
                  Update your password to keep your account secure
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
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
                      onChange={handlePasswordInputChange}
                      placeholder="Enter your current password"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 pr-12 ${
                        passwordErrors.oldPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {passwordErrors.oldPassword}
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
                      onChange={handlePasswordInputChange}
                      placeholder="Enter your new password"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 pr-12 ${
                        passwordErrors.newPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {passwordErrors.newPassword}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Password must be at least 8 characters with uppercase, lowercase,
                    and number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-gray-800 font-semibold mb-3"
                  >
                    <Lock size={18} className="text-black" />
                    Confirm New Password
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Confirm your new password"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition-colors text-gray-800 pr-12 ${
                        passwordErrors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="flex-1 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPasswordLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Preferences
                </h2>
                <p className="text-gray-600">
                  Customize your dashboard experience
                </p>
              </div>

              <div className="space-y-6">
                {/* Notifications */}
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Bell size={20} />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-600">
                          Receive email notifications for important updates
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) =>
                          handlePreferenceChange("emailNotifications", e.target.checked)
                        }
                        className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Order Alerts</p>
                        <p className="text-sm text-gray-600">
                          Get notified when new orders are placed
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.orderAlerts}
                        onChange={(e) =>
                          handlePreferenceChange("orderAlerts", e.target.checked)
                        }
                        className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Low Stock Alerts</p>
                        <p className="text-sm text-gray-600">
                          Receive alerts when products are running low
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.lowStockAlerts}
                        onChange={(e) =>
                          handlePreferenceChange("lowStockAlerts", e.target.checked)
                        }
                        className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Appearance */}
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Palette size={20} />
                    Appearance
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe size={20} />
                    Language & Region
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) =>
                        handlePreferenceChange("language", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Security Settings
                </h2>
                <p className="text-gray-600">
                  Manage your account security and activity
                </p>
              </div>

              <div className="space-y-6">
                {/* Account Info */}
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Account Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account ID</span>
                      <span className="font-mono text-sm text-gray-800">
                        {user?.id || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email</span>
                      <span className="text-gray-800">{user?.email || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Role</span>
                      <span className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                        {user?.role || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Session Management */}
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Active Sessions
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Current Session</p>
                        <p className="text-sm text-gray-600 mt-1">
                          This device • Active now
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Sign Out All Devices
                  </button>
                </div>

                {/* Danger Zone */}
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-4">
                    Danger Zone
                  </h3>
                  <div className="border-2 border-red-200 rounded-lg p-4">
                    <p className="text-gray-800 font-medium mb-2">
                      Delete Account
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Once you delete your account, there is no going back. Please be
                      certain.
                    </p>
                    <button
                      disabled
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Account (Contact Admin)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;