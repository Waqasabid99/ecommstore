import { prisma } from "../config/prisma.js";
import Decimal from "decimal.js";

// =====================
// RETURN REQUEST FUNCTIONS (User)
// =====================

/**
 * Create a return request (User only)
 * POST /api/returns
 */
const createReturnRequest = async (req, res) => {
    const userId = req.user?.id;
    const { orderId, reason, items } = req.body;

    // Validation
    if (!orderId || !reason) {
        return res.status(400).json({
            success: false,
            error: "Order ID and reason are required",
        });
    }

    if (!reason.trim() || reason.length < 10) {
        return res.status(400).json({
            success: false,
            error: "Reason must be at least 10 characters long",
        });
    }

    try {
        const returnRequest = await prisma.$transaction(async (tx) => {
            // 1. Verify order exists and belongs to user
            const order = await tx.order.findFirst({
                where: {
                    id: orderId,
                    userId,
                    deletedAt: null,
                },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    returns: true,
                    payment: true,
                },
            });

            if (!order) {
                throw new Error("ORDER_NOT_FOUND");
            }

            // 2. Check if order is eligible for return
            if (!["DELIVERED", "SHIPPED"].includes(order.status)) {
                throw new Error("ORDER_NOT_ELIGIBLE");
            }

            // 3. Check if return window is still valid (30 days from delivery/update)
            const returnWindowDays = 30;
            const orderDate = order.updatedAt || order.createdAt;
            const returnDeadline = new Date(orderDate);
            returnDeadline.setDate(returnDeadline.getDate() + returnWindowDays);

            if (new Date() > returnDeadline) {
                throw new Error("RETURN_WINDOW_EXPIRED");
            }

            // 4. Check for existing pending return requests
            const existingPendingReturn = order.returns.find(
                (r) => r.status === "REQUESTED" || r.status === "APPROVED"
            );

            if (existingPendingReturn) {
                throw new Error("PENDING_RETURN_EXISTS");
            }

            // 5. Validate items if specific items requested (optional)
            if (items && Array.isArray(items) && items.length > 0) {
                const validItemIds = order.items.map((item) => item.id);
                const invalidItems = items.filter(
                    (item) => !validItemIds.includes(item.orderItemId)
                );

                if (invalidItems.length > 0) {
                    throw new Error("INVALID_ITEMS");
                }

                // Validate quantities
                for (const item of items) {
                    const orderItem = order.items.find(
                        (oi) => oi.id === item.orderItemId
                    );
                    if (item.quantity > orderItem.quantity) {
                        throw new Error("INVALID_QUANTITY");
                    }
                }
            }

            // 6. Create return request
            const newReturn = await tx.returnRequest.create({
                data: {
                    orderId,
                    userId,
                    reason: reason.trim(),
                    status: "REQUESTED",
                },
            });

            // 7. Update order status to RETURN_REQUESTED
            await tx.order.update({
                where: { id: orderId },
                data: { status: "RETURN_REQUESTED" },
            });

            // 8. Audit log
            await tx.auditLog.create({
                data: {
                    userId,
                    action: "CREATE",
                    entity: "ReturnRequest",
                    entityId: newReturn.id,
                    metadata: {
                        orderId,
                        reason: reason.trim(),
                        items: items || "ALL_ITEMS",
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                },
            });

            return newReturn;
        });

        return res.status(201).json({
            success: true,
            message: "Return request submitted successfully",
            data: returnRequest,
        });
    } catch (error) {
        console.error("Create return request error:", error);

        const errorMap = {
            ORDER_NOT_FOUND: {
                status: 404,
                message: "Order not found",
            },
            ORDER_NOT_ELIGIBLE: {
                status: 400,
                message: "Order must be delivered before requesting a return",
            },
            RETURN_WINDOW_EXPIRED: {
                status: 400,
                message: "Return window has expired (30 days from delivery)",
            },
            PENDING_RETURN_EXISTS: {
                status: 409,
                message: "A return request is already pending for this order",
            },
            INVALID_ITEMS: {
                status: 400,
                message: "Invalid items specified for return",
            },
            INVALID_QUANTITY: {
                status: 400,
                message: "Requested quantity exceeds purchased quantity",
            },
        };

        if (errorMap[error.message]) {
            return res.status(errorMap[error.message].status).json({
                success: false,
                error: errorMap[error.message].message,
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to submit return request",
        });
    }
};

/**
 * Get user's return requests
 * GET /api/returns/my-returns
 */
const getMyReturnRequests = async (req, res) => {
    const userId = req.user?.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (page - 1) * limit;

    try {
        const where = {
            userId,
            ...(status && { status }),
        };

        const [returns, total] = await Promise.all([
            prisma.returnRequest.findMany({
                where,
                include: {
                    order: {
                        select: {
                            id: true,
                            status: true,
                            total: true,
                            items: {
                                include: {
                                    variant: {
                                        include: {
                                            product: {
                                                select: {
                                                    id: true,
                                                    name: true,
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
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.returnRequest.count({ where }),
        ]);

        const formatted = returns.map((ret) => ({
            id: ret.id,
            status: ret.status,
            reason: ret.reason,
            createdAt: ret.createdAt,
            updatedAt: ret.updatedAt,
            order: {
                id: ret.order.id,
                status: ret.order.status,
                totalAmount: ret.order.total,
                items: ret.order.items.map((item) => ({
                    id: item.id,
                    productName: item.variant.product.name,
                    thumbnail: item.variant.product.images[0]?.url || null,
                    price: item.price,
                    quantity: item.quantity,
                })),
            },
        }));

        return res.status(200).json({
            success: true,
            data: formatted,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get my returns error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch return requests",
        });
    }
};

/**
 * Cancel a return request (User only - only if still REQUESTED)
 * PATCH /api/returns/:id/cancel
 */
const cancelReturnRequest = async (req, res) => {
    const userId = req.user?.id;
    const { id: returnId } = req.params;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find return request
            const returnRequest = await tx.returnRequest.findFirst({
                where: {
                    id: returnId,
                    userId,
                },
                include: {
                    order: true,
                },
            });

            if (!returnRequest) {
                throw new Error("RETURN_NOT_FOUND");
            }

            // 2. Can only cancel if still REQUESTED
            if (returnRequest.status !== "REQUESTED") {
                throw new Error("CANNOT_CANCEL");
            }

            // 3. Update return status to REJECTED (user cancelled)
            const updated = await tx.returnRequest.update({
                where: { id: returnId },
                data: { status: "REJECTED" },
            });

            // 4. Revert order status if it was RETURN_REQUESTED
            if (returnRequest.order.status === "RETURN_REQUESTED") {
                await tx.order.update({
                    where: { id: returnRequest.orderId },
                    data: { status: "DELIVERED" },
                });
            }

            // 5. Audit log
            await tx.auditLog.create({
                data: {
                    userId,
                    action: "UPDATE",
                    entity: "ReturnRequest",
                    entityId: returnId,
                    metadata: {
                        action: "CANCELLED_BY_USER",
                        previousStatus: returnRequest.status,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                },
            });

            return updated;
        });

        return res.status(200).json({
            success: true,
            message: "Return request cancelled successfully",
            data: result,
        });
    } catch (error) {
        console.error("Cancel return error:", error);

        if (error.message === "RETURN_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                error: "Return request not found",
            });
        }

        if (error.message === "CANNOT_CANCEL") {
            return res.status(400).json({
                success: false,
                error: "Cannot cancel return request at this stage",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to cancel return request",
        });
    }
};

// =====================
// REFUND FUNCTIONS (User)
// =====================

/**
 * Get user's refunds
 * GET /api/refunds/my-refunds
 */
const getMyRefunds = async (req, res) => {
    const userId = req.user?.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (page - 1) * limit;

    try {
        const where = {
            order: { userId },
            ...(status && { status }),
        };

        const [refunds, total] = await Promise.all([
            prisma.refund.findMany({
                where,
                include: {
                    order: {
                        select: {
                            id: true,
                            total: true,
                        },
                    },
                    payment: {
                        select: {
                            provider: true,
                            transactionId: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.refund.count({ where }),
        ]);

        const formatted = refunds.map((refund) => ({
            id: refund.id,
            amount: refund.amount,
            reason: refund.reason,
            status: refund.status,
            createdAt: refund.createdAt,
            order: {
                id: refund.order.id,
                totalAmount: refund.order.total,
            },
            payment: {
                provider: refund.payment.provider,
                transactionId: refund.payment.transactionId,
            },
        }));

        return res.status(200).json({
            success: true,
            data: formatted,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get my refunds error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch refunds",
        });
    }
};

// =====================
// ADMIN FUNCTIONS - RETURN REQUESTS
// =====================

/**
 * Get all return requests (Admin only)
 * GET /api/admin/returns
 */
const getAllReturnRequests = async (req, res) => {
    const {
        page = 1,
        limit = 20,
        status,
        userId,
        orderId,
        startDate,
        endDate,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filters
    const where = {};
    
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (orderId) where.orderId = orderId;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    try {
        const [returns, total, stats] = await Promise.all([
            prisma.returnRequest.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            userName: true,
                            email: true,
                        },
                    },
                    order: {
                        select: {
                            id: true,
                            status: true,
                            total: true,
                            items: {
                                include: {
                                    variant: {
                                        include: {
                                            product: {
                                                select: {
                                                    id: true,
                                                    name: true,
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
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.returnRequest.count({ where }),
            // Get status counts
            prisma.returnRequest.groupBy({
                by: ["status"],
                _count: { status: true },
            }),
        ]);

        // Format status counts
        const statusCounts = {};
        stats.forEach((stat) => {
            statusCounts[stat.status] = stat._count.status;
        });

        const formatted = returns.map((ret) => ({
            id: ret.id,
            status: ret.status,
            reason: ret.reason,
            createdAt: ret.createdAt,
            updatedAt: ret.updatedAt,
            user: {
                id: ret.user.id,
                name: ret.user.userName,
                email: ret.user.email,
            },
            order: {
                id: ret.order.id,
                status: ret.order.status,
                totalAmount: ret.order.total,
                items: ret.order.items.map((item) => ({
                    id: item.id,
                    productName: item.variant.product.name,
                    thumbnail: item.variant.product.images[0]?.url || null,
                    price: item.price,
                    quantity: item.quantity,
                })),
            },
        }));

        return res.status(200).json({
            success: true,
            data: formatted,
            stats: statusCounts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get all returns error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch return requests",
        });
    }
};

/**
 * Approve or reject return request (Admin only)
 * PATCH /api/admin/returns/:id/status
 */
const updateReturnStatus = async (req, res) => {
    const adminId = req.user?.id;
    const { id: returnId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ["APPROVED", "REJECTED", "RECEIVED"];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: "Invalid status. Must be APPROVED, REJECTED, or RECEIVED",
        });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find return request
            const returnRequest = await tx.returnRequest.findUnique({
                where: { id: returnId },
                include: {
                    order: {
                        include: {
                            items: true,
                            payment: true,
                        },
                    },
                },
            });

            if (!returnRequest) {
                throw new Error("RETURN_NOT_FOUND");
            }

            // 2. Validate status transitions
            const validTransitions = {
                REQUESTED: ["APPROVED", "REJECTED"],
                APPROVED: ["RECEIVED"],
                REJECTED: [],
                RECEIVED: [],
            };

            if (!validTransitions[returnRequest.status].includes(status)) {
                throw new Error("INVALID_TRANSITION");
            }

            // 3. Update return status
            const updatedReturn = await tx.returnRequest.update({
                where: { id: returnId },
                data: {
                    status,
                    ...(adminNotes && { reason: `${returnRequest.reason} | Admin: ${adminNotes}` }),
                },
            });

            // 4. Handle status-specific actions
            if (status === "REJECTED") {
                // Revert order status to DELIVERED
                await tx.order.update({
                    where: { id: returnRequest.orderId },
                    data: { status: "DELIVERED" },
                });
            } else if (status === "APPROVED") {
                // Order stays RETURN_REQUESTED, waiting for items to be received
                // Could send notification to user here
            } else if (status === "RECEIVED") {
                // Items received, update order to RETURNED
                await tx.order.update({
                    where: { id: returnRequest.orderId },
                    data: { status: "RETURNED" },
                });

                // Restore inventory
                for (const item of returnRequest.order.items) {
                    await tx.inventory.update({
                        where: { variantId: item.variantId },
                        data: { quantity: { increment: item.quantity } },
                    });
                }

                // Create refund if payment was successful
                if (returnRequest.order.payment?.status === "SUCCESS") {
                    await tx.refund.create({
                        data: {
                            orderId: returnRequest.orderId,
                            paymentId: returnRequest.order.payment.id,
                            amount: returnRequest.order.total,
                            reason: `Return approved and items received. ${adminNotes || ""}`,
                            status: "PENDING",
                        },
                    });
                }
            }

            // 5. Audit log
            await tx.auditLog.create({
                data: {
                    userId: adminId,
                    action: "UPDATE",
                    entity: "ReturnRequest",
                    entityId: returnId,
                    metadata: {
                        previousStatus: returnRequest.status,
                        newStatus: status,
                        adminNotes: adminNotes || null,
                        orderId: returnRequest.orderId,
                        autoRefundCreated: status === "RECEIVED" && returnRequest.order.payment?.status === "SUCCESS",
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                },
            });

            return {
                returnRequest: updatedReturn,
                orderStatus: status === "RECEIVED" ? "RETURNED" : 
                           status === "REJECTED" ? "DELIVERED" : "RETURN_REQUESTED",
            };
        });

        return res.status(200).json({
            success: true,
            message: `Return request ${status.toLowerCase()} successfully`,
            data: result,
        });
    } catch (error) {
        console.error("Update return status error:", error);

        if (error.message === "RETURN_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                error: "Return request not found",
            });
        }

        if (error.message === "INVALID_TRANSITION") {
            return res.status(400).json({
                success: false,
                error: `Cannot transition from ${error.currentStatus} to ${status}`,
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to update return request",
        });
    }
};

// =====================
// ADMIN FUNCTIONS - REFUNDS
// =====================

/**
 * Get all refunds (Admin only)
 * GET /api/admin/refunds
 */
const getAllRefunds = async (req, res) => {
    const {
        page = 1,
        limit = 20,
        status,
        orderId,
        userId,
        startDate,
        endDate,
        minAmount,
        maxAmount,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filters
    const where = {};
    
    if (status) where.status = status;
    if (orderId) where.orderId = orderId;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (minAmount !== undefined || maxAmount !== undefined) {
        where.amount = {};
        if (minAmount !== undefined) where.amount.gte = new Decimal(minAmount);
        if (maxAmount !== undefined) where.amount.lte = new Decimal(maxAmount);
    }

    try {
        const [refunds, total, stats] = await Promise.all([
            prisma.refund.findMany({
                where,
                include: {
                    order: {
                        select: {
                            id: true,
                            total: true,
                            user: {
                                select: {
                                    id: true,
                                    userName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    payment: {
                        select: {
                            provider: true,
                            transactionId: true,
                            status: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.refund.count({ where }),
            // Aggregate stats
            prisma.refund.aggregate({
                where,
                _sum: { amount: true },
                _count: { id: true },
                _avg: { amount: true },
            }),
        ]);

        // Get status distribution
        const statusDistribution = await prisma.refund.groupBy({
            by: ["status"],
            _count: { status: true },
            _sum: { amount: true },
        });

        const formatted = refunds.map((refund) => ({
            id: refund.id,
            amount: refund.amount,
            reason: refund.reason,
            status: refund.status,
            createdAt: refund.createdAt,
            order: {
                id: refund.order.id,
                totalAmount: refund.order.total,
                user: {
                    id: refund.order.user.id,
                    name: refund.order.user.userName,
                    email: refund.order.user.email,
                },
            },
            payment: {
                provider: refund.payment.provider,
                transactionId: refund.payment.transactionId,
                status: refund.payment.status,
            },
        }));

        return res.status(200).json({
            success: true,
            data: formatted,
            stats: {
                total: stats._count.id,
                totalAmount: stats._sum.amount || 0,
                averageAmount: stats._avg.amount || 0,
                statusDistribution: statusDistribution.map((s) => ({
                    status: s.status,
                    count: s._count.status,
                    totalAmount: s._sum.amount || 0,
                })),
            },
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get all refunds error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch refunds",
        });
    }
};

/**
 * Process a refund (Admin only)
 * PATCH /api/admin/refunds/:id/process
 */
const processRefund = async (req, res) => {
    const adminId = req.user?.id;
    const { id: refundId } = req.params;
    const { action, adminNotes, partialAmount } = req.body;

    if (!action || !["APPROVE", "REJECT", "PROCESS"].includes(action)) {
        return res.status(400).json({
            success: false,
            error: "Action must be APPROVE, REJECT, or PROCESS",
        });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find refund
            const refund = await tx.refund.findUnique({
                where: { id: refundId },
                include: {
                    order: true,
                    payment: true,
                },
            });

            if (!refund) {
                throw new Error("REFUND_NOT_FOUND");
            }

            // 2. Validate state transitions
            if (action === "APPROVE" && refund.status !== "PENDING") {
                throw new Error("INVALID_STATE_APPROVE");
            }
            if (action === "REJECT" && refund.status !== "PENDING") {
                throw new Error("INVALID_STATE_REJECT");
            }
            if (action === "PROCESS" && refund.status !== "APPROVED") {
                throw new Error("INVALID_STATE_PROCESS");
            }

            let updateData = {};
            let paymentStatusUpdate = {};
            let orderStatusUpdate = {};

            switch (action) {
                case "APPROVE":
                    updateData = { status: "APPROVED" };
                    break;
                    
                case "REJECT":
                    updateData = { status: "REJECTED" };
                    break;
                    
                case "PROCESS":
                    updateData = { status: "PROCESSED" };
                    paymentStatusUpdate = { status: "REFUNDED" };
                    orderStatusUpdate = { status: "REFUNDED" };
                    
                    // If partial refund, mark as partially refunded
                    if (partialAmount && new Decimal(partialAmount).lessThan(refund.amount)) {
                        paymentStatusUpdate = { status: "PARTIALLY_REFUNDED" };
                        // Update refund amount to actual processed amount
                        updateData.amount = new Decimal(partialAmount);
                    }
                    break;
            }

            // 3. Update refund
            const updatedRefund = await tx.refund.update({
                where: { id: refundId },
                data: {
                    ...updateData,
                    reason: adminNotes 
                        ? `${refund.reason} | Admin: ${adminNotes}` 
                        : refund.reason,
                },
            });

            // 4. Update payment status if processing
            if (action === "PROCESS") {
                await tx.payment.update({
                    where: { id: refund.paymentId },
                    data: paymentStatusUpdate,
                });

                await tx.order.update({
                    where: { id: refund.orderId },
                    data: orderStatusUpdate,
                });
            }

            // 5. Audit log
            await tx.auditLog.create({
                data: {
                    userId: adminId,
                    action: "REFUND",
                    entity: "Refund",
                    entityId: refundId,
                    metadata: {
                        action,
                        previousStatus: refund.status,
                        newStatus: updatedRefund.status,
                        amount: refund.amount,
                        processedAmount: partialAmount || refund.amount,
                        adminNotes: adminNotes || null,
                        orderId: refund.orderId,
                        paymentId: refund.paymentId,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                },
            });

            return updatedRefund;
        });

        return res.status(200).json({
            success: true,
            message: `Refund ${action.toLowerCase()}ed successfully`,
            data: result,
        });
    } catch (error) {
        console.error("Process refund error:", error);

        if (error.message === "REFUND_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                error: "Refund not found",
            });
        }

        if (error.message.startsWith("INVALID_STATE")) {
            return res.status(400).json({
                success: false,
                error: "Invalid refund state for this action",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to process refund",
        });
    }
};

/**
 * Create manual refund (Admin only - for special cases)
 * POST /api/admin/refunds
 */
const createManualRefund = async (req, res) => {
    const adminId = req.user?.id;
    const { orderId, amount, reason } = req.body;

    if (!orderId || !amount || !reason) {
        return res.status(400).json({
            success: false,
            error: "Order ID, amount, and reason are required",
        });
    }

    const refundAmount = new Decimal(amount);
    if (refundAmount.lessThanOrEqualTo(0)) {
        return res.status(400).json({
            success: false,
            error: "Refund amount must be greater than 0",
        });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Verify order exists and has payment
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { payment: true },
            });

            if (!order) {
                throw new Error("ORDER_NOT_FOUND");
            }

            if (!order.payment) {
                throw new Error("NO_PAYMENT_FOUND");
            }

            // 2. Check if refund amount exceeds order total
            if (refundAmount.greaterThan(order.total)) {
                throw new Error("AMOUNT_EXCEEDS_TOTAL");
            }

            // 3. Check existing refunds
            const existingRefunds = await tx.refund.aggregate({
                where: { orderId },
                _sum: { amount: true },
            });

            const totalRefunded = new Decimal(existingRefunds._sum.amount || 0);
            if (totalRefunded.plus(refundAmount).greaterThan(order.total)) {
                throw new Error("TOTAL_REFUNDS_EXCEED_ORDER");
            }

            // 4. Create refund
            const refund = await tx.refund.create({
                data: {
                    orderId,
                    paymentId: order.payment.id,
                    amount: refundAmount,
                    reason: `[MANUAL] ${reason}`,
                    status: "PENDING",
                },
            });

            // 5. Audit log
            await tx.auditLog.create({
                data: {
                    userId: adminId,
                    action: "CREATE",
                    entity: "Refund",
                    entityId: refund.id,
                    metadata: {
                        orderId,
                        amount: refundAmount.toFixed(2),
                        reason: `[MANUAL] ${reason}`,
                        manual: true,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                },
            });

            return refund;
        });

        return res.status(201).json({
            success: true,
            message: "Manual refund created successfully",
            data: result,
        });
    } catch (error) {
        console.error("Create manual refund error:", error);

        const errorMap = {
            ORDER_NOT_FOUND: { status: 404, message: "Order not found" },
            NO_PAYMENT_FOUND: { status: 400, message: "Order has no payment record" },
            AMOUNT_EXCEEDS_TOTAL: { status: 400, message: "Refund amount exceeds order total" },
            TOTAL_REFUNDS_EXCEED_ORDER: { status: 400, message: "Total refunds would exceed order total" },
        };

        if (errorMap[error.message]) {
            return res.status(errorMap[error.message].status).json({
                success: false,
                error: errorMap[error.message].message,
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to create manual refund",
        });
    }
};

/**
 * Get return and refund statistics (Admin only)
 * GET /api/admin/returns/stats
 */
const getReturnStats = async (req, res) => {
    const { period = "30d" } = req.query;

    const days = parseInt(period) || 30;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    try {
        const [
            returnStats,
            refundStats,
            recentReturns,
            topReturnReasons,
            avgProcessingTime,
        ] = await prisma.$transaction([
            // Return request stats
            prisma.returnRequest.groupBy({
                by: ["status"],
                _count: { status: true },
                where: {
                    createdAt: { gte: start, lte: end },
                },
            }),
            
            // Refund stats
            prisma.refund.aggregate({
                where: {
                    createdAt: { gte: start, lte: end },
                },
                _count: { id: true },
                _sum: { amount: true },
                _avg: { amount: true },
            }),
            
            // Recent returns trend (last 7 days)
            prisma.returnRequest.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            
            // Top return reasons
            prisma.$queryRaw`
                SELECT reason, COUNT(*) as count 
                FROM "ReturnRequest" 
                WHERE "createdAt" >= ${start}
                GROUP BY reason 
                ORDER BY count DESC 
                LIMIT 5
            `,
            
            // Average processing time (returns approved within period)
            prisma.$queryRaw`
                SELECT AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600) as avg_hours
                FROM "ReturnRequest"
                WHERE "status" IN ('APPROVED', 'REJECTED', 'RECEIVED')
                AND "updatedAt" >= ${start}
                AND "updatedAt" IS NOT NULL
            `,
        ]);

        // Build return status distribution
        const returnDistribution = {
            REQUESTED: 0,
            APPROVED: 0,
            REJECTED: 0,
            RECEIVED: 0,
        };
        returnStats.forEach((stat) => {
            returnDistribution[stat.status] = stat._count.status;
        });

        return res.status(200).json({
            success: true,
            data: {
                period: { days, start, end },
                returns: {
                    total: Object.values(returnDistribution).reduce((a, b) => a + b, 0),
                    distribution: returnDistribution,
                    recent7Days: recentReturns,
                    avgProcessingHours: avgProcessingTime[0]?.avg_hours || 0,
                    topReasons: topReturnReasons,
                },
                refunds: {
                    total: refundStats._count.id,
                    totalAmount: refundStats._sum.amount || 0,
                    averageAmount: refundStats._avg.amount || 0,
                },
            },
        });
    } catch (error) {
        console.error("Get return stats error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch statistics",
        });
    }
};

export {
    // User functions
    createReturnRequest,
    getMyReturnRequests,
    cancelReturnRequest,
    getMyRefunds,
    
    // Admin functions
    getAllReturnRequests,
    updateReturnStatus,
    getAllRefunds,
    processRefund,
    createManualRefund,
    getReturnStats,
};