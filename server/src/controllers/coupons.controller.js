import { prisma } from "../config/prisma.js";

// Get all coupons (Admin only)
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

        // Enhance with usage statistics
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

// Get coupon by ID (Admin only)
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

// Create coupon (Admin only)
const createCoupon = async (req, res) => {
    const { code, discountPct, expiresAt, usageLimit, isActive = true } =
        req.body;

    // Validation
    if (!code || !discountPct || !expiresAt) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: code, discountPct, expiresAt",
        });
    }

    if (discountPct < 1 || discountPct > 100) {
        return res.status(400).json({
            success: false,
            error: "Discount percentage must be between 1 and 100",
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

    try {
        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase().trim(),
                discountPct: Number(discountPct),
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

// Update coupon (Admin only)
const updateCoupon = async (req, res) => {
    const { id } = req.params;
    const { code, discountPct, expiresAt, usageLimit, isActive } = req.body;

    try {
        // Check if coupon exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!existingCoupon) {
            return res.status(404).json({
                success: false,
                error: "Coupon not found",
            });
        }

        // Validation
        const updateData = {};

        if (code !== undefined) {
            updateData.code = code.toUpperCase().trim();
        }

        if (discountPct !== undefined) {
            if (discountPct < 1 || discountPct > 100) {
                return res.status(400).json({
                    success: false,
                    error: "Discount percentage must be between 1 and 100",
                });
            }
            updateData.discountPct = Number(discountPct);
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

// Delete coupon (Admin only)
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

        // Soft delete by deactivating instead of hard delete
        // This preserves historical data
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

// Toggle coupon active status (Admin only)
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

// Validate and apply coupon (Public - for checkout preview)
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

        // Validation checks
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

        // Calculate discount
        const discount = (cartTotal * coupon.discountPct) / 100;
        const finalTotal = cartTotal - discount;

        return res.status(200).json({
            success: true,
            message: "Coupon is valid",
            data: {
                code: coupon.code,
                discountPct: coupon.discountPct,
                discountAmount: discount.toFixed(2),
                originalTotal: cartTotal.toFixed(2),
                finalTotal: finalTotal.toFixed(2),
                expiresAt: coupon.expiresAt,
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

// Get coupon usage statistics (Admin only)
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

        // Note: This requires audit logs or order tracking
        // For now, returning basic stats from the coupon itself
        const stats = {
            code: coupon.code,
            discountPct: coupon.discountPct,
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

// Bulk create coupons (Admin only)
const bulkCreateCoupons = async (req, res) => {
    const { prefix, count, discountPct, expiresAt, usageLimit, isActive = true } = req.body;

    if (!prefix || !count || !discountPct || !expiresAt) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: prefix, count, discountPct, expiresAt",
        });
    }

    if (count < 1 || count > 1000) {
        return res.status(400).json({
            success: false,
            error: "Count must be between 1 and 1000",
        });
    }

    if (discountPct < 1 || discountPct > 100) {
        return res.status(400).json({
            success: false,
            error: "Discount percentage must be between 1 and 100",
        });
    }

    const expirationDate = new Date(expiresAt);
    if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
        return res.status(400).json({
            success: false,
            error: "Invalid expiration date. Must be a future date",
        });
    }

    try {
        const couponsData = [];
        const generatedCodes = new Set();

        // Generate unique coupon codes
        for (let i = 0; i < count; i++) {
            let code;
            do {
                const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
                code = `${prefix.toUpperCase()}-${randomStr}`;
            } while (generatedCodes.has(code));
            
            generatedCodes.add(code);
            
            couponsData.push({
                code,
                discountPct: Number(discountPct),
                expiresAt: expirationDate,
                usageLimit: usageLimit ? Number(usageLimit) : null,
                isActive,
                usedCount: 0,
            });
        }

        // Create all coupons
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
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    getCouponStats,
    bulkCreateCoupons,
};