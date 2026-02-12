import { prisma } from "../config/prisma.js";
import Decimal from "decimal.js";

// Create shipping rate
const createShippingRate = async (req, res) => {
    const {
        country,
        state,
        method,
        price,
        minOrder,
        maxOrder,
        currency = "PKR",
        isActive = true,
    } = req.body;

    // Validation
    if (!country) {
        return res.status(400).json({
            success: false,
            error: "Country is required",
        });
    }

    if (!method) {
        return res.status(400).json({
            success: false,
            error: "Shipping method is required",
        });
    }

    const validMethods = ["STANDARD", "EXPRESS"];
    if (!validMethods.includes(method.toUpperCase())) {
        return res.status(400).json({
            success: false,
            error: `Invalid shipping method. Must be one of: ${validMethods.join(", ")}`,
        });
    }

    if (price === undefined || price === null) {
        return res.status(400).json({
            success: false,
            error: "Price is required",
        });
    }

    const priceDecimal = new Decimal(price);
    if (priceDecimal.lessThan(0)) {
        return res.status(400).json({
            success: false,
            error: "Price must be greater than or equal to 0",
        });
    }

    // Validate minOrder and maxOrder if provided
    if (minOrder !== undefined && minOrder !== null) {
        const minOrderDecimal = new Decimal(minOrder);
        if (minOrderDecimal.lessThan(0)) {
            return res.status(400).json({
                success: false,
                error: "Minimum order must be greater than or equal to 0",
            });
        }
    }

    if (maxOrder !== undefined && maxOrder !== null) {
        const maxOrderDecimal = new Decimal(maxOrder);
        if (maxOrderDecimal.lessThan(0)) {
            return res.status(400).json({
                success: false,
                error: "Maximum order must be greater than or equal to 0",
            });
        }

        if (minOrder !== undefined && minOrder !== null) {
            const minOrderDecimal = new Decimal(minOrder);
            if (maxOrderDecimal.lessThanOrEqualTo(minOrderDecimal)) {
                return res.status(400).json({
                    success: false,
                    error: "Maximum order must be greater than minimum order",
                });
            }
        }
    }

    try {
        // Check for duplicate shipping rate (same country, state, method)
        const existingRate = await prisma.shippingRate.findFirst({
            where: {
                country: country.toUpperCase(),
                state: state ? state.toUpperCase() : null,
                method: method.toUpperCase(),
            },
        });

        if (existingRate) {
            return res.status(409).json({
                success: false,
                error: `A shipping rate for ${method} in ${country}${
                    state ? `, ${state}` : ""
                } already exists`,
            });
        }

        const shippingRate = await prisma.shippingRate.create({
            data: {
                country: country.toUpperCase(),
                state: state ? state.toUpperCase() : null,
                method: method.toUpperCase(),
                price: priceDecimal.toFixed(2),
                minOrder: minOrder ? new Decimal(minOrder).toFixed(2) : null,
                maxOrder: maxOrder ? new Decimal(maxOrder).toFixed(2) : null,
                currency: currency.toUpperCase(),
                isActive,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: "CREATE",
                entity: "ShippingRate",
                entityId: shippingRate.id,
                metadata: {
                    country: shippingRate.country,
                    state: shippingRate.state,
                    method: shippingRate.method,
                    price: shippingRate.price,
                    currency: shippingRate.currency,
                },
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            },
        });

        return res.status(201).json({
            success: true,
            message: "Shipping rate created successfully",
            data: shippingRate,
        });
    } catch (error) {
        console.error("Create shipping rate error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to create shipping rate",
        });
    }
};

