'use server';
import { cache } from "react";
import { baseUrl } from "../utils";

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

  const { data } = await res.json();
  console.log(data)
  return data;
});
