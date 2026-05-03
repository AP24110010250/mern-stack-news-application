import SavedArticle from "../models/SavedArticle.js";

export const getSavedArticles = async (req, res, next) => {
  try {
    const articles = await SavedArticle.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ articles: articles.map(toPlainArticle) });
  } catch (error) {
    next(error);
  }
};

export const saveArticle = async (req, res, next) => {
  try {
    const payload = normalizeSavedArticle(req.body);
    validateSavedArticle(payload);

    const article = await SavedArticle.findOneAndUpdate(
      {
        user: req.user._id,
        slug: payload.slug
      },
      {
        ...payload,
        user: req.user._id
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(201).json({ article: toPlainArticle(article) });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedArticle = async (req, res, next) => {
  try {
    const article = await SavedArticle.findOneAndDelete({
      user: req.user._id,
      slug: req.params.slug
    });

    if (!article) {
      return res.status(404).json({ message: "Saved article not found" });
    }

    res.json({ message: "Article removed from Watch Later" });
  } catch (error) {
    next(error);
  }
};

const normalizeSavedArticle = (payload) => ({
  slug: payload.slug?.trim(),
  title: payload.title?.trim(),
  excerpt: payload.excerpt?.trim(),
  content: payload.content?.trim(),
  author: payload.author?.trim(),
  category: payload.category?.trim(),
  imageUrl: payload.imageUrl?.trim(),
  sourceName: payload.sourceName?.trim(),
  sourceUrl: payload.sourceUrl?.trim(),
  tags: Array.isArray(payload.tags)
    ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [],
  readTime: Number(payload.readTime) || 1,
  publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date()
});

const validateSavedArticle = (payload) => {
  const missing = ["slug", "title"].filter((field) => !payload[field]);

  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
};

const toPlainArticle = (article) => {
  const plain = article.toObject ? article.toObject() : article;
  const { _id, __v, user, ...safeArticle } = plain;
  return {
    id: _id?.toString?.() || safeArticle.slug,
    ...safeArticle
  };
};
