import express from "express";
import { signUp, login, sendVerificationCode, verifyCode } from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/verify", sendVerificationCode);
router.post("/verify-code", verifyCode);

export default router;
