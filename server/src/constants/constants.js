import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const JWT_SECRET =
    process.env.ENVIRONMENT === "production"
        ? process.env.JWT_SECRET
        : "secret";
const SALT_ROUNDS = process.env.ENVIRONMENT === "production" ? process.env.SALT_ROUNDS : 10;
const EXPIREYTIME = process.env.ENVIRONMENT === "production" ? process.env.EXPIREYTIME : "1h";

export const hashPassword = async(password) => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

export const generateToken = (user) => {
  return jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: EXPIREYTIME }
  )
}

export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex')
}

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const verifyToken = (token) => {
    const user = jwt.verify(token, JWT_SECRET);
    return user;
};

export const safeUser = (user) => {
    const { password, ...safeUser } = user;
    return safeUser;
};