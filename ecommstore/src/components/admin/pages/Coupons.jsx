"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Edit,
  Trash2,
  X,
  LoaderIcon,
  Plus,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Percent,
  Tag,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import Stats from "@/components/ui/Stats";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalUsage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isToggling, setIsToggling] = useState(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    isActive: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { adminID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchCoupons();
  }, [pagination.page, filters.isActive, filters.search]);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.isActive && { isActive: filters.isActive }),
        ...(filters.search && { search: filters.search }),
      });

      const { data } = await axios.get(
        `${baseUrl}/coupons?${queryParams}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setCoupons(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));

        // Calculate stats
        const totalUsage = data.data.reduce(
          (sum, coupon) => sum + coupon.usedCount,
          0
        );
        const activeCount = data.data.filter((c) => c.isActive && !c.isExpired).length;
        const expiredCount = data.data.filter((c) => c.isExpired).length;

        setStats({
          total: data.pagination.total,
          active: activeCount,
          expired: expiredCount,
          totalUsage,
        });
      }
    } catch (error) {
      console.error("Fetch coupons error:", error);
      toast.error("Failed to fetch coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeletingLoading(true);
      const { data } = await axios.delete(`${baseUrl}/coupons/${id}`, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Coupon deactivated successfully");
        setIsDeleting(null);
        fetchCoupons();
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
      toast.error(error.response?.data?.error || "Failed to delete coupon");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setIsToggling(id);
      const { data } = await axios.patch(
        `${baseUrl}/coupons/${id}/toggle`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        fetchCoupons();
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error(error.response?.data?.error || "Failed to toggle status");
    } finally {
      setIsToggling(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "PERCENT") {
      return `${coupon.discountValue}%`;
    } else {
      return `$${coupon.discountValue}`;
    }
  };

  const getStatusBadge = (coupon) => {
    if (coupon.isExpired) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
          Expired
        </span>
      );
    }
    if (!coupon.isActive) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
          Inactive
        </span>
      );
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
          Limit Reached
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
        Active
      </span>
    );
  };

  const DeleteModal = ({ id }) => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded px-12 py-10 flex flex-col gap-3 items-center">
          <h1 className="text-2xl font-semibold">Deactivate Coupon</h1>
          <p className="text-gray-400">
            Are you sure you want to deactivate this coupon?
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsDeleting(null)}
              className="bg-black text-white px-3 py-2 rounded border hover:bg-white hover:text-black hover:border hover:border-gray-300 flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={() => handleDelete(id)}
              className="flex items-center gap-2 bg-red-500 text-white rounded font-semibold px-3 py-2 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:px-3 hover:py-2"
            >
              {isDeletingLoading ? (
                <LoaderIcon size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Deactivate
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Coupons"
        subHeading="Manage your discount coupons"
        button={
          <>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              onClick={fetchCoupons}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => navigate.push(`/admin/${adminID}/coupons/new`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Coupon
            </button>
          </>
        }
      />

      {/* Stats */}
      <Stats
        stats={[
          {
            label: "Total Coupons",
            value: stats.total,
            icon: <Tag size={32} />,
          },
          {
            label: "Active Coupons",
            value: stats.active,
            icon: <ToggleRight size={32} />,
          },
          {
            label: "Expired Coupons",
            value: stats.expired,
            icon: <Calendar size={32} />,
          },
          {
            label: "Total Usage",
            value: stats.totalUsage,
            icon: <TrendingUp size={32} />,
          },
        ]}
        toShow={4}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      />

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Search by Code
              </label>
              <input
                type="text"
                placeholder="Enter coupon code..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All Coupons</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleting && <DeleteModal id={isDeleting} />}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon size={48} className="animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-600">Loading coupons...</p>
          </div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-lg mt-3 shadow-md border border-gray-200 p-12 text-center">
          <Tag size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Coupons Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.isActive
              ? "Try adjusting your filters"
              : "Get started by creating your first coupon"}
          </p>
          <button
            onClick={() => navigate.push(`/admin/${adminID}/coupons/new`)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 overflow-hidden">
          <Table
            data={coupons}
            columns={[
              {
                header: "Code",
                key: "code",
                render: (_, coupon) => (
                  <span className="font-mono font-semibold text-black">
                    {coupon.code}
                  </span>
                ),
              },
              {
                header: "Discount",
                key: "discount",
                render: (_, coupon) => (
                  <div className="flex items-center gap-2">
                    {coupon.discountType === "PERCENT" ? (
                      <Percent size={14} className="text-gray-500" />
                    ) : (
                      <DollarSign size={14} className="text-gray-500" />
                    )}
                    <span className="font-semibold">{formatDiscount(coupon)}</span>
                    <span className="text-xs text-gray-500 uppercase">
                      {coupon.discountType}
                    </span>
                  </div>
                ),
              },
              {
                header: "Status",
                key: "status",
                render: (_, coupon) => getStatusBadge(coupon),
              },
              {
                header: "Usage",
                key: "usage",
                render: (_, coupon) => (
                  <div>
                    <div className="font-semibold">
                      {coupon.usedCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </div>
                    {coupon.usagePercentage !== null && (
                      <div className="text-xs text-gray-500">
                        {coupon.usagePercentage}% used
                      </div>
                    )}
                  </div>
                ),
              },
              {
                header: "Expires",
                key: "expiresAt",
                render: (_, coupon) => (
                  <div>
                    <div className="font-medium">{formatDate(coupon.expiresAt)}</div>
                    {coupon.isExpired && (
                      <div className="text-xs text-red-500">Expired</div>
                    )}
                  </div>
                ),
              },
              {
                header: "Created",
                key: "createdAt",
                render: (_, coupon) => (
                  <span className="text-sm text-gray-600">
                    {formatDate(coupon.createdAt)}
                  </span>
                ),
              },
            ]}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  disabled={isToggling === item.id}
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200 disabled:opacity-50"
                  aria-label={`Toggle ${item.code} status`}
                  title={item.isActive ? "Deactivate" : "Activate"}
                >
                  {isToggling === item.id ? (
                    <LoaderIcon size={16} className="animate-spin" />
                  ) : item.isActive ? (
                    <ToggleRight size={16} />
                  ) : (
                    <ToggleLeft size={16} />
                  )}
                </button>
                <button
                  onClick={() =>
                    navigate.push(`/admin/${adminID}/coupons/${item.id}`)
                  }
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label={`Edit ${item.code}`}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setIsDeleting(item.id)}
                  className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors duration-200"
                  aria-label={`Delete ${item.code}`}
                >
                  <Trash2 size={16} />
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
                {pagination.total} coupons
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
                    // Show first page, last page, current page, and pages around current
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

export default Coupons;