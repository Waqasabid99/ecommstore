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
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "Email already in use",
            });
        }
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
    console.log(email, password);
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (user) {
            const isPasswordValid = verifyPassword(password, user.password);
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
        console.log(userAddress);
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
                secure: process.env.ENVIRONMENT === "production" ? true : false,
                sameSite:
                    process.env.ENVIRONMENT === "production" ? "none" : "lax",
                maxAge: 1 * 60 * 1000,
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
        const user = await prisma.user.findUnique({ where: { id } });
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
            where: { email },
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

// Forget Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "A reset link has been sent",
            });
        }

        // Generate secure token
        const rawToken = generateRefreshToken();
        const tokenHash = hashToken(rawRefreshToken);
        // Invalidate old tokens
        await prisma.passwordResetToken.updateMany({
            where: {
                userId: user.id,
                used: false,
            },
            data: { used: true },
        });
        // Create refresh token in DB
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: tokenHash,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            },
        });

        // Send email (pseudo)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

        // await sendEmail(user.email, resetLink);

        res.status(200).json({
            success: true,
            message: "A reset link has been sent",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Create new password after forget password
const createNewPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const tokenHash = hashToken(token);

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                tokenHash,
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

        const hashedPassword = await hashPassword(newPassword);

        // TRANSACTION
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword },
            });

            await tx.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used: true },
            });
        });

        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Logout user
const logoutUser = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await prisma.refreshToken.deleteMany({
                where: {
                    tokenHash: hashToken(refreshToken),
                },
            });
        }

        res.clearCookie("accessToken")
            .clearCookie("refreshToken")
            .status(200)
            .json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
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
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });

        const newRefreshToken = generateRefreshToken();
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(newRefreshToken),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        const newAccessToken = generateToken(user);

        res.cookie("accessToken", newAccessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
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
