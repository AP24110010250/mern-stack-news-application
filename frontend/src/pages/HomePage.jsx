import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArticleCard from "../components/ArticleCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getArticles, getCategories, saveArticle } from "../services/api.js";
import { formatDate } from "../utils/formatDate.js";

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [desks, setDesks] = useState(["Top India", "Central", "States"]);
  const [states, setStates] = useState([]);
  const [activeDesk, setActiveDesk] = useState("Top India");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeState, setActiveState] = useState("Delhi");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data.categories || []);
        setDesks(data.desks || ["Top India", "Central", "States"]);
        setStates(data.states || []);
        if (data.states?.includes("Delhi")) setActiveState("Delhi");
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");
      getArticles({
        desk: activeDesk,
        state: activeDesk === "States" ? activeState : "",
        category: activeCategory,
        q: query
      })
        .then((data) => setArticles(data.articles || []))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(timeout);
  }, [activeCategory, activeDesk, activeState, query]);

  const leadArticle = useMemo(
    () => articles.find((a) => a.featured) || articles[0],
    [articles]
  );
  const sidebarStories = leadArticle
    ? articles.filter((a) => a.slug !== leadArticle.slug).slice(0, 4)
    : articles.slice(0, 4);
  const restStories = leadArticle
    ? articles.filter(
        (a) =>
          a.slug !== leadArticle.slug &&
          !sidebarStories.some((s) => s.slug === a.slug)
      )
    : articles;

  const clearFilters = () => {
    setQuery("");
    setActiveDesk("Top India");
    setActiveCategory("All");
    setActiveState("Delhi");
  };
  const selectDesk = (desk) => {
    setActiveDesk(desk);
    if (desk !== "States") setActiveState("Delhi");
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <>
      {/* ─── Masthead ─── */}
      <div className="masthead">
        <span className="masthead__date">{dateStr}</span>
        <div className="masthead__brand">
          <h1 className="masthead__title">NewsSnap</h1>
          <p className="masthead__tagline">Your Daily News in 60 Words</p>
        </div>
        <div className="masthead__search">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </div>

      {/* ─── Category Ticker Nav ─── */}
      <nav className="category-nav">
        <div className="category-nav__inner">
          {[...new Set(["All", ...categories])].map((cat) => (
            <button
              key={cat}
              className={cat === activeCategory ? "active" : ""}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* ─── Breaking Banner ─── */}
      {leadArticle && !loading && (
        <div className="breaking-banner">
          <span className="breaking-badge">BREAKING</span>
          <marquee behavior="scroll" direction="left" scrollamount="4">
            {articles.slice(0, 5).map((a) => a.title).join("  ●  ")}
          </marquee>
        </div>
      )}

      <section className="newsroom">
        {/* ─── Desk & State Filters ─── */}
        <div className="desk-filters">
          <div className="chip-row">
            {desks.map((desk) => (
              <button
                key={desk}
                className={desk === activeDesk ? "active" : ""}
                onClick={() => selectDesk(desk)}
              >
                {desk}
              </button>
            ))}
          </div>
          {activeDesk === "States" && (
            <div className="chip-row chip-row--scroll">
              {states.map((state) => (
                <button
                  key={state}
                  className={state === activeState ? "active" : ""}
                  onClick={() => setActiveState(state)}
                >
                  {state}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && <LoadingState />}

        {!loading && error && (
          <div className="state-block state-block--error">
            <h2>Could not reach the newsroom.</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && !articles.length && (
          <div className="state-block">
            <h2>No stories found.</h2>
            <p>Try a different search or category.</p>
            {(query || activeCategory !== "All" || activeDesk !== "Top India") && (
              <button className="primary-button" onClick={clearFilters} style={{marginTop: 16}}>
                Show all stories
              </button>
            )}
          </div>
        )}

        {!loading && !error && leadArticle && (
          <>
            {/* ─── FRONT PAGE HERO ─── */}
            <div className="front-page">
              {/* Big Lead Story */}
              <article className="lead-story">
                <Link to={`/article/${leadArticle.slug}`} className="lead-story__image">
                  <img src={leadArticle.imageUrl} alt="" />
                  <div className="lead-story__overlay">
                    <span className="lead-story__cat">{leadArticle.category}</span>
                  </div>
                </Link>
                <div className="lead-story__body">
                  <h2>
                    <Link to={`/article/${leadArticle.slug}`}>{leadArticle.title}</Link>
                  </h2>
                  <p>{leadArticle.excerpt}</p>
                  <div className="lead-story__meta">
                    <span>{leadArticle.sourceName}</span>
                    <span>{formatDate(leadArticle.publishedAt)}</span>
                    <span>{leadArticle.readTime} min</span>
                  </div>
                </div>
              </article>

              {/* Sidebar Stories */}
              <aside className="sidebar-stories">
                <div className="sidebar-stories__header">
                  <span className="red-dot" />
                  <strong>Top Stories</strong>
                </div>
                {sidebarStories.map((a, i) => (
                  <Link className="sidebar-story" key={a.slug} to={`/article/${a.slug}`}>
                    <img src={a.imageUrl} alt="" />
                    <div>
                      <span className="sidebar-story__cat">{a.category}</span>
                      <strong>{a.title}</strong>
                      <small>{a.sourceName} · {formatDate(a.publishedAt)}</small>
                    </div>
                  </Link>
                ))}
              </aside>
            </div>

            {/* ─── View Toggle ─── */}
            <div className="section-divider">
              <div className="section-divider__label">
                <span className="red-dot" />
                <strong>Latest News</strong>
                <span className="story-count">{restStories.length} stories</span>
              </div>
              <div className="view-toggle">
                <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="7" height="7" rx="1"/><rect x="9" y="0" width="7" height="7" rx="1"/><rect x="0" y="9" width="7" height="7" rx="1"/><rect x="9" y="9" width="7" height="7" rx="1"/></svg>
                  Grid
                </button>
                <button className={viewMode === "inshorts" ? "active" : ""} onClick={() => setViewMode("inshorts")}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="0" width="12" height="4" rx="1"/><rect x="2" y="6" width="12" height="4" rx="1"/><rect x="2" y="12" width="12" height="4" rx="1"/></svg>
                  Cards
                </button>
              </div>
            </div>

            {/* ─── Article Feed ─── */}
            {viewMode === "grid" ? (
              <div className="article-grid">
                {restStories.map((a) => (
                  <ArticleCard article={a} key={a.slug} />
                ))}
              </div>
            ) : (
              <div className="inshorts-scroll">
                {restStories.map((a) => (
                  <InshortsCard article={a} key={a.slug} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

/* ─── Inshorts Card ─── */
const InshortsCard = ({ article }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState("");
  const handleSave = async () => {
    if (!user) { setStatus("Sign in to save"); return; }
    try { await saveArticle(article); setStatus("Saved ✓"); } catch (e) { setStatus(e.message); }
  };
  return (
    <div className="inshorts-card">
      <Link to={`/article/${article.slug}`}>
        <img src={article.imageUrl} alt="" loading="lazy" />
      </Link>
      <div className="inshorts-card__body">
        <div className="article-meta">
          <span>{article.category}</span>
          <span>{article.readTime} min read</span>
        </div>
        <h2><Link to={`/article/${article.slug}`}>{article.title}</Link></h2>
        <p>{article.excerpt}</p>
        <div className="inshorts-card__footer">
          <span style={{fontSize: ".8rem", color: "var(--text-muted)"}}>{article.sourceName} · {formatDate(article.publishedAt)}</span>
          <button className="save-btn" type="button" onClick={handleSave}>
            <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
            {status || "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
