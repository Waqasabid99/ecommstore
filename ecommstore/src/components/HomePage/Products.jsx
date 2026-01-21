import Image from "next/image";
import ProductCard from "../product/ProductCard";

const Products = ({ products, isEmpty }) => {
  return (
    <>
    {isEmpty && (
      <div className="flex flex-col justify-center items-center min-h-fit py-5 font-semibold">
        <Image src="/empty.png" alt="empty" width={200} height={200} />
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