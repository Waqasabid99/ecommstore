
const ProductRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showCount = false,
  reviewCount = 0,
  className = ''
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  // Generate array of stars
  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starValue = index + 1;
    const fillPercentage = Math.max(0, Math.min(100, (rating - index) * 100));
    
    return {
      id: starValue,
      filled: fillPercentage
    };
  });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stars Container */}
      <div className="flex items-center gap-1">
        {stars.map((star) => (
          <div key={star.id} className="relative">
            {/* Empty Star (Background) */}
            <svg
              className={sizeClasses[size]}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              style={{ color: 'var(--color-gray-300)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>

            {/* Filled Star (Overlay) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${star.filled}%` }}
            >
              <svg
                className={sizeClasses[size]}
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#FFB800' }}
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Rating Number */}
      <span
        className={`font-medium ${textSizeClasses[size]}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {rating.toFixed(1)}
      </span>

      {/* Review Count (Optional) */}
      {showCount && (
        <span
          className={`${textSizeClasses[size]}`}
          style={{ color: 'var(--text-secondary)' }}
        >
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default ProductRating;