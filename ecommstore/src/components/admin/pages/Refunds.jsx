"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  DollarSign,
  X,
  LoaderIcon,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  User,
  TrendingUp,
  Eye,
  Plus,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import Stats from "@/components/ui/Stats";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

// Extracted Modal Components

const DetailModal = ({ refund, onClose, setActionType, setShowActionModal }) => {
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
        label: "Pending",
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
      PROCESSED: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Processed",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Refund Details</h2>
          <button
            onClick={onClose}
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
                <p className="font-medium">{refund.order.user.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{refund.order.user.email}</p>
              </div>
            </div>
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
                  <span className="text-gray-600">Order ID:</span>
                  <p className="font-medium font-mono">{refund.order.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Order Total:</span>
                  <p className="font-medium">${refund.order.totalAmount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Refund Amount:</span>
                  <p className="font-semibold text-lg text-green-600">
                    ${refund.amount}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="mt-1">{getStatusBadge(refund.status)}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Reason:</span>
                <p className="font-medium mt-1 bg-white p-3 rounded border">
                  {refund.reason}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p className="font-medium">{formatDate(refund.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard size={18} />
              Payment Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Provider:</span>
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
              <div>
                <span className="text-gray-600">Payment Status:</span>
                <p className="font-medium">{refund.payment.status}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {refund.status === "PENDING" && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setActionType("APPROVE");
                  setShowActionModal(true);
                }}
                className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Approve Refund
              </button>
              <button
                onClick={() => {
                  setActionType("REJECT");
                  setShowActionModal(true);
                }}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Reject Refund
              </button>
            </div>
          )}
          {refund.status === "APPROVED" && (
            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  setActionType("PROCESS");
                  setShowActionModal(true);
                }}
                className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Process Refund
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionModal = ({
  actionType,
  selectedRefund,
  adminNotes,
  setAdminNotes,
  partialAmount,
  setPartialAmount,
  isProcessing,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border rounded-lg px-8 py-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          {actionType === "APPROVE"
            ? "Approve Refund"
            : actionType === "REJECT"
            ? "Reject Refund"
            : "Process Refund"}
        </h2>

        {actionType === "PROCESS" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partial Amount (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              placeholder={`Full amount: $${selectedRefund?.amount || 0}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to process full amount
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Notes {actionType === "REJECT" && "(Required)"}
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
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={
              isProcessing ||
              (actionType === "REJECT" && !adminNotes.trim())
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

const ManualRefundModal = ({
  manualRefundData,
  setManualRefundData,
  handleCreateManualRefund,
  onClose,
  isProcessing,
}) => {
  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border rounded-lg px-8 py-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Create Manual Refund</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order ID *
            </label>
            <input
              type="text"
              value={manualRefundData.orderId}
              onChange={(e) =>
                setManualRefundData((prev) => ({
                  ...prev,
                  orderId: e.target.value,
                }))
              }
              placeholder="Enter order ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount *
            </label>
            <input
              type="number"
              step="0.01"
              value={manualRefundData.amount}
              onChange={(e) =>
                setManualRefundData((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <textarea
              value={manualRefundData.reason}
              onChange={(e) =>
                setManualRefundData((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              placeholder="Enter reason for manual refund"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
              rows="4"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateManualRefund}
            disabled={isProcessing === "manual"}
            className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing === "manual" ? (
              <>
                <LoaderIcon size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Refund"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Refunds Component

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    averageAmount: 0,
    statusDistribution: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showManualRefundModal, setShowManualRefundModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [partialAmount, setPartialAmount] = useState("");
  const [manualRefundData, setManualRefundData] = useState({
    orderId: "",
    amount: "",
    reason: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    orderId: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { adminID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchRefunds();
  }, [pagination.page, filters]);

  const fetchRefunds = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.orderId && { orderId: filters.orderId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
      });

      const { data } = await axios.get(
        `${baseUrl}/retruns-refunds/refunds?${queryParams}`,
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

        setStats(data.stats);
      }
    } catch (error) {
      console.error("Fetch refunds error:", error);
      toast.error("Failed to fetch refunds");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessRefund = async (refundId, action, notes, amount) => {
    try {
      setIsProcessing(refundId);
      const { data } = await axios.patch(
        `${baseUrl}/retruns-refunds/refunds/${refundId}/process`,
        {
          action,
          adminNotes: notes,
          ...(amount && { partialAmount: amount }),
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setShowActionModal(false);
        setAdminNotes("");
        setPartialAmount("");
        setSelectedRefund(null);
        fetchRefunds();
      }
    } catch (error) {
      console.error("Process refund error:", error);
      toast.error(error.response?.data?.error || "Failed to process refund");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCreateManualRefund = async () => {
    try {
      if (!manualRefundData.orderId || !manualRefundData.amount || !manualRefundData.reason) {
        toast.error("All fields are required");
        return;
      }

      setIsProcessing("manual");
      const { data } = await axios.post(
        `${baseUrl}/retruns-refunds/refunds`,
        manualRefundData,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setShowManualRefundModal(false);
        setManualRefundData({ orderId: "", amount: "", reason: "" });
        fetchRefunds();
      }
    } catch (error) {
      console.error("Create manual refund error:", error);
      toast.error(error.response?.data?.error || "Failed to create refund");
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
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Pending",
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
      PROCESSED: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Processed",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRefund(null);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setAdminNotes("");
    setPartialAmount("");
    setActionType(null);
  };

  const handleConfirmAction = () => {
    handleProcessRefund(
      selectedRefund.id,
      actionType,
      adminNotes,
      partialAmount
    );
  };

  const handleCloseManualRefundModal = () => {
    setShowManualRefundModal(false);
    setManualRefundData({ orderId: "", amount: "", reason: "" });
  };

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Refunds"
        subHeading="Manage customer refunds"
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
              onClick={fetchRefunds}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowManualRefundModal(true)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Plus size={16} />
              Manual Refund
            </button>
          </>
        }
      />

      {/* Stats */}
      <Stats
        stats={[
          {
            label: "Total Refunds",
            value: stats.total,
            icon: <DollarSign size={32} />,
          },
          {
            label: "Total Amount",
            value: `$${stats.totalAmount.toFixed(2)}`,
            icon: <TrendingUp size={32} />,
          },
          {
            label: "Average Amount",
            value: `$${stats.averageAmount.toFixed(2)}`,
            icon: <DollarSign size={32} />,
          },
          {
            label: "Pending",
            value:
              stats.statusDistribution.find((s) => s.status === "PENDING")
                ?._count.status || 0,
            icon: <Clock size={32} />,
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
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PROCESSED">Processed</option>
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
                Min Amount
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Min amount..."
                value={filters.minAmount}
                onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Amount
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Max amount..."
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
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
      {showDetailModal && selectedRefund && (
        <DetailModal
          refund={selectedRefund}
          onClose={handleCloseDetailModal}
          setActionType={setActionType}
          setShowActionModal={setShowActionModal}
        />
      )}
      {showActionModal && (
        <ActionModal
          actionType={actionType}
          selectedRefund={selectedRefund}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
          partialAmount={partialAmount}
          setPartialAmount={setPartialAmount}
          isProcessing={isProcessing}
          onClose={handleCloseActionModal}
          onConfirm={handleConfirmAction}
        />
      )}
      {showManualRefundModal && (
        <ManualRefundModal
          manualRefundData={manualRefundData}
          setManualRefundData={setManualRefundData}
          handleCreateManualRefund={handleCreateManualRefund}
          onClose={handleCloseManualRefundModal}
          isProcessing={isProcessing}
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
            <p className="text-gray-600">Loading refunds...</p>
          </div>
        </div>
      ) : refunds.length === 0 ? (
        <div className="bg-white rounded-lg mt-3 shadow-md border border-gray-200 p-12 text-center">
          <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Refunds Found
          </h3>
          <p className="text-gray-600 mb-6">
            {Object.values(filters).some((f) => f)
              ? "Try adjusting your filters"
              : "No refunds have been processed yet"}
          </p>
          <button
            onClick={() => setShowManualRefundModal(true)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Manual Refund
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 overflow-hidden">
          <Table
            data={refunds}
            columns={[
              {
                header: "Refund ID",
                key: "id",
                render: (_, refund) => (
                  <span className="font-mono text-sm">
                    {refund.id.slice(0, 8)}
                  </span>
                ),
              },
              {
                header: "Order ID",
                key: "orderId",
                render: (_, refund) => (
                  <span className="font-mono text-sm">
                    {refund.order.id.slice(0, 8)}
                  </span>
                ),
              },
              {
                header: "Customer",
                key: "user",
                render: (_, refund) => (
                  <div>
                    <p className="font-medium">{refund.order.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {refund.order.user.email}
                    </p>
                  </div>
                ),
              },
              {
                header: "Amount",
                key: "amount",
                render: (_, refund) => (
                  <span className="font-semibold text-green-600">
                    ${refund.amount}
                  </span>
                ),
              },
              {
                header: "Status",
                key: "status",
                render: (_, refund) => getStatusBadge(refund.status),
              },
              {
                header: "Payment",
                key: "payment",
                render: (_, refund) => (
                  <div className="text-xs">
                    <p className="font-medium uppercase">
                      {refund.payment.provider}
                    </p>
                    <p className="text-gray-500">
                      {refund.payment.transactionId.slice(0, 10)}...
                    </p>
                  </div>
                ),
              },
              {
                header: "Created",
                key: "createdAt",
                render: (_, refund) => (
                  <span className="text-sm text-gray-600">
                    {formatDate(refund.createdAt)}
                  </span>
                ),
              },
            ]}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRefund(item);
                    setShowDetailModal(true);
                  }}
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label="View details"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                {item.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRefund(item);
                        setActionType("APPROVE");
                        setShowActionModal(true);
                      }}
                      className="p-2 hover:bg-blue-500 hover:text-white rounded transition-colors duration-200"
                      aria-label="Approve"
                      title="Approve"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRefund(item);
                        setActionType("REJECT");
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
                      setSelectedRefund(item);
                      setActionType("PROCESS");
                      setShowActionModal(true);
                    }}
                    className="p-2 hover:bg-green-500 hover:text-white rounded transition-colors duration-200"
                    aria-label="Process"
                    title="Process Refund"
                  >
                    <DollarSign size={16} />
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
                of {pagination.total} refunds
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

export default Refunds;