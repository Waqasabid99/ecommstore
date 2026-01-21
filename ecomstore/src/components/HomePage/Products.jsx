import ProductCard from "../ProductCard";
import ProductCardSkeleton from "../ProductCardSkeleton";
import axios from "axios";
import { useEffect, useState } from "react";

const Products = ({ products }) => {
  console.log("Products:", products);
  // const [loading, setLoading] = useState(true);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* {products.map(product => (
            <ProductCard key={product.id} product={product} />
      ))} */}
    </div>
  );
};

export default Products;