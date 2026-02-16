import { prisma } from "../config/prisma.js";
import {
    cookieOptions,
    generateRefreshToken,
    generateToken,
    hashPassword,
    hashToken,
    refreshCookieOptions,
    safeUser,
    verifyPassword,
} from "../constants/constants.js";

// Register a new user
const registerUser = async (req, res) => {
    const { name, email, password, role } = req?.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password fields are required",
        });
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { email, deletedAt: null } });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "Email already in use",
            });
        };
        const user = await prisma.user.create({
            data: {
                email,
                userName: name,
                password: await hashPassword(password),
                role: role?.toUpperCase() || "USER",
            },
        });
        const accessToken = generateToken(user);
        res.status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .json({
                success: true,
                message: "User registered successfully",
                user: safeUser(user),
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error,
            console: console.log(error),
        });
    }
};
// Login user
const loginUser = async (req, res) => {
    const { email, password } = req?.body;
    try {
        const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (user) {
            const isPasswordValid = await verifyPassword(password, user.password);
            if (!user || !isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
            }
        }

        const userAddress = await prisma.address?.findMany({
            where: {
                userId: user.id,
            },
        })
        // Generate tokens
        const accessToken = generateToken(user);
        const rawRefreshToken = generateRefreshToken();
        const refreshTokenHash = hashToken(rawRefreshToken);
        // Create refresh token in DB
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshTokenHash,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            },
        });

        res.status(200)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" ? true : false,
                sameSite:
                    process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 15 * 60 * 1000,
            })
            .cookie("refreshToken", rawRefreshToken, refreshCookieOptions)
            .json({
                success: true,
                message: "Login successful",
                user: {...safeUser(user), userAddress},
                address: userAddress || [],
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error,
        });
        console.log(error);
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { id } = req?.user;
    const { oldPassword, newPassword } = req?.body;
    try {
        const user = await prisma.user.findUnique({ where: { id, deletedAt: null } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordValid = await verifyPassword(
            oldPassword,
            user.password
        );
        if (!isPasswordValid) {
            return res.status(403).json({
                success: false,
                message: "Old password is incorrect",
            });
        }
        const hashedNewPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { email: user.email },
            data: { password: hashedNewPassword },
        });
        res.status(200).json({
            success: true,
            message: "Password reset successful",
            user: safeUser(user),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Forgot Password - Generate reset token
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ 
            where: { email, deletedAt: null } 
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists, a reset link has been sent",
            });
        }

        // Generate secure token (32 bytes = 64 hex chars)
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        
        // Invalidate any existing unused tokens for this user
        await prisma.passwordResetToken.updateMany({
            where: {
                userId: user.id,
                used: false,
            },
            data: { used: true },
        });

        // Create password reset token (NOT refresh token)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash: tokenHash,
                expiresAt: expiresAt,
            },
        });

        // Send email (implement your email service)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
        
        // await sendEmail({
        //     to: user.email,
        //     subject: "Password Reset Request",
        //     html: `Click <a href="${resetLink}">here</a> to reset your password. Expires in 15 minutes.`
        // });

        res.status(200).json({
            success: true,
            message: "If an account exists, a reset link has been sent",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Create new password after forgot password
const createNewPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Token and new password are required",
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters",
        });
    }

    try {
        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                tokenHash: hashToken(token),
                used: false,
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
        });

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Transaction: Update password and mark token as used
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword },
            });

            await tx.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used: true },
            });

            // Optional: Invalidate all existing refresh tokens for security
            await tx.refreshToken.deleteMany({
                where: { userId: resetToken.userId },
            });
        });

        res.status(200).json({
            success: true,
            message: "Password reset successful. Please login with your new password.",
        });
    } catch (error) {
        console.error("Create new password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Logout user
const logoutUser = async (req, res) => {
    try {
        const refreshToken = req?.cookies?.refreshToken || req?.authorization?.split(" ")[1];

        if (refreshToken) {
            await prisma.refreshToken.deleteMany({
                where: {
                    tokenHash: hashToken(refreshToken),
                },
            });
        }

        res.clearCookie("accessToken", { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
            })
            .clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
            })
            .status(200)
            .json({ success: true });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false });
    }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req?.cookies?.refreshToken || req?.authorization?.split(" ")[1];
        if (!refreshToken) {
            return res.status(401).json({ success: false });
        }

        const tokenHash = hashToken(refreshToken);

        const storedToken = await prisma.refreshToken.findFirst({
            where: { tokenHash },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            return res.status(401).json({ success: false });
        }

        const user = await prisma.user.findUnique({
            where: { id: storedToken.userId },
        });

        // Rotate refresh token
        const result = await prisma.$transaction(async (tx) => {
            await tx.refreshToken.deleteMany({ where: { userId: user.id } });
            const newRefreshToken = generateRefreshToken();
            await tx.refreshToken.create({
                data: {
                    userId: user.id,
                    tokenHash: hashToken(newRefreshToken),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
            return newRefreshToken;
        });

        const newAccessToken = generateToken(user);

        res.cookie("accessToken", newAccessToken, cookieOptions)
            .cookie("refreshToken", result, refreshCookieOptions)
            .json({ success: true });
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

export {
    registerUser,
    loginUser,
    resetPassword,
    forgotPassword,
    createNewPassword,
    logoutUser,
    refreshAccessToken,
};
