  "use client";
  import { useShowToast } from "@/hooks/ShowToast";
  import useAuthStore from "@/store/authStore";
  import Link from "next/link";
  import { useRouter } from "next/navigation";
  import { useState } from "react";
  import { IoMdCloseCircleOutline } from "react-icons/io";

  const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
              <input
                type="email"
                id="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-(--text-primary) mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all"
                placeholder="Enter your name"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-(--text-primary) mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-(--text-primary) mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-2 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all"
                placeholder="Confirm your password"
              />
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
              Sign in with Google
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
