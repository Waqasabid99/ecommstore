import express from "express";
import { submitContactForm } from "../controllers/contactus.controller.js";
import { rateLimiter } from "../middleware/ratelimitor.middleware.js";

const contactRouter = express.Router();

contactRouter.post("/", rateLimiter, submitContactForm);

export default contactRouter;
