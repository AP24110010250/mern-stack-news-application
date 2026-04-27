import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { getSavedArticles, removeSavedArticle } from "../services/api.js";

const SavedPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    getSavedArticles()
      .then((data) => setArticles(data.articles || []))
      .catch((error) => setStatus(error.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (slug) => {
    try {
      await removeSavedArticle(slug);
      setArticles((current) => current.filter((article) => article.slug !== slug));
    } catch (error) {
      setStatus(error.message);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="bg-orbs" />
      <section className="newsroom">
        <div className="section-heading" style={{marginBottom: "40px"}}>
          <p className="eyebrow">Watch Later</p>
          <h1>Your saved stories</h1>
        </div>

        {status && <p className="form-error">{status}</p>}

        {!articles.length ? (
          <div className="state-block">
            <h2>No saved stories yet.</h2>
            <p>Save stories from the feed or story page and they will land here.</p>
          </div>
        ) : (
          <div className="article-grid">
            {articles.map((article) => (
              <div className="saved-card" key={article.slug}>
                <ArticleCard article={article} />
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleRemove(article.slug)}
                  style={{marginTop: "8px"}}
                >
                  Remove from list
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default SavedPage;
