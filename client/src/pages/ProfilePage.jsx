import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AvatarBadge from "../components/AvatarBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getSavedArticles, updateProfile, deleteAccount } from "../services/api.js";

const ProfilePage = () => {
  const { user, isAdmin, logout, updateUser } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    gender: user.gender || "prefer-not-to-say",
    avatarUrl: user.avatarUrl || ""
  });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    getSavedArticles()
      .then((data) => setSavedCount(data.articles?.length || 0))
      .catch(() => {});
  }, []);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        setStatus("File size must be less than 30MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("avatarUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const res = await updateProfile(form);
      updateUser(res.user);
      setStatus("✓ Profile updated successfully");
      setEditing(false);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setStatus("New passwords don't match");
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      const res = await updateProfile({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      updateUser(res.user);
      setStatus("✓ Password changed successfully");
      setShowPassword(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await deleteAccount({ password: deletePassword });
      logout();
      navigate("/");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  return (
    <section className="profile-page">
      <div className="section-heading" style={{marginBottom: "28px"}}>
        <p className="eyebrow">Profile</p>
        <h1>{user.name || "NewsSnap Reader"}</h1>
      </div>

      {status && (
        <div className={`profile-status ${status.startsWith("✓") ? "profile-status--ok" : "profile-status--err"}`}>
          {status}
        </div>
      )}

      <div className="profile-grid">
        {/* ─── Left: Profile Info or Edit Form ─── */}
        <section className="profile-panel">
          {!editing ? (
            <>
              <div className="profile-identity">
                <AvatarBadge gender={user.gender} name={user.name} avatarUrl={user.avatarUrl} />
                <div>
                  <h2>{user.name || "NewsSnap Reader"}</h2>
                  <p className="profile-role">{isAdmin ? "Admin" : "Reader"}</p>
                </div>
              </div>
              <dl className="profile-list">
                <div><dt>Email</dt><dd>{user.email}</dd></div>
                <div><dt>Gender</dt><dd style={{textTransform: "capitalize"}}>{(user.gender || "prefer-not-to-say").replace(/-/g, " ")}</dd></div>
                <div><dt>Role</dt><dd>{isAdmin ? "Admin" : "User"}</dd></div>
                <div><dt>Saved</dt><dd>{savedCount} stories</dd></div>
              </dl>
              <button className="primary-button" onClick={() => setEditing(true)} style={{marginTop: "20px", width: "100%"}}>
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <h2 style={{marginBottom: "20px"}}>Edit Profile</h2>
              <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                <div style={{display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px"}}>
                   <AvatarBadge gender={form.gender} name={form.name} avatarUrl={form.avatarUrl} size="lg" />
                   <div style={{display: "grid", gap: "8px"}}>
                     <label className="primary-button" style={{margin: 0, cursor: "pointer", fontSize: ".8rem"}}>
                        Upload New Photo
                        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                     </label>
                     <button type="button" className="text-link" style={{fontSize: ".72rem", border: "none", background: "none", textAlign: "left"}} 
                       onClick={() => updateField("avatarUrl", "")}>
                        Remove profile picture
                     </button>
                   </div>
                </div>
                <p style={{fontSize: ".75rem", color: "var(--text-muted)", marginTop: "-12px", marginBottom: "20px"}}>
                  Max file size: 30MB. Stored locally on your profile.
                </p>

                <label>
                  Name
                  <input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                </label>
                <label>
                  Email
                  <input type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                </label>
                <label>
                  Gender
                  <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </label>
                <div style={{display: "flex", gap: "10px", marginTop: "12px"}}>
                  <button className="primary-button" type="submit" disabled={saving} style={{flex: 1}}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button className="secondary-button" type="button" onClick={() => { setEditing(false); setStatus(""); setForm({...user, avatarUrl: user.avatarUrl || ""}); }} style={{flex: 1}}>
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </section>

        {/* ─── Right: Actions ─── */}
        <section className="profile-panel">
          <h2 style={{fontSize: "1.2rem", marginBottom: "18px"}}>Actions</h2>
          <div className="profile-actions">
            <Link className="primary-button" to="/saved">Saved Stories</Link>
            {isAdmin && <Link className="secondary-button" to="/publish">Publish Story</Link>}

            {/* Change Password Toggle */}
            <button className="secondary-button" type="button" onClick={() => { setShowPassword(!showPassword); setShowDelete(false); }}>
              Change Password
            </button>
            {showPassword && (
              <form className="profile-inline-form" onSubmit={handleChangePassword}>
                <label>
                  Current Password
                  <input type="password" required value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} />
                </label>
                <label>
                  New Password
                  <input type="password" required minLength="8" value={pwForm.newPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} />
                </label>
                <label>
                  Confirm New Password
                  <input type="password" required minLength="8" value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
                </label>
                <button className="primary-button" type="submit" disabled={saving} style={{width: "100%"}}>
                  {saving ? "Saving..." : "Update Password"}
                </button>
              </form>
            )}

            {/* Delete Account Toggle */}
            <button className="danger-button" type="button" onClick={() => { setShowDelete(!showDelete); setShowPassword(false); }}>
              Delete Account
            </button>
            {showDelete && (
              <form className="profile-inline-form profile-inline-form--danger" onSubmit={handleDeleteAccount}>
                <p style={{fontSize: ".85rem", color: "var(--accent)", margin: "0 0 12px"}}>
                  ⚠ This action is permanent. All your data will be deleted.
                </p>
                <label>
                  Enter your password to confirm
                  <input type="password" required value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)} />
                </label>
                <button className="danger-button" type="submit" disabled={saving} style={{width: "100%"}}>
                  {saving ? "Deleting..." : "Permanently Delete Account"}
                </button>
              </form>
            )}

            <button className="secondary-button" type="button" onClick={handleSignOut} style={{marginTop: "8px"}}>
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};

export default ProfilePage;
