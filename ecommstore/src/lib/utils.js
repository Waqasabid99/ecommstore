// Utility functions
import { PiCreditCard } from "react-icons/pi";
import { BsShop } from "react-icons/bs";
import { CiDiscount1 } from "react-icons/ci";
import { PiGlobeThin } from "react-icons/pi";

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const Navlinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blog', path: '/blog' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
]

export const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const specialties = [
    {
        icon: PiCreditCard,
        title: 'Secure Payment',
        text: 'We accept all major credit cards and debit cards.'
    },
    {
        icon: BsShop,
        title: 'In-Store Pickup',
        text: 'We allow in-store pickup for your convenience.'
    },
    {
        icon: CiDiscount1,
        title: 'Limited Time Offer',
        text: 'We offer great discounts on our products.'
    },
    {
        icon: PiGlobeThin,
        title: 'Worldwide Delivery',
        text: 'We deliver our products worldwide.'
    },
]

export const categories = [
    { id: 1, name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', description: 'Latest tech gadgets' },
    { id: 2, name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', description: 'Trendy clothing' },
    { id: 3, name: 'Home & Living', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400', description: 'Comfort essentials' },
    { id: 4, name: 'Beauty & Wellness', image: 'https://images.unsplash.com/photo-1524758631624-e2918125a1d0?w=400', description: 'Beauty and wellness products' },
    { id: 5, name: 'Toys & Games', image: 'https://images.unsplash.com/photo-1505740420928-5e560c6a6fb2?w=400', description: 'Fun and educational toys' },
    { id: 6, name: 'Books & Movies', image: 'https://images.unsplash.com/photo-1524758631624-e2918125a1d0?w=400', description: 'Books and movies' },
    { id: 7, name: 'Jewelry & Accessories', image: 'https://images.unsplash.com/photo-1524758631624-e2918125a1d0?w=400', description: 'Jewelry and accessories' },
    { id: 8, name: 'Sports & Outdoor', image: 'https://images.unsplash.com/photo-1524758631624-e2918125a1d0?w=400', description: 'Sports and outdoor gear' },
    { id: 9, name: 'Health & Fitness', image: 'https://images.unsplash.com/photo-1524758631624-e2918125a1d0?w=400', description: 'Health and fitness products' },
    { id: 10, name: 'Garden & Outdoor', image: 'https://images.unsplash.com/photo-1524758631624-e2918125a1d0?w=400', description: 'Garden and outdoor products' },
];

export const stats = [
    { value: '13k', label: 'Licensed Products' },
    { value: '156', label: 'Satisfied Customers' },
    { value: '14m', label: 'Products Sold' },
    { value: '82+', label: 'Global Stores' }
];

export const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones Pro",
    slug: "premium-wireless-headphones-pro",
    category: "audio",
    price: 15999,
    originalPrice: 24999,
    discount: 36,
    rating: 4.5,
    reviewCount: 328,
    inStock: true,
    sku: "WH-PRO-2024",
    brand: "TechSound",
    tag: "BESTSELLER",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=600&fit=crop"
    ],
    features: [
      "Active Noise Cancellation",
      "40-hour battery life",
      "Premium sound quality",
      "Bluetooth 5.3 connectivity",
      "Foldable design",
      "Built-in microphone"
    ],
    specifications: {
      "Driver Size": "40mm",
      "Frequency Response": "20Hz - 20kHz",
      "Impedance": "32 Ohm",
      "Battery Life": "40 hours",
      "Charging Time": "2 hours",
      "Bluetooth Version": "5.3",
      "Weight": "250g"
    }
  },

  {
    id: 2,
    name: "Smart Noise Cancelling Earbuds X",
    slug: "smart-noise-cancelling-earbuds-x",
    category: "audio",
    price: 8999,
    originalPrice: 12999,
    discount: 31,
    rating: 4.6,
    reviewCount: 214,
    inStock: true,
    sku: "EB-X-2024",
    brand: "SoundWave",
    tag: "NEW",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1628202926206-c63a34b1618f?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop"
    ],
    features: [
      "Hybrid ANC",
      "Touch controls",
      "Fast charging",
      "IPX5 water resistance",
      "Voice assistant support"
    ],
    specifications: {
      "Battery Life": "30 hours",
      "Charging Case": "USB-C",
      "Bluetooth Version": "5.2",
      "Water Resistance": "IPX5",
      "Weight": "52g"
    }
  },

  {
    id: 3,
    name: "Portable Bluetooth Speaker Max",
    slug: "portable-bluetooth-speaker-max",
    category: "audio",
    price: 7499,
    originalPrice: 9999,
    discount: 25,
    rating: 4.4,
    reviewCount: 189,
    inStock: true,
    sku: "SP-MAX-2024",
    brand: "BoomSound",
    tag: "POPULAR",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558537348-c0f8e733989d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop"
    ],
    features: [
      "360° sound",
      "Deep bass",
      "Waterproof design",
      "20-hour playtime",
      "Built-in mic"
    ],
    specifications: {
      "Output Power": "30W",
      "Battery Life": "20 hours",
      "Water Resistance": "IPX7",
      "Bluetooth Version": "5.1",
      "Weight": "1.2kg"
    }
  },

  {
    id: 4,
    name: "Wireless Gaming Headset Elite",
    slug: "wireless-gaming-headset-elite",
    category: "gaming",
    price: 12999,
    originalPrice: 17999,
    discount: 28,
    rating: 4.7,
    reviewCount: 412,
    inStock: true,
    sku: "GH-ELITE-2024",
    brand: "GameX",
    tag: "TOP RATED",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=600&fit=crop"
    ],
    features: [
      "7.1 surround sound",
      "Low-latency wireless",
      "RGB lighting",
      "Noise-isolating mic"
    ],
    specifications: {
      "Connectivity": "2.4GHz Wireless",
      "Battery Life": "25 hours",
      "Microphone": "Detachable",
      "Weight": "320g"
    }
  },

  {
    id: 5,
    name: "Smart Fitness Watch Pro",
    slug: "smart-fitness-watch-pro",
    category: "wearables",
    price: 11999,
    originalPrice: 15999,
    discount: 25,
    rating: 4.3,
    reviewCount: 276,
    inStock: true,
    sku: "SW-PRO-2024",
    brand: "FitCore",
    tag: "TRENDING",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop"
    ],
    features: [
      "Heart rate monitoring",
      "Sleep tracking",
      "GPS",
      "AMOLED display",
      "14-day battery"
    ],
    specifications: {
      "Display": "1.6 inch AMOLED",
      "Battery Life": "14 days",
      "Water Resistance": "5ATM",
      "Sensors": "HR, SpO2, GPS"
    }
  },

  {
    id: 6,
    name: "Fast Wireless Charging Pad",
    slug: "fast-wireless-charging-pad",
    category: "accessories",
    price: 2999,
    originalPrice: 4499,
    discount: 33,
    rating: 4.2,
    reviewCount: 98,
    inStock: true,
    sku: "WC-PAD-15W",
    brand: "ChargePro",
    tag: "ESSENTIAL",
    thumbnail: "https://images.unsplash.com/photo-1591290619762-c588cf5e8180?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1591290619762-c588cf5e8180?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1580910051074-7c79e13a93a6?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1623998021440-ecb6f7f6d17c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop"
    ],
    features: [
      "15W fast charging",
      "Qi certified",
      "Overheat protection",
      "Slim design"
    ],
    specifications: {
      "Output": "15W",
      "Compatibility": "Qi-enabled devices",
      "Input": "USB-C",
      "Weight": "180g"
    }
  },

  {
    id: 7,
    name: "Mechanical Keyboard RGB Pro",
    slug: "mechanical-keyboard-rgb-pro",
    category: "computers",
    price: 10999,
    originalPrice: 14999,
    discount: 27,
    rating: 4.6,
    reviewCount: 341,
    inStock: true,
    sku: "KB-RGB-PRO",
    brand: "KeyForge",
    tag: "HOT",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop"
    ],
    features: [
      "Mechanical switches",
      "Per-key RGB",
      "Aluminum body",
      "Anti-ghosting"
    ],
    specifications: {
      "Switch Type": "Red Mechanical",
      "Connection": "USB",
      "Key Rollover": "N-key",
      "Weight": "1.1kg"
    }
  },

  {
    id: 8,
    name: "Ultra HD Webcam Pro",
    slug: "ultra-hd-webcam-pro",
    category: "computers",
    price: 6999,
    originalPrice: 9999,
    discount: 30,
    rating: 4.4,
    reviewCount: 167,
    inStock: true,
    sku: "WCAM-4K-2024",
    brand: "ViewPlus",
    tag: "NEW ARRIVAL",
    thumbnail: "https://images.unsplash.com/photo-1625723044792-44de16ccb4b3?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1625723044792-44de16ccb4b3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600267185393-e158a98703de?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611605698335-1b1c4b3e4f84?w=600&h=600&fit=crop"
    ],
    features: [
      "4K video recording",
      "Auto focus",
      "Low-light correction",
      "Dual microphones"
    ],
    specifications: {
      "Resolution": "4K @ 30fps",
      "Focus": "Auto",
      "Microphone": "Dual stereo",
      "Connection": "USB-C"
    }
  }
];