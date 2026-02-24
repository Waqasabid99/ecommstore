import { prisma } from "../config/prisma.js";
import { calculatePricing } from "../constants/pricing.js";

// Get order by ID
const getOrderById = async (req, res) => {
  const userId = req.user?.id;
  const { orderId } = req.params;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: {
                      where: { isMain: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            provider: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            userName: true,
            email: true,
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
          },
        },
        refunds: true,
        returns: true,
      },
    });

    if (!order || order.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const skip = (page - 1) * limit;

  try {
    const where = {
      deletedAt: null,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      images: {
                        where: { isMain: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          payment: {
            select: {
              status: true,
              provider: true,
              amount: true,
            },
          },
          user: {
            select: {
              userName: true,
              email: true,
            },
          },
          coupon: {
            select: {
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  const userId = req.user?.id;
  const { page = 1, limit = 10, status } = req.query;

  const skip = (page - 1) * limit;

  try {
    const where = {
      userId,
      deletedAt: null,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      images: {
                        where: { isMain: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          payment: {
            select: {
              status: true,
              provider: true,
              amount: true,
            },
          },
          coupon: {
            select: {
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    // Calculate statistics from ALL user orders (not just paginated)
    const allUserOrders = await prisma.order.findMany({
      where: { userId, deletedAt: null },
      select: {
        status: true,
        total: true,
      },
    });

    const statusCounts = allUserOrders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.totalSpent = (acc.totalSpent || 0) + parseFloat(order.total);
        return acc;
      },
      { totalSpent: 0 }
    );

    const totalOrders = allUserOrders.length;
    const pendingOrders = statusCounts.PENDING || 0;
    const awaitingPaymentOrders = statusCounts.AWAITING_PAYMENT || 0;
    const paidOrders = statusCounts.PAID || 0;
    const shippedOrders = statusCounts.SHIPPED || 0;
    const deliveredOrders = statusCounts.DELIVERED || 0;
    const cancelledOrders = statusCounts.CANCELLED || 0;
    const refundedOrders = statusCounts.REFUNDED || 0;
    const returnedOrders = statusCounts.RETURNED || 0;

    const stats = [
      {
        label: "Total Orders",
        value: totalOrders,
      },
      {
        label: "Pending Orders",
        value: pendingOrders,
      },
      {
        label: "Awaiting Payment",
        value: awaitingPaymentOrders,
      },
      {
        label: "Paid Orders",
        value: paidOrders,
      },
      {
        label: "Shipped Orders",
        value: shippedOrders,
      },
      {
        label: "Delivered Orders",
        value: deliveredOrders,
      },
      {
        label: "Cancelled Orders",
        value: cancelledOrders,
      },
      {
        label: "Refunded Orders",
        value: refundedOrders,
      },
      {
        label: "Returned Orders",
        value: returnedOrders,
      },
      {
        label: "Total Spent",
        value: statusCounts.totalSpent.toFixed(2),
      },
      {
        label: "Average Order Value",
        value: totalOrders > 0 ? (statusCounts.totalSpent / totalOrders).toFixed(2) : "0.00",
      },
    ];

    return res.status(200).json({
      success: true,
      data: orders,
      stats,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const userId = req.user?.id;

  const validStatuses = [
    "PENDING",
    "AWAITING_PAYMENT",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURN_REQUESTED",
    "RETURNED",
    "REFUNDED",
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Invalid order status",
    });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Business logic validations
    if (order.status === "CANCELLED" && status !== "CANCELLED") {
      return res.status(400).json({
        success: false,
        error: "Cannot update a cancelled order",
      });
    }

    if (order.status === "DELIVERED" && status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        error: "Cannot cancel a delivered order. Use return process instead.",
      });
    }

    if (order.status === "REFUNDED") {
      return res.status(400).json({
        success: false,
        error: "Cannot update a refunded order",
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      // If order is cancelled, restore inventory and release reservations
      if (status === "CANCELLED") {
        for (const item of order.items) {
          await tx.inventory.update({
            where: { variantId: item.variantId },
            data: {
              reserved: { decrement: item.quantity },
              quantity: { increment: item.quantity },
            },
          });
        }
      }

      // If order is shipped, deduct from quantity and release reservation
      if (status === "SHIPPED") {
        for (const item of order.items) {
          await tx.inventory.update({
            where: { variantId: item.variantId },
            data: {
              reserved: { decrement: item.quantity },
              quantity: { decrement: item.quantity },
            },
          });
        }
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: "UPDATE",
          entity: "Order",
          entityId: order.id,
          metadata: {
            previousStatus: order.status,
            newStatus: status,
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  const userId = req.user?.id;
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        deletedAt: null,
      },
      include: { items: true, payment: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify ownership
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to cancel this order",
      });
    }

    // Only allow cancellation if order is PENDING, AWAITING_PAYMENT, or PAID (not shipped)
    if (!["PENDING", "AWAITING_PAYMENT", "PAID"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: "Order cannot be cancelled at this stage. Please request a return instead.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Restore inventory (release reservations + restore quantity)
      for (const item of order.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            reserved: { decrement: item.quantity },
            quantity: { increment: item.quantity },
          },
        });
      }

      // If payment was successful, initiate refund
      if (order.payment && order.payment.status === "SUCCESS") {
        await tx.refund.create({
          data: {
            orderId: order.id,
            paymentId: order.payment.id,
            amount: order.total,
            reason: reason || "Order cancelled by customer",
            status: "PENDING",
          },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: "UPDATE",
          entity: "Order",
          entityId: order.id,
          metadata: {
            previousStatus: order.status,
            newStatus: "CANCELLED",
            reason: reason || "Cancelled by customer",
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      return updatedOrder;
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: result,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Request return
const requestReturn = async (req, res) => {
  const userId = req.user?.id;
  const { orderId } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: "Return reason must be at least 10 characters",
    });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId, deletedAt: null },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify ownership
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to request return for this order",
      });
    }

    // Only delivered orders can be returned
    if (order.status !== "DELIVERED") {
      return res.status(400).json({
        success: false,
        error: "Only delivered orders can be returned",
      });
    }

    // Check if return already exists
    const existingReturn = await prisma.returnRequest.findFirst({
      where: { orderId },
    });

    if (existingReturn) {
      return res.status(400).json({
        success: false,
        error: "Return request already exists for this order",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create return request
      const returnRequest = await tx.returnRequest.create({
        data: {
          orderId,
          userId,
          reason: reason.trim(),
          status: "REQUESTED",
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "RETURN_REQUESTED" },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: "CREATE",
          entity: "ReturnRequest",
          entityId: returnRequest.id,
          metadata: {
            orderId,
            reason: reason.trim(),
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      return returnRequest;
    });

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Request return error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export {
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
};