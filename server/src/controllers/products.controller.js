import prisma from '../config/prisma.js'
import slugify from 'slugify';
import fs from 'fs';

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}
// Get product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

// Create a new product
const createProduct = async (req, res) => {
    const { name, description, price, categoryId, isActive = true, variants } = req.body;
    const thumbnailFile = req.files?.thumbnail?.[0];
    const secondaryImages = req.files?.images || [];

    if ( !name || !price || !categoryId ) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    let parsedVariants;
    try {
        parsedVariants = JSON.parse(variants);
    } catch {
        return res.status(400).json({
        success: false,
        error: "Invalid variants format",
        });
    }

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
        return res.status(400).json({
        success: false,
        error: "At least one variant is required",
        });
    }

    const slug = slugify(name, { lower: true, strict: true});
    const uploadedFiles = { thumbnailFile, ...secondaryImages };
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Check category existence 
            const category = await tx.category.findUnique({
                where: { id: parseInt(categoryId) }
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
                    categoryId: parseInt(categoryId)
                }
            })

            const createdVariants = [];
            for (const variant of parsedVariants) {
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
                    }
                })
                createdVariants.push(createdVariants);
            }

            // Handle thumbnail upload
            const imagesData = [
                {
                    productId: product.id,
                    url: `/uploads/products/${thumbnailFile.filename}`,
                    isMain: true
                }, 
                ...secondaryImages.map((img) => ({
                    productId: product.id,
                    url: `/uploads/products/${img.filename}`,
                    isMain: false
                }))
            ];
            await tx.productImage.createMany({
                data: imagesData
            });
            await tx.auditLog.create({
                data: {
                    action: 'CREATE',
                    entity: 'PRODUCT',
                    entityId: product.id,
                    timestamp: new Date(),
                    metadata: {
                        name, 
                        slug,
                        categoryId,
                        price,
                        variantsCount: createdVariants.length,
                    },
                },
            });
            return { product, variants: createdVariants }
        });
        res.status(201).json({ success: true, data: result, message: "Product created successfully" });
    } catch (error) {
        uploadedFiles.forEach(file => {
            fs.existsSync(file.path) && fs.unlinkSync(file.path);
        });
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, error: "Product with this name already exists" });
        }
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}
    
// Update Product


export { getAllProducts, getProductById, createProduct };