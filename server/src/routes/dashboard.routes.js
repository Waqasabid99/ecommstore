import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";
import {
  getStatsOverview,
  getSalesAnalytics,
  getRecentActivity,
  getInventoryAlerts,
  getOrderStatusDistribution,
  getDetailedAnalytics,
} from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.use(verifyUser, requireAdmin);

dashboardRouter.get("/stats", getStatsOverview);
dashboardRouter.get("/sales-chart", getSalesAnalytics);
dashboardRouter.get("/recent-activity", getRecentActivity);
dashboardRouter.get("/inventory-alerts", getInventoryAlerts);
dashboardRouter.get("/order-status", getOrderStatusDistribution);
dashboardRouter.get("/detailed-analytics", getDetailedAnalytics);

export default dashboardRouter;