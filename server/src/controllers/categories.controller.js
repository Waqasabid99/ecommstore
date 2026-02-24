import { prisma } from "../config/prisma.js";
import slugify from "slugify";

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        children: {
          include: {
            _count: {
              select: {
                products: true,
              },
            },
            children: {
              include: {
                _count: {
                  select: {
                    products: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Get all categories for admin
const getAllCategoriesForAdmin = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Optional: rename _count.products → productsCount
    const formatted = categories.map(cat => ({
      ...cat,
      productsCount: cat._count.products,
      _count: undefined,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  console.log(id)
    try {
        const category = await prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            return res.status(404).json({ success: false, error: "Category not found" });
        }
        return res.status(200).json({ success: true, data: category });
    } catch (error) {
      console.error(error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

// Create Category
const createCategory = async (req, res) => {
  const { name, parentId } = req.body;
  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Category name is required",
    });
  }

  const slug = slugify(name, { lower: true, strict: true });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Validate parent category (if provided)
      if (parentId) {
        const parent = await tx.category.findUnique({
          where: { id: parentId },
        });

        if (!parent) {
          throw new Error("Parent category not found");
        }
      }

      // Create category
      const category = await tx.category.create({
        data: {
          name,
          slug,
          parentId: parentId || null,
        },
      });

      // Audit log (optional but recommended)
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          entity: "Category",
          entityId: category.id,
          metadata: {
            name,
            slug,
            parentId: parentId || null,
          },
        },
      });

      return category;
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Category with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create category",
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, parentId } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: "Category name is required",
    });
  }

  const newSlug = slugify(name, { lower: true, strict: true });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Fetch existing category 
      const existingCategory = await tx.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new Error("CATEGORY_NOT_FOUND");
      }

      // Protect system category 
      if (existingCategory.slug === "uncategorized") {
        throw new Error("CANNOT_UPDATE_UNCATEGORIZED");
      }

      // Prevent slug collision 
      const slugExists = await tx.category.findFirst({
        where: {
          slug: newSlug,
          NOT: { id },
        },
      });

      if (slugExists) {
        throw new Error("SLUG_ALREADY_EXISTS");
      }

      // Prevent circular parent 
      if (parentId && parentId === id) {
        throw new Error("INVALID_PARENT");
      }

      // Update category 
      const updatedCategory = await tx.category.update({
        where: { id },
        data: {
          name: name.trim(),
          slug: newSlug,
          parentId: parentId ?? existingCategory.parentId,
        },
      });

      // Audit log 
      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "Category",
          entityId: id,
          metadata: {
            oldName: existingCategory.name,
            newName: name,
            oldSlug: existingCategory.slug,
            newSlug,
          },
        },
      });

      return updatedCategory;
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    console.log(error)
    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    if (error.message === "SLUG_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        error: "Another category with this name already exists",
      });
    }

    if (error.message === "CANNOT_UPDATE_UNCATEGORIZED") {
      return res.status(403).json({
        success: false,
        error: "Uncategorized category cannot be updated",
      });
    }

    if (error.message === "INVALID_PARENT") {
      return res.status(400).json({
        success: false,
        error: "Category cannot be its own parent",
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  const { id } = req.params;
console.log(id)
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Fetch category 
      const category = await tx.category.findUnique({
        where: { id },
        include: {
          products: { select: { id: true } },
          children: { select: { id: true } },
        },
      });
      console.log(category)
      if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
      }

      // Protect Uncategorized 
      if (category.slug === "uncategorized") {
        throw new Error("CANNOT_DELETE_UNCATEGORIZED");
      }

      // Block deletion if child categories exist 
      if (category.children.length > 0) {
        throw new Error("CATEGORY_HAS_CHILDREN");
      }

      // Fetch Uncategorized category 
      const uncategorized = await tx.category.findUnique({
        where: { slug: "uncategorized" },
      });

      if (!uncategorized) {
        throw new Error("UNCATEGORIZED_NOT_FOUND");
      }

      // Move products 
      if (category.products.length > 0) {
        await tx.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: uncategorized.id },
        });
      }

      // Delete category 
      const deletedCategory = await tx.category.delete({
        where: { id },
      });

      // Audit log 
      await tx.auditLog.create({
        data: {
          action: "DELETE",
          entity: "Category",
          entityId: id,
          metadata: {
            movedProductsCount: category.products.length,
            movedTo: uncategorized.id,
          },
        },
      });

      return {
        deletedCategory,
        movedProducts: category.products.length,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted and products moved to Uncategorized",
      data: result,
    });
  } catch (error) {
    console.log(error)
    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    if (error.message === "CATEGORY_HAS_CHILDREN") {
      return res.status(409).json({
        success: false,
        error: "Cannot delete category with child categories",
      });
    }

    if (error.message === "CANNOT_DELETE_UNCATEGORIZED") {
      return res.status(403).json({
        success: false,
        error: "Uncategorized category cannot be deleted",
      });
    }

    if (error.message === "UNCATEGORIZED_NOT_FOUND") {
      return res.status(500).json({
        success: false,
        error: "System category missing: Uncategorized",
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getAllCategoriesForAdmin };