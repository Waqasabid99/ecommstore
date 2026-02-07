import { prisma } from "../config/prisma.js";
import Decimal from "decimal.js";


// Get cart
const getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        items: {
          include: {
            variant: {
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

    // Auto-create cart
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: [] },
      });
    }

    let subtotal = new Decimal(0);
    const enrichedItems = [];
    const itemsWithIssues = [];

    for (const item of cart.items) {
      const variant = item.variant;
      const product = variant?.product;

      const issues = [];

      // Product / variant validity
      if (!variant || variant.deletedAt) {
        issues.push("Product variant no longer available");
      }

      if (!product || !product.isActive || product.deletedAt) {
        issues.push("Product is no longer available");
      }

      // Stock calculation (respect reservations)
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
          name: item.name,
          availableStock,
          issues,
        });
      }

      // Use SNAPSHOT price
      const itemPrice = new Decimal(item.price);
      const itemTotal = itemPrice.times(item.quantity);

      if (issues.length === 0) {
        subtotal = subtotal.plus(itemTotal);
      }

      enrichedItems.push({
        id: item.id,
        variantId: item.variantId,

        name: item.name,
        description: item.description,
        sku: item.sku,
        
        quantity: item.quantity,
        price: itemPrice.toFixed(2),
        itemTotal: itemTotal.toFixed(2),
        thumbnail: product?.images?.find((i) => i.isMain)?.url ?? null,
        images: product?.images?.map((i) => i.url) ?? null,
        category: product?.category.name ?? null,
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
          validItemCount:
            cart.items.length - itemsWithIssues.length,
          totalQuantity: cart.items.reduce(
            (sum, i) => sum + i.quantity,
            0
          ),
          subtotal: subtotal.toFixed(2),
        },
        issues:
          itemsWithIssues.length > 0
            ? itemsWithIssues
            : undefined,
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
  const userId = req.user.id;
  const { variantId, quantity = 1 } = req.body;

  if (!variantId) {
    return res.status(400).json({
      success: false,
      error: "variantId is required",
    });
  }

  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
    return res.status(400).json({
      success: false,
      error: "Quantity must be between 1 and 99",
    });
  }

  try {
    const cartItem = await prisma.$transaction(async (tx) => {
      // 1️⃣ Get or create active cart
      let cart = await tx.cart.findFirst({
        where: { userId, status: "ACTIVE" },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId },
        });
      }

      // 2️⃣ Fetch variant + inventory + product
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

      const available =
        (variant.inventory?.quantity ?? 0) -
        (variant.inventory?.reserved ?? 0);

      // 3️⃣ Check existing cart item
      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId,
          },
        },
      });

      const totalQty = (existing?.quantity ?? 0) + quantity;

      if (totalQty > available) {
        throw new Error(
          `Insufficient stock. Available: ${available}`
        );
      }

      // 4️⃣ Upsert cart item
      return tx.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId,
          },
        },
        update: {
          quantity: { increment: quantity },
          price: variant.price,
          name: variant.product.name,
          sku: variant.sku,
        },
        create: {
          cartId: cart.id,
          variantId,
          quantity,
          price: variant.price,
          name: variant.product.name,
          sku: variant.sku,
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cartItem,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
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
  const userId = req.user.id;

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return res.status(400).json({
      success: false,
      error: "Quantity must be between 1 and 99",
    });
  }

  try {
    const updatedItem = await prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cart: {
            userId,
            status: "ACTIVE",
          },
        },
        include: {
          variant: {
            include: {
              inventory: true,
              product: true,
            },
          },
        },
      });

      if (!item) {
        throw new Error("Cart item not found or cart not active");
      }

      const variant = item.variant;
      const product = variant.product;

      if (
        variant.deletedAt ||
        product.deletedAt ||
        !product.isActive
      ) {
        throw new Error("Product is no longer available");
      }

      const stock = variant.inventory?.quantity ?? 0;

      if (quantity > stock) {
        throw new Error(`Insufficient stock. Available: ${stock}`);
      }

      return tx.cartItem.update({
        where: { id: item.id },
        data: {
          quantity,
          price: variant.price, // explicit resync
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

            if (item.cart.userId !== userId) {
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
  const userId = req.user.id;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Guest cart is empty or invalid",
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Get or create ACTIVE cart
      let cart = await tx.cart.findFirst({
        where: { userId, status: "ACTIVE" },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId, status: "ACTIVE" },
        });
      }

      const mergedItems = [];
      const skippedItems = [];

      // 2️⃣ Process each guest item
      for (const guestItem of items) {
        const { variantId, quantity } = guestItem;

        if (
          !variantId ||
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          skippedItems.push({
            variantId,
            reason: "Invalid item data",
          });
          continue;
        }

        try {
          // 3️⃣ Validate variant
          const variant = await tx.productVariant.findUnique({
            where: { id: variantId },
            include: {
              inventory: true,
              product: {
                select: {
                  name: true,
                  isActive: true,
                  deletedAt: true,
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

          const availableStock = variant.inventory?.quantity ?? 0;

          if (availableStock <= 0) {
            skippedItems.push({
              variantId,
              name: variant.product.name,
              reason: "Out of stock",
            });
            continue;
          }

          // 4️⃣ Get existing cart item (SAFE way)
          const existingItem = await tx.cartItem.findUnique({
            where: {
              cartId_variantId: {
                cartId: cart.id,
                variantId,
              },
            },
          });

          const currentQuantity = existingItem?.quantity ?? 0;

          let finalQuantity = Math.min(
            currentQuantity + quantity,
            availableStock,
            99
          );

          if (finalQuantity <= 0) {
            skippedItems.push({
              variantId,
              name: variant.product.name,
              reason: "Insufficient stock",
            });
            continue;
          }

          // 5️⃣ Upsert cart item
          await tx.cartItem.upsert({
            where: {
              cartId_variantId: {
                cartId: cart.id,
                variantId,
              },
            },
            update: {
              quantity: finalQuantity,
              price: variant.price, // explicit resync
              name: variant.product.name,
              sku: variant.sku,
            },
            create: {
              cartId: cart.id,
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
            `Error processing variant ${variantId}:`,
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
  const userId = req.user.id;

  try {
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        items: {
          select: {
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          itemCount: 0,        // distinct items
          totalQuantity: 0,    // sum of quantities
          subtotal: "0.00",
          status: "ACTIVE",
        },
      });
    }

    let subtotal = new Decimal(0);
    let totalQuantity = 0;

    for (const item of cart.items) {
      subtotal = subtotal.plus(
        new Decimal(item.price).times(item.quantity)
      );
      totalQuantity += item.quantity;
    }

    return res.status(200).json({
      success: true,
      data: {
        itemCount: cart.items.length,
        totalQuantity,
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
