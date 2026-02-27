import { baseUrl } from "@/lib/utils";
import axios from "axios";
import { cookies } from "next/headers";

export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    // Use the /auth/verify endpoint — it reads the cookie to identify the user
    const { data } = await axios.get(`${baseUrl}/auth/verify`, {
      headers: {
        Cookie: cookieString,
      },
      validateStatus: () => true,
    });

    if (!data?.success) {
      return null;
    }
    console.log(data.user)
    return data.user;
  } catch (err) {
    return null;
  }
};