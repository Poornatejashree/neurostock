import { useState, useEffect } from "react";

let addToastFn = null;

export function toast(message, type = "info", duration = 4000) {
  addToastFn?.({ message, type, duration, id: Date.now() });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = (t) => setToasts((prev) => [...prev.slice(-4), t]);
    return () => { addToastFn = null; };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    toasts.forEach((t) => {
      const timer = setTimeout(() => remove(t.id), t.duration || 4000);
      return () => clearTimeout(timer);
    });
  }, [toasts]);

  const colors = {
    success: { bg: "var(--accent-green-dim)", border: "var(--accent-green)", color: "var(--accent-green)", icon: "✅" },
    warning: { bg: "var(--accent-orange-dim)", border: "var(--accent-orange)", color: "var(--accent-orange)", icon: "⚠️" },
    danger:  { bg: "var(--accent-red-dim)",    border: "var(--accent-red)",    color: "var(--accent-red)",    icon: "🚨" },
    info:    { bg: "var(--accent-blue-dim)",   border: "var(--accent-blue)",   color: "var(--accent-blue)",   icon: "ℹ️" },
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => {
        const c = colors[t.type] || colors.info;
        return (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", minWidth: 280, maxWidth: 360, animation: "slideUp 0.2s ease", fontFamily: "var(--font)", fontSize: 13 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon || c.icon}</span>
            <span style={{ flex: 1, color: c.color, fontWeight: 500 }}>{t.message}</span>
            <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: c.color, cursor: "pointer", fontSize: 16, padding: "0 2px", opacity: 0.7 }}>×</button>
          </div>
        );
      })}
    </div>
  );
}
