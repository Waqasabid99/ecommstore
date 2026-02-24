import { getCurrentUser } from "@/actions/user.action";
import { redirect } from "next/navigation";

export default async function UserLayout({ children, params }) {
  const { id } = await params;
  const user = await getCurrentUser(id);

  if (!user || user.role !== "USER") {
    redirect("/");
  }

  return children;
}
