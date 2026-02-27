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
  Eye,
  LoaderIcon,
} from "lucide-react";
import { baseUrl, columns, formatDate } from "@/lib/utils";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { useRouter } from "next/navigation";
import axios from "axios";

const statIcons = {
  "Total Orders": <ShoppingCart className="w-6 h-6" />,
  "Pending Orders": <RefreshCcw className="w-6 h-6" />,
  "Delivered Orders": <CheckCircle className="w-6 h-6" />,
  "Cancelled Orders": <XCircle className="w-6 h-6" />,
  "Refunded Orders": <RefreshCcw className="w-6 h-6" />,
  "Total Spent": <DollarSign className="w-6 h-6" />,
  "Average Order Value": <TrendingUp className="w-6 h-6" />,
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useRouter();
  const [orders, setOrders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`${baseUrl}/orders/user`, {
          withCredentials: true,
        });
        if (data.success) {
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch user orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoaderIcon size={48} className="animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Could not load your orders. Please try again.</p>
      </div>
    );
  }

  const statsWithIcons = (orders.stats || []).map((stat) => ({
    ...stat,
    icon: statIcons[stat.label] || null,
  }));

  const updatedData = (orders.data || []).map((order) => ({
    ...order,
    createdAt: formatDate(order.createdAt),
  }));

  const handleView = (item) => {
    navigate.push(`/user/${user.id}/orders/${item.id}`);
  };

  return (
    <div>
      {/* Welcome Message */}
      <DashboardHeadingBox
        text={`Welcome back, ${user?.userName || "Guest"} 👋`}
      />

      {/* Stats Section */}
      <Stats
        stats={statsWithIcons}
        toShow={6}
        className={"grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 "}
      />
      {/* Latest Orders */}
      <h2 className="text-xl my-3.5">Your Latest Orders</h2>
      <Table
        columns={columns}
        data={updatedData || []}
        actions={(item) => (
          <button
            className="p-2 hover:bg-black hover:text-white hover:rounded hover:p-2"
            onClick={() => handleView(item)}
          >
            <Eye aria-label="view order" size={16} />{" "}
          </button>
        )}
      />
    </div>
  );
};

export default Dashboard;
