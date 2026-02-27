import { cookies } from "next/headers";
import { baseUrl } from "../utils";

export const adminOrders = async () => {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  const res = await fetch(`${baseUrl}/orders`, {
    headers: {
      Cookie: cookieString,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }
  const data = await res.json();
  return data;
};
