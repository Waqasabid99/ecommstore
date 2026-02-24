import Image from "next/image";
import ProductCard from "../product/ProductCard";
import ProductCardSkeleton from "../product/ProductCardSkeleton";

const Products = ({ products, isEmpty }) => {
  // Show loading skeletons if products is null/undefined
  const loading = !products;

  return (
    <div className="px-4 sm:px-6 md:px-10 py-8">
      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && isEmpty && (
        <div className="flex flex-col justify-center items-center min-h-100 py-10">
          <Image 
            loading="lazy" 
            src="/empty.png" 
            alt="No products found" 
            width={200} 
            height={200} 
          />
          <h2 className="text-2xl font-semibold text-(--text-heading) mt-4">
            This category has no products yet
          </h2>
          <p className="text-(--text-secondary) mt-2">
            Try selecting a different category
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !isEmpty && products && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;