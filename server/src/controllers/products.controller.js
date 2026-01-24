import { prisma } from '../config/prisma.js';
import slugify from 'slugify';
import fs from 'fs';

// Get all products
const getAllProducts = async (req, res) => {
  try {
    // Optional query params
    const { page = 1, limit = 20, categoryId, isActive } = req.query;

    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(categoryId && { categoryId }),
        ...(isActive !== undefined && { isActive: isActive === "true" }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          include: { inventory: true },
        },
        images: true,
      },
      orderBy: { createdAt: "desc" },
      skip: Number(skip),
      take: Number(limit),
    });

    const total = await prisma.product.count({
      where: {
        deletedAt: null,
        ...(categoryId && { categoryId }),
        ...(isActive !== undefined && { isActive: isActive === "true" }),
      },
    });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
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

    res.status(200).json({
      success: true,
      data: product,
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
  const {
    name,
    description,
    price,
    categoryId,
    isActive = true,
    variants,
  } = req.body;

  const thumbnailFile = req.files?.thumbnail?.[0] || null;
  const secondaryImages = req.files?.images || [];

  if (!name || !price || !categoryId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  let parsedVariants = [];

  // Variants are OPTIONAL
  if (variants) {
    try {
      parsedVariants = JSON.parse(variants);
      if (!Array.isArray(parsedVariants)) {
        throw new Error();
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid variants format",
      });
    }
  }

  const hasVariants = parsedVariants.length > 0;
  const slug = slugify(name, { lower: true, strict: true });

  const uploadedFiles = [thumbnailFile, ...secondaryImages].filter(Boolean);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Validate category
      const category = await tx.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      // Create product
      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          price: parseFloat(price),
          isActive,
          categoryId,
          hasVariants,
        },
      });

      const createdVariants = [];

      // Create variants (only if present)
      if (hasVariants) {
        for (const variant of parsedVariants) {
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: variant.sku,
              price: parseFloat(variant.price),
              attributes: variant.attributes,
            },
          });

          await tx.inventory.create({
            data: {
              variantId: createdVariant.id, // ✅ FIXED
              quantity: variant.quantity ?? 0,
            },
          });

          createdVariants.push(createdVariant);
        }
      }

      // Images (optional)
      if (thumbnailFile || secondaryImages.length) {
        const imagesData = [
          thumbnailFile && {
            productId: product.id,
            url: `/uploads/products/${thumbnailFile.filename}`,
            isMain: true,
          },
          ...secondaryImages.map((img) => ({
            productId: product.id,
            url: `/uploads/products/${img.filename}`,
            isMain: false,
          })),
        ].filter(Boolean);

        await tx.productImage.createMany({ data: imagesData });
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
            hasVariants,
            variantsCount: createdVariants.length,
          },
        },
      });

      return { product, variants: createdVariants };
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result,
    });
  } catch (error) {
    uploadedFiles.forEach((file) => {
      file?.path && fs.existsSync(file.path) && fs.unlinkSync(file.path);
    });

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Product with this name already exists",
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
    
// Update Product
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, categoryId, isActive, variants, removeImageIds } = req.body;
    const thumbnailFile = req.files?.thumbnail?.[0];
    const newImages = req.files?.images || [];

    let parsedVariants = [];
    let parsedRemoveImages = [];
    
    try {
        if (variants) parsedVariants = json.parse(variants);
        if (removeImageIds) parsedRemoveImages = json.parse(removeImageIds);
    } catch (error) {
        return res.status(400).json({ success: false, error: "Invalid JSON format in variants or removeImageIds" });
    }
    const slug = name ? slugify(name, { lower: true, strict: true}) : null;
    const uploadedFiles = [ (thumbnailFile ? [thumbnailFile] : []), ...newImages ];
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Check if product exists
            const product = await tx.product.findUnique({
                where: { id: id },
                include: { variants: true },
            });
            if (!product) {
                throw new Error("Product not found");
            }
            // Update product details
            await tx.product.update({
                where: { id: id },
                data: {
                    name: name || product.name,
                    slug: slug || product.slug,
                    description: description || product.description,
                    price: price ? parseFloat(price) : product.price,
                    isActive: isActive !== undefined ? isActive : product.isActive,
                    categoryId: categoryId ? parseInt(categoryId) : product.categoryId,
                },
            });
            // Handel variants update
            for (const variant of parsedVariants) {
                if (variant._delete && variant.id) {
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: { isActive: false, deletedAt: new Date() },
                    });
                    continue;
                };
                if (variant.id) {
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: {
                            sku: variant.sku,
                            price: parseFloat(variant.price),
                            attributes: variant.attributes,
                        },
                    });
                    if (typeof variant.quantity === 'number') {
                        await tx.inventory.update({
                            where: { variantId: variant.id },
                            data: { quantity: variant.quantity },
                        });
                    }
                    continue;
                }
                // Create new variants
                const createdVariants = await tx.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: variant.sku,
                        price: parseFloat(variant.price),
                        attributes: variant.attributes,
                    },
                });
                await tx.inventory.create({
                    data: {
                        variantId: createdVariants.id,
                        quantity: variant.quantity ?? 0,
                    },
                });
            };
            // Handle image removals
            if ( parsedRemoveImages.length > 0 ) {
                const imagesToRemove = await tx.productImage.findMany({
                    where: { id: { in: parsedRemoveImages }, productId: product.id },
                });

                for (const img of imagesToRemove) {
                    const path = `${img.url}`;
                    fs.existsSync(path) && fs.unlinkSync(path);
                };
                await tx.productImage.deleteMany({
                    where: { id: { in: parsedRemoveImages }, productId: product.id },
                });

            };
            // Handle Thumbnail update
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
            };
            // Handle new images upload
            if (newImages.length > 0) {
                await tx.productImage.createMany({
                    data: newImages.map((img) => ({
                        productId: product.id,
                        url: `/uploads/products/${img.filename}`,
                        isMain: false,
                    })),
                });
            };

            await tx.auditLog.create({
                data: {
                    action: 'UPDATE', 
                    entity: 'PRODUCT',
                    entityId: product.id,
                    metadata: {
                        updatedFields: Object.keys(req.body),
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    userId: req.user.id,
                },
            });
            return { id };
        });
        return res.status(200).json({ success: true, data: result, message: "Product updated successfully" });
    } catch (error) {
        uploadedFiles.forEach(file => {
            fs.existsSync(file.path) && fs.unlinkSync(file.path);
        });
        if (error.message === "Product not found") {
            return res.status(404).json({ success: false, error: "Product not found" });
        }
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, error: "Product with this name already exists" });
        }
        console.log(error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

// Delete Product (Soft Delete)
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Check if product exists
            const product = await tx.product.findUnique({
                where: { id: id },
                include: { variants: true },
            })
            if (!product) {
                throw new Error("Product not found");
            };
            if (product.deletedAt) {
                throw new Error("Product already deleted");
            };
            const deletedAt = new Date();
            await tx.product.update({
                where: { id: id },
                data: { deletedAt, isActive: false },
            });
            if (product.variants.length > 0) {
                await tx.productVariant.updateMany({
                    where: { productId: product.id },
                    data: { deletedAt, isActive: false },   
                });
            }
            await tx.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'PRODUCT',
                    entityId: product.id,
                    metadata: {
                        name: product.name,
                        slug: product.slug,
                        categoryId: product.categoryId,
                        reason: "Product deleted",
                        variantsCount: product.variants.length,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    userId: req.user.id,
                },
            });
            return { id };
        });
        return res.status(200).json({ success: true, data: result, message: "Product deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

export { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };