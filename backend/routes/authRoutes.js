import express from "express";
import {
  deleteAccount,
  forgotPassword,
  getCurrentUser,
  login,
  register,
  resetPassword,
  updateProfile
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateProfile);
router.delete("/me", protect, deleteAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
