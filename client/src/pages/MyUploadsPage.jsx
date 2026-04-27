import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArticleCard from "../components/ArticleCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { getAdminArticles } from "../services/api.js";

const MyUploadsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminArticles()
      .then((data) => setArticles(data.articles || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <>
      <div className="bg-orbs" />
      <section className="newsroom">
        <div className="section-heading" style={{marginBottom: "40px"}}>
          <p className="eyebrow">Dashboard</p>
          <h1>My Published Stories</h1>
          <p style={{marginTop: "8px", color: "var(--text-sec)"}}>
            Manage and track all stories you've uploaded to the NewsSnap database.
          </p>
        </div>

        {error && (
          <div className="state-block state-block--error">
            <h2>Could not load uploads.</h2>
            <p>{error}</p>
          </div>
        )}

        {!articles.length && !error ? (
          <div className="state-block">
            <h2>You haven't published anything yet.</h2>
            <p>Go to the Publish page to create your first story.</p>
            <Link to="/publish" className="primary-button" style={{marginTop: "20px", display: "inline-block"}}>
              Publish Story
            </Link>
          </div>
        ) : (
          <div className="article-grid">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default MyUploadsPage;
