const API_BASE = import.meta.env.VITE_API_URL || "/api";
const AUTH_STORAGE_KEY = "pulsewire_auth";

export const getStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
  } catch (_error) {
    return null;
  }
};

export const setStoredAuth = (auth) => {
  if (!auth) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

const request = async (path, options = {}) => {
  const auth = getStoredAuth();
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getArticles = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return request(`/articles${query ? `?${query}` : ""}`);
};

export const getAdminArticles = () => request("/articles/admin-list");

export const getArticle = (slug) => request(`/articles/${slug}`);

export const getCategories = () => request("/articles/categories");

export const createArticle = (article) =>
  request("/articles", {
    method: "POST",
    body: JSON.stringify(article)
  });

export const updateArticle = (slug, article) =>
  request(`/articles/${slug}`, {
    method: "PUT",
    body: JSON.stringify(article)
  });

export const deleteArticle = (slug) =>
  request(`/articles/${slug}`, {
    method: "DELETE"
  });

export const register = (payload) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const login = (payload) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const getCurrentUser = () => request("/auth/me");

export const updateProfile = (payload) =>
  request("/auth/me", {
    method: "PUT",
    body: JSON.stringify(payload)
  });

export const deleteAccount = (payload) =>
  request("/auth/me", {
    method: "DELETE",
    body: JSON.stringify(payload)
  });

export const requestPasswordReset = (payload) =>
  request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const resetPassword = (token, payload) =>
  request(`/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const getSavedArticles = () => request("/saved-articles");

export const saveArticle = (article) =>
  request("/saved-articles", {
    method: "POST",
    body: JSON.stringify(article)
  });

export const removeSavedArticle = (slug) =>
  request(`/saved-articles/${slug}`, {
    method: "DELETE"
  });
