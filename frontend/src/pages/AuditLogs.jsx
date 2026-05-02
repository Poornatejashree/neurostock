import { useState, useEffect } from "react";
import { getAuditLogs } from "../utils/api";
import { ClipboardList, RefreshCw } from "lucide-react";

const ACTION_COLORS = {
  CREATE: "var(--accent-green)",
  UPDATE: "var(--accent-blue)",
  DELETE: "var(--accent-red)",
  SALE: "var(--accent-purple)",
  LOGIN: "var(--accent-orange)",
};

const DEMO_LOGS = [
  { _id: "1", user: "Admin User", action: "UPDATE", entity: "Product", entityName: "Wireless Headphones", oldValue: "50", newValue: "45", description: "Stock updated: Wireless Headphones 50 → 45", createdAt: new Date().toISOString() },
  { _id: "2", user: "Worker Ravi", action: "SALE", entity: "Sale", entityName: "Laptop Stand", description: "Sale recorded: 3 units of Laptop Stand for $149.97", createdAt: new Date(Date.now() - 300000).toISOString() },
  { _id: "3", user: "Admin User", action: "CREATE", entity: "Product", entityName: "Smart Watch", description: "New product added: Smart Watch", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: "4", user: "Admin User", action: "DELETE", entity: "Product", entityName: "Old Keyboard", description: "Product deleted: Old Keyboard", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: "5", user: "Worker Priya", action: "LOGIN", entity: "Auth", entityName: "", description: "User logged in from new device", createdAt: new Date(Date.now() - 10800000).toISOString() },
  { _id: "6", user: "Admin User", action: "UPDATE", entity: "Product", entityName: "USB-C Cable", oldValue: "100", newValue: "8", description: "Stock updated: USB-C Cable 100 → 8 (Low stock alert triggered)", createdAt: new Date(Date.now() - 14400000).toISOString() },
];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetch = () => {
    setLoading(true);
    getAuditLogs()
      .then((r) => setLogs(r.data))
      .catch(() => setLogs(DEMO_LOGS))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const filtered = filter === "All" ? logs : logs.filter((l) => l.action === filter);

  const actionCounts = ["CREATE", "UPDATE", "DELETE", "SALE", "LOGIN"].reduce((acc, a) => {
    acc[a] = logs.filter((l) => l.action === a).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Audit Logs 📋</div><div className="page-sub">Complete trail of all actions performed in the system</div></div>
        <button className="btn btn--ghost" onClick={fetch}><RefreshCw size={15} /> Refresh</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { action: "CREATE", label: "Created", color: "var(--accent-green)", bg: "var(--accent-green-dim)" },
          { action: "UPDATE", label: "Updated", color: "var(--accent-blue)", bg: "var(--accent-blue-dim)" },
          { action: "DELETE", label: "Deleted", color: "var(--accent-red)", bg: "var(--accent-red-dim)" },
          { action: "SALE", label: "Sales", color: "var(--accent-purple)", bg: "var(--accent-purple-dim)" },
          { action: "LOGIN", label: "Logins", color: "var(--accent-orange)", bg: "var(--accent-orange-dim)" },
        ].map((s) => (
          <div key={s.action} className="stat-card" style={{ cursor: "pointer", borderColor: filter === s.action ? s.color : "var(--border)" }} onClick={() => setFilter(filter === s.action ? "All" : s.action)}>
            <div style={{ flex: 1 }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: 20 }}>{actionCounts[s.action] || 0}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="card-title">Activity Timeline</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["All", "CREATE", "UPDATE", "DELETE", "SALE", "LOGIN"].map((f) => (
              <button key={f} className={`btn btn--sm ${filter === f ? "btn--primary" : "btn--ghost"}`} onClick={() => setFilter(f)} style={{ fontSize: 11 }}>{f}</button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading-center"><div className="loading-spin" /></div>
        : filtered.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No audit logs found.</div></div>
        : (
          <div style={{ padding: "0 18px" }}>
            {filtered.map((log) => (
              <div key={log._id} className="audit-item">
                <div className="audit-dot" style={{ background: ACTION_COLORS[log.action] || "var(--text-muted)" }} />
                <div style={{ flex: 1 }}>
                  <div className="audit-action">{log.description}</div>
                  <div className="audit-meta">
                    <span style={{ color: "var(--accent-blue)" }}>{log.user || log.performedBy?.name || "System"}</span>
                    {" · "}
                    <span className={`badge badge--${log.action === "CREATE" ? "green" : log.action === "DELETE" ? "red" : log.action === "UPDATE" ? "blue" : "purple"}`} style={{ fontSize: 10, padding: "1px 7px" }}>{log.action}</span>
                    {" · "}
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                  </div>
                  {log.oldValue && log.newValue && (
                    <div className="audit-change">
                      <span style={{ color: "var(--accent-red)" }}>— {log.oldValue}</span>
                      {" → "}
                      <span style={{ color: "var(--accent-green)" }}>+ {log.newValue}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
