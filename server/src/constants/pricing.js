import Decimal from "decimal.js";

/**
 * Get active promotions for a variant
 * Checks variant-level, product-level, and category-level promotions
 */
async function getActivePromotionsForVariant(variantId, prisma) {
    const now = new Date();

    const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: {
            product: {
                include: {
                    category: true,
                },
            },
            promotion: {
                where: {
                    isActive: true,
                    startsAt: { lte: now },
                    endsAt: { gte: now },
                },
            },
        },
    });

    if (!variant) return [];

    const promotions = [];

    // 1. Variant-level promotion
    if (variant.promotion) {
        promotions.push({
            ...variant.promotion,
            level: "VARIANT",
            priority: 1,
        });
    }

    // 2. Product-level promotions
    const productPromotions = await prisma.promotion.findMany({
        where: {
            isActive: true,
            startsAt: { lte: now },
            endsAt: { gte: now },
            appliesTo: "PRODUCT",
            products: {
                some: {
                    id: variant.product.id,
                },
            },
        },
    });

    promotions.push(
        ...productPromotions.map((p) => ({
            ...p,
            level: "PRODUCT",
            priority: 2,
        }))
    );

    // 3. Category-level promotions
    if (variant.product.category) {
        const categoryPromotions = await prisma.promotion.findMany({
            where: {
                isActive: true,
                startsAt: { lte: now },
                endsAt: { gte: now },
                appliesTo: "CATEGORY",
                categories: {
                    some: {
                        id: variant.product.categoryId,
                    },
                },
            },
        });

        promotions.push(
            ...categoryPromotions.map((p) => ({
                ...p,
                level: "CATEGORY",
                priority: 3,
            }))
        );
    }

    return promotions;
}

/**
 * Calculate the best price for a variant considering all applicable promotions
 */
function calculateBestPrice(basePrice, promotions, isStackable = false) {
    const price = new Decimal(basePrice);

    if (promotions.length === 0) {
        return {
            originalPrice: price.toFixed(2),
            finalPrice: price.toFixed(2),
            discountAmount: "0.00",
            promotions: [],
        };
    }

    // Sort by priority (variant > product > category)
    const sortedPromotions = [...promotions].sort((a, b) => a.priority - b.priority);

    let finalPrice = price;
    let totalDiscount = new Decimal(0);
    const appliedPromotions = [];

    if (isStackable) {
        // Stack all applicable promotions
        for (const promo of sortedPromotions) {
            if (!promo.isStackable) continue;

            let discount;
            if (promo.discountType === "PERCENT") {
                discount = finalPrice.times(promo.discountValue).dividedBy(100);
            } else {
                // FIXED
                discount = new Decimal(promo.discountValue);
            }

            // Don't let discount exceed remaining price
            if (discount.greaterThan(finalPrice)) {
                discount = finalPrice;
            }

            finalPrice = finalPrice.minus(discount);
            totalDiscount = totalDiscount.plus(discount);
            appliedPromotions.push({
                id: promo.id,
                name: promo.name,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                discountAmount: discount.toFixed(2),
                level: promo.level,
            });

            // Stop if price reaches 0
            if (finalPrice.isZero()) break;
        }
    } else {
        // Take the best single promotion
        let bestPromotion = null;
        let bestDiscount = new Decimal(0);

        for (const promo of sortedPromotions) {
            let discount;
            if (promo.discountType === "PERCENT") {
                discount = price.times(promo.discountValue).dividedBy(100);
            } else {
                // FIXED
                discount = new Decimal(promo.discountValue);
            }

            if (discount.greaterThan(price)) {
                discount = price;
            }

            if (discount.greaterThan(bestDiscount)) {
                bestDiscount = discount;
                bestPromotion = promo;
            }
        }

        if (bestPromotion) {
            finalPrice = price.minus(bestDiscount);
            totalDiscount = bestDiscount;
            appliedPromotions.push({
                id: bestPromotion.id,
                name: bestPromotion.name,
                discountType: bestPromotion.discountType,
                discountValue: bestPromotion.discountValue,
                discountAmount: bestDiscount.toFixed(2),
                level: bestPromotion.level,
            });
        }
    }

    return {
        originalPrice: price.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        discountAmount: totalDiscount.toFixed(2),
        promotions: appliedPromotions,
    };
}

