  "use client";
  import { useShowToast } from "@/hooks/ShowToast";
  import useAuthStore from "@/store/authStore";
import { ArrowLeft, Eye, EyeClosed, Mail, User } from "lucide-react";
  import Link from "next/link";
  import { useRouter } from "next/navigation";
  import { useState } from "react";
  import { IoMdCloseCircleOutline } from "react-icons/io";

  const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useRouter();
  const { isLoading, register } = useAuthStore();
  const { visible, message, type, show, hide } = useShowToast(3000);

  // Password validation: min 8 chars, 1 number, 1 special char
  const validatePassword = (pwd) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password match check
    if (password !== confirmPassword) {
      show("Passwords do not match", "error");
      return;
    }

    // Password strength check
    if (!validatePassword(password)) {
      show(
        "Password must be at least 8 characters with a number & special character",
        "error"
      );
      return;
    }

    const formData = { email, name, password };
    const response = await register(formData);
    if (response.success) {
      show("Registration successful!", "success");
      setTimeout(() => navigate.push("/"), 300);
    } else {
      show(response.error || "Registration failed", "error");
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in clicked");
  };

    return (
      <div className="min-h-screen flex">
       {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Go back */}
          <Link href="/">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-sm inline-flex items-center justify-center gap-2 font-semibold text-(--text-primary)">
                <ArrowLeft size={16} />
                Go back
              </span>
            </div>
          </Link>
          {/* Logo */}
          <div className="mb-5 flex items-center gap-2">
            <span className="text-2xl font-semibold text-(--text-primary)">
              Ecom Store.
            </span>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-4xl font-bold text-(--text-heading) mb-2">
              Create an account
            </h1>
            <p className="text-(--text-secondary)">Please enter your details</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Toast */}
            {visible && (
              <p
                className={`flex items-center gap-2 px-4 py-2 rounded-md mb-4 ${
                  type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                <IoMdCloseCircleOutline
                  onClick={hide}
                  size={20}
                  className="cursor-pointer"
                />
                {message}
              </p>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-(--text-primary) mb-2"
              >
                Email address
              </label>
              <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
              <Mail size={20} className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-(--text-primary) mb-2"
              >
                Name
              </label>
              <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all"
                placeholder="Enter your name"
              />
              <User size={20} className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-(--text-primary) mb-2"
              >
                Password
              </label>
              <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
              {showPassword ? (
                <Eye
                  size={20}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <EyeClosed
                  size={20}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-(--text-primary) mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-2 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all"
                placeholder="Confirm your password"
              />
              {showConfirmPassword ? (
                <Eye
                  size={20}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <EyeClosed
                  size={20}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-(--color-brand-primary) text-white rounded-lg font-medium hover:opacity-90 transition-all"
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 border border-(--border-default) rounded-lg font-medium hover:bg-(--bg-surface) transition-all flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
                <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335"/>
              </svg>
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-(--text-secondary)">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="text-(--color-brand-primary) hover:underline font-medium"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-purple-400 to-purple-500 items-center justify-center p-12 relative overflow-hidden">
          {/* Background Pattern Icons */}
          <div className="absolute inset-0 opacity-20">
            {/* Chat bubbles */}
            <div className="absolute top-20 left-20 w-16 h-16 border-2 border-white rounded-lg"></div>
            <div className="absolute top-32 right-32 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-32 left-32 w-12 h-12 border-2 border-white rounded-lg"></div>
          </div>

          {/* Main Illustration Container */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Customer Service Representative */}
            <div className="relative">
              {/* Checkmark Circle */}
              <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Person with headset */}
              <div className="relative">
                <div className="w-80 h-96 bg-white rounded-t-full rounded-b-3xl flex items-center justify-center overflow-hidden shadow-2xl">
                  <div className="relative w-full h-full">
                    {/* Head/Hair */}
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-48 h-56 bg-black rounded-full"></div>

                    {/* Face */}
                    <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-32 h-40 bg-white rounded-full z-10"></div>

                    {/* Body - Purple shirt */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-56 bg-purple-600 rounded-t-full"></div>

                    {/* Headset */}
                    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-40 h-8 border-4 border-black rounded-full z-20"></div>
                    <div className="absolute top-28 left-12 w-6 h-6 bg-black rounded-full z-20"></div>
                    <div className="absolute top-28 right-12 w-6 h-6 bg-black rounded-full z-20"></div>
                  </div>
                </div>

                {/* Wave decoration */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-full">
                  <svg
                    viewBox="0 0 400 50"
                    className="w-full text-white opacity-70"
                  >
                    <path
                      d="M0,25 Q50,10 100,25 T200,25 T300,25 T400,25"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Register;
