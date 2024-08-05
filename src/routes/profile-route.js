import express from "express";
import { createProfile, getProfile, uploadMiddleware } from "../controllers/profile-controller.js";

const router = express.Router();

router.post("/create-profile", uploadMiddleware, createProfile);
router.get("/user-profile/:id", getProfile);

export default router;
