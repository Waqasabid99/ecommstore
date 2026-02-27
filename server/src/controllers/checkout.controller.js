import { prisma } from "../config/prisma.js";
import Decimal from "decimal.js";
import { calculatePricingWithPromotions } from "../constants/pricing.js";

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
        shippingMethod = "STANDARD", // STANDARD | EXPRESS
    } = req.body;

    if (!shippingAddressId) {
        return res.status(400).json({
            success: false,
            error: "Shipping address is required",
        });
    }
    console.log("The userId is: ", userId);
    try {
        const result = await prisma.$transaction(
            async (tx) => {
                // 1. Fetch user's cart with full details
                const cart = await tx.cart.findFirst({
                    where: {
                        userId,
                        status: "ACTIVE",
                    },
                    include: {
                        items: {
                            include: {
                                variant: {
                                    include: {
                                        inventory: true,
                                        product: {
                                            include: {
                                                images: true,
                                            },
                                        },
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
                        },
                        coupon: true,
                    },
                });
                console.log(cart)
                if (!cart || cart.items.length === 0) {
                    throw new Error("Cart is empty");
                }

                const cartItems = cart.items;

                // 2. Validate inventory for all items
                const inventoryIssues = [];
                for (const item of cartItems) {
                    const variant = item.variant;

                    if (!variant || variant.deletedAt) {
                        inventoryIssues.push({
                            variantId: item.variantId,
                            issue: "Product variant no longer available",
                        });
                        continue;
                    }

                    if (!variant.product.isActive || variant.product.deletedAt) {
                        inventoryIssues.push({
                            variantId: item.variantId,
                            name: variant.product.name,
                            issue: "Product is no longer active",
                        });
                        continue;
                    }

                    const availableStock =
                        (variant.inventory?.quantity || 0) -
                        (variant.inventory?.reserved || 0);
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

                // 3. Fetch and validate addresses
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

                // 4. Fetch shipping rate with updated schema (includes currency)
                const shippingRate = await tx.shippingRate.findFirst({
                    where: {
                        country: shippingAddress.country.toUpperCase(),
                        OR: [
                            { state: shippingAddress.state ? shippingAddress.state.toUpperCase() : null },
                            { state: null }
                        ],
                        method: shippingMethod,
                        isActive: true,
                    },
                    orderBy: {
                        state: "desc", // Prefer state-specific rates over country-wide
                    },
                });

                if (!shippingRate) {
                    throw new Error(
                        `No shipping rate found for ${shippingAddress.country}${
                            shippingAddress.state ? `, ${shippingAddress.state}` : ""
                        } with method ${shippingMethod}`
                    );
                }

                // 5. Validate and fetch coupon if provided
                let coupon = cart.coupon || null;
                if (couponCode && !coupon) {
                    coupon = await tx.coupon.findUnique({
                        where: { code: couponCode.toUpperCase() },
                    });

                    if (!coupon) {
                        throw new Error("Invalid coupon code");
                    }
                }

                // Validate coupon if present
                if (coupon) {
                    if (!coupon.isActive) {
                        throw new Error("Coupon is no longer active");
                    }

                    if (new Date() > coupon.expiresAt) {
                        throw new Error("Coupon has expired");
                    }

                    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                        throw new Error("Coupon usage limit reached");
                    }
                }

                // 6. Calculate order pricing with promotions
                // TODO: Calculate tax rate based on address (use tax service)
                const taxRate = 0.08;

                const pricing = await calculatePricingWithPromotions({
                    items: cartItems,
                    coupon,
                    shippingRate,
                    taxRate,
                    address: shippingAddress,
                    prisma: tx,
                });

                // 7. Validate minimum cart total for coupon
                if (coupon && coupon.minCartTotal) {
                    const subtotalDecimal = new Decimal(pricing.subtotal);
                    if (subtotalDecimal.lessThan(coupon.minCartTotal)) {
                        throw new Error(
                            `Minimum cart total of ${coupon.minCartTotal} required for this coupon`
                        );
                    }
                }

                // 8. Validate shipping rate min/max order
                if (shippingRate.minOrder || shippingRate.maxOrder) {
                    const subtotalDecimal = new Decimal(pricing.subtotal);
                    if (
                        shippingRate.minOrder &&
                        subtotalDecimal.lessThan(shippingRate.minOrder)
                    ) {
                        throw new Error(
                            `Minimum order value of ${shippingRate.currency} ${shippingRate.minOrder} required for this shipping method`
                        );
                    }
                    if (
                        shippingRate.maxOrder &&
                        subtotalDecimal.greaterThan(shippingRate.maxOrder)
                    ) {
                        throw new Error(
                            `Maximum order value of ${shippingRate.currency} ${shippingRate.maxOrder} exceeded for this shipping method`
                        );
                    }
                }

                // 9. Create Order with proper schema fields
                const order = await tx.order.create({
                    data: {
                        userId,
                        status: "PENDING",

                        // Pricing breakdown
                        subtotal: pricing.subtotal,
                        discountPct: pricing.discountPct,
                        discountAmount: pricing.discountAmount,
                        taxRate: pricing.taxRate,
                        taxAmount: pricing.taxAmount,
                        shippingMethod: pricing.shippingMethod,
                        shippingAmount: pricing.shippingAmount,
                        total: pricing.total,

                        // Coupon reference
                        couponId: pricing.couponId,

                        // Address snapshots
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

                // 10. Create OrderItems with validated pricing
                const orderItemsData = pricing.items.map((pricedItem) => {
                    return {
                        orderId: order.id,
                        variantId: pricedItem.variantId,
                        price: pricedItem.unitPrice,
                        quantity: pricedItem.quantity,
                    };
                });

                await tx.orderItem.createMany({
                    data: orderItemsData,
                });

                // 11. Reserve inventory (increment reserved count)
                for (const item of cartItems) {
                    const updated = await tx.inventory.updateMany({
                        where: {
                            variantId: item.variantId,
                            quantity: { gte: item.quantity }, // Ensure still available
                        },
                        data: {
                            reserved: { increment: item.quantity },
                        },
                    });
                    if (updated.count === 0) {
                        throw new Error(
                            `Inventory changed during checkout for item: ${item.variant.product.name}`
                        );
                    }
                }

                // 12. Increment coupon usage (with race condition protection)
                if (coupon && pricing.couponId) {
                    const updated = await tx.coupon.updateMany({
                        where: {
                            id: coupon.id,
                            isActive: true,
                            expiresAt: { gt: new Date() },
                            OR: [
                                { usageLimit: null },
                                { usedCount: { lt: coupon.usageLimit } },
                            ],
                        },
                        data: { usedCount: { increment: 1 } },
                    });

                    if (updated.count === 0) {
                        throw new Error("Coupon usage limit reached during checkout");
                    }
                }

                // 13. Mark cart as CHECKED_OUT
                await tx.cart.update({
                    where: { id: cart.id },
                    data: { status: "CHECKED_OUT" },
                });

                // 14. Clear cart items
                await tx.cartItem.deleteMany({
                    where: { cartId: cart.id },
                });

                // 15. Create audit log with currency information
                await tx.auditLog.create({
                    data: {
                        userId,
                        action: "CREATE",
                        entity: "Order",
                        entityId: order.id,
                        metadata: {
                            subtotal: pricing.subtotal,
                            promotionSavings: pricing.promotionSavings,
                            discountAmount: pricing.discountAmount,
                            taxAmount: pricing.taxAmount,
                            shippingAmount: pricing.shippingAmount,
                            shippingCurrency: shippingRate.currency,
                            total: pricing.total,
                            itemsCount: pricing.itemCount,
                            couponCode: pricing.couponCode,
                            shippingMethod: pricing.shippingMethod,
                        },
                        ipAddress: req.ip,
                        userAgent: req.headers["user-agent"],
                    },
                });

                return {
                    orderId: order.id,
                    total: pricing.total,
                    subtotal: pricing.subtotal,
                    promotionSavings: pricing.promotionSavings,
                    discountAmount: pricing.discountAmount,
                    totalSavings: pricing.totalSavings,
                    taxAmount: pricing.taxAmount,
                    shippingAmount: pricing.shippingAmount,
                    shippingCurrency: shippingRate.currency,
                    itemsCount: pricing.itemCount,
                    couponApplied: !!pricing.couponCode,
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
            try {
                const errorData = JSON.parse(error.message);
                return res.status(400).json({
                    success: false,
                    error: "Inventory validation failed",
                    details: errorData.issues,
                });
            } catch (parseError) {
                return res.status(400).json({
                    success: false,
                    error: "Inventory validation failed",
                });
            }
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
            "Coupon usage limit reached during checkout",
            "No shipping rate found",
            "Minimum cart total",
            "Minimum order value",
            "Maximum order value",
            "Inventory changed during checkout",
        ];

        if (knownErrors.some((known) => error.message.includes(known))) {
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
    const { shippingAddressId, shippingMethod = "STANDARD" } = req.body;

    try {
        const cart = await prisma.cart.findFirst({
            where: {
                userId,
                status: "ACTIVE",
            },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                inventory: true,
                                product: true,
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
                },
                coupon: true,
            },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Cart is empty",
            });
        }

        const issues = [];
        const validItems = [];

        // Validate inventory
        for (const item of cart.items) {
            const variant = item.variant;

            if (!variant || variant.deletedAt) {
                issues.push({
                    variantId: item.variantId,
                    issue: "Product no longer available",
                });
                continue;
            }

            if (!variant.product.isActive || variant.product.deletedAt) {
                issues.push({
                    variantId: item.variantId,
                    name: variant.product.name,
                    issue: "Product is inactive",
                });
                continue;
            }

            const availableStock =
                (variant.inventory?.quantity || 0) - (variant.inventory?.reserved || 0);
            if (availableStock < item.quantity) {
                issues.push({
                    variantId: item.variantId,
                    name: variant.product.name,
                    requested: item.quantity,
                    available: availableStock,
                    issue: "Insufficient stock",
                });
            } else {
                validItems.push(item);
            }
        }

        if (issues.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Cart validation failed",
                issues,
            });
        }

        // Get shipping rate if address provided
        let shippingRate = null;
        if (shippingAddressId) {
            const shippingAddress = await prisma.address.findFirst({
                where: { id: shippingAddressId, userId },
            });

            if (shippingAddress) {
                shippingRate = await prisma.shippingRate.findFirst({
                    where: {
                        country: shippingAddress.country.toUpperCase(),
                        OR: [
                            { state: shippingAddress.state ? shippingAddress.state.toUpperCase() : null },
                            { state: null }
                        ],
                        method: shippingMethod,
                        isActive: true,
                    },
                    orderBy: {
                        state: "desc",
                    },
                });
            }
        }

        // Calculate pricing with promotions
        const pricing = await calculatePricingWithPromotions({
            items: validItems,
            coupon: cart.coupon,
            shippingRate,
            taxRate: 0.08, // TODO: Calculate based on address
            prisma,
        });

        return res.status(200).json({
            success: true,
            message: "Cart is valid",
            data: {
                itemsCount: pricing.itemCount,
                subtotal: pricing.subtotal,
                promotionSavings: pricing.promotionSavings,
                discountAmount: pricing.discountAmount,
                totalSavings: pricing.totalSavings,
                estimatedTax: pricing.taxAmount,
                estimatedShipping: pricing.shippingAmount,
                shippingCurrency: shippingRate?.currency || "PKR",
                estimatedTotal: pricing.total,
                hasShippingRate: !!shippingRate,
                coupon: cart.coupon
                    ? {
                          code: cart.coupon.code,
                          discountType: cart.coupon.discountType,
                          discountValue: cart.coupon.discountValue,
                      }
                    : null,
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

/**
 * Get available shipping methods for address
 * POST /api/checkout/shipping-methods
 */
const getShippingMethods = async (req, res) => {
    const { shippingAddressId } = req.body;

    if (!shippingAddressId) {
        return res.status(400).json({
            success: false,
            error: "Shipping address ID is required",
        });
    }

    try {
        const userId = req.user?.id;

        const address = await prisma.address.findFirst({
            where: { id: shippingAddressId, userId },
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                error: "Address not found",
            });
        }

        const shippingRates = await prisma.shippingRate.findMany({
            where: {
                country: address.country.toUpperCase(),
                OR: [
                    { state: address.state ? address.state.toUpperCase() : null },
                    { state: null }
                ],
                isActive: true,
            },
            orderBy: [{ price: "asc" }],
        });

        if (shippingRates.length === 0) {
            return res.status(404).json({
                success: false,
                error: `No shipping methods available for ${address.country}${
                    address.state ? `, ${address.state}` : ""
                }`,
            });
        }

        const methods = shippingRates.map((rate) => ({
            id: rate.id,
            method: rate.method,
            price: rate.price,
            currency: rate.currency,
            minOrder: rate.minOrder,
            maxOrder: rate.maxOrder,
            country: rate.country,
            state: rate.state,
        }));

        return res.status(200).json({
            success: true,
            data: methods,
        });
    } catch (error) {
        console.error("Get shipping methods error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

export { initiateCheckout, validateCheckout, getShippingMethods };