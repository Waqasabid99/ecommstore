import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";

// Import promotion controllers
import {
    getAllPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
} from "../controllers/promotion.controller.js";

// PROMOTION ROUTES (Admin Only - Product Level)
const promotionRouter = express.Router();

// All promotion routes require admin authentication
promotionRouter.use(verifyUser, requireAdmin);

// GET /api/admin/promotions - Get all promotions
promotionRouter.get("/", getAllPromotions);

// GET /api/admin/promotions/:id - Get promotion by ID
promotionRouter.get("/:id", getPromotionById);

// POST /api/admin/promotions - Create new promotion
promotionRouter.post("/", createPromotion);

// PUT /api/admin/promotions/:id - Update promotion
promotionRouter.put("/:id", updatePromotion);

// PATCH /api/admin/promotions/:id/toggle - Toggle promotion active status
promotionRouter.patch("/:id/toggle", togglePromotionStatus);

// DELETE /api/admin/promotions/:id - Delete (deactivate) promotion
promotionRouter.delete("/:id", deletePromotion);

export default promotionRouter;