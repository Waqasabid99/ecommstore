import { prisma } from "../config/prisma.js";
import Decimal from "decimal.js";
import { calculatePricingWithPromotions } from "../constants/pricing.js";

// =====================================================
// GET CART
// =====================================================
const getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    let cart = await prisma.cart.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isMain: true }, take: 1 },
                    category: { select: { id: true, name: true, slug: true } },
                  },
                },
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
          },
          orderBy: { createdAt: "desc" },
        },
        coupon: true,
      },
    });

    // Auto-create cart if none exists
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, subtotal: 0, total: 0, status: "ACTIVE" },
        include: { items: [], coupon: true },
      });
    }

    const enrichedItems = [];
    const itemsWithIssues = [];
    const validItems = [];

    for (const item of cart.items) {
      const variant = item.variant;
      const product = variant?.product;
      const issues = [];

      if (!variant || variant.deletedAt) {
        issues.push("Product variant no longer available");
      }

      if (!product || !product.isActive || product.deletedAt) {
        issues.push("Product is no longer available");
      }

      const inventory = variant?.inventory;
      const availableStock = inventory
        ? Math.max(inventory.quantity - inventory.reserved, 0)
        : 0;

      if (item.quantity > availableStock) {
        issues.push(
          `Only ${availableStock} items available (you have ${item.quantity})`
        );
      }

      if (issues.length > 0) {
        itemsWithIssues.push({
          itemId: item.id,
          variantId: item.variantId,
          name: product?.name || item.name,
          availableStock,
          issues,
        });
      } else {
        validItems.push(item);
      }

      const currentPrice = variant
        ? new Decimal(variant.price)
        : new Decimal(item.price);
      const itemTotal = currentPrice.times(item.quantity);

      enrichedItems.push({
        id: item.id,
        variantId: item.variantId,
        name: product?.name || item.name,
        description: product?.description,
        sku: variant?.sku || item.sku,
        quantity: item.quantity,
        price: currentPrice.toFixed(2),
        originalPrice: item.originalPrice
          ? new Decimal(item.originalPrice).toFixed(2)
          : null,
        itemTotal: itemTotal.toFixed(2),
        thumbnail: product?.images?.find((i) => i.isMain)?.url ?? null,
        images: product?.images?.map((i) => i.url) ?? [],
        category: product?.category?.name ?? null,
        product: {
          id: product?.id,
          slug: product?.slug,
          category: product?.category,
          brand: product?.brand,
        },
        availableStock,
        hasIssues: issues.length > 0,
        issues,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }

    // Calculate pricing with promotions
    const pricing = await calculatePricingWithPromotions({
      items: validItems,
      coupon: cart.coupon,
      taxRate: cart.taxRate ? parseFloat(cart.taxRate) : 0,
      prisma,
    });

    // Persist recalculated totals
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotal: pricing.subtotal,
        discountPct: pricing.discountPct,
        discountAmount: pricing.discountAmount,
        taxAmount: pricing.taxAmount,
        total: pricing.total,
      },
    });

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
          validItemCount: validItems.length,
          totalQuantity: cart.items.reduce((sum, i) => sum + i.quantity, 0),
          subtotal: pricing.subtotal,
          promotionSavings: pricing.promotionSavings,
          discountAmount: pricing.discountAmount,
          discountPct: pricing.discountPct,
          totalSavings: pricing.totalSavings,
          taxAmount: pricing.taxAmount,
          taxRate: pricing.taxRate,
          shippingAmount: pricing.shippingAmount,
          total: pricing.total,
          coupon: cart.coupon
            ? {
                id: cart.coupon.id,
                code: cart.coupon.code,
                discountType: cart.coupon.discountType,
                discountValue: cart.coupon.discountValue,
              }
            : null,
        },
        issues: itemsWithIssues.length > 0 ? itemsWithIssues : undefined,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
};

