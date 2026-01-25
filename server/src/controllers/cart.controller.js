import { prisma } from "../config/prisma.js";
import Decimal from "decimal.js";

/**
 * Get user's cart with full details
 * GET /api/cart
 */
const getCart = async (req, res) => {
    const userId = req.user?.id;

    try {
        // Get or create cart for user
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isMain: true },
                                    take: 1,
                                },
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                                inventory: true,
                            },
                        },
                        productVariant: {
                            include: {
                                product: {
                                    include: {
                                        images: {
                                            where: { isMain: true },
                                            take: 1,
                                        },
                                        category: {
                                            select: {
                                                id: true,
                                                name: true,
                                                slug: true,
                                            },
                                        },
                                    },
                                },
                                inventory: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        // Create cart if doesn't exist
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId, status: "ACTIVE" },
                include: { items: true },
            });
        }

        // Calculate cart totals and validate items
        let subtotal = new Decimal(0);
        const enrichedItems = [];
        const itemsWithIssues = [];

        for (const item of cart.items) {
            const variant = item.productVariant;
            const product = variant?.product ?? item.product;

            // Check for issues
            const issues = [];

            if (!variant || variant.deletedAt) {
                issues.push("Product variant no longer available");
            }

            if (!product || !product.isActive || product.deletedAt) {
                issues.push("Product is no longer available");
            }

            const availableStock =
                variant?.inventory?.quantity ??
                item.product?.inventory?.quantity ??
                0;

            if (availableStock < item.quantity) {
                issues.push(
                    `Only ${availableStock} items available (you have ${item.quantity} in cart)`
                );
            }

            if (issues.length > 0) {
                itemsWithIssues.push({
                    itemId: item.id,
                    productId: item.productId,
                    variantId: item.productVariantId,
                    name: product?.name || "Unknown Product",
                    availableStock,
                    issues,
                });
            }

            // Calculate item total
            const itemPrice = variant?.price
                ? new Decimal(variant.price)
                : product?.price
                  ? new Decimal(product.price)
                  : new Decimal(0);

            const itemTotal = itemPrice.times(item.quantity);

            enrichedItems.push({
                id: item.id,
                cartId: item.cartId,
                productId: item.productId,
                variantId: item.productVariantId,
                quantity: item.quantity,

                name: product?.name ?? "Unknown Product",
                slug: product?.slug ?? "unknown-product",
                category: product?.category,

                price: itemPrice.toFixed(2),
                itemTotal: itemTotal.toFixed(2),

                availableStock,
                hasIssues: issues.length > 0,
                issues,

                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            });

            if (issues.length === 0) {
                subtotal = subtotal.plus(itemTotal);
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                cart: {
                    id: cart.id,
                    status: cart.status,
                    createdAt: cart.createdAt,
                    updatedAt: cart.updatedAt,
                },
                items: enrichedItems,
                summary: {
                    itemCount: cart.items.length,
                    validItemCount: cart.items.length - itemsWithIssues.length,
                    subtotal: subtotal.toFixed(2),
                },
                issues:
                    itemsWithIssues.length > 0 ? itemsWithIssues : undefined,
            },
        });
    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
const addToCart = async (req, res) => {
    const userId = req.user?.id;
    const { productId, variantId, quantity = 1 } = req.body;

    // ✅ Correct validation
    if (!productId && !variantId) {
        return res.status(400).json({
            success: false,
            error: "Either productId or variantId is required",
        });
    }

    if (productId && variantId) {
        return res.status(400).json({
            success: false,
            error: "Only one of productId or variantId is allowed",
        });
    }

    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
        return res.status(400).json({
            success: false,
            error: "Quantity must be between 1 and 99",
        });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Get or create cart
            let cart = await tx.cart.findUnique({
                where: { userId },
                include: { items: true },
            });

            if (!cart) {
                cart = await tx.cart.create({
                    data: { userId, status: "ACTIVE" },
                });
            }

            if (cart.status !== "ACTIVE") {
                throw new Error("Cannot modify a checked-out cart");
            }

            let stock = 0;
            let price;
            let name;
            let sku = null;

            // 2️⃣ Variant product
            if (variantId) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: variantId },
                    include: {
                        inventory: true,
                        product: true,
                    },
                });

                if (!variant || variant.deletedAt) {
                    throw new Error("Product variant not found");
                }

                if (!variant.product.isActive || variant.product.deletedAt) {
                    throw new Error("Product is no longer available");
                }

                stock = variant.inventory?.quantity ?? 0;
                price = variant.price;
                name = variant.product.name;
                sku = variant.sku;

                const existing = await tx.cartItem.findUnique({
                    where: {
                        cartId_variantId: { cartId: cart.id, variantId },
                    },
                });

                const totalQty = (existing?.quantity ?? 0) + quantity;
                if (totalQty > stock) {
                    throw new Error(`Insufficient stock. Available: ${stock}`);
                }

                return tx.cartItem.upsert({
                    where: {
                        cartId_variantId: { cartId: cart.id, variantId },
                    },
                    update: {
                        quantity: { increment: quantity },
                        price,
                        name,
                        sku,
                        userId,
                    },
                    create: {
                        cartId: cart.id,
                        variantId,
                        quantity,
                        price,
                        name,
                        sku,
                        userId,
                    },
                });
            }

            // 3️⃣ Simple product
            const product = await tx.product.findUnique({
                where: { id: productId },
                include: { inventory: true },
            });

            if (!product || product.deletedAt || !product.isActive) {
                throw new Error("Product not available");
            }

            stock = product.inventory?.quantity ?? 0;
            price = product.price;
            name = product.name;

            const existing = await tx.cartItem.findFirst({
                where: { cartId: cart.id, productId },
            });

            const totalQty = (existing?.quantity ?? 0) + quantity;
            if (totalQty > stock) {
                throw new Error(`Insufficient stock. Available: ${stock}`);
            }

            return tx.cartItem.upsert({
                where: {
                    cartId_productId: { cartId: cart.id, productId },
                },
                update: {
                    quantity: { increment: quantity },
                    price,
                    name,
                    userId,
                },
                create: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    price,
                    name,
                    userId,
                },
            });
        });

        res.status(200).json({
            success: true,
            message: "Item added to cart",
            data: result,
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        console.log(error);
        return res.status(400).json({
            success: false,
            error: error.message || "Failed to add item to cart",
        });
    }
};

