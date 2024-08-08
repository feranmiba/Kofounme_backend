import express from "express";
import { createProfile, getProfile, uploadMiddleware } from "../controllers/profile-controller.js";
import multer from "multer";



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });

const router = express.Router();

router.post("/create-profile", uploadMiddleware, createProfile);
router.get("/user-profile", getProfile);

export default router;
