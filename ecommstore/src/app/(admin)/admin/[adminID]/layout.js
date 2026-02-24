import { getCurrentUser } from "@/actions/user.action";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  // No params needed — identity comes from the cookie
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return children;
}