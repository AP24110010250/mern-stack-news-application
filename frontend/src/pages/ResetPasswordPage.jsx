import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resetPassword } from "../services/api.js";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await resetPassword(token, { password });
      setStatus(response.message);
      setDone(true);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-orbs" />
      <section className="auth-page" style={{maxWidth: "500px", margin: "0 auto"}}>
        <div className="section-heading" style={{marginBottom: "40px", textAlign: "center"}}>
          <p className="eyebrow">Account</p>
          <h1>Choose a new password</h1>
        </div>

        <div className="glass-panel" style={{padding: "40px"}}>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              New password
              <input
                required
                minLength="8"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {status && <p className={done ? "form-note" : "form-error"}>{status}</p>}
            {done ? (
              <Link className="primary-button" to="/auth" style={{marginTop: "20px", display: "flex"}}>
                Sign in
              </Link>
            ) : (
              <button className="primary-button" disabled={saving} type="submit" style={{marginTop: "20px"}}>
                {saving ? "Saving..." : "Reset password"}
              </button>
            )}
          </form>
        </div>
      </section>
    </>
  );
};

export default ResetPasswordPage;
