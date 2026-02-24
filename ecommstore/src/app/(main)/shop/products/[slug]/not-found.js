'use client';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
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
            {/* Shopping bag illustration */}
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
            />
            
            {/* Question mark */}
            <circle cx="200" cy="180" r="50" fill="#4F7EFF" opacity="0.1"/>
            <text 
              x="200" 
              y="205" 
              fontSize="60" 
              fontWeight="700" 
              fill="#4F7EFF" 
              textAnchor="middle" 
              fontFamily="Inter, sans-serif"
            >
              ?
            </text>
            
            {/* Floating elements */}
            <circle cx="80" cy="120" r="8" fill="#4F7EFF" opacity="0.3"/>
            <circle cx="320" cy="160" r="6" fill="#5173ce" opacity="0.3"/>
            <circle cx="90" cy="220" r="5" fill="#888a89" opacity="0.2"/>
            <circle cx="310" cy="240" r="7" fill="#4F7EFF" opacity="0.2"/>
          </svg>
        </div>

        {/* Error Code */}
        <h1 className="text-[clamp(6rem,15vw,12rem)] font-bold leading-none text-(--text-heading) mb-4 tracking-tight relative animate-fade-in-up -mt-16">
          404
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-30 h-1 bg-linear-to-r from-transparent via-[#4F7EFF] to-transparent rounded-full"></span>
        </h1>

        {/* Title */}
        <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-semibold text-(--text-heading) -mt-14 mb-2 animate-fade-in-up-delay-1">
          Oops! Page Not Found
        </h2>

        {/* Message */}
        <p className="text-lg text-(--text-secondary) leading-relaxed -mt-12 mb-4 animate-fade-in-up-delay-2">
          The page you're looking for seems to have wandered off. Don't worry though, 
          we have plenty of great products waiting for you!
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up-delay-3">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded text-base font-medium bg-(--btn-bg-primary) text-(--btn-text-primary) transition-all duration-300 hover:bg-(--btn-bg-hover-secondary)"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <Link
            href={"/shop"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-white text-(--color-brand-primary) rounded border border-(--border-default) transition-all duration-300 hover:bg-black hover:border-black hover:text-white"
          >
            Shop Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
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