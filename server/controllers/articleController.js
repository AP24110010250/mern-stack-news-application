import mongoose from "mongoose";
import Article, { categories } from "../models/Article.js";
import Category from "../models/Category.js";
import Source from "../models/Source.js";
import {
  createLocalArticle,
  deleteLocalArticle,
  getLocalArticles,
  updateLocalArticle
} from "../data/localStore.js";
import {
  getIndiaNewsArticleBySlug,
  getIndiaNewsArticles,
  indiaNewsDesks,
  indiaNewsCategories,
  indiaStates,
  isNewsApiConfigured
} from "../services/newsApiService.js";
import { getIndiaTodayRSSNews } from "../services/rssService.js";

const isDbReady = () => mongoose.connection.readyState === 1;

const toPlainArticle = (article) => {
  const plain = article.toObject ? article.toObject() : article;
  const { _id, __v, ...safeArticle } = plain;
  return {
    id: _id?.toString?.() || safeArticle.slug,
    ...safeArticle
  };
};

export const getAdminArticles = async (req, res, next) => {
  try {
    if (isDbReady()) {
      const articles = await Article.find({}).sort({ createdAt: -1 }).lean();
      return res.json({ articles: articles.map(toPlainArticle) });
    }
    res.json({ articles: getLocalArticles().map(toPlainArticle) });
  } catch (error) {
    next(error);
  }
};

const buildMongoQuery = ({ category, q, tag, featured }) => {
  const query = {};

  if (category && category !== "All") {
    query.category = category;
  }

  if (tag) {
    query.tags = tag;
  }

  if (featured === "true" || featured === "false") {
    query.featured = featured === "true";
  }

  if (q) {
    query.$text = { $search: q };
  }

  return query;
};

