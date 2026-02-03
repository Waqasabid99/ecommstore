import { prisma } from "../config/prisma.js";
import Decimal from "decimal.js";

// =====================
// USER FUNCTIONS
// =====================

/**
 * Create a review (User only - must have purchased product)
 * POST /api/reviews
 */
const createReview = async (req, res) => {
    const userId = req.user?.id;
    const { productId, rating, comment } = req.body;

    // Validation
    if (!productId || !rating) {
        return res.status(400).json({
            success: false,
            error: "Product ID and rating are required",
        });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            error: "Rating must be an integer between 1 and 5",
        });
    }

    try {
        const review = await prisma.$transaction(async (tx) => {
            // 1. Check if product exists and is active
            const product = await tx.product.findFirst({
                where: {
                    id: productId,
                    isActive: true,
                    deletedAt: null,
                },
            });

            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }

            // 2. Check if user has already reviewed this product
            const existingReview = await tx.review.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });

            if (existingReview) {
                throw new Error("ALREADY_REVIEWED");
            }

            // 3. Verify user has purchased the product (delivered order)
            const hasPurchased = await tx.order.findFirst({
                where: {
                    userId,
                    status: {
                        in: ["DELIVERED", "PAID", "SHIPPED"],
                    },
                    items: {
                        some: {
                            variant: {
                                productId,
                            },
                        },
                    },
                },
            });

            if (!hasPurchased) {
                throw new Error("PURCHASE_REQUIRED");
            }

            // 4. Create review
            const newReview = await tx.review.create({
                data: {
                    userId,
                    productId,
                    rating,
                    comment: comment?.trim() || null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            userName: true,
                        },
                    },
                },
            });

            // 5. Audit log
            await tx.auditLog.create({
                data: {
                    userId,
                    action: "CREATE",
                    entity: "Review",
                    entityId: newReview.id,
                    metadata: {
                        productId,
                        rating,
                        hasComment: !!comment,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                },
            });

            return newReview;
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: review,
        });
    } catch (error) {
        console.error("Create review error:", error);

        if (error.message === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                error: "Product not found or inactive",
            });
        }

        if (error.message === "ALREADY_REVIEWED") {
            return res.status(409).json({
                success: false,
                error: "You have already reviewed this product",
            });
        }

        if (error.message === "PURCHASE_REQUIRED") {
            return res.status(403).json({
                success: false,
                error: "You can only review products you have purchased",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to submit review",
        });
    }
};

/**
 * Get user's own reviews
 * GET /api/reviews/my-reviews
 */
const getMyReviews = async (req, res) => {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    try {
        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { userId },
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
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.review.count({ where: { userId } }),
        ]);

        const formatted = reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            product: {
                id: review.product.id,
                name: review.product.name,
                slug: review.product.slug,
                thumbnail: review.product.images[0]?.url || null,
            },
            createdAt: review.createdAt,
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
        console.error("Get my reviews error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch reviews",
        });
    }
};

/**
 * Update own review
 * PATCH /api/reviews/:id
 */
const updateReview = async (req, res) => {
    const userId = req.user?.id;
    const { id: reviewId } = req.params;
    const { rating, comment } = req.body;

    if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
        return res.status(400).json({
            success: false,
            error: "Rating must be an integer between 1 and 5",
        });
    }

    try {
        const review = await prisma.review.findFirst({
            where: {
                id: reviewId,
                userId,
            },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                error: "Review not found",
            });
        }

        // Prevent updating very old reviews (optional - e.g., 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (review.createdAt < thirtyDaysAgo) {
            return res.status(403).json({
                success: false,
                error: "Reviews can only be edited within 30 days of creation",
            });
        }

        const updatedReview = await prisma.$transaction(async (tx) => {
            const updated = await tx.review.update({
                where: { id: reviewId },
                data: {
                    rating: rating ?? review.rating,
                    comment: comment?.trim() ?? review.comment,
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            // Audit log
            await tx.auditLog.create({
                data: {
                    userId,
                    action: "UPDATE",
                    entity: "Review",
                    entityId: reviewId,
                    metadata: {
                        oldRating: review.rating,
                        newRating: rating ?? review.rating,
                        productId: review.productId,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                },
            });

            return updated;
        });

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: updatedReview,
        });
    } catch (error) {
        console.error("Update review error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to update review",
        });
    }
};

/**
 * Delete own review
 * DELETE /api/reviews/:id
 */
const deleteReview = async (req, res) => {
    const userId = req.user?.id;
    const { id: reviewId } = req.params;

    try {
        const review = await prisma.review.findFirst({
            where: {
                id: reviewId,
                userId,
            },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                error: "Review not found",
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.review.delete({
                where: { id: reviewId },
            });

            // Audit log
            await tx.auditLog.create({
                data: {
                    userId,
                    action: "DELETE",
                    entity: "Review",
                    entityId: reviewId,
                    metadata: {
                        productId: review.productId,
                        rating: review.rating,
                        selfDeleted: true,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                },
            });
        });

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        console.error("Delete review error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete review",
        });
    }
};

