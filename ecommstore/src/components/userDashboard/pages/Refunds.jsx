"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  DollarSign,
  X,
  LoaderIcon,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const MyRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
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
    fetchRefunds();
  }, [pagination.page, statusFilter]);

  const fetchRefunds = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter }),
      });

      const { data } = await axios.get(
        `${baseUrl}/retruns-refunds/my-refunds?${queryParams}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setRefunds(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("Fetch refunds error:", error);
      toast.error("Failed to fetch your refunds");
    } finally {
      setIsLoading(false);
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
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: <Clock size={14} />,
        label: "Pending",
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
      PROCESSED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: <DollarSign size={14} />,
        label: "Processed",
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

  const getStatusMessage = (status) => {
    const messages = {
      PENDING:
        "Your refund request is being reviewed. We'll process it as soon as possible.",
      APPROVED:
        "Your refund has been approved and will be processed shortly.",
      REJECTED:
        "Your refund request has been rejected. Please contact support for more information.",
      PROCESSED:
        "Your refund has been processed. The amount should appear in your account within 5-7 business days.",
    };
    return messages[status] || "";
  };

  const getEstimatedTime = (status) => {
    if (status === "PROCESSED") {
      return "Funds should appear in 5-7 business days";
    }
    if (status === "APPROVED") {
      return "Processing within 2-3 business days";
    }
    if (status === "PENDING") {
      return "Review within 1-2 business days";
    }
    return null;
  };

  const DetailModal = ({ refund }) => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center overflow-y-auto p-4">
        <div className="bg-white border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Refund Details</h2>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedRefund(null);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Info */}
            <div className="bg-linear-to-r from-blue-50 to-green-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold mb-2">Refund Status</h3>
                  {getStatusBadge(refund.status)}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ${refund.amount}
                  </p>
                  <p className="text-xs text-gray-600">Refund Amount</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-3">
                {getStatusMessage(refund.status)}
              </p>
              {getEstimatedTime(refund.status) && (
                <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded">
                  <Clock size={14} />
                  {getEstimatedTime(refund.status)}
                </div>
              )}
            </div>

            {/* Refund Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign size={18} />
                Refund Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Refund ID:</span>
                    <p className="font-medium font-mono">
                      {refund.id.slice(0, 12)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <p className="font-medium font-mono">
                      {refund.order.id.slice(0, 12)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Order Total:</span>
                    <p className="font-medium">${refund.order.totalAmount}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Refund Amount:</span>
                    <p className="font-semibold text-green-600">
                      ${refund.amount}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Reason:</span>
                  <p className="font-medium mt-1 bg-white p-3 rounded border">
                    {refund.reason}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p className="font-medium">{formatDate(refund.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard size={18} />
                Payment Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <p className="font-medium uppercase">
                      {refund.payment.provider}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Transaction ID:</span>
                    <p className="font-medium font-mono text-xs">
                      {refund.payment.transactionId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                Need Help?
              </h4>
              <p className="text-sm text-blue-700">
                If you have any questions about this refund, please contact our
                customer support team. Have your refund ID ready for faster
                assistance.
              </p>
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900">My Refunds</h1>
            <p className="text-gray-600 mt-1">
              Track the status of your refunds
            </p>
          </div>
          <button
            onClick={fetchRefunds}
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
            <option value="">All Refunds</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PROCESSED">Processed</option>
          </select>
        </div>
      </div>

      {/* Modal */}
      {showDetailModal && selectedRefund && (
        <DetailModal refund={selectedRefund} />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading your refunds...</p>
          </div>
        </div>
      ) : refunds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <DollarSign size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            No Refunds
          </h3>
          <p className="text-gray-600 mb-6">
            {statusFilter
              ? `You don't have any ${statusFilter.toLowerCase()} refunds`
              : "You don't have any refunds yet"}
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
          {/* Refunds List */}
          <div className="space-y-4">
            {refunds.map((refund) => (
              <div
                key={refund.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        Refund #{refund.id.slice(0, 8)}
                      </h3>
                      {getStatusBadge(refund.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Order #{refund.order.id.slice(0, 8)} • Order Total: $
                      {refund.order.totalAmount}
                    </p>
                    <p className="text-sm text-gray-600">
                      Created {formatDate(refund.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Refund Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${refund.amount}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRefund(refund);
                        setShowDetailModal(true);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard size={16} />
                      <span>Payment Method:</span>
                      <span className="font-medium uppercase">
                        {refund.payment.provider}
                      </span>
                    </div>
                    {getEstimatedTime(refund.status) && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Clock size={14} />
                        {getEstimatedTime(refund.status)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reason:</span> {refund.reason}
                  </p>
                </div>

                {/* Status Message */}
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    {getStatusMessage(refund.status)}
                  </p>
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
                of {pagination.total} refunds
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

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <TrendingUp size={20} />
          Refund Timeline
        </h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
            <p>
              <strong>Pending:</strong> Your refund request is being reviewed
              (1-2 business days)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
            <p>
              <strong>Approved:</strong> Refund approved and will be processed
              shortly (2-3 business days)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
            <p>
              <strong>Processed:</strong> Money has been sent to your account
              (5-7 business days to appear)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRefunds;