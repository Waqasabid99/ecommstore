import { cookies } from "next/headers";
import { baseUrl } from "../utils"

export const getStats = async () => {
    const cookieStore = await cookies();
    const res = await fetch(`${baseUrl}/dashboard/stats`, {
        headers: {
            Cookie: cookieStore.toString(),
        },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch stats");
    }
  
    return res.json();
}