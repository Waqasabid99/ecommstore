import { prisma } from "../config/prisma.js";

// Create address
const createAddress = async (req, res) => {
    const userId = req?.user?.id;
    const { fullName, phone, line1, line2, country, city, state, postalCode } = req?.body;
 try {
    const address = await prisma.address.create({
        data: {
            fullName,
            phone,
            line1,
            line2,
            country,
            city,
            state,
            postalCode,
            userId
        },
    });
    if (!address) {
        return res.status(400).json({
            success: false,
            message: "Failed to create address",
        });
    }
    return res.status(200).json({
        success: true,
        message: "Address created successfully",
        data: address,
    });
 } catch (error) {
     console.log(error)
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    })
}
}

// Get Address 
const getAddress = async (req, res) => {
    const userId = req?.user?.id;
    try {
        const address = await prisma.address.findMany({
            where: {
                userId,
            },
        });
        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Failed to get address",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Address fetched successfully",
            data: address,
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Get Address by ID
const getAddressById = async (req, res) => {
    const userId = req?.user?.id
    const addressId = req?.params?.id || req?.body
    try {
        const address = await prisma.address.findUnique({
            where: {
                id: addressId,
            },
        });
        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Failed to get address",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Address fetched successfully",
            data: address,
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Update Address
const updateAddress = async (req, res) => {
    const userId = req?.user?.id;
    const addressId = req?.params?.id || req?.body;
    const { fullName, phone, line1, line2, country, city, state, postalCode } = req?.body;
    try {
        const findAddress = await prisma.address.findUnique({
            where: {
                id: addressId,
            },
        });

        if (!findAddress) {
            return res.status(400).json({
                success: false,
                message: "Address not found",
            });
        };

        const address = await prisma.address.update({
            where: {
                id: addressId,
            },
            data: {
                fullName,
                phone,
                line1,
                line2,
                country,
                city,
                state,
                postalCode,
            },
        })

        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Failed to update address",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address,
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Delete Address
const deleteAddress = async (req, res) => {
    const userId = req?.user?.id;
    const addressId = req?.params?.id || req?.body;
    try {
        const findAddress = await prisma.address.findUnique({
            where: {
                id: addressId,
            },
        });

        if (!findAddress) {
            return res.status(400).json({
                success: false,
                message: "Address not found",
            });
        };
        
        const address = await prisma.address.delete({
            where: {
                id: addressId,
            },
        });

        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Failed to delete address",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
            data: address,
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { createAddress, getAddress, getAddressById, updateAddress, deleteAddress };