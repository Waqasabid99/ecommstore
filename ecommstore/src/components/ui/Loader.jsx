import React from "react";

const Loader = ({
  text = "Loading…",
  size = "md", // sm | md | lg
  showText = true,
}) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <span
      className="flex items-center justify-center gap-2"
      role="status"
      aria-live="polite"
    >
      <svg
        className={`animate-spin ${sizeMap[size]} shrink-0`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>

      {showText && (
        <span className="text-sm sm:text-base whitespace-nowrap">
          {text}
        </span>
      )}
    </span>
  );
};

export default Loader;