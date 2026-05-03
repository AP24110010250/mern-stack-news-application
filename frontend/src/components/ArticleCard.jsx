import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { saveArticle, deleteArticle } from "../services/api.js";
import { formatDate } from "../utils/formatDate.js";

const ArticleCard = ({ article, variant = "standard" }) => {
  const { user, isAdmin } = useAuth();
  const [status, setStatus] = useState("");

  const handleSave = async () => {
    if (!user) {
      setStatus("Sign in to save");
      return;
    }

    try {
      await saveArticle(article);
      setStatus("Saved");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className={`article-card-wrapper ${variant === "lead" ? "article-card--lead" : ""}`}>
      <article className={`article-card`}>
        <Link className="article-image-link" to={`/article/${article.slug}`}>
          <img src={article.imageUrl} alt="" loading="lazy" />
        </Link>
        <div className="article-card__body">
          <div className="article-meta">
            <span>{article.category}</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>{article.readTime} min read</span>
          </div>
          <h2>
            <Link to={`/article/${article.slug}`}>{article.title}</Link>
          </h2>
          <p>{article.excerpt}</p>
          <div className="article-tags" aria-label="Article tags">
            {article.tags?.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="card-actions">
            <button className="save-btn" type="button" onClick={handleSave}>
              <svg viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
              {status || "Save"}
            </button>
            
            {isAdmin && (
              <div className="admin-actions" style={{marginLeft: "auto", display: "flex", gap: "8px"}}>
                <Link to={`/edit-article/${article.slug}`} className="text-link" style={{fontSize: ".75rem"}}>Edit</Link>
                <button className="text-link" style={{fontSize: ".75rem", border: "none", background: "none", color: "var(--accent)"}} 
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this story?")) {
                      try {
                        await deleteArticle(article.slug);
                        window.location.reload();
                      } catch (err) {
                        alert(err.message);
                      }
                    }
                  }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleCard;
