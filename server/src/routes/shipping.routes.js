import express from "express";
import { createShippingRate, deleteShippingRate, getAllShippingRates, getShippingRateById, updateShippingRate } from "../controllers/shipping.controller.js";
const shippingRouter = express.Router();

shippingRouter.get("/", getAllShippingRates);
shippingRouter.get("/:id", getShippingRateById);
shippingRouter.post("/create", createShippingRate);
shippingRouter.patch("/update/:id", updateShippingRate);
shippingRouter.delete("/delete/:id", deleteShippingRate);

export default shippingRouter;