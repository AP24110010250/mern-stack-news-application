import { NavLink } from "react-router-dom";
import AvatarBadge from "./AvatarBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Header = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="site-header">
      <div>
        <NavLink className="brand" to="/" aria-label="NewsSnap home">
          <span className="brand-mark">NS</span>
          <span>
            <strong>NewsSnap</strong>
            <small>60-Word News</small>
          </span>
        </NavLink>
        <nav className="site-nav" aria-label="Primary navigation">
          <NavLink to="/">Home</NavLink>
          {user && <NavLink to="/saved">Saved</NavLink>}
          {user && (
            <NavLink className="profile-link" to="/profile">
              <AvatarBadge gender={user.gender} name={user.name} size="sm" avatarUrl={user.avatarUrl} />
              <span>Profile</span>
            </NavLink>
          )}
          {isAdmin && <NavLink to="/publish">Publish</NavLink>}
          {isAdmin && <NavLink to="/my-uploads">My Uploads</NavLink>}
          {!user ? (
            <NavLink className="primary-button" to="/auth">Sign in</NavLink>
          ) : (
            <button className="secondary-button" type="button" onClick={logout}>
              Sign out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
