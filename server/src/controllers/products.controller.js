import { prisma } from "../config/prisma.js";
import { uploadBuffer, deleteImage } from "../constants/uploadToCloudinary.js";
import { getPromotionStatus } from "../constants/constants.js";
import slugify from "slugify";
import fs from "fs";

// Get active promotions for products/variants
const getActivePromotions = async (entityType, entityIds) => {
    const now = new Date();
    
    const promotions = await prisma.promotion.findMany({
        where: {
            isActive: true,
            startsAt: { lte: now },
            endsAt: { gte: now },
            appliesTo: entityType,
            ...(entityType === "PRODUCT" && {
                products: { some: { id: { in: entityIds } } },
            }),
            ...(entityType === "VARIANT" && {
                variants: { some: { id: { in: entityIds } } },
            }),
        },
        include: {
            products: entityType === "PRODUCT",
            variants: entityType === "VARIANT",
        },
    });

    // Map entity IDs to their best promotion (highest discount)
    const promotionMap = new Map();

    promotions.forEach((promo) => {
        const entities = entityType === "PRODUCT" ? promo.products : promo.variants;
        
        entities.forEach((entity) => {
            const existing = promotionMap.get(entity.id);
            
            // Keep the promotion with higher discount
            if (!existing || promo.discountValue > existing.discountValue) {
                promotionMap.set(entity.id, {
                    id: promo.id,
                    name: promo.name,
                    discountType: promo.discountType,
                    discountValue: promo.discountValue,
                    isStackable: promo.isStackable,
                });
            }
        });
    });

    return promotionMap;
};

// Calculate discounted price based on promotion

const calculateDiscountedPrice = (originalPrice, promotion) => {
    if (!promotion) return originalPrice;

    const price = parseFloat(originalPrice);
    
    if (promotion.discountType === "PERCENT") {
        return price - (price * parseFloat(promotion.discountValue) / 100);
    } else {
        // FIXED discount
        return Math.max(0, price - parseFloat(promotion.discountValue));
    }
};

const getCartPromotions = async () => {
    const now = new Date();
    
    return await prisma.promotion.findMany({
        where: {
            isActive: true,
            startsAt: { lte: now },
            endsAt: { gte: now },
            appliesTo: "CART",
        },
        orderBy: { discountValue: "desc" },
    });
};

