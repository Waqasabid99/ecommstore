"use client";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Stats from "@/components/ui/Stats";
import Table from "@/components/ui/Table";
import { baseUrl, columns, formatDate } from "@/lib/utils";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import { Clock, DollarSign, Eye, PackageX, ShoppingCart, SquarePen, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const Dashboard = ({ stats, orders, pagination }) => {
  const { user } = useAuthStore();
  const { adminID } = useParams();
  const navigate = useRouter();
  const [chartDistributionData, setChartDistributionData] = useState([]);

  useEffect(() => {
    try {
      const getChartData = async () => {
        const { data } = await axios.get(`${baseUrl}/dashboard/order-status`, {
          withCredentials: true,
        });
        if (data.success) {
          setChartDistributionData(data.data.distribution);
        }
      };
      getChartData();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const chartData = chartDistributionData.map((item) => ({
    name: item.status,
    value: item.count,
    revenue: Number(item.revenue),
    percentage: Number(item.percentage),
  }));

  const COLORS = {
    PENDING: "#facc15",
    PAID: "#22c55e",
    DELIVERED: "#3b82f6",
  };

  const updatedOrders = orders.map((order) => ({
    ...order,
    createdAt: formatDate(order.createdAt),
  }));

  const handleUpdate = (id) => {
    navigate.push(`/admin/${adminID}/orders/${id}`);
  };

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Orders: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Revenue: <span className="font-medium">${payload[0].payload.revenue.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section>
      <DashboardHeadingBox
        text={`Welcome back, ${user?.userName || "Guest"} 👋`}
      />
      
      <Stats
        stats={[
          {
            label: "Total Users",
            value: stats?.customers?.totalUsers || 0,
            icon: <Users size={32} />,
          },
          {
            label: "Total Orders",
            value: stats?.orders?.totalOrders || 0,
            icon: <ShoppingCart size={32} />,
          },
          {
            label: "Pending Orders",
            value: stats?.orders?.pending || 0,
            icon: <Clock size={32} />,
          },
          {
            label: "Total Revenue",
            value: stats?.revenue?.total || 0,
            icon: <DollarSign size={32} />,
          },
          {
            label: "Out of Stock",
            value: stats?.inventory?.outOfStock || 0,
            icon: <PackageX size={32} />,
          },
          {
            label: "Low Stock",
            value: stats?.inventory?.lowStock || 0,
            icon: <ShoppingCart size={32} />,
          },
        ]}
        toShow={6}
        className={"grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4"}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Order Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={5}
                label={renderCustomLabel}
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell 
                    key={entry.name} 
                    fill={COLORS[entry.name]} 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-gray-700 font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Revenue by Order Status
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="revenue" 
                radius={[8, 8, 0, 0]}
                maxBarSize={80}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <h2 className="text-xl font-semibold text-gray-800 my-4">Recent Orders</h2>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          data={updatedOrders}
          actions={(item) => (
            <button
              className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
              onClick={() => handleUpdate(item.id)}
              aria-label={`View order ${item.id}`}
            >
              <SquarePen size={16} />
            </button>
          )}
        />
      </div>
    </section>
  );
};

export default Dashboard;