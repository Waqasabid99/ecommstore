"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { X, LoaderIcon, AlertCircle, Package } from "lucide-react";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

/**
 * RequestReturnModal Component
 * 
 * Usage:
 * import RequestReturnModal from "@/components/RequestReturnModal";
 * 
 * <RequestReturnModal 
 *   order={orderData} 
 *   isOpen={showModal} 
 *   onClose={() => setShowModal(false)}
 *   onSuccess={() => handleReturnCreated()}
 * />
 */

const RequestReturnModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnType, setReturnType] = useState("all"); // "all" or "partial"

  if (!isOpen || !order) return null;

  // Check if order is eligible for return
  const isEligible = ["DELIVERED", "SHIPPED"].includes(order.status);
  
  // Check return window (30 days)
  const orderDate = new Date(order.updatedAt || order.createdAt);
  const returnDeadline = new Date(orderDate);
  returnDeadline.setDate(returnDeadline.getDate() + 30);
  const isWithinWindow = new Date() <= returnDeadline;
  const daysRemaining = Math.ceil(
    (returnDeadline - new Date()) / (1000 * 60 * 60 * 24)
  );

  const handleItemToggle = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim() || reason.length < 10) {
      toast.error("Please provide a reason (at least 10 characters)");
      return;
    }

    if (returnType === "partial" && selectedItems.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        orderId: order.id,
        reason: reason.trim(),
        ...(returnType === "partial" && {
          items: selectedItems.map((itemId) => ({
            orderItemId: itemId,
            quantity: order.items.find((item) => item.id === itemId).quantity,
          })),
        }),
      };

      const { data } = await axios.post(`${baseUrl}/retruns-refunds/`, payload, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success(data.message);
        setReason("");
        setSelectedItems([]);
        setReturnType("all");
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Request return error:", error);
      toast.error(error.response?.data?.error || "Failed to submit return request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setSelectedItems([]);
      setReturnType("all");
      onClose();
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Request Return</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Eligibility Check */}
          {!isEligible && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">
                    Order Not Eligible
                  </h4>
                  <p className="text-sm text-red-700">
                    Returns can only be requested for delivered or shipped orders.
                    Current status: <strong>{order.status}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isWithinWindow && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">
                    Return Window Expired
                  </h4>
                  <p className="text-sm text-red-700">
                    Returns must be requested within 30 days of delivery. This
                    order's return window has expired.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isEligible && isWithinWindow && (
            <>
              {/* Return Window Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Return Window
                    </h4>
                    <p className="text-sm text-blue-700">
                      You have <strong>{daysRemaining} days</strong> remaining to
                      request a return for this order (until{" "}
                      {returnDeadline.toLocaleDateString()}).
                    </p>
                  </div>
                </div>
              </div>

              {/* Return Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to return?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="returnType"
                      value="all"
                      checked={returnType === "all"}
                      onChange={(e) => setReturnType(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">All items</p>
                      <p className="text-sm text-gray-600">
                        Return the entire order
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="returnType"
                      value="partial"
                      checked={returnType === "partial"}
                      onChange={(e) => setReturnType(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Specific items</p>
                      <p className="text-sm text-gray-600">
                        Select which items to return
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Item Selection (if partial) */}
              {returnType === "partial" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select items to return
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {order.items.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedItems.includes(item.id)
                            ? "border-black bg-gray-50"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemToggle(item.id)}
                          className="w-4 h-4"
                        />
                        {item.variant?.product?.images?.[0]?.url && (
                          <img
                            src={item.variant.product.images[0].url}
                            alt={item.variant.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {item.variant?.product?.name || "Product"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a detailed reason for your return (minimum 10 characters)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                  rows="5"
                  required
                  minLength={10}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {reason.length}/10 characters minimum
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package size={18} />
                  Return Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium font-mono">
                      {order.id.slice(0, 12)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items to return:</span>
                    <span className="font-medium">
                      {returnType === "all"
                        ? `All (${order.items.length})`
                        : `${selectedItems.length} of ${order.items.length}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Refund Amount:</span>
                    <span className="font-semibold text-green-600">
                      $
                      {returnType === "all"
                        ? order.totalAmount
                        : order.items
                            .filter((item) => selectedItems.includes(item.id))
                            .reduce(
                              (sum, item) => sum + item.quantity * item.price,
                              0
                            )
                            .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Important Notes
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Items must be unused and in original packaging</li>
                  <li>Return shipping costs may apply</li>
                  <li>Refunds are processed within 5-7 business days</li>
                  <li>You'll receive tracking information once approved</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderIcon size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Return Request"
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default RequestReturnModal;