// =====================================================
// GET ALL PRODUCTS
// =====================================================
const getAllProducts = async (req, res) => {
    try {
        let { page = 1, limit = 20, categoryId, isActive } = req.query;

        page = Math.max(Number(page) || 1, 1);
        limit = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const filters = {
            deletedAt: null,
            ...(categoryId && { categoryId: String(categoryId) }),
            ...(isActive !== undefined && { isActive: isActive === "true" }),
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: filters,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    variants: {
                        where: { deletedAt: null },
                        include: { 
                            inventory: true,
                            promotion: {
                                where: {
                                    isActive: true,
                                    startsAt: { lte: new Date() },
                                    endsAt: { gte: new Date() },
                                },
                            },
                        },
                    },
                    images: true,
                    promotion: {
                        where: {
                            isActive: true,
                            startsAt: { lte: new Date() },
                            endsAt: { gte: new Date() },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.product.count({ where: filters }),
        ]);

        const productIds = products.map(p => p.id);

        // Get ratings
        const ratings = await prisma.review.groupBy({
            by: ["productId"],
            where: {
                productId: { in: productIds },
            },
            _avg: { rating: true },
            _count: { id: true },
        });

        const ratingMap = new Map(
            ratings.map(r => [
                r.productId,
                {
                    average: Number(r._avg.rating ?? 0),
                    count: r._count.id,
                }
            ])
        );

        // Get active category promotions
        const categoryIds = [...new Set(products.map(p => p.categoryId))];
        const now = new Date();
        const categoryPromotions = await prisma.promotion.findMany({
            where: {
                isActive: true,
                startsAt: { lte: now },
                endsAt: { gte: now },
                appliesTo: "CATEGORY",
                categories: { some: { id: { in: categoryIds } } },
            },
            include: {
                categories: { select: { id: true } },
            },
        });

        const categoryPromoMap = new Map();
        categoryPromotions.forEach((promo) => {
            promo.categories.forEach((cat) => {
                const existing = categoryPromoMap.get(cat.id);
                if (!existing || promo.discountValue > existing.discountValue) {
                    categoryPromoMap.set(cat.id, {
                        id: promo.id,
                        name: promo.name,
                        discountType: promo.discountType,
                        discountValue: promo.discountValue,
                    });
                }
            });
        });

        // Transform products with promotion data
        const transformed = products.map((p) => {
            const rating = ratingMap.get(p.id) ?? { average: 0, count: 0 };
            
            // Check for product-level promotion
            const productPromo = p.promotion;
            
            // Check for category-level promotion
            const categoryPromo = categoryPromoMap.get(p.categoryId);
            
            // Use the best available promotion (product > category)
            const bestPromotion = productPromo || categoryPromo;
            
            return {
                id: p.id,
                name: p.name,
                description: p.description,
                slug: p.slug,
                tag: p.tag,
                brand: p.brand ?? null,
                isActive: p.isActive,
                category: p.category,
                categoryName: p.category?.name ?? null,
                thumbnail: p.images.find((i) => i.isMain)?.url || p.images[0]?.url || "",
                images: p.images.map((i) => i.url),
                variants: p.variants.map((v) => {
                    // Variant-specific promotion takes priority
                    const variantPromo = v.promotion;
                    const effectivePromo = variantPromo || bestPromotion;
                    
                    const originalPrice = parseFloat(v.price);
                    const discountedPrice = effectivePromo 
                        ? calculateDiscountedPrice(originalPrice, effectivePromo)
                        : originalPrice;
                    
                    return {
                        id: v.id,
                        sku: v.sku,
                        price: originalPrice,
                        discountedPrice: discountedPrice !== originalPrice ? discountedPrice : null,
                        attributes: v.attributes,
                        availableQty: v.inventory?.quantity ?? 0,
                        inStock: (v.inventory?.quantity ?? 0) > 0,
                        promotion: effectivePromo ? {
                            id: effectivePromo.id,
                            name: effectivePromo.name,
                            discountType: effectivePromo.discountType,
                            discountValue: effectivePromo.discountValue,
                            savingsAmount: originalPrice - discountedPrice,
                            savingsPercent: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100),
                            startsAt: effectivePromo.startsAt,
                            endsAt: effectivePromo.endsAt,
                        } : null,
                    };
                }),
                variantsCount: p.variants.length,
                averageRating: Number(rating.average.toFixed(1)),
                ratingCount: rating.count,
                hasPromotion: !!bestPromotion,
                promotion: bestPromotion ? {
                    id: bestPromotion.id,
                    name: bestPromotion.name,
                    discountType: bestPromotion.discountType,
                    discountValue: bestPromotion.discountValue,
                    endsAt: bestPromotion.endsAt,
                } : null,
            };
        });

        res.status(200).json({
            success: true,
            data: transformed,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get all products error:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                userName: true,
                                email: true,
                            },
                        },
                    },
                },
                images: true,
                variants: {
                    where: { deletedAt: null },
                    include: {
                        inventory: true,
                        promotion: {
                            where: {
                                isActive: true,
                                startsAt: { lte: new Date() },
                                endsAt: { gte: new Date() },
                            },
                        },
                    },
                },
                promotion: {
                    where: {
                        isActive: true,
                        startsAt: { lte: new Date() },
                        endsAt: { gte: new Date() },
                    },
                },
                category: {
                    include: {
                        promotion: {
                            where: {
                                isActive: true,
                                startsAt: { lte: new Date() },
                                endsAt: { gte: new Date() },
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found",
            });
        }

        // Determine best applicable promotion
        const productPromo = product.promotion;
        const categoryPromo = product.category.promotion;
        const bestPromotion = productPromo || categoryPromo;

        // Transform variants with promotion data
        const transformedVariants = product.variants.map((v) => {
            const variantPromo = v.promotion;
            const effectivePromo = variantPromo || bestPromotion;
            
            const originalPrice = parseFloat(v.price);
            const discountedPrice = effectivePromo 
                ? calculateDiscountedPrice(originalPrice, effectivePromo)
                : originalPrice;

            return {
                ...v,
                price: originalPrice,
                discountedPrice: discountedPrice !== originalPrice ? discountedPrice : null,
                promotion: effectivePromo ? {
                    id: effectivePromo.id,
                    name: effectivePromo.name,
                    discountType: effectivePromo.discountType,
                    discountValue: effectivePromo.discountValue,
                    savingsAmount: originalPrice - discountedPrice,
                    savingsPercent: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100),
                    source: variantPromo ? "variant" : (productPromo ? "product" : "category"),
                    startsAt: effectivePromo.startsAt,
                    endsAt: effectivePromo.endsAt,
                } : null,
            };
        });

        const transformed = {
            id: product.id,
            name: product.name,
            description: product.description,
            slug: product.slug,
            tag: product.tag,
            brand: product.brand,
            isActive: product.isActive,
            category: product.category.id,
            categoryName: product.category.name,
            thumbnail: product.images.find((i) => i.isMain) || "",
            images: product.images.map((i) => i),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            variants: transformedVariants,
            reviews: product.reviews.map((r) => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                user: r.user,
                createdAt: r.createdAt,
            })),
            hasPromotion: !!bestPromotion,
            promotion: bestPromotion ? {
                id: bestPromotion.id,
                name: bestPromotion.name,
                description: bestPromotion.description,
                discountType: bestPromotion.discountType,
                discountValue: bestPromotion.discountValue,
                startsAt: bestPromotion.startsAt,
                endsAt: bestPromotion.endsAt,
                isStackable: bestPromotion.isStackable,
                source: productPromo ? "product" : "category",
            } : null,
        };

        res.status(200).json({
            success: true,
            data: transformed,
        });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// =====================================================
