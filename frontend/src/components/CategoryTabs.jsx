const CategoryTabs = ({ categories, activeCategory, onChange }) => (
  <div className="category-tabs" aria-label="Filter by category">
    {["All", ...categories].map((category) => (
      <button
        className={category === activeCategory ? "active" : ""}
        key={category}
        type="button"
        onClick={() => onChange(category)}
      >
        {category}
      </button>
    ))}
  </div>
);

export default CategoryTabs;