// =====================
// PUBLIC FUNCTIONS
// =====================

/**
 * Get reviews for a specific product (Public)
 * GET /api/reviews/product/:productId
 */
const getProductReviews = async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = "newest" } = req.query;

    const skip = (page - 1) * limit;

    // Sort options
    const orderBy = {
        newest: { createdAt: "desc" },
        oldest: { createdAt: "asc" },
        highest: { rating: "desc" },
        lowest: { rating: "asc" },
    }[sortBy] || { createdAt: "desc" };

    try {
        const [reviews, total, ratingStats] = await prisma.$transaction([
            prisma.review.findMany({
                where: { productId },
                include: {
                    user: {
                        select: {
                            id: true,
                            userName: true,
                        },
                    },
                },
                orderBy,
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.review.count({ where: { productId } }),
            // Get rating distribution
            prisma.review.groupBy({
                by: ["rating"],
                where: { productId },
                _count: { rating: true },
            }),
        ]);

        // Calculate average rating and distribution
        const totalReviews = total;
        const sumRatings = ratingStats.reduce(
            (sum, stat) => sum + stat.rating * stat._count.rating,
            0
        );
        const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

        // Build rating distribution (1-5 stars)
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingStats.forEach((stat) => {
            distribution[stat.rating] = stat._count.rating;
        });

        const formatted = reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            user: {
                id: review.user.id,
                name: review.user.userName,
            },
            createdAt: review.createdAt,
        }));

        return res.status(200).json({
            success: true,
            data: formatted,
            summary: {
                total: totalReviews,
                average: Number(averageRating.toFixed(1)),
                distribution,
            },
            pagination: {
                total: totalReviews,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(totalReviews / limit),
            },
        });
    } catch (error) {
        console.error("Get product reviews error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch reviews",
        });
    }
};

/**
 * Check if user can review a product (for UI)
 * GET /api/reviews/can-review/:productId
 */
const canReviewProduct = async (req, res) => {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) {
        return res.status(200).json({
            success: true,
            data: {
                canReview: false,
                reason: "LOGIN_REQUIRED",
            },
        });
    }

    try {
        // Check if already reviewed
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existingReview) {
            return res.status(200).json({
                success: true,
                data: {
                    canReview: false,
                    reason: "ALREADY_REVIEWED",
                    reviewId: existingReview.id,
                },
            });
        }

        // Check if purchased
        const hasPurchased = await prisma.order.findFirst({
            where: {
                userId,
                status: {
                    in: ["DELIVERED", "PAID", "SHIPPED"],
                },
                items: {
                    some: {
                        variant: {
                            productId,
                        },
                    },
                },
            },
        });

        if (!hasPurchased) {
            return res.status(200).json({
                success: true,
                data: {
                    canReview: false,
                    reason: "PURCHASE_REQUIRED",
                },
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                canReview: true,
            },
        });
    } catch (error) {
        console.error("Can review check error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to check review eligibility",
        });
    }
};

// =====================
// ADMIN FUNCTIONS
// =====================

/**
 * Get all reviews (Admin only)
 * GET /api/admin/reviews
 */
const getAllReviews = async (req, res) => {
    const {
        page = 1,
        limit = 20,
        productId,
        userId,
        minRating,
        maxRating,
        search,
        startDate,
        endDate,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filters
    const where = {};
    
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;
    if (minRating || maxRating) {
        where.rating = {};
        if (minRating) where.rating.gte = Number(minRating);
        if (maxRating) where.rating.lte = Number(maxRating);
    }
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
        where.OR = [
            { comment: { contains: search, mode: "insensitive" } },
            {
                user: {
                    userName: { contains: search, mode: "insensitive" },
                },
            },
            {
                product: {
                    name: { contains: search, mode: "insensitive" },
                },
            },
        ];
    }

    try {
        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            userName: true,
                            email: true,
                        },
                    },
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
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.review.count({ where }),
        ]);

        // Calculate statistics
        const stats = await prisma.review.aggregate({
            where,
            _avg: { rating: true },
            _count: { id: true },
        });

        const formatted = reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            user: {
                id: review.user.id,
                name: review.user.userName,
                email: review.user.email,
            },
            product: {
                id: review.product.id,
                name: review.product.name,
                slug: review.product.slug,
                thumbnail: review.product.images[0]?.url || null,
            },
            createdAt: review.createdAt,
        }));

        return res.status(200).json({
            success: true,
            data: formatted,
            stats: {
                total: stats._count.id,
                averageRating: Number(stats._avg.rating?.toFixed(1) || 0),
            },
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get all reviews error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch reviews",
        });
    }
};

/**
 * Delete any review (Admin only)
 * DELETE /api/admin/reviews/:id
 */
