import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";
import {
    createReview,
    getMyReviews,
    updateReview,
    deleteReview,
    getProductReviews,
    canReviewProduct,
    getAllReviews,
    adminDeleteReview,
    getReviewStats,
    bulkDeleteReviews,
} from "../controllers/reviews.controller.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// User routes (requires login)
router.use(verifyUser);
router.post("/", createReview);
router.get("/my-reviews", getMyReviews);
router.get("/can-review/:productId", canReviewProduct);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

// Admin routes
router.get("/admin/all", requireAdmin, getAllReviews);
router.get("/admin/stats", requireAdmin, getReviewStats);
router.delete("/admin/:id", requireAdmin, adminDeleteReview);
router.delete("/admin/bulk", requireAdmin, bulkDeleteReviews);

export default router;