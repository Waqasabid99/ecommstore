import Dashboard from "@/components/admin/pages/Dashboard"
import { adminOrders } from "@/lib/api/adminOrders";
import { getStats } from "@/lib/api/stat";

const page = async () => {
  setTimeout(() => {}, 100);
    const {data: orders, pagination} = await adminOrders();
    const {data: stat} = await getStats();
    console.log(stat)
  return (
    <div>
        <Dashboard stats={stat} orders={orders} pagination={pagination}/>
    </div>
  )
}

export default page