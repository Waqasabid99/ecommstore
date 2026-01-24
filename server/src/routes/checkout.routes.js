import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { initiateCheckout, validateCheckout } from "../controllers/checkout.controller.js";
const checkoutRouter = express.Router();

checkoutRouter.post("/", verifyUser, initiateCheckout);
checkoutRouter.post("/validate", verifyUser, validateCheckout);

export default checkoutRouter;