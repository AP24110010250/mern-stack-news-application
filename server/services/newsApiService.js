import slugify from "slugify";

const NEWSDATA_API_URL = "https://newsdata.io/api/1/latest";
const CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_PAGE_SIZE = 10;
const defaultImage =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";

export const indiaNewsDesks = ["Top India", "Central", "States"];

export const indiaNewsCategories = [
  "All",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Entertainment"
];

export const indiaStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi"
];

const categoryMap = {
  Politics: "politics",
  Business: "business",
  Technology: "technology",
  Science: "science",
  Health: "health",
  Sports: "sports",
  Entertainment: "entertainment"
};

const centralDeskQueryMap = {
  All: "India",
  Politics: "India",
  Business: "India",
  Technology: "India",
  Science: "India",
  Health: "India",
  Sports: "India",
  Entertainment: "India"
};

const responseCache = new Map();
const articleCache = new Map();

export const isNewsApiConfigured = () => Boolean(process.env.NEWS_API_KEY);

export const getIndiaNewsArticles = async ({
  category = "All",
  desk = "Top India",
  state = "",
  q = ""
}) => {
  const safeDesk = indiaNewsDesks.includes(desk) ? desk : "Top India";
  const safeCategory = indiaNewsCategories.includes(category) ? category : "All";
  const safeState = indiaStates.includes(state) ? state : "";
  const params = new URLSearchParams({
    country: "in",
    language: "en",
    size: String(MAX_PAGE_SIZE)
  });

  const providerCategory = categoryMap[safeCategory];
  if (providerCategory) {
    params.set("category", providerCategory);
  }

  const queryTerms = buildQueryTerms({
    desk: safeDesk,
    state: safeState,
    category: safeCategory,
    q
  });

  if (queryTerms) {
    params.set("q", queryTerms);
  }

  const data = await fetchNewsApi(params);
  const articles = (data.results || []).map((article, index) =>
    normalizeNewsArticle(article, {
      desk: safeDesk,
      state: safeState,
      category: safeCategory,
      index
    })
  );

  articles.forEach((article) => articleCache.set(article.slug, article));

  return {
    articles,
    total: Number(data.totalResults) || articles.length,
    page: 1,
    pages: 1,
    source: "newsdata-india",
    filters: {
      desk: safeDesk,
      state: safeState,
      category: safeCategory
    }
  };
};

export const getIndiaNewsArticleBySlug = async (slug) => {
  if (articleCache.has(slug)) {
    return articleCache.get(slug);
  }

  const data = await getIndiaNewsArticles({});
  return data.articles.find((article) => article.slug === slug) || null;
};

const buildQueryTerms = ({ desk, state, category, q }) => {
  const inputQuery = cleanText(q);
  const stateQuery = state ? `${state} India` : "";

  if (desk === "States") {
    return [stateQuery, category !== "All" ? category : "", inputQuery].filter(Boolean).join(" ");
  }

  if (desk === "Central") {
    return [centralDeskQueryMap[category] || centralDeskQueryMap.All, inputQuery]
      .filter(Boolean)
      .join(" ");
  }

  return ["India Today", category !== "All" ? category : "", "India", inputQuery].filter(Boolean).join(" ");
};

const fetchNewsApi = async (params) => {
  const cacheKey = params.toString();
  const cached = responseCache.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const response = await fetch(`${NEWSDATA_API_URL}?apikey=${process.env.NEWS_API_KEY}&${cacheKey}`);
  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.results?.message || data.message || "Could not fetch live India news");
  }

  responseCache.set(cacheKey, {
    createdAt: Date.now(),
    data
  });

  return data;
};

const normalizeNewsArticle = (article, { desk, state, category, index }) => {
  const title = cleanText(article.title) || "Live India news update";
  const sourceName = cleanText(article.source_name) || "India news desk";
  const excerpt = cleanText(article.description) || cleanText(article.content) || title;
  const content =
    cleanText(article.content)?.replace(/^ONLY AVAILABLE IN PAID PLANS$/i, excerpt) || excerpt;
  const slug = makeArticleSlug(title, sourceName, article.link || article.article_id || String(index));
  const publishedAt = toISODate(article.pubDate);

  return {
    id: article.article_id || slug,
    title,
    slug,
    excerpt,
    content: `${content}\n\nSource: ${sourceName}`,
    author: normalizeCreator(article.creator) || sourceName,
    category: buildDisplayCategory({ desk, state, category, article }),
    imageUrl: article.image_url || defaultImage,
    sourceName,
    sourceUrl: article.link,
    tags: buildTags({ desk, state, category, article }),
    featured: index === 0,
    readTime: estimateReadTime(content),
    publishedAt,
    language: cleanText(article.language),
    headlineLabel: buildHeadlineLabel({ desk, state, category })
  };
};

const normalizeCreator = (creator) => {
  if (Array.isArray(creator)) {
    return cleanText(creator.join(", "));
  }

  return cleanText(creator);
};

const buildDisplayCategory = ({ desk, state, category, article }) => {
  if (desk === "States" && state) {
    return state;
  }

  if (desk === "Central") {
    return "Central";
  }

  return category !== "All"
    ? category
    : normalizeCategoryArray(article.category)?.[0] || "Top India";
};

const buildHeadlineLabel = ({ desk, state, category }) => {
  if (desk === "States" && state) {
    return state;
  }

  if (desk === "Central") {
    return category === "All" ? "Central" : `Central ${category}`;
  }

  return category === "All" ? "Top India" : category;
};

const buildTags = ({ desk, state, category, article }) => {
  const providerCategory = normalizeCategoryArray(article.category)?.[0];

  return [desk === "States" ? state : desk, category !== "All" ? category : providerCategory, sourceNameOrCountry(article)]
    .filter(Boolean)
    .slice(0, 3);
};

const sourceNameOrCountry = (article) =>
  cleanText(article.source_name) || normalizeCategoryArray(article.country)?.[0] || "India";

const normalizeCategoryArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).map(capitalize)
    : [];

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const makeArticleSlug = (title, sourceName, fallback) => {
  const base = slugify(`${title} ${sourceName}`, { lower: true, strict: true });
  const suffix = Buffer.from(String(fallback)).toString("base64url").slice(0, 8).toLowerCase();
  return `${base}-${suffix}`;
};

const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const estimateReadTime = (content) => {
  const words = cleanText(content).split(" ").filter(Boolean).length;
  return Math.max(Math.ceil(words / 220), 1);
};

const toISODate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};
