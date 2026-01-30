"use client";
import Stats from "@/components/ui/Stats";
import Table from "@/components/ui/Table";
import useAuthStore from "@/store/authStore";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  RefreshCcw,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { columns, formatDate } from "@/lib/utils";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";

const statIcons = {
  "Total Orders": <ShoppingCart className="w-6 h-6" />,
  "Pending Orders": <RefreshCcw className="w-6 h-6" />,
  "Delivered Orders": <CheckCircle className="w-6 h-6" />,
  "Cancelled Orders": <XCircle className="w-6 h-6" />,
  "Refunded Orders": <RefreshCcw className="w-6 h-6" />,
  "Total Spent": <DollarSign className="w-6 h-6" />,
  "Average Order Value": <TrendingUp className="w-6 h-6" />,
};

const Dashboard = ({ data: orders }) => {
  const { stats } = orders;
  console.log(orders.data);
  const { user } = useAuthStore();
  const [userOrders, setUserOrders] = useState([]);
  const statsWithIcons = stats.map((stat) => ({
    ...stat,
    icon: statIcons[stat.label] || null,
  }));

  const updatedData = orders.data.map((order) => ({
    ...order, createdAt: formatDate(order.createdAt), id: order.id.substr(0, 8).toUpperCase()
  }))

  useEffect(() => {
    setUserOrders(orders);
  }, [orders]);

  return (
    <div>
      {/* Welcome Message */}
      <DashboardHeadingBox text={`Welcome back, ${user?.userName || "Guest"} 👋`} />

      {/* Stats Section */}
      <Stats
        stats={statsWithIcons}
        toShow={6}
        className={"grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 "}
      />
      {/* Latest Orders */}
      <h2 className="text-xl my-3.5">Your Latest Orders</h2>
      <Table columns={columns} data={updatedData} />
    </div>
  );
};

export default Dashboard;
