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

const reviewRouter = express.Router();

// Public routes
reviewRouter.get("/product/:productId", getProductReviews);

// User routes (requires login)
reviewRouter.use(verifyUser);
reviewRouter.post("/", createReview);
reviewRouter.get("/my-reviews", getMyReviews);
reviewRouter.get("/can-review/:productId", canReviewProduct);
reviewRouter.patch("/:id", updateReview);
reviewRouter.delete("/:id", deleteReview);

// Admin routes
reviewRouter.get("/admin/all", requireAdmin, getAllReviews);
reviewRouter.get("/admin/stats", requireAdmin, getReviewStats);
reviewRouter.delete("/admin/:id", requireAdmin, adminDeleteReview);
reviewRouter.delete("/admin/bulk", requireAdmin, bulkDeleteReviews);

export default reviewRouter;