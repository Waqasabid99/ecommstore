import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { addToCart, clearCart, getCart, getCartSummary, mergeCart, removeCartItem, updateCartItem } from "../controllers/cart.controller.js";
const cartRouter = express.Router();

cartRouter.get("/", verifyUser, getCart);
cartRouter.post("/add-to-cart", verifyUser, addToCart);
cartRouter.patch("/update-item/:itemId", verifyUser, updateCartItem);
cartRouter.delete("/remove-item/:id", verifyUser, removeCartItem);
cartRouter.delete("/clear-cart", verifyUser, clearCart);
cartRouter.post("/merge", verifyUser, mergeCart);
cartRouter.get("/summary", verifyUser, getCartSummary);

export default cartRouter;