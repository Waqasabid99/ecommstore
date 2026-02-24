import { baseUrl } from "@/lib/utils";
import axios from "axios";
import { cookies } from "next/headers";

export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();

    // Use the /auth/verify endpoint — it reads the cookie to identify the user
    const { data } = await axios.get(`${baseUrl}/auth/verify`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      validateStatus: () => true,
    });

    if (!data?.success) {
      return null;
    }

    return data.user;
  } catch (err) {
    return null;
  }
};