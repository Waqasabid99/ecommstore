import { prisma } from "../config/prisma.js";
import { calculatePricing } from "../constants/pricing.js";

/**
 * Get all coupons (Admin only)
 * GET /api/admin/coupons
 */
const getAllCoupons = async (req, res) => {
    const { page = 1, limit = 20, isActive, search } = req.query;
    const skip = (page - 1) * limit;

    try {
        const where = {
            ...(isActive !== undefined && { isActive: isActive === "true" }),
            ...(search && {
                code: {
                    contains: search,
                    mode: "insensitive",
                },
            }),
        };

        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.coupon.count({ where }),
        ]);

        const enrichedCoupons = coupons.map((coupon) => ({
            ...coupon,
            isExpired: new Date() > coupon.expiresAt,
            remainingUses: coupon.usageLimit
                ? coupon.usageLimit - coupon.usedCount
                : null,
            usagePercentage: coupon.usageLimit
                ? Math.round((coupon.usedCount / coupon.usageLimit) * 100)
                : null,
        }));

        return res.status(200).json({
            success: true,
            data: enrichedCoupons,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get all coupons error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Get coupon by ID (Admin only)
 * GET /api/admin/coupons/:id
 */
const getCouponById = async (req, res) => {
    const { id } = req.params;

    try {
        const coupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: "Coupon not found",
            });
        }

        const enrichedCoupon = {
            ...coupon,
            isExpired: new Date() > coupon.expiresAt,
            remainingUses: coupon.usageLimit
                ? coupon.usageLimit - coupon.usedCount
                : null,
            usagePercentage: coupon.usageLimit
                ? Math.round((coupon.usedCount / coupon.usageLimit) * 100)
                : null,
        };

        return res.status(200).json({
            success: true,
            data: enrichedCoupon,
        });
    } catch (error) {
        console.error("Get coupon error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Create coupon (Admin only)
 * POST /api/admin/coupons
 */
const createCoupon = async (req, res) => {
    const {
        code,
        discountType = "PERCENT",
        discountValue,
        minCartTotal,
        expiresAt,
        usageLimit,
        isActive = true,
    } = req.body;

    if (!code || !discountValue || !expiresAt) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: code, discountValue, expiresAt",
        });
    }

    if (!["PERCENT", "FIXED"].includes(discountType)) {
        return res.status(400).json({
            success: false,
            error: "Invalid discount type. Must be PERCENT or FIXED",
        });
    }

    if (discountType === "PERCENT" && (discountValue < 1 || discountValue > 100)) {
        return res.status(400).json({
            success: false,
            error: "Discount percentage must be between 1 and 100",
        });
    }

    if (discountType === "FIXED" && discountValue <= 0) {
        return res.status(400).json({
            success: false,
            error: "Fixed discount amount must be greater than 0",
        });
    }

    const expirationDate = new Date(expiresAt);
    if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
        return res.status(400).json({
            success: false,
            error: "Invalid expiration date. Must be a future date",
        });
    }

    if (usageLimit !== undefined && usageLimit < 1) {
        return res.status(400).json({
            success: false,
            error: "Usage limit must be at least 1",
        });
    }

    if (minCartTotal !== undefined && minCartTotal < 0) {
        return res.status(400).json({
            success: false,
            error: "Minimum cart total must be 0 or greater",
        });
    }

    try {
        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase().trim(),
                discountType,
                discountValue: Number(discountValue),
                minCartTotal: minCartTotal ? Number(minCartTotal) : null,
                expiresAt: expirationDate,
                usageLimit: usageLimit ? Number(usageLimit) : null,
                isActive,
                usedCount: 0,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: coupon,
        });
    } catch (error) {
        console.error("Create coupon error:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                error: "Coupon code already exists",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Update coupon (Admin only)
 * PUT /api/admin/coupons/:id
 */
const updateCoupon = async (req, res) => {
    const { id } = req.params;
    const { code, discountType, discountValue, minCartTotal, expiresAt, usageLimit, isActive } =
        req.body;

    try {
        const existingCoupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!existingCoupon) {
            return res.status(404).json({
                success: false,
                error: "Coupon not found",
            });
        }

        const updateData = {};

        if (code !== undefined) {
            updateData.code = code.toUpperCase().trim();
        }

        if (discountType !== undefined) {
            if (!["PERCENT", "FIXED"].includes(discountType)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid discount type. Must be PERCENT or FIXED",
                });
            }
            updateData.discountType = discountType;
        }

        if (discountValue !== undefined) {
            const type = discountType || existingCoupon.discountType;

            if (type === "PERCENT" && (discountValue < 1 || discountValue > 100)) {
                return res.status(400).json({
                    success: false,
                    error: "Discount percentage must be between 1 and 100",
                });
            }

            if (type === "FIXED" && discountValue <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Fixed discount amount must be greater than 0",
                });
            }

            updateData.discountValue = Number(discountValue);
        }

        if (minCartTotal !== undefined) {
            if (minCartTotal !== null && minCartTotal < 0) {
                return res.status(400).json({
                    success: false,
                    error: "Minimum cart total must be 0 or greater",
                });
            }
            updateData.minCartTotal = minCartTotal ? Number(minCartTotal) : null;
        }

        if (expiresAt !== undefined) {
            const expirationDate = new Date(expiresAt);
            if (isNaN(expirationDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid expiration date format",
                });
            }
            updateData.expiresAt = expirationDate;
        }

        if (usageLimit !== undefined) {
            if (usageLimit !== null && usageLimit < existingCoupon.usedCount) {
                return res.status(400).json({
                    success: false,
                    error: `Usage limit cannot be less than current usage count (${existingCoupon.usedCount})`,
                });
            }
            updateData.usageLimit = usageLimit ? Number(usageLimit) : null;
        }

        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive);
        }

        const updatedCoupon = await prisma.coupon.update({
            where: { id },
            data: updateData,
        });

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: updatedCoupon,
        });
    } catch (error) {
        console.error("Update coupon error:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                error: "Coupon code already exists",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Delete coupon (Admin only)
 * DELETE /api/admin/coupons/:id
 */
const deleteCoupon = async (req, res) => {
    const { id } = req.params;

    try {
        const coupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: "Coupon not found",
            });
        }

        await prisma.coupon.update({
            where: { id },
            data: { isActive: false },
        });

        return res.status(200).json({
            success: true,
            message: "Coupon deactivated successfully",
        });
    } catch (error) {
        console.error("Delete coupon error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Toggle coupon active status (Admin only)
 * PATCH /api/admin/coupons/:id/toggle
 */
const toggleCouponStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const coupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: "Coupon not found",
            });
        }

        const updatedCoupon = await prisma.coupon.update({
            where: { id },
            data: { isActive: !coupon.isActive },
        });

        return res.status(200).json({
            success: true,
            message: `Coupon ${updatedCoupon.isActive ? "activated" : "deactivated"} successfully`,
            data: updatedCoupon,
        });
    } catch (error) {
        console.error("Toggle coupon status error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Validate and apply coupon (Public - for checkout preview)
 * POST /api/coupons/validate
 */
const validateCoupon = async (req, res) => {
    const { code, cartTotal } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            error: "Coupon code is required",
        });
    }

    if (!cartTotal || cartTotal <= 0) {
        return res.status(400).json({
            success: false,
            error: "Valid cart total is required",
        });
    }

    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase().trim() },
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: "Invalid coupon code",
            });
        }

        if (!coupon.isActive) {
            return res.status(400).json({
                success: false,
                error: "This coupon is no longer active",
            });
        }

        if (new Date() > coupon.expiresAt) {
            return res.status(400).json({
                success: false,
                error: "This coupon has expired",
                expiresAt: coupon.expiresAt,
            });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                error: "This coupon has reached its usage limit",
            });
        }

        if (coupon.minCartTotal && cartTotal < parseFloat(coupon.minCartTotal)) {
            return res.status(400).json({
                success: false,
                error: `Minimum cart total of ${coupon.minCartTotal} required`,
                minCartTotal: coupon.minCartTotal,
            });
        }

        let discount;
        if (coupon.discountType === "PERCENT") {
            discount = (cartTotal * coupon.discountValue) / 100;
        } else {
            discount = Math.min(coupon.discountValue, cartTotal);
        }

        const finalTotal = Math.max(cartTotal - discount, 0);

        return res.status(200).json({
            success: true,
            message: "Coupon is valid",
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount: discount.toFixed(2),
                originalTotal: cartTotal,
                finalTotal: finalTotal.toFixed(2),
                expiresAt: coupon.expiresAt,
                minCartTotal: coupon.minCartTotal,
            },
        });
    } catch (error) {
        console.error("Validate coupon error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Apply coupon to cart
 * POST /api/cart/coupon
 */
const applyCoupon = async (req, res) => {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code || typeof code !== "string") {
        return res.status(400).json({
            success: false,
            error: "Coupon code is required",
        });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findFirst({
                where: { userId, status: "ACTIVE" },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!cart) {
                throw new Error("Cart not found");
            }

            if (cart.items.length === 0) {
                throw new Error("Cannot apply coupon to empty cart");
            }

            const coupon = await tx.coupon.findUnique({
                where: { code: code.toUpperCase() },
            });

            if (!coupon) {
                throw new Error("Invalid coupon code");
            }

            if (!coupon.isActive) {
                throw new Error("This coupon is no longer active");
            }

            if (new Date() > coupon.expiresAt) {
                throw new Error("This coupon has expired");
            }

            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                throw new Error("This coupon has reached its usage limit");
            }

            const pricing = calculatePricing({
                items: cart.items,
                coupon,
                taxRate: cart.taxRate ? parseFloat(cart.taxRate) : 0,
            });

            if (!pricing.couponId) {
                if (
                    coupon.minCartTotal &&
                    parseFloat(pricing.subtotal) < parseFloat(coupon.minCartTotal)
                ) {
                    throw new Error(`Minimum cart total of ${coupon.minCartTotal} required`);
                }
                throw new Error("Coupon requirements not met");
            }

            await tx.cart.update({
                where: { id: cart.id },
                data: {
                    couponId: coupon.id,
                    subtotal: pricing.subtotal,
                    discountPct: pricing.discountPct,
                    discountAmount: pricing.discountAmount,
                    taxAmount: pricing.taxAmount,
                    total: pricing.total,
                },
            });

            return { coupon, pricing };
        });

        return res.status(200).json({
            success: true,
            message: "Coupon applied successfully",
            data: {
                coupon: {
                    code: result.coupon.code,
                    discountType: result.coupon.discountType,
                    discountValue: result.coupon.discountValue,
                },
                summary: {
                    subtotal: result.pricing.subtotal,
                    discountAmount: result.pricing.discountAmount,
                    taxAmount: result.pricing.taxAmount,
                    total: result.pricing.total,
                },
            },
        });
    } catch (error) {
        console.error("Apply coupon error:", error);
        return res.status(400).json({
            success: false,
            error: error.message || "Failed to apply coupon",
        });
    }
};

