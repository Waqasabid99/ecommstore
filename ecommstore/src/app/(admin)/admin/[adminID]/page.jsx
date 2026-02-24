import Dashboard from "@/components/admin/pages/Dashboard"
import { adminOrders } from "@/lib/api/orders";
import { getStats } from "@/lib/api/orders";

const page = async () => {
    const {data: orders, pagination} = await adminOrders();
    const {data: stat} = await getStats();
  return (
    <div>
        <Dashboard stats={stat} orders={orders} pagination={pagination}/>
    </div>
  )
}

export default page