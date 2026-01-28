import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { PiCreditCard } from "react-icons/pi";
import { BsShop } from "react-icons/bs";
import { CiDiscount1 } from "react-icons/ci";
import { PiGlobeThin } from "react-icons/pi";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
// Utility functions

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