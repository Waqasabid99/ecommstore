import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
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

app.get("/", (req, res) => {
    res.send("Hello from the backend!");
});
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});