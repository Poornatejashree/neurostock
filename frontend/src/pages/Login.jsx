import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../utils/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,#58a6ff,#bc8cff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div><div style={{ fontWeight: 800, fontSize: 18 }}>NeuroStock</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Smart Inventory System</div></div>
          </div>

          <h1 className="login-tagline">Inventory<br />intelligence,<br /><span>reimagined.</span></h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 14, fontSize: 15, lineHeight: 1.6, maxWidth: 360 }}>
            Production-grade inventory system with AI-powered analytics, real-time alerts, and complete audit trails.
          </p>

          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "🤖", text: "AI Assistant — natural language queries" },
              { icon: "📦", text: "Real-time stock tracking & smart alerts" },
              { icon: "📊", text: "Advanced analytics & demand prediction" },
              { icon: "🔐", text: "Role-based access with full audit logs" },
              { icon: "🏭", text: "Multi-warehouse location tracking" },
            ].map((f) => (
              <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontSize: 13.5 }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>{f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-title">Welcome back 👋</div>
          <div className="login-sub">Sign in to your NeuroStock account</div>

          {error && <div className="error-box">⚠️ {error}</div>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="admin@company.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter your password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
            No account? Contact your administrator to get access.
          </p>
        </form>
      </div>
    </div>
  );
}
