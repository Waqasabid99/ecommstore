// components/ui/RatingInput.tsx
"use client";

import { useState } from "react";
import StarRating from "./StarRating";

const ratingLabels = {
  0.5: "Poor",
  1: "Poor+",
  1.5: "Fair",
  2: "Fair+",
  2.5: "Average",
  3: "Average+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Perfect",
};

export default function RatingInput({
  value,
  onChange,
  label = "Your Rating",
  helperText,
  error,
  size = "lg",
  showLabels = true,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`rating-input-wrapper ${isFocused ? 'is-focused' : ''}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {label}
          <span className="text-red-500 ml-1">*</span>
        </label>
      )}
      
      <div 
        className={`
          inline-flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200
          ${error 
            ? "border-red-300 bg-red-50" 
            : isFocused 
              ? "border-blue-400 bg-blue-50" 
              : "border-gray-200 bg-gray-50 hover:border-gray-300"
          }
        `}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <StarRating
          rating={value}
          onRatingChange={onChange}
          interactive
          size={size}
          showValue={true}
          fillColor="text-yellow-400"
          emptyColor="text-gray-300"
          gap={8}
        />
        
        {showLabels && value > 0 && (
          <div className="mt-2 text-sm font-medium text-gray-600 animate-fade-in">
            {ratingLabels[value] || "Select a rating"}
          </div>
        )}
        
        {helperText && !error && (
          <p className="mt-2 text-xs text-gray-500">
            {helperText}
          </p>
        )}
        
        {error && (
          <p className="mt-2 text-xs text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
      
      <div className="sr-only" role="status" aria-live="polite">
        Current rating: {value} out of 5 stars
      </div>
    </div>
  );
}