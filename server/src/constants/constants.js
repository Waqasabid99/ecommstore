import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const JWT_SECRET =
    process.env.ENVIRONMENT === "production"
        ? process.env.JWT_SECRET
        : "secret";
const SALT_ROUNDS =
    process.env.ENVIRONMENT === "production" ? process.env.SALT_ROUNDS : 10;
const EXPIREYTIME =
    process.env.ENVIRONMENT === "production" ? process.env.EXPIREYTIME : "1h";

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

export const generateToken = (user) => {
    return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: EXPIREYTIME,
    });
};

export const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};

export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

export const verifyToken = (token) => {
    const user = jwt.verify(token, JWT_SECRET);
    return user;
};

export const safeUser = (user) => {
    const { password, ...safeUser } = user;
    return safeUser;
};

export const cookieOptions = {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    sameSite: process.env.ENVIRONMENT === "production" ? "none" : "lax",
    maxAge:  60 * 60 * 1000,
};

export const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    sameSite: process.env.ENVIRONMENT === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

/**
 * Get promotion status based on dates and active flag
 */
export const getPromotionStatus = (promotion) => {
    const now = new Date();

    if (!promotion.isActive) return "INACTIVE";
    if (now < promotion.startsAt) return "SCHEDULED";
    if (now > promotion.endsAt) return "EXPIRED";
    return "ACTIVE";
}
