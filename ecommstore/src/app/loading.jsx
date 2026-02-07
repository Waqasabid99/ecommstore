'use client';
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-8 bg-[#F8F8F8]">
      <div className="max-w-md w-full text-center">
        {/* Animated Shopping Bag Loader */}
        <div className="mb-8 relative">
          <svg 
            viewBox="0 0 200 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-32 h-32 mx-auto"
          >
            {/* Shopping bag */}
            <rect 
              x="60" 
              y="70" 
              width="80" 
              height="90" 
              rx="4" 
              fill="#f3f3f3" 
              stroke="#4F7EFF" 
              strokeWidth="3"
              className="animate-pulse-bag"
            />
            <path 
              d="M70 70 C70 55, 80 45, 100 45 C120 45, 130 55, 130 70" 
              stroke="#4F7EFF" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
              className="animate-handle"
            />
            
            {/* Loading dots inside bag */}
            <circle cx="85" cy="110" r="4" fill="#4F7EFF" className="animate-bounce-dot-1"/>
            <circle cx="100" cy="110" r="4" fill="#5173ce" className="animate-bounce-dot-2"/>
            <circle cx="115" cy="110" r="4" fill="#4F7EFF" className="animate-bounce-dot-3"/>
          </svg>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-semibold text-black mb-2 animate-pulse">
          Loading...
        </h2>
        
        <p className="text-base text-gray-600 animate-pulse">
          Please wait while we prepare your experience
        </p>

        {/* Progress Bar */}
        <div className="mt-6 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-[#4F7EFF] to-[#5173ce] rounded-full animate-progress"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseBag {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.98);
          }
        }

        @keyframes handleSwing {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes bounceDot1 {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounceDot2 {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounceDot3 {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        .animate-pulse-bag {
          animation: pulseBag 2s ease-in-out infinite;
        }

        .animate-handle {
          animation: handleSwing 1.5s ease-in-out infinite;
        }

        .animate-bounce-dot-1 {
          animation: bounceDot1 1.4s ease-in-out infinite;
        }

        .animate-bounce-dot-2 {
          animation: bounceDot2 1.4s ease-in-out 0.2s infinite;
        }

        .animate-bounce-dot-3 {
          animation: bounceDot3 1.4s ease-in-out 0.4s infinite;
        }

        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}