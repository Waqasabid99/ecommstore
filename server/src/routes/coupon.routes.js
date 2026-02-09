import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";

// Import coupon controllers
import {
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    getCouponStats,
    bulkCreateCoupons,
    applyCoupon,
    removeCoupon,
} from "../controllers/coupons.controller.js";



// =====================================================
// COUPON ROUTES
// =====================================================
const couponRouter = express.Router();

// ============ ADMIN ROUTES ============
// GET /api/admin/coupons - Get all coupons
couponRouter.get("/", verifyUser, requireAdmin, getAllCoupons);

// GET /api/admin/coupons/:id - Get coupon by ID
couponRouter.get("/:id", verifyUser, requireAdmin, getCouponById);

// POST /api/admin/coupons - Create new coupon
couponRouter.post("/", verifyUser, requireAdmin, createCoupon);

// PUT /api/admin/coupons/:id - Update coupon
couponRouter.put("/:id", verifyUser, requireAdmin, updateCoupon);

// PATCH /api/admin/coupons/:id/toggle - Toggle coupon active status
couponRouter.patch("/:id/toggle", verifyUser, requireAdmin, toggleCouponStatus);

// DELETE /api/admin/coupons/:id - Delete (deactivate) coupon
couponRouter.delete("/:id", verifyUser, requireAdmin, deleteCoupon);

// GET /api/admin/coupons/:id/stats - Get coupon usage statistics
couponRouter.get("/:id/stats", verifyUser, requireAdmin, getCouponStats);

// POST /api/admin/coupons/bulk - Bulk create coupons
couponRouter.post("/bulk", verifyUser, requireAdmin, bulkCreateCoupons);

// ============ PUBLIC/USER ROUTES ============
// POST /api/coupons/validate - Validate coupon (public preview)
couponRouter.post("/validate", validateCoupon);

export default couponRouter ;