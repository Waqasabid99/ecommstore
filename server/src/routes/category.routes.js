import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categories.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";

const categoryRouter = express.Router();

// List all categories
categoryRouter.get("/", getAllCategories);

// Get single category by ID
categoryRouter.get("/:id", verifyUser, requireAdmin, getCategoryById);

// Create a new category
categoryRouter.post("/create", verifyUser, requireAdmin, createCategory);

// Update category
categoryRouter.patch("/update/:id", verifyUser, requireAdmin, updateCategory);

// Delete category
categoryRouter.delete("/delete/:id", verifyUser, requireAdmin, deleteCategory);

export default categoryRouter;