// =====================================================
// ADD TO CART
// =====================================================
const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { variantId, quantity = 1 } = req.body;

  if (!variantId) {
    return res.status(400).json({ 
      success: false, 
      error: "variantId is required" 
    });
  }

  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
    return res.status(400).json({
      success: false,
      error: "Quantity must be between 1 and 99",
    });
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Get or create active cart
        let cart = await tx.cart.findFirst({
          where: { userId, status: "ACTIVE" },
          include: {
            items: { include: { variant: true } },
            coupon: true,
          },
        });

        if (!cart) {
          cart = await tx.cart.create({
            data: { userId, subtotal: 0, total: 0, status: "ACTIVE" },
            include: { items: [], coupon: true },
          });
        }

        // Fetch variant with inventory, product, and active promotions
        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
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
        });

        if (!variant || variant.deletedAt) {
          throw new Error("Product variant not found");
        }

        if (!variant.product.isActive || variant.product.deletedAt) {
          throw new Error("Product is no longer available");
        }

        const available =
          (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0);

        const existing = await tx.cartItem.findUnique({
          where: { cartId_variantId: { cartId: cart.id, variantId } },
        });

        const totalQty = (existing?.quantity ?? 0) + quantity;

        if (totalQty > available) {
          throw new Error(`Insufficient stock. Available: ${available}`);
        }

        // Snapshot the current price and promotion for the cart item
        const originalPrice = parseFloat(variant.price);
        const activePromotion = variant.promotion?.[0] || null;

        const cartItem = await tx.cartItem.upsert({
          where: { cartId_variantId: { cartId: cart.id, variantId } },
          update: {
            quantity: { increment: quantity },
            price: variant.price,
            originalPrice: originalPrice,
            promotionId: activePromotion?.id ?? null,
            name: variant.product.name,
            sku: variant.sku,
          },
          create: {
            cartId: cart.id,
            variantId,
            quantity,
            price: variant.price,
            originalPrice: originalPrice,
            promotionId: activePromotion?.id ?? null,
            name: variant.product.name,
            sku: variant.sku,
          },
          include: { variant: true },
        });

        // Fetch all items for repricing
        const allItems = await tx.cartItem.findMany({
          where: { cartId: cart.id },
          include: { 
            variant: { 
              include: { 
                product: true,
                promotion: {
                  where: {
                    isActive: true,
                    startsAt: { lte: new Date() },
                    endsAt: { gte: new Date() },
                  },
                },
              } 
            } 
          },
        });

        // Pass tx for transactional consistency
        const pricing = await calculatePricingWithPromotions({
          items: allItems,
          coupon: cart.coupon,
          taxRate: cart.taxRate ? parseFloat(cart.taxRate) : 0,
          prisma: tx,
        });

        await tx.cart.update({
          where: { id: cart.id },
          data: {
            subtotal: pricing.subtotal,
            discountPct: pricing.discountPct,
            discountAmount: pricing.discountAmount,
            taxAmount: pricing.taxAmount,
            total: pricing.total,
          },
        });

        return { cartItem, pricing };
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: {
        item: result.cartItem,
        summary: {
          subtotal: result.pricing.subtotal,
          promotionSavings: result.pricing.promotionSavings,
          discountAmount: result.pricing.discountAmount,
          total: result.pricing.total,
          itemCount: result.pricing.itemCount,
        },
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    
    // Handle known errors
    const knownErrors = [
      "Product variant not found",
      "Product is no longer available",
      "Insufficient stock",
    ];

    if (knownErrors.some((known) => error.message.includes(known))) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to add item to cart",
    });
  }
};

// =====================================================
// UPDATE CART ITEM QUANTITY
// =====================================================
const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return res.status(400).json({
      success: false,
      error: "Quantity must be between 1 and 99",
    });
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const item = await tx.cartItem.findFirst({
          where: { id: itemId, cart: { userId, status: "ACTIVE" } },
          include: {
            cart: { include: { coupon: true } },
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
        });

        if (!item) {
          throw new Error("Cart item not found or cart not active");
        }

        const { variant } = item;
        const { product } = variant;

        if (variant.deletedAt || product.deletedAt || !product.isActive) {
          throw new Error("Product is no longer available");
        }

        const availableStock =
          (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0);

        if (quantity > availableStock) {
          throw new Error(`Insufficient stock. Available: ${availableStock}`);
        }

        const activePromotion = variant.promotion?.[0] || null;

        const updatedItem = await tx.cartItem.update({
          where: { id: item.id },
          data: {
            quantity,
            price: variant.price,
            originalPrice: parseFloat(variant.price),
            promotionId: activePromotion?.id ?? null,
            name: product.name,
            sku: variant.sku,
          },
          include: { variant: true },
        });

        const allItems = await tx.cartItem.findMany({
          where: { cartId: item.cartId },
          include: { 
            variant: { 
              include: { 
                product: true,
                promotion: {
                  where: {
                    isActive: true,
                    startsAt: { lte: new Date() },
                    endsAt: { gte: new Date() },
                  },
                },
              } 
            } 
          },
        });

        const pricing = await calculatePricingWithPromotions({
          items: allItems,
          coupon: item.cart.coupon,
          taxRate: item.cart.taxRate ? parseFloat(item.cart.taxRate) : 0,
          prisma: tx,
        });

        await tx.cart.update({
          where: { id: item.cartId },
          data: {
            subtotal: pricing.subtotal,
            discountPct: pricing.discountPct,
            discountAmount: pricing.discountAmount,
            taxAmount: pricing.taxAmount,
            total: pricing.total,
          },
        });

        return { updatedItem, pricing };
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: {
        item: result.updatedItem,
        summary: {
          subtotal: result.pricing.subtotal,
          promotionSavings: result.pricing.promotionSavings,
          discountAmount: result.pricing.discountAmount,
          total: result.pricing.total,
          itemCount: result.pricing.itemCount,
        },
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    
    // Handle known errors
    const knownErrors = [
      "Cart item not found",
      "cart not active",
      "Product is no longer available",
      "Insufficient stock",
    ];

    if (knownErrors.some((known) => error.message.includes(known))) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to update cart item",
    });
  }
};

