import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getArticle, saveArticle } from "../services/api.js";
import { formatDate } from "../utils/formatDate.js";

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError("");

    getArticle(slug)
      .then(setArticle)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    if (!user) {
      setSaveStatus("Sign in to save this story");
      return;
    }

    try {
      await saveArticle(article);
      setSaveStatus("Saved to Watch Later");
    } catch (err) {
      setSaveStatus(err.message);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <section className="article-detail">
        <Link to="/" className="back-link" style={{marginBottom: "40px"}}>
          ← Back to newsroom
        </Link>
        <div className="state-block state-block--error">
          <h1>Story unavailable.</h1>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="bg-orbs" />
      <div className="article-layout-container" style={{maxWidth: "1200px", margin: "0 auto", padding: "60px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "60px"}}>
        <article className="article-detail" style={{padding: 0}}>
          <Link to="/" className="back-link" style={{marginBottom: "40px"}}>
            ← Back to newsroom
          </Link>
          <header className="article-detail__header">
            <p className="eyebrow">{article.category}</p>
            <h1>{article.title}</h1>
            <p className="dek">{article.excerpt}</p>
            <div className="article-meta" style={{marginBottom: "32px", fontSize: "0.95rem"}}>
              <span>By {article.author}</span>
              <span>{formatDate(article.publishedAt)}</span>
              <span>{article.readTime} min read</span>
            </div>
            <div className="article-actions" style={{display: "flex", gap: "16px", alignItems: "center"}}>
              <button className="primary-button" type="button" onClick={handleSave}>
                <svg viewBox="0 0 24 24" style={{width: "18px", height: "18px", fill: "currentColor"}}>
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
                Save for later
              </button>
              {saveStatus && <span style={{color: "var(--accent)", fontWeight: "600"}}>{saveStatus}</span>}
            </div>
          </header>

          <img className="article-detail__image" src={article.imageUrl} alt="" style={{borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)"}} />

          <div className="article-detail__content glass-panel" style={{padding: "40px", marginTop: "40px", borderRadius: "16px", lineHeight: "1.8", fontSize: "1.1rem"}}>
            {article.content.split("\n").map((paragraph, idx) => (
              <p key={idx} style={{marginBottom: "24px"}}>{paragraph}</p>
            ))}
          </div>

          <footer className="article-detail__footer" style={{marginTop: "40px", borderTop: "1px solid var(--border)", paddingTop: "24px"}}>
            <div className="article-tags" style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
              {article.tags?.map((tag) => (
                <span key={tag} style={{padding: "4px 12px", background: "#f1f5f9", borderRadius: "20px", fontSize: ".8rem", fontWeight: "600"}}>{tag}</span>
              ))}
            </div>
            {article.sourceUrl && (
              <a href={article.sourceUrl} target="_blank" rel="noreferrer" style={{marginTop: "20px", display: "inline-block", color: "var(--accent)", fontWeight: "600", textDecoration: "none"}}>
                Read full story at {article.sourceName} ↗
              </a>
            )}
          </footer>
        </article>

        <aside className="article-sidebar" style={{position: "sticky", top: "100px", height: "fit-content"}}>
          <div className="sidebar-section" style={{marginBottom: "40px"}}>
             <h3 style={{fontSize: ".9rem", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: "20px", borderBottom: "2px solid var(--text)", paddingBottom: "8px"}}>Latest Headlines</h3>
             <div style={{display: "grid", gap: "24px"}}>
                <p style={{fontSize: ".85rem", color: "var(--text-sec)"}}>Stay updated with the most recent stories from our editors.</p>
                <Link to="/" className="text-link" style={{fontSize: ".9rem", fontWeight: "700"}}>View all news →</Link>
             </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default ArticlePage;