const adminDeleteReview = async (req, res) => {
    const adminId = req.user?.id;
    const { id: reviewId } = req.params;
    const { reason } = req.body;

    try {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        email: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                error: "Review not found",
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.review.delete({
                where: { id: reviewId },
            });

            // Audit log with admin details
            await tx.auditLog.create({
                data: {
                    userId: adminId,
                    action: "DELETE",
                    entity: "Review",
                    entityId: reviewId,
                    metadata: {
                        productId: review.productId,
                        userId: review.userId,
                        userEmail: review.user.email,
                        userName: review.user.userName,
                        productName: review.product.name,
                        rating: review.rating,
                        reason: reason || "Moderation",
                        adminDeleted: true,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                },
            });
        });

        return res.status(200).json({
            success: true,
            message: "Review deleted by admin",
            data: {
                deletedReview: {
                    id: review.id,
                    product: review.product.name,
                    user: review.user.email,
                    rating: review.rating,
                },
            },
        });
    } catch (error) {
        console.error("Admin delete review error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete review",
        });
    }
};

/**
 * Get review statistics (Admin only)
 * GET /api/admin/reviews/stats
 */
const getReviewStats = async (req, res) => {
    const { period = "30d" } = req.query;

    // Calculate date range
    const end = new Date();
    const start = new Date();
    const days = parseInt(period) || 30;
    start.setDate(end.getDate() - days);

    try {
        const [
            totalStats,
            periodStats,
            topProducts,
            recentReviews,
            ratingDistribution,
        ] = await prisma.$transaction([
            // Overall stats
            prisma.review.aggregate({
                _count: { id: true },
                _avg: { rating: true },
            }),
            
            // Period stats
            prisma.review.aggregate({
                where: {
                    createdAt: { gte: start, lte: end },
                },
                _count: { id: true },
                _avg: { rating: true },
            }),
            
            // Top reviewed products
            prisma.review.groupBy({
                by: ["productId"],
                where: {
                    createdAt: { gte: start, lte: end },
                },
                _count: { id: true },
                _avg: { rating: true },
                orderBy: { _count: { id: "desc" } },
                take: 5,
            }),
            
            // Recent reviews count
            prisma.review.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
            
            // Rating distribution
            prisma.review.groupBy({
                by: ["rating"],
                _count: { rating: true },
            }),
        ]);

        // Get product details for top products
        const topProductsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: {
                        name: true,
                        slug: true,
                        images: {
                            where: { isMain: true },
                            take: 1,
                        },
                    },
                });
                return {
                    productId: item.productId,
                    name: product?.name || "Unknown",
                    slug: product?.slug,
                    thumbnail: product?.images[0]?.url || null,
                    reviewCount: item._count.id,
                    averageRating: Number(item._avg.rating?.toFixed(1) || 0),
                };
            })
        );

        // Build rating distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingDistribution.forEach((stat) => {
            distribution[stat.rating] = stat._count.rating;
        });

        return res.status(200).json({
            success: true,
            data: {
                overall: {
                    total: totalStats._count.id,
                    averageRating: Number(totalStats._avg.rating?.toFixed(1) || 0),
                },
                period: {
                    days,
                    total: periodStats._count.id,
                    averageRating: Number(periodStats._avg.rating?.toFixed(1) || 0),
                },
                recent24h: recentReviews,
                topProducts: topProductsWithDetails,
                ratingDistribution: distribution,
            },
        });
    } catch (error) {
        console.error("Get review stats error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch review statistics",
        });
    }
};

/**
 * Bulk delete reviews (Admin only)
 * DELETE /api/admin/reviews/bulk
 */
const bulkDeleteReviews = async (req, res) => {
    const adminId = req.user?.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            success: false,
            error: "Review IDs array is required",
        });
    }

    if (ids.length > 100) {
        return res.status(400).json({
            success: false,
            error: "Cannot delete more than 100 reviews at once",
        });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Get review details before deletion for audit
            const reviews = await tx.review.findMany({
                where: { id: { in: ids } },
                select: {
                    id: true,
                    productId: true,
                    userId: true,
                    rating: true,
                },
            });

            const deleted = await tx.review.deleteMany({
                where: { id: { in: ids } },
            });

            // Create audit logs for each deletion
            await Promise.all(
                reviews.map((review) =>
                    tx.auditLog.create({
                        data: {
                            userId: adminId,
                            action: "DELETE",
                            entity: "Review",
                            entityId: review.id,
                            metadata: {
                                productId: review.productId,
                                userId: review.userId,
                                rating: review.rating,
                                bulkDelete: true,
                                batchSize: ids.length,
                            },
                            ipAddress: req.ip,
                            userAgent: req.headers["user-agent"],
                        },
                    })
                )
            );

            return { deletedCount: deleted.count, reviews };
        });

        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} reviews deleted successfully`,
            data: {
                deletedCount: result.deletedCount,
                requestedCount: ids.length,
            },
        });
    } catch (error) {
        console.error("Bulk delete reviews error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete reviews",
        });
    }
};

export {
    // User functions
    createReview,
    getMyReviews,
    updateReview,
    deleteReview,
    
    // Public functions
    getProductReviews,
    canReviewProduct,
    
    // Admin functions
    getAllReviews,
    adminDeleteReview,
    getReviewStats,
    bulkDeleteReviews,
};