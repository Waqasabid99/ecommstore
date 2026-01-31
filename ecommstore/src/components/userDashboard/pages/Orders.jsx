"use client";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import { columns, formatDate } from "@/lib/utils";
import { Eye, View } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const Orders = ({ orders }) => {
  const { id } = useParams();
  console.log(orders)
  const navigate = useRouter();
  const handleView = (item) => { navigate.push(`/user/${id}/orders/${item.id}`) };
  const updatedData = orders.data.map((order) => ({
      ...order,
      createdAt: formatDate(order.createdAt),
    }));
  return (
    <section>
      <DashboardHeadingBox text="Orders" subHeading={"View all your orders"} />
      <Table
        columns={columns}
        data={updatedData}
        actions={(item) => (
            <button className="p-2 hover:bg-black hover:text-white hover:rounded hover:p-2" onClick={() => handleView(item)}> <Eye aria-label="view order" size={16} /> </button>
        )}
      />
    </section>
  );
};

export default Orders;
