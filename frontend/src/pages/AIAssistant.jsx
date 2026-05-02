import { useState, useRef, useEffect } from "react";
import { getProducts, getSales, getAnalytics, askAI } from "../utils/api";
import { Send, Brain, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Which items will expire next week?",
  "Which product will run out of stock in 3 days?",
  "Show me slow-moving items",
  "What's my total inventory value?",
  "Which products have low profit margin?",
  "Predict demand for next week",
  "Which supplier is most reliable?",
  "Show anomalies in stock changes",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "👋 Hi! I'm your NeuroQuery AI assistant. I can analyze your inventory, predict demand, detect anomalies, and answer questions in plain English.\n\nTry asking me something like:\n• \"Which items will run out this week?\"\n• \"Show me dead stock\"\n• \"What should I reorder now?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    Promise.all([getProducts(), getSales(), getAnalytics()])
      .then(([p, s, a]) => { setProducts(p.data); setSales(s.data); setAnalytics(a.data); })
      .catch(console.error);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const buildContext = () => {
    const now = new Date();
    return `
You are NeuroQuery, an AI assistant for NeuroStock inventory management system.
Today is ${now.toDateString()}.

INVENTORY DATA:
- Total products: ${products.length}
- Total inventory value: $${analytics?.totalInventoryValue?.toFixed(2) || 0}
- Low stock items: ${analytics?.lowStockCount || 0}
- Out of stock: ${analytics?.outOfStock || 0}

PRODUCTS (top 20):
${products.slice(0, 20).map(p => `- ${p.name} | Qty: ${p.quantity} | Price: $${p.price} | Category: ${p.category || 'N/A'} | Warehouse: ${p.warehouse || 'N/A'} | Reorder Level: ${p.reorderLevel || 5} | Expiry: ${p.expiryDate ? new Date(p.expiryDate).toDateString() : 'N/A'} | Batch: ${p.batchNumber || 'N/A'}`).join('\n')}

RECENT SALES (last 10):
${sales.slice(0, 10).map(s => `- ${s.product?.name || 'Unknown'} | Qty: ${s.quantitySold} | Total: $${s.totalPrice} | Date: ${new Date(s.createdAt).toDateString()}`).join('\n')}

INSTRUCTIONS:
- Answer in clear, concise language
- Give specific product names when referring to data
- Provide actionable recommendations
- If predicting demand, use sales history
- Flag anomalies or risks proactively
- Format lists with bullet points
- Always end with a recommendation if relevant
`;
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // Try backend AI route first
      let reply = "";
      try {
        const res = await askAI(userMsg, buildContext());
        reply = res.data.reply;
      } catch {
        // Fallback: call Anthropic API directly from frontend
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: buildContext(),
            messages: [{ role: "user", content: userMsg }],
          }),
        });
        const data = await response.json();
        reply = data.content?.[0]?.text || "I couldn't process that. Please try again.";
      }
      setMessages((m) => [...m, { role: "ai", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", content: "⚠️ I'm having trouble connecting. Make sure your AI backend is running." }]);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Brain size={24} color="var(--accent-purple)" /> NeuroQuery AI Assistant
          </div>
          <div className="page-sub">Ask anything about your inventory in plain English</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, height: "calc(100vh - 200px)" }}>
        {/* Chat */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "16px 18px" }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ${msg.role === "user" ? "ai-msg--user" : "ai-msg--ai"}`}>
                {msg.role === "ai" && (
                  <div className="ai-avatar" style={{ background: "var(--accent-purple-dim)", color: "var(--accent-purple)" }}>🤖</div>
                )}
                <div className={`ai-msg-bubble`} style={{
                  background: msg.role === "user" ? "var(--accent-blue)" : "var(--bg-elevated)",
                  color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  border: msg.role === "ai" ? "1px solid var(--border)" : "none",
                  whiteSpace: "pre-wrap", lineHeight: 1.6
                }}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="ai-avatar" style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)" }}>
                    {JSON.parse(localStorage.getItem("user") || "{}").name?.[0] || "U"}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="ai-msg ai-msg--ai">
                <div className="ai-avatar" style={{ background: "var(--accent-purple-dim)", color: "var(--accent-purple)" }}>🤖</div>
                <div className="ai-msg-bubble" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                  <div className="ai-typing"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", gap: 8 }}>
            <textarea
              className="ai-input"
              placeholder="Ask anything... e.g. 'Which items will expire next week?'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <button className="btn btn--primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Suggestions Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div className="card-title">✨ Try asking</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  style={{ padding: "8px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", fontSize: 12.5, cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "var(--font)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-purple)"; e.currentTarget.style.color = "var(--accent-purple)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>🔍 Live Insights</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {products.filter(p => p.quantity === 0).length > 0 && (
                <div style={{ padding: "8px 10px", background: "var(--accent-red-dim)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--accent-red)", cursor: "pointer" }}
                  onClick={() => sendMessage("Which products are out of stock and what should I do?")}>
                  🚨 {products.filter(p => p.quantity === 0).length} items out of stock
                </div>
              )}
              {products.filter(p => p.quantity > 0 && p.quantity <= (p.reorderLevel || 5)).length > 0 && (
                <div style={{ padding: "8px 10px", background: "var(--accent-orange-dim)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--accent-orange)", cursor: "pointer" }}
                  onClick={() => sendMessage("Show me all low stock items and recommended reorder quantities")}>
                  ⚠️ {products.filter(p => p.quantity > 0 && p.quantity <= (p.reorderLevel || 5)).length} items low on stock
                </div>
              )}
              {products.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date(Date.now() + 7 * 86400000)).length > 0 && (
                <div style={{ padding: "8px 10px", background: "var(--accent-orange-dim)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--accent-orange)", cursor: "pointer" }}
                  onClick={() => sendMessage("Which products are expiring soon and what should I do with them?")}>
                  ⏳ Items expiring within 7 days
                </div>
              )}
              <div style={{ padding: "8px 10px", background: "var(--accent-blue-dim)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--accent-blue)", cursor: "pointer" }}
                onClick={() => sendMessage("Give me a full inventory health report with recommendations")}>
                📊 Generate full health report
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
