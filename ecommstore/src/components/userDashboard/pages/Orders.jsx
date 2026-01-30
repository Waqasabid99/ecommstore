import DashboardHeadingBox from '@/components/ui/DashboardHeadingBox';
import Table from '@/components/ui/Table'
import { getOrders } from '@/lib/api/orders'
import { columns, formatDate } from '@/lib/utils';

const Orders = async () => {
    const orders = await getOrders();
      const updatedData = orders.data.map((order) => ({
    ...order, createdAt: formatDate(order.createdAt), id: order.id.substr(0, 8).toUpperCase()
  }))
  return (
    <section>
       <DashboardHeadingBox text="Orders" subHeading={"View all your orders"}/> 
      <Table columns={columns} data={updatedData}/>
    </section>
  )
}

export default Orders