// Update a shipping rate
const updateShippingRate = async (req, res) => {
    const { id } = req.params;
    const { country, state, method, price, minOrder, maxOrder, currency, isActive } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Shipping rate ID is required",
        });
    }

    try {
        // Check if shipping rate exists
        const existingRate = await prisma.shippingRate.findUnique({
            where: { id },
        });

        if (!existingRate) {
            return res.status(404).json({
                success: false,
                error: "Shipping rate not found",
            });
        }

        // Build update data object
        const updateData = {};

        if (country !== undefined) {
            updateData.country = country.toUpperCase();
        }

        if (state !== undefined) {
            updateData.state = state ? state.toUpperCase() : null;
        }

        if (method !== undefined) {
            const validMethods = ["STANDARD", "EXPRESS"];
            if (!validMethods.includes(method.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid shipping method. Must be one of: ${validMethods.join(", ")}`,
                });
            }
            updateData.method = method.toUpperCase();
        }

        if (price !== undefined && price !== null) {
            const priceDecimal = new Decimal(price);
            if (priceDecimal.lessThan(0)) {
                return res.status(400).json({
                    success: false,
                    error: "Price must be greater than or equal to 0",
                });
            }
            updateData.price = priceDecimal.toFixed(2);
        }

        if (minOrder !== undefined) {
            if (minOrder === null) {
                updateData.minOrder = null;
            } else {
                const minOrderDecimal = new Decimal(minOrder);
                if (minOrderDecimal.lessThan(0)) {
                    return res.status(400).json({
                        success: false,
                        error: "Minimum order must be greater than or equal to 0",
                    });
                }
                updateData.minOrder = minOrderDecimal.toFixed(2);
            }
        }

        if (maxOrder !== undefined) {
            if (maxOrder === null) {
                updateData.maxOrder = null;
            } else {
                const maxOrderDecimal = new Decimal(maxOrder);
                if (maxOrderDecimal.lessThan(0)) {
                    return res.status(400).json({
                        success: false,
                        error: "Maximum order must be greater than or equal to 0",
                    });
                }

                // Validate against minOrder
                const finalMinOrder =
                    minOrder !== undefined ? minOrder : existingRate.minOrder;
                if (finalMinOrder !== null && finalMinOrder !== undefined) {
                    const minOrderDecimal = new Decimal(finalMinOrder);
                    if (maxOrderDecimal.lessThanOrEqualTo(minOrderDecimal)) {
                        return res.status(400).json({
                            success: false,
                            error: "Maximum order must be greater than minimum order",
                        });
                    }
                }

                updateData.maxOrder = maxOrderDecimal.toFixed(2);
            }
        }

        if (currency !== undefined) {
            updateData.currency = currency.toUpperCase();
        }

        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        // Check for duplicate if country/state/method is being changed
        if (country !== undefined || state !== undefined || method !== undefined) {
            const finalCountry = country !== undefined ? country : existingRate.country;
            const finalState =
                state !== undefined
                    ? state
                        ? state.toUpperCase()
                        : null
                    : existingRate.state;
            const finalMethod = method !== undefined ? method : existingRate.method;

            const duplicateCheck = await prisma.shippingRate.findFirst({
                where: {
                    id: { not: id },
                    country: finalCountry.toUpperCase(),
                    state: finalState,
                    method: finalMethod.toUpperCase(),
                },
            });

            if (duplicateCheck) {
                return res.status(409).json({
                    success: false,
                    error: `A shipping rate for ${finalMethod} in ${finalCountry}${
                        finalState ? `, ${finalState}` : ""
                    } already exists`,
                });
            }
        }

        const updatedRate = await prisma.shippingRate.update({
            where: { id },
            data: updateData,
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: "UPDATE",
                entity: "ShippingRate",
                entityId: updatedRate.id,
                metadata: {
                    changes: updateData,
                    before: existingRate,
                },
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            },
        });

        return res.status(200).json({
            success: true,
            message: "Shipping rate updated successfully",
            data: updatedRate,
        });
    } catch (error) {
        console.error("Update shipping rate error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to update shipping rate",
        });
    }
};

// Delete a shipping rate
const deleteShippingRate = async (req, res) => {
    const { id } = req.params;
    const { permanent = false } = req.query; // Optional: allow hard delete

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Shipping rate ID is required",
        });
    }

    try {
        const existingRate = await prisma.shippingRate.findUnique({
            where: { id },
        });

        if (!existingRate) {
            return res.status(404).json({
                success: false,
                error: "Shipping rate not found",
            });
        }

        // Check if shipping rate is currently being used in any pending orders
        const ordersUsingRate = await prisma.order.count({
            where: {
                shippingMethod: existingRate.method,
                status: {
                    in: ["PENDING", "AWAITING_PAYMENT", "PAID"],
                },
            },
        });

        if (ordersUsingRate > 0 && permanent) {
            return res.status(400).json({
                success: false,
                error: `Cannot permanently delete shipping rate. ${ordersUsingRate} active order(s) are using this rate. Deactivate instead.`,
            });
        }

        let result;
        let action;

        if (permanent) {
            // Hard delete
            result = await prisma.shippingRate.delete({
                where: { id },
            });
            action = "DELETE";
        } else {
            // Soft delete (deactivate)
            result = await prisma.shippingRate.update({
                where: { id },
                data: { isActive: false },
            });
            action = "UPDATE";
        }

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action,
                entity: "ShippingRate",
                entityId: id,
                metadata: {
                    deletionType: permanent ? "permanent" : "soft",
                    rate: existingRate,
                },
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            },
        });

        return res.status(200).json({
            success: true,
            message: permanent
                ? "Shipping rate deleted permanently"
                : "Shipping rate deactivated successfully",
            data: result,
        });
    } catch (error) {
        console.error("Delete shipping rate error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete shipping rate",
        });
    }
};

// Get shipping rate by ID
const getShippingRateById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Shipping rate ID is required",
        });
    }

    try {
        const shippingRate = await prisma.shippingRate.findUnique({
            where: { id },
        });

        if (!shippingRate) {
            return res.status(404).json({
                success: false,
                error: "Shipping rate not found",
            });
        }

        // Optionally include usage statistics
        const stats = await prisma.order.count({
            where: {
                shippingMethod: shippingRate.method,
            },
        });

        return res.status(200).json({
            success: true,
            data: {
                ...shippingRate,
                stats: {
                    totalOrdersUsing: stats,
                },
            },
        });
    } catch (error) {
        console.error("Get shipping rate error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to retrieve shipping rate",
        });
    }
};

// Get all shipping rates
const getAllShippingRates = async (req, res) => {
    const {
        country,
        state,
        method,
        isActive,
        page = 1,
        limit = 50,
    } = req.query;

    try {
        const where = {};

        if (country) {
            where.country = country.toUpperCase();
        }

        if (state) {
            where.state = state.toUpperCase();
        }

        if (method) {
            where.method = method.toUpperCase();
        }

        if (isActive !== undefined) {
            where.isActive = isActive === "true";
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [shippingRates, totalCount] = await Promise.all([
            prisma.shippingRate.findMany({
                where,
                skip,
                take,
                orderBy: [
                    { country: "asc" },
                    { state: "asc" },
                    { method: "asc" },
                ],
            }),
            prisma.shippingRate.count({ where }),
        ]);

        return res.status(200).json({
            success: true,
            data: shippingRates,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / take),
                totalCount,
                limit: take,
            },
        });
    } catch (error) {
        console.error("Get all shipping rates error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to retrieve shipping rates",
        });
    }
};

export {
    createShippingRate,
    updateShippingRate,
    deleteShippingRate,
    getShippingRateById,
    getAllShippingRates,
};