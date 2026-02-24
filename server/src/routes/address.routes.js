import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { createAddress, deleteAddress, getAddress, getAddressById, updateAddress } from "../controllers/address.controller.js";
const addressRouter = express.Router();

addressRouter.use(verifyUser);
addressRouter.get("/", getAddress);
addressRouter.get("/:id", getAddressById);
addressRouter.post("/create", createAddress);
addressRouter.patch("/update/:id", updateAddress);
addressRouter.delete("/delete/:id", deleteAddress);

export default addressRouter;