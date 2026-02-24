import { cookies } from "next/headers"
import { baseUrl } from "../utils";

export const getOrders = async () => {
    const cookieStore = await cookies();
    const res = await fetch(`${baseUrl}/orders/user`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      next: {
        revalidate: 60,
      },
     cache: "no-cache",
    });
    console.log(res)
    if (!res.ok) {
      throw new Error("Failed to fetch orders");
    }
    const data = await res.json();
    return data;
}

export const adminOrders = async () => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${baseUrl}/orders`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error("Failed to fetch admin orders");
  }
}

export const getStats = async () => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${baseUrl}/dashboard/stats`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return res.json();
  } catch (err) {
    throw new Error("Failed to fetch stats");
  }
}