/**
 * Update cart item quantity
 * PATCH /api/cart/items/:itemId
 */
const updateCartItem = async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({
            success: false,
            error: "Quantity must be between 1 and 99",
        });
    }

    try {
        const updatedItem = await prisma.$transaction(async (tx) => {
            const item = await tx.cartItem.findFirst({
                where: { id: itemId, userId },
                include: {
                    cart: true,
                    product: {
                        include: { inventory: true },
                    },
                    productVariant: {
                        include: {
                            inventory: true,
                            product: true,
                        },
                    },
                },
            });

            if (!item) throw new Error("Cart item not found");
            if (item.cart.status !== "ACTIVE") {
                throw new Error("Cannot modify a checked-out cart");
            }

            // 🚨 Defensive check — cart item must be simple OR variant
            const isSimple = !!item.productId;
            const isVariant = !!item.productVariantId;

            if (isSimple === isVariant) {
                throw new Error("Invalid cart item state");
            }

            let stock;
            let price;

            // 🔁 Variant product
            if (isVariant) {
                const variant = item.productVariant;

                if (
                    !variant ||
                    variant.deletedAt ||
                    !variant.product.isActive ||
                    variant.product.deletedAt
                ) {
                    throw new Error("Product is no longer available");
                }

                stock = variant.inventory?.quantity ?? 0;
                price = variant.price;
            }

            // 🔁 Simple product
            if (isSimple) {
                const product = item.product;

                if (!product || product.deletedAt || !product.isActive) {
                    throw new Error("Product is no longer available");
                }

                stock = product.inventory?.quantity ?? 0;
                price = product.price;
            }

            if (quantity > stock) {
                throw new Error(`Insufficient stock. Available: ${stock}`);
            }

            return tx.cartItem.update({
                where: { id: item.id },
                data: {
                    quantity,
                    price, // re-sync price on update
                },
            });
        });

        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: updatedItem,
        });
    } catch (error) {
        console.error("Update cart item error:", error);
        console.log(error);

        return res.status(400).json({
            success: false,
            error: error.message || "Failed to update cart item",
        });
    }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:itemId
 */
const removeCartItem = async (req, res) => {
    const { id: itemId } = req.params;
    const userId = req.user?.id;

    try {
        await prisma.$transaction(async (tx) => {
            const item = await tx.cartItem.findUnique({
                where: { id: itemId },
                include: { cart: true },
            });

            if (!item) throw new Error("Cart item not found");

            if (item.userId !== userId) {
                throw new Error("Unauthorized cart access");
            }

            if (item.cart.status !== "ACTIVE") {
                throw new Error("Cannot modify a checked-out cart");
            }

            await tx.cartItem.delete({
                where: { id: itemId },
            });
        });

        return res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
        });
    } catch (error) {
        console.error("Remove cart item error:", error);

        return res.status(400).json({
            success: false,
            error: error.message || "Failed to remove cart item",
        });
    }
};

/**
 * Clear all items from cart
 * DELETE /api/cart
 */
