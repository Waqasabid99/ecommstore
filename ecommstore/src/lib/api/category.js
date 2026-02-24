import { cache } from "react";
import { baseUrl } from "../utils";


export const getCategories = cache(async () => {
  const res = await fetch(`${baseUrl}/categories`, {
    next: {
      revalidate: 20,
      tags: ["categories"],
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const { data } = await res.json();
  return data;
});
