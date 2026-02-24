import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { getShippingMethods, initiateCheckout, validateCheckout } from "../controllers/checkout.controller.js";
const checkoutRouter = express.Router();

checkoutRouter.post("/", verifyUser, initiateCheckout);
checkoutRouter.post("/shipping-methods", verifyUser, getShippingMethods);
checkoutRouter.post("/validate", verifyUser, validateCheckout);

export default checkoutRouter;