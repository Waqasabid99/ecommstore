"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Package,
  User,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  Hash,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  LoaderIcon,
  RefreshCw,
  X,
  Tag,
  Percent,
  Trash2,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl, formatDate } from "@/lib/utils";
import axios from "axios";

  const CancelOrderModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  isCancelling, 
  order, 
  cancelReason, 
  setCancelReason 
}) => {
  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border rounded-lg px-8 py-8 flex flex-col gap-3 items-center max-w-md w-full shadow-2xl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
          <Trash2 size={32} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">Cancel Order</h1>
        <p className="text-gray-600 text-center">
          Are you sure you want to cancel order{" "}
          <span className="font-semibold">{order?.orderId}</span>?
        </p>
        
        <div className="w-full">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Cancellation Reason
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="bg-gray-50 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            placeholder="Please provide a reason for cancelling this order..."
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3 mt-4 w-full">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 text-black px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <X size={16} /> Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling || !cancelReason.trim()}
            className="flex-1 bg-black text-white border px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? (
              <>
                <LoaderIcon size={16} className="animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Confirm Cancel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditOrder = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notification, setNotification] = useState(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const { adminID, orderID: orderId } = useParams();
  const navigate = useRouter();

  const ORDER_STATUSES = [
    { value: "PENDING", label: "Pending", color: "yellow" },
    { value: "PAID", label: "Paid", color: "green" },
    { value: "SHIPPED", label: "Shipped", color: "blue" },
    { value: "DELIVERED", label: "Delivered", color: "blue" },
    { value: "CANCELLED", label: "Cancelled", color: "red" },
    { value: "RETURN_REQUESTED", label: "Return Requested", color: "orange" },
    { value: "RETURNED", label: "Returned", color: "orange" },
    { value: "REFUNDED", label: "Refunded", color: "purple" },
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${baseUrl}/orders/${orderId}`, {
        withCredentials: true,
      });

      if (data.success) {
        setOrder(data.data);
        setSelectedStatus(data.data.status);
      }
    } catch (error) {
      console.error("Fetch order error:", error);
      toast.error("Failed to fetch order details");
      navigate.push(`/admin/${adminID}/orders`);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(order);
  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order.status) {
      toast.warning("Please select a different status");
      return;
    }

    setIsUpdating(true);
    setNotification(null);

    try {
      const { data } = await axios.patch(
        `${baseUrl}/orders/${orderId}/status`,
        { status: selectedStatus },
        { withCredentials: true },
      );

      if (data.success) {
        setOrder(data.data);
        setNotification({
          type: "success",
          message: "Order status updated successfully!",
        });
        toast.success("Order status updated successfully!");
        fetchOrderDetails();
      }
    } catch (error) {
      console.error("Update status error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to update order status";
      setNotification({
        type: "error",
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.warning("Please provide a reason for cancellation");
      return;
    }

    setIsCancelling(true);

    try {
      const { data } = await axios.post(
        `${baseUrl}/orders/${orderId}/cancel`,
        { reason: cancelReason },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success("Order cancelled successfully!");
        setShowCancelModal(false);
        setCancelReason("");
        fetchOrderDetails();
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to cancel order";
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find((s) => s.value === status);
    return statusObj?.color || "gray";
  };

  const getStatusBadge = (status) => {
    const colorMap = {
      yellow: { bg: "bg-yellow-100", text: "text-yellow-700" },
      green: { bg: "bg-green-100", text: "text-green-700" },
      blue: { bg: "bg-blue-100", text: "text-blue-700" },
      red: { bg: "bg-red-100", text: "text-red-700" },
      orange: { bg: "bg-orange-100", text: "text-orange-700" },
      purple: { bg: "bg-purple-100", text: "text-purple-700" },
      gray: { bg: "bg-gray-100", text: "text-gray-700" },
    };

    const color = getStatusColor(status);
    const { bg, text } = colorMap[color];
    const statusObj = ORDER_STATUSES.find((s) => s.value === status);

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${bg} ${text}`}
      >
        {statusObj?.label || status}
      </span>
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
          <button
            onClick={() => navigate.push(`/admin/${adminID}/orders`)}
            className="mt-4 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
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

        <CancelOrderModal 
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        isCancelling={isCancelling}
        order={order}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
      />
      <DashboardHeadingBox
        text={`Order #${order.id.slice(0, 8).toUpperCase()}`}
        subHeading="View and manage order details"
        button={
          <>
            <button
              onClick={fetchOrderDetails}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => navigate.push(`/admin/${adminID}/orders`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Orders
            </button>
          </>
        }
      />

      <div className="mb-6">
        <div className="max-w-7xl mx-auto">
          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 border rounded-xl p-4 flex items-start gap-3 ${
                notification.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="text-green-600 shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 shrink-0" size={20} />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    notification.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status & Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Status
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 min-w-25">
                      Current Status:
                    </label>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 min-w-25">
                      Update Status:
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleStatusUpdate}
                      disabled={isUpdating || selectedStatus === order.status}
                      className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <LoaderIcon size={16} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Update Status
                        </>
                      )}
                    </button>

                    {!["CANCELLED", "DELIVERED", "REFUNDED"].includes(
                      order.status,
                    ) && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package size={20} />
                  Order Items
                </h3>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {item.variant?.product?.images?.[0]?.url && (
                                <img
                                  src={item.variant.product.images[0].url}
                                  alt={item.variant.product.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {item.variant?.product?.name || "N/A"}
                                </p>
                                {item.variant?.name && (
                                  <p className="text-sm text-gray-500">
                                    Variant: {item.variant.name}
                                  </p>
                                )}
                                {item.variant?.sku && (
                                  <p className="text-xs text-gray-400 font-mono">
                                    SKU: {item.variant.sku}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-semibold text-gray-800">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-gray-800">
                            ${Number(item.price).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-gray-800">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Total */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-800">
                      $
                      {order.items
                        ?.reduce(
                          (sum, item) =>
                            sum + Number(item.price) * item.quantity,
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                  {order.couponCode && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Tag size={14} />
                        Coupon ({order.couponCode}):
                      </span>
                      <span className="font-semibold text-green-600">
                        -${Number(order.discount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-800">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-800">
                      {order.shippingAddress.street}
                    </p>
                    <p className="text-gray-700">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-gray-700">
                      {order.shippingAddress.country}
                    </p>
                    {order.shippingAddress.phone && (
                      <p className="mt-2 text-sm text-gray-600">
                        Phone: {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Customer & Payment Info */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="font-semibold text-gray-800">
                      {order.user?.userName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-800">
                      {order.user?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer ID</p>
                    <p className="font-mono text-sm text-gray-600">
                      {order.userId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Hash size={20} />
                  Order Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono text-sm text-gray-800">
                      {order.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Date</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                  {order.couponCode && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Coupon Code</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                          {order.couponCode}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {order.payment && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Payment Status
                      </p>
                      {getStatusBadge(order.payment.status)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Payment Method
                      </p>
                      <p className="font-medium text-gray-800">
                        {order.payment.provider || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="font-bold text-green-600">
                        ${Number(order.payment.amount).toFixed(2)}
                      </p>
                    </div>
                    {order.payment.transactionId && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Transaction ID
                        </p>
                        <p className="font-mono text-xs text-gray-600 break-all">
                          {order.payment.transactionId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Refunds */}
              {order.refunds && order.refunds.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Refunds
                  </h3>
                  <div className="space-y-3">
                    {order.refunds.map((refund, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-500">
                            Refund #{index + 1}
                          </span>
                          {getStatusBadge(refund.status)}
                        </div>
                        <p className="font-bold text-purple-600">
                          ${Number(refund.amount).toFixed(2)}
                        </p>
                        {refund.reason && (
                          <p className="text-xs text-gray-600 mt-1">
                            {refund.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Returns */}
              {order.returns && order.returns.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Returns
                  </h3>
                  <div className="space-y-3">
                    {order.returns.map((returnItem, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-500">
                            Return #{index + 1}
                          </span>
                          {getStatusBadge(returnItem.status)}
                        </div>
                        {returnItem.reason && (
                          <p className="text-sm text-gray-700">
                            {returnItem.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrder;
