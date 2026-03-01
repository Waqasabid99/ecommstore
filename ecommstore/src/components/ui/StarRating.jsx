// components/ui/StarRating.tsx
"use client";

import { useState, useRef, useCallback } from "react";

const sizeMap = {
  sm: 20,
  md: 28,
  lg: 36,
};

export default function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showValue = false,
  className = "",
  fillColor = "#FFD700",
  emptyColor = "",
  strokeColor = "#FFD700",
  gap = 6,
  tooltips = [],
}) {
  const [hoverRating, setHoverRating] = useState(null);
  const [hoverHalf, setHoverHalf] = useState(false);
  const containerRef = useRef(null);

  const starSize = typeof size === "number" ? size : sizeMap[size];
  const displayRating = hoverRating ?? rating;
  
  const actualDisplay = hoverRating !== null && hoverHalf && interactive
    ? hoverRating - 0.5
    : displayRating;

  const handleMouseMove = useCallback((event, index) => {
    if (!interactive || !containerRef.current) return;

    const star = event.currentTarget;
    const rect = star.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;

    setHoverRating(index + 1);
    setHoverHalf(isHalf);
  }, [interactive]);

  const handleClick = useCallback((index, isHalf) => {
    if (!interactive) return;
    
    const newRating = isHalf ? index + 0.5 : index + 1;
    const roundedRating = Math.round(newRating * 2) / 2;
    onRatingChange?.(roundedRating);
  }, [interactive, onRatingChange]);

  const handleMouseLeave = useCallback(() => {
    setHoverRating(null);
    setHoverHalf(false);
  }, []);

  const renderStar = (index) => {
    const starValue = index + 1;
    const isHalfFilled = actualDisplay > index && actualDisplay < starValue;
    const isFullFilled = actualDisplay >= starValue;
    const isHovered = hoverRating === starValue;
    
    const fillPercentage = isFullFilled ? 100 : isHalfFilled ? 50 : 0;
    const clipId = `star-clip-${index}-${Math.random().toString(36).substr(2, 9)}`;
    const gradientId = `star-gradient-${index}-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div
        key={index}
        className={`relative inline-flex transition-all duration-200 ${
          interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
        } ${isHovered ? 'scale-110' : ''}`}
        style={{ 
          marginRight: index < maxStars - 1 ? gap : 0,
          width: starSize,
          height: starSize,
        }}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const isHalf = x < rect.width / 2;
          handleClick(index, isHalf);
        }}
        title={tooltips[index] || `${starValue} star${starValue !== 1 ? 's' : ''}`}
      >
        <svg
          width={starSize}
          height={starSize}
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-200"
          style={{
            filter: isHovered && interactive ? 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))' : 'none'
          }}
        >
          <defs>
            {/* Gradient for filled stars */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: fillColor, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: fillColor, stopOpacity: 0.85 }} />
            </linearGradient>
            
            {/* Clip path for partial fill */}
            <clipPath id={clipId}>
              <rect
                x="0"
                y="0"
                width={`${fillPercentage}%`}
                height="100%"
              />
            </clipPath>
          </defs>
          
          {/* Star path definition */}
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={emptyColor}
            stroke={strokeColor}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          
          {/* Filled portion */}
          <g clipPath={`url(#${clipId})`}>
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill={`#FFD700`}
              stroke={fillColor}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`inline-flex items-center ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="flex items-center" 
        role={interactive ? "radiogroup" : "img"} 
        aria-label={`Rating: ${actualDisplay} out of ${maxStars}`}
      >
        {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      </div>
      
      {showValue && (
        <span className="text-sm font-semibold text-yellow-400 ml-3 tabular-nums">
          {actualDisplay}
        </span>
      )}
    </div>
  );
}