/**
 * Enhanced pricing calculation with product/variant/category promotions
 * This is called when adding items to cart or recalculating cart totals
 */
export const calculatePricingWithPromotions = async ({
    items, // CartItem[] with variant.product
    coupon = null, // Coupon object or null
    shippingRate = null, // ShippingRate object or null
    taxRate = 0, // Decimal (e.g., 0.08 for 8%)
    address = null, // For tax/shipping determination
    prisma, // Prisma client for fetching promotions
}) => {
    let subtotal = new Decimal(0);
    const validatedItems = [];

    // Calculate item prices with promotions
    for (const item of items) {
        const basePrice = new Decimal(item.variant.price);

        // Get active promotions for this variant
        const promotions = await getActivePromotionsForVariant(item.variantId, prisma);

        // Calculate best price considering promotions
        const pricingResult = calculateBestPrice(
            basePrice,
            promotions,
            // Check if any promotion allows stacking
            promotions.some((p) => p.isStackable)
        );

        const finalUnitPrice = new Decimal(pricingResult.finalPrice);
        const quantity = item.quantity;
        const lineTotal = finalUnitPrice.times(quantity);

        subtotal = subtotal.plus(lineTotal);

        validatedItems.push({
            id: item.id,
            variantId: item.variantId,
            quantity,
            originalPrice: pricingResult.originalPrice,
            unitPrice: pricingResult.finalPrice,
            lineTotal: lineTotal.toFixed(2),
            promotions: pricingResult.promotions,
            savings: new Decimal(pricingResult.discountAmount).times(quantity).toFixed(2),
        });
    }

    // 2. Calculate coupon discount (cart-level)
    let discountAmount = new Decimal(0);
    let discountPct = null;
    let appliedCoupon = null;

    if (coupon && coupon.isActive && new Date() < coupon.expiresAt) {
        // Check minimum cart total
        if (coupon.minCartTotal && subtotal.lessThan(coupon.minCartTotal)) {
            // Coupon doesn't apply
        } else if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            appliedCoupon = coupon;

            if (coupon.discountType === "PERCENT") {
                discountPct = coupon.discountValue;
                discountAmount = subtotal.times(discountPct).dividedBy(100);
            } else if (coupon.discountType === "FIXED") {
                discountAmount = new Decimal(coupon.discountValue);
                if (discountAmount.greaterThan(subtotal)) {
                    discountAmount = subtotal;
                }
                discountPct = subtotal.isZero()
                    ? 0
                    : discountAmount.dividedBy(subtotal).times(100).toNumber();
            }
        }
    }

    // 3. Calculate taxable amount (subtotal - cart discount)
    const taxable = subtotal.minus(discountAmount);

    // 4. Calculate tax
    const taxAmount = taxable.times(taxRate);

    // 5. Calculate shipping
    let shippingAmount = new Decimal(0);
    let shippingMethod = null;

    if (shippingRate) {
        shippingMethod = shippingRate.method;
        shippingAmount = new Decimal(shippingRate.price);

        if (shippingRate.minOrder && subtotal.lessThan(shippingRate.minOrder)) {
            shippingAmount = new Decimal(0);
        }
        if (shippingRate.maxOrder && subtotal.greaterThan(shippingRate.maxOrder)) {
            shippingAmount = new Decimal(0);
        }
    }

    // 6. Calculate final total
    const total = taxable.plus(taxAmount).plus(shippingAmount);

    // Calculate total savings
    const totalPromotionSavings = validatedItems.reduce(
        (sum, item) => sum.plus(item.savings),
        new Decimal(0)
    );

    return {
        // Line items
        items: validatedItems,
        itemCount: items.length,
        totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),

        // Pricing breakdown
        subtotal: subtotal.toFixed(2),
        taxable: taxable.toFixed(2),

        // Promotion savings (item-level)
        promotionSavings: totalPromotionSavings.toFixed(2),

        // Coupon discount (cart-level)
        couponId: appliedCoupon?.id || null,
        couponCode: appliedCoupon?.code || null,
        discountPct,
        discountAmount: discountAmount.toFixed(2),

        // Total savings
        totalSavings: totalPromotionSavings.plus(discountAmount).toFixed(2),

        // Tax
        taxRate: new Decimal(taxRate).toFixed(4),
        taxAmount: taxAmount.toFixed(2),

        // Shipping
        shippingMethod,
        shippingAmount: shippingAmount.toFixed(2),

        // Final
        total: total.toFixed(2),

        // Metadata
        currency: "USD",
        calculatedAt: new Date().toISOString(),
    };
};

