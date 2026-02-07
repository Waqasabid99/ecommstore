import { getCurrentUser } from "@/actions/user.action";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children, params }) {
  const { adminID } = await params;
  const user = await getCurrentUser(adminID);
  console.log(user);

  if (!user || user.role !== "ADMIN" || user.id !== params.adminID) {
    redirect("/");
  }

  return children;
}
