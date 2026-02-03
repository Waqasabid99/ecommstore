import { prisma } from "../config/prisma.js";

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

// Get all orders
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

//Get user orders
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
                },
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.order.count({ where }),
        ]);

        const { totalSpent, ...statusCounts } = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            acc.totalSpent =
                (acc.totalSpent || 0) + order?.payment?.amount || 0;
            return acc;
        }, {});

        const totalOrders = orders.length;
        const pendingOrders = statusCounts.PENDING || 0;
        const deliveredOrders = statusCounts.DELIVERED || 0;
        const cancelledOrders = statusCounts.CANCELLED || 0;
        const refundedOrders = statusCounts.REFUNDED || 0;
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
                label: "Total Spent",
                value: totalSpent,
            },
            {
                label: "Average Order Value",
                value: totalSpent / totalOrders,
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
                error: "Cannot cancel a delivered order",
            });
        }

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const updated = await tx.order.update({
                where: { id: orderId },
                data: { status },
            });

            // If order is cancelled, restore inventory
            if (status === "CANCELLED") {
                for (const item of order.items) {
                    await tx.inventory.update({
                        where: { variantId: item.variantId },
                        data: { quantity: { increment: item.quantity } },
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
    console.log(orderId, reason)
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                deletedAt: null,
            },
            include: { items: true, payment: true },
        });
        console.log(order)
        if (!order) {
            return res.status(404).json({
                success: false,
                error: "Order not found",
            });
        }

        // Only allow cancellation if order is PENDING or PAID (not shipped)
        if (!["PENDING", "PAID"].includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: "Order cannot be cancelled at this stage",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update order status
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" },
            });

            // Restore inventory
            for (const item of order.items) {
                await tx.inventory.update({
                    where: { variantId: item.variantId },
                    data: { quantity: { increment: item.quantity } },
                });
            }

            // If payment was made, initiate refund
            if (order.payment && order.payment.status === "SUCCESS") {
                await tx.refund.create({
                    data: {
                        orderId: order.id,
                        paymentId: order.payment.id,
                        amount: order.totalAmount,
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

export {
    getUserOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
};
