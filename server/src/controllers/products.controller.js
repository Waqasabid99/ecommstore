import { prisma } from "../config/prisma.js";
import { uploadBuffer, deleteImage } from "../constants/uploadToCloudinary.js";
import slugify from "slugify";
import fs from "fs";

// Get all products
const getAllProducts = async (req, res) => {
    try {
        let { page = 1, limit = 20, categoryId, isActive } = req.query;

        page = Math.max(Number(page) || 1, 1);
        limit = Math.min(Math.max(Number(limit) || 20, 1), 100); // max 100 per page
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
                        include: { inventory: true },
                    },
                    images: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.product.count({ where: filters }),
        ]);

        const productIds = products.map(p => p.id);

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

        // Optional: frontend-friendly transformation
        const transformed = products.map((p) => {
            const rating = ratingMap.get(p.id) ?? { average: 0, count: 0 };
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
                thumbnail:
                    p.images.find((i) => i.isMain)?.url || p.images[0]?.url || "",
                images: p.images.map((i) => i.url),
                variants: p.variants.map((v) => ({
                    id: v.id,
                    sku: v.sku,
                    price: v.price,
                    attributes: v.attributes,
                    availableQty: v.inventory?.quantity ?? 0,
                    inStock: (v.inventory?.quantity ?? 0) > 0,
                    variantsCount: p.variants.length,
                })),
                averageRating: Number(rating.average.toFixed(1)),
                ratingCount: rating.count,
                // reviews: p.reviews.map((r) => ({
                //     id: r.id,
                //     rating: r.rating,
                //     comment: r.comment,
                //     user: r.user,
                // })),
            }
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

// Get product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                reviews: true,
                images: true,
                variants: {
                    where: { deletedAt: null },
                    include: {
                        inventory: true,
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
        // Get Category
        const category = await prisma.category.findUnique({
            where: { id: product.categoryId },
        });

        // Optional: frontend-friendly transformation
        const transformed = {
            id: product.id,
            name: product.name,
            description: product.description,
            slug: product.slug,
            tag: product.tag,
            brand: product.brand,
            isActive: product.isActive,
            category: category.id,
            categoryName: category.name,
            thumbnail: product.images.find((i) => i.isMain) || "",
            images: product.images.map((i) => i),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            variants: product.variants,
            reviews: product.reviews.map((r) => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                user: r.user,
            })),
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

// Create product
const createProduct = async (req, res) => {
    const { name, description, brand, categoryId, variants } = req.body;

    const isActive = req.body.isActive === "true";
    const thumbnailFile = req.files?.thumbnail?.[0] || null;
    const secondaryImages = req.files?.images || [];

    if (!name || !categoryId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields",
        });
    }

    // ---------------------------
    // Parse tags
    // ---------------------------
    let tag = [];
    try {
        tag =
            typeof req.body.tag === "string"
                ? JSON.parse(req.body.tag)
                : (req.body.tag ?? []);
    } catch {
        return res.status(400).json({
            success: false,
            message: "Invalid tag format",
        });
    }

    // ---------------------------
    // Parse variants (required)
    // ---------------------------
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

    // ---------------------------
    // 1️⃣ Upload images FIRST (outside transaction)
    // ---------------------------
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

    // ---------------------------
    // 2️⃣ Database transaction (DB ONLY)
    // ---------------------------
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Validate category
            const category = await tx.category.findUnique({
                where: { id: categoryId },
            });

            if (!category) {
                throw new Error("Category not found");
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
                },
            });

            // Create variants + inventory
            for (const variant of parsedVariants) {
                if (!variant.sku || !variant.price) {
                    throw new Error("Each variant must have SKU and price");
                }

                const createdVariant = await tx.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: variant.sku,
                        price: parseFloat(variant.price),
                        attributes: variant.attributes ?? null,
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
        // ---------------------------
        // Cleanup Cloudinary uploads if DB fails
        // ---------------------------
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

// Update Product
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
            // 1️⃣ Find product
            const product = await tx.product.findUnique({
                where: { id },
                include: { variants: true },
            });
            if (!product) throw new Error("Product not found");
            const tag =
                typeof req.body.tag === "string"
                    ? JSON.parse(req.body.tag)
                    : req.body.tag;

            // 2️⃣ Update product fields
            await tx.product.update({
                where: { id },
                data: {
                    name: name ?? product.name,
                    tag: tag ?? product.tag,
                    brand: brand ?? product.brand,
                    slug: slug ?? product.slug,
                    description: description ?? product.description,
                    isActive: isActive ?? product.isActive,
                    categoryId: categoryId ?? product.categoryId,
                },
            });

            // 3️⃣ Process variants
            for (const variant of parsedVariants) {
                if (variant._delete && variant.id) {
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: { deletedAt: new Date(), updatedAt: new Date() },
                    });
                    continue;
                }

                if (variant.id) {
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: {
                            sku: variant.sku,
                            price: parseFloat(variant.price),
                            attributes: variant.attributes ?? null,
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

            // 4️⃣ Remove images
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

            // 5️⃣ Update thumbnail
            if (thumbnailFile) {
                await tx.productImage.updateMany({
                    where: { productId: product.id, isMain: true },
                    data: { isMain: false },
                });

                await tx.productImage.create({
                    data: {
                        productId: product.id,
                        url: `/uploads/products/${thumbnailFile.filename}`,
                        isMain: true,
                    },
                });
            }

            // 6️⃣ Add new images
            if (newImages.length > 0) {
                await tx.productImage.createMany({
                    data: newImages.map((img) => ({
                        productId: product.id,
                        url: `/uploads/products/${img.filename}`,
                        isMain: false,
                    })),
                });
            }

            // 7️⃣ Audit log
            await tx.auditLog.create({
                data: {
                    action: "UPDATE",
                    entity: "PRODUCT",
                    entityId: product.id,
                    metadata: {
                        updatedFields: Object.keys(req.body),
                        updatedVariants: parsedVariants.map(
                            (v) => v.id ?? "new"
                        ),
                        removedImages: parsedRemoveImages,
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
            return res
                .status(404)
                .json({ success: false, error: "Product not found" });
        }

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                error: "Duplicate SKU or slug detected",
            });
        }

        console.error("Update product error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Product (Soft Delete)
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Fetch product with variants
            const product = await tx.product.findUnique({
                where: { id },
                include: { variants: true },
            });

            if (!product) return null;

            if (product.deletedAt) {
                throw new Error("Product already deleted");
            }

            const deletedAt = new Date();

            // 2️⃣ Soft-delete product
            await tx.product.update({
                where: { id },
                data: { deletedAt, isActive: false },
            });

            // 3️⃣ Soft-delete variants
            if (product.variants.length > 0) {
                await tx.productVariant.updateMany({
                    where: { productId: product.id },
                    data: { deletedAt, isActive: false },
                });
            }

            // 4️⃣ Optional: mark affected cart items as 'hasIssues'
            const variantIds = product.variants.map((v) => v.id);
            if (variantIds.length > 0) {
                await tx.cartItem.updateMany({
                    where: { variantId: { in: variantIds } },
                    data: { name: `[DELETED] ${product.name}` },
                });
            }

            // 5️⃣ Audit log
            await tx.auditLog.create({
                data: {
                    action: "DELETE",
                    entity: "PRODUCT",
                    entityId: product.id,
                    metadata: {
                        name: product.name,
                        slug: product.slug,
                        categoryId: product.categoryId,
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
            return res
                .status(404)
                .json({ success: false, error: "Product not found" });
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

export {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
