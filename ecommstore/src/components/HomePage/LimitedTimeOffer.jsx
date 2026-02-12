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
      } else {
        // Promotion ended
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Clock size={20} className="text-red-600" />
      <div className="flex gap-2">
        <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-12.5">
          <span className="text-xl font-bold text-gray-900">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500">DAYS</span>
        </div>
        <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-12.5">
          <span className="text-xl font-bold text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500">HOURS</span>
        </div>
        <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-12.5">
          <span className="text-xl font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500">MINS</span>
        </div>
        <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-12.5">
          <span className="text-xl font-bold text-gray-900">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500">SECS</span>
        </div>
      </div>
    </div>
  );
};

const LimitedTimeOffer = ({ products : allProducts }) => {
  const [offerProducts, setOfferProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promotionData, setPromotionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Filter products that have active promotions
        const promotedProducts = allProducts.filter(product => {
          return product.hasPromotion && product.promotion;
        });

        if (promotedProducts.length === 0) {
          setOfferProducts([]);
          setPromotionData(null);
          setIsLoading(false);
          return;
        }

        // Get the promotion with the nearest end date for the timer
        let nearestPromotion = null;
        let nearestEndDate = null;

        promotedProducts.forEach(product => {
          if (product.promotion && product.promotion.endsAt) {
            const endDate = new Date(product.promotion.endsAt);
            if (!nearestEndDate || endDate < nearestEndDate) {
              nearestEndDate = endDate;
              nearestPromotion = product.promotion;
            }
          }
        });

        // Sort by discount value (highest first) and limit to 8 products
        const sortedProducts = promotedProducts.sort((a, b) => {
          const aDiscount = a.promotion?.discountValue || 0;
          const bDiscount = b.promotion?.discountValue || 0;
          return bDiscount - aDiscount;
        }).slice(0, 8);

        setOfferProducts(sortedProducts);
        setPromotionData(nearestPromotion);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching promoted products:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchPromotedProducts();
  }, []);

  // Don't render if no promoted products
  if (!isLoading && offerProducts.length === 0) {
    return null;
  }

  // Don't render if there's an error
  if (error) {
    console.error('LimitedTimeOffer error:', error);
    return null;
  }

  return (
    <section className="mx-4 border border-gray-200 rounded-xl pt-8 md:pt-12 mb-6 bg-linear-to-br from-red-50 to-orange-50">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-gray-200 px-4 sm:px-6 md:px-10 pb-6">
        
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
                           font-semibold leading-tight text-gray-900">
              {promotionData?.name || 'Flash Sale - Hurry Up!'}
            </h2>
            <p className="text-gray-600 mt-2 text-sm">
              {promotionData?.description || 'Grab these exclusive deals before time runs out'}
            </p>
          </div>

          {/* Countdown Timer */}
          {promotionData?.endsAt && (
            <div className="self-start lg:self-center">
              <CountdownTimer endDate={promotionData.endsAt} />
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          offerProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
};

export default LimitedTimeOffer;