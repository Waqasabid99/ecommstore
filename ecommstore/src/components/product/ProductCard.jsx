"use client";
import { Heart } from "lucide-react";
import RatingStars from "@/components/ui/ProductRating";
import Link from "next/link";
import useCartStore from "@/store/useCartStore";
import Loader from "../ui/Loader";
import { useState } from "react";
import Image from "next/image";

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const handleAddToCart = async () => {
    if (isLoading) return;

    // Get the first variant (required in variant-first approach)
    const firstVariant = product.variants?.[0];

    if (!firstVariant) {
      console.error("No variant available for product");
      return;
    }

    try {
      setIsLoading(true);
      await addToCart({
        variantId: firstVariant.id,
        quantity: 1,
        product: product,
        variant: firstVariant,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get thumbnail from new data structure
  const mainImage =
    product.thumbnail || product.images?.[0] || "/placeholder.png";

  // Get price from first variant
  const displayPrice = product.variants?.[0]?.price || "0";

  return (
    <div className="group relative border border-(--border-default) overflow-hidden flex flex-col">
      {/* Top */}
      <div className="flex justify-between items-center px-4 pt-4">
        <Link href={`/shop/products/${product.slug}`}>
          <span className="text-[10px] capitalize">
            {product?.category.name || product.categoryName}
          </span>
        </Link>

        <button
          className="border border-(--border-default) rounded-full p-2
                     hover:bg-(--btn-bg-hover) hover:text-(--btn-text-hover)"
        >
          <Heart size={16} />
        </button>
      </div>

      {/* Image */}
      <div className="relative flex justify-center items-center p-3">
        <Link href={`/shop/products/${product.slug}`}>
          <Image
            src={mainImage}
            alt={product.name}
            width={280}
            height={280}
            className="h-40 w-auto object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Hover Add to Cart (Desktop) */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="absolute opacity-0 group-hover:opacity-100
                     transition-all bg-(--btn-bg-primary)
                     text-(--btn-text-primary)
                     rounded-full px-4 py-1 disabled:opacity-50"
        >
          {isLoading ? <Loader text={"Adding..."} size="lg" /> : "Add to Cart"}
        </button>
      </div>

      {/* Bottom */}
      <div className="border-t border-(--border-default) px-4 py-5 flex flex-col gap-2">
        <Link href={`/shop/products/${product.slug}`}>
          {/* Category badge */}
          <span
            className="text-[10px] text-(--text-inverse)
                           bg-(--bg-primary)
                           border border-(--border-default)
                           rounded-full px-3 py-1 w-fit"
          >
            {product.category?.name || product.categoryName}
          </span>

          <h3 className="font-semibold text-(--text-heading) hover:text-(--text-hover)">
            {product.name.length > 35
              ? product.name.substring(0, 35) + "..."
              : product.name}
          </h3>

          {/* Rating (temporary static or optional) */}
          <RatingStars rating={4} />

          <h4 className="text-sm font-medium hover:text-(--text-hover)">
            Rs. {Number(displayPrice).toLocaleString()}
          </h4>
        </Link>

        {/* Mobile Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="mt-2 block lg:hidden bg-(--btn-bg-primary)
                     text-(--btn-text-primary)
                     rounded-full px-4 py-1 disabled:opacity-50"
        >
          {isLoading ? <Loader text={"Adding..."} size="sm" /> : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
