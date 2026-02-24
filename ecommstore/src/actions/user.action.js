import { baseUrl } from "@/lib/utils";
import axios from "axios";
import { cookies } from "next/headers";

export const getCurrentUser = async (id) => {
  try {
    const cookieStore = await cookies();

    const { data } = await axios.get(`${baseUrl}/users/${id}`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      validateStatus: () => true,
    });

    if (!data?.success) {
      return null;
    }

    return data.data;
  } catch (err) {
    return null;
  }
};
