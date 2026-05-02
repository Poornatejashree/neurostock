import { useState, useRef } from "react";
import { updateProfile } from "../utils/api";
import { Camera, Save, User } from "lucide-react";

export default function Profile() {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({ name: stored.name || "", email: stored.email || "", phone: stored.phone || "", bio: stored.bio || "", avatar: stored.avatar || "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState({ current: "", newPass: "", confirm: "" });
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("avatar", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true); setSuccess(""); setError("");
    try {
      await updateProfile(form);
      const updated = { ...stored, ...form };
      localStorage.setItem("user", JSON.stringify(updated));
      setSuccess("Profile updated successfully!");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update profile.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-sub">Manage your account details and preferences</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, maxWidth: 900 }}>
        {/* Avatar Card */}
        <div className="card" style={{ textAlign: "center", padding: "28px 20px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ position: "relative", width: 90, height: 90 }}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--accent-blue)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {form.avatar
                  ? <img src={form.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 36, fontWeight: 800, color: "var(--accent-blue)" }}>{(form.name || "U").slice(0, 1).toUpperCase()}</span>
                }
              </div>
              <div onClick={() => fileRef.current?.click()}
                style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: "var(--accent-blue)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid var(--bg-elevated)" }}>
                <Camera size={14} color="#fff" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{form.name || "Your Name"}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 8 }}>{form.email}</div>
          <span className={`badge ${stored.role === "admin" ? "badge--purple" : "badge--blue"}`}>
            {stored.role === "admin" ? "👑 Super Admin" : "👷 Worker"}
          </span>
          <div style={{ marginTop: 20, padding: "14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-muted)", textAlign: "left" }}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: "var(--text-secondary)" }}>Account Info</div>
            <div>Member since 2024</div>
            <div style={{ marginTop: 4 }}>Last login: today</div>
            <div style={{ marginTop: 4 }}>Role: {stored.role || "worker"}</div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Personal Information</div>

            {success && <div className="success-box">✅ {success}</div>}
            {error && <div className="error-box">⚠️ {error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="email@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" placeholder="Tell us about yourself..." value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn--primary" onClick={handleSave} disabled={loading}>
                <Save size={15} /> {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Change Password</div>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="Current password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="New password" value={password.newPass} onChange={(e) => setPassword({ ...password, newPass: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="Confirm password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn--ghost">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
