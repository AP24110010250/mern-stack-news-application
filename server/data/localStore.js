import slugify from "slugify";
import { sampleArticles } from "./sampleArticles.js";

let articles = sampleArticles.map((article) => ({
  ...article,
  publishedAt: new Date(article.publishedAt).toISOString(),
  createdAt: new Date(article.publishedAt).toISOString(),
  updatedAt: new Date(article.publishedAt).toISOString()
}));

export const getLocalArticles = () => articles;

export const createLocalArticle = (payload) => {
  const now = new Date().toISOString();
  const slug = slugify(payload.slug || payload.title, { lower: true, strict: true });
  const article = {
    ...payload,
    slug,
    tags: normalizeTags(payload.tags),
    featured: Boolean(payload.featured),
    readTime: Number(payload.readTime) || 4,
    publishedAt: payload.publishedAt || now,
    createdAt: now,
    updatedAt: now
  };

  articles = [article, ...articles.filter((item) => item.slug !== slug)];
  return article;
};

export const updateLocalArticle = (slug, payload) => {
  let updatedArticle = null;

  articles = articles.map((article) => {
    if (article.slug !== slug) {
      return article;
    }

    const nextSlug = payload.slug
      ? slugify(payload.slug, { lower: true, strict: true })
      : article.slug;

    updatedArticle = {
      ...article,
      ...payload,
      slug: nextSlug,
      tags: payload.tags ? normalizeTags(payload.tags) : article.tags,
      featured:
        typeof payload.featured === "boolean" ? payload.featured : Boolean(article.featured),
      readTime: payload.readTime ? Number(payload.readTime) : article.readTime,
      updatedAt: new Date().toISOString()
    };

    return updatedArticle;
  });

  return updatedArticle;
};

export const deleteLocalArticle = (slug) => {
  const before = articles.length;
  articles = articles.filter((article) => article.slug !== slug);
  return articles.length < before;
};

const normalizeTags = (tags = []) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};
