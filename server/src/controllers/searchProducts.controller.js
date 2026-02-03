import { prisma } from "../config/prisma.js";

// Search users (for admin creating orders)
const searchUsers = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: "Search query must be at least 2 characters",
    });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          {
            userName: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        userName: true,
        email: true,
        phone: true,
        addresses: {
          where: { deletedAt: null },
          select: {
            id: true,
            fullName: true,
            street: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            phone: true,
            isDefault: true,
          },
        },
      },
      take: 10,
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Search products with variants (for admin creating orders)
const searchProducts = async (req, res) => {
  const { q, includeVariants } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: "Search query must be at least 2 characters",
    });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            sku: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        images: {
          where: { isMain: true },
          take: 1,
        },
        ...(includeVariants === "true" && {
          variants: {
            where: { deletedAt: null },
            include: {
              inventory: {
                select: {
                  quantity: true,
                },
              },
            },
          },
        }),
      },
      take: 15,
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Search products error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export { searchUsers, searchProducts };