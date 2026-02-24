import { baseUrl } from "../utils";
import { cookies } from "next/headers";
export const adminOrders = async () => {
  const cookieStore = await cookies();
  const res = await fetch(`${baseUrl}/orders`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  console.log(res);
  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }
  const data = await res.json();
  return data;
};
