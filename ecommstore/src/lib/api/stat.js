import { cookies } from "next/headers";
import { baseUrl } from "../utils"

export const getStats = async () => {
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(`${baseUrl}/dashboard/stats`, {
        headers: {
            Cookie: cookieString,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch stats");
    }

    return res.json();
}