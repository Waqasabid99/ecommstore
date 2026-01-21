import { cache } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Cached server-side fetch
 */
export const getProducts = cache(async () => {
  const res = await fetch(`${API_URL}/products`, {
    next: {
      revalidate: 60, // ISR: revalidate every 60 seconds
      tags: ["products"],
    },
  });
  console.log(res);

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
});
