'use client';
import { useState } from 'react';
import { Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, Share2, Star, Check } from 'lucide-react';
import ProductRating from '@/constants/ProductRating';
import ProductCard from '@/components/ProductCard';
import { usePathname } from 'next/navigation';
import { products } from '@/constants/utils';

// Product Page
const SingleProductPage = () => {
  const slug = usePathname().split('/').pop();
  console.log(slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const product = products.find(product => product.slug === slug);


  // const product = {
  //   id: 1,
  //   name: "Premium Wireless Headphones Pro",
  //   category: "audio",
  //   price: 15999,
  //   originalPrice: 24999,
  //   discount: 36,
  //   rating: 4.5,
  //   reviewCount: 328,
  //   inStock: true,
  //   sku: "WH-PRO-2024",
  //   brand: "TechSound",
  //   tag: "BESTSELLER",
  //   images: [
  //     "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
  //     "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
  //     "https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop",
  //     "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=600&fit=crop"
  //   ],
  //   features: [
  //     "Active Noise Cancellation",
  //     "40-hour battery life",
  //     "Premium sound quality",
  //     "Bluetooth 5.3 connectivity",
  //     "Foldable design",
  //     "Built-in microphone"
  //   ],
  //   specifications: {
  //     "Driver Size": "40mm",
  //     "Frequency Response": "20Hz - 20kHz",
  //     "Impedance": "32 Ohm",
  //     "Battery Life": "40 hours",
  //     "Charging Time": "2 hours",
  //     "Bluetooth Version": "5.3",
  //     "Weight": "250g"
  //   }
  // };

  const relatedProducts = products.filter(product => product.category === product.category);

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      
      {/* Product Section */}
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
            
            {/* Left - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="border border-(--border-default) rounded-xl overflow-hidden bg-(--bg-surface) aspect-square flex items-center justify-center">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden aspect-square transition-all ${
                      selectedImage === index
                        ? 'border-(--color-brand-primary)'
                        : 'border-(--border-default) hover:border-gray-500'
                    }`}
                  >
                    <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Product Details */}
            <div className="space-y-6">
              {/* Badge and Title */}
              <div>
                <span className="inline-block text-[10px] text-(--text-inverse) bg-(--bg-primary) border border-(--border-default) rounded-full px-3 py-1 mb-3">
                  {product.tag}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-(--text-heading) mb-2">
                  {product.name}
                </h1>
                <p className="text-(--text-secondary) text-sm">
                  Brand: <span className="font-medium text-(--text-primary)">{product.brand}</span> | 
                  SKU: <span className="font-medium text-(--text-primary)">{product.sku}</span>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 pb-4 border-b border-(--border-default)">
                <ProductRating rating={product.rating} showCount reviewCount={product.reviewCount} size="lg" />
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-red-500">
                  Rs. {product.price.toLocaleString()}
                </span>
                <span className="text-xl text-(--text-secondary) line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
                <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {product.discount}% OFF
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <Check size={20} className="text-green-500" />
                    <span className="text-green-500 font-medium">In Stock</span>
                  </>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </div>

              {/* Key Features */}
              <div className="space-y-2 pb-4 border-b border-(--border-default)">
                <h3 className="font-semibold text-(--text-heading)">Key Features:</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-(--text-secondary)">
                      <Check size={16} className="text-(--color-brand-primary) mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="font-semibold text-(--text-heading)">Quantity:</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-(--border-default) rounded-lg">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-3 hover:bg-(--bg-surface) transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="px-6 font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-3 hover:bg-(--bg-surface) transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-4 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="border-2 border-(--border-inverse) text-(--text-primary) px-6 py-4 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium flex items-center justify-center gap-2">
                  <Heart size={20} />
                  Wishlist
                </button>
                <button className="border-2 border-(--border-default) text-(--text-primary) px-6 py-4 rounded-full hover:bg-(--bg-surface) transition-all flex items-center justify-center">
                  <Share2 size={20} />
                </button>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="flex flex-col items-center text-center p-4 border border-(--border-default) rounded-lg">
                  <Truck size={24} className="text-(--color-brand-primary) mb-2" />
                  <span className="text-xs font-medium">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 border border-(--border-default) rounded-lg">
                  <RotateCcw size={24} className="text-(--color-brand-primary) mb-2" />
                  <span className="text-xs font-medium">30 Days Return</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 border border-(--border-default) rounded-lg">
                  <Shield size={24} className="text-(--color-brand-primary) mb-2" />
                  <span className="text-xs font-medium">2 Year Warranty</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto bg-white border border-(--border-default) rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-(--border-default)">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'description'
                  ? 'text-(--color-brand-primary) border-b-2 border-(--color-brand-primary)'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'specifications'
                  ? 'text-(--color-brand-primary) border-b-2 border-(--color-brand-primary)'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'text-(--color-brand-primary) border-b-2 border-(--color-brand-primary)'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              Reviews ({product.reviewCount})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold mb-4 text-(--text-heading)">Product Description</h3>
                <p className="text-(--text-secondary) leading-relaxed mb-4">
                  Experience premium audio quality with the {product.name}. These professional-grade headphones deliver exceptional sound clarity, deep bass, and crystal-clear highs for an immersive listening experience.
                </p>
                <p className="text-(--text-secondary) leading-relaxed mb-4">
                  Featuring advanced Active Noise Cancellation technology, you can enjoy your music without distractions. The comfortable over-ear design with memory foam cushions ensures all-day comfort, making them perfect for long listening sessions.
                </p>
                <p className="text-(--text-secondary) leading-relaxed">
                  With up to 40 hours of battery life on a single charge and quick charge capability, these headphones are designed for your lifestyle. The foldable design makes them easy to carry, while premium materials ensure durability.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-(--text-heading)">Technical Specifications</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-(--bg-surface) rounded-lg">
                      <span className="font-medium text-(--text-heading)">{key}</span>
                      <span className="text-(--text-secondary)">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-(--text-heading)">Customer Reviews</h3>
                <div className="text-center py-12">
                  <Star size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-(--text-secondary)">No reviews yet. Be the first to review this product!</p>
                  <button className="mt-4 bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-2 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium">
                    Write a Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="mx-4 border border-(--border-default) rounded-xl bg-white py-8 md:py-12 mb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-(--text-heading)">Related Products</h2>
              <p className="text-(--text-secondary) mt-1">You might also like these items</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default SingleProductPage;