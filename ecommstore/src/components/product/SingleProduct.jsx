"use client";
import { useState, useEffect } from "react";
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
  ChevronDown,
  User,
  Calendar,
} from "lucide-react";
import ProductRating from "@/components/ui/ProductRating";
import ProductCard from "@/components/product/ProductCard";
import { usePathname } from "next/navigation";
import useCartStore from "@/store/useCartStore";
import Loader from "../ui/Loader";
import { baseUrl } from "@/lib/utils";
import axios from "axios";
import { toast } from "react-toastify";
import RatingInput from "../ui/RatingInput";

// Product Page
const SingleProductPage = ({ products }) => {
  const slug = usePathname().split("/").pop();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const product = products.find((product) => product.slug === slug);
  const { addToCart, isLoading } = useCartStore();
  const THUMBNAILS_PER_VIEW = 3;
  const [thumbStart, setThumbStart] = useState(0);

  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Set default variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  // Fetch reviews when component mounts
  useEffect(() => {
    if (product?.id) {
      fetchProductReviews();
      checkCanReview();
    }
  }, [product?.id]);

  const fetchProductReviews = async () => {
    try {
      const { data } = await axios.get(
        `${baseUrl}/reviews/product/${product.id}`
      );
      if (data.success) {
        setReviews(data.data);
        setReviewStats(data.summary);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    }
  };

  const checkCanReview = async () => {
    try {
      const { data } = await axios.get(
        `${baseUrl}/reviews/can-review/${product.id}`,
        { withCredentials: true }
      );
      if (data.success) {
        setCanReview(data.data.canReview);
      }
    } catch (error) {
      console.error("Check review error:", error);
      setCanReview(false);
    }
  };
console.log(reviews)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);

    try {
      const { data } = await axios.post(
        `${baseUrl}/reviews`,
        {
          productId: product.id,
          rating: reviewFormData.rating,
          comment: reviewFormData.comment,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Review submitted successfully!");
        setShowReviewForm(false);
        setReviewFormData({ rating: 5, comment: "" });
        fetchProductReviews();
        checkCanReview();
      }
    } catch (error) {
      console.error("Submit review error:", error);
      toast.error(
        error.response?.data?.error || "Failed to submit review"
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    await addToCart({
      variantId: selectedVariant.id,
      quantity: quantity,
      product,
      variant: selectedVariant,
    });
  };

  const relatedProducts = products.filter(
    (p) => p?.category?.id === product?.category?.id && p.id !== product?.id
  );

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      const maxQty = selectedVariant?.availableQty || 0;
      if (quantity < maxQty) {
        setQuantity((prev) => prev + 1);
      }
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const thumbnails = product?.images || [];
  const canScrollLeft = thumbStart > 0;
  const canScrollRight = thumbStart + THUMBNAILS_PER_VIEW < thumbnails.length;

  const visibleThumbnails = thumbnails.slice(
    thumbStart,
    thumbStart + THUMBNAILS_PER_VIEW
  );

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? "fill-yellow-400 text-yellow-400"  : "text-gray-300"  
            }
          />
        ))}
      </div>
    );
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

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
                    selectedImage
                      ? selectedImage
                      : product?.thumbnail || "/placeholder.png"
                  }
                  alt={product?.name}
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
                        selectedImage === img.url
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
                  {product?.name}
                </h1>
                <p className="text-(--text-secondary) text-xs sm:text-sm">
                  Brand:{" "}
                  <span className="font-medium text-(--text-primary)">
                    {product?.brand || "Not Specified"}
                  </span>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 pb-4 border-b border-(--border-default)">
                <ProductRating
                  rating={product?.rating || 0}
                  showCount
                  reviewCount={product?.reviewCount || 0}
                  size="lg"
                />
              </div>

              {/* Variant Selection */}
              {product.variants && product.variants.length > 1 && (
                <div className="space-y-3 pb-4 border-b border-(--border-default)">
                  <label className="font-semibold text-(--text-heading) text-sm sm:text-base">
                    Select Variant:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setQuantity(1);
                        }}
                        className={`p-3 border-2 rounded-lg transition-all text-left ${
                          selectedVariant?.id === variant.id
                            ? "border-(--color-brand-primary) bg-(--bg-surface)"
                            : "border-(--border-default) hover:border-gray-400"
                        }`}
                      >
                        <div className="text-sm font-medium text-(--text-heading)">
                          {variant.attributes
                            ? Object.entries(variant.attributes)
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(", ")
                            : `Variant ${variant.sku}`}
                        </div>
                        <div className="text-sm font-bold text-(--color-brand-primary) mt-1">
                          Rs. {variant.price}
                        </div>
                        <div className="text-xs text-(--text-secondary) mt-1">
                          {variant.inStock
                            ? `${variant.availableQty} in stock`
                            : "Out of stock"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="text-3xl sm:text-4xl font-bold text-red-500">
                  Rs. {selectedVariant?.price || product?.variants?.[0]?.price || "0.00"}
                </span>
                {selectedVariant && (
                  <span className="text-sm text-(--text-secondary)">
                    SKU: {selectedVariant.sku}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {selectedVariant?.inStock ? (
                  <>
                    <Check size={20} className="text-green-500" />
                    <span className="text-green-500 font-medium text-sm sm:text-base">
                      In Stock ({selectedVariant.availableQty} available)
                    </span>
                  </>
                ) : (
                  <span className="text-red-500 font-medium text-sm sm:text-base">
                    Out of Stock
                  </span>
                )}
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
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} className="sm:w-4.5 sm:h-4.5" />
                    </button>
                    <span className="px-4 sm:px-6 font-semibold text-sm sm:text-base">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange("increase")}
                      className="p-2 sm:p-3 hover:bg-(--bg-surface) transition-colors"
                      disabled={quantity >= (selectedVariant?.availableQty || 0)}
                    >
                      <Plus size={16} className="sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>
                  <span className="text-sm text-(--text-secondary)">
                    Max: {selectedVariant?.availableQty || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    !selectedVariant?.inStock || isLoading || !product.isActive
                  }
                  className={`
    flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-full font-medium text-sm sm:text-base
    flex items-center justify-center gap-2
    transition-all duration-200
    ${
      !selectedVariant?.inStock || !product?.isActive || isLoading
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
                  <span className="text-[10px] sm:text-xs font-medium">
                    Free Delivery
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-2 sm:p-4 border border-(--border-default) rounded-lg">
                  <RotateCcw
                    size={20}
                    className="text-(--color-brand-primary) mb-1 sm:mb-2 sm:w-6 sm:h-6"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">
                    30 Days Return
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-2 sm:p-4 border border-(--border-default) rounded-lg">
                  <Shield
                    size={20}
                    className="text-(--color-brand-primary) mb-1 sm:mb-2 sm:w-6 sm:h-6"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">
                    2 Year Warranty
                  </span>
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
              Reviews ({reviewStats?.total || 0})
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
                  {product?.description}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-(--text-heading)">
                  Technical Specifications
                </h3>
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-(--bg-surface) rounded-lg text-sm sm:text-base">
                    <span className="font-medium text-(--text-heading)">
                      Brand
                    </span>
                    <span className="text-(--text-secondary)">
                      {product?.brand || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-(--bg-surface) rounded-lg text-sm sm:text-base">
                    <span className="font-medium text-(--text-heading)">
                      Category
                    </span>
                    <span className="text-(--text-secondary)">
                      {product?.categoryName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-(--bg-surface) rounded-lg text-sm sm:text-base">
                    <span className="font-medium text-(--text-heading)">
                      Available Variants
                    </span>
                    <span className="text-(--text-secondary)">
                      {product?.variantsCount}
                    </span>
                  </div>
                  {product?.tag && product.tag.length > 0 && (
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-(--bg-surface) rounded-lg text-sm sm:text-base">
                      <span className="font-medium text-(--text-heading)">
                        Tags
                      </span>
                      <span className="text-(--text-secondary)">
                        {product.tag.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-(--text-heading)">
                    Customer Reviews
                  </h3>
                  {canReview && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-4 py-2 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-sm sm:text-base"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {/* Review Stats */}
                {reviewStats && reviewStats.total > 0 && (
                  <div className="mb-8 p-6 bg-(--bg-surface) rounded-lg">
                    <div className="flex items-start gap-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-(--text-heading)">
                          {reviewStats.average}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          {getRatingStars(Math.round(reviewStats.average))}
                        </div>
                        <div className="text-sm text-(--text-secondary) mt-1">
                          Based on {reviewStats.total} reviews
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviewStats.distribution[rating] || 0;
                          const percentage =
                            reviewStats.total > 0
                              ? (count / reviewStats.total) * 100
                              : 0;
                          return (
                            <div key={rating} className="flex items-center gap-2">
                              <div className="flex items-center gap-1 w-16">
                                <span className="text-sm font-medium">
                                  {rating}
                                </span>
                                <Star
                                  size={12}
                                  className="fill-yellow-400 text-yellow-400"
                                />
                              </div>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-(--text-secondary) w-12 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Form */}
{showReviewForm && (
  <form
    onSubmit={handleSubmitReview}
    className="mb-8 p-6 bg-(--bg-surface) rounded-lg border-2 border-(--color-brand-primary)"
  >
    <h4 className="font-semibold text-lg mb-4">
      Write Your Review
    </h4>
    <div className="space-y-4">
      <div>
        <RatingInput
          value={reviewFormData.rating}
          onChange={(rating) =>
            setReviewFormData({
              ...reviewFormData,
              rating: rating,
            })
          }
          label="Your Rating"
          helperText="Click on stars to rate. Click left half for half stars."
          size="lg"
        />
      </div>
      
      {/* Debug: Show current rating */}
      <div className="text-xs text-gray-500">
        Selected: {reviewFormData.rating} stars
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Comment (Optional)
        </label>
        <textarea
          value={reviewFormData.comment}
          onChange={(e) =>
            setReviewFormData({
              ...reviewFormData,
              comment: e.target.value,
            })
          }
          className="w-full px-4 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) resize-none"
          rows={4}
          placeholder="Share your experience with this product..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmittingReview || reviewFormData.rating === 0}
          className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-2 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium disabled:opacity-50"
        >
          {isSubmittingReview ? "Submitting..." : "Submit Review"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowReviewForm(false);
            setReviewFormData({ rating: 0, comment: "" }); // Reset to 0
          }}
          className="border-2 border-(--border-default) px-6 py-2 rounded-full hover:bg-(--bg-surface) transition-all font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </form>
)}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Star
                      size={40}
                      className="text-gray-300 mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12"
                    />
                    <p className="text-(--text-secondary) text-sm sm:text-base">
                      No reviews yet. Be the first to review this product!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 border border-(--border-default) rounded-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-(--bg-surface) rounded-full flex items-center justify-center shrink-0">
                            <User size={20} className="text-(--text-secondary)" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-medium text-(--text-heading)">
                                  {review.user?.name || "Anonymous"}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {getRatingStars(review.rating)}
                                  <span className="text-xs text-(--text-secondary)">
                                    •
                                  </span>
                                  <span className="text-xs text-(--text-secondary)">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-(--text-secondary) text-sm leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
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
              {relatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SingleProductPage;