import { useState, useEffect } from 'react';
import { Clock, Heart, Tag } from 'lucide-react';

// Sample offer products data
const offerProducts = [
  {
    id: 1,
    name: "Wireless Headphones Pro",
    category: "audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    originalPrice: 15999,
    discountPrice: 9999,
    discount: 38,
    tag: "HOT DEAL",
    rating: 4.5
  },
  {
    id: 2,
    name: "Smart Watch Ultra",
    category: "wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    originalPrice: 25999,
    discountPrice: 17999,
    discount: 31,
    tag: "LIMITED",
    rating: 4.8
  },
  {
    id: 3,
    name: "Bluetooth Speaker X",
    category: "audio",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    originalPrice: 8999,
    discountPrice: 5499,
    discount: 39,
    tag: "SALE",
    rating: 4.3
  },
  {
    id: 4,
    name: "Laptop Stand Premium",
    category: "accessories",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    originalPrice: 4999,
    discountPrice: 2999,
    discount: 40,
    tag: "BEST PRICE",
    rating: 4.6
  }
];

const OfferProductCard = ({ product }) => {
  return (
    <div className="group relative border border-(--border-default) overflow-hidden flex flex-col bg-white">
      
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
        {product.discount}% OFF
      </div>

      {/* Top */}
      <div className="flex justify-between items-center px-4 pt-4">
        <span className="text-[10px] capitalize">{product.category}</span>
        <button className="border border-(--border-default) rounded-full p-2
                           hover:bg-(--btn-bg-hover) hover:text-(--btn-text-hover)">
          <Heart size={16} />
        </button>
      </div>

      {/* Image */}
      <div className="relative flex justify-center items-center p-3">
        <img
          src={product.image}
          alt={product.name}
          className="h-40 object-cover transition-transform duration-300 group-hover:scale-110"
        />

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
        <span className="text-[10px] text-(--text-inverse) bg-(--bg-primary) border border-(--border-default) rounded-full px-3 py-1 w-fit">
          {product.tag}
        </span>

        <h3 className="font-semibold text-(--text-heading)">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <h4 className="text-lg font-bold text-red-500">
            Rs. {product.discountPrice.toLocaleString()}
          </h4>
          <span className="text-sm text-(--text-secondary) line-through">
            Rs. {product.originalPrice.toLocaleString()}
          </span>
        </div>

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

const LimitedTimeOffer = () => {
  // Set offer end date (3 days from now as example)
  const offerEndDate = new Date();
  offerEndDate.setDate(offerEndDate.getDate() + 3);

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
        {offerProducts.map(product => (
          <OfferProductCard key={product.id} product={product} />
        ))}
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