/**
 * Remove coupon from cart
 * DELETE /api/cart/coupon
 */
const removeCoupon = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findFirst({
                where: { userId, status: "ACTIVE" },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!cart) {
                throw new Error("Cart not found");
            }

            const pricing = calculatePricing({
                items: cart.items,
                coupon: null,
                taxRate: cart.taxRate ? parseFloat(cart.taxRate) : 0,
            });

            await tx.cart.update({
                where: { id: cart.id },
                data: {
                    couponId: null,
                    subtotal: pricing.subtotal,
                    discountPct: null,
                    discountAmount: null,
                    taxAmount: pricing.taxAmount,
                    total: pricing.total,
                },
            });

            return pricing;
        });

        return res.status(200).json({
            success: true,
            message: "Coupon removed successfully",
            data: {
                summary: {
                    subtotal: result.subtotal,
                    total: result.total,
                },
            },
        });
    } catch (error) {
        console.error("Remove coupon error:", error);
        return res.status(400).json({
            success: false,
            error: error.message || "Failed to remove coupon",
        });
    }
};

/**
 * Get coupon usage statistics (Admin only)
 * GET /api/admin/coupons/:id/stats
 */
const getCouponStats = async (req, res) => {
    const { id } = req.params;

    try {
        const coupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: "Coupon not found",
            });
        }

        const stats = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minCartTotal: coupon.minCartTotal,
            totalUses: coupon.usedCount,
            usageLimit: coupon.usageLimit,
            remainingUses: coupon.usageLimit
                ? coupon.usageLimit - coupon.usedCount
                : "Unlimited",
            isActive: coupon.isActive,
            isExpired: new Date() > coupon.expiresAt,
            expiresAt: coupon.expiresAt,
            usageRate: coupon.usageLimit
                ? `${Math.round((coupon.usedCount / coupon.usageLimit) * 100)}%`
                : "N/A",
        };

        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error("Get coupon stats error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Bulk create coupons (Admin only)
 * POST /api/admin/coupons/bulk
 */
const bulkCreateCoupons = async (req, res) => {
    const {
        prefix,
        count,
        discountType = "PERCENT",
        discountValue,
        minCartTotal,
        expiresAt,
        usageLimit,
        isActive = true,
    } = req.body;

    if (!prefix || !count || !discountValue || !expiresAt) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: prefix, count, discountValue, expiresAt",
        });
    }

    if (count < 1 || count > 1000) {
        return res.status(400).json({
            success: false,
            error: "Count must be between 1 and 1000",
        });
    }

    if (!["PERCENT", "FIXED"].includes(discountType)) {
        return res.status(400).json({
            success: false,
            error: "Invalid discount type. Must be PERCENT or FIXED",
        });
    }

    if (discountType === "PERCENT" && (discountValue < 1 || discountValue > 100)) {
        return res.status(400).json({
            success: false,
            error: "Discount percentage must be between 1 and 100",
        });
    }

    if (discountType === "FIXED" && discountValue <= 0) {
        return res.status(400).json({
            success: false,
            error: "Fixed discount amount must be greater than 0",
        });
    }

    const expirationDate = new Date(expiresAt);
    if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
        return res.status(400).json({
            success: false,
            error: "Invalid expiration date. Must be a future date",
        });
    }

    if (minCartTotal !== undefined && minCartTotal < 0) {
        return res.status(400).json({
            success: false,
            error: "Minimum cart total must be 0 or greater",
        });
    }

    try {
        const couponsData = [];
        const generatedCodes = new Set();

        for (let i = 0; i < count; i++) {
            let code;
            do {
                const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
                code = `${prefix.toUpperCase()}-${randomStr}`;
            } while (generatedCodes.has(code));

            generatedCodes.add(code);

            couponsData.push({
                code,
                discountType,
                discountValue: Number(discountValue),
                minCartTotal: minCartTotal ? Number(minCartTotal) : null,
                expiresAt: expirationDate,
                usageLimit: usageLimit ? Number(usageLimit) : null,
                isActive,
                usedCount: 0,
            });
        }

        const result = await prisma.coupon.createMany({
            data: couponsData,
            skipDuplicates: true,
        });

        return res.status(201).json({
            success: true,
            message: `${result.count} coupons created successfully`,
            data: {
                created: result.count,
                codes: Array.from(generatedCodes),
            },
        });
    } catch (error) {
        console.error("Bulk create coupons error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

export {
    getAllCoupons,
    getCouponById,
    createCoupon,
    applyCoupon,
    removeCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    getCouponStats,
    bulkCreateCoupons,
};