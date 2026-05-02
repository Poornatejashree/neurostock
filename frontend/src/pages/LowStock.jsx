import { useState, useEffect } from "react";
import { getLowStock } from "../utils/api";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function LowStock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    getLowStock().then((r) => setItems(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const critical = items.filter((i) => i.quantity === 0);
  const warning = items.filter((i) => i.quantity > 0 && i.quantity <= (i.reorderLevel || 5));

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Low Stock Alerts 🚨</div><div className="page-sub">{items.length} items need attention</div></div>
        <button className="btn btn--ghost" onClick={fetch}><RefreshCw size={15} /> Refresh</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        <div className="stat-card"><div className="stat-icon stat-icon--red"><AlertTriangle size={20}/></div><div><div className="stat-label">Out of Stock</div><div className="stat-value">{critical.length}</div><div style={{ fontSize:12, color:"var(--accent-red)" }}>Immediate action required</div></div></div>
        <div className="stat-card"><div className="stat-icon stat-icon--orange"><AlertTriangle size={20}/></div><div><div className="stat-label">Low Stock</div><div className="stat-value">{warning.length}</div><div style={{ fontSize:12, color:"var(--accent-orange)" }}>Below reorder level</div></div></div>
        <div className="stat-card"><div className="stat-icon stat-icon--blue"><AlertTriangle size={20}/></div><div><div className="stat-label">Total Affected</div><div className="stat-value">{items.length}</div></div></div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="loading-spin" /><span>Loading alerts...</span></div>
      ) : items.length === 0 ? (
        <div className="card"><div className="empty-state" style={{ padding:60 }}><div className="empty-state-icon">✅</div><div style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)", marginBottom:6 }}>All good!</div><div className="empty-state-text">All products are above their reorder levels.</div></div></div>
      ) : (
        <>
          {critical.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ color:"var(--accent-red)", fontWeight:700, fontSize:14 }}>🔴 Out of Stock</span>
                <span className="badge badge--red">{critical.length} items</span>
              </div>
              <div className="card" style={{ padding:0 }}>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Product</th><th>Category</th><th>Warehouse</th><th>Qty</th><th>Reorder Level</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {critical.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:32, height:32, borderRadius:8, background:"var(--accent-red-dim)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                                {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "📦"}
                              </div>
                              <div><div style={{ fontWeight:600 }}>{item.name}</div><div style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"var(--mono)" }}>{item.sku||"—"}</div></div>
                            </div>
                          </td>
                          <td><span className="badge badge--gray">{item.category||"—"}</span></td>
                          <td><span className="warehouse-pill">🏭 {item.warehouse||"—"}</span></td>
                          <td><span style={{ fontWeight:800, color:"var(--accent-red)", fontSize:16 }}>0</span></td>
                          <td style={{ color:"var(--text-muted)" }}>{item.reorderLevel||"—"}</td>
                          <td><span className="badge badge--red">Out of Stock</span></td>
                          <td><button className="btn btn--sm btn--primary">Reorder Now</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {warning.length > 0 && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ color:"var(--accent-orange)", fontWeight:700, fontSize:14 }}>🟡 Low Stock</span>
                <span className="badge badge--orange">{warning.length} items</span>
              </div>
              <div className="card" style={{ padding:0 }}>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Product</th><th>Category</th><th>Warehouse</th><th>Quantity</th><th>Reorder Level</th><th>Stock Value</th><th>Action</th></tr></thead>
                    <tbody>
                      {warning.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:32, height:32, borderRadius:8, background:"var(--accent-orange-dim)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                                {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "📦"}
                              </div>
                              <div><div style={{ fontWeight:600 }}>{item.name}</div><div style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"var(--mono)" }}>{item.sku||"—"}</div></div>
                            </div>
                          </td>
                          <td><span className="badge badge--gray">{item.category||"—"}</span></td>
                          <td><span className="warehouse-pill">🏭 {item.warehouse||"—"}</span></td>
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ fontWeight:700, color:"var(--accent-orange)", minWidth:24 }}>{item.quantity}</span>
                              <div style={{ flex:1, background:"var(--bg-elevated)", borderRadius:99, height:5, minWidth:50 }}>
                                <div style={{ width:`${Math.min((item.quantity/((item.reorderLevel||5)*3))*100,100)}%`, height:"100%", background:"var(--accent-orange)", borderRadius:99 }} />
                              </div>
                            </div>
                          </td>
                          <td style={{ color:"var(--text-muted)" }}>{item.reorderLevel||"—"}</td>
                          <td style={{ fontFamily:"var(--mono)", fontSize:13 }}>${(item.price*item.quantity).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                          <td><button className="btn btn--ghost btn--sm">Reorder</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
