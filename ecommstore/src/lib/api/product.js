import { cache } from "react";
import { baseUrl } from "../utils";
/**
 * Cached server-side fetch
 */
export const getProducts = cache(async () => {
  const res = await fetch(`${baseUrl}/products`, {
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
