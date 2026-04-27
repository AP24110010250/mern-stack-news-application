import express from "express";
import {
  deleteSavedArticle,
  getSavedArticles,
  saveArticle
} from "../controllers/savedArticleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getSavedArticles).post(protect, saveArticle);
router.delete("/:slug", protect, deleteSavedArticle);

export default router;
