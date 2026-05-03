import { useState } from "react";
import { requestPasswordReset } from "../services/api.js";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    setResetUrl("");

    try {
      const response = await requestPasswordReset({ email });
      setStatus(response.message);
      setResetUrl(response.resetUrl || "");
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
          <h1>Reset your password</h1>
        </div>

        <div className="glass-panel" style={{padding: "40px"}}>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Registered email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            {status && <p className="form-note">{status}</p>}
            {resetUrl && (
              <a className="text-link" href={resetUrl}>
                Open local reset link
              </a>
            )}
            <button className="primary-button" disabled={saving} type="submit" style={{marginTop: "20px"}}>
              {saving ? "Sending..." : "Send reset email"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default ForgotPasswordPage;
