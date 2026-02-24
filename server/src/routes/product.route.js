import express from "express";
import { createProduct, deleteProduct, getActiveCartPromotions, getAllProducts, getProductById, getProductsByPromotion, updateProduct } from "../controllers/products.controller.js";
import { uploadProductImages } from "../middleware/uploadProductImages.middleware.js";
const productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.post("/create", uploadProductImages, createProduct);
productRouter.patch("/update/:id", uploadProductImages, updateProduct);
productRouter.post("/delete/:id", deleteProduct);
productRouter.get("/:id/promotions", getProductsByPromotion);
productRouter.get("/cart-promotions", getActiveCartPromotions);

export default productRouter;