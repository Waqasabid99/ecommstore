import { PiCreditCard } from "react-icons/pi";
import { BsShop } from "react-icons/bs";
import { CiDiscount1 } from "react-icons/ci";
import { PiGlobeThin } from "react-icons/pi";

export const Navlinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blog', path: '/blog' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
]

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
        category: "tech",
        name: "Wireless Noise-Cancelling Headphones",
        image: "https://images.unsplash.com/photo-1518441902117-f9c5d8f3c3c1",
        tag: "featured",
        rating: 4.6,
        price: 18999,
        description:
            "Premium wireless headphones with active noise cancellation, deep bass, and up to 30 hours of battery life."
    },
    {
        id: 2,
        category: "tech",
        name: "Smart Fitness Watch",
        image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b",
        tag: "new",
        rating: 4.4,
        price: 12999,
        description:
            "Track your heart rate, steps, sleep, and workouts with this lightweight and water-resistant smart watch."
    },
    {
        id: 3,
        category: "home",
        name: "Minimalist Table Lamp",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
        tag: "hot",
        rating: 4.3,
        price: 5999,
        description:
            "Modern LED table lamp with adjustable brightness, perfect for study desks and bedside tables."
    },
    {
        id: 4,
        category: "home",
        name: "Smart Aroma Diffuser",
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
        tag: "featured",
        rating: 4.5,
        price: 7499,
        description:
            "Ultrasonic aroma diffuser with timer settings and ambient lighting for a calm and relaxing home environment."
    },
    {
        id: 5,
        category: "accessories",
        name: "Premium Leather Laptop Sleeve",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        tag: "new",
        rating: 4.7,
        price: 4999,
        description:
            "Hand-crafted leather laptop sleeve with soft inner lining for stylish and secure everyday protection."
    },
    {
        id: 6,
        category: "accessories",
        name: "Wireless Charging Pad",
        image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07",
        tag: "hot",
        rating: 4.2,
        price: 3499,
        description:
            "Fast wireless charging pad compatible with all Qi-enabled smartphones and earbuds."
    },
    {
        id: 7,
        category: "tech",
        name: "Bluetooth Mechanical Keyboard",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
        tag: "featured",
        rating: 4.8,
        price: 15999,
        description:
            "Compact mechanical keyboard with tactile switches, RGB backlighting, and multi-device Bluetooth support."
    },
    {
        id: 8,
        category: "home",
        name: "Smart LED Light Strip",
        image: "https://images.unsplash.com/photo-1555489426-e8e9b3cddc79",
        tag: "new",
        rating: 4.4,
        price: 4299,
        description:
            "App-controlled RGB LED light strip with voice assistant support to enhance your room ambiance."
    }
];
