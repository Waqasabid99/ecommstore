import Orders from "@/components/userDashboard/pages/Orders"
import { getOrders } from "@/lib/api/orders";
import { formatDate } from "@/lib/utils";

export const metadata = {
    title: 'Orders - EcomStore',
    description: 'Manage your orders and their statuses. View, track, and update order details as needed.',
}

const page = async () => {
    const orders = await getOrders();
  return <Orders orders={orders} />
}

export default page