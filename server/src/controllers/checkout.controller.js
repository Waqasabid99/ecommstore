import { prisma } from "../config/prisma.js";
import Decimal from "decimal.js";

/**
 * Initiate checkout and create order
 * POST /api/checkout
 */
const initiateCheckout = async (req, res) => {
    const userId = req.user?.id;
    const {
        shippingAddressId,
        billingAddressId,
        useSameAddress = true,
        couponCode,
    } = req.body;

    if (!shippingAddressId) {
        return res.status(400).json({
            success: false,
            error: "Shipping address is required",
        });
    }

    try {
        const result = await prisma.$transaction(
            async (tx) => {
                // 1. Fetch user's cart items with full details
                const cartItems = await tx.cartItem.findMany({
                    where: {
                        userId,
                        cart: { status: "ACTIVE" },
                    },
                    include: {
                        productVariant: {
                            include: {
                                inventory: true,
                                product: {
                                    include: {
                                        images: true,
                                    },
                                },
                            },
                        },
                        cart: true,
                    },
                });

                // 2. Validate cart is not empty
                if (!cartItems || cartItems.length === 0) {
                    throw new Error("Cart is empty");
                }

                // 3. Validate inventory for all items
                const inventoryIssues = [];
                for (const item of cartItems) {
                    const variant = item.productVariant;
                    
                    if (!variant || variant.deletedAt) {
                        inventoryIssues.push({
                            variantId: item.variantId,
                            issue: "Product variant no longer available",
                        });
                        continue;
                    }

                    if (!variant.product.isActive) {
                        inventoryIssues.push({
                            variantId: item.variantId,
                            name: variant.product.name,
                            issue: "Product is no longer active",
                        });
                        continue;
                    }

                    const availableStock = variant.inventory?.quantity || 0;
                    if (availableStock < item.quantity) {
                        inventoryIssues.push({
                            variantId: item.variantId,
                            name: variant.product.name,
                            requested: item.quantity,
                            available: availableStock,
                            issue: "Insufficient stock",
                        });
                    }
                }

                if (inventoryIssues.length > 0) {
                    throw new Error(
                        JSON.stringify({
                            type: "INVENTORY_ERROR",
                            issues: inventoryIssues,
                        })
                    );
                }

                // 4. Fetch and validate addresses
                const shippingAddress = await tx.address.findFirst({
                    where: { id: shippingAddressId, userId },
                });

                if (!shippingAddress) {
                    throw new Error("Invalid shipping address");
                }

                let billingAddress = shippingAddress;
                if (!useSameAddress) {
                    if (!billingAddressId) {
                        throw new Error("Billing address is required");
                    }
                    billingAddress = await tx.address.findFirst({
                        where: { id: billingAddressId, userId },
                    });
                    if (!billingAddress) {
                        throw new Error("Invalid billing address");
                    }
                }

                // 5. Calculate order total and apply coupon if provided
                let subtotal = new Decimal(0);
                const orderItemsData = [];

                for (const item of cartItems) {
                    const itemPrice = new Decimal(item.productVariant.price);
                    const itemTotal = itemPrice.times(item.quantity);
                    subtotal = subtotal.plus(itemTotal);

                    orderItemsData.push({
                        variantId: item.variantId,
                        price: itemPrice.toFixed(2),
                        quantity: item.quantity,
                    });
                }

                let discount = new Decimal(0);
                let appliedCoupon = null;

                if (couponCode) {
                    const coupon = await tx.coupon.findUnique({
                        where: { code: couponCode },
                    });

                    if (!coupon) {
                        throw new Error("Invalid coupon code");
                    }

                    if (!coupon.isActive) {
                        throw new Error("Coupon is no longer active");
                    }

                    if (new Date() > coupon.expiresAt) {
                        throw new Error("Coupon has expired");
                    }

                    if (
                        coupon.usageLimit &&
                        coupon.usedCount >= coupon.usageLimit
                    ) {
                        throw new Error("Coupon usage limit reached");
                    }

                    // Calculate discount
                    discount = subtotal.times(coupon.discountPct).dividedBy(100);
                    appliedCoupon = coupon;

                    // Increment coupon usage
                    await tx.coupon.update({
                        where: { id: coupon.id },
                        data: { usedCount: { increment: 1 } },
                    });
                }

                const totalAmount = subtotal.minus(discount);

                // 6. Create Order
                const order = await tx.order.create({
                    data: {
                        userId,
                        status: "PENDING",
                        totalAmount: totalAmount.toFixed(2),
                        shippingAddr: {
                            fullName: shippingAddress.fullName,
                            phone: shippingAddress.phone,
                            line1: shippingAddress.line1,
                            line2: shippingAddress.line2,
                            city: shippingAddress.city,
                            state: shippingAddress.state,
                            postalCode: shippingAddress.postalCode,
                            country: shippingAddress.country,
                        },
                        billingAddr: {
                            fullName: billingAddress.fullName,
                            phone: billingAddress.phone,
                            line1: billingAddress.line1,
                            line2: billingAddress.line2,
                            city: billingAddress.city,
                            state: billingAddress.state,
                            postalCode: billingAddress.postalCode,
                            country: billingAddress.country,
                        },
                    },
                });

                // 7. Create OrderItems
                await tx.orderItem.createMany({
                    data: orderItemsData.map((item) => ({
                        ...item,
                        orderId: order.id,
                    })),
                });

                // 8. Decrement inventory
                for (const item of cartItems) {
                    await tx.inventory.update({
                        where: { variantId: item.variantId },
                        data: {
                            quantity: { decrement: item.quantity },
                        },
                    });
                }

                // 9. Mark cart as CHECKED_OUT
                if (cartItems[0].cart) {
                    await tx.cart.update({
                        where: { id: cartItems[0].cart.id },
                        data: { status: "CHECKED_OUT" },
                    });
                }

                // 10. Clear cart items (optional - keep for order history reference)
                await tx.cartItem.deleteMany({
                    where: { userId },
                });

                // 11. Create audit log
                await tx.auditLog.create({
                    data: {
                        userId,
                        action: "CREATE",
                        entity: "Order",
                        entityId: order.id,
                        metadata: {
                            subtotal: subtotal.toFixed(2),
                            discount: discount.toFixed(2),
                            totalAmount: totalAmount.toFixed(2),
                            itemsCount: orderItemsData.length,
                            couponCode: appliedCoupon?.code,
                        },
                        ipAddress: req.ip,
                        userAgent: req.headers["user-agent"],
                    },
                });

                return {
                    orderId: order.id,
                    totalAmount: totalAmount.toFixed(2),
                    subtotal: subtotal.toFixed(2),
                    discount: discount.toFixed(2),
                    itemsCount: orderItemsData.length,
                };
            },
            {
                maxWait: 10000, // 10 seconds
                timeout: 30000, // 30 seconds
            }
        );

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: result,
        });
    } catch (error) {
        console.error("Checkout error:", error);

        // Handle inventory errors specially
        if (error.message.includes("INVENTORY_ERROR")) {
            const errorData = JSON.parse(error.message);
            return res.status(400).json({
                success: false,
                error: "Inventory validation failed",
                details: errorData.issues,
            });
        }

        // Handle known errors
        const knownErrors = [
            "Cart is empty",
            "Invalid shipping address",
            "Invalid billing address",
            "Billing address is required",
            "Invalid coupon code",
            "Coupon is no longer active",
            "Coupon has expired",
            "Coupon usage limit reached",
        ];

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to process checkout",
        });
    }
};

