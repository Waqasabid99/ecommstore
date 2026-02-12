import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { PiCreditCard } from "react-icons/pi";
import { BsShop } from "react-icons/bs";
import { CiDiscount1 } from "react-icons/ci";
import { PiGlobeThin } from "react-icons/pi";
import React from "react";

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

// format date and time
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  return new Date(time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
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

export const columns = [
  {
    key: "createdAt",
    header: "Order Date",
  },
  {
    key: "total",
    header: "Order Amount",
  },
  {
    key: "status",
    header: "Order Status",
  },
  
];

export const stats = [
    { value: '13k', label: 'Licensed Products' },
    { value: '156', label: 'Satisfied Customers' },
    { value: '14m', label: 'Products Sold' },
    { value: '82+', label: 'Global Stores' }
];

export const renderCategories = (items, level = 0) =>
  items.map((item) => (
    <React.Fragment key={item.id}>
      <option value={item.slug}>
        {"".repeat(level)}{item.name}
      </option>

      {item.children?.length > 0 &&
        renderCategories(item.children, level + 1)}
    </React.Fragment>
  ));