/**
 * Legacy function for backward compatibility
 * Use calculatePricingWithPromotions for new code
 */
export const calculatePricing = ({
    items,
    coupon = null,
    shippingRate = null,
    taxRate = 0,
    address = null,
}) => {
    // 1. Calculate subtotal from current variant prices
    let subtotal = new Decimal(0);
    const validatedItems = [];

    for (const item of items) {
        const currentPrice = new Decimal(item.variant.price);
        const quantity = item.quantity;
        const lineTotal = currentPrice.times(quantity);

        subtotal = subtotal.plus(lineTotal);

        validatedItems.push({
            id: item.id,
            variantId: item.variantId,
            quantity,
            unitPrice: currentPrice.toFixed(2),
            lineTotal: lineTotal.toFixed(2),
        });
    }

    // 2. Calculate discount
    let discountAmount = new Decimal(0);
    let discountPct = null;
    let appliedCoupon = null;

    if (coupon && coupon.isActive && new Date() < coupon.expiresAt) {
        if (coupon.minCartTotal && subtotal.lessThan(coupon.minCartTotal)) {
            // Coupon doesn't apply
        } else if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            appliedCoupon = coupon;

            if (coupon.discountType === "PERCENT") {
                discountPct = coupon.discountValue;
                discountAmount = subtotal.times(discountPct).dividedBy(100);
            } else if (coupon.discountType === "FIXED") {
                discountAmount = new Decimal(coupon.discountValue);
                if (discountAmount.greaterThan(subtotal)) {
                    discountAmount = subtotal;
                }
                discountPct = subtotal.isZero()
                    ? 0
                    : discountAmount.dividedBy(subtotal).times(100).toNumber();
            }
        }
    }

    // 3. Calculate taxable amount
    const taxable = subtotal.minus(discountAmount);

    // 4. Calculate tax
    const taxAmount = taxable.times(taxRate);

    // 5. Calculate shipping
    let shippingAmount = new Decimal(0);
    let shippingMethod = null;

    if (shippingRate) {
        shippingMethod = shippingRate.method;
        shippingAmount = new Decimal(shippingRate.price);

        if (shippingRate.minOrder && subtotal.lessThan(shippingRate.minOrder)) {
            shippingAmount = new Decimal(0);
        }
        if (shippingRate.maxOrder && subtotal.greaterThan(shippingRate.maxOrder)) {
            shippingAmount = new Decimal(0);
        }
    }

    // 6. Calculate final total
    const total = taxable.plus(taxAmount).plus(shippingAmount);

    return {
        items: validatedItems,
        itemCount: items.length,
        totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: subtotal.toFixed(2),
        taxable: taxable.toFixed(2),
        couponId: appliedCoupon?.id || null,
        couponCode: appliedCoupon?.code || null,
        discountPct,
        discountAmount: discountAmount.toFixed(2),
        taxRate: new Decimal(taxRate).toFixed(4),
        taxAmount: taxAmount.toFixed(2),
        shippingMethod,
        shippingAmount: shippingAmount.toFixed(2),
        total: total.toFixed(2),
        currency: "USD",
        calculatedAt: new Date().toISOString(),
    };
};