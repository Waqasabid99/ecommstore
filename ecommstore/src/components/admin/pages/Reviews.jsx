"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Star,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  User,
  Package,
  Calendar,
  X,
  LoaderIcon,
  BarChart3,
  AlertCircle,
  CheckSquare,
  Square,
  ChevronDown,
  RefreshCw,
  Eye,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const AdminReviews = () => {
  const { adminID } = useParams();
  const navigate = useRouter();

  // State management
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    minRating: "",
    maxRating: "",
    productId: "",
    userId: "",
    startDate: "",
    endDate: "",
  });

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, [page, filters]);

  // Fetch stats
  useEffect(() => {
    if (showStats) {
      fetchStats();
    }
  }, [showStats]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };

      const { data } = await axios.get(`${baseUrl}/reviews/admin/all`, {
        params,
        withCredentials: true,
      });

      if (data.success) {
        setReviews(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
      toast.error(error.response?.data?.error || "Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/reviews/admin/stats`, {
        params: { period: "30d" },
        withCredentials: true,
      });

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      setIsDeleting(id);
      const { data } = await axios.delete(`${baseUrl}/reviews/admin/${id}`, {
        data: { reason: "Admin moderation" },
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Review deleted successfully");
        fetchReviews();
        if (showStats) fetchStats();
      }
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error(error.response?.data?.error || "Failed to delete review");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      toast.error("No reviews selected");
      return;
    }

    if (!confirm(`Delete ${selectedReviews.length} selected reviews?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.delete(`${baseUrl}/reviews/admin/bulk`, {
        data: { ids: selectedReviews },
        withCredentials: true,
      });

      if (data.success) {
        toast.success(data.message);
        setSelectedReviews([]);
        fetchReviews();
        if (showStats) fetchStats();
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error(error.response?.data?.error || "Failed to delete reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map((r) => r.id));
    }
  };

  const handleSelectReview = (id) => {
    if (selectedReviews.includes(id)) {
      setSelectedReviews(selectedReviews.filter((rid) => rid !== id));
    } else {
      setSelectedReviews([...selectedReviews, id]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      minRating: "",
      maxRating: "",
      productId: "",
      userId: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  const DeleteModal = ({ id }) => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded-xl px-12 py-10 flex flex-col gap-3 items-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold">Delete Review</h1>
          <p className="text-gray-500 text-center">
            Are you sure you want to delete this review? This action cannot be
            undone.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setIsDeleting(null)}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-200 flex items-center gap-2 font-medium"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={() => handleDeleteReview(id)}
              className="flex items-center gap-2 bg-red-500 text-white rounded-lg font-semibold px-4 py-2 border border-transparent hover:bg-red-600"
            >
              <Trash2 size={16} />
              Delete Review
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="min-h-screen bg-[#F8F8F8]">
      <ToastContainer />

      <DashboardHeadingBox
        text="Reviews Management"
        subHeading={`Manage customer reviews and ratings${
          total ? ` • ${total} total reviews` : ""
        }`}
        button={
          <>
            <button
              onClick={() => {
                fetchReviews();
                if (showStats) fetchStats();
              }}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Filter size={16} />
              {showFilters ? "Hide" : "Show"} Filters
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <BarChart3 size={16} />
              {showStats ? "Hide" : "Show"} Stats
            </button>
          </>
        }
      />

      {isDeleting && <DeleteModal id={isDeleting} />}

      {/* Statistics Section */}
      {showStats && stats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Overall Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MessageSquare size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.overall.total}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total Reviews</div>
            <div className="mt-2 flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {stats.overall.averageRating} avg
              </span>
            </div>
          </div>

          {/* Period Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp size={20} className="text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.period.total}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Last {stats.period.days} Days
            </div>
            <div className="mt-2 flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {stats.period.averageRating} avg
              </span>
            </div>
          </div>

          {/* Recent 24h */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar size={20} className="text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.recent24h}
            </div>
            <div className="text-sm text-gray-500 mt-1">Last 24 Hours</div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <BarChart3 size={20} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">
                Rating Distribution
              </h3>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage =
                  stats.overall.total > 0
                    ? (count / stats.overall.total) * 100
                    : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium text-gray-700">
                        {rating}
                      </span>
                      <Star
                        size={12}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {showStats && stats?.topProducts && stats.topProducts.length > 0 && (
        <div className="mb-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} />
            Top Reviewed Products (Last {stats.period.days} Days)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.topProducts.map((product, index) => (
              <div
                key={product.productId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star
                        size={12}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {product.averageRating}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {product.reviewCount} reviews
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className="mb-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Filter size={18} />
              Filter Reviews
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by user, product, or comment..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange("minRating", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}+ Stars
                  </option>
                ))}
              </select>
            </div>

            {/* Max Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Rating
              </label>
              <select
                value={filters.maxRating}
                onChange={(e) => handleFilterChange("maxRating", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Stars
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare size={20} className="text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedReviews.length} review{selectedReviews.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 bg-red-500 text-white rounded-lg font-semibold px-4 py-2 hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoaderIcon size={32} className="animate-spin text-gray-400" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Reviews Found
            </h3>
            <p className="text-gray-500">
              {Object.values(filters).some((v) => v !== "")
                ? "Try adjusting your filters"
                : "No reviews have been submitted yet"}
            </p>
          </div>
        ) : (
          <>
            <Table
              data={reviews}
              columns={[
                {
                  header: () => (
                    <button
                      onClick={handleSelectAll}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {selectedReviews.length === reviews.length ? (
                        <CheckSquare size={18} className="text-black" />
                      ) : (
                        <Square size={18} className="text-gray-400" />
                      )}
                    </button>
                  ),
                  key: "select",
                  render: (_, review) => (
                    <button
                      onClick={() => handleSelectReview(review.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {selectedReviews.includes(review.id) ? (
                        <CheckSquare size={18} className="text-black" />
                      ) : (
                        <Square size={18} className="text-gray-400" />
                      )}
                    </button>
                  ),
                },
                {
                  header: "Product",
                  key: "product",
                  render: (_, review) => (
                    <div className="flex items-center gap-3">
                      {review.product.thumbnail ? (
                        <img
                          src={review.product.thumbnail}
                          alt={review.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.product.slug}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Customer",
                  key: "user",
                  render: (_, review) => (
                    <div>
                      <div className="font-medium text-gray-900">
                        {review.user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {review.user.email}
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Rating",
                  key: "rating",
                  render: (_, review) => (
                    <div className="flex items-center gap-2">
                      {getRatingStars(review.rating)}
                      <span className="text-sm font-medium text-gray-700">
                        {review.rating}/5
                      </span>
                    </div>
                  ),
                },
                {
                  header: "Comment",
                  key: "comment",
                  render: (_, review) =>
                    review.comment ? (
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {review.comment}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        No comment
                      </span>
                    ),
                },
                {
                  header: "Date",
                  key: "createdAt",
                  render: (_, review) => (
                    <div className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  ),
                },
              ]}
              actions={(review) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsDeleting(review.id)}
                    disabled={isDeleting === review.id}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                    title="Delete review"
                  >
                    {isDeleting === review.id ? (
                      <LoaderIcon size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              )}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} reviews
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            page === pageNum
                              ? "bg-black text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AdminReviews;