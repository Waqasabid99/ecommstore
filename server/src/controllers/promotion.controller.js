import { prisma } from "../config/prisma.js";
import { getPromotionStatus } from "../constants/constants.js";
import { calculatePricing } from "../constants/pricing.js";

/**
 * Get all promotions (Admin only)
 * GET /api/admin/promotions
 */
const getAllPromotions = async (req, res) => {
    const { page = 1, limit = 20, isActive, appliesTo, search } = req.query;
    const skip = (page - 1) * limit;

    try {
        const where = {
            ...(isActive !== undefined && { isActive: isActive === "true" }),
            ...(appliesTo && { appliesTo }),
            ...(search && {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            }),
        };

        const [promotions, total] = await Promise.all([
            prisma.promotion.findMany({
                where,
                include: {
                    products: { select: { id: true, name: true, slug: true } },
                    variants: { select: { id: true, sku: true } },
                    categories: { select: { id: true, name: true, slug: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.promotion.count({ where }),
        ]);

        // Enhance with status
        const enrichedPromotions = promotions.map((promo) => ({
            ...promo,
            status: getPromotionStatus(promo),
            affectedCount: {
                products: promo.products.length,
                variants: promo.variants.length,
                categories: promo.categories.length,
            },
        }));

        return res.status(200).json({
            success: true,
            data: enrichedPromotions,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get all promotions error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Get promotion by ID (Admin only)
 * GET /api/admin/promotions/:id
 */
const getPromotionById = async (req, res) => {
    const { id } = req.params;

    try {
        const promotion = await prisma.promotion.findUnique({
            where: { id },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: { where: { isMain: true }, take: 1 },
                    },
                },
                variants: {
                    select: {
                        id: true,
                        sku: true,
                        price: true,
                        product: { select: { name: true } },
                    },
                },
                categories: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        if (!promotion) {
            return res.status(404).json({
                success: false,
                error: "Promotion not found",
            });
        }

        const enrichedPromotion = {
            ...promotion,
            status: getPromotionStatus(promotion),
        };

        return res.status(200).json({
            success: true,
            data: enrichedPromotion,
        });
    } catch (error) {
        console.error("Get promotion error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Create promotion (Admin only)
 * POST /api/admin/promotions
 */
const createPromotion = async (req, res) => {
    const {
        name,
        description,
        discountType,
        discountValue,
        startsAt,
        endsAt,
        appliesTo,
        isStackable = false,
        isActive = true,
        productIds = [],
        variantIds = [],
        categoryIds = [],
    } = req.body;

    // Validation
    if (!name || !discountType || !discountValue || !startsAt || !endsAt || !appliesTo) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: name, discountType, discountValue, startsAt, endsAt, appliesTo",
        });
    }

    if (!["PERCENT", "FIXED"].includes(discountType)) {
        return res.status(400).json({
            success: false,
            error: "Invalid discount type. Must be PERCENT or FIXED",
        });
    }

    if (!["PRODUCT", "VARIANT", "CATEGORY", "CART"].includes(appliesTo)) {
        return res.status(400).json({
            success: false,
            error: "Invalid appliesTo. Must be PRODUCT, VARIANT, CATEGORY, or CART",
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

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
            success: false,
            error: "Invalid date format",
        });
    }

    if (endDate <= startDate) {
        return res.status(400).json({
            success: false,
            error: "End date must be after start date",
        });
    }

    // Validate that appropriate IDs are provided
    if (appliesTo === "PRODUCT" && productIds.length === 0) {
        return res.status(400).json({
            success: false,
            error: "Product IDs required when appliesTo is PRODUCT",
        });
    }

    if (appliesTo === "VARIANT" && variantIds.length === 0) {
        return res.status(400).json({
            success: false,
            error: "Variant IDs required when appliesTo is VARIANT",
        });
    }

    if (appliesTo === "CATEGORY" && categoryIds.length === 0) {
        return res.status(400).json({
            success: false,
            error: "Category IDs required when appliesTo is CATEGORY",
        });
    }

    try {
        const promotion = await prisma.promotion.create({
            data: {
                name,
                description,
                discountType,
                discountValue: Number(discountValue),
                startsAt: startDate,
                endsAt: endDate,
                appliesTo,
                isStackable,
                isActive,
                ...(appliesTo === "PRODUCT" && {
                    products: {
                        connect: productIds.map((id) => ({ id })),
                    },
                }),
                ...(appliesTo === "VARIANT" && {
                    variants: {
                        connect: variantIds.map((id) => ({ id })),
                    },
                }),
                ...(appliesTo === "CATEGORY" && {
                    categories: {
                        connect: categoryIds.map((id) => ({ id })),
                    },
                }),
            },
            include: {
                products: true,
                variants: true,
                categories: true,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Promotion created successfully",
            data: promotion,
        });
    } catch (error) {
        console.error("Create promotion error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Update promotion (Admin only)
 * PUT /api/admin/promotions/:id
 */
const updatePromotion = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        description,
        discountType,
        discountValue,
        startsAt,
        endsAt,
        isStackable,
        isActive,
        productIds,
        variantIds,
        categoryIds,
    } = req.body;

    try {
        const existingPromotion = await prisma.promotion.findUnique({
            where: { id },
        });

        if (!existingPromotion) {
            return res.status(404).json({
                success: false,
                error: "Promotion not found",
            });
        }

        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (isStackable !== undefined) updateData.isStackable = Boolean(isStackable);
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        if (discountType !== undefined) {
            if (!["PERCENT", "FIXED"].includes(discountType)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid discount type",
                });
            }
            updateData.discountType = discountType;
        }

        if (discountValue !== undefined) {
            const type = discountType || existingPromotion.discountType;

            if (type === "PERCENT" && (discountValue < 1 || discountValue > 100)) {
                return res.status(400).json({
                    success: false,
                    error: "Discount percentage must be between 1 and 100",
                });
            }

            if (type === "FIXED" && discountValue <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Fixed discount must be greater than 0",
                });
            }

            updateData.discountValue = Number(discountValue);
        }

        if (startsAt !== undefined) {
            const startDate = new Date(startsAt);
            if (isNaN(startDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid start date",
                });
            }
            updateData.startsAt = startDate;
        }

        if (endsAt !== undefined) {
            const endDate = new Date(endsAt);
            if (isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid end date",
                });
            }
            updateData.endsAt = endDate;
        }

        // Update relationships
        if (productIds !== undefined) {
            updateData.products = {
                set: productIds.map((id) => ({ id })),
            };
        }

        if (variantIds !== undefined) {
            updateData.variants = {
                set: variantIds.map((id) => ({ id })),
            };
        }

        if (categoryIds !== undefined) {
            updateData.categories = {
                set: categoryIds.map((id) => ({ id })),
            };
        }

        const updatedPromotion = await prisma.promotion.update({
            where: { id },
            data: updateData,
            include: {
                products: true,
                variants: true,
                categories: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Promotion updated successfully",
            data: updatedPromotion,
        });
    } catch (error) {
        console.error("Update promotion error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Delete promotion (Admin only)
 * DELETE /api/admin/promotions/:id
 */
const deletePromotion = async (req, res) => {
    const { id } = req.params;

    try {
        const promotion = await prisma.promotion.findUnique({
            where: { id },
        });

        if (!promotion) {
            return res.status(404).json({
                success: false,
                error: "Promotion not found",
            });
        }

        // Soft delete by deactivating
        await prisma.promotion.update({
            where: { id },
            data: { isActive: false },
        });

        return res.status(200).json({
            success: true,
            message: "Promotion deactivated successfully",
        });
    } catch (error) {
        console.error("Delete promotion error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Toggle promotion active status (Admin only)
 * PATCH /api/admin/promotions/:id/toggle
 */
const togglePromotionStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const promotion = await prisma.promotion.findUnique({
            where: { id },
        });

        if (!promotion) {
            return res.status(404).json({
                success: false,
                error: "Promotion not found",
            });
        }

        const updatedPromotion = await prisma.promotion.update({
            where: { id },
            data: { isActive: !promotion.isActive },
        });

        return res.status(200).json({
            success: true,
            message: `Promotion ${updatedPromotion.isActive ? "activated" : "deactivated"} successfully`,
            data: updatedPromotion,
        });
    } catch (error) {
        console.error("Toggle promotion status error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

export {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
};