/**
 * Validate cart before checkout (Optional pre-check endpoint)
 * POST /api/checkout/validate
 */
const validateCheckout = async (req, res) => {
    const userId = req.user?.id;

    try {
        const cartItems = await prisma.cartItem.findMany({
            where: {
                userId,
                cart: { status: "ACTIVE" },
            },
            include: {
                productVariant: {
                    include: {
                        inventory: true,
                        product: true,
                    },
                },
            },
        });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Cart is empty",
            });
        }

        const issues = [];
        let subtotal = new Decimal(0);

        for (const item of cartItems) {
            const variant = item.productVariant;

            if (!variant || variant.deletedAt) {
                issues.push({
                    variantId: item.variantId,
                    issue: "Product no longer available",
                });
                continue;
            }

            if (!variant.product.isActive) {
                issues.push({
                    variantId: item.variantId,
                    name: variant.product.name,
                    issue: "Product is inactive",
                });
                continue;
            }

            const availableStock = variant.inventory?.quantity || 0;
            if (availableStock < item.quantity) {
                issues.push({
                    variantId: item.variantId,
                    name: variant.product.name,
                    requested: item.quantity,
                    available: availableStock,
                    issue: "Insufficient stock",
                });
            } else {
                const itemTotal = new Decimal(variant.price).times(
                    item.quantity
                );
                subtotal = subtotal.plus(itemTotal);
            }
        }

        if (issues.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Cart validation failed",
                issues,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cart is valid",
            data: {
                itemsCount: cartItems.length,
                subtotal: subtotal.toFixed(2),
            },
        });
    } catch (error) {
        console.error("Validate checkout error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

export {
    initiateCheckout,
    validateCheckout,
}; 