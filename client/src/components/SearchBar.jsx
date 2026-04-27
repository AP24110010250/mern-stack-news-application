const SearchBar = ({ value, onChange }) => (
  <label className="search-bar">
    <span>Search the wire</span>
    <div className="search-bar-input-wrapper">
      <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        placeholder="Try AI, climate, sports..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </label>
);

export default SearchBar;
