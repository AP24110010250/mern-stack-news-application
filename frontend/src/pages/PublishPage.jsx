import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createArticle } from "../services/api.js";

const initialForm = {
  title: "",
  excerpt: "",
  content: "",
  author: "",
  category: "Politics",
  imageUrl:
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
  sourceName: "",
  sourceUrl: "",
  tags: "",
  readTime: 4,
  featured: false
};

const categories = [
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Entertainment"
];

const PublishPage = () => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const article = await createArticle(form);
      navigate(`/article/${article.slug}`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-orbs" />
      <section className="publish-page" style={{maxWidth: "800px"}}>
        <div className="section-heading" style={{marginBottom: "40px"}}>
          <p className="eyebrow">Editor</p>
          <h1>Publish an admin story</h1>
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

            <button className="primary-button" disabled={saving} type="submit" style={{marginTop: "20px"}}>
              {saving ? "Publishing..." : "Publish story"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default PublishPage;
