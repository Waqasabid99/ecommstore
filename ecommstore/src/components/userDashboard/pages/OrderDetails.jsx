"use client";
import { useState, useEffect } from "react";
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Download,
  Phone,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Country, State } from "country-state-city";
import axios from "axios";
import { baseUrl } from "@/lib/utils";
import Loader from "@/components/ui/Loader";
import { useParams } from "next/navigation";

const ViewOrder = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${baseUrl}/orders/${orderId}`, {
          withCredentials: true,
        });
        
        if (data.success) {
          setOrder(data.data);
        } else {
          setError("Failed to load order details");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching order details");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Helper function to get country name from code
  const getCountryName = (countryCode) => {
    const country = Country.getAllCountries().find(
      (c) => c.isoCode === countryCode
    );
    return country ? country.name : countryCode;
  };

  // Helper function to get state name from code
  const getStateName = (countryCode, stateCode) => {
    const state = State.getStatesOfCountry(countryCode).find(
      (s) => s.isoCode === stateCode
    );
    return state ? state.name : stateCode;
  };

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        label: "Pending",
      },
      PROCESSING: {
        icon: Package,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        label: "Processing",
      },
      SHIPPED: {
        icon: Truck,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        label: "Shipped",
      },
      DELIVERED: {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        label: "Delivered",
      },
      CANCELLED: {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        label: "Cancelled",
      },
    };
    return configs[status] || configs.PENDING;
  };

  // Calculate totals
  const calculateSubtotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
  };

  const shipping = 299;
  const tax = calculateSubtotal() * 0.17;
  const total = parseFloat(order?.totalAmount || 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <Loader text="Loading order details..." size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <section className="mx-4 my-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-(--border-default) rounded-xl p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <XCircle size={48} className="text-red-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-(--text-heading)">
                Order Not Found
              </h1>
              <p className="text-(--text-secondary) mb-8">
                {error || "We couldn't find the order you're looking for."}
              </p>
              <Link
                href={`/user/${order.userId}/orders`}
                className="inline-flex items-center gap-2 bg-(--btn-bg-primary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium"
              >
                <ArrowLeft size={18} />
                Back to Orders
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <section className="bg-linear-to-br from-blue-50 to-purple-50 mx-4 rounded-xl px-6 py-12 md:py-16 mb-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/user/${order.userId}/orders`}
            className="text-(--text-secondary) hover:text-(--text-hover) font-medium flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={18} />
            <span>Back to Orders</span>
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="inline-block text-(--color-brand-primary) text-sm border-2 border-(--border-primary) rounded-full px-4 py-1.5 font-medium mb-3">
                ORDER DETAILS
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-(--text-heading) mb-2">
                Order #{order.id.substr(0, 8).toUpperCase()}
              </h1>
              <p className="text-(--text-secondary) flex items-center gap-2">
                <Calendar size={16} />
                Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-md px-5 py-1.5 flex items-center gap-3`}>
              <StatusIcon size={24} className={statusConfig.color} />
              <div>
                <p className="text-xs text-(--text-secondary) font-medium">
                  Status
                </p>
                <p className={`text-lg font-bold ${statusConfig.color}`}>
                  {statusConfig.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Order Items & Addresses */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-(--bg-primary) rounded-full flex items-center justify-center">
                    <Package size={24} className="text-(--icon-inverse)" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-(--text-heading)">
                      Order Items
                    </h2>
                    <p className="text-sm text-(--text-secondary)">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"} in this order
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => {
                    const mainImage = item.variant?.product?.images?.find(
                      (img) => img.isMain
                    )?.url || item.variant?.product?.images?.[0]?.url || "/placeholder.png";

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 border border-(--border-default) rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="w-24 h-24 bg-(--bg-surface) rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={mainImage}
                            width={100}
                            height={100}
                            alt={item.variant?.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-(--text-heading) mb-1">
                            {item.variant?.product?.name || "Product Name"}
                          </h3>
                          
                          {/* Variant attributes */}
                          {item.variant?.attributes && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {Object.entries(item.variant.attributes).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="text-xs bg-(--bg-surface) border border-(--border-default) rounded-full px-3 py-1"
                                >
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-(--text-secondary)">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-lg font-bold text-(--text-heading)">
                              Rs. {(parseFloat(item.price) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="bg-white border border-(--border-default) rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Truck size={20} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-(--text-heading)">
                      Shipping Address
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-(--text-secondary)">
                    <p className="font-semibold text-(--text-heading)">
                      {order.shippingAddr.fullName}
                    </p>
                    <p>{order.shippingAddr.line1}</p>
                    {order.shippingAddr.line2 && <p>{order.shippingAddr.line2}</p>}
                    <p>
                      {order.shippingAddr.city},{" "}
                      {getStateName(order.shippingAddr.country, order.shippingAddr.state)}{" "}
                      {order.shippingAddr.postalCode}
                    </p>
                    <p>{getCountryName(order.shippingAddr.country)}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-(--border-default)">
                      <Phone size={14} />
                      <p className="font-medium">{order.shippingAddr.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white border border-(--border-default) rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <CreditCard size={20} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-(--text-heading)">
                      Billing Address
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-(--text-secondary)">
                    <p className="font-semibold text-(--text-heading)">
                      {order.billingAddr.fullName}
                    </p>
                    <p>{order.billingAddr.line1}</p>
                    {order.billingAddr.line2 && <p>{order.billingAddr.line2}</p>}
                    <p>
                      {order.billingAddr.city},{" "}
                      {getStateName(order.billingAddr.country, order.billingAddr.state)}{" "}
                      {order.billingAddr.postalCode}
                    </p>
                    <p>{getCountryName(order.billingAddr.country)}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-(--border-default)">
                      <Phone size={14} />
                      <p className="font-medium">{order.billingAddr.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-(--border-default) rounded-xl p-6 sticky top-6 space-y-6">
                <h3 className="text-xl font-bold text-(--text-heading)">
                  Order Summary
                </h3>

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-(--text-secondary)">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      Rs. {calculateSubtotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-(--text-secondary)">
                    <span>Shipping</span>
                    <span className="font-medium">
                      Rs. {shipping.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-(--text-secondary)">
                    <span>Tax (17%)</span>
                    <span className="font-medium">
                      Rs. {Math.round(tax).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-(--border-default) pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-(--text-heading)">
                        Total
                      </span>
                      <span className="font-bold text-(--text-heading) text-xl">
                        Rs. {Math.round(total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="border-t border-(--border-default) pt-6">
                  <h4 className="font-semibold text-(--text-heading) mb-3">
                    Payment Method
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-(--bg-surface) rounded-lg">
                    <CreditCard size={20} className="text-(--text-secondary)" />
                    <p className="text-sm text-(--text-secondary)">
                      {order.payment ? "Card Payment" : "Cash on Delivery"}
                    </p>
                  </div>
                </div>

                {/* Order Status Timeline */}
                <div className="border-t border-(--border-default) pt-6">
                  <h4 className="font-semibold text-(--text-heading) mb-4">
                    Order Timeline
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        <CheckCircle size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-(--text-heading)">
                          Order Placed
                        </p>
                        <p className="text-xs text-(--text-secondary)">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        <Package size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-(--text-heading)">
                          Processing
                        </p>
                        <p className="text-xs text-(--text-secondary)">
                          {["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
                            ? "In progress"
                            : "Pending"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        ["SHIPPED", "DELIVERED"].includes(order.status)
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        <Truck size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-(--text-heading)">
                          Shipped
                        </p>
                        <p className="text-xs text-(--text-secondary)">
                          {["SHIPPED", "DELIVERED"].includes(order.status)
                            ? "On the way"
                            : "Pending"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        order.status === "DELIVERED"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        <CheckCircle size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-(--text-heading)">
                          Delivered
                        </p>
                        <p className="text-xs text-(--text-secondary)">
                          {order.status === "DELIVERED"
                            ? new Date(order.updatedAt).toLocaleString()
                            : "Estimated 3-5 business days"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-(--border-default) pt-6 space-y-3">
                    {order.status === "DELIVERED" ? null : (      
                  <button className="w-full bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium flex items-center justify-center gap-2">
                    <Truck size={18} />
                    Track Order
                  </button>
                    )}
                  <button className="w-full border-2 border-(--border-inverse) text-(--text-primary) px-6 py-3 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download Invoice
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewOrder;