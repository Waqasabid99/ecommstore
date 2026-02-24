"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Calendar,
  DollarSign,
  CreditCard,
  MapPin,
  Phone,
  Home,
  Building,
  Globe,
  Hash,
  LoaderIcon,
  X,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  PackageX,
  PackageCheck,
  ShoppingBag,
  Image as ImageIcon,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const ViewOrder = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const { adminID, orderID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchOrderData();
  }, [orderID]);

  const fetchOrderData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${baseUrl}/orders/${orderID}`, {
        withCredentials: true,
      });

      if (data.success) {
        setOrder(data.data);
        setSelectedStatus(data.data.status);
      }
    } catch (error) {
      console.error("Fetch order error:", error);
      toast.error("Failed to fetch order data");
      navigate.push(`/admin/${adminID}/orders`);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(order);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    if (selectedStatus === order.status) {
      toast.info("Status is already set to this value");
      setShowStatusModal(false);
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const { data } = await axios.patch(
        `${baseUrl}/orders/${orderID}/status`,
        { status: selectedStatus },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Order status updated successfully");
        setShowStatusModal(false);
        fetchOrderData();
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error(error.response?.data?.error || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setIsCancelling(true);
      const { data } = await axios.post(
        `${baseUrl}/orders/${orderID}/cancel`,
        { reason: cancelReason },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Order cancelled successfully");
        setShowCancelModal(false);
        setCancelReason("");
        fetchOrderData();
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error(error.response?.data?.error || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
        icon: Clock,
        label: "Pending",
      },
      PAID: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: CreditCard,
        label: "Paid",
      },
      SHIPPED: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: Truck,
        label: "Shipped",
      },
      DELIVERED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: PackageCheck,
        label: "Delivered",
      },
      CANCELLED: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "Cancelled",
      },
      RETURN_REQUESTED: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        icon: RefreshCw,
        label: "Return Requested",
      },
      RETURNED: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: PackageX,
        label: "Returned",
      },
      REFUNDED: {
        bg: "bg-indigo-100",
        text: "text-indigo-700",
        icon: DollarSign,
        label: "Refunded",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`px-4 py-2 text-sm font-semibold rounded-full ${config.bg} ${config.text} flex items-center gap-2 w-fit`}
      >
        <Icon size={16} />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    if (status === "SUCCESS") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
          <CheckCircle size={14} />
          Successful
        </span>
      );
    }
    if (status === "PENDING") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
          <Clock size={14} />
          Pending
        </span>
      );
    }
    if (status === "FAILED") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1 w-fit">
          <XCircle size={14} />
          Failed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
        {status}
      </span>
    );
  };

  const StatusUpdateModal = () => {
    const statuses = [
      "PENDING",
      "PAID",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED",
      "REFUNDED",
    ];

    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded-lg px-8 py-6 flex flex-col gap-4 max-w-md w-full mx-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Update Order Status
            </h2>
            <button
              onClick={() => setShowStatusModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowStatusModal(false)}
              disabled={isUpdatingStatus}
              className="flex-1 bg-white text-black px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus}
              className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdatingStatus ? (
                <>
                  <LoaderIcon size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Update Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CancelOrderModal = () => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded-lg px-8 py-6 flex flex-col gap-4 max-w-md w-full mx-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Cancel Order
            </h2>
            <button
              onClick={() => setShowCancelModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              Are you sure you want to cancel this order? This action will
              restore inventory and initiate a refund if payment was successful.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
              placeholder="Enter reason for cancellation..."
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
              className="flex-1 bg-white text-black px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCancelling ? (
                <>
                  <LoaderIcon size={16} className="animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  Cancel Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon
            size={48}
            className="animate-spin mx-auto mb-4 text-black"
          />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Order Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate.push(`/admin/${adminID}/orders`)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <ToastContainer />

      <DashboardHeadingBox
        text="Order Details"
        subHeading={`Order #${order.id.slice(0, 8).toUpperCase()}`}
        button={
          <div className="flex gap-3">
            <button
              onClick={() => navigate.push(`/admin/${adminID}/orders`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            {["PENDING", "PAID"].includes(order.status) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-white text-red-600 rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-red-500 hover:border hover:border-gray-300 flex items-center gap-2"
              >
                <XCircle size={16} />
                Cancel Order
              </button>
            )}
          </div>
        }
      />

      {showStatusModal && <StatusUpdateModal />}
      {showCancelModal && <CancelOrderModal />}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar size={16} />
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(order.status)}
              <button
                onClick={() => setShowStatusModal(true)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 ml-auto"
              >
                <RefreshCw size={14} />
                Update Status
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                <DollarSign size={20} />
                {order.total}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Payment Status</p>
              <div className="mt-2">
                {order.payment
                  ? getPaymentStatusBadge(order.payment.status)
                  : "N/A"}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Items</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                <ShoppingBag size={20} />
                {order.items.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package size={20} />
                Order Items ({order.items.length})
              </h3>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      {item.variant?.product?.images?.[0]?.url ? (
                        <img
                          src={item.variant.product.images[0].url}
                          alt={item.variant.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {item.variant?.product?.name || "Unknown Product"}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        SKU: {item.variant?.sku || "N/A"}
                      </p>
                      {item.variant?.attributes && (
                        <div className="text-xs text-gray-500 mb-2">
                          {Object.entries(item.variant.attributes).map(
                            ([key, value]) => (
                              <span
                                key={key}
                                className="inline-block mr-2 px-2 py-0.5 bg-gray-100 rounded"
                              >
                                {key}: {value}
                              </span>
                            )
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="font-semibold text-gray-900">
                          ${item.price} each
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      $
                      {order.subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span className="font-semibold">
                      $
                      {order.taxAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping Charges</span>
                    <span className="font-semibold">
                      $
                      {order.shippingAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>${order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Shipping Address
              </h3>

              {order.shippingAddr ? (
                <div className="space-y-3">
                  {order.shippingAddr.fullName && (
                    <div className="flex items-start gap-2">
                      <User size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-sm text-gray-800 font-medium">
                          {order.shippingAddr.fullName}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.shippingAddr.phone && (
                    <div className="flex items-start gap-2">
                      <Phone size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-gray-800 font-medium">
                          {order.shippingAddr.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.shippingAddr.line1 && (
                    <div className="flex items-start gap-2">
                      <Home size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Street Address</p>
                        <p className="text-sm text-gray-800 font-medium">
                          {order.shippingAddr.line1}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {[
                          order.shippingAddr.city,
                          order.shippingAddr.state,
                          order.shippingAddr.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  {order.shippingAddr.country && (
                    <div className="flex items-start gap-2">
                      <Globe size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Country</p>
                        <p className="text-sm text-gray-800 font-medium">
                          {order.shippingAddr.country}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No shipping address provided</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Customer & Payment Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Customer
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User size={16} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {order.user?.userName || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail size={16} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-800 font-medium break-all">
                      {order.user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Hash size={16} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-xs text-gray-800 font-mono break-all">
                      {order.userId}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate.push(`/admin/${adminID}/customers/${order.userId}`)
                }
                className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                View Customer Profile
              </button>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Details
              </h3>

              {order.payment ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Hash size={16} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Payment ID</p>
                      <p className="text-xs text-gray-800 font-mono break-all">
                        {order.payment.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CreditCard size={16} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Provider</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {order.payment.provider || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign size={16} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Amount Paid</p>
                      <p className="text-sm text-gray-800 font-medium">
                        ${order.payment.amount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="mt-1">
                        {getPaymentStatusBadge(order.payment.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Payment Date</p>
                      <p className="text-xs text-gray-800">
                        {formatDate(order.payment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No payment information</p>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={20} />
                Order Timeline
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar size={16} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-xs text-gray-800">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar size={16} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-xs text-gray-800">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                </div>

                {order.deletedAt && (
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-red-500 mt-1" />
                    <div>
                      <p className="text-xs text-red-500">Deleted</p>
                      <p className="text-xs text-red-600">
                        {formatDate(order.deletedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Refunds & Returns */}
            {(order.refunds?.length > 0 || order.returns?.length > 0) && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <RefreshCw size={20} />
                  Refunds & Returns
                </h3>

                {order.refunds?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Refunds ({order.refunds.length})
                    </p>
                    <div className="space-y-2">
                      {order.refunds.map((refund) => (
                        <div
                          key={refund.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="text-xs text-gray-600">
                            ${refund.amount} - {refund.status}
                          </p>
                          {refund.reason && (
                            <p className="text-xs text-gray-500 mt-1">
                              {refund.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.returns?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Returns ({order.returns.length})
                    </p>
                    <div className="space-y-2">
                      {order.returns.map((returnItem) => (
                        <div
                          key={returnItem.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="text-xs text-gray-600">
                            {returnItem.status}
                          </p>
                          {returnItem.reason && (
                            <p className="text-xs text-gray-500 mt-1">
                              {returnItem.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;