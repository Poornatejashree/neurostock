import { useState, useEffect } from "react";
import { getProducts, getSales } from "../utils/api";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";

// ─── Simple Moving Average prediction ──────────────
function predictDemand(sales, productId, days = 7) {
  const productSales = sales
    .filter((s) => (s.product?._id || s.product) === productId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (productSales.length === 0) return { predicted: 0, trend: "stable", confidence: "low" };

  // Group by day
  const dailyMap = {};
  productSales.forEach((s) => {
    const day = new Date(s.createdAt).toISOString().split("T")[0];
    dailyMap[day] = (dailyMap[day] || 0) + s.quantitySold;
  });

  const dailyValues = Object.values(dailyMap);
  if (dailyValues.length === 0) return { predicted: 0, trend: "stable", confidence: "low" };

  // Moving average
  const window = Math.min(7, dailyValues.length);
  const recent = dailyValues.slice(-window);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;

  // Trend detection
  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
  const trend = secondAvg > firstAvg * 1.1 ? "up" : secondAvg < firstAvg * 0.9 ? "down" : "stable";

  const predicted = Math.round(avg * days);
  const confidence = dailyValues.length >= 7 ? "high" : dailyValues.length >= 3 ? "medium" : "low";

  return { predicted, trend, confidence, avgPerDay: avg.toFixed(1) };
}

function predictStockoutDays(product, avgPerDay) {
  if (!avgPerDay || avgPerDay === 0) return null;
  return Math.floor(product.quantity / avgPerDay);
}

function SparkLine({ values, color = "#58a6ff" }) {
  if (!values?.length) return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>No data</span>;
  const max = Math.max(...values, 1);
  const w = 80, h = 30;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DemandPrediction() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [forecastDays, setForecastDays] = useState(7);

  useEffect(() => {
    Promise.all([getProducts(), getSales()])
      .then(([p, s]) => { setProducts(p.data); setSales(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!products.length) return;
    const preds = products.map((p) => {
      const { predicted, trend, confidence, avgPerDay } = predictDemand(sales, p._id, forecastDays);
      const daysUntilStockout = predictStockoutDays(p, Number(avgPerDay));
      const willStockout = daysUntilStockout !== null && daysUntilStockout <= forecastDays;

      // Get daily sales for sparkline
      const dailyMap = {};
      sales.filter((s) => (s.product?._id || s.product) === p._id).forEach((s) => {
        const day = new Date(s.createdAt).toISOString().split("T")[0];
        dailyMap[day] = (dailyMap[day] || 0) + s.quantitySold;
      });
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return dailyMap[d.toISOString().split("T")[0]] || 0;
      });

      return { ...p, predicted, trend, confidence, avgPerDay, daysUntilStockout, willStockout, last7 };
    }).sort((a, b) => b.predicted - a.predicted);

    setPredictions(preds);
  }, [products, sales, forecastDays]);

  const criticalItems = predictions.filter((p) => p.willStockout);
  const highDemand = predictions.filter((p) => p.trend === "up").slice(0, 5);
  const deadStock = predictions.filter((p) => p.avgPerDay === "0.0" && p.quantity > 0);

  if (loading) return <div className="loading-center"><div className="loading-spin" /><span>Analyzing demand patterns...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Brain size={24} color="var(--accent-purple)" /> Demand Prediction AI
          </div>
          <div className="page-sub">ML-powered forecasting using sales history & moving averages</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Forecast:</span>
          {[7, 14, 30].map((d) => (
            <button key={d} className={`btn btn--sm ${forecastDays === d ? "btn--primary" : "btn--ghost"}`}
              onClick={() => setForecastDays(d)}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon--red"><AlertTriangle size={20} /></div>
          <div>
            <div className="stat-label">Will Stockout</div>
            <div className="stat-value">{criticalItems.length}</div>
            <div style={{ fontSize: 12, color: "var(--accent-red)" }}>Within {forecastDays} days</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--green"><TrendingUp size={20} /></div>
          <div>
            <div className="stat-label">High Demand</div>
            <div className="stat-value">{predictions.filter(p => p.trend === "up").length}</div>
            <div style={{ fontSize: 12, color: "var(--accent-green)" }}>Trending up ↑</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--orange"><TrendingDown size={20} /></div>
          <div>
            <div className="stat-label">Dead Stock</div>
            <div className="stat-value">{deadStock.length}</div>
            <div style={{ fontSize: 12, color: "var(--accent-orange)" }}>No recent sales</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--purple"><Brain size={20} /></div>
          <div>
            <div className="stat-label">Total Predicted</div>
            <div className="stat-value">{predictions.reduce((a, p) => a + p.predicted, 0)}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Units in {forecastDays}d</div>
          </div>
        </div>
      </div>

      {/* Critical Stockout Alert */}
      {criticalItems.length > 0 && (
        <div className="card" style={{ marginBottom: 20, border: "1px solid var(--accent-red)", background: "var(--accent-red-dim)" }}>
          <div className="card-header">
            <div className="card-title" style={{ color: "var(--accent-red)" }}>🚨 Stockout Risk — Act Now!</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {criticalItems.map((p) => (
              <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-red-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.quantity} units left · {p.avgPerDay}/day avg sales</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "var(--accent-red)", fontSize: 14 }}>
                    {p.daysUntilStockout === 0 ? "OUT NOW" : `${p.daysUntilStockout} days left`}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Predicted need: {p.predicted} units</div>
                </div>
                <button className="btn btn--sm btn--primary">Reorder Now</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Prediction Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <div className="card-title">All Products — {forecastDays}-Day Forecast</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Based on moving average · Updated live</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Avg/Day</th>
                <th>Last 7 Days</th>
                <th>Predicted ({forecastDays}d)</th>
                <th>Days Until Stockout</th>
                <th>Trend</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => (
                <tr key={p._id} style={{ background: p.willStockout ? "rgba(248,81,73,0.04)" : "transparent" }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.category}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: p.quantity === 0 ? "var(--accent-red)" : p.quantity <= (p.reorderLevel || 5) ? "var(--accent-orange)" : "var(--text-primary)" }}>
                      {p.quantity}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{p.avgPerDay}</td>
                  <td><SparkLine values={p.last7} color={p.trend === "up" ? "#3fb950" : p.trend === "down" ? "#f85149" : "#58a6ff"} /></td>
                  <td>
                    <span style={{ fontWeight: 700, color: p.predicted > p.quantity ? "var(--accent-red)" : "var(--accent-green)" }}>
                      {p.predicted} units
                    </span>
                  </td>
                  <td>
                    {p.daysUntilStockout === null ? (
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>No sales data</span>
                    ) : p.daysUntilStockout === 0 ? (
                      <span className="badge badge--red">Out Now</span>
                    ) : p.daysUntilStockout <= forecastDays ? (
                      <span className="badge badge--red">⚠️ {p.daysUntilStockout} days</span>
                    ) : (
                      <span style={{ color: "var(--accent-green)", fontSize: 13 }}>✓ {p.daysUntilStockout} days</span>
                    )}
                  </td>
                  <td>
                    {p.trend === "up" && <span style={{ color: "var(--accent-green)", fontWeight: 600, fontSize: 13 }}>↑ Rising</span>}
                    {p.trend === "down" && <span style={{ color: "var(--accent-red)", fontWeight: 600, fontSize: 13 }}>↓ Falling</span>}
                    {p.trend === "stable" && <span style={{ color: "var(--text-muted)", fontSize: 13 }}>→ Stable</span>}
                  </td>
                  <td>
                    <span className={`badge ${p.confidence === "high" ? "badge--green" : p.confidence === "medium" ? "badge--orange" : "badge--gray"}`}>
                      {p.confidence}
                    </span>
                  </td>
                  <td>
                    {p.willStockout ? (
                      <button className="btn btn--sm btn--primary">Reorder</button>
                    ) : p.avgPerDay === "0.0" ? (
                      <span style={{ fontSize: 11, color: "var(--accent-orange)" }}>Consider discount</span>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--accent-green)" }}>Stock healthy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dead Stock Section */}
      {deadStock.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title">💤 Dead Stock — No Recent Sales</div>
            <span className="badge badge--orange">{deadStock.length} items</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
            These products have inventory but no sales activity. Consider discounting or returning to supplier.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {deadStock.map((p) => (
              <div key={p._id} style={{ padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--accent-orange)" }}>{p.quantity} units · ${(p.price * p.quantity).toFixed(2)} locked</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
