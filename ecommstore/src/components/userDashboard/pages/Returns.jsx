"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Package,
  X,
  LoaderIcon,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const MyReturns = () => {
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState("");
  const {id} = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchReturns();
  }, [pagination.page, statusFilter]);

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter }),
      });

      const { data } = await axios.get(
        `${baseUrl}/retruns-refunds/my-returns?${queryParams}`,
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
      }
    } catch (error) {
      console.error("Fetch returns error:", error);
      toast.error("Failed to fetch your return requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReturn = async (returnId) => {
    try {
      setIsCancelling(returnId);
      const { data } = await axios.patch(
        `${baseUrl}/retruns-refunds/${returnId}/cancel`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setShowCancelModal(false);
        setSelectedReturn(null);
        fetchReturns();
      }
    } catch (error) {
      console.error("Cancel return error:", error);
      toast.error(error.response?.data?.error || "Failed to cancel return");
    } finally {
      setIsCancelling(null);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        icon: <Clock size={14} />,
        label: "Requested",
      },
      APPROVED: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: <CheckCircle size={14} />,
        label: "Approved",
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: <XCircle size={14} />,
        label: "Rejected",
      },
      RECEIVED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: <Package size={14} />,
        label: "Received",
      },
    };

    const config = statusConfig[status] || statusConfig.REQUESTED;
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} flex items-center gap-1 w-fit`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getStatusMessage = (status) => {
    const messages = {
      REQUESTED:
        "Your return request is under review. We'll notify you once it's approved.",
      APPROVED:
        "Your return has been approved! Please ship the items back to us.",
      REJECTED: "Your return request has been rejected. Please contact support for more information.",
      RECEIVED:
        "We've received your returned items. Your refund is being processed.",
    };
    return messages[status] || "";
  };

  const DetailModal = ({ returnRequest }) => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center overflow-y-auto p-4">
        <div className="bg-white border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
            {/* Status Info */}
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold mb-1">Status</h3>
                  {getStatusBadge(returnRequest.status)}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {getStatusMessage(returnRequest.status)}
              </p>
            </div>

            {/* Return Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText size={18} />
                Return Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Return ID:</span>
                    <p className="font-medium font-mono">
                      {returnRequest.id.slice(0, 12)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <p className="font-medium font-mono">
                      {returnRequest.order.id.slice(0, 12)}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Reason for Return:</span>
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
                <Package size={18} />
                Items to Return
              </h3>
              <div className="space-y-2">
                {returnRequest.order.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded border flex items-center gap-4"
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: ${item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="bg-white p-4 rounded border flex justify-between items-center font-semibold text-lg border-t-2 border-gray-300">
                  <span>Total Amount:</span>
                  <span className="text-green-600">
                    ${returnRequest.order.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {returnRequest.status === "REQUESTED" && (
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowCancelModal(true);
                  }}
                  className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Ban size={18} />
                  Cancel Return Request
                </button>
              </div>
            )}

            {returnRequest.status === "APPROVED" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Next Steps
                </h4>
                <p className="text-sm text-blue-700">
                  Your return has been approved. Please package the items
                  securely and ship them to our returns address. Once we receive
                  and inspect the items, we'll process your refund.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CancelModal = () => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white border rounded-lg px-8 py-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Cancel Return Request</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to cancel this return request? This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setSelectedReturn(null);
              }}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Keep Request
            </button>
            <button
              onClick={() => handleCancelReturn(selectedReturn.id)}
              disabled={isCancelling}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCancelling ? (
                <>
                  <LoaderIcon size={16} className="animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Request"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Returns</h1>
            <p className="text-gray-600 mt-1">
              View and manage your return requests
            </p>
          </div>
          <button
            onClick={fetchReturns}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
          >
            <option value="">All Returns</option>
            <option value="REQUESTED">Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="RECEIVED">Received</option>
          </select>
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedReturn && (
        <DetailModal returnRequest={selectedReturn} />
      )}
      {showCancelModal && selectedReturn && <CancelModal />}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading your returns...</p>
          </div>
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <Package size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            No Return Requests
          </h3>
          <p className="text-gray-600 mb-6">
            {statusFilter
              ? `You don't have any ${statusFilter.toLowerCase()} return requests`
              : "You haven't submitted any return requests yet"}
          </p>
          <button
            onClick={() => navigate.push(`/user/${id}/orders`)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            View Your Orders
          </button>
        </div>
      ) : (
        <>
          {/* Returns List */}
          <div className="space-y-4">
            {returns.map((returnRequest) => (
              <div
                key={returnRequest.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        Return #{returnRequest.id.slice(0, 8)}
                      </h3>
                      {getStatusBadge(returnRequest.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Order #{returnRequest.order.id.slice(0, 8)} •{" "}
                      {formatDate(returnRequest.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedReturn(returnRequest);
                        setShowDetailModal(true);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    {returnRequest.status === "REQUESTED" && (
                      <button
                        onClick={() => {
                          setSelectedReturn(returnRequest);
                          setShowCancelModal(true);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <Ban size={16} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Items Preview */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Items ({returnRequest.order.items.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {returnRequest.order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                      >
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {returnRequest.order.items.length > 3 && (
                      <div className="flex items-center justify-center bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                        +{returnRequest.order.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reason:</span>{" "}
                    {returnRequest.reason}
                  </p>
                </div>

                {/* Total */}
                <div className="border-t pt-4 mt-4 flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    Return Amount:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    ${returnRequest.order.totalAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg p-4">
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
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          className={`px-3 py-2 rounded-lg transition-colors ${
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
                      return (
                        <span key={pageNum} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyReturns;