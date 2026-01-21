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

const router = express.Router();

// List all categories
router.get("/", getAllCategories);

// Get single category by ID
router.get("/:id", getCategoryById);

// Create a new category
router.post("/create",  createCategory);

// Update category
router.patch("/update/:id",  updateCategory);

// Delete category
router.delete("/delete/:id", deleteCategory);

export default router;
