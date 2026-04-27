import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="site-footer">
    <div>
      <div className="brand-mark" style={{display: "inline-flex", marginBottom: "10px", width: "32px", height: "32px"}}>NS</div>
      <p>NewsSnap — Your daily news in 60 words. Short, concise, and always up to date.</p>
      <p style={{marginTop: "6px", color: "var(--text-muted)", fontSize: ".78rem"}}>© 2026 NewsSnap. All rights reserved.</p>
    </div>
    <div className="footer-links">
      <Link to="/">Home</Link>
      <Link to="/auth">Sign In</Link>
    </div>
  </footer>
);

export default Footer;
