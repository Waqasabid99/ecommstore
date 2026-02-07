'use client';
import { useState, useEffect } from 'react';
import { Clock, Tag } from 'lucide-react';
import ProductCard from '../product/ProductCard';

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Clock size={20} className="text-(--color-brand-primary)" />
      <div className="flex gap-2">
        <div className="flex flex-col items-center bg-(--bg-surface) border border-(--border-default) rounded-lg px-3 py-2 min-w-12.5">
          <span className="text-xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-[10px] text-(--text-secondary)">DAYS</span>
        </div>
        <div className="flex flex-col items-center bg-(--bg-surface) border border-(--border-default) rounded-lg px-3 py-2 min-w-12.5">
          <span className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[10px] text-(--text-secondary)">HOURS</span>
        </div>
        <div className="flex flex-col items-center bg-(--bg-surface) border border-(--border-default) rounded-lg px-3 py-2 min-w-12.5">
          <span className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[10px] text-(--text-secondary)">MINS</span>
        </div>
        <div className="flex flex-col items-center bg-(--bg-surface) border border-(--border-default) rounded-lg px-3 py-2 min-w-12.5">
          <span className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[10px] text-(--text-secondary)">SECS</span>
        </div>
      </div>
    </div>
  );
};

const LimitedTimeOffer = ({ products = [] }) => {
  const [offerProducts, setOfferProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set offer end date (3 days from now as example)
  const offerEndDate = new Date();
  offerEndDate.setDate(offerEndDate.getDate() + 3);

  // Filter products based on tags
  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(true);
      
      // Define offer-related keywords (case-insensitive)
      const offerKeywords = ['sale', 'discount', 'off', 'deal', 'offer', 'flash', 'limited', 'hot'];
      
      const filteredProducts = products.filter(product => {
        // Check if product has tags array
        if (!product.tag || !Array.isArray(product.tag)) {
          return false;
        }
        
        // Check if any tag contains offer-related keywords
        return product.tag.some(tag => {
          const lowerTag = tag.toLowerCase();
          return offerKeywords.some(keyword => lowerTag.includes(keyword));
        });
      });
      
      // Limit to first 4 products for display
      setOfferProducts(filteredProducts.slice(0, 4));
      setIsLoading(false);
    }
  }, [products]);

  // Don't render the section if no offer products
  if (offerProducts.length === 0) {
    return null;
  }

  return (
    <section className="mx-4 border border-(--border-default) rounded-xl pt-8 md:pt-12 mb-6 bg-linear-to-br from-red-50 to-orange-50">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-(--border-default) px-4 sm:px-6 md:px-10 pb-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block text-red-600 text-[10px]
                               border-2 border-red-600
                               rounded-full px-3 py-1 font-semibold">
                LIMITED TIME OFFER
              </span>
              <Tag size={20} className="text-red-600" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl
                           font-semibold leading-tight text-(--text-heading)">
              Flash Sale - Hurry Up!
            </h2>
            <p className="text-(--text-secondary) mt-2 text-sm">
              Grab these exclusive deals before time runs out
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="self-start lg:self-center">
            <CountdownTimer endDate={offerEndDate} />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--color-brand-primary)"></div>
          </div>
        ) : (
          offerProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {/* View All Button */}
      <div className="flex justify-center py-8">
        <button className="bg-(--btn-bg-secondary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover-secondary) transition-all font-medium">
          View All Deals
        </button>
      </div>
    </section>
  );
};

export default LimitedTimeOffer;