import express from "express";
import { deleteUser, getAllUsers, getSingleUser, updateUser } from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";
const userRouter = express.Router();

// Get all users (admin only)
userRouter.get("/", verifyUser, requireAdmin, getAllUsers);

// Get single user by ID
userRouter.get("/:id", verifyUser, getSingleUser);

// Update user
userRouter.patch("/update", verifyUser, updateUser);

// Delete user (soft delete)
userRouter.delete("/delete", verifyUser, deleteUser);

// Admin only update user
userRouter.patch("/update/:id", verifyUser, requireAdmin, updateUser);

// Admin only delete user
userRouter.delete("/delete/:id", verifyUser, requireAdmin, deleteUser);

export default userRouter;