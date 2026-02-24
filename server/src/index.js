import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from 'cookie-parser';
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.route.js";
import seedRouter from "./routes/seeder.route.js";
import categoryRouter from "./routes/category.routes.js";
import cartRouter from "./routes/cart.routes.js";
import checkoutRouter from "./routes/checkout.routes.js";
import orderRouter from "./routes/order.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import addressRouter from "./routes/address.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import reviewRouter from "./routes/review.route.js";
import returnRouter from "./routes/return.routes.js";
import contactRouter from "./routes/contactus.routes.js";
import promotionRouter from "./routes/promotion.routes.js";
import shippingRouter from "./routes/shipping.routes.js";
import { hostname } from "os";
const app = express();
const port = process.env.NODE_ENV === "production" ? process.env.PORT : 5000;

app.use(
    cors({
        origin:
            process.env.NODE_ENV === "production"
                ? process.env.CLIENT_URL
                : "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.set("trust proxy", 1);
app.get("/", (req, res) => {
    res.send("Backend is running");
});
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/address", addressRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/cart", cartRouter);
app.use("/coupons", couponRouter);
app.use("/promotions", promotionRouter);
app.use("/checkout", checkoutRouter);
app.use("/orders", orderRouter);
app.use("/reviews", reviewRouter);
app.use("/retruns-refunds", returnRouter);
app.use("/dashboard", dashboardRouter);
app.use("/contact", contactRouter);
app.use("/shipping", shippingRouter);
app.use("/seed", seedRouter);

app.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
});