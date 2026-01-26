import Image from "next/image";
import ProductCard from "../product/ProductCard";
import ProductCardSkeleton from "../product/ProductCardSkeleton";

const Products = ({ products, isEmpty }) => {
  const loading = !products && !isEmpty;
  return (
    <>
    {loading && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )}
    {isEmpty && (
      <div className="flex flex-col justify-center items-center min-h-fit py-5 font-semibold">
        <Image loading="lazy" src="/empty.png" alt="empty" width={200} height={200} />
        <h2 className="text-2xl font-semibold">This category has no products yet</h2>
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
    </>
  );
};

export default Products;