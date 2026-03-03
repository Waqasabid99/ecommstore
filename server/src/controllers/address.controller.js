import { prisma } from "../config/prisma.js";

// Create address
const createAddress = async (req, res) => {
  const userId = req?.user?.id;
  const { fullName, phone, line1, line2, country, city, state, postalCode, isDefault } = req?.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!phone || !line1 || !country || !city || !postalCode) {
    return res.status(400).json({
      success: false,
      message: "phone, line1, country, city and postalCode are required",
    });
  }

  try {
    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          fullName,
          phone,
          line1,
          line2,
          country,
          city,
          state,
          postalCode,
          isDefault: Boolean(isDefault),
          userId,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all addresses
const getAddress = async (req, res) => {
  const userId = req?.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const address = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get address by ID
const getAddressById = async (req, res) => {
  const userId = req?.user?.id;
  const addressId = req?.params?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update address
const updateAddress = async (req, res) => {
  const userId = req?.user?.id;
  const addressId = req?.params?.id;
  const { fullName, phone, line1, line2, country, city, state, postalCode, isDefault } = req?.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const findAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!findAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, id: { not: addressId } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
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
          ...(typeof isDefault === "boolean" ? { isDefault } : {}),
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  const userId = req?.user?.id;
  const addressId = req?.params?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const findAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!findAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const address = await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { createAddress, getAddress, getAddressById, updateAddress, deleteAddress };