const filterLocalArticles = (filters) => {
  const searchTerm = filters.q?.trim().toLowerCase();

  return getLocalArticles().filter((article) => {
    const matchesCategory =
      !filters.category || filters.category === "All" || article.category === filters.category;
    const matchesTag = !filters.tag || article.tags.includes(filters.tag);
    const matchesFeatured =
      filters.featured !== "true" && filters.featured !== "false"
        ? true
        : Boolean(article.featured) === (filters.featured === "true");

    const searchable = [
      article.title,
      article.excerpt,
      article.content,
      article.author,
      article.category,
      article.tags.join(" ")
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !searchTerm || searchable.includes(searchTerm);

    return matchesCategory && matchesTag && matchesFeatured && matchesSearch;
  });
};

export const getArticles = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 24);
    const skip = (page - 1) * limit;

    if (isNewsApiConfigured()) {
      try {
        const [liveNews, indiaTodayArticles] = await Promise.all([
          getIndiaNewsArticles({ ...req.query, page, limit }),
          getIndiaTodayRSSNews(req.query.desk || req.query.category || "Top India")
        ]);

        const editorialArticles = isDbReady()
          ? await getEditorialArticles(req.query, limit)
          : filterLocalArticles(req.query).slice(0, limit);

        // Blend all sources: Editorial -> India Today RSS -> Live API
        const articles = mergeArticles(
          editorialArticles.map(toPlainArticle), 
          mergeArticles(indiaTodayArticles, liveNews.articles)
        );

        return res.json({
          ...liveNews,
          articles: articles.slice(0, limit),
          total: liveNews.total + editorialArticles.length + indiaTodayArticles.length
        });
      } catch (error) {
        console.warn(`Live India news unavailable: ${error.message}`);
      }
    }

    if (isDbReady()) {
      const query = buildMongoQuery(req.query);
      const [articles, total] = await Promise.all([
        Article.find(query)
          .sort({ featured: -1, publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Article.countDocuments(query)
      ]);

      return res.json({
        articles: articles.map(toPlainArticle),
        total,
        page,
        pages: Math.ceil(total / limit) || 1
      });
    }

    const filtered = filterLocalArticles(req.query).sort((a, b) => {
      if (a.featured !== b.featured) {
        return Number(b.featured) - Number(a.featured);
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    res.json({
      articles: filtered.slice(skip, skip + limit).map(toPlainArticle),
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit) || 1
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (isNewsApiConfigured()) {
      try {
        const article = await getIndiaNewsArticleBySlug(slug);
        if (article) {
          return res.json(toPlainArticle(article));
        }
      } catch (error) {
        console.warn(`Live India article unavailable: ${error.message}`);
      }
    }

    if (isDbReady()) {
      const article = await Article.findOne({ slug }).lean();
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      return res.json(toPlainArticle(article));
    }

    const article = getLocalArticles().find((item) => item.slug === slug);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(toPlainArticle(article));
  } catch (error) {
    next(error);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    validateArticlePayload(payload);

    if (isDbReady()) {
      const article = await Article.create(payload);

      // Auto-sync Category and Source collections
      if (payload.category) {
        await Category.updateOne(
          { categoryName: payload.category },
          { categoryName: payload.category },
          { upsert: true }
        );
      }
      if (payload.sourceName && payload.sourceName !== "Original reporting") {
        await Source.updateOne(
          { sourceName: payload.sourceName },
          { sourceName: payload.sourceName, sourceUrl: payload.sourceUrl || "" },
          { upsert: true }
        );
      }

      return res.status(201).json(toPlainArticle(article));
    }

    const article = createLocalArticle(payload);
    res.status(201).json(toPlainArticle(article));
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const payload = normalizePayload(req.body);

    if (isDbReady()) {
      const article = await Article.findOneAndUpdate({ slug }, payload, {
        new: true,
        runValidators: true
      });

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      return res.json(toPlainArticle(article));
    }

    const article = updateLocalArticle(slug, payload);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(toPlainArticle(article));
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (isDbReady()) {
      const article = await Article.findOneAndDelete({ slug });
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      return res.json({ message: "Article deleted" });
    }

    const deleted = deleteLocalArticle(slug);
    if (!deleted) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ message: "Article deleted" });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (_req, res, next) => {
  try {
    if (isNewsApiConfigured()) {
      return res.json({
        desks: indiaNewsDesks,
        categories: indiaNewsCategories,
        states: indiaStates
      });
    }

    if (isDbReady()) {
      const [dbCategories, dbSources] = await Promise.all([
        Category.find().sort({ categoryName: 1 }).lean(),
        Source.find().sort({ sourceName: 1 }).lean()
      ]);

      const categoryNames = dbCategories.length
        ? dbCategories.map((c) => c.categoryName)
        : categories;

      return res.json({ categories: categoryNames, sources: dbSources });
    }

    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

const normalizePayload = (payload) => ({
  ...payload,
  title: payload.title?.trim(),
  excerpt: payload.excerpt?.trim(),
  content: payload.content?.trim(),
  author: payload.author?.trim() || "Newsroom Desk",
  category: payload.category || "World",
  imageUrl: payload.imageUrl?.trim(),
  sourceName: payload.sourceName?.trim() || "Original reporting",
  sourceUrl: payload.sourceUrl?.trim(),
  tags: Array.isArray(payload.tags)
    ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : String(payload.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
  featured: Boolean(payload.featured),
  readTime: Number(payload.readTime) || 4
});

const validateArticlePayload = (payload) => {
  const missing = ["title", "excerpt", "content", "imageUrl"].filter((field) => !payload[field]);

  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
};

const getEditorialArticles = (filters, limit) =>
  Article.find(buildMongoQuery(filters))
    .sort({ featured: -1, publishedAt: -1 })
    .limit(limit)
    .lean();

const mergeArticles = (primaryArticles, secondaryArticles) => {
  const seen = new Set();

  return [...primaryArticles, ...secondaryArticles].filter((article) => {
    if (seen.has(article.slug)) {
      return false;
    }

    seen.add(article.slug);
    return true;
  });
};
