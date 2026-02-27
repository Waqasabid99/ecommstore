"use client";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import { baseUrl, columns, formatDate } from "@/lib/utils";
import { Eye, LoaderIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`${baseUrl}/orders/user`, {
          withCredentials: true,
        });
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch user orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleView = (item) => {
    navigate.push(`/user/${id}/orders/${item.id}`);
  };

  const updatedData = orders.map((order) => ({
    ...order,
    createdAt: formatDate(order.createdAt),
  }));

  if (isLoading) {
    return (
      <section>
        <DashboardHeadingBox text="Orders" subHeading={"View all your orders"} />
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <LoaderIcon size={48} className="animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <DashboardHeadingBox text="Orders" subHeading={"View all your orders"} />
      <Table
        columns={columns}
        data={updatedData}
        actions={(item) => (
          <button
            className="p-2 hover:bg-black hover:text-white hover:rounded hover:p-2"
            onClick={() => handleView(item)}
          >
            <Eye aria-label="view order" size={16} />
          </button>
        )}
      />
    </section>
  );
};

export default Orders;
