import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";
import { bulkCreateCoupons, createCoupon, deleteCoupon, getAllCoupons, getCouponById, getCouponStats, toggleCouponStatus, updateCoupon, validateCoupon } from "../controllers/coupons.controller.js";
const couponRouter = express.Router();

couponRouter.get("/", verifyUser, requireAdmin, getAllCoupons);
couponRouter.get("/:id", verifyUser, requireAdmin, getCouponById);
couponRouter.post("/", verifyUser, requireAdmin, createCoupon);
couponRouter.patch("/:id", verifyUser, requireAdmin, updateCoupon);
couponRouter.delete("/:id", verifyUser, requireAdmin, deleteCoupon);
couponRouter.patch("/:id/toggleStatus", verifyUser, requireAdmin, toggleCouponStatus);
couponRouter.post("/validate", verifyUser, validateCoupon);
couponRouter.get("/:id/stats", verifyUser, requireAdmin, getCouponStats);
couponRouter.post("/bulk", verifyUser, requireAdmin, bulkCreateCoupons);

export default couponRouter;