// =====================================================
// REMOVE ITEM FROM CART
// =====================================================
const removeCartItem = async (req, res) => {
  const { id: itemId } = req.params;
  const userId = req.user?.id;

  if (!itemId) {
    return res.status(400).json({
      success: false,
      error: "Item ID is required",
    });
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const item = await tx.cartItem.findUnique({
          where: { id: itemId },
          include: { cart: { include: { coupon: true } } },
        });

        if (!item) {
          throw new Error("Cart item not found");
        }

        if (item.cart.userId !== userId) {
          throw new Error("Unauthorized cart access");
        }

        if (item.cart.status !== "ACTIVE") {
          throw new Error("Cannot modify a checked-out cart");
        }

        await tx.cartItem.delete({ where: { id: itemId } });

        const allItems = await tx.cartItem.findMany({
          where: { cartId: item.cartId },
          include: { 
            variant: { 
              include: { 
                product: true,
                promotion: {
                  where: {
                    isActive: true,
                    startsAt: { lte: new Date() },
                    endsAt: { gte: new Date() },
                  },
                },
              } 
            } 
          },
        });

        const pricing = await calculatePricingWithPromotions({
          items: allItems,
          coupon: item.cart.coupon,
          taxRate: item.cart.taxRate ? parseFloat(item.cart.taxRate) : 0,
          prisma: tx,
        });

        await tx.cart.update({
          where: { id: item.cartId },
          data: {
            subtotal: pricing.subtotal,
            discountPct: pricing.discountPct,
            discountAmount: pricing.discountAmount,
            taxAmount: pricing.taxAmount,
            total: pricing.total,
          },
        });

        return pricing;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: {
        summary: {
          subtotal: result.subtotal,
          promotionSavings: result.promotionSavings,
          discountAmount: result.discountAmount,
          total: result.total,
          itemCount: result.itemCount,
        },
      },
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    // Handle known errors
    const knownErrors = [
      "Cart item not found",
      "Unauthorized cart access",
      "Cannot modify a checked-out cart",
    ];

    if (knownErrors.some((known) => error.message.includes(known))) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to remove cart item",
    });
  }
};

