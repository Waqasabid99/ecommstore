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
  Package,
  Layers,
  ShoppingCart,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import Stats from "@/components/ui/Stats";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
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
    appliesTo: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { adminID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchPromotions();
  }, [pagination.page, filters.isActive, filters.appliesTo, filters.search]);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.isActive && { isActive: filters.isActive }),
        ...(filters.appliesTo && { appliesTo: filters.appliesTo }),
        ...(filters.search && { search: filters.search }),
      });

      const { data } = await axios.get(
        `${baseUrl}/promotions?${queryParams}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setPromotions(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));

        // Calculate stats
        const now = new Date();
        const activeCount = data.data.filter(
          (p) => p.isActive && p.status === "ACTIVE"
        ).length;
        const scheduledCount = data.data.filter(
          (p) => p.status === "SCHEDULED"
        ).length;
        const expiredCount = data.data.filter(
          (p) => p.status === "EXPIRED"
        ).length;

        setStats({
          total: data.pagination.total,
          active: activeCount,
          scheduled: scheduledCount,
          expired: expiredCount,
        });
      }
    } catch (error) {
      console.error("Fetch promotions error:", error);
      toast.error("Failed to fetch promotions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeletingLoading(true);
      const { data } = await axios.delete(`${baseUrl}/promotions/${id}`, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Promotion deactivated successfully");
        setIsDeleting(null);
        fetchPromotions();
      }
    } catch (error) {
      console.error("Delete promotion error:", error);
      toast.error(error.response?.data?.error || "Failed to delete promotion");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setIsToggling(id);
      const { data } = await axios.patch(
        `${baseUrl}/promotions/${id}/toggle`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        fetchPromotions();
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
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDiscount = (promotion) => {
    if (promotion.discountType === "PERCENT") {
      return `${promotion.discountValue}%`;
    } else {
      return `$${Number(promotion.discountValue).toFixed(2)}`;
    }
  };

  const getStatusBadge = (promotion) => {
    const status = promotion.status || "UNKNOWN";
    
    const badges = {
      ACTIVE: (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
          <CheckCircle size={12} />
          Active
        </span>
      ),
      SCHEDULED: (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
          <Clock size={12} />
          Scheduled
        </span>
      ),
      EXPIRED: (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 flex items-center gap-1 w-fit">
          <XCircle size={12} />
          Expired
        </span>
      ),
      INACTIVE: (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1 w-fit">
          <XCircle size={12} />
          Inactive
        </span>
      ),
    };

    return badges[status] || badges.INACTIVE;
  };

  const getAppliesToBadge = (appliesTo) => {
    const badges = {
      PRODUCT: (
        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700 flex items-center gap-1 w-fit">
          <Package size={12} />
          Product
        </span>
      ),
      VARIANT: (
        <span className="px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-700 flex items-center gap-1 w-fit">
          <Layers size={12} />
          Variant
        </span>
      ),
      CATEGORY: (
        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-700 flex items-center gap-1 w-fit">
          <Tag size={12} />
          Category
        </span>
      ),
      CART: (
        <span className="px-2 py-1 text-xs font-medium rounded bg-teal-100 text-teal-700 flex items-center gap-1 w-fit">
          <ShoppingCart size={12} />
          Cart
        </span>
      ),
    };

    return badges[appliesTo] || null;
  };

  const DeleteModal = ({ id, promotion }) => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded-lg px-12 py-10 flex flex-col gap-3 items-center max-w-md">
          <h1 className="text-2xl font-semibold">Deactivate Promotion</h1>
          <p className="text-gray-600 text-center">
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-black">{promotion?.name}</span>?
            This will stop the promotion from being applied.
          </p>
          <div className="flex items-center gap-5 mt-4">
            <button
              onClick={() => setIsDeleting(null)}
              className="bg-black text-white px-4 py-2 rounded border hover:bg-white hover:text-black hover:border hover:border-gray-300 flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={() => handleDelete(id)}
              className="flex items-center gap-2 bg-red-500 text-white rounded font-semibold px-4 py-2 border border-transparent hover:text-white hover:bg-red-600"
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
        text="Promotions"
        subHeading="Manage product and cart promotions"
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
              onClick={fetchPromotions}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => navigate.push(`/admin/${adminID}/promotions/new`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Promotion
            </button>
          </>
        }
      />

      {/* Stats */}
      <Stats
        stats={[
          {
            label: "Total Promotions",
            value: stats.total,
            icon: <Tag size={32} />,
          },
          {
            label: "Active Promotions",
            value: stats.active,
            icon: <CheckCircle size={32} />,
          },
          {
            label: "Scheduled",
            value: stats.scheduled,
            icon: <Clock size={32} />,
          },
          {
            label: "Expired",
            value: stats.expired,
            icon: <Calendar size={32} />,
          },
        ]}
        toShow={4}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      />

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Search by Name
              </label>
              <input
                type="text"
                placeholder="Enter promotion name..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applies To
              </label>
              <select
                value={filters.appliesTo}
                onChange={(e) =>
                  handleFilterChange("appliesTo", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All Types</option>
                <option value="PRODUCT">Product</option>
                <option value="VARIANT">Variant</option>
                <option value="CATEGORY">Category</option>
                <option value="CART">Cart</option>
              </select>
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
                <option value="">All Promotions</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleting && (
        <DeleteModal
          id={isDeleting}
          promotion={promotions.find((p) => p.id === isDeleting)}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading promotions...</p>
          </div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-lg mt-3 shadow-md border border-gray-200 p-12 text-center">
          <Tag size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Promotions Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.isActive || filters.appliesTo
              ? "Try adjusting your filters"
              : "Get started by creating your first promotion"}
          </p>
          <button
            onClick={() => navigate.push(`/admin/${adminID}/promotions/new`)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Promotion
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 overflow-hidden">
          <Table
            data={promotions}
            columns={[
              {
                header: "Name",
                key: "name",
                render: (_, promotion) => (
                  <div>
                    <div className="font-semibold text-black">
                      {promotion.name}
                    </div>
                    {promotion.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {promotion.description}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                header: "Discount",
                key: "discount",
                render: (_, promotion) => (
                  <div className="flex items-center gap-2">
                    {promotion.discountType === "PERCENT" ? (
                      <Percent size={14} className="text-gray-500" />
                    ) : (
                      <DollarSign size={14} className="text-gray-500" />
                    )}
                    <span className="font-semibold">
                      {formatDiscount(promotion)}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">
                      {promotion.discountType}
                    </span>
                  </div>
                ),
              },
              {
                header: "Applies To",
                key: "appliesTo",
                render: (_, promotion) => getAppliesToBadge(promotion.appliesTo),
              },
              {
                header: "Status",
                key: "status",
                render: (_, promotion) => getStatusBadge(promotion),
              },
              {
                header: "Affected Items",
                key: "affectedCount",
                render: (_, promotion) => (
                  <div className="text-sm">
                    {promotion.affectedCount ? (
                      <div>
                        {promotion.appliesTo === "PRODUCT" && (
                          <span>
                            {promotion.affectedCount.products} product
                            {promotion.affectedCount.products !== 1 ? "s" : ""}
                          </span>
                        )}
                        {promotion.appliesTo === "VARIANT" && (
                          <span>
                            {promotion.affectedCount.variants} variant
                            {promotion.affectedCount.variants !== 1 ? "s" : ""}
                          </span>
                        )}
                        {promotion.appliesTo === "CATEGORY" && (
                          <span>
                            {promotion.affectedCount.categories} categor
                            {promotion.affectedCount.categories !== 1
                              ? "ies"
                              : "y"}
                          </span>
                        )}
                        {promotion.appliesTo === "CART" && (
                          <span className="text-gray-500">Site-wide</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                ),
              },
              {
                header: "Period",
                key: "period",
                render: (_, promotion) => (
                  <div className="text-sm">
                    <div className="text-gray-600">
                      {formatDate(promotion.startsAt)}
                    </div>
                    <div className="text-gray-400 text-xs">to</div>
                    <div className="text-gray-600">
                      {formatDate(promotion.endsAt)}
                    </div>
                  </div>
                ),
              },
              {
                header: "Stackable",
                key: "isStackable",
                render: (_, promotion) => (
                  <div className="text-center">
                    {promotion.isStackable ? (
                      <CheckCircle size={16} className="text-green-600 mx-auto" />
                    ) : (
                      <XCircle size={16} className="text-gray-400 mx-auto" />
                    )}
                  </div>
                ),
              },
            ]}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  disabled={isToggling === item.id}
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200 disabled:opacity-50"
                  aria-label={`Toggle ${item.name} status`}
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
                    navigate.push(`/admin/${adminID}/promotions/${item.id}`)
                  }
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label={`View ${item.name}`}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() =>
                    navigate.push(`/admin/${adminID}/promotions/${item.id}/edit`)
                  }
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label={`Edit ${item.name}`}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setIsDeleting(item.id)}
                  className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors duration-200"
                  aria-label={`Delete ${item.name}`}
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
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} promotions
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

export default Promotions;