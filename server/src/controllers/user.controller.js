import { prisma } from "../config/prisma.js";
import {
    hashPassword,
    safeUser,
    verifyPassword,
} from "../constants/constants.js";

// Get all users with pagination
const getAllUsers = async (req, res) => {
    const take = Math.min(parseInt(req.query.take) || 10, 100);
    const skip = parseInt(req.query.skip) || 0;

    try {
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where: { deletedAt: null },
                take,
                skip,
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count({
                where: { deletedAt: null },
            }),
        ]);

        const totalPages = Math.ceil(total / take);

        res.status(200).json({
            success: true,
            data: users.map(safeUser),
            pagination: {
                total,
                totalPages,
                take,
                skip,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Get single user by ID
const getSingleUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        const userAddress = await prisma.address.findMany({
            where: {
                userId: id,
            },
        });
        return res.status(200).json({ success: true, data: safeUser(user), address: userAddress });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Update user
const updateUser = async (req, res) => {
  const { id: requesterId, role: requesterRole } = req.user;
  const targetUserId = req.params.id || requesterId;

  // Authorization
  if (requesterRole !== "ADMIN" && targetUserId !== requesterId) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  const { name, email, oldPassword, newPassword, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!existingUser || existingUser.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Email uniqueness
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    const updatedData = {};

    if (name) updatedData.userName = name;
    if (email) updatedData.email = email;

    // Role change → ADMIN only
    if (role && requesterRole === "ADMIN") {
      updatedData.role = role;
    }

    // Password change → ONLY self
    if (oldPassword && newPassword) {
      if (targetUserId !== requesterId) {
        return res.status(403).json({
          success: false,
          message: "Admins cannot change passwords directly",
        });
      }

      const isPasswordValid = await verifyPassword(
        oldPassword,
        existingUser.password
      );

      if (!isPasswordValid) {
        return res.status(403).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      updatedData.password = await hashPassword(newPassword);
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided",
      });
    }

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: updatedData,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: safeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete user (soft delete)
const deleteUser = async (req, res) => {
  const { id: requesterId, role: requesterRole } = req.user;
  const targetUserId = req.params.id || requesterId;

  // Authorization
  if (requesterRole !== "ADMIN" && targetUserId !== requesterId) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: targetUserId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.refreshToken.updateMany({
        where: { userId: targetUserId, revoked: false },
        data: { revoked: true },
      });

      await tx.passwordResetToken.updateMany({
        where: { userId: targetUserId, used: false },
        data: { used: true },
      });

      await tx.auditLog.create({
        data: {
          userId: requesterId,
          action: "DELETE",
          entity: "User",
          entityId: targetUserId,
          metadata: {
            softDelete: true,
            performedBy: requesterRole,
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
 
export { getAllUsers, getSingleUser, updateUser, deleteUser };
