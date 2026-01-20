import { Heart } from "lucide-react";
import RatingStars from "@/constants/ProductRating";
import Link from "next/link";

const ProductCard = ({ product }) => {
  return (
    <div className="group relative border border-(--border-default) overflow-hidden flex flex-col">

      {/* Top */}
      <div className="flex justify-between items-center px-4 pt-4">
        <Link href={`/products/${product.slug}`}>
          <span className="text-[10px] capitalize">{product.category}</span>
        </Link>
        <button className="border border-(--border-default) rounded-full p-2
                           hover:bg-(--btn-bg-hover) hover:text-(--btn-text-hover)">
          <Heart size={16} />
        </button>
      </div>

      {/* Image */}
      <div className="relative flex justify-center items-center p-3">
        <Link href={`/products/${product.slug}`}>
          <img
            src={product.thumbnail}
            alt={product.name}
            className="h-40 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </Link>
        {/* Hover Add to Cart (Desktop) */}
        <button
          className="absolute opacity-0 group-hover:opacity-100
                     transition-all bg-(--btn-bg-primary)
                     text-(--btn-text-primary)
                     rounded-full px-4 py-1"
        >
          Add to Cart
        </button>
      </div>

      {/* Bottom */}
      <div className="border-t border-(--border-default) px-4 py-5 flex flex-col gap-2">
        <Link href={`/products/${product.slug}`}>
          <span className="text-[10px] text-(--text-inverse) bg-(--bg-primary) border border-(--border-default) rounded-full px-3 py-1 w-fit">
            {product.tag}
          </span>

          <h3 className="font-semibold text-(--text-heading) hover:text-(--text-hover)">
            {product.name.substring(0, 35).concat('...')}
          </h3>

          <RatingStars rating={product.rating} />

          <h4 className="text-sm font-medium hover:text-(--text-hover)">
            Rs. {product.price.toLocaleString()}
          </h4>
        </Link>
        {/* Mobile Add to Cart */}
        <button
          className="mt-2 block lg:hidden bg-(--btn-bg-primary)
          text-(--btn-text-primary)
          rounded-full px-4 py-1"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;