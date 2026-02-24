'use client';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-8 pb-4 bg-[#F8F8F8]">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-8 animate-float">
          <svg 
            viewBox="0 0 400 300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-75 h-auto mx-auto"
          >
            {/* Broken shopping bag illustration */}
            <rect 
              x="120" 
              y="100" 
              width="160" 
              height="180" 
              rx="8" 
              fill="#f3f3f3" 
              stroke="#d1d5db" 
              strokeWidth="2"
            />
            <path 
              d="M140 100 C140 80, 160 60, 200 60 C240 60, 260 80, 260 100" 
              stroke="#4F7EFF" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
              strokeDasharray="5,5"
            />
            
            {/* Warning/Error symbol */}
            <circle cx="200" cy="180" r="50" fill="#FF6B6B" opacity="0.1"/>
            <text 
              x="200" 
              y="210" 
              fontSize="60" 
              fontWeight="700" 
              fill="#FF6B6B" 
              textAnchor="middle" 
              fontFamily="Inter, sans-serif"
            >
              !
            </text>
            
            {/* Floating elements - error themed */}
            <circle cx="80" cy="120" r="8" fill="#FF6B6B" opacity="0.3"/>
            <circle cx="320" cy="160" r="6" fill="#FF6B6B" opacity="0.3"/>
            <circle cx="90" cy="220" r="5" fill="#888a89" opacity="0.2"/>
            <circle cx="310" cy="240" r="7" fill="#FF6B6B" opacity="0.2"/>
            
            {/* Crack lines */}
            <path 
              d="M200 130 L210 150 L200 170" 
              stroke="#d1d5db" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Error Code */}
        <h1 className="text-[clamp(6rem,15vw,12rem)] font-bold leading-none text-black mb-4 tracking-tight relative animate-fade-in-up -mt-16">
          {error?.status || 500}
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-30 h-1 bg-linear-to-r from-transparent via-[#FF6B6B] to-transparent rounded-full"></span>
        </h1>

        {/* Title */}
        <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-semibold text-black -mt-14 mb-2 animate-fade-in-up-delay-1">
          Something Went Wrong
        </h2>

        {/* Message */}
        <p className="text-lg text-gray-600 leading-relaxed -mt-12 mb-4 animate-fade-in-up-delay-2">
          We're experiencing technical difficulties. Our team has been notified and 
          we're working to fix the issue. Please try again in a moment.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up-delay-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded text-base font-medium bg-black text-white transition-all duration-300 hover:bg-[#5173ce]"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-white text-[#4F7EFF] rounded border border-[#d1d5db] transition-all duration-300 hover:bg-black hover:border-black hover:text-white"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        {/* Technical Details (Optional - can be removed in production) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded text-left animate-fade-in-up-delay-4">
            <p className="text-sm font-semibold text-red-800 mb-2">Error Details (Development Only):</p>
            <p className="text-xs text-red-600 font-mono break-all">{error.message}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-fade-in-up-delay-1 {
          animation: fadeInUp 0.6s ease-out 0.1s backwards;
        }

        .animate-fade-in-up-delay-2 {
          animation: fadeInUp 0.6s ease-out 0.2s backwards;
        }

        .animate-fade-in-up-delay-3 {
          animation: fadeInUp 0.6s ease-out 0.3s backwards;
        }

        .animate-fade-in-up-delay-4 {
          animation: fadeInUp 0.6s ease-out 0.4s backwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .flex-wrap {
            flex-direction: column;
          }
          
          .flex-wrap > * {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}