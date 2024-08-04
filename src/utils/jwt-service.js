import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config()

export const generateRandomCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

export const generateAccessToken = (details) => {
    return jwt.sign(details, process.env.JWT_SECRET, { expiresIn: "20m" });
};
