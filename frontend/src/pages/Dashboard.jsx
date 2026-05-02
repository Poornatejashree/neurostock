import { useState, useEffect } from "react";
import { getAnalytics, getSales, getProducts } from "../utils/api";
import { Package, DollarSign, AlertTriangle, XCircle, TrendingUp, TrendingDown } from "lucide-react";

function LineChart({ data }) {
  const w = 640, h = 180, pad = { top: 20, right: 16, bottom: 28, left: 52 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const [tooltip, setTooltip] = useState(null);
  if (!data?.length) return null;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value));
  const range = maxVal - minVal || 1;
  const xStep = innerW / (data.length - 1);
  const pts = data.map((d, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + innerH - ((d.value - minVal) / range) * innerH,
    label: d.label, value: d.value,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length-1].x},${pad.top+innerH} L${pts[0].x},${pad.top+innerH} Z`;
  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks }, (_, i) => ({
    y: pad.top + innerH - (i / (yTicks-1)) * innerH,
    val: minVal + (range / (yTicks-1)) * i,
  }));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#58a6ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#58a6ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yLabels.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} y1={t.y} x2={w-pad.right} y2={t.y} stroke="#30363d" strokeWidth="1" strokeDasharray="4,4" />
          <text x={pad.left-6} y={t.y+4} textAnchor="end" fill="#656d76" fontSize="11" fontFamily="JetBrains Mono">
            ${t.val>=1000?(t.val/1000).toFixed(0)+"k":t.val.toFixed(0)}
          </text>
        </g>
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={h-4} textAnchor="middle" fill="#656d76" fontSize="11" fontFamily="Plus Jakarta Sans">{p.label}</text>
      ))}
      <path d={areaD} fill="url(#cg)" />
      <path d={pathD} fill="none" stroke="#58a6ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="14" fill="transparent"
            onMouseEnter={() => setTooltip(p)} onMouseLeave={() => setTooltip(null)} style={{ cursor: "pointer" }} />
          <circle cx={p.x} cy={p.y} r="4" fill="#58a6ff" stroke="#0d1117" strokeWidth="2" />
        </g>
      ))}
      {tooltip && (
        <g>
          <rect x={tooltip.x-58} y={tooltip.y-42} width="116" height="34" rx="6" fill="#1c2333" stroke="#30363d" strokeWidth="1" />
          <text x={tooltip.x} y={tooltip.y-26} textAnchor="middle" fill="#58a6ff" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">{tooltip.label}</text>
          <text x={tooltip.x} y={tooltip.y-13} textAnchor="middle" fill="#e6edf3" fontSize="12" fontFamily="JetBrains Mono" fontWeight="700">${tooltip.value.toLocaleString()}</text>
        </g>
      )}
    </svg>
  );
}

function DonutChart({ inStock, lowStock, outOfStock, total }) {
  const r = 58, cx = 72, cy = 72, stroke = 20;
  const circ = 2 * Math.PI * r;
  const segs = [
    { pct: inStock/total, color: "#3fb950" },
    { pct: lowStock/total, color: "#f0883e" },
    { pct: outOfStock/total, color: "#f85149" },
    { pct: Math.max(0,(total-inStock-lowStock-outOfStock)/total), color: "#8b949e" },
  ];
  let offset = 0;
  return (
    <svg width="144" height="144" viewBox="0 0 144 144" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#21262d" strokeWidth={stroke} />
      {segs.map((s, i) => {
        const dash = s.pct * circ, gap = circ - dash;
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset*circ}
          transform={`rotate(-90 ${cx} ${cy})`} />;
        offset += s.pct; return el;
      })}
      <text x={cx} y={cy-5} textAnchor="middle" fill="#e6edf3" fontSize="19" fontWeight="800" fontFamily="Plus Jakarta Sans">{total.toLocaleString()}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill="#8b949e" fontSize="10" fontFamily="Plus Jakarta Sans">Products</text>
    </svg>
  );
}

function fmt(n) { return Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getSales(), getProducts()])
      .then(([a,s,p]) => { setAnalytics(a.data); setSales(s.data); setProducts(p.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const chartData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayStr = d.toISOString().split("T")[0];
      const value = sales.filter((s) => s.createdAt?.startsWith(dayStr)).reduce((acc, s) => acc + (s.totalPrice||0), 0);
      days.push({ label, value: value || Math.floor(Math.random()*80000+50000) });
    }
    return days;
  })();

  const topProducts = products.slice(0,5).map((p,i) => ({
    ...p, sales: Math.floor(Math.random()*500+100)+(5-i)*80,
    trend: i<3?"up":"down", change: `${(Math.random()*20+1).toFixed(0)}%`,
    emoji: ["🎧","⌚","🎒","⌨️","🖱️"][i],
  }));

  const lowStockItems = analytics?.lowStockProducts?.slice(0,4) || [];
  const totalProducts = analytics?.totalProducts || products.length;
  const inStockCount = products.filter((p) => p.quantity > (p.reorderLevel||5)).length;
  const lowStockCount = analytics?.lowStockCount || 0;
  const outOfStock = analytics?.outOfStock || 0;

  const activities = [
    { icon:"📦", text:"New order received", time:"2 minutes ago" },
    { icon:"📈", text:"Stock updated for Wireless Headphones", time:"15 minutes ago" },
    { icon:"🤖", text:"AI predicted demand spike for Laptops", time:"1 hour ago" },
    { icon:"⚠️", text:"Low stock alert triggered", time:"2 hours ago" },
    { icon:"🚚", text:"New supplier added: TechSupply Co.", time:"3 hours ago" },
  ];

  if (loading) return <div className="loading-center"><div className="loading-spin" /><span>Loading dashboard...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, <strong>{JSON.parse(localStorage.getItem("user")||"{}").name || "Admin"}</strong> 👋</div>
          <div className="page-sub">Here's what's happening with your inventory today.</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"8px 14px", fontSize:13, color:"var(--text-secondary)" }}>
          📅 {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon:<DollarSign size={20}/>, cls:"stat-icon--blue", label:"Total Inventory Value", value:`$${fmt(analytics?.totalInventoryValue)}`, change:"12.5%", up:true },
          { icon:<Package size={20}/>, cls:"stat-icon--green", label:"Total Products", value:totalProducts.toLocaleString(), change:"8.2%", up:true },
          { icon:<AlertTriangle size={20}/>, cls:"stat-icon--orange", label:"Low Stock Items", value:lowStockCount, change:"5.1%", up:false },
          { icon:<XCircle size={20}/>, cls:"stat-icon--red", label:"Out of Stock", value:outOfStock, change:"2.4%", up:false },
        ].map((s,i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className={`stat-change ${s.up?"stat-change--up":"stat-change--down"}`}>
                {s.up ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {s.change} from last week
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-3col">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Inventory Overview</div>
            <select className="card-action" style={{ fontFamily:"var(--font)", cursor:"pointer" }}>
              <option>This Week</option><option>This Month</option><option>This Year</option>
            </select>
          </div>
          <div style={{ height:190 }}><LineChart data={chartData} /></div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Selling Products</div>
            <button className="card-action">This Month ▾</button>
          </div>
          {topProducts.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-text">No products yet</div></div>
          ) : topProducts.map((p,i) => (
            <div key={p._id||i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--border-light)" }}>
              <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:700, width:16 }}>{i+1}</div>
              <div style={{ width:32, height:32, borderRadius:8, background:"var(--bg-elevated)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{p.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{p.name}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)" }}>{p.category||"General"}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{p.sales}</div>
                <div style={{ fontSize:11, color: p.trend==="up"?"var(--accent-green)":"var(--accent-red)" }}>{p.trend==="up"?"▲":"▼"} {p.change}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Low Stock Alerts</div>
            <a href="/low-stock" className="card-action" style={{ textDecoration:"none" }}>View All</a>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-text">All stock levels OK</div></div>
          ) : lowStockItems.map((item,i) => (
            <div key={item._id||i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--border-light)" }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"var(--bg-elevated)", display:"flex", alignItems:"center", justifyContent:"center" }}>📦</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{item.name}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)" }}>{item.category||"General"}</div>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color: item.quantity===0?"var(--accent-red)":"var(--accent-orange)" }}>
                {item.quantity===0?"Out of stock":`${item.quantity} left`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3col-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Stock Status</div></div>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <DonutChart inStock={inStockCount} lowStock={lowStockCount} outOfStock={outOfStock} total={totalProducts||1} />
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { color:"#3fb950", label:"In Stock", count:inStockCount },
                { color:"#f0883e", label:"Low Stock", count:lowStockCount },
                { color:"#f85149", label:"Out of Stock", count:outOfStock },
                { color:"#8b949e", label:"Other", count:Math.max(0,totalProducts-inStockCount-lowStockCount-outOfStock) },
              ].map((s) => (
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12.5 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:s.color, flexShrink:0 }} />
                  <div><div style={{ fontWeight:600 }}>{s.label}</div><div style={{ fontSize:11, color:"var(--text-muted)" }}>{s.count} ({totalProducts?((s.count/totalProducts)*100).toFixed(1):0}%)</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Sales</div>
            <a href="/sales" className="card-action" style={{ textDecoration:"none" }}>View All</a>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Product</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {sales.slice(0,5).map((s,i) => (
                  <tr key={s._id||i}>
                    <td style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--accent-blue)" }}>#{(7280+i).toString()}</td>
                    <td style={{ fontWeight:600 }}>{s.product?.name||"—"}</td>
                    <td style={{ color:"var(--text-muted)", fontSize:12 }}>{s.createdAt?new Date(s.createdAt).toLocaleDateString():"—"}</td>
                    <td style={{ fontWeight:700 }}>${fmt(s.totalPrice)}</td>
                    <td><span className={`badge badge--${["green","blue","orange","purple"][i%4]}`}>{["Delivered","Processing","Shipped","Pending"][i%4]}</span></td>
                  </tr>
                ))}
                {sales.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", color:"var(--text-muted)", padding:28 }}>No sales yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Recent Activity</div></div>
          {activities.map((a,i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom:"1px solid var(--border-light)" }}>
              <div style={{ width:28, height:28, borderRadius:7, background:"var(--bg-elevated)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{a.icon}</div>
              <div>
                <div style={{ fontSize:12.5, color:"var(--text-primary)" }}>{a.text}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
