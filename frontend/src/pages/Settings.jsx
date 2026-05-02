import { useState } from "react";
import { Settings, Bell, Shield, Database, Globe, Save } from "lucide-react";

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "NeuroStock Inc.",
    currency: "USD",
    timezone: "Asia/Kolkata",
    language: "English",
    lowStockAlert: true,
    outOfStockAlert: true,
    expiryAlert: true,
    salesAlert: false,
    loginAlert: true,
    emailNotifications: false,
    autoReorder: false,
    reorderApproval: true,
    backupEnabled: true,
    backupFrequency: "daily",
    dataRetention: "90",
    twoFactor: false,
    sessionTimeout: "8",
    ipWhitelist: "",
  });

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const handleSave = () => {
    localStorage.setItem("neurostock_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 99, background: value ? "var(--accent-blue)" : "var(--bg-elevated)", border: `1px solid ${value ? "var(--accent-blue)" : "var(--border)"}`, cursor: "pointer", position: "relative", transition: "all 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: value ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </div>
  );

  const SettingRow = ({ label, desc, children }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border-light)" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Settings ⚙️</div><div className="page-sub">Configure your NeuroStock system</div></div>
        <button className="btn btn--primary" onClick={handleSave}><Save size={15} /> {saved ? "Saved ✓" : "Save Changes"}</button>
      </div>

      {saved && <div className="success-box" style={{ marginBottom: 16 }}>✅ Settings saved successfully!</div>}

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ padding: "8px", height: "fit-content" }}>
          {[
            { key: "general", icon: Settings, label: "General" },
            { key: "notifications", icon: Bell, label: "Notifications" },
            { key: "automation", icon: Globe, label: "Automation" },
            { key: "security", icon: Shield, label: "Security" },
            { key: "backup", icon: Database, label: "Backup & Data" },
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`nav-item ${tab === key ? "nav-item--active" : ""}`}
              style={{ width: "100%", marginBottom: 2 }}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card">
          {tab === "general" && (
            <>
              <div className="card-title" style={{ marginBottom: 18 }}>General Settings</div>
              <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={settings.companyName} onChange={(e) => set("companyName", e.target.value)} /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={settings.currency} onChange={(e) => set("currency", e.target.value)}>
                    <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option><option>AED</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-select" value={settings.language} onChange={(e) => set("language", e.target.value)}>
                    <option>English</option><option>Hindi</option><option>Telugu</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="form-select" value={settings.timezone} onChange={(e) => set("timezone", e.target.value)}>
                  <option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option>
                </select>
              </div>
              <SettingRow label="Low Stock Threshold" desc="Default reorder level for new products">
                <input className="form-input" type="number" style={{ width: 80 }} defaultValue={10} />
              </SettingRow>
            </>
          )}

          {tab === "notifications" && (
            <>
              <div className="card-title" style={{ marginBottom: 18 }}>Notification Preferences</div>
              <SettingRow label="Low Stock Alert 📦" desc="Notify when product drops below reorder level">
                <Toggle value={settings.lowStockAlert} onChange={(v) => set("lowStockAlert", v)} />
              </SettingRow>
              <SettingRow label="Out of Stock Alert 🚨" desc="Immediate alert when quantity hits zero">
                <Toggle value={settings.outOfStockAlert} onChange={(v) => set("outOfStockAlert", v)} />
              </SettingRow>
              <SettingRow label="Expiry Warning ⏳" desc="Alert when products are expiring within 7 days">
                <Toggle value={settings.expiryAlert} onChange={(v) => set("expiryAlert", v)} />
              </SettingRow>
              <SettingRow label="Sales Notifications 💰" desc="Notify on each sale recorded">
                <Toggle value={settings.salesAlert} onChange={(v) => set("salesAlert", v)} />
              </SettingRow>
              <SettingRow label="Login Alerts 🔑" desc="Alert on new device or failed login">
                <Toggle value={settings.loginAlert} onChange={(v) => set("loginAlert", v)} />
              </SettingRow>
              <SettingRow label="Email Notifications 📧" desc="Send alerts to email (requires SMTP setup)">
                <Toggle value={settings.emailNotifications} onChange={(v) => set("emailNotifications", v)} />
              </SettingRow>
            </>
          )}

          {tab === "automation" && (
            <>
              <div className="card-title" style={{ marginBottom: 18 }}>Workflow Automation</div>
              <SettingRow label="Auto Reorder 🔄" desc="Automatically create purchase order when stock falls below reorder level">
                <Toggle value={settings.autoReorder} onChange={(v) => set("autoReorder", v)} />
              </SettingRow>
              <SettingRow label="Require Approval for Reorders" desc="Admin must approve auto-generated purchase orders">
                <Toggle value={settings.reorderApproval} onChange={(v) => set("reorderApproval", v)} />
              </SettingRow>
              <div style={{ marginTop: 20, padding: "14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🤖 AI Automation Rules</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  <div>• Stock {'<'} reorder level → Auto flag for reorder</div>
                  <div>• No sales in 30 days → Mark as dead stock</div>
                  <div>• Expiry within 7 days → Trigger expiry alert</div>
                  <div>• Unusual stock drop (≥50%) → Flag for audit</div>
                </div>
              </div>
            </>
          )}

          {tab === "security" && (
            <>
              <div className="card-title" style={{ marginBottom: 18 }}>Security Settings</div>
              <SettingRow label="Two-Factor Authentication" desc="Require OTP on login (recommended for admin accounts)">
                <Toggle value={settings.twoFactor} onChange={(v) => set("twoFactor", v)} />
              </SettingRow>
              <SettingRow label="Session Timeout" desc="Auto-logout after inactivity (hours)">
                <select className="form-select" style={{ width: 100 }} value={settings.sessionTimeout} onChange={(e) => set("sessionTimeout", e.target.value)}>
                  <option value="1">1 hour</option><option value="4">4 hours</option><option value="8">8 hours</option><option value="24">24 hours</option>
                </select>
              </SettingRow>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">IP Whitelist (comma-separated)</label>
                <input className="form-input" placeholder="192.168.1.1, 10.0.0.1 (leave blank for no restriction)" value={settings.ipWhitelist} onChange={(e) => set("ipWhitelist", e.target.value)} />
              </div>
              <div style={{ marginTop: 16, padding: 14, background: "var(--accent-blue-dim)", borderRadius: "var(--radius-sm)", fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                🔐 <strong>Role-Based Access:</strong><br />
                Admin → Full control (all features)<br />
                Worker → Can update stock and record sales, cannot delete products or manage users
              </div>
            </>
          )}

          {tab === "backup" && (
            <>
              <div className="card-title" style={{ marginBottom: 18 }}>Backup & Data</div>
              <SettingRow label="Automatic Backups 💾" desc="MongoDB Atlas handles backups automatically when enabled">
                <Toggle value={settings.backupEnabled} onChange={(v) => set("backupEnabled", v)} />
              </SettingRow>
              <SettingRow label="Backup Frequency" desc="How often to create backups">
                <select className="form-select" style={{ width: 130 }} value={settings.backupFrequency} onChange={(e) => set("backupFrequency", e.target.value)}>
                  <option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
                </select>
              </SettingRow>
              <SettingRow label="Audit Log Retention" desc="How many days to keep audit logs">
                <select className="form-select" style={{ width: 130 }} value={settings.dataRetention} onChange={(e) => set("dataRetention", e.target.value)}>
                  <option value="30">30 days</option><option value="90">90 days</option><option value="180">180 days</option><option value="365">1 year</option>
                </select>
              </SettingRow>
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button className="btn btn--ghost"><Database size={15} /> Export All Data</button>
                <button className="btn btn--ghost">📥 Import Data</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
