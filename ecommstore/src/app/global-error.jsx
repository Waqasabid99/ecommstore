'use client';
import { Home, RotateCcw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-8 pb-4 bg-[#F8F8F8]">
          <div className="max-w-2xl w-full text-center">
            {/* Illustration */}
            <div className="mb-8 animate-shake">
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
                  strokeDasharray="10,5"
                />
                <path 
                  d="M140 100 C140 80, 160 60, 200 60 C240 60, 260 80, 260 100" 
                  stroke="#DC2626" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeDasharray="8,8"
                />
                
                {/* Fatal X symbol */}
                <circle cx="200" cy="180" r="50" fill="#DC2626" opacity="0.15"/>
                <line 
                  x1="175" 
                  y1="155" 
                  x2="225" 
                  y2="205" 
                  stroke="#DC2626" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                />
                <line 
                  x1="225" 
                  y1="155" 
                  x2="175" 
                  y2="205" 
                  stroke="#DC2626" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                />
                
                {/* Floating error elements */}
                <circle cx="80" cy="120" r="8" fill="#DC2626" opacity="0.4"/>
                <circle cx="320" cy="160" r="6" fill="#DC2626" opacity="0.4"/>
                <circle cx="90" cy="220" r="5" fill="#DC2626" opacity="0.3"/>
                <circle cx="310" cy="240" r="7" fill="#DC2626" opacity="0.3"/>
                
                {/* Multiple crack lines */}
                <path 
                  d="M180 120 L190 140 L185 160 L195 180" 
                  stroke="#d1d5db" 
                  strokeWidth="2.5" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path 
                  d="M220 130 L210 150 L215 170 L205 190" 
                  stroke="#d1d5db" 
                  strokeWidth="2.5" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Error Message - No code, more dramatic */}
            <div className="mb-4 animate-fade-in-up">
              <div className="inline-block px-4 py-2 bg-red-100 border border-red-300 rounded-full mb-4">
                <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">Critical Error</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-bold text-black mb-4 animate-fade-in-up-delay-1">
              We've Hit a Snag
            </h1>

            {/* Message */}
            <p className="text-lg text-gray-600 leading-relaxed mb-6 animate-fade-in-up-delay-2">
              Something critical went wrong and we couldn't recover. This shouldn't happen, 
              and our team has been automatically notified. Please try refreshing the page.
            </p>

            {/* Buttons */}
            <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up-delay-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded text-base font-medium bg-black text-white transition-all duration-300 hover:bg-[#DC2626]"
              >
                <RotateCcw className="w-5 h-5" />
                Refresh Page
              </button>

              <a 
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-white text-[#4F7EFF] rounded border border-[#d1d5db] transition-all duration-300 hover:bg-black hover:border-black hover:text-white"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </a>
            </div>

            {/* Help Text */}
            <div className="mt-8 animate-fade-in-up-delay-4">
              <p className="text-sm text-gray-500">
                If the problem persists, please contact our support team.
              </p>
            </div>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mt-8 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-left animate-fade-in-up-delay-5">
                <p className="text-sm font-bold text-red-900 mb-2">🚨 Fatal Error (Development Only):</p>
                <p className="text-xs text-red-700 font-mono break-all mb-2">{error.message}</p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                      View Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 bg-red-100 p-2 rounded">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
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

          @keyframes shake {
            0%, 100% {
              transform: translateX(0);
            }
            10%, 30%, 50%, 70%, 90% {
              transform: translateX(-5px);
            }
            20%, 40%, 60%, 80% {
              transform: translateX(5px);
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

          .animate-fade-in-up-delay-5 {
            animation: fadeInUp 0.6s ease-out 0.5s backwards;
          }

          .animate-shake {
            animation: shake 0.5s ease-in-out;
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
      </body>
    </html>
  );
}