// CREATE PRODUCT
// =====================================================
const createProduct = async (req, res) => {
    const { name, description, brand, categoryId, variants, promotionId } = req.body;

    const isActive = req.body.isActive === "true";
    const thumbnailFile = req.files?.thumbnail?.[0] || null;
    const secondaryImages = req.files?.images || [];

    if (!name || !categoryId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields",
        });
    }

    // Parse tags
    let tag = [];
    try {
        tag = typeof req.body.tag === "string"
            ? JSON.parse(req.body.tag)
            : (req.body.tag ?? []);
    } catch {
        return res.status(400).json({
            success: false,
            message: "Invalid tag format",
        });
    }

    // Parse variants (required)
    let parsedVariants;
    try {
        parsedVariants = JSON.parse(variants);
        if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({
            success: false,
            message: "At least one product variant is required",
        });
    }

    const slugBase = slugify(name, { lower: true, strict: true });

    // Upload images FIRST (outside transaction)
    const uploadedImages = [];

    try {
        if (thumbnailFile) {
            const res = await uploadBuffer(thumbnailFile.buffer, "products");
            uploadedImages.push({
                url: res.secure_url,
                publicId: res.public_id,
                isMain: true,
            });
        }

        for (const img of secondaryImages) {
            const res = await uploadBuffer(img.buffer, "products");
            uploadedImages.push({
                url: res.secure_url,
                publicId: res.public_id,
                isMain: false,
            });
        }
    } catch (err) {
        console.error("Image upload failed:", err);
        return res.status(500).json({
            success: false,
            message: "Image upload failed",
        });
    }

    // Database transaction
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Validate category
            const category = await tx.category.findUnique({
                where: { id: categoryId },
            });

            if (!category) {
                throw new Error("Category not found");
            }

            // Validate promotion if provided
            if (promotionId) {
                const promotion = await tx.promotion.findUnique({
                    where: { id: promotionId },
                });

                if (!promotion) {
                    throw new Error("Promotion not found");
                }

                if (!promotion.isActive) {
                    throw new Error("Promotion is not active");
                }

                if (promotion.appliesTo !== "PRODUCT") {
                    throw new Error("Promotion does not apply to products");
                }

                const now = new Date();
                if (now < promotion.startsAt || now > promotion.endsAt) {
                    throw new Error("Promotion is not currently valid");
                }
            }

            // Ensure slug uniqueness
            let slug = slugBase;
            const exists = await tx.product.findUnique({ where: { slug } });
            if (exists) {
                slug = `${slugBase}-${Math.floor(Math.random() * 10000)}`;
            }

            // Create product
            const product = await tx.product.create({
                data: {
                    name,
                    description,
                    tag,
                    brand,
                    slug,
                    isActive,
                    categoryId,
                    promotionId: promotionId || null,
                },
            });

            // Create variants + inventory
            for (const variant of parsedVariants) {
                if (!variant.sku || !variant.price) {
                    throw new Error("Each variant must have SKU and price");
                }

                // Validate variant promotion if provided
                if (variant.promotionId) {
                    const variantPromo = await tx.promotion.findUnique({
                        where: { id: variant.promotionId },
                    });

                    if (!variantPromo) {
                        throw new Error(`Promotion not found for variant ${variant.sku}`);
                    }

                    if (variantPromo.appliesTo !== "VARIANT") {
                        throw new Error(`Promotion does not apply to variants: ${variant.sku}`);
                    }
                }

                const createdVariant = await tx.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: variant.sku,
                        price: parseFloat(variant.price),
                        attributes: variant.attributes ?? null,
                        promotionId: variant.promotionId || null,
                    },
                });

                await tx.inventory.create({
                    data: {
                        variantId: createdVariant.id,
                        quantity: variant.quantity ?? 0,
                        reserved: 0,
                    },
                });
            }

            // Save images
            if (uploadedImages.length > 0) {
                await tx.productImage.createMany({
                    data: uploadedImages.map((img) => ({
                        ...img,
                        productId: product.id,
                    })),
                });
            }

            // Audit log
            await tx.auditLog.create({
                data: {
                    action: "CREATE",
                    entity: "PRODUCT",
                    entityId: product.id,
                    metadata: {
                        name,
                        slug,
                        categoryId,
                        promotionId: promotionId || null,
                        variantsCount: parsedVariants.length,
                    },
                },
            });

            return product;
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: result,
        });
    } catch (error) {
        // Cleanup Cloudinary uploads if DB fails
        await Promise.all(
            uploadedImages.map((img) =>
                deleteImage(img.publicId).catch(() => null)
            )
        );

        console.error("Create product error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================
const updateProduct = async (req, res) => {
    const userId = req?.user?.id;
    const { id } = req.params;
    const {
        name,
        tag,
        brand,
        description,
        categoryId,
        variants,
        removeImageIds,
        promotionId,
    } = req.body;
    const isActive = req.body.isActive === "true";
    const thumbnailFile = req.files?.thumbnail?.[0];
    const newImages = req.files?.images || [];

    let parsedVariants = [];
    let parsedRemoveImages = [];

    try {
        if (variants) parsedVariants = JSON.parse(variants);
        if (removeImageIds) parsedRemoveImages = JSON.parse(removeImageIds);
    } catch {
        return res.status(400).json({
            success: false,
            error: "Invalid JSON in variants or removeImageIds",
        });
    }

    const slug = name ? slugify(name, { lower: true, strict: true }) : null;
    const uploadedFiles = [thumbnailFile, ...newImages].filter(Boolean);

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Find product
            const product = await tx.product.findUnique({
                where: { id },
                include: { variants: true },
            });
            
            if (!product) throw new Error("Product not found");

            // Validate promotion if provided
            if (promotionId !== undefined) {
                if (promotionId) {
                    const promotion = await tx.promotion.findUnique({
                        where: { id: promotionId },
                    });

                    if (!promotion) {
                        throw new Error("Promotion not found");
                    }

                    if (promotion.appliesTo !== "PRODUCT") {
                        throw new Error("Promotion does not apply to products");
                    }
                }
            }

            const parsedTag = typeof req.body.tag === "string"
                ? JSON.parse(req.body.tag)
                : req.body.tag;

            // Update product fields
            await tx.product.update({
                where: { id },
                data: {
                    name: name ?? product.name,
                    tag: parsedTag ?? product.tag,
                    brand: brand ?? product.brand,
                    slug: slug ?? product.slug,
                    description: description ?? product.description,
                    isActive: isActive ?? product.isActive,
                    categoryId: categoryId ?? product.categoryId,
                    promotionId: promotionId !== undefined ? promotionId : product.promotionId,
                },
            });

            // Process variants
            for (const variant of parsedVariants) {
                if (variant._delete && variant.id) {
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: { deletedAt: new Date(), updatedAt: new Date() },
                    });
                    continue;
                }

                if (variant.id) {
                    // Validate variant promotion
                    if (variant.promotionId !== undefined && variant.promotionId) {
                        const variantPromo = await tx.promotion.findUnique({
                            where: { id: variant.promotionId },
                        });

                        if (!variantPromo) {
                            throw new Error(`Promotion not found for variant ${variant.sku}`);
                        }

                        if (variantPromo.appliesTo !== "VARIANT") {
                            throw new Error(`Promotion does not apply to variants: ${variant.sku}`);
                        }
                    }

                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: {
                            sku: variant.sku,
                            price: parseFloat(variant.price),
                            attributes: variant.attributes ?? null,
                            promotionId: variant.promotionId !== undefined 
                                ? variant.promotionId 
                                : undefined,
                        },
                    });

                    if (typeof variant.quantity === "number") {
                        await tx.inventory.update({
                            where: { variantId: variant.id },
                            data: { quantity: variant.quantity },
                        });
                    }
                    continue;
                }

                // Create new variant
                const newVariant = await tx.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: variant.sku,
                        price: parseFloat(variant.price),
                        attributes: variant.attributes ?? null,
                        promotionId: variant.promotionId || null,
                    },
                });

                await tx.inventory.create({
                    data: {
                        variantId: newVariant.id,
                        quantity: variant.quantity ?? 0,
                        reserved: 0,
                    },
                });
            }

            // Remove images
            if (parsedRemoveImages.length > 0) {
                const imagesToRemove = await tx.productImage.findMany({
                    where: {
                        id: { in: parsedRemoveImages },
                        productId: product.id,
                    },
                });

                for (const img of imagesToRemove) {
                    fs.existsSync(img.url) && fs.unlinkSync(img.url);
                }

                await tx.productImage.deleteMany({
                    where: {
                        id: { in: parsedRemoveImages },
                        productId: product.id,
                    },
                });
            }

            // Update thumbnail
            if (thumbnailFile) {
                await tx.productImage.updateMany({
                    where: { productId: product.id, isMain: true },
                    data: { isMain: false },
                });

                await tx.productImage.create({
                    data: {
                        productId: product.id,
                        url: `/uploads/products/${thumbnailFile.filename}`,
                        publicId: thumbnailFile.filename,
                        isMain: true,
                    },
                });
            }

            // Add new images
            if (newImages.length > 0) {
                await tx.productImage.createMany({
                    data: newImages.map((img) => ({
                        productId: product.id,
                        url: `/uploads/products/${img.filename}`,
                        publicId: img.filename,
                        isMain: false,
                    })),
                });
            }

            // Audit log
            await tx.auditLog.create({
                data: {
                    action: "UPDATE",
                    entity: "PRODUCT",
                    entityId: product.id,
                    metadata: {
                        updatedFields: Object.keys(req.body),
                        updatedVariants: parsedVariants.map((v) => v.id ?? "new"),
                        removedImages: parsedRemoveImages,
                        promotionId: promotionId !== undefined ? promotionId : "unchanged",
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                    userId: userId ?? null,
                },
            });

            return { id: product.id };
        });

        return res.status(200).json({
            success: true,
            data: result,
            message: "Product updated successfully",
        });
    } catch (error) {
        // Cleanup uploaded files on error
        uploadedFiles.forEach((file) => {
            fs.existsSync(file.path) && fs.unlinkSync(file.path);
        });

        if (error.message === "Product not found") {
            return res.status(404).json({ 
                success: false, 
                error: "Product not found" 
            });
        }

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                error: "Duplicate SKU or slug detected",
            });
        }

        console.error("Update product error:", error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// =====================================================
// DELETE PRODUCT (SOFT DELETE)
// =====================================================
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Fetch product with variants
            const product = await tx.product.findUnique({
                where: { id },
                include: { variants: true },
            });

            if (!product) return null;

            if (product.deletedAt) {
                throw new Error("Product already deleted");
            }

            const deletedAt = new Date();

            // Soft-delete product
            await tx.product.update({
                where: { id },
                data: { deletedAt, isActive: false },
            });

            // Soft-delete variants
            if (product.variants.length > 0) {
                await tx.productVariant.updateMany({
                    where: { productId: product.id },
                    data: { deletedAt },
                });
            }

            // Mark affected cart items
            const variantIds = product.variants.map((v) => v.id);
            if (variantIds.length > 0) {
                await tx.cartItem.updateMany({
                    where: { variantId: { in: variantIds } },
                    data: { name: `[DELETED] ${product.name}` },
                });
            }

            // Audit log
            await tx.auditLog.create({
                data: {
                    action: "DELETE",
                    entity: "PRODUCT",
                    entityId: product.id,
                    metadata: {
                        name: product.name,
                        slug: product.slug,
                        categoryId: product.categoryId,
                        promotionId: product.promotionId,
                        reason: "Product deleted",
                        variantsCount: product.variants.length,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                    userId: req.user.id,
                },
            });

            return { id: product.id };
        });

        if (!result) {
            return res.status(404).json({ 
                success: false, 
                error: "Product not found" 
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
};

// =====================================================
// ADDITIONAL ENDPOINTS
// =====================================================

const getProductsByPromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        const skip = (Number(page) - 1) * Number(limit);

        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId },
        });

        if (!promotion) {
            return res.status(404).json({
                success: false,
                error: "Promotion not found",
            });
        }

        let products = [];
        let total = 0;

        if (promotion.appliesTo === "PRODUCT") {
            [products, total] = await Promise.all([
                prisma.product.findMany({
                    where: {
                        promotionId,
                        deletedAt: null,
                        isActive: true,
                    },
                    include: {
                        category: true,
                        images: true,
                        variants: {
                            where: { deletedAt: null },
                            include: { inventory: true },
                        },
                    },
                    skip,
                    take: Number(limit),
                }),
                prisma.product.count({
                    where: {
                        promotionId,
                        deletedAt: null,
                        isActive: true,
                    },
                }),
            ]);
        } else if (promotion.appliesTo === "CATEGORY") {
            const categoryIds = await prisma.category.findMany({
                where: { promotionId },
                select: { id: true },
            });

            [products, total] = await Promise.all([
                prisma.product.findMany({
                    where: {
                        categoryId: { in: categoryIds.map(c => c.id) },
                        deletedAt: null,
                        isActive: true,
                    },
                    include: {
                        category: true,
                        images: true,
                        variants: {
                            where: { deletedAt: null },
                            include: { inventory: true },
                        },
                    },
                    skip,
                    take: Number(limit),
                }),
                prisma.product.count({
                    where: {
                        categoryId: { in: categoryIds.map(c => c.id) },
                        deletedAt: null,
                        isActive: true,
                    },
                }),
            ]);
        }

        // Transform with promotion data
        const transformed = products.map((p) => {
            const originalPrice = Math.min(...p.variants.map(v => parseFloat(v.price)));
            const discountedPrice = calculateDiscountedPrice(originalPrice, promotion);

            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                thumbnail: p.images.find(i => i.isMain)?.url || p.images[0]?.url,
                category: p.category,
                originalPrice,
                discountedPrice,
                savingsAmount: originalPrice - discountedPrice,
                savingsPercent: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100),
                variantsCount: p.variants.length,
                inStock: p.variants.some(v => (v.inventory?.quantity ?? 0) > 0),
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                promotion: {
                    id: promotion.id,
                    name: promotion.name,
                    description: promotion.description,
                    discountType: promotion.discountType,
                    discountValue: promotion.discountValue,
                    startsAt: promotion.startsAt,
                    endsAt: promotion.endsAt,
                },
                products: transformed,
            },
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("Get products by promotion error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

const getActiveCartPromotions = async (req, res) => {
    try {
        const promotions = await getCartPromotions();

        const transformed = promotions.map((promo) => ({
            id: promo.id,
            name: promo.name,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            isStackable: promo.isStackable,
            startsAt: promo.startsAt,
            endsAt: promo.endsAt,
            status: getPromotionStatus(promo),
        }));

        return res.status(200).json({
            success: true,
            data: transformed,
        });
    } catch (error) {
        console.error("Get cart promotions error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

export {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByPromotion,
    getActiveCartPromotions,
};