import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getArticle, updateArticle } from "../services/api.js";
import LoadingState from "../components/LoadingState.jsx";

const categories = [
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Entertainment"
];

const EditArticlePage = () => {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getArticle(slug)
      .then((data) => {
        setForm({
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || ""
        });
      })
      .catch((err) => setStatus(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const updated = await updateArticle(slug, {
        ...form,
        tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags
      });
      navigate(`/article/${updated.slug}`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!form && status) return <div className="state-block"><h1>Error</h1><p>{status}</p></div>;

  return (
    <>
      <div className="bg-orbs" />
      <section className="publish-page" style={{maxWidth: "800px"}}>
        <div className="section-heading" style={{marginBottom: "40px"}}>
          <p className="eyebrow">Editor</p>
          <h1>Edit story</h1>
        </div>

        <div className="glass-panel" style={{padding: "40px"}}>
          <form className="publish-form" onSubmit={handleSubmit}>
            <label>
              Title
              <input
                required
                maxLength="140"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </label>

            <label>
              Excerpt
              <textarea
                required
                maxLength="280"
                rows="3"
                value={form.excerpt}
                onChange={(event) => updateField("excerpt", event.target.value)}
              />
            </label>

            <label>
              Story
              <textarea
                required
                rows="12"
                value={form.content}
                onChange={(event) => updateField("content", event.target.value)}
              />
            </label>

            <div className="form-grid">
              <label>
                Author
                <input
                  value={form.author}
                  onChange={(event) => updateField("author", event.target.value)}
                />
              </label>

              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Read time (min)
                <input
                  min="1"
                  type="number"
                  value={form.readTime}
                  onChange={(event) => updateField("readTime", event.target.value)}
                />
              </label>
            </div>

            <label>
              Image URL
              <input
                required
                type="url"
                value={form.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
              />
            </label>

            <div className="form-grid">
              <label>
                Source name
                <input
                  value={form.sourceName}
                  onChange={(event) => updateField("sourceName", event.target.value)}
                />
              </label>

              <label>
                Source URL
                <input
                  type="url"
                  value={form.sourceUrl}
                  onChange={(event) => updateField("sourceUrl", event.target.value)}
                />
              </label>
            </div>

            <label>
              Tags
              <input
                placeholder="climate, policy, cities"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
              />
            </label>

            <label className="checkbox-row" style={{marginTop: "10px"}}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
              />
              Feature this story on homepage
            </label>

            {status && <p className="form-error" style={{marginTop: "10px"}}>{status}</p>}

            <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
              <button className="primary-button" disabled={saving} type="submit" style={{flex: 1}}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="secondary-button" type="button" onClick={() => navigate(-1)} style={{flex: 1}}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default EditArticlePage;
