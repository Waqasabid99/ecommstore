import express from "express";
import { createProduct, getAllProducts, getProductById } from "../controllers/products.controller.js";
import { uploadProductImages } from "../middleware/uploadProductImages.middleware.js";
const productRouter = express.Router();

productRouter.get("/getAllProducts", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.post("/", uploadProductImages, createProduct);

export default productRouter;