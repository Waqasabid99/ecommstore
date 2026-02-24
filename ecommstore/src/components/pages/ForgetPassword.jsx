'use client';
import Link from 'next/link';
import { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'verified', 'success'
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    setError('');
    console.log('Email verification requested for:', email);
    // Simulate email verification
    setTimeout(() => {
      setStep('verified');
    }, 500);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    console.log('Password reset submitted:', { email, newPassword });
    setStep('success');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-(--text-primary)">Ecom Store.</span>
            </div>
          </div>

          {step === 'email' && (
            <>
              {/* Welcome Text */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-(--text-heading) mb-2">Forgot password?</h1>
                <p className="text-(--text-secondary)">No worries, we'll send you reset instructions.</p>
              </div>

              {/* Email Verification Form */}
              <form className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-(--text-primary) mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Verify Email Button */}
                <button
                  type="submit"
                  onClick={handleVerifyEmail}
                  className="w-full py-3 bg-(--color-brand-primary) text-white rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  Verify email
                </button>

                {/* Back to Login */}
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 text-(--text-secondary) hover:text-(--text-primary) transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to log in
                </Link>
              </form>
            </>
          )}

          {step === 'verified' && (
            <>
              {/* Reset Password Text */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-(--text-heading) mb-2">Set new password</h1>
                <p className="text-(--text-secondary)">
                  Your new password must be different from previously used passwords.
                </p>
              </div>

              {/* Reset Password Form */}
              <form className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                {/* Email Display (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-(--text-primary) mb-2">
                    Email address
                  </label>
                  <div className="w-full px-4 py-3 border border-(--border-default) rounded-lg bg-(--bg-surface) text-(--text-secondary)">
                    {email}
                  </div>
                </div>

                {/* New Password Input */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-(--text-primary) mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all pr-12"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary) hover:text-(--text-primary)"
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-(--text-secondary) mt-1">Must be at least 8 characters</p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-(--text-primary) mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary) focus:border-transparent transition-all pr-12"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary) hover:text-(--text-primary)"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Reset Password Button */}
                <button
                  onClick={handleResetPassword}
                  className="w-full py-3 bg-(--color-brand-primary) text-white rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  Reset password
                </button>

                {/* Back to Login */}
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 text-(--text-secondary) hover:text-(--text-primary) transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to log in
                </Link>
              </form>
            </>
          )}

          {step === 'success' && (
            <>
              {/* Success State */}
              <div className="mb-8">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h1 className="text-4xl font-bold text-(--text-heading) mb-2">Password reset</h1>
                <p className="text-(--text-secondary)">
                  Your password has been successfully reset. Click below to log in.
                </p>
              </div>

              <div className="space-y-6">
                {/* Continue to Login Button */}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full py-3 bg-(--color-brand-primary) text-white rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  Continue to log in
                </button>

                {/* Back to Login Link */}
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 text-(--text-secondary) hover:text-(--text-primary) transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to log in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-purple-400 to-purple-500 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern Icons */}
        <div className="absolute inset-0 opacity-20">
          {/* Lock icon pattern */}
          <div className="absolute top-20 left-20 w-12 h-16 border-2 border-white rounded-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
          
          {/* Key icon */}
          <div className="absolute top-32 right-32 w-20 h-8 border-2 border-white rounded-full"></div>
          <div className="absolute top-40 right-40 w-12 h-2 bg-white"></div>
          
          {/* Shield */}
          <div className="absolute bottom-32 left-32 w-12 h-16 border-2 border-white" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
          
          {/* Email envelopes */}
          <div className="absolute top-1/2 left-20 w-16 h-12 border-2 border-white rounded"></div>
          <div className="absolute bottom-40 right-40 w-16 h-12 border-2 border-white rounded"></div>
          
        </div>

        {/* Main Illustration - Large Lock/Security Theme */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            {/* Large Envelope with Lock */}
            <div className="relative">
              <div className="w-80 h-64 bg-white rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl relative">
                {/* Envelope fold */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-purple-200"></div>
                <div className="absolute top-0 left-0 w-full h-32 overflow-hidden">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-(160px) border-l-transparent border-r-(160px) border-r-transparent border-t-(80px) border-t-purple-600"></div>
                </div>
                
                {/* Lock Icon */}
                <div className="relative z-10 mt-8">
                  <div className="w-24 h-28 bg-purple-600 rounded-2xl flex items-end justify-center pb-4 relative">
                    {/* Lock shackle */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 border-8 border-purple-600 rounded-full border-b-0"></div>
                    {/* Keyhole */}
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <div className="absolute bottom-3 w-2 h-4 bg-white"></div>
                  </div>
                </div>

                {/* Email lines decoration */}
                <div className="absolute bottom-8 left-8 right-8 space-y-2">
                  <div className="h-1 bg-purple-200 rounded w-3/4"></div>
                  <div className="h-1 bg-purple-200 rounded w-1/2"></div>
                </div>
              </div>

              {/* Floating shield icon */}
              <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 w-20 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4zm0 18c-3.2-1-6-5.2-6-9V7.3l6-3 6 3V11c0 3.8-2.8 8-6 9z"/>
                  <path d="M10 17l-4-4 1.4-1.4 2.6 2.6 6.6-6.6L18 9l-8 8z"/>
                </svg>
              </div>

              {/* Decorative circles */}
              <div className="absolute -left-16 top-20 flex gap-2">
                <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                <div className="w-3 h-3 border-2 border-white rounded-full"></div>
              </div>

              {/* Wave decoration */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-full">
                <svg viewBox="0 0 400 50" className="w-full text-white opacity-70">
                  <path d="M0,25 Q50,10 100,25 T200,25 T300,25 T400,25" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;