import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AvatarBadge from "../components/AvatarBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const AuthPage = () => {
  const [mode, setMode] = useState("signin");
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    adminAccessCode: "",
    gender: "prefer-not-to-say"
  });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const payload = {
        ...form,
        role
      };
      const auth = mode === "signin" ? await login(payload) : await register(payload);
      navigate(auth.user.role === "admin" ? "/publish" : "/");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-orbs" />
      <section className="auth-page">
        <div className="auth-layout">
          <div className="auth-copy">
            <p className="eyebrow">Account</p>
            <h1>{mode === "signin" ? "Welcome back to the India desk." : "Create a cleaner news identity."}</h1>
            <p className="auth-lede">
              Save stories, switch between user and admin access, and keep your profile avatar in sync
              with the gender you choose.
            </p>
            <div className="auth-preview">
              <AvatarBadge gender={form.gender} name={form.name || form.email || "PulseWire user"} />
              <div>
                <strong>{form.name || "Your profile preview"}</strong>
                <p>{form.gender.replace(/-/g, " ")}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <div className="switch-row">
              <button
                className={mode === "signin" ? "active" : ""}
                type="button"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
              <button
                className={mode === "signup" ? "active" : ""}
                type="button"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="switch-row switch-row--compact">
                <button
                  className={role === "user" ? "active" : ""}
                  type="button"
                  onClick={() => setRole("user")}
                >
                  User Account
                </button>
                <button
                  className={role === "admin" ? "active" : ""}
                  type="button"
                  onClick={() => setRole("admin")}
                >
                  Admin Access
                </button>
              </div>

              {mode === "signup" && (
                <label>
                  Name
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                  />
                </label>
              )}

              <div className="form-grid">
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </label>

                <label>
                  Gender
                  <select
                    required
                    value={form.gender}
                    onChange={(event) => updateField("gender", event.target.value)}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </label>
              </div>

              <label>
                Password
                <input
                  required
                  minLength="8"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
              </label>

              {role === "admin" && (
                <label>
                  Admin access code
                  <input
                    required
                    type="password"
                    value={form.adminAccessCode}
                    onChange={(event) => updateField("adminAccessCode", event.target.value)}
                  />
                </label>
              )}

              {status && <p className="form-error">{status}</p>}

              <div className="auth-actions">
                <button className="primary-button" disabled={saving} type="submit" style={{width: "100%", marginTop: "10px"}}>
                  {saving ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </div>
              <div style={{textAlign: "center", marginTop: "16px"}}>
                <Link className="text-link" to="/forgot-password" style={{fontSize: "0.9rem"}}>
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default AuthPage;
