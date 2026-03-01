import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { getInvoiceByOrderId, regenerateInvoicePdf } from "../controllers/invoice.controller.js";

const invoiceRouter = express.Router();

invoiceRouter.get("/order/:orderId", verifyUser, getInvoiceByOrderId);
invoiceRouter.post("/order/:orderId/regenerate", verifyUser, regenerateInvoicePdf);

export default invoiceRouter;
