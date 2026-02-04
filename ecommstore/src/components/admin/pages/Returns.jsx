"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Package,
  X,
  LoaderIcon,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  ShoppingBag,
  TrendingUp,
  Eye,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import Stats from "@/components/ui/Stats";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    requested: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    userId: "",
    orderId: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { adminID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchReturns();
  }, [pagination.page, filters]);

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.orderId && { orderId: filters.orderId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const { data } = await axios.get(
        `${baseUrl}/retruns-refunds/returns?${queryParams}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setReturns(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));

        // Set stats from backend
        setStats({
          total: data.pagination.total,
          requested: data.stats.REQUESTED || 0,
          approved: data.stats.APPROVED || 0,
          rejected: data.stats.REJECTED || 0,
          received: data.stats.RECEIVED || 0,
        });
      }
    } catch (error) {
      console.error("Fetch returns error:", error);
      toast.error("Failed to fetch return requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (returnId, status, notes) => {
    try {
      setIsProcessing(returnId);
      const { data } = await axios.patch(
        `${baseUrl}/retruns-refunds/returns/${returnId}/status`,
        {
          status,
          adminNotes: notes,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setShowActionModal(false);
        setAdminNotes("");
        setSelectedReturn(null);
        fetchReturns();
      }
    } catch (error) {
      console.error("Update return status error:", error);
      toast.error(error.response?.data?.error || "Failed to update status");
    } finally {
      setIsProcessing(null);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      REQUESTED: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Requested",
      },
      APPROVED: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Approved",
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Rejected",
      },
      RECEIVED: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Received",
      },
    };

    const config = statusConfig[status] || statusConfig.REQUESTED;
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const DetailModal = ({ returnRequest }) => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center overflow-y-auto p-4">
        <div className="bg-white border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Return Request Details</h2>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedReturn(null);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User size={18} />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{returnRequest.user.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{returnRequest.user.email}</p>
                </div>
              </div>
            </div>

            {/* Return Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package size={18} />
                Return Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Order ID:</span>
                  <p className="font-medium font-mono">
                    {returnRequest.order.id}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="mt-1">{getStatusBadge(returnRequest.status)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Reason:</span>
                  <p className="font-medium mt-1 bg-white p-3 rounded border">
                    {returnRequest.reason}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="font-medium">
                      {formatDate(returnRequest.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <p className="font-medium">
                      {formatDate(returnRequest.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShoppingBag size={18} />
                Order Items
              </h3>
              <div className="space-y-2">
                {returnRequest.order.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded border flex items-center gap-3"
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="bg-white p-3 rounded border flex justify-between items-center font-semibold text-lg">
                  <span>Total Amount:</span>
                  <span>${returnRequest.order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {returnRequest.status === "REQUESTED" && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setActionType("APPROVED");
                    setShowActionModal(true);
                  }}
                  className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  Approve Return
                </button>
                <button
                  onClick={() => {
                    setActionType("REJECTED");
                    setShowActionModal(true);
                  }}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Reject Return
                </button>
              </div>
            )}
            {returnRequest.status === "APPROVED" && (
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setActionType("RECEIVED");
                    setShowActionModal(true);
                  }}
                  className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Mark as Received
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ActionModal = () => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white border rounded-lg px-8 py-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">
            {actionType === "APPROVED"
              ? "Approve Return"
              : actionType === "REJECTED"
              ? "Reject Return"
              : "Mark as Received"}
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes {actionType === "REJECTED" && "(Required)"}
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this action..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
              rows="4"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowActionModal(false);
                setAdminNotes("");
                setActionType(null);
              }}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleUpdateStatus(selectedReturn.id, actionType, adminNotes)
              }
              disabled={
                isProcessing ||
                (actionType === "REJECTED" && !adminNotes.trim())
              }
              className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <LoaderIcon size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
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
        text="Return Requests"
        subHeading="Manage customer return requests"
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
              onClick={fetchReturns}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() =>
                navigate.push(`/admin/${adminID}/returns/statistics`)
              }
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Statistics
            </button>
          </>
        }
      />

      {/* Stats */}
      <Stats
        stats={[
          {
            label: "Total Returns",
            value: stats.total,
            icon: <Package size={32} />,
          },
          {
            label: "Requested",
            value: stats.requested,
            icon: <Clock size={32} />,
          },
          {
            label: "Approved",
            value: stats.approved,
            icon: <CheckCircle size={32} />,
          },
          {
            label: "Rejected",
            value: stats.rejected,
            icon: <XCircle size={32} />,
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
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All Status</option>
                <option value="REQUESTED">Requested</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="RECEIVED">Received</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                placeholder="Enter order ID..."
                value={filters.orderId}
                onChange={(e) => handleFilterChange("orderId", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                placeholder="Enter user ID..."
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedReturn && (
        <DetailModal returnRequest={selectedReturn} />
      )}
      {showActionModal && <ActionModal />}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading return requests...</p>
          </div>
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white rounded-lg mt-3 shadow-md border border-gray-200 p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Return Requests Found
          </h3>
          <p className="text-gray-600">
            {Object.values(filters).some((f) => f)
              ? "Try adjusting your filters"
              : "No return requests have been submitted yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 overflow-hidden">
          <Table
            data={returns}
            columns={[
              {
                header: "Return ID",
                key: "id",
                render: (_, ret) => (
                  <span className="font-mono text-sm">{ret.id.slice(0, 8)}</span>
                ),
              },
              {
                header: "Order ID",
                key: "orderId",
                render: (_, ret) => (
                  <span className="font-mono text-sm">
                    {ret.order.id.slice(0, 8)}
                  </span>
                ),
              },
              {
                header: "Customer",
                key: "user",
                render: (_, ret) => (
                  <div>
                    <p className="font-medium">{ret.user.name}</p>
                    <p className="text-xs text-gray-500">{ret.user.email}</p>
                  </div>
                ),
              },
              {
                header: "Amount",
                key: "totalAmount",
                render: (_, ret) => (
                  <span className="font-semibold">
                    ${ret.order.totalAmount}
                  </span>
                ),
              },
              {
                header: "Status",
                key: "status",
                render: (_, ret) => getStatusBadge(ret.status),
              },
              {
                header: "Created",
                key: "createdAt",
                render: (_, ret) => (
                  <span className="text-sm text-gray-600">
                    {formatDate(ret.createdAt)}
                  </span>
                ),
              },
            ]}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedReturn(item);
                    setShowDetailModal(true);
                  }}
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label="View details"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                {item.status === "REQUESTED" && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedReturn(item);
                        setActionType("APPROVED");
                        setShowActionModal(true);
                      }}
                      className="p-2 hover:bg-green-500 hover:text-white rounded transition-colors duration-200"
                      aria-label="Approve"
                      title="Approve"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReturn(item);
                        setActionType("REJECTED");
                        setShowActionModal(true);
                      }}
                      className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors duration-200"
                      aria-label="Reject"
                      title="Reject"
                    >
                      <XCircle size={16} />
                    </button>
                  </>
                )}
                {item.status === "APPROVED" && (
                  <button
                    onClick={() => {
                      setSelectedReturn(item);
                      setActionType("RECEIVED");
                      setShowActionModal(true);
                    }}
                    className="p-2 hover:bg-blue-500 hover:text-white rounded transition-colors duration-200"
                    aria-label="Mark as Received"
                    title="Mark as Received"
                  >
                    <Package size={16} />
                  </button>
                )}
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
                of {pagination.total} returns
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

export default Returns;