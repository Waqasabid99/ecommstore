import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { getOrderById, getAllOrders, updateOrderStatus, cancelOrder, getUserOrders} from "../controllers/order.controller.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";
const orderRouter = express.Router();

orderRouter.get("/", verifyUser, requireAdmin, getAllOrders);
orderRouter.get("/user", verifyUser, getUserOrders);
orderRouter.get("/:orderId", verifyUser, getOrderById);
orderRouter.patch("/:orderId/status", verifyUser, requireAdmin, updateOrderStatus)
orderRouter.post("/:orderId/cancel", verifyUser, requireAdmin, cancelOrder)


export default orderRouter;