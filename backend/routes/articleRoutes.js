import express from "express";
import {
  createArticle,
  deleteArticle,
  getArticleBySlug,
  getArticles,
  getAdminArticles,
  getCategories,
  updateArticle
} from "../controllers/articleController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getArticles).post(protect, requireAdmin, createArticle);
router.get("/admin-list", protect, requireAdmin, getAdminArticles);
router.get("/categories", getCategories);
router
  .route("/:slug")
  .get(getArticleBySlug)
  .put(protect, requireAdmin, updateArticle)
  .delete(protect, requireAdmin, deleteArticle);

export default router;
