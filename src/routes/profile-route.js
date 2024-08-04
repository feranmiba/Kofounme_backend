import express from "express";
import { createProfile, getProfile } from "../controllers/profile-controller.js";

const router = express.Router();

router.post("/create-profile", createProfile);
router.get("/user-profile/:id", getProfile);

export default router;
