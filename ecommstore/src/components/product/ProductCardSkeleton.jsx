const ProductCardSkeleton = () => {
  return (
    <div className="border border-(--border-default) overflow-hidden flex flex-col animate-pulse">

      {/* Top */}
      <div className="flex justify-between items-center px-4 pt-4">
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>

      {/* Image */}
      <div className="flex justify-center items-center p-3">
        <div className="h-40 w-full bg-gray-300 rounded"></div>
      </div>

      {/* Bottom */}
      <div className="border-t border-(--border-default) px-4 py-5 flex flex-col gap-3">
        <div className="h-4 w-20 bg-gray-300 rounded"></div>
        <div className="h-4 w-full bg-gray-300 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;