// =====================================================
// CLEAR CART
// =====================================================
const clearCart = async (req, res) => {
  const userId = req.user?.id;

  try {
    await prisma.$transaction(
      async (tx) => {
        const cart = await tx.cart.findFirst({
          where: { userId, status: "ACTIVE" },
        });

        if (!cart) {
          throw new Error("Cart not found");
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        await tx.cart.update({
          where: { id: cart.id },
          data: {
            couponId: null,
            subtotal: 0,
            discountPct: null,
            discountAmount: null,
            taxAmount: null,
            total: 0,
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return res.status(200).json({ 
      success: true, 
      message: "Cart cleared successfully" 
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    if (error.message === "Cart not found") {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
};

// =====================================================
// MERGE GUEST CART INTO USER CART (after login)
// =====================================================
const mergeCart = async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Guest cart is empty or invalid",
    });
  }

  try {
    const now = new Date();
    const variantIds = [...new Set(items.map((i) => i.variantId))];

    // Fetch variants in one query
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        inventory: true,
        product: {
          select: {
            id: true,
            name: true,
            isActive: true,
            deletedAt: true,
            categoryId: true,
          },
        },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Fetch all active promotions in one query
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        products: { select: { id: true } },
        categories: { select: { id: true } },
        variants: { select: { id: true } },
      },
    });

    // Helper to match promotions in-memory
    const getPromotionsForVariant = (variant) => {
      return promotions.filter((promo) => {
        if (
          promo.appliesTo === "VARIANT" &&
          promo.variants.some((v) => v.id === variant.id)
        )
          return true;

        if (
          promo.appliesTo === "PRODUCT" &&
          promo.products.some((p) => p.id === variant.product.id)
        )
          return true;

        if (
          promo.appliesTo === "CATEGORY" &&
          promo.categories.some((c) => c.id === variant.product.categoryId)
        )
          return true;

        return false;
      });
    };

    // Pre-validate items (no transaction)
    const validatedItems = [];
    const skippedItems = [];

    for (const item of items) {
      const variant = variantMap.get(item.variantId);

      if (!variant || !variant.product.isActive || variant.product.deletedAt) {
        skippedItems.push({
          variantId: item.variantId,
          reason: "Product unavailable",
        });
        continue;
      }

      const availableStock =
        (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0);

      if (availableStock <= 0) {
        skippedItems.push({
          variantId: item.variantId,
          reason: "Out of stock",
        });
        continue;
      }

      validatedItems.push({
        variant,
        quantity: Math.min(item.quantity, availableStock, 99),
        promotions: getPromotionsForVariant(variant),
      });
    }

    // Mutation phase (short transaction)
    const result = await prisma.$transaction(
      async (tx) => {
        let cart = await tx.cart.findFirst({
          where: { userId, status: "ACTIVE" },
          include: { coupon: true },
        });

        if (!cart) {
          cart = await tx.cart.create({
            data: { userId, status: "ACTIVE", subtotal: 0, total: 0 },
            include: { coupon: true },
          });
        }

        // Fetch existing cart items once
        const existingItems = await tx.cartItem.findMany({
          where: { cartId: cart.id },
        });

        const existingMap = new Map(existingItems.map((i) => [i.variantId, i]));

        for (const item of validatedItems) {
          const { variant, quantity, promotions } = item;
          const existing = existingMap.get(variant.id);

          const basePrice = new Decimal(variant.price);

          // Get best promotion discount
          let bestDiscount = new Decimal(0);
          let bestPromotionId = null;

          for (const promo of promotions) {
            let discount =
              promo.discountType === "PERCENT"
                ? basePrice.times(promo.discountValue).dividedBy(100)
                : new Decimal(promo.discountValue);

            if (discount.greaterThan(bestDiscount)) {
              bestDiscount = discount;
              bestPromotionId = promo.id;
            }
          }

          const finalPrice = basePrice.minus(bestDiscount);
          const finalQuantity = existing
            ? Math.min(existing.quantity + quantity, 99)
            : quantity;

          await tx.cartItem.upsert({
            where: {
              cartId_variantId: {
                cartId: cart.id,
                variantId: variant.id,
              },
            },
            update: {
              quantity: finalQuantity,
              price: finalPrice.toFixed(2),
              originalPrice: basePrice.toFixed(2),
              promotionId: bestPromotionId,
            },
            create: {
              cartId: cart.id,
              variantId: variant.id,
              quantity: finalQuantity,
              price: finalPrice.toFixed(2),
              originalPrice: basePrice.toFixed(2),
              promotionId: bestPromotionId,
              name: variant.product.name,
              sku: variant.sku,
            },
          });
        }

        // Recalculate cart totals
        const allItems = await tx.cartItem.findMany({
          where: { cartId: cart.id },
          include: { 
            variant: { 
              include: { 
                product: true,
                promotion: {
                  where: {
                    isActive: true,
                    startsAt: { lte: now },
                    endsAt: { gte: now },
                  },
                },
              } 
            } 
          },
        });

        const pricing = await calculatePricingWithPromotions({
          items: allItems,
          coupon: cart.coupon,
          taxRate: cart.taxRate ? parseFloat(cart.taxRate) : 0,
          prisma: tx,
        });

        await tx.cart.update({
          where: { id: cart.id },
          data: {
            subtotal: pricing.subtotal,
            discountPct: pricing.discountPct,
            discountAmount: pricing.discountAmount,
            taxAmount: pricing.taxAmount,
            total: pricing.total,
          },
        });

        return {
          mergedCount: validatedItems.length,
          skippedCount: skippedItems.length,
          subtotal: pricing.subtotal,
          total: pricing.total,
          skippedItems: skippedItems.length > 0 ? skippedItems : undefined,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Cart merged successfully",
      data: result,
    });
  } catch (error) {
    console.error("Merge cart error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// =====================================================
// GET CART SUMMARY (lightweight)
// =====================================================
const getCartSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await prisma.cart.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        items: { 
          include: { 
            variant: { 
              include: { 
                product: true,
                promotion: {
                  where: {
                    isActive: true,
                    startsAt: { lte: new Date() },
                    endsAt: { gte: new Date() },
                  },
                },
              } 
            } 
          } 
        },
        coupon: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          itemCount: 0,
          totalQuantity: 0,
          subtotal: "0.00",
          promotionSavings: "0.00",
          discountAmount: "0.00",
          total: "0.00",
          status: "ACTIVE",
        },
      });
    }

    const pricing = await calculatePricingWithPromotions({
      items: cart.items,
      coupon: cart.coupon,
      taxRate: cart.taxRate ? parseFloat(cart.taxRate) : 0,
      prisma,
    });

    // Fire-and-forget background update
    prisma.cart
      .update({
        where: { id: cart.id },
        data: {
          subtotal: pricing.subtotal,
          discountPct: pricing.discountPct,
          discountAmount: pricing.discountAmount,
          taxAmount: pricing.taxAmount,
          total: pricing.total,
        },
      })
      .catch((err) => console.error("Background cart update error:", err));

    return res.status(200).json({
      success: true,
      data: {
        itemCount: pricing.itemCount,
        totalQuantity: pricing.totalQuantity,
        subtotal: pricing.subtotal,
        promotionSavings: pricing.promotionSavings,
        discountAmount: pricing.discountAmount,
        taxAmount: pricing.taxAmount,
        total: pricing.total,
        status: cart.status,
      },
    });
  } catch (error) {
    console.error("Get cart summary error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
};

// =====================================================
// APPLY COUPON TO CART
// =====================================================
const applyCoupon = async (req, res) => {
  const userId = req.user.id;
  const { couponCode } = req.body;

  if (!couponCode) {
    return res.status(400).json({
      success: false,
      error: "Coupon code is required",
    });
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const cart = await tx.cart.findFirst({
          where: { userId, status: "ACTIVE" },
          include: {
            items: {
              include: {
                variant: {
                  include: {
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
          throw new Error("Cart is empty");
        }

        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
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

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          throw new Error("Coupon usage limit reached");
        }

        // Calculate pricing with coupon
        const pricing = await calculatePricingWithPromotions({
          items: cart.items,
          coupon,
          taxRate: cart.taxRate ? parseFloat(cart.taxRate) : 0,
          prisma: tx,
        });

        // Validate minimum cart total
        if (coupon.minCartTotal) {
          const subtotalDecimal = new Decimal(pricing.subtotal);
          if (subtotalDecimal.lessThan(coupon.minCartTotal)) {
            throw new Error(
              `Minimum cart total of ${coupon.minCartTotal} required for this coupon`
            );
          }
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
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        coupon: {
          id: result.coupon.id,
          code: result.coupon.code,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discountValue,
        },
        summary: {
          subtotal: result.pricing.subtotal,
          promotionSavings: result.pricing.promotionSavings,
          discountAmount: result.pricing.discountAmount,
          totalSavings: result.pricing.totalSavings,
          total: result.pricing.total,
        },
      },
    });
  } catch (error) {
    console.error("Apply coupon error:", error);

    // Handle known errors
    const knownErrors = [
      "Cart is empty",
      "Invalid coupon code",
      "Coupon is no longer active",
      "Coupon has expired",
      "Coupon usage limit reached",
      "Minimum cart total",
    ];

    if (knownErrors.some((known) => error.message.includes(known))) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to apply coupon",
    });
  }
};

// =====================================================
// REMOVE COUPON FROM CART
// =====================================================
const removeCoupon = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const cart = await tx.cart.findFirst({
          where: { userId, status: "ACTIVE" },
          include: {
            items: {
              include: {
                variant: {
                  include: {
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
          },
        });

        if (!cart) {
          throw new Error("Cart not found");
        }

        if (!cart.couponId) {
          throw new Error("No coupon applied to cart");
        }

        // Recalculate pricing without coupon
        const pricing = await calculatePricingWithPromotions({
          items: cart.items,
          coupon: null,
          taxRate: cart.taxRate ? parseFloat(cart.taxRate) : 0,
          prisma: tx,
        });

        await tx.cart.update({
          where: { id: cart.id },
          data: {
            couponId: null,
            subtotal: pricing.subtotal,
            discountPct: pricing.discountPct,
            discountAmount: pricing.discountAmount,
            taxAmount: pricing.taxAmount,
            total: pricing.total,
          },
        });

        return pricing;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
      data: {
        summary: {
          subtotal: result.subtotal,
          promotionSavings: result.promotionSavings,
          discountAmount: result.discountAmount,
          total: result.total,
        },
      },
    });
  } catch (error) {
    console.error("Remove coupon error:", error);

    // Handle known errors
    const knownErrors = ["Cart not found", "No coupon applied to cart"];

    if (knownErrors.some((known) => error.message.includes(known))) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to remove coupon",
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
  applyCoupon,
  removeCoupon,
};