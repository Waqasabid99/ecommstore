import { getCurrentUser } from "@/actions/user.action";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children, params }) {
  const { adminID: id } = await params;
  const user = await getCurrentUser(id);

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return children;
}
