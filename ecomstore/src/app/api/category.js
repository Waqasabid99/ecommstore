import { cache } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCategories = cache(async () => {
  const res = await fetch(`${API_URL}/categories`, {
    next: {
      revalidate: 300,
      tags: ["categories"],
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
});
