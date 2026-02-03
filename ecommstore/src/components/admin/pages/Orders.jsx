"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Eye,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  User,
  MapPin,
  CreditCard,
  LoaderIcon,
  ChevronDown,
  ChevronUp,
  SquarePen,
  Plus,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import Stats from "@/components/ui/Stats";
import { baseUrl, formatDate } from "@/lib/utils";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    delivered: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { adminID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters.status, filters.search]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
      });

      const { data } = await axios.get(`${baseUrl}/orders?${queryParams}`, {
        withCredentials: true,
      });

      if (data.success) {
        setOrders(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));

        // Calculate stats
        const totalRevenue = data.data.reduce(
          (sum, order) => sum + Number(order.totalAmount || 0),
          0
        );
        const pendingCount = data.data.filter((o) => o.status === "PENDING").length;
        const paidCount = data.data.filter((o) => o.status === "PAID").length;
        const deliveredCount = data.data.filter(
          (o) => o.status === "DELIVERED"
        ).length;

        setStats({
          total: data.pagination.total,
          pending: pendingCount,
          paid: paidCount,
          delivered: deliveredCount,
          totalRevenue,
        });
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleUpdateOrder = (orderId) => {
    navigate.push(`/admin/${adminID}/orders/${orderId}/edit`);
  };
  console.log(orders)
  const handleClearFilters = () => {
    setFilters({
      status: "",
      search: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Pending",
        icon: <Clock size={14} />,
      },
      PAID: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Paid",
        icon: <CheckCircle size={14} />,
      },
      DELIVERED: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Delivered",
        icon: <Truck size={14} />,
      },
      CANCELLED: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Cancelled",
        icon: <XCircle size={14} />,
      },
      PROCESSING: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        label: "Processing",
        icon: <Package size={14} />,
      },
      SHIPPED: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "Shipped",
        icon: <Truck size={14} />,
      },
      REFUNDED: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "Refunded",
        icon: <DollarSign size={14} />,
      },
      RETURNED: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "Returned",
        icon: <RefreshCw size={14} />,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} flex items-center gap-1 w-fit`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Orders"
        subHeading="Manage and track all customer orders"
        button={
          <>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Filter size={16} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              onClick={fetchOrders}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => navigate.push(`/admin/${adminID}/orders/new`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Plus size={16} />
              Create Order
            </button>
          </>
        }
      />

      {/* Stats */}
      <Stats
        stats={[
          {
            label: "Total Orders",
            value: stats.total,
            icon: <ShoppingCart size={32} />,
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: <Clock size={32} />,
          },
          {
            label: "Paid",
            value: stats.paid,
            icon: <CheckCircle size={32} />,
          },
          {
            label: "Delivered",
            value: stats.delivered,
            icon: <Truck size={32} />,
          },
          {
            label: "Total Revenue",
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: <DollarSign size={32} />,
          },
        ]}
        toShow={5}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      />

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-black font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Search by Order ID
              </label>
              <input
                type="text"
                placeholder="Enter order ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PROCESSING">Processing</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Min Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Max Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg mt-3 shadow-md border border-gray-200 p-12 text-center">
          <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Orders Found
          </h3>
          <p className="text-gray-600 mb-6">
            {Object.values(filters).some((f) => f)
              ? "Try adjusting your filters"
              : "No orders have been placed yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 overflow-hidden">
          <Table
            data={orders}
            columns={[
              {
                header: "Order ID",
                key: "id",
                render: (_, order) => (
                  <span className="font-mono text-sm font-semibold text-black">
                    {order.id.slice(0, 8)}...
                  </span>
                ),
              },
              {
                header: "Customer",
                key: "customer",
                render: (_, order) => (
                  <div>
                    <p className="font-medium text-gray-800">
                      {order.user?.userName || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </div>
                ),
              },
              {
                header: "Status",
                key: "status",
                render: (_, order) => getStatusBadge(order.status),
              },
              {
                header: "Items",
                key: "items",
                render: (_, order) => (
                  <span className="font-semibold">{order.items?.length || 0}</span>
                ),
              },
              {
                header: "Total",
                key: "totalAmount",
                render: (_, order) => (
                  <span className="font-bold text-green-600">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                ),
              },
              {
                header: "Date",
                key: "createdAt",
                render: (_, order) => (
                  <span className="text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </span>
                ),
              },
            ]}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate.push(`/admin/${adminID}/orders/${item.id}`)}
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label={`View order ${item.id}`}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleUpdateOrder(item.id)}
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label={`Edit order ${item.id}`}
                  title="Edit Order"
                >
                  <SquarePen size={16} />
                </button>
              </div>
            )}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.page - 1 &&
                        pageNum <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg ${
                            pagination.page === pageNum
                              ? "bg-black text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === pagination.page - 2 ||
                      pageNum === pagination.page + 2
                    ) {
                      return <span key={pageNum}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Orders;