import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { createNewPassword, forgotPassword, loginUser, logoutUser, refreshAccessToken, registerUser, resetPassword } from "../controllers/auth.controller.js";
const authRouter = express.Router();

// Register user
authRouter.post("/register", registerUser);

// Verify user
authRouter.get("/verify", verifyUser, (req, res) => { res.json({ success: true, user: safeUser(req.user) })});

// Login user
authRouter.post("/login", loginUser);

// Reset password
authRouter.post("/reset-password", verifyUser, resetPassword);

// Forgot password
authRouter.post("/forgot-password", forgotPassword);

// create new password after forget password
authRouter.post("/create-new-password", createNewPassword);

// Logout user
authRouter.post("/logout", logoutUser);

// Refresh token 
authRouter.post("/refresh-token", refreshAccessToken);

export default authRouter;