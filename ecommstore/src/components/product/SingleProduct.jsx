"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  Star,
  Check,
  ArrowLeftCircle,
  ArrowRightCircle,
} from "lucide-react";
import ProductRating from "@/components/ui/ProductRating";
import ProductCard from "@/components/product/ProductCard";
import { usePathname } from "next/navigation";
import useCartStore from "@/store/useCartStore";
import Loader from "../ui/Loader";

// Product Page
const SingleProductPage = ({ products }) => {
  console.log(products);
  const slug = usePathname().split("/").pop();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const product = products.find((product) => product.slug === slug);
  const { addToCart, isLoading } = useCartStore();
  const THUMBNAILS_PER_VIEW = 3;
  const [thumbStart, setThumbStart] = useState(0);
  console.log(product)
  const handleAddToCart = async () => {
    await addToCart({
      variantId: product.variants?.[0]?.id,
      quantity: quantity,
      product,
      variant: product.variants?.[0],
    });
  };

  const relatedProducts = products.filter(
    (product) => product?.category?.id === product?.category?.id,
  );

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const thumbnails = product?.images || [];
  const canScrollLeft = thumbStart > 0;
  const canScrollRight = thumbStart + THUMBNAILS_PER_VIEW < thumbnails.length;

  const visibleThumbnails = thumbnails.slice(
    thumbStart,
    thumbStart + THUMBNAILS_PER_VIEW,
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Product Section */}
      <section className="mx-2 sm:mx-4 mb-4 sm:mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 bg-white border border-(--border-default) rounded-xl p-4 sm:p-6 md:p-8">
            {/* Left - Images */}
            <div className="space-y-3 sm:space-y-4">
              {/* Main Image */}
              <div className="border border-(--border-default) rounded-xl overflow-hidden bg-(--bg-surface) aspect-square flex items-center justify-center relative">
                <Image
                  src={
                    `${
                      selectedImage ? selectedImage : product.thumbnail
                    }` || "/placeholder.png"
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                  priority
                />
              </div>

              {/* Thumbnail Wrapper */}
              <div className="flex justify-center items-center gap-1 sm:gap-3">
                {/* Left Arrow */}
                <button
                  onClick={() => setThumbStart((prev) => prev - 1)}
                  disabled={!canScrollLeft}
                  className={`transition-all shrink-0 ${
                    canScrollLeft
                      ? "hover:text-gray-700"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <ArrowLeftCircle size={24} className="sm:w-7.5 sm:h-7.5" />
                </button>

                {/* Thumbnails */}
                <div className="flex gap-2 sm:gap-3 overflow-hidden flex-1">
                  {visibleThumbnails.map((img) => (
                    <button
                      key={img}
                      onClick={() => setSelectedImage(img)}
                      className={`border-2 rounded-lg overflow-hidden aspect-square w-16 sm:w-20 md:w-24 transition-all shrink-0 relative ${
                        selectedImage === img
                          ? "border-(--color-brand-primary)"
                          : "border-(--border-default) hover:border-gray-500"
                      }`}
                    >
                      <Image
                        src={img}
                        alt="Product thumbnail"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => setThumbStart((prev) => prev + 1)}
                  disabled={!canScrollRight}
                  className={`transition-all shrink-0 ${
                    canScrollRight
                      ? "hover:text-gray-700"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <ArrowRightCircle size={24} className="sm:w-7.5 sm:h-7.5" />
                </button>
              </div>
            </div>

            {/* Right - Product Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Badge and Title */}
              <div>
                <span className="inline-block text-[10px] text-(--text-inverse) bg-(--bg-primary) border border-(--border-default) rounded-full px-3 py-1 mb-3">
                  {product?.category?.name}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-(--text-heading) mb-2">
                  {product.name}
                </h1>
                <p className="text-(--text-secondary) text-xs sm:text-sm">
                  Brand:{" "}
                  <span className="font-medium text-(--text-primary)">
                    {product.brand || "Not Specified"}
                  </span>{" "}
                  | SKU:{" "}
                  <span className="font-medium text-(--text-primary)">
                    {product.variants?.[0]?.sku}
                  </span>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 pb-4 border-b border-(--border-default)">
                <ProductRating
                  rating={product.rating}
                  showCount
                  reviewCount={product.reviewCount}
                  size="lg"
                />
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="text-3xl sm:text-4xl font-bold text-red-500">
                  Rs. {product?.variants?.[0]?.price || "0.00"}
                </span>
                {product.discount && (
                  <>
                    <span className="text-lg sm:text-xl text-(--text-secondary) line-through">
                      Rs. {product.originalPrice}
                    </span>
                    <span className="bg-red-500 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.isActive && product.variants?.[0]?.availableQty > 0 ? (
                  <>
                    <Check size={20} className="text-green-500" />
                    <span className="text-green-500 font-medium text-sm sm:text-base">In Stock</span>
                  </>
                ) : (
                  <span className="text-red-500 font-medium text-sm sm:text-base">Out of Stock</span>
                )}
              </div>

              {/* Key Features */}
              <div className="space-y-2 pb-4 border-b border-(--border-default)">
                <h3 className="font-semibold text-(--text-heading) text-sm sm:text-base">
                  Key Features:
                </h3>
                {/* <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-(--text-secondary)">
                      <Check size={16} className="text-(--color-brand-primary) mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul> */}
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="font-semibold text-(--text-heading) text-sm sm:text-base">
                  Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-(--border-default) rounded-lg">
                    <button
                      onClick={() => handleQuantityChange("decrease")}
                      className="p-2 sm:p-3 hover:bg-(--bg-surface) transition-colors"
                    >
                      <Minus size={16} className="sm:w-4.5 sm:h-4.5" />
                    </button>
                    <span className="px-4 sm:px-6 font-semibold text-sm sm:text-base">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange("increase")}
                      className="p-2 sm:p-3 hover:bg-(--bg-surface) transition-colors"
                    >
                      <Plus size={16} className="sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={quantity === 0 || isLoading || !product.isActive}
                  className={`
    flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-full font-medium text-sm sm:text-base
    flex items-center justify-center gap-2
    transition-all duration-200
    ${
      quantity === 0 || !product.isActive || isLoading
        ? "cursor-not-allowed bg-(--btn-bg-primary) bg-opacity-50 text-(--btn-text-primary) opacity-70"
        : "bg-(--btn-bg-primary) text-(--btn-text-primary) hover:bg-(--btn-bg-hover)"
    }
  `}
                >
                  {isLoading ? (
                    <>
                      <Loader text={"Adding..."} />
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button className="border-2 border-(--border-inverse) text-(--text-primary) px-4 sm:px-6 py-3 sm:py-4 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Heart size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Wishlist</span>
                </button>
                <button className="border-2 border-(--border-default) text-(--text-primary) px-4 sm:px-6 py-3 sm:py-4 rounded-full hover:bg-(--bg-surface) transition-all flex items-center justify-center">
                  <Share2 size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4">
                <div className="flex flex-col items-center text-center p-2 sm:p-4 border border-(--border-default) rounded-lg">
                  <Truck
                    size={20}
                    className="text-(--color-brand-primary) mb-1 sm:mb-2 sm:w-6 sm:h-6"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 sm:p-4 border border-(--border-default) rounded-lg">
                  <RotateCcw
                    size={20}
                    className="text-(--color-brand-primary) mb-1 sm:mb-2 sm:w-6 sm:h-6"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">30 Days Return</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 sm:p-4 border border-(--border-default) rounded-lg">
                  <Shield
                    size={20}
                    className="text-(--color-brand-primary) mb-1 sm:mb-2 sm:w-6 sm:h-6"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">2 Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="mx-2 sm:mx-4 mb-4 sm:mb-6">
        <div className="max-w-7xl mx-auto bg-white border border-(--border-default) rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-(--border-default) overflow-x-auto">
            <button
              onClick={() => setActiveTab("description")}
              className={`flex-1 min-w-fit px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                activeTab === "description"
                  ? "text-(--color-brand-primary) border-b-2 border-(--color-brand-primary)"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("specifications")}
              className={`flex-1 min-w-fit px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                activeTab === "specifications"
                  ? "text-(--color-brand-primary) border-b-2 border-(--color-brand-primary)"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 min-w-fit px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                activeTab === "reviews"
                  ? "text-(--color-brand-primary) border-b-2 border-(--color-brand-primary)"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              Reviews ({product.reviewCount})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-(--text-heading)">
                  Product Description
                </h3>
                <p className="text-(--text-secondary) leading-relaxed mb-4 text-sm sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-(--text-heading)">
                  Technical Specifications
                </h3>
                {/* <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <div key={index} className="flex justify-between items-center p-3 sm:p-4 bg-(--bg-surface) rounded-lg text-sm sm:text-base">
                      <span className="font-medium text-(--text-heading)">{key}</span>
                      <span className="text-(--text-secondary)">{value}</span>
                    </div>
                  ))}
                </div> */}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-(--text-heading)">
                  Customer Reviews
                </h3>
                <div className="text-center py-8 sm:py-12">
                  <Star size={40} className="text-gray-300 mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12" />
                  <p className="text-(--text-secondary) text-sm sm:text-base">
                    No reviews yet. Be the first to review this product!
                  </p>
                  <button className="mt-4 bg-(--btn-bg-primary) text-(--btn-text-primary) px-4 sm:px-6 py-2 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-sm sm:text-base">
                    Write a Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="mx-2 sm:mx-4 border border-(--border-default) rounded-xl bg-white py-6 sm:py-8 md:py-12 mb-4 sm:mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-(--text-heading)">
                Related Products
              </h2>
              <p className="text-(--text-secondary) mt-1 text-xs sm:text-sm md:text-base">
                You might also like these items
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SingleProductPage;