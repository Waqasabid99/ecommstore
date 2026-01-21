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
const app = express();
const port = process.env.ENVIRONMENT === "production" ? process.env.PORT : 5000;

app.use(
    cors({
        origin:
            process.env.ENVIRONMENT === "production"
                ? process.env.CLIENT_URL
                : "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
    res.send("Hello from the backend!");
});
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/seed", seedRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});