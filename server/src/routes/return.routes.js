import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { cancelReturnRequest, createManualRefund, createReturnRequest, getAllRefunds, getAllReturnRequests, getMyRefunds, getMyReturnRequests, getReturnStats, processRefund, updateReturnStatus } from "../controllers/return.controller.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";
const returnRouter = express.Router();

// Return routes (user)
returnRouter.post("/", verifyUser, createReturnRequest);
returnRouter.get("/my-returns", verifyUser, getMyReturnRequests);
returnRouter.patch("/:id/cancel", verifyUser, cancelReturnRequest);
// Refund routes (user)
returnRouter.get("/my-refunds", verifyUser, getMyRefunds);

// Return routes (Admin)  
returnRouter.get("/returns", verifyUser, requireAdmin, getAllReturnRequests);
returnRouter.patch("/returns/:id/status", verifyUser, requireAdmin, updateReturnStatus);
// Refund routes (Admin)
returnRouter.get("/refunds", verifyUser, requireAdmin, getAllRefunds);
returnRouter.patch("/refunds/:id/process", verifyUser, requireAdmin, processRefund);
returnRouter.post("/refunds", verifyUser, requireAdmin, createManualRefund);
returnRouter.get("/refunds/stats", verifyUser, requireAdmin, getReturnStats);
export default returnRouter;