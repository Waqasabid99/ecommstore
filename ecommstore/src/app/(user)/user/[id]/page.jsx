import Dashboard from "@/components/userDashboard/pages/Dashboard"
import { getOrders } from "@/lib/api/orders";

const page = async () => {
  const data = await getOrders();
  return (
    <div>
      <Dashboard data={data}/>
    </div>
  )
}

export default page