const clearCart = async (req, res) => {
    const userId = req.user?.id;

    try {
        await prisma.$transaction(async (tx) => {
            // Get cart
            const cart = await tx.cart.findUnique({
                where: { userId },
            });

            if (!cart) {
                throw new Error("Cart not found");
            }

            if (cart.status !== "ACTIVE") {
                throw new Error("Cannot modify a checked-out cart");
            }

            // Delete all items
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        });

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
        });
    } catch (error) {
        console.error("Clear cart error:", error);

        if (
            error.message === "Cart not found" ||
            error.message === "Cannot modify a checked-out cart"
        ) {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Merge guest cart into user cart (after login)
 * POST /api/cart/merge
 */
const mergeCart = async (req, res) => {
    const userId = req.user?.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            error: "Guest cart is empty or invalid",
        });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Get or create user cart
            let cart = await tx.cart.findUnique({
                where: { userId },
                include: { items: true },
            });

            if (!cart) {
                cart = await tx.cart.create({
                    data: { userId, status: "ACTIVE" },
                    include: { items: true },
                });
            }

            if (cart.status !== "ACTIVE") {
                throw new Error("Cannot merge into a checked-out cart");
            }

            const mergedItems = [];
            const skippedItems = [];

            // Process each guest cart item
            for (const guestItem of items) {
                const { variantId, quantity } = guestItem;

                if (!variantId || !quantity || quantity <= 0) {
                    skippedItems.push({
                        variantId,
                        reason: "Invalid item data",
                    });
                    continue;
                }

                try {
                    // Validate variant
                    const variant = await tx.productVariant.findUnique({
                        where: { id: variantId },
                        include: {
                            inventory: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    isActive: true,
                                    deletedAt: true,
                                    price: true,
                                },
                            },
                        },
                    });

                    if (
                        !variant ||
                        variant.deletedAt ||
                        !variant.product.isActive ||
                        variant.product.deletedAt
                    ) {
                        skippedItems.push({
                            variantId,
                            reason: "Product no longer available",
                        });
                        continue;
                    }

                    const availableStock = variant.inventory?.quantity || 0;

                    // Check existing cart item
                    const existingItem = cart.items.find(
                        (item) => item.variantId === variantId
                    );

                    const currentQuantity = existingItem?.quantity || 0;
                    let finalQuantity = currentQuantity + quantity;

                    // Clamp to available stock and max limit
                    finalQuantity = Math.min(finalQuantity, availableStock, 99);

                    if (finalQuantity <= 0) {
                        skippedItems.push({
                            variantId,
                            name: variant.product.name,
                            reason: "Out of stock",
                        });
                        continue;
                    }

                    // Upsert cart item
                    const cartItem = await tx.cartItem.upsert({
                        where: {
                            cartId_variantId: {
                                cartId: cart.id,
                                variantId,
                            },
                        },
                        update: {
                            quantity: finalQuantity,
                            price: variant.price,
                            name: variant.product.name,
                            sku: variant.sku,
                        },
                        create: {
                            cartId: cart.id,
                            userId,
                            variantId,
                            quantity: finalQuantity,
                            price: variant.price,
                            name: variant.product.name,
                            sku: variant.sku,
                        },
                    });

                    mergedItems.push({
                        variantId,
                        name: variant.product.name,
                        quantity: finalQuantity,
                        adjusted: finalQuantity !== currentQuantity + quantity,
                    });
                } catch (itemError) {
                    console.error(
                        `Error processing item ${variantId}:`,
                        itemError
                    );
                    skippedItems.push({
                        variantId,
                        reason: "Error processing item",
                    });
                }
            }

            return { mergedItems, skippedItems };
        });

        return res.status(200).json({
            success: true,
            message: "Cart merged successfully",
            data: {
                mergedCount: result.mergedItems.length,
                skippedCount: result.skippedItems.length,
                merged: result.mergedItems,
                skipped:
                    result.skippedItems.length > 0
                        ? result.skippedItems
                        : undefined,
            },
        });
    } catch (error) {
        console.error("Merge cart error:", error);

        if (error.message === "Cannot merge into a checked-out cart") {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

/**
 * Get cart summary (lightweight endpoint)
 * GET /api/cart/summary
 */
const getCartSummary = async (req, res) => {
    const userId = req.user?.id;

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        productVariant: {
                            select: {
                                price: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    itemCount: 0,
                    subtotal: "0.00",
                },
            });
        }

        let subtotal = new Decimal(0);
        let itemCount = 0;

        for (const item of cart.items) {
            if (item.productVariant?.price) {
                const itemTotal = new Decimal(item.productVariant.price).times(
                    item.quantity
                );
                subtotal = subtotal.plus(itemTotal);
                itemCount += item.quantity;
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                itemCount: cart.items.length,
                totalQuantity: itemCount,
                subtotal: subtotal.toFixed(2),
                status: cart.status,
            },
        });
    } catch (error) {
        console.error("Get cart summary error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

export {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeCart,
